import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { getCollection } from '@/lib/mongodb';
import { runImport, resyncOneDoctor, backfillMissingFields } from '@/lib/services/placesImport';
import { suggestSpecialtiesForSymptom } from '@/lib/services/symptomMapping';
import { slugify } from '@/lib/services/specialtyDetection';
import { createSession, requireAdmin } from '@/lib/auth';

function hashString(s) {
  return crypto.createHash('sha256').update(String(s)).digest('hex').slice(0, 16);
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, init = {}) {
  return NextResponse.json(data, { ...init, headers: { ...corsHeaders, ...(init.headers || {}) } });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

function stripId(doc) {
  if (!doc) return doc;
  const { _id, source_payload_json, ...rest } = doc;
  return rest;
}

// Haversine distance in km
function distanceKm(lat1, lon1, lat2, lon2) {
  if ([lat1, lon1, lat2, lon2].some((v) => v == null)) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function profileCompleteness(d) {
  let s = 0;
  if (d.phone_national || d.phone_international) s += 1;
  if (d.website_url) s += 1;
  if (d.opening_hours_json) s += 1;
  if (d.rating != null) s += 1;
  if (d.specialty_guess) s += 1;
  return s;
}

async function handleGet(request, pathParts) {
  const url = new URL(request.url);
  const params = url.searchParams;

  // GET /api/ - health
  if (pathParts.length === 0) {
    return json({ ok: true, service: 'Navoria API' });
  }

  // GET /api/search
  if (pathParts[0] === 'search') {
    const q = (params.get('q') || '').trim();
    const ort = (params.get('ort') || '').trim();
    const sort = params.get('sort') || 'relevance';
    const minRating = parseFloat(params.get('minRating') || '0');
    const minReviews = parseInt(params.get('minReviews') || '0', 10);
    const withWebsite = params.get('withWebsite') === '1';
    const withPhone = params.get('withPhone') === '1';
    const hasHours = params.get('hasHours') === '1';
    const limit = Math.min(parseInt(params.get('limit') || '30', 10), 100);
    const skip = parseInt(params.get('skip') || '0', 10);

    const col = await getCollection('doctor_places');

    const filter = { is_active: true };
    const andClauses = [];

    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      andClauses.push({
        $or: [
          { name: rx },
          { specialty_guess: rx },
          { category_label: rx },
          { primary_type: rx },
          { formatted_address: rx },
          { types: rx },
        ],
      });
    }
    if (ort) {
      const ortRx = new RegExp(ort.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      andClauses.push({
        $or: [
          { city: ortRx },
          { city_slug: slugify(ort) },
          { postal_code: ortRx },
          { formatted_address: ortRx },
        ],
      });
    }
    if (minRating > 0) andClauses.push({ rating: { $gte: minRating } });
    if (minReviews > 0) andClauses.push({ user_rating_count: { $gte: minReviews } });
    if (withWebsite) andClauses.push({ website_url: { $ne: null } });
    if (withPhone) andClauses.push({ $or: [{ phone_national: { $ne: null } }, { phone_international: { $ne: null } }] });
    if (hasHours) andClauses.push({ opening_hours_json: { $ne: null } });
    if (andClauses.length) filter.$and = andClauses;

    const total = await col.countDocuments(filter);
    let docs = await col.find(filter, {
      projection: {
        _id: 0,
        id: 1, name: 1, slug: 1, city: 1, city_slug: 1,
        specialty_guess: 1, rating: 1, user_rating_count: 1,
        phone_national: 1, phone_international: 1, website_url: 1,
        formatted_address: 1, google_maps_url: 1, is_verified: 1,
        opening_hours_json: 1, latitude: 1, longitude: 1,
        primary_type: 1, primary_type_display: 1,
      },
    }).limit(500).toArray();

    // Ranking
    docs = docs.map((d) => ({
      ...d,
      _completeness: profileCompleteness(d),
    }));

    if (sort === 'rating') {
      docs.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'reviews') {
      docs.sort((a, b) => (b.user_rating_count || 0) - (a.user_rating_count || 0));
    } else if (sort === 'completeness') {
      docs.sort((a, b) => b._completeness - a._completeness);
    } else {
      // relevance: rating * log(reviews+1) * completeness
      docs.sort((a, b) => {
        const sa = (a.rating || 0) * Math.log((a.user_rating_count || 0) + 1) + a._completeness * 0.2;
        const sb = (b.rating || 0) * Math.log((b.user_rating_count || 0) + 1) + b._completeness * 0.2;
        return sb - sa;
      });
    }

    const paged = docs.slice(skip, skip + limit).map(stripId);
    return json({ total, results: paged });
  }

  // GET /api/doctor/:slug
  if (pathParts[0] === 'doctor' && pathParts[1]) {
    const col = await getCollection('doctor_places');
    const doc = await col.findOne({ slug: pathParts[1] });
    if (!doc) return json({ error: 'Nicht gefunden' }, { status: 404 });
    return json(stripId(doc));
  }

  // GET /api/cities
  if (pathParts[0] === 'cities') {
    const col = await getCollection('cities');
    const cities = await col.find({}).sort({ doctor_count: -1 }).limit(50).toArray();
    return json(cities.map(stripId));
  }

  // GET /api/symptom-suggest?q=rückenschmerzen
  if (pathParts[0] === 'symptom-suggest') {
    const q = params.get('q') || '';
    const specialties = suggestSpecialtiesForSymptom(q);
    return json({ query: q, specialties });
  }

  // GET /api/admin/stats
  if (pathParts[0] === 'admin' && pathParts[1] === 'stats') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const docs = await getCollection('doctor_places');
    const jobs = await getCollection('sync_jobs');
    const cities = await getCollection('cities');
    const [doctorCount, cityCount, jobCount, lastJob] = await Promise.all([
      docs.countDocuments({ is_active: true }),
      cities.countDocuments({}),
      jobs.countDocuments({}),
      jobs.find({}).sort({ started_at: -1 }).limit(1).toArray(),
    ]);
    return json({
      doctor_count: doctorCount,
      city_count: cityCount,
      job_count: jobCount,
      last_job: lastJob[0] ? stripId(lastJob[0]) : null,
    });
  }

  // GET /api/admin/jobs
  if (pathParts[0] === 'admin' && pathParts[1] === 'jobs') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const jobs = await getCollection('sync_jobs');
    const list = await jobs.find({}).sort({ started_at: -1 }).limit(50).toArray();
    return json(list.map(stripId));
  }

  // GET /api/admin/campaigns
  if (pathParts[0] === 'admin' && pathParts[1] === 'campaigns' && !pathParts[2]) {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    // Self-heal: markiere hängende Kampagnen (>5min ohne Heartbeat) automatisch als aborted
    try { const { healStuckCampaigns } = await import('@/lib/services/campaignWorker'); await healStuckCampaigns(); } catch {}
    const col = await getCollection('campaigns');
    // queries-Array ist groß - beim Listing weglassen
    const list = await col.find({}, { projection: { queries: 0 } }).sort({ created_at: -1 }).limit(20).toArray();
    return json(list.map(stripId));
  }

  // GET /api/admin/campaigns/:id
  if (pathParts[0] === 'admin' && pathParts[1] === 'campaigns' && pathParts[2] && !pathParts[3]) {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const col = await getCollection('campaigns');
    const c = await col.findOne({ id: pathParts[2] }, { projection: { queries: 0 } });
    if (!c) return json({ error: 'Nicht gefunden' }, { status: 404 });
    return json(stripId(c));
  }

  // GET /api/admin/doctors?q=&ort=&limit=
  if (pathParts[0] === 'admin' && pathParts[1] === 'doctors' && !pathParts[2]) {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const qQ = (params.get('q') || '').trim();
    const ortQ = (params.get('ort') || '').trim();
    const limit = Math.min(parseInt(params.get('limit') || '50', 10), 200);
    const col = await getCollection('doctor_places');
    const filter = {};
    const and = [];
    if (qQ) {
      const rx = new RegExp(qQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      and.push({ $or: [{ name: rx }, { specialty_guess: rx }, { primary_type: rx }] });
    }
    if (ortQ) {
      const rx = new RegExp(ortQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      and.push({ $or: [{ city: rx }, { city_slug: slugify(ortQ) }, { postal_code: rx }, { formatted_address: rx }] });
    }
    if (and.length) filter.$and = and;
    const docs = await col.find(filter).sort({ updated_at: -1 }).limit(limit).toArray();
    return json({ results: docs.map(stripId) });
  }

  // GET /api/admin/logs?job_id=...
  if (pathParts[0] === 'admin' && pathParts[1] === 'logs') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const jobId = params.get('job_id');
    const logs = await getCollection('sync_job_logs');
    const filter = jobId ? { job_id: jobId } : {};
    const list = await logs.find(filter).sort({ created_at: -1 }).limit(200).toArray();
    return json(list.map(stripId));
  }

  // GET /api/admin/corrections?status=open
  if (pathParts[0] === 'admin' && pathParts[1] === 'corrections') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const status = params.get('status') || 'open';
    const col = await getCollection('correction_requests');
    const filter = status === 'all' ? {} : { status };
    const list = await col.find(filter).sort({ created_at: -1 }).limit(200).toArray();
    const openCount = await col.countDocuments({ status: 'open' });
    return json({ items: list.map(stripId), open_count: openCount });
  }

  // GET /api/admin/doctors-no-website?show=unchecked|checked|all&city=&limit=&offset=
  if (pathParts[0] === 'admin' && pathParts[1] === 'doctors-no-website') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const show = params.get('show') || 'unchecked';
    const cityFilter = params.get('city') || '';
    const limit = Math.min(parseInt(params.get('limit') || '500', 10), 2000);
    const offset = Math.max(parseInt(params.get('offset') || '0', 10), 0);
    const col = await getCollection('doctor_places');
    const noWebsite = { $or: [{ website_url: { $exists: false } }, { website_url: null }, { website_url: '' }] };
    const notDiscarded = { is_active: { $ne: false } };
    let filter;
    if (show === 'discarded') filter = { ...noWebsite, is_active: false };
    else if (show === 'unchecked') filter = { ...noWebsite, ...notDiscarded, $and: [{ $or: [{ website_checked_at: { $exists: false } }, { website_checked_at: null }] }] };
    else if (show === 'checked') filter = { ...noWebsite, ...notDiscarded, website_checked_at: { $exists: true, $ne: null } };
    else filter = { ...noWebsite, ...notDiscarded };
    if (cityFilter) filter.city = cityFilter;
    const projection = { _id: 0, id: 1, name: 1, slug: 1, city: 1, city_slug: 1, formatted_address: 1, phone_national: 1, specialty_guess: 1, google_place_id: 1, google_maps_url: 1, website_checked_at: 1, is_active: 1, discarded_at: 1 };
    const [list, matchCount] = await Promise.all([
      col.find(filter, { projection }).sort({ city: 1, name: 1 }).skip(offset).limit(limit).toArray(),
      col.countDocuments(filter),
    ]);

    // Alle unique Städte für Filter-Dropdown – aus GESAMTEM noWebsite-Bestand (nicht nur aus der Ergebnismenge)
    const allCities = await col.distinct('city', { ...noWebsite, ...notDiscarded, city: { $ne: null } });
    allCities.sort((a, b) => (a || '').localeCompare(b || '', 'de'));

    const totals = {
      total_no_website: await col.countDocuments({ ...noWebsite, ...notDiscarded }),
      unchecked: await col.countDocuments({ ...noWebsite, ...notDiscarded, $and: [{ $or: [{ website_checked_at: { $exists: false } }, { website_checked_at: null }] }] }),
      checked: await col.countDocuments({ ...noWebsite, ...notDiscarded, website_checked_at: { $exists: true, $ne: null } }),
      discarded: await col.countDocuments({ ...noWebsite, is_active: false }),
    };
    return json({ items: list, match_count: matchCount, all_cities: allCities, limit, offset, ...totals });
  }

  // GET /api/admin/duplicates?type=safe|similar_name|address&limit=&offset=&city=
  //   Findet Duplikat-Gruppen. Drei Modi mit unterschiedlicher Konfidenz:
  //     safe          – sehr hohe Konfidenz: selbe google_place_id ODER Adresse+Telefon
  //                     ODER Adresse+Website-Domain (Ärztehaus-safe: schließt legitime
  //                     Mehrfach-Praxen an einer Adresse aus)
  //     similar_name  – mittlere Konfidenz: selbe Adresse UND ähnlicher Name (>60% Overlap)
  //     address       – niedrige Konfidenz: nur selbe Adresse (⚠️ enthält Ärztehäuser!)
  if (pathParts[0] === 'admin' && pathParts[1] === 'duplicates') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const rawType = params.get('type') || 'safe';
    const type = ['safe', 'similar_name', 'address'].includes(rawType) ? rawType : 'safe';
    const limit = Math.min(parseInt(params.get('limit') || '100', 10), 500);
    const offset = Math.max(parseInt(params.get('offset') || '0', 10), 0);
    const cityFilter = (params.get('city') || '').trim();

    const col = await getCollection('doctor_places');

    // Hilfsfunktionen (JavaScript-seitig, weil MongoDB-Aggregation für diese Logik zu spröde ist)
    const normPhone = (p) => {
      if (!p) return '';
      const digits = String(p).replace(/\D/g, '');
      // Deutsche Nummern: +49 → 0-Prefix behandeln; nimm die letzten 10 Ziffern
      return digits.slice(-10);
    };
    const normWebsite = (url) => {
      if (!url) return '';
      try {
        const u = new URL(url.startsWith('http') ? url : `https://${url}`);
        return u.hostname.replace(/^www\./, '').toLowerCase();
      } catch { return String(url).toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]; }
    };
    const normAddress = (a) => (a || '').toLowerCase().trim().replace(/\s+/g, ' ');
    const normName = (n) => {
      // Entferne diakritische Zeichen, häufige Präfixe/Suffixe, um Kernnamen zu vergleichen
      const s = (n || '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Umlaute weg
        .replace(/\b(dr\.?|med\.?|prof\.?|praxis|praxen|mvz|hausarztpraxis|zahnarztpraxis|hausarzt|zahnarzt|kardiologe|orthopaede|orthopade|facharzt|fachärztin|allgemeinmedizin|dipl\.?)\b/g, ' ')
        .replace(/[^a-z0-9 ]/g, ' ')
        .replace(/\s+/g, ' ').trim();
      return s;
    };
    // Konfidenz-Score einer Gruppe (welchen behalten wir)
    const scoreDoc = (d) => {
      let s = 0;
      if (d.website_url) s += 5;
      if (d.is_verified) s += 3;
      if (d.phone_national) s += 1;
      if (d.opening_hours_json) s += 1;
      s += (d.rating || 0);
      s += Math.log((d.user_rating_count || 0) + 1) * 0.5;
      return Math.round(s * 100) / 100;
    };
    // Wortüberlappungs-Metrik für Namen (Jaccard-Index)
    const nameOverlap = (a, b) => {
      const ta = new Set(normName(a).split(' ').filter((w) => w.length > 2));
      const tb = new Set(normName(b).split(' ').filter((w) => w.length > 2));
      if (ta.size === 0 || tb.size === 0) return 0;
      const inter = [...ta].filter((w) => tb.has(w)).length;
      const uni = new Set([...ta, ...tb]).size;
      return inter / uni;
    };

    // Basis-Filter: nur aktive Praxen, ggf. Stadt-Einschränkung
    const baseMatch = { is_active: { $ne: false } };
    if (cityFilter) baseMatch.city = cityFilter;

    // Alle relevanten Praxen einmal laden (mit Feld-Projection)
    const allDocs = await col.find(baseMatch, {
      projection: {
        _id: 0,
        id: 1, name: 1, slug: 1, city: 1, city_slug: 1,
        formatted_address: 1, rating: 1, user_rating_count: 1,
        website_url: 1, is_verified: 1, specialty_guess: 1,
        phone_national: 1, phone_international: 1, google_place_id: 1,
        google_maps_url: 1, opening_hours_json: 1, primary_type: 1,
      },
    }).toArray();

    // === Grouping-Logik je Modus ===
    let rawGroups = []; // Array von Arrays: pro Gruppe die enthaltenen Doc-IDs

    if (type === 'safe') {
      // Drei parallele Gruppierungen, dann Union-Find zum Verschmelzen überlappender Signale
      const parent = new Map();
      const find = (x) => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; };
      const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(ra, rb); };
      allDocs.forEach((d) => parent.set(d.id, d.id));

      // Signal 1: google_place_id (falls doppelt vergeben)
      const byPlaceId = new Map();
      for (const d of allDocs) {
        if (!d.google_place_id) continue;
        const k = d.google_place_id;
        if (!byPlaceId.has(k)) byPlaceId.set(k, []);
        byPlaceId.get(k).push(d);
      }
      // Signal 2: Adresse + Telefon
      const byAddrPhone = new Map();
      for (const d of allDocs) {
        const addr = normAddress(d.formatted_address);
        const phone = normPhone(d.phone_national) || normPhone(d.phone_international);
        if (!addr || !phone) continue;
        const k = `${addr}|${phone}`;
        if (!byAddrPhone.has(k)) byAddrPhone.set(k, []);
        byAddrPhone.get(k).push(d);
      }
      // Signal 3: Adresse + Website-Domain
      const byAddrWeb = new Map();
      for (const d of allDocs) {
        const addr = normAddress(d.formatted_address);
        const web = normWebsite(d.website_url);
        if (!addr || !web) continue;
        const k = `${addr}|${web}`;
        if (!byAddrWeb.has(k)) byAddrWeb.set(k, []);
        byAddrWeb.get(k).push(d);
      }

      // Union: merke, welches Signal welches Paar verbindet
      const signalsPerDoc = new Map(); // docId → Set of reason codes
      const addSignal = (id, reason) => {
        if (!signalsPerDoc.has(id)) signalsPerDoc.set(id, new Set());
        signalsPerDoc.get(id).add(reason);
      };
      for (const arr of byPlaceId.values()) {
        if (arr.length < 2) continue;
        for (let i = 1; i < arr.length; i += 1) union(arr[0].id, arr[i].id);
        arr.forEach((d) => addSignal(d.id, 'place_id'));
      }
      for (const arr of byAddrPhone.values()) {
        if (arr.length < 2) continue;
        for (let i = 1; i < arr.length; i += 1) union(arr[0].id, arr[i].id);
        arr.forEach((d) => addSignal(d.id, 'address+phone'));
      }
      for (const arr of byAddrWeb.values()) {
        if (arr.length < 2) continue;
        for (let i = 1; i < arr.length; i += 1) union(arr[0].id, arr[i].id);
        arr.forEach((d) => addSignal(d.id, 'address+website'));
      }

      // Sammel Docs pro Root-ID
      const clusters = new Map();
      for (const d of allDocs) {
        if (!signalsPerDoc.has(d.id)) continue; // gehört zu keinem Signal
        const r = find(d.id);
        if (!clusters.has(r)) clusters.set(r, []);
        clusters.get(r).push(d);
      }
      rawGroups = [...clusters.values()].filter((g) => g.length > 1)
        .map((docs) => ({ docs, reasons: [...new Set(docs.flatMap((d) => [...(signalsPerDoc.get(d.id) || [])]))] }));
    } else if (type === 'similar_name') {
      // Adresse gleich → Kandidaten. Innerhalb jeder Kandidatengruppe: Paare mit
      // Namensüberlappung > 0.6 werden geclustert (Union-Find)
      const byAddr = new Map();
      for (const d of allDocs) {
        const addr = normAddress(d.formatted_address);
        if (!addr) continue;
        if (!byAddr.has(addr)) byAddr.set(addr, []);
        byAddr.get(addr).push(d);
      }
      const parent = new Map();
      const find = (x) => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; };
      const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(ra, rb); };
      const inGroup = new Set();
      allDocs.forEach((d) => parent.set(d.id, d.id));

      for (const arr of byAddr.values()) {
        if (arr.length < 2) continue;
        for (let i = 0; i < arr.length; i += 1) {
          for (let j = i + 1; j < arr.length; j += 1) {
            if (nameOverlap(arr[i].name, arr[j].name) >= 0.6) {
              union(arr[i].id, arr[j].id);
              inGroup.add(arr[i].id);
              inGroup.add(arr[j].id);
            }
          }
        }
      }
      const clusters = new Map();
      for (const d of allDocs) {
        if (!inGroup.has(d.id)) continue;
        const r = find(d.id);
        if (!clusters.has(r)) clusters.set(r, []);
        clusters.get(r).push(d);
      }
      rawGroups = [...clusters.values()].filter((g) => g.length > 1)
        .map((docs) => ({ docs, reasons: ['address+similar_name'] }));
    } else {
      // 'address' - nur nach Adresse gruppieren (legacy / manuelle Prüfung)
      const byAddr = new Map();
      for (const d of allDocs) {
        const addr = normAddress(d.formatted_address);
        if (!addr) continue;
        if (!byAddr.has(addr)) byAddr.set(addr, []);
        byAddr.get(addr).push(d);
      }
      rawGroups = [...byAddr.values()].filter((g) => g.length > 1)
        .map((docs) => ({ docs, reasons: ['address_only'] }));
    }

    // Sortiere Gruppen nach Größe absteigend
    rawGroups.sort((a, b) => b.docs.length - a.docs.length);

    const totalGroups = rawGroups.length;
    const totalDocs = rawGroups.reduce((s, g) => s + g.docs.length, 0);
    const redundant = rawGroups.reduce((s, g) => s + (g.docs.length - 1), 0);

    // Für die Seite: nur die passende Slice
    const pageGroups = rawGroups.slice(offset, offset + limit).map((g) => {
      const docs = g.docs.map((d) => ({ ...d, _score: scoreDoc(d) }));
      docs.sort((a, b) => b._score - a._score || (b.user_rating_count || 0) - (a.user_rating_count || 0));
      const enriched = docs.map((d, i) => ({
        ...d, is_suggested_keep: i === 0, is_suggested_discard: i !== 0,
      }));
      const first = enriched[0];
      return {
        count: g.docs.length,
        reasons: g.reasons,
        label: type === 'similar_name'
          ? `${first?.name || ''} · ${first?.formatted_address || ''}`
          : (first?.formatted_address || first?.name || ''),
        docs: enriched,
      };
    });

    // Städte-Filter-Optionen: Städte mit mindestens einer Duplikat-Gruppe
    const allCitiesSet = new Set();
    rawGroups.forEach((g) => g.docs.forEach((d) => { if (d.city) allCitiesSet.add(d.city); }));
    const allCities = [...allCitiesSet].sort();

    return json({
      type,
      total_groups: totalGroups,
      total_duplicate_docs: totalDocs,
      redundant_count: redundant,
      groups: pageGroups,
      all_cities: allCities,
      limit,
      offset,
    });
  }

  // GET /api/admin/export – vollständigen doctor_places Dump als JSON zum Download
  if (pathParts[0] === 'admin' && pathParts[1] === 'export') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const col = await getCollection('doctor_places');
    const docs = await col.find({}, { projection: { _id: 0 } }).toArray();
    const payload = {
      exported_at: new Date().toISOString(),
      source: 'navoria',
      count: docs.length,
      doctors: docs,
    };
    const filename = `navoria-export-${new Date().toISOString().slice(0, 10)}.json`;
    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  }

  return json({ error: 'Not found' }, { status: 404 });
}

