#!/usr/bin/env node
/**
 * Phase 2: Deterministisches Matching der 231 gescrapten Legacy-Profile
 * gegen die vollständige Navoria-DB.
 *
 * Priorität:
 *   1) Telefonnummer (normalisiert)
 *   2) Straße + PLZ
 *   3) Straße + Stadt (case-insensitive, umlaut-tolerant)
 *   4) Name + PLZ
 *   5) Fuzzy Name + City
 *
 * SAFE nur bei ≥ 90 % und ≥ 8pp Abstand zum 2. Kandidaten.
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const SCRIPT_DIR = __dirname;
const SCRAPED = path.join(SCRIPT_DIR, 'scraped-data.json');
const OUT_MATCH = path.join(SCRIPT_DIR, 'phase2-matches.json');
const OUT_CSV = path.join(SCRIPT_DIR, 'phase2-report.csv');

const NAV_HOST = 'https://navoria.de';

// ------ Utils ------
function normPhone(p) { return String(p || '').replace(/[^0-9]/g, '').replace(/^0/, '49'); }
function normStreet(s) {
  return String(s || '').toLowerCase()
    .replace(/ß/g, 'ss').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
    .replace(/straße/g, 'strasse').replace(/\bstr\b\.?/g, 'strasse')
    .replace(/[^a-z0-9]/g, '');
}
function normCity(c) {
  return String(c || '').toLowerCase()
    .replace(/ß/g, 'ss').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
    .replace(/[^a-z0-9]/g, '');
}
function normName(n) {
  return String(n || '').toLowerCase()
    .replace(/ß/g, 'ss').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(dr|med|prof|dipl|univ|hc|mudr|herr|frau|md|imf)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
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

function tokenOverlap(aTokens, bTokens) {
  if (!aTokens.length || !bTokens.length) return 0;
  const bSet = new Set(bTokens);
  let hit = 0;
  for (const t of aTokens) {
    if (bSet.has(t)) { hit += 1; continue; }
    // tolerant match
    for (const b of bTokens) { if (lev(t, b) <= 1 && t.length >= 3) { hit += 1; break; } }
  }
  return hit / aTokens.length;
}

// ------ Main ------
async function main() {
  const scraped = JSON.parse(fs.readFileSync(SCRAPED, 'utf8'));
  const mongoUrl = process.env.MONGO_URL;
  const dbName = process.env.DB_NAME || 'navoria_db';
  const client = await MongoClient.connect(mongoUrl);
  const col = client.db(dbName).collection('doctor_places');
  console.log(`→ ${Object.keys(scraped).length} Legacy-Profile geladen`);
  const total = await col.countDocuments({ is_active: { $ne: false } });
  console.log(`→ ${total} aktive Praxen in Navoria`);

  const results = {};
  let idx = 0;
  const paths = Object.keys(scraped);

  for (const p of paths) {
    idx += 1;
    const d = scraped[p];
    if (!d || d.error || !d.name) {
      results[p] = { legacy: d || null, status: 'NO_LEGACY_DATA' };
      continue;
    }
    const legacyPhone = normPhone(d.telephone);
    const legacyStreet = normStreet(d.street);
    const legacyPLZ = String(d.postal_code || '').trim();
    const legacyCity = normCity(d.city);
    const legacyNameTokens = tokens(d.name);

    // Stufe 1: Telefon-Match (streng normalisiert)
    let hit = null;
    let matchReason = null;
    if (legacyPhone && legacyPhone.length >= 8) {
      const phoneQ = { $or: [
        { phone_international: { $regex: legacyPhone.slice(-8) + '$' } },
        { phone_national: { $regex: legacyPhone.slice(-8) + '$' } },
      ] };
      const cand = await col.find(phoneQ, { projection: { name:1, city:1, city_slug:1, slug:1, formatted_address:1, street:1, postal_code:1, phone_national:1, phone_international:1, specialty_guess:1, google_place_id:1, id:1, _id:0 } }).limit(5).toArray();
      if (cand.length === 1) { hit = cand[0]; matchReason = 'phone'; }
      else if (cand.length > 1) {
        // Wähle den mit Name-Overlap
        cand.sort((a, b) => tokenOverlap(legacyNameTokens, tokens(b.name)) - tokenOverlap(legacyNameTokens, tokens(a.name)));
        if (tokenOverlap(legacyNameTokens, tokens(cand[0].name)) >= 0.5) { hit = cand[0]; matchReason = 'phone+name'; }
      }
    }

    // Stufe 2: Straße + PLZ
    if (!hit && legacyStreet && legacyPLZ) {
      const cand = await col.find(
        { postal_code: legacyPLZ, is_active: { $ne: false } },
        { projection: { name:1, city:1, city_slug:1, slug:1, formatted_address:1, street:1, postal_code:1, phone_national:1, phone_international:1, specialty_guess:1, google_place_id:1, id:1, _id:0 } },
      ).limit(500).toArray();
      for (const c of cand) {
        const cStreet = normStreet(c.street || c.formatted_address);
        if (cStreet && (cStreet === legacyStreet || cStreet.includes(legacyStreet) || legacyStreet.includes(cStreet))) {
          if (tokenOverlap(legacyNameTokens, tokens(c.name)) >= 0.5) {
            hit = c; matchReason = 'street+plz+name'; break;
          }
        }
      }
    }

    // Stufe 3: Name + PLZ (Nur PLZ, Name muss stark matchen)
    if (!hit && legacyPLZ) {
      const cand = await col.find(
        { postal_code: legacyPLZ, is_active: { $ne: false } },
        { projection: { name:1, city:1, city_slug:1, slug:1, formatted_address:1, street:1, postal_code:1, phone_national:1, phone_international:1, specialty_guess:1, google_place_id:1, id:1, _id:0 } },
      ).limit(500).toArray();
      const scored = cand.map((c) => ({ c, s: tokenOverlap(legacyNameTokens, tokens(c.name)) }));
      scored.sort((a, b) => b.s - a.s);
      if (scored.length && scored[0].s >= 0.7 && (scored.length === 1 || scored[0].s - (scored[1]?.s || 0) >= 0.15)) {
        hit = scored[0].c; matchReason = 'name+plz';
      }
    }

    // Stufe 4: Fuzzy Name + City
    if (!hit && legacyCity) {
      const cityRegex = new RegExp('^' + legacyCity.slice(0, 6), 'i');
      const cand = await col.find(
        { $or: [{ city_slug: cityRegex }, { city: cityRegex }], is_active: { $ne: false } },
        { projection: { name:1, city:1, city_slug:1, slug:1, formatted_address:1, street:1, postal_code:1, phone_national:1, phone_international:1, specialty_guess:1, google_place_id:1, id:1, _id:0 } },
      ).limit(500).toArray();
      const scored = cand.map((c) => {
        const s = tokenOverlap(legacyNameTokens, tokens(c.name));
        const cityS = sim(normCity(c.city), legacyCity);
        return { c, s, cityS, total: 0.85 * s + 0.15 * cityS };
      });
      scored.sort((a, b) => b.total - a.total);
      const best = scored[0], second = scored[1];
      if (best && best.total >= 0.90 && (!second || best.total - second.total >= 0.08)) {
        hit = best.c; matchReason = 'fuzzy_name_city';
      }
    }

    if (hit) {
      results[p] = {
        status: 'MATCHED',
        reason: matchReason,
        legacy: { name: d.name, street: d.street, plz: d.postal_code, city: d.city, phone: d.telephone },
        target: {
          navoria_id: hit.id,
          name: hit.name,
          address: hit.formatted_address,
          canonical: `${NAV_HOST}/praxis/${hit.city_slug}/${hit.slug}`,
          phone: hit.phone_national || hit.phone_international,
        },
      };
    } else {
      results[p] = {
        status: 'NOT_FOUND',
        legacy: { name: d.name, street: d.street, plz: d.postal_code, city: d.city, phone: d.telephone },
      };
    }
    if (idx % 25 === 0) console.log(`  ${idx}/${paths.length}  ${matchReason || 'NOT_FOUND'}`);
  }
  await client.close();
  fs.writeFileSync(OUT_MATCH, JSON.stringify(results, null, 2));

  // CSV
  const csvEsc = (v) => { if (v==null) return ''; const s=String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const rows = ['path,status,reason,legacy_name,legacy_phone,legacy_address,target_name,target_url'];
  const counts = { MATCHED: 0, NOT_FOUND: 0, NO_LEGACY_DATA: 0 };
  const byReason = {};
  for (const p of paths) {
    const r = results[p];
    counts[r.status] = (counts[r.status] || 0) + 1;
    if (r.reason) byReason[r.reason] = (byReason[r.reason] || 0) + 1;
    rows.push([p, r.status, r.reason||'', r.legacy?.name, r.legacy?.phone,
      [r.legacy?.street, r.legacy?.plz, r.legacy?.city].filter(Boolean).join(', '),
      r.target?.name, r.target?.canonical].map(csvEsc).join(','));
  }
  fs.writeFileSync(OUT_CSV, rows.join('\n') + '\n');
  console.log('');
  console.log('Ergebnis:');
  console.log(`  ✅ MATCHED:         ${counts.MATCHED}`);
  console.log(`  ❌ NOT_FOUND:       ${counts.NOT_FOUND}`);
  console.log(`  ⚠  NO_LEGACY_DATA:  ${counts.NO_LEGACY_DATA}`);
  console.log('  by reason:');
  for (const [k, v] of Object.entries(byReason)) console.log(`    ${k}: ${v}`);
}

main().catch((e) => { console.error('FEHLER:', e); process.exit(1); });
