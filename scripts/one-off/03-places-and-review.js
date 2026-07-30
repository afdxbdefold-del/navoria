#!/usr/bin/env node
/**
 * Phase 3 + 4 – Places (New API v1) + Review-Fallback
 *
 * Für jeden Pfad, der in Phase 2 nicht MATCHED wurde:
 *   3a) Places API (New) Text Search + Details für Kandidaten
 *   3b) Wenn eindeutiger Places-Kandidat gefunden (Telefon, Straße+PLZ, Name+PLZ):
 *        - wenn place_id bereits in doctor_places  → PLACES_FOUND_EXISTING
 *        - wenn Telefon/Adresse bereits einem doctor_places entspricht → PLACES_FOUND_EXISTING
 *        - sonst → PLACES_IMPORTED_NEW (Insert)
 *   4)  Sonst: Review-Profil in doctor_places anlegen (nur wenn Legacy-Daten ausreichen)
 *
 * Sicherheiten:
 *   - Legacy-Fallback aus Path für tote URLs
 *   - Duplikat-Prüfung: google_place_id, phone, legacy_source_url, PLZ+NameStem
 *   - Slug-Kollisions-Check + Retry
 *   - Öffentliche Route: /praxis/<city_slug>/<slug>
 *   - Neue Datensätze sind is_active:true, is_verified:false, verification_status ∈ {places_imported, review_required}
 *   - migration_source: 'rzte-online', legacy_source_url gesetzt
 *   - DRY_RUN=1 → keine DB-Writes, nur Statistik
 *
 * ENV:
 *   MONGO_URL, DB_NAME, GOOGLE_PLACES_API_KEY
 *   Optional: DRY_RUN=1, LIMIT=<n>, PLACES_KEY_OVERRIDE=<key>
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

const SCRIPT_DIR = __dirname;
const SCRAPED_PATH = path.join(SCRIPT_DIR, 'scraped-data.json');
const PHASE2_PATH = path.join(SCRIPT_DIR, 'phase2-matches.json');
const OUT_PATH = path.join(SCRIPT_DIR, 'phase3-4-results.json');
const AUDIT_PATH = path.join(SCRIPT_DIR, 'phase3-4-audit.jsonl');

const NAV_HOST = 'https://navoria.de';
const DRY_RUN = process.env.DRY_RUN === '1';
const LIMIT = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : 0;
const PLACES_KEY = process.env.PLACES_KEY_OVERRIDE || process.env.GOOGLE_PLACES_API_KEY;

// ---------- Utils ----------
function slugify(s) {
  return String(s || '').toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}
function normPhone(p) { return String(p || '').replace(/[^0-9]/g, '').replace(/^0/, '49'); }
function normStreet(s) {
  return String(s || '').toLowerCase().replace(/ß/g,'ss').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue')
    .replace(/straße/g,'strasse').replace(/\bstr\b\.?/g,'strasse').replace(/[^a-z0-9]/g,'');
}
function normName(n) {
  return String(n || '').toLowerCase().replace(/ß/g,'ss').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue')
    .replace(/[^a-z0-9\s]/g,' ')
    .replace(/\b(dr|med|prof|dipl|univ|hc|mudr|herr|frau|md|imf|praxis|arztpraxis|hausarztpraxis|facharzt|fachaerztin|gemeinschaftspraxis)\b/g,'')
    .replace(/\s+/g,' ').trim();
}
function tokens(s) { return normName(s).split(' ').filter((t) => t.length >= 2); }
function lev(a, b) {
  if (a === b) return 0; if (!a.length) return b.length; if (!b.length) return a.length;
  const dp = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) dp[j] = j;
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0]; dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const t = dp[j];
      dp[j] = a[i-1] === b[j-1] ? prev : 1 + Math.min(prev, dp[j-1], dp[j]);
      prev = t;
    }
  }
  return dp[b.length];
}
function sim(a, b) { if (!a && !b) return 1; if (!a || !b) return 0; return 1 - lev(a, b) / Math.max(a.length, b.length); }
function tokenOverlap(aT, bT) {
  if (!aT.length || !bT.length) return 0;
  const bSet = new Set(bT); let hit = 0;
  for (const t of aT) {
    if (bSet.has(t)) { hit += 1; continue; }
    for (const b of bT) { if (lev(t, b) <= 1 && t.length >= 3) { hit += 1; break; } }
  }
  return hit / aT.length;
}

// ---------- Places API (New) v1 ----------
function postJson(host, path, body, headers) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = https.request({
      hostname: host, port: 443, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload), ...headers },
      timeout: 20000,
    }, (res) => {
      let data = ''; res.on('data', (c) => data += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, json: JSON.parse(data || '{}') }); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('Timeout')));
    req.write(payload); req.end();
  });
}

const PLACES_FIELD_MASK = [
  'places.id','places.displayName','places.formattedAddress','places.internationalPhoneNumber',
  'places.nationalPhoneNumber','places.location','places.addressComponents','places.websiteUri',
  'places.googleMapsUri','places.types','places.primaryType','places.rating','places.userRatingCount',
  'places.regularOpeningHours','places.businessStatus'
].join(',');

async function placesSearchTextNew(query, regionCode = 'DE') {
  const r = await postJson('places.googleapis.com', '/v1/places:searchText', {
    textQuery: query, languageCode: 'de', regionCode, maxResultCount: 5,
  }, { 'X-Goog-Api-Key': PLACES_KEY, 'X-Goog-FieldMask': PLACES_FIELD_MASK });
  if (r.status !== 200) return { error: r.json?.error?.message || `HTTP ${r.status}`, places: [] };
  return { places: r.json.places || [] };
}

function placeToObj(p) {
  const comp = { street: null, streetNumber: null, postal_code: null, city: null, state: null, country: null };
  for (const c of (p.addressComponents || [])) {
    if (c.types.includes('route')) comp.street = c.longText;
    if (c.types.includes('street_number')) comp.streetNumber = c.longText;
    if (c.types.includes('postal_code')) comp.postal_code = c.longText;
    if (c.types.includes('locality')) comp.city = c.longText;
    if (!comp.city && c.types.includes('administrative_area_level_3')) comp.city = c.longText;
    if (c.types.includes('administrative_area_level_1')) comp.state = c.longText;
    if (c.types.includes('country')) comp.country = c.longText;
  }
  const street = comp.street && comp.streetNumber ? `${comp.street} ${comp.streetNumber}` : comp.street;
  return {
    place_id: p.id,
    name: p.displayName?.text || '',
    formatted_address: p.formattedAddress || '',
    street,
    postal_code: comp.postal_code,
    city: comp.city,
    state: comp.state,
    country: comp.country,
    phone_national: p.nationalPhoneNumber || null,
    phone_international: p.internationalPhoneNumber || null,
    website: p.websiteUri || null,
    google_maps_url: p.googleMapsUri || null,
    latitude: p.location?.latitude,
    longitude: p.location?.longitude,
    types: p.types || [],
    primary_type: p.primaryType || null,
    rating: p.rating,
    user_rating_count: p.userRatingCount,
    business_status: p.businessStatus || null,
    opening_hours_json: p.regularOpeningHours || null,
  };
}

// ---------- Legacy Path Fallback ----------
function parsePathToLegacy(sourcePath) {
  const parts = sourcePath.replace(/^\//, '').split('/');
  if (parts.length < 3) return null;
  const [specialty, city, nameSlug] = [parts[0], parts[1], parts.slice(2).join('-')];
  const stops = new Set(['dr','med','prof','dipl','univ','hc','mudr','herr','frau','md','imf',
    'praxis','arztpraxis','hausarztpraxis','facharzt','fachaerztin','fachrztin',
    'gemeinschaftspraxis','fr','fuer','und','am','im','in', city]);
  const name = String(nameSlug || '')
    .replace(/-\d{2,6}$/, '')
    .split('-')
    .filter((t) => !stops.has(t.toLowerCase()) && t.length >= 2)
    .join(' ');
  return {
    name: name || nameSlug,
    city: city.replace(/-/g, ' '),
    specialty,
    _pathFallback: true,
  };
}

// ---------- Match: Places-Kandidat gegen Legacy ----------
function scorePlaceAgainstLegacy(place, legacy) {
  const legacyPhone = normPhone(legacy.telephone);
  const pPhoneNat = normPhone(place.phone_national);
  const pPhoneInt = normPhone(place.phone_international);
  const phoneHit = legacyPhone.length >= 8 &&
    (pPhoneInt.endsWith(legacyPhone.slice(-8)) || pPhoneNat.endsWith(legacyPhone.slice(-8)));

  const sameStreet = legacy.street && place.street && normStreet(place.street) === normStreet(legacy.street);
  const streetContains = legacy.street && place.street && (
    normStreet(place.street).includes(normStreet(legacy.street)) ||
    normStreet(legacy.street).includes(normStreet(place.street))
  );
  const samePLZ = legacy.postal_code && place.postal_code && String(place.postal_code).trim() === String(legacy.postal_code).trim();

  const legacyTok = tokens(legacy.name || '');
  const placeTok = tokens(place.name || '');
  const nameOverlap = tokenOverlap(legacyTok, placeTok);

  // Score-Zusammensetzung (nur wenn "harte" Signale vorhanden)
  let score = 0;
  const reasons = [];
  if (phoneHit) { score = Math.max(score, 0.98); reasons.push('phone'); }
  if (sameStreet && samePLZ) { score = Math.max(score, 0.96); reasons.push('street+plz'); }
  if (streetContains && samePLZ && nameOverlap >= 0.5) { score = Math.max(score, 0.93); reasons.push('street~+plz+name'); }
  if (samePLZ && nameOverlap >= 0.7) { score = Math.max(score, 0.92); reasons.push('name+plz'); }
  if (!samePLZ && legacy.city && place.city && normStreet(place.city) === normStreet(legacy.city) && nameOverlap >= 0.85 && legacyTok.length >= 2) {
    score = Math.max(score, 0.90); reasons.push('name+city_strong');
  }
  return { score, reasons: reasons.join(','), nameOverlap, phoneHit, sameStreet, samePLZ };
}

// ---------- Slug / Unique ----------
async function makeUniqueSlug(col, base) {
  let slug = base.slice(0, 70);
  for (let i = 0; i < 6; i++) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await col.findOne({ slug }, { projection: { _id: 1 } });
    if (!exists) return slug;
    slug = base.slice(0, 60) + '-' + Math.random().toString(36).slice(2, 7);
  }
  return base.slice(0, 55) + '-' + uuidv4().slice(0, 8);
}

// ---------- Doc-Builder ----------
async function buildDocFromPlace(col, place, legacy, specialtyGuess) {
  const now = new Date();
  const city_slug = slugify(place.city || legacy.city || '');
  const baseSlug = slugify(place.name) + (place.place_id ? '-' + place.place_id.slice(-6) : '');
  const slug = await makeUniqueSlug(col, baseSlug);
  return {
    id: uuidv4(),
    google_place_id: place.place_id,
    name: place.name,
    slug,
    city_slug,
    primary_type: place.primary_type || 'doctor',
    types: place.types || [],
    category_label: place.primary_type || 'doctor',
    specialty_guess: specialtyGuess || null,
    formatted_address: place.formatted_address || null,
    street: place.street || null,
    postal_code: place.postal_code || null,
    city: place.city || null,
    state: place.state || null,
    country: place.country || 'Deutschland',
    latitude: place.latitude,
    longitude: place.longitude,
    phone_national: place.phone_national,
    phone_international: place.phone_international,
    website_url: place.website,
    google_maps_url: place.google_maps_url,
    rating: place.rating || null,
    user_rating_count: place.user_rating_count || 0,
    business_status: place.business_status || null,
    opening_hours_json: place.opening_hours_json || null,
    source: 'google_places_new',
    is_active: true,
    is_verified: false,
    claimed: false,
    verification_status: 'places_imported',
    migration_source: 'rzte-online',
    legacy_source_url: legacy.legacy_url || null,
    legacy_profile_id: legacy.legacy_profile_id || null,
    last_synced_at: now,
    updated_at: now,
    created_at: now,
  };
}

async function buildReviewDoc(col, legacy, sourcePath, specialtyGuess) {
  const now = new Date();
  const city_slug = slugify(legacy.city || '');
  const baseSlug = slugify(legacy.name || 'praxis') + '-r' + uuidv4().slice(0, 6);
  const slug = await makeUniqueSlug(col, baseSlug);
  return {
    id: uuidv4(),
    google_place_id: null,
    name: legacy.name || 'Praxis',
    slug,
    city_slug,
    primary_type: 'doctor',
    types: ['doctor'],
    category_label: 'doctor',
    specialty_guess: specialtyGuess || null,
    formatted_address: [legacy.street, legacy.postal_code, legacy.city].filter(Boolean).join(', ') || null,
    street: legacy.street || null,
    postal_code: legacy.postal_code || null,
    city: legacy.city || null,
    country: 'Deutschland',
    latitude: legacy.lat ? Number(legacy.lat) : null,
    longitude: legacy.lng ? Number(legacy.lng) : null,
    phone_national: legacy.telephone || null,
    phone_international: null,
    website_url: null,
    google_maps_url: null,
    rating: null,
    user_rating_count: 0,
    business_status: null,
    source: 'legacy_migration',
    is_active: true,
    is_verified: false,
    claimed: false,
    verification_status: 'review_required',
    migration_source: 'rzte-online',
    legacy_source_url: legacy.legacy_url || (`https://rzte-online.vercel.app${sourcePath}`),
    legacy_profile_id: legacy.legacy_profile_id || null,
    last_synced_at: now,
    updated_at: now,
    created_at: now,
  };
}

// ---------- Duplicate Guards ----------
// Wichtig: gemeinsame Telefonnummer allein ist KEIN sicherer Match
// (Sammelnummer, Ärztehaus, Sekretariat). Wir verlangen zusätzlich Name-Überlappung.
async function findExistingByPlaceOrPhone(col, place, legacy) {
  // 1) place_id exakt
  if (place.place_id) {
    const e = await col.findOne({ google_place_id: place.place_id },
      { projection: { name:1, city_slug:1, slug:1, id:1, _id:0 } });
    if (e) return { dup: e, by: 'google_place_id' };
  }
  // 2) legacy_source_url exakt
  if (legacy.legacy_url) {
    const e = await col.findOne({ legacy_source_url: legacy.legacy_url },
      { projection: { name:1, city_slug:1, slug:1, id:1, _id:0 } });
    if (e) return { dup: e, by: 'legacy_url' };
  }
  const placeTok = tokens(place.name);
  // 3) Phone + Name-Überlappung (verhindert Ärztehaus-Sammelnummer-Fehler)
  const phone = normPhone(place.phone_international || place.phone_national || legacy.telephone);
  if (phone.length >= 8) {
    const cands = await col.find({
      $or: [
        { phone_international: { $regex: phone.slice(-8) + '$' } },
        { phone_national: { $regex: phone.slice(-8) + '$' } },
      ], is_active: { $ne: false },
    }, { projection: { name:1, city_slug:1, slug:1, id:1, street:1, _id:0 } }).limit(10).toArray();
    for (const c of cands) {
      const ov = tokenOverlap(placeTok, tokens(c.name));
      const streetOK = place.street && c.street && normStreet(c.street) === normStreet(place.street);
      if (ov >= 0.5) return { dup: c, by: 'phone+name' };
      if (streetOK && ov >= 0.3) return { dup: c, by: 'phone+street+name' };
    }
  }
  // 4) Straße + PLZ + Name-Überlappung
  if (place.postal_code && place.street) {
    const cands = await col.find({ postal_code: place.postal_code, is_active: { $ne: false } },
      { projection: { name:1, city_slug:1, slug:1, id:1, street:1, formatted_address:1, _id:0 } }).limit(50).toArray();
    for (const c of cands) {
      const cStreet = normStreet(c.street || c.formatted_address);
      if (cStreet && cStreet === normStreet(place.street) && tokenOverlap(placeTok, tokens(c.name)) >= 0.5) {
        return { dup: c, by: 'street+plz+name' };
      }
    }
  }
  return null;
}

// ---------- Audit ----------
function audit(entry) {
  fs.appendFileSync(AUDIT_PATH, JSON.stringify(entry) + '\n');
}

// ---------- Main ----------
async function main() {
  if (!PLACES_KEY) throw new Error('GOOGLE_PLACES_API_KEY nicht gesetzt');
  console.log(`Places-Key ok: ${PLACES_KEY.slice(0, 10)}… (len ${PLACES_KEY.length})  DRY_RUN=${DRY_RUN}  LIMIT=${LIMIT || 'ALL'}`);

  const scraped = JSON.parse(fs.readFileSync(SCRAPED_PATH, 'utf8'));
  const phase2 = JSON.parse(fs.readFileSync(PHASE2_PATH, 'utf8'));
  const client = await MongoClient.connect(process.env.MONGO_URL);
  const col = client.db(process.env.DB_NAME || 'navoria_db').collection('doctor_places');

  // Reset audit
  if (fs.existsSync(AUDIT_PATH)) fs.unlinkSync(AUDIT_PATH);

  const results = {};
  let placesFoundExisting = 0, placesImportedNew = 0, reviewCreated = 0, stillUnresolved = 0, alreadyMatched = 0;
  const paths = Object.keys(phase2);
  const targets = paths.filter((p) => phase2[p].status !== 'MATCHED');
  const runList = LIMIT ? targets.slice(0, LIMIT) : targets;
  console.log(`→ Pfade gesamt=${paths.length}, bereits MATCHED (Phase 2)=${paths.length - targets.length}, zu verarbeiten=${runList.length}${LIMIT ? ` (LIMIT ${LIMIT})` : ''}`);

  // Übernehme MATCHED aus Phase 2
  for (const p of paths) {
    if (phase2[p].status === 'MATCHED') {
      results[p] = { status: 'ALREADY_MATCHED', target: phase2[p].target, reason: phase2[p].reason };
      alreadyMatched += 1;
    }
  }

  for (const [i, p] of runList.entries()) {
    let legacy = scraped[p] || {};
    const scrapedOk = legacy && legacy.name && !legacy.error;
    if (!scrapedOk) {
      const fb = parsePathToLegacy(p);
      if (fb) legacy = { ...fb, legacy_url: `https://rzte-online.vercel.app${p}` };
    }
    if (!legacy.name) {
      results[p] = { status: 'STILL_UNRESOLVED', reason: 'no_legacy_data' };
      stillUnresolved += 1;
      audit({ path: p, status: 'STILL_UNRESOLVED', reason: 'no_legacy_data' });
      continue;
    }
    const specialty = p.split('/').filter(Boolean)[0] || null;

    // ---- Phase 3a: Places Text Search ----
    let bestPlace = null, bestScore = 0, bestReasons = '', secondScore = 0, placesError = null;
    try {
      const queryParts = [legacy.name, legacy.street, legacy.postal_code, legacy.city].filter(Boolean);
      const q = queryParts.join(' ');
      const search = await placesSearchTextNew(q);
      if (search.error) placesError = search.error;
      const cands = (search.places || []).map(placeToObj);
      const scored = cands.map((c) => ({ place: c, ...scorePlaceAgainstLegacy(c, legacy) }))
        .sort((a, b) => b.score - a.score);
      if (scored[0]) { bestPlace = scored[0].place; bestScore = scored[0].score; bestReasons = scored[0].reasons; }
      if (scored[1]) { secondScore = scored[1].score; }
    } catch (e) { placesError = String(e.message || e); }

    // Safety-Regel: mind. 90% Score + 8pp Abstand
    const placesSafe = bestPlace && bestScore >= 0.90 && (bestScore - secondScore) >= 0.08;

    if (placesSafe) {
      const existing = await findExistingByPlaceOrPhone(col, bestPlace, legacy);
      if (existing) {
        results[p] = {
          status: 'PLACES_FOUND_EXISTING',
          match_score: bestScore, match_reasons: bestReasons, dedupe_by: existing.by,
          target: {
            navoria_id: existing.dup.id, name: existing.dup.name,
            canonical: `${NAV_HOST}/praxis/${existing.dup.city_slug}/${existing.dup.slug}`,
          },
        };
        placesFoundExisting += 1;
        audit({ path: p, status: 'PLACES_FOUND_EXISTING', by: existing.by, score: bestScore, place_id: bestPlace.place_id, target: existing.dup.slug });
      } else {
        if (DRY_RUN) {
          results[p] = { status: 'DRY_PLACES_IMPORT_NEW', match_score: bestScore, match_reasons: bestReasons,
            preview_target: { name: bestPlace.name, city: bestPlace.city, plz: bestPlace.postal_code, place_id: bestPlace.place_id } };
          placesImportedNew += 1;
          audit({ path: p, status: 'DRY_IMPORT_NEW', score: bestScore, place_id: bestPlace.place_id, name: bestPlace.name });
        } else {
          const doc = await buildDocFromPlace(col, bestPlace, legacy, specialty);
          await col.insertOne(doc);
          results[p] = {
            status: 'PLACES_IMPORTED_NEW', match_score: bestScore, match_reasons: bestReasons,
            target: {
              navoria_id: doc.id, name: doc.name,
              canonical: `${NAV_HOST}/praxis/${doc.city_slug}/${doc.slug}`,
            },
          };
          placesImportedNew += 1;
          audit({ path: p, status: 'IMPORTED_NEW', score: bestScore, place_id: bestPlace.place_id, slug: doc.slug });
        }
      }
    } else {
      // ---- Phase 4: Review-Profil ----
      const hasBasics = legacy.name && legacy.name.length >= 4 && legacy.city;
      if (!hasBasics) {
        results[p] = { status: 'STILL_UNRESOLVED', reason: 'insufficient_legacy_data',
          places_error: placesError, best_score: bestScore };
        stillUnresolved += 1;
        audit({ path: p, status: 'STILL_UNRESOLVED', reason: 'insufficient_legacy_data' });
      } else {
        // Anti-Dublette gegen Legacy-URL, PLZ+Name
        const dupChecks = [];
        if (legacy.legacy_url) dupChecks.push({ legacy_source_url: legacy.legacy_url });
        if (legacy.postal_code && legacy.name) {
          dupChecks.push({ postal_code: legacy.postal_code, name: { $regex: (slugify(legacy.name).slice(0, 15).replace(/-/g,'.*') || 'x'), $options: 'i' } });
        }
        let dup = null;
        if (dupChecks.length) {
          dup = await col.findOne({ $or: dupChecks, is_active: { $ne: false } },
            { projection: { name:1, city_slug:1, slug:1, id:1, _id:0 } });
        }
        if (dup) {
          results[p] = { status: 'PLACES_FOUND_EXISTING', dedupe_by: 'review_check',
            target: { navoria_id: dup.id, name: dup.name, canonical: `${NAV_HOST}/praxis/${dup.city_slug}/${dup.slug}` } };
          placesFoundExisting += 1;
          audit({ path: p, status: 'DEDUP_ON_REVIEW', slug: dup.slug });
        } else if (DRY_RUN) {
          results[p] = { status: 'DRY_REVIEW_CREATE',
            preview_target: { name: legacy.name, city: legacy.city, plz: legacy.postal_code, specialty } };
          reviewCreated += 1;
          audit({ path: p, status: 'DRY_REVIEW', name: legacy.name, city: legacy.city });
        } else {
          const doc = await buildReviewDoc(col, legacy, p, specialty);
          await col.insertOne(doc);
          results[p] = {
            status: 'REVIEW_CREATED',
            target: { navoria_id: doc.id, name: doc.name,
              canonical: `${NAV_HOST}/praxis/${doc.city_slug}/${doc.slug}` },
          };
          reviewCreated += 1;
          audit({ path: p, status: 'REVIEW_CREATED', slug: doc.slug, name: doc.name });
        }
      }
    }

    if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/${runList.length} verarbeitet`);
    await new Promise((r) => setTimeout(r, 130));
  }

  await client.close();
  fs.writeFileSync(OUT_PATH, JSON.stringify(results, null, 2));

  console.log('');
  console.log('╔═════════════════════════════════════════════════════╗');
  console.log(`║  Phase 3 + 4 – Ergebnis  ${DRY_RUN ? '(DRY-RUN)          ' : '(WRITE-LAUF)       '}       ║`);
  console.log('╠═════════════════════════════════════════════════════╣');
  console.log(`║  Pfade gesamt                : ${String(paths.length).padStart(4)}                ║`);
  console.log(`║  ✅ Navoria bereits (Phase 2) : ${String(alreadyMatched).padStart(4)}                ║`);
  console.log(`║  ✅ Places-Match, existing    : ${String(placesFoundExisting).padStart(4)}                ║`);
  console.log(`║  📥 Places NEU importiert     : ${String(placesImportedNew).padStart(4)}                ║`);
  console.log(`║  📝 Review-Profil angelegt    : ${String(reviewCreated).padStart(4)}                ║`);
  console.log(`║  ❌ Weiterhin ungelöst        : ${String(stillUnresolved).padStart(4)}                ║`);
  console.log('╚═════════════════════════════════════════════════════╝');
  console.log(`Ergebnisdatei: ${OUT_PATH}`);
  console.log(`Audit-Log:     ${AUDIT_PATH}`);
}

main().catch((e) => { console.error('FEHLER:', e); process.exit(1); });