async function handlePost(request, pathParts) {
  let body = {};
  try { body = await request.json(); } catch { body = {}; }

  // POST /api/correction-requests – öffentlich, mit einfachem Anti-Spam-Rate-Limit
  if (pathParts[0] === 'correction-requests' && !pathParts[1]) {
    const { doctor_id, field, correct_value, note, email } = body || {};
    if (!doctor_id || !field) return json({ error: 'doctor_id und field erforderlich' }, { status: 400 });
    if (typeof correct_value === 'string' && correct_value.length > 500) return json({ error: 'Wert zu lang' }, { status: 400 });
    if (typeof note === 'string' && note.length > 500) return json({ error: 'Anmerkung zu lang' }, { status: 400 });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Ungültige E-Mail' }, { status: 400 });

    const doctors = await getCollection('doctor_places');
    const doc = await doctors.findOne({ id: doctor_id }, { projection: { id: 1, name: 1, slug: 1, city_slug: 1 } });
    if (!doc) return json({ error: 'Praxis nicht gefunden' }, { status: 404 });

    const corrections = await getCollection('correction_requests');
    // Sehr einfaches Rate-Limit: pro doctor_id/field/email max 3 offene Meldungen
    const openCount = await corrections.countDocuments({ doctor_id, field, status: 'open', email: email || null });
    if (openCount >= 3) return json({ error: 'Zu viele offene Meldungen für dieses Feld. Bitte auf Bearbeitung warten.' }, { status: 429 });

    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || null;
    const ua = request.headers.get('user-agent') || null;

    await corrections.insertOne({
      id: uuidv4(),
      doctor_id,
      doctor_name: doc.name,
      doctor_slug: doc.slug,
      doctor_city_slug: doc.city_slug,
      field,
      correct_value: correct_value ? String(correct_value).slice(0, 500) : null,
      note: note ? String(note).slice(0, 500) : null,
      email: email || null,
      status: 'open',
      created_at: new Date(),
      ip_hash: ip ? hashString(ip) : null,
      user_agent_snippet: ua ? ua.slice(0, 120) : null,
    });
    return json({ ok: true });
  }

  // POST /api/admin/corrections/:id/resolve – Meldung abschließen (accept oder reject)
  if (pathParts[0] === 'admin' && pathParts[1] === 'corrections' && pathParts[2] && pathParts[3] === 'resolve') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const { action, apply_override } = body || {}; // action: 'accept' | 'reject'
    if (!['accept', 'reject'].includes(action)) return json({ error: 'Ungültige Aktion' }, { status: 400 });
    const corrections = await getCollection('correction_requests');
    const doc = await corrections.findOne({ id: pathParts[2] });
    if (!doc) return json({ error: 'Nicht gefunden' }, { status: 404 });

    // Optional: manual override in doctor_places anwenden
    if (action === 'accept' && apply_override && doc.correct_value) {
      const doctors = await getCollection('doctor_places');
      const fieldMap = { phone: 'phone_national', address: 'formatted_address', website: 'website_url', specialty: 'specialty_guess', name: 'name', opening_hours: null };
      const dbField = fieldMap[doc.field];
      if (dbField) {
        await doctors.updateOne(
          { id: doc.doctor_id },
          { $set: { [dbField]: doc.correct_value, [`manual_overrides.${dbField}`]: doc.correct_value, updated_at: new Date() } }
        );
      }
    }
    await corrections.updateOne(
      { id: pathParts[2] },
      { $set: { status: action === 'accept' ? 'accepted' : 'rejected', resolved_at: new Date() } }
    );
    return json({ ok: true });
  }

  // POST /api/admin/doctors/:id/verify – Praxis manuell als verifiziert markieren
  if (pathParts[0] === 'admin' && pathParts[1] === 'doctors' && pathParts[2] && pathParts[3] === 'verify') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const { verified, method } = body || {};
    const doctors = await getCollection('doctor_places');
    const res = await doctors.findOneAndUpdate(
      { id: pathParts[2] },
      { $set: { is_verified: !!verified, verified_at: verified ? new Date() : null, verification_method: verified ? (method || 'admin_manual') : null, updated_at: new Date() } },
      { returnDocument: 'after' }
    );
    if (!res) return json({ error: 'Nicht gefunden' }, { status: 404 });
    return json({ ok: true, doctor: stripId(res) });
  }

  // POST /api/admin/doctors/:id/website-checked – Website-Recherche für Praxis abhaken
  //   body: { checked: true, website_url?: '...' } – wenn website_url vorhanden, wird sie mit als manueller Override gespeichert
  if (pathParts[0] === 'admin' && pathParts[1] === 'doctors' && pathParts[2] && pathParts[3] === 'website-checked') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const { checked, website_url } = body || {};
    const doctors = await getCollection('doctor_places');
    const set = { updated_at: new Date() };
    if (checked) set.website_checked_at = new Date();
    else set.website_checked_at = null;
    if (website_url && typeof website_url === 'string' && website_url.trim().length > 0) {
      const url = website_url.trim().startsWith('http') ? website_url.trim() : `https://${website_url.trim()}`;
      set.website_url = url;
      set['manual_overrides.website_url'] = url;
    }
    const res = await doctors.findOneAndUpdate({ id: pathParts[2] }, { $set: set }, { returnDocument: 'after' });
    if (!res) return json({ error: 'Nicht gefunden' }, { status: 404 });
    return json({ ok: true, doctor: stripId(res) });
  }

  // POST /api/admin/doctors/bulk-discard – mehrere Praxen auf einmal soft-verwerfen (is_active:false)
  //   body: { ids: [uuid, uuid, ...], reason?: 'string' }
  if (pathParts[0] === 'admin' && pathParts[1] === 'doctors' && pathParts[2] === 'bulk-discard') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const { ids, reason } = body || {};
    if (!Array.isArray(ids) || ids.length === 0) return json({ error: 'ids[] erforderlich' }, { status: 400 });
    if (ids.length > 5000) return json({ error: 'Zu viele Einträge (>5000)' }, { status: 400 });
    const doctors = await getCollection('doctor_places');
    const set = {
      is_active: false,
      discarded_at: new Date(),
      updated_at: new Date(),
    };
    if (reason && typeof reason === 'string') set.discard_reason = reason.slice(0, 200);
    else set.discard_reason = 'admin_duplicate';
    const res = await doctors.updateMany({ id: { $in: ids }, is_active: { $ne: false } }, { $set: set });
    return json({ ok: true, matched: res.matchedCount, modified: res.modifiedCount });
  }

  // POST /api/admin/doctors/:id/discard – Praxis dauerhaft aus Verzeichnis ausblenden
  //   body: { discarded: true|false, reason?: 'string' }
  //   → setzt is_active: false und discarded_at. Praxis erscheint nicht mehr in Suche, Hubs, Sitemap.
  if (pathParts[0] === 'admin' && pathParts[1] === 'doctors' && pathParts[2] && pathParts[3] === 'discard') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const { discarded = true, reason } = body || {};
    const doctors = await getCollection('doctor_places');
    const set = { is_active: !discarded, updated_at: new Date() };
    if (discarded) {
      set.discarded_at = new Date();
      if (reason && typeof reason === 'string') set.discard_reason = reason.slice(0, 200);
    } else {
      set.discarded_at = null;
      set.discard_reason = null;
    }
    const res = await doctors.findOneAndUpdate({ id: pathParts[2] }, { $set: set }, { returnDocument: 'after' });
    if (!res) return json({ error: 'Nicht gefunden' }, { status: 404 });
    return json({ ok: true, doctor: stripId(res) });
  }

  // POST /api/admin/login
  if (pathParts[0] === 'admin' && pathParts[1] === 'login') {
    const { email, password } = body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const { token, expiresAt } = await createSession();
      return json({ ok: true, token, expires_at: expiresAt });
    }
    return json({ error: 'Falsche Zugangsdaten' }, { status: 401 });
  }

  // POST /api/admin/campaigns/:id/abort
  if (pathParts[0] === 'admin' && pathParts[1] === 'campaigns' && pathParts[2] && pathParts[3] === 'abort') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    try {
      const { abortCampaign } = await import('@/lib/services/campaignWorker');
      await abortCampaign(pathParts[2]);
      return json({ ok: true });
    } catch (err) {
      return json({ error: String(err.message || err) }, { status: 500 });
    }
  }

  // POST /api/admin/campaigns/:id/resume
  if (pathParts[0] === 'admin' && pathParts[1] === 'campaigns' && pathParts[2] && pathParts[3] === 'resume') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    try {
      const { resumeCampaign } = await import('@/lib/services/campaignWorker');
      await resumeCampaign(pathParts[2]);
      return json({ ok: true });
    } catch (err) {
      return json({ error: String(err.message || err) }, { status: 500 });
    }
  }

  // POST /api/admin/campaigns - Bulk-Import-Kampagne starten
  if (pathParts[0] === 'admin' && pathParts[1] === 'campaigns') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const { cities, specialtySlugs, maxPerQuery } = body;
    if (!Array.isArray(cities) || cities.length === 0) return json({ error: 'Keine Städte ausgewählt' }, { status: 400 });
    if (!Array.isArray(specialtySlugs) || specialtySlugs.length === 0) return json({ error: 'Keine Fachrichtungen ausgewählt' }, { status: 400 });
    try {
      const { createCampaign } = await import('@/lib/services/campaignWorker');
      const campaign = await createCampaign({ cities, specialtySlugs, maxPerQuery: Math.min(parseInt(maxPerQuery || 60, 10), 60) });
      return json({ ok: true, campaign: stripId(campaign) });
    } catch (err) {
      return json({ error: String(err.message || err) }, { status: 500 });
    }
  }

  // POST /api/admin/sync
  if (pathParts[0] === 'admin' && pathParts[1] === 'sync') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const { city, query, placeType, maxResults } = body;
    try {
      const result = await runImport({
        city: (city || '').trim(),
        query: (query || '').trim(),
        placeType: placeType || null,
        maxResults: Math.min(parseInt(maxResults || 20, 10), 60),
      });
      return json({ ok: true, job: result });
    } catch (err) {
      return json({ error: String(err.message || err) }, { status: 500 });
    }
  }

  // POST /api/admin/doctors/:id/resync – Einzel-Praxis neu synchronisieren (Place Details)
  if (pathParts[0] === 'admin' && pathParts[1] === 'doctors' && pathParts[2] && pathParts[3] === 'resync') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const id = pathParts[2];
    const col = await getCollection('doctor_places');
    const doc = await col.findOne({ id });
    if (!doc) return json({ error: 'Nicht gefunden' }, { status: 404 });
    if (!doc.google_place_id) return json({ error: 'Keine externe ID' }, { status: 400 });
    try {
      const result = await resyncOneDoctor(doc.google_place_id);
      return json({ ok: true, result });
    } catch (err) {
      return json({ error: String(err.message || err) }, { status: 500 });
    }
  }

  // POST /api/admin/backfill – Batch-Refresh fehlender Felder (accessibility/parking/payment)
  if (pathParts[0] === 'admin' && pathParts[1] === 'backfill') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const limit = Math.min(parseInt(body.limit || 50, 10), 200);
    const force = body.force === true || body.force === 'true';
    try {
      const result = await backfillMissingFields({ limit, force });
      return json({ ok: true, ...result });
    } catch (err) {
      return json({ error: String(err.message || err) }, { status: 500 });
    }
  }

  // POST /api/admin/import – JSON aus anderer Umgebung importieren (Prod → Preview Sync)
  //   body: { doctors: [ ... ], mode?: 'merge' | 'replace' }
  //   - merge (default): upsert by google_place_id, manual_overrides respektieren
  //   - replace: erst löschen, dann neu einspielen (nur mit force=true erlaubt)
  if (pathParts[0] === 'admin' && pathParts[1] === 'import') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const { doctors, mode = 'merge', force = false } = body || {};
    if (!Array.isArray(doctors)) return json({ error: 'doctors[] erforderlich' }, { status: 400 });
    if (doctors.length > 20000) return json({ error: 'Zu viele Einträge (>20.000)' }, { status: 400 });

    const doctorsCol = await getCollection('doctor_places');
    let inserted = 0, updated = 0, skipped = 0;
    const errors = [];

    if (mode === 'replace') {
      if (!force) return json({ error: 'mode=replace benötigt force=true' }, { status: 400 });
      await doctorsCol.deleteMany({});
    }

    for (const raw of doctors) {
      try {
        if (!raw || !raw.google_place_id) { skipped += 1; continue; }
        // Date-Felder zurück konvertieren (kamen als ISO-Strings über JSON)
        const doc = { ...raw };
        delete doc._id;
        for (const k of ['created_at', 'updated_at', 'last_synced_at', 'last_external_sync_at', 'verified_at', 'website_checked_at']) {
          if (doc[k] && typeof doc[k] === 'string') doc[k] = new Date(doc[k]);
        }
        const existing = await doctorsCol.findOne({ google_place_id: doc.google_place_id });
        if (existing) {
          const setFields = { ...doc };
          delete setFields.id;
          delete setFields.created_at;
          // Manuelle Overrides der lokalen Kopie respektieren
          const overrides = existing.manual_overrides || {};
          for (const field of Object.keys(overrides)) {
            if (overrides[field] != null) delete setFields[field];
          }
          setFields.updated_at = new Date();
          await doctorsCol.updateOne({ google_place_id: doc.google_place_id }, { $set: setFields });
          updated += 1;
        } else {
          doc.id = doc.id || uuidv4();
          doc.created_at = doc.created_at || new Date();
          doc.updated_at = new Date();
          doc.manual_overrides = doc.manual_overrides || {};
          doc.data_conflicts = doc.data_conflicts || [];
          await doctorsCol.insertOne(doc);
          inserted += 1;
        }
      } catch (err) {
        errors.push({ gid: raw?.google_place_id, error: String(err.message || err) });
      }
    }

    return json({ ok: true, inserted, updated, skipped, errors: errors.slice(0, 20), total_processed: doctors.length });
  }

  return json({ error: 'Not found' }, { status: 404 });
}

async function handlePut(request, pathParts) {
  let body = {};
  try { body = await request.json(); } catch { body = {}; }

  // PUT /api/admin/doctors/:id
  if (pathParts[0] === 'admin' && pathParts[1] === 'doctors' && pathParts[2]) {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const id = pathParts[2];
    const col = await getCollection('doctor_places');
    const allowed = {};
    if (body.specialty_guess !== undefined) {
      allowed.specialty_guess = body.specialty_guess === '' ? null : body.specialty_guess;
      allowed.specialty_confidence = 1.0; // manuell = maximale Confidence
    }
    if (typeof body.is_verified === 'boolean') allowed.is_verified = body.is_verified;
    if (typeof body.is_active === 'boolean') allowed.is_active = body.is_active;
    if (Object.keys(allowed).length === 0) return json({ error: 'Keine Felder' }, { status: 400 });
    allowed.updated_at = new Date();
    const res = await col.findOneAndUpdate({ id }, { $set: allowed }, { returnDocument: 'after' });
    if (!res) return json({ error: 'Nicht gefunden' }, { status: 404 });
    return json({ ok: true, doctor: stripId(res) });
  }

  return json({ error: 'Not found' }, { status: 404 });
}

export async function GET(request, { params }) {
  const resolved = await params;
  const pathParts = resolved.path || [];
  try {
    return await handleGet(request, pathParts);
  } catch (err) {
    console.error('GET error', err);
    return json({ error: String(err.message || err) }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const resolved = await params;
  const pathParts = resolved.path || [];
  try {
    return await handlePost(request, pathParts);
  } catch (err) {
    console.error('POST error', err);
    return json({ error: String(err.message || err) }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const resolved = await params;
  const pathParts = resolved.path || [];
  try {
    return await handlePut(request, pathParts);
  } catch (err) {
    console.error('PUT error', err);
    return json({ error: String(err.message || err) }, { status: 500 });
  }
}
