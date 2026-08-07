import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { getCollection } from '@/lib/mongodb';
import { runImport, resyncOneDoctor, backfillMissingFields } from '@/lib/services/placesImport';
import { suggestSpecialtiesForSymptom } from '@/lib/services/symptomMapping';
import { slugify } from '@/lib/services/specialtyDetection';
import { createSession, requireAdmin } from '@/lib/auth';
import { hashIp, getClientIp, getGeo, isBot, getDeviceType, getBrowserFamily } from '@/lib/analytics';

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

  // GET /api/admin/legacy-rescue-stats?days=7
  // Aggregierte Statistik über Legacy-Referrer-Rescue-Redirects.
  if (pathParts[0] === 'admin' && pathParts[1] === 'legacy-rescue-stats') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const days = Math.max(1, Math.min(90, parseInt(url.searchParams.get('days') || '7', 10) || 7));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const col = await getCollection('legacy_rescues');
    const [total, byResult, byCity, bySpecialty, recent, uniqueTargets, hourly] = await Promise.all([
      col.countDocuments({ timestamp: { $gte: since } }),
      col.aggregate([
        { $match: { timestamp: { $gte: since } } },
        { $group: { _id: '$result', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray(),
      col.aggregate([
        { $match: { timestamp: { $gte: since }, parsed_city: { $ne: null } } },
        { $group: { _id: '$parsed_city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]).toArray(),
      col.aggregate([
        { $match: { timestamp: { $gte: since }, parsed_specialty: { $ne: null } } },
        { $group: { _id: '$parsed_specialty', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray(),
      col.find({ timestamp: { $gte: since } }).sort({ timestamp: -1 }).limit(30).toArray(),
      col.aggregate([
        { $match: { timestamp: { $gte: since }, result: 'concrete' } },
        { $group: { _id: '$redirect_target', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]).toArray(),
      col.aggregate([
        { $match: { timestamp: { $gte: since } } },
        { $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            count: { $sum: 1 },
            concrete: { $sum: { $cond: [{ $eq: ['$result', 'concrete'] }, 1, 0] } },
        } },
        { $sort: { _id: 1 } },
      ]).toArray(),
    ]);
    const concreteHits = byResult.find((r) => r._id === 'concrete')?.count || 0;
    const successRate = total > 0 ? Math.round((concreteHits / total) * 1000) / 10 : 0;
    return json({
      window_days: days,
      since: since.toISOString(),
      total_rescues: total,
      concrete_hits: concreteHits,
      success_rate_percent: successRate,
      by_result: byResult.map((r) => ({ result: r._id, count: r.count })),
      by_city: byCity.map((r) => ({ city: r._id, count: r.count })),
      by_specialty: bySpecialty.map((r) => ({ specialty: r._id, count: r.count })),
      top_targets: uniqueTargets.map((r) => ({ target: r._id, count: r.count })),
      daily: hourly.map((r) => ({ day: r._id, total: r.count, concrete: r.concrete })),
      recent: recent.map((r) => ({
        legacy_path: r.legacy_path,
        result: r.result,
        redirect_target: r.redirect_target,
        timestamp: r.timestamp,
      })),
    });
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

  // GET /api/admin/homepages – Liste aller aktuell aktiven Praxis-Homepages (homepage_mode:true).
  // Wird für das Admin-Widget "Aktive Homepages (temporär)" verwendet, damit klar ist,
  // welche Homepages noch online sind und ggf. deaktiviert werden sollten.
  if (pathParts[0] === 'admin' && pathParts[1] === 'homepages' && !pathParts[2]) {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const col = await getCollection('doctor_places');
    const list = await col.find(
      { homepage_mode: true, is_active: { $ne: false } },
      { projection: {
        _id: 0, id: 1, name: 1, slug: 1, city_slug: 1, city: 1, formatted_address: 1,
        phone_national: 1, homepage_slug: 1, homepage_generated_at: 1,
        rating: 1, user_rating_count: 1, gmb_verified: 1, gmb_claim_checked_at: 1,
        google_verification_token: 1,
      } },
    ).sort({ homepage_generated_at: 1 }).toArray(); // Älteste zuerst (dringlichste Deaktivierung)
    const now = Date.now();
    const items = list.map((d) => ({
      ...d,
      days_active: d.homepage_generated_at
        ? Math.floor((now - new Date(d.homepage_generated_at).getTime()) / (1000 * 60 * 60 * 24))
        : null,
    }));
    return json({ items, total: items.length });
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

  // GET /api/admin/doctors-no-website?show=unchecked|checked|all&city=&limit=&offset=&sort=city|reviews|rating|name
  if (pathParts[0] === 'admin' && pathParts[1] === 'doctors-no-website') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const show = params.get('show') || 'unchecked';
    const cityFilter = params.get('city') || '';
    const limit = Math.min(parseInt(params.get('limit') || '500', 10), 2000);
    const offset = Math.max(parseInt(params.get('offset') || '0', 10), 0);
    const sort = params.get('sort') || 'city';
    const col = await getCollection('doctor_places');
    const noWebsite = { $or: [{ website_url: { $exists: false } }, { website_url: null }, { website_url: '' }] };
    const notDiscarded = { is_active: { $ne: false } };
    let filter;
    if (show === 'discarded') filter = { ...noWebsite, is_active: false };
    else if (show === 'unchecked') filter = { ...noWebsite, ...notDiscarded, $and: [{ $or: [{ website_checked_at: { $exists: false } }, { website_checked_at: null }] }] };
    else if (show === 'checked') filter = { ...noWebsite, ...notDiscarded, website_checked_at: { $exists: true, $ne: null } };
    else filter = { ...noWebsite, ...notDiscarded };
    if (cityFilter) filter.city = cityFilter;
    // Managed-Score verwendet mehr Felder als die Standard-Projection.
    // Wir bringen die Felder mit rein und strippen sie nach dem Scoring wieder.
    const isManagedSort = sort === 'managed_asc' || sort === 'managed_desc';
    const projection = {
      _id: 0, id: 1, name: 1, slug: 1, city: 1, city_slug: 1, formatted_address: 1, phone_national: 1,
      specialty_guess: 1, google_place_id: 1, google_maps_url: 1, website_checked_at: 1, is_active: 1,
      discarded_at: 1, rating: 1, user_rating_count: 1, is_verified: 1, verification_method: 1, homepage_mode: 1,
      // Felder f\u00fcr Managed-Score:
      regular_opening_hours: 1, opening_hours_json: 1, current_opening_hours: 1,
      accessibility_options: 1, parking_options: 1, payment_options: 1,
      primary_type: 1, external_primary_type: 1, types: 1, external_types: 1,
      // Outscraper Claim-Check Felder:
      gmb_verified: 1, gmb_owner_id: 1, gmb_owner_title: 1, gmb_claim_checked_at: 1, gmb_claim_check_status: 1,
    };
    // DB-native Sortier-Modi
    const sortMap = {
      city: { city: 1, name: 1 },
      reviews: { user_rating_count: -1, rating: -1, name: 1 },
      rating: { rating: -1, user_rating_count: -1, name: 1 },
      name: { name: 1 },
      // Unclaimed-Sales-Priorität: nur unclaimed, sortiert nach Bewertung DESC (Sales-Ranking)
      unclaimed_rating_desc: { rating: -1, user_rating_count: -1, name: 1 },
    };
    // Sonderfall: unclaimed_rating_desc filtert zusätzlich auf nicht-verifizierte Einträge
    if (sort === 'unclaimed_rating_desc') {
      filter.gmb_verified = false;
    }
    // Bei Managed-Sortierung: DB unsortiert holen, im Speicher scoren + sortieren, danach paginate.
    // Bei Standard-Sortierung: nutze DB-Sort mit skip/limit.
    let list, matchCount;
    if (isManagedSort) {
      // Alle passenden Dokumente holen (max 5000, sollte f\u00fcr alle Setups reichen)
      const { computeManagedScore } = await import('@/lib/managedScore');
      const allDocs = await col.find(filter, { projection }).limit(5000).toArray();
      const scored = allDocs.map((d) => {
        const s = computeManagedScore(d);
        return { ...d, managed_score: s.score, managed_likelihood: s.likelihood, managed_signals: s.signals };
      });
      scored.sort((a, b) => {
        if (sort === 'managed_asc') return a.managed_score - b.managed_score || (a.city || '').localeCompare(b.city || '', 'de');
        return b.managed_score - a.managed_score || (b.user_rating_count || 0) - (a.user_rating_count || 0);
      });
      matchCount = scored.length;
      list = scored.slice(offset, offset + limit);
    } else {
      const sortSpec = sortMap[sort] || sortMap.city;
      const [rawList, count] = await Promise.all([
        col.find(filter, { projection }).sort(sortSpec).skip(offset).limit(limit).toArray(),
        col.countDocuments(filter),
      ]);
      // Score trotzdem berechnen, damit UI ihn immer anzeigen kann
      const { computeManagedScore } = await import('@/lib/managedScore');
      list = rawList.map((d) => {
        const s = computeManagedScore(d);
        return { ...d, managed_score: s.score, managed_likelihood: s.likelihood, managed_signals: s.signals };
      });
      matchCount = count;
    }

    // Score-Compute-Felder aus finaler Ausgabe entfernen (Rohdaten nicht ans UI leaken)
    const trimFields = ['regular_opening_hours', 'opening_hours_json', 'current_opening_hours', 'accessibility_options', 'parking_options', 'payment_options', 'external_primary_type', 'external_types'];
    list = list.map((d) => {
      const clean = { ...d };
      trimFields.forEach((f) => delete clean[f]);
      return clean;
    });

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

  // GET /api/admin/export – vollständigen doctor_places Dump als JSON zum Download.
  // Streaming-Variante: läuft mit konstantem Speicher (~2-5 MB), egal wie viele Praxen.
  if (pathParts[0] === 'admin' && pathParts[1] === 'export') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const col = await getCollection('doctor_places');
    const count = await col.countDocuments();
    const filename = `navoria-export-${new Date().toISOString().slice(0, 10)}.json`;
    const cursor = col.find({}, { projection: { _id: 0 } });
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const header = `{"exported_at":"${new Date().toISOString()}","source":"navoria","count":${count},"doctors":[`;
          controller.enqueue(encoder.encode(header));
          let first = true;
          for await (const doc of cursor) {
            const chunk = (first ? '' : ',') + JSON.stringify(doc);
            controller.enqueue(encoder.encode(chunk));
            first = false;
          }
          controller.enqueue(encoder.encode(']}'));
          controller.close();
        } catch (e) {
          try { controller.error(e); } catch (_) {}
        } finally {
          try { await cursor.close(); } catch (_) {}
        }
      },
      cancel() {
        try { cursor.close(); } catch (_) {}
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  }

  // GET /api/admin/claim-requests?status=new|approved|rejected|all&limit=50
  if (pathParts[0] === 'admin' && pathParts[1] === 'claim-requests' && !pathParts[2]) {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'all';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10), 500);
    const filter = status === 'all' ? {} : { status };
    const col = await getCollection('claim_requests');
    const items = await col.find(filter).sort({ created_at: -1 }).limit(limit).toArray();
    const counts = await col.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]).toArray();
    const countsMap = counts.reduce((m, c) => { m[c._id] = c.count; return m; }, {});
    return json({
      items: items.map((it) => ({ ...it, _id: undefined })),
      counts: {
        new: countsMap.new || 0,
        approved: countsMap.approved || 0,
        rejected: countsMap.rejected || 0,
        total: items.length,
      },
    });
  }

  // GET /api/admin/analytics/live – Aktive Nutzer:innen der letzten 5 Minuten
  if (pathParts[0] === 'admin' && pathParts[1] === 'analytics' && pathParts[2] === 'live') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const since = new Date(Date.now() - 5 * 60 * 1000);
    const col = await getCollection('page_views');
    // Neueste Aktivität je Session
    const rows = await col.aggregate([
      { $match: { timestamp: { $gte: since }, is_bot: { $ne: true } } },
      { $sort: { timestamp: -1 } },
      { $group: {
        _id: '$session_id',
        lastPath: { $first: '$path' },
        lastAt: { $first: '$timestamp' },
        city: { $first: '$city' },
        country: { $first: '$country' },
        region: { $first: '$region' },
        device: { $first: '$device_type' },
        browser: { $first: '$browser' },
        pageviews: { $sum: 1 },
      } },
      { $sort: { lastAt: -1 } },
      { $limit: 200 },
    ]).toArray();

    return json({
      active_sessions: rows.length,
      window_minutes: 5,
      users: rows.map((r) => ({
        session_id: r._id ? r._id.slice(0, 8) : null,
        last_path: r.lastPath,
        last_at: r.lastAt,
        city: r.city,
        country: r.country,
        region: r.region,
        device: r.device,
        browser: r.browser,
        pageviews_in_window: r.pageviews,
      })),
    });
  }

  // GET /api/admin/bots?range=today|7d|30d
  // Detaillierte Bot-Aufschlüsselung aus SERVER-SIDE Log (server_hits Collection).
  // Erfasst auch Non-JS-Bots (Yandex, MJ12Bot, Bytespider etc.), die im Client-Tracker fehlen.
  if (pathParts[0] === 'admin' && pathParts[1] === 'bots' && !pathParts[2]) {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const col = await getCollection('server_hits');
    const range = (url.searchParams.get('range') || 'today').toLowerCase();

    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    let from;
    if (range === '7d') from = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000);
    else if (range === '30d') from = new Date(todayStart.getTime() - 29 * 24 * 60 * 60 * 1000);
    else from = todayStart;
    const to = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const baseMatch = { timestamp: { $gte: from, $lt: to }, is_bot: true };

    // Gesamt-Zahlen
    const [totalRow] = await col.aggregate([
      { $match: baseMatch },
      { $group: { _id: null, total: { $sum: 1 }, uniquePaths: { $addToSet: '$path' } } },
      { $project: { total: 1, unique_paths: { $size: '$uniquePaths' }, _id: 0 } },
    ]).toArray();

    // Aufschlüsselung pro Bot
    const bots = await col.aggregate([
      { $match: baseMatch },
      { $group: {
        _id: { $ifNull: ['$bot_name', 'other'] },
        hits: { $sum: 1 },
        first_seen: { $min: '$timestamp' },
        last_seen: { $max: '$timestamp' },
        unique_paths: { $addToSet: '$path' },
      } },
      { $project: {
        bot: '$_id',
        hits: 1,
        first_seen: 1,
        last_seen: 1,
        paths_count: { $size: '$unique_paths' },
        _id: 0,
      } },
      { $sort: { hits: -1 } },
    ]).toArray();

    // Für jeden Bot: Top-Pfade + Stundenverlauf (letzte 24h) parallel laden
    const enriched = await Promise.all(bots.map(async (b) => {
      const botName = b.bot;
      const botMatch = { ...baseMatch, bot_name: botName === 'other' ? { $in: [null, 'other'] } : botName };

      const [topPaths, hourly] = await Promise.all([
        col.aggregate([
          { $match: botMatch },
          { $group: { _id: '$path', hits: { $sum: 1 } } },
          { $project: { path: '$_id', hits: 1, _id: 0 } },
          { $sort: { hits: -1 } },
          { $limit: 10 },
        ]).toArray(),
        col.aggregate([
          { $match: { ...botMatch, timestamp: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } } },
          { $group: {
            _id: { $dateToString: { format: '%Y-%m-%d %H:00', date: '$timestamp', timezone: 'UTC' } },
            hits: { $sum: 1 },
          } },
          { $project: { bucket: '$_id', hits: 1, _id: 0 } },
          { $sort: { bucket: 1 } },
        ]).toArray(),
      ]);

      return { ...b, top_paths: topPaths, hourly };
    }));

    // Aggregierter Stundenverlauf ALLER Bots (für Top-Chart)
    const hourlyAll = await col.aggregate([
      { $match: { ...baseMatch, timestamp: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d %H:00', date: '$timestamp', timezone: 'UTC' } },
        hits: { $sum: 1 },
      } },
      { $project: { bucket: '$_id', hits: 1, _id: 0 } },
      { $sort: { bucket: 1 } },
    ]).toArray();

    return json({
      range,
      window: { from: from.toISOString(), to: to.toISOString() },
      totals: {
        hits: totalRow?.total || 0,
        unique_paths: totalRow?.unique_paths || 0,
        distinct_bots: enriched.length,
      },
      bots: enriched,
      hourly_all: hourlyAll,
      generated_at: new Date().toISOString(),
    });
  }

  // GET /api/admin/analytics/summary?range=today|yesterday|7d|30d
  if (pathParts[0] === 'admin' && pathParts[1] === 'analytics' && pathParts[2] === 'summary') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const col = await getCollection('page_views');

    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysStart = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000);

    async function bucketStats(from, to) {
      const match = { timestamp: { $gte: from, $lt: to }, is_bot: { $ne: true } };
      const [tot] = await col.aggregate([
        { $match: match },
        { $group: { _id: null, pv: { $sum: 1 }, sessions: { $addToSet: '$session_id' } } },
        { $project: { pv: 1, sessions: { $size: '$sessions' } } },
      ]).toArray();
      return { pageviews: tot?.pv || 0, sessions: tot?.sessions || 0 };
    }

    // Bounce Rate: Anteil Sessions mit nur 1 Pageview.
    // Klassische Definition — passt gut zu unserem First-Party-Tracking.
    async function bounceStats(from, to) {
      const [r] = await col.aggregate([
        { $match: { timestamp: { $gte: from, $lt: to }, is_bot: { $ne: true } } },
        { $group: { _id: '$session_id', pv_count: { $sum: 1 } } },
        { $group: {
          _id: null,
          total_sessions: { $sum: 1 },
          bounced_sessions: { $sum: { $cond: [{ $eq: ['$pv_count', 1] }, 1, 0] } },
          multi_page_sessions: { $sum: { $cond: [{ $gte: ['$pv_count', 2] }, 1, 0] } },
          total_pv: { $sum: '$pv_count' },
        } },
      ]).toArray();
      const total = r?.total_sessions || 0;
      const bounced = r?.bounced_sessions || 0;
      return {
        total_sessions: total,
        bounced_sessions: bounced,
        multi_page_sessions: r?.multi_page_sessions || 0,
        pages_per_session: total > 0 ? Math.round((r.total_pv / total) * 100) / 100 : 0,
        bounce_rate_percent: total > 0 ? Math.round((bounced / total) * 1000) / 10 : 0,
      };
    }

    // Average Time on Page via $setWindowFields — Delta zwischen aufeinanderfolgenden
    // Pageviews derselben Session, gekappt bei 30 Min gegen Ausreißer (Tab offen gelassen).
    async function avgTimeOnPage(from, to) {
      const pipeline = [
        { $match: { timestamp: { $gte: from, $lt: to }, is_bot: { $ne: true } } },
        { $sort: { session_id: 1, timestamp: 1 } },
        { $setWindowFields: {
          partitionBy: '$session_id',
          sortBy: { timestamp: 1 },
          output: { next_ts: { $shift: { output: '$timestamp', by: 1, default: null } } },
        } },
        { $match: { next_ts: { $ne: null } } },
        { $project: { delta_ms: { $subtract: ['$next_ts', '$timestamp'] } } },
        { $match: { delta_ms: { $gte: 0, $lte: 30 * 60 * 1000 } } }, // 0..30min
        { $group: { _id: null, avg_ms: { $avg: '$delta_ms' }, samples: { $sum: 1 } } },
      ];
      try {
        const [r] = await col.aggregate(pipeline, { allowDiskUse: true }).toArray();
        return {
          avg_time_on_page_seconds: r?.avg_ms ? Math.round(r.avg_ms / 1000) : 0,
          samples: r?.samples || 0,
        };
      } catch {
        // Fallback (ältere MongoDB ohne $setWindowFields): Session-Dauer / (pv - 1)
        return { avg_time_on_page_seconds: 0, samples: 0 };
      }
    }

    // Average Session Duration (Sekunden, für Multi-Pageview-Sessions).
    async function avgSessionDuration(from, to) {
      const [r] = await col.aggregate([
        { $match: { timestamp: { $gte: from, $lt: to }, is_bot: { $ne: true } } },
        { $group: {
          _id: '$session_id',
          first: { $min: '$timestamp' },
          last: { $max: '$timestamp' },
          pv: { $sum: 1 },
        } },
        { $match: { pv: { $gte: 2 } } },
        { $project: { duration_ms: { $subtract: ['$last', '$first'] } } },
        { $match: { duration_ms: { $lte: 60 * 60 * 1000 } } }, // <=1h cap
        { $group: { _id: null, avg_ms: { $avg: '$duration_ms' }, samples: { $sum: 1 } } },
      ]).toArray();
      return {
        avg_session_duration_seconds: r?.avg_ms ? Math.round(r.avg_ms / 1000) : 0,
        samples: r?.samples || 0,
      };
    }

    async function botCount(from, to) {
      return col.countDocuments({ timestamp: { $gte: from, $lt: to }, is_bot: true });
    }

    // Top Bounce-Paths: Pfade mit höchster Bounce-Rate (Sessions die auf diesem Pfad
    // gestartet UND geendet haben). Nur Pfade mit min 10 Sessions.
    async function topBouncePaths(from, to, limit = 20) {
      const pipeline = [
        { $match: { timestamp: { $gte: from, $lt: to }, is_bot: { $ne: true } } },
        // Session-Aggregation: erster/letzter Path pro Session
        { $sort: { session_id: 1, timestamp: 1 } },
        { $group: {
          _id: '$session_id',
          pv_count: { $sum: 1 },
          first_path: { $first: '$path' },
        } },
        { $group: {
          _id: '$first_path',
          sessions: { $sum: 1 },
          bounces: { $sum: { $cond: [{ $eq: ['$pv_count', 1] }, 1, 0] } },
        } },
        { $match: { sessions: { $gte: 10 } } },
        { $project: {
          path: '$_id',
          sessions: 1,
          bounces: 1,
          bounce_rate: { $multiply: [{ $divide: ['$bounces', '$sessions'] }, 100] },
          _id: 0,
        } },
        { $sort: { bounce_rate: -1, sessions: -1 } },
        { $limit: limit },
      ];
      return col.aggregate(pipeline, { allowDiskUse: true }).toArray();
    }

    // Top Time-on-Page Paths: Welche Pfade halten Nutzer:innen am längsten?
    async function topTimeOnPage(from, to, limit = 20) {
      try {
        const pipeline = [
          { $match: { timestamp: { $gte: from, $lt: to }, is_bot: { $ne: true } } },
          { $sort: { session_id: 1, timestamp: 1 } },
          { $setWindowFields: {
            partitionBy: '$session_id',
            sortBy: { timestamp: 1 },
            output: { next_ts: { $shift: { output: '$timestamp', by: 1, default: null } } },
          } },
          { $match: { next_ts: { $ne: null } } },
          { $project: {
            path: 1,
            delta_ms: { $subtract: ['$next_ts', '$timestamp'] },
          } },
          { $match: { delta_ms: { $gte: 0, $lte: 30 * 60 * 1000 } } },
          { $group: { _id: '$path', avg_ms: { $avg: '$delta_ms' }, samples: { $sum: 1 } } },
          { $match: { samples: { $gte: 5 } } },
          { $project: {
            path: '$_id',
            avg_time_seconds: { $round: [{ $divide: ['$avg_ms', 1000] }, 0] },
            samples: 1,
            _id: 0,
          } },
          { $sort: { avg_time_seconds: -1 } },
          { $limit: limit },
        ];
        return await col.aggregate(pipeline, { allowDiskUse: true }).toArray();
      } catch {
        return [];
      }
    }

    async function topPaths(from, to, limit = 50) {
      return col.aggregate([
        { $match: { timestamp: { $gte: from, $lt: to }, is_bot: { $ne: true } } },
        { $group: { _id: '$path', views: { $sum: 1 }, sessions: { $addToSet: '$session_id' } } },
        { $project: { path: '$_id', views: 1, uniques: { $size: '$sessions' }, _id: 0 } },
        { $sort: { views: -1 } },
        { $limit: limit },
      ]).toArray();
    }

    // Top-Städte aus dem Directory: paths /aerzte/{stadt}[/...] und /praxis/{stadt}[/...]
    // Ausgeschlossen: /aerzte/fachrichtung, /aerzte/bundesland, /aerzte/stadtteil
    async function topDirectoryCities(from, to, limit = 50) {
      return col.aggregate([
        {
          $match: {
            timestamp: { $gte: from, $lt: to },
            is_bot: { $ne: true },
            path: { $regex: /^\/(aerzte|praxis)\/[a-z0-9][a-z0-9-]+/ },
          },
        },
        { $addFields: { segments: { $split: ['$path', '/'] } } },
        { $addFields: { city_slug: { $arrayElemAt: ['$segments', 2] } } },
        {
          $match: {
            city_slug: { $nin: [null, '', 'fachrichtung', 'bundesland', 'stadtteil', 'praxis-beanspruchen'] },
          },
        },
        {
          $group: {
            _id: '$city_slug',
            views: { $sum: 1 },
            sessions: { $addToSet: '$session_id' },
          },
        },
        { $project: { city_slug: '$_id', views: 1, uniques: { $size: '$sessions' }, _id: 0 } },
        { $sort: { views: -1 } },
        { $limit: limit },
      ]).toArray();
    }

    // Top-Fachrichtungen: paths /aerzte/fachrichtung/{slug} (Pillar) und /aerzte/{stadt}/{slug} (Stadt+Fach)
    async function topDirectorySpecialties(from, to, limit = 50) {
      return col.aggregate([
        {
          $match: {
            timestamp: { $gte: from, $lt: to },
            is_bot: { $ne: true },
            path: { $regex: /^\/aerzte\/[^/]+\/[^/]+/ },
          },
        },
        { $addFields: { segments: { $split: ['$path', '/'] } } },
        {
          $addFields: {
            seg2: { $arrayElemAt: ['$segments', 2] },
            seg3: { $arrayElemAt: ['$segments', 3] },
          },
        },
        {
          $addFields: {
            spec_slug: {
              $switch: {
                branches: [
                  // /aerzte/fachrichtung/{slug} → seg3
                  { case: { $eq: ['$seg2', 'fachrichtung'] }, then: '$seg3' },
                  // /aerzte/{stadt}/{fach} → seg3, ausschließen wenn seg2 ein Meta-Slug ist
                  {
                    case: {
                      $not: { $in: ['$seg2', ['fachrichtung', 'bundesland', 'stadtteil', 'praxis-beanspruchen']] },
                    },
                    then: '$seg3',
                  },
                ],
                default: null,
              },
            },
          },
        },
        { $match: { spec_slug: { $nin: [null, ''] } } },
        {
          $group: {
            _id: '$spec_slug',
            views: { $sum: 1 },
            sessions: { $addToSet: '$session_id' },
          },
        },
        { $project: { spec_slug: '$_id', views: 1, uniques: { $size: '$sessions' }, _id: 0 } },
        { $sort: { views: -1 } },
        { $limit: limit },
      ]).toArray();
    }

    async function topCities(from, to, limit = 10) {
      return col.aggregate([
        { $match: { timestamp: { $gte: from, $lt: to }, is_bot: { $ne: true }, city: { $nin: [null, ''] } } },
        { $group: { _id: { city: '$city', country: '$country' }, sessions: { $addToSet: '$session_id' } } },
        { $project: { city: '$_id.city', country: '$_id.country', uniques: { $size: '$sessions' }, _id: 0 } },
        { $sort: { uniques: -1 } },
        { $limit: limit },
      ]).toArray();
    }

    async function topCountries(from, to, limit = 10) {
      return col.aggregate([
        { $match: { timestamp: { $gte: from, $lt: to }, is_bot: { $ne: true }, country: { $nin: [null, ''] } } },
        { $group: { _id: '$country', sessions: { $addToSet: '$session_id' } } },
        { $project: { country: '$_id', uniques: { $size: '$sessions' }, _id: 0 } },
        { $sort: { uniques: -1 } },
        { $limit: limit },
      ]).toArray();
    }

    async function devices(from, to) {
      return col.aggregate([
        { $match: { timestamp: { $gte: from, $lt: to }, is_bot: { $ne: true } } },
        { $group: { _id: '$device_type', sessions: { $addToSet: '$session_id' } } },
        { $project: { device: '$_id', uniques: { $size: '$sessions' }, _id: 0 } },
      ]).toArray();
    }

    async function topBots(from, to, limit = 8) {
      return col.aggregate([
        { $match: { timestamp: { $gte: from, $lt: to }, is_bot: true } },
        { $group: { _id: '$bot_name', hits: { $sum: 1 } } },
        { $project: { bot: '$_id', hits: 1, _id: 0 } },
        { $sort: { hits: -1 } },
        { $limit: limit },
      ]).toArray();
    }

    async function hourly(from, to) {
      return col.aggregate([
        { $match: { timestamp: { $gte: from, $lt: to }, is_bot: { $ne: true } } },
        { $group: {
          _id: { hour: { $hour: '$timestamp' } },
          pv: { $sum: 1 },
          sessions: { $addToSet: '$session_id' },
        } },
        { $project: { hour: '$_id.hour', pv: 1, uniques: { $size: '$sessions' }, _id: 0 } },
        { $sort: { hour: 1 } },
      ]).toArray();
    }

    const dayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const [
      today, yesterday, last7,
      todayBots, yesterdayBots,
      topPathsToday, topCitiesToday, topCountriesToday,
      devicesToday, topBotsToday, hourlyToday, hourlyYesterday,
      topDirectoryCitiesToday, topDirectorySpecialtiesToday,
      bounceToday, bounceYesterday, bounce7d,
      timeOnPageToday, timeOnPageYesterday, timeOnPage7d,
      sessionDurToday, sessionDur7d,
      topBounceToday, topTimeToday,
    ] = await Promise.all([
      bucketStats(todayStart, dayEnd),
      bucketStats(yesterdayStart, todayStart),
      bucketStats(sevenDaysStart, dayEnd),
      botCount(todayStart, dayEnd),
      botCount(yesterdayStart, todayStart),
      topPaths(todayStart, dayEnd, 50),
      topCities(todayStart, dayEnd),
      topCountries(todayStart, dayEnd),
      devices(todayStart, dayEnd),
      topBots(todayStart, dayEnd),
      hourly(todayStart, dayEnd),
      hourly(yesterdayStart, todayStart),
      topDirectoryCities(todayStart, dayEnd, 50),
      topDirectorySpecialties(todayStart, dayEnd, 50),
      bounceStats(todayStart, dayEnd),
      bounceStats(yesterdayStart, todayStart),
      bounceStats(sevenDaysStart, dayEnd),
      avgTimeOnPage(todayStart, dayEnd),
      avgTimeOnPage(yesterdayStart, todayStart),
      avgTimeOnPage(sevenDaysStart, dayEnd),
      avgSessionDuration(todayStart, dayEnd),
      avgSessionDuration(sevenDaysStart, dayEnd),
      topBouncePaths(sevenDaysStart, dayEnd, 15),
      topTimeOnPage(sevenDaysStart, dayEnd, 15),
    ]);

    return json({
      today: {
        ...today,
        bots: todayBots,
        hourly: hourlyToday,
        bounce_rate_percent: bounceToday.bounce_rate_percent,
        pages_per_session: bounceToday.pages_per_session,
        avg_time_on_page_seconds: timeOnPageToday.avg_time_on_page_seconds,
        avg_session_duration_seconds: sessionDurToday.avg_session_duration_seconds,
      },
      yesterday: {
        ...yesterday,
        bots: yesterdayBots,
        hourly: hourlyYesterday,
        bounce_rate_percent: bounceYesterday.bounce_rate_percent,
        pages_per_session: bounceYesterday.pages_per_session,
        avg_time_on_page_seconds: timeOnPageYesterday.avg_time_on_page_seconds,
      },
      last_7_days: {
        ...last7,
        bounce_rate_percent: bounce7d.bounce_rate_percent,
        pages_per_session: bounce7d.pages_per_session,
        avg_time_on_page_seconds: timeOnPage7d.avg_time_on_page_seconds,
        avg_session_duration_seconds: sessionDur7d.avg_session_duration_seconds,
      },
      top_paths_today: topPathsToday,
      top_cities_today: topCitiesToday,
      top_countries_today: topCountriesToday,
      devices_today: devicesToday,
      top_bots_today: topBotsToday,
      top_directory_cities_today: topDirectoryCitiesToday,
      top_directory_specialties_today: topDirectorySpecialtiesToday,
      top_bounce_paths_7d: topBounceToday,
      top_time_on_page_paths_7d: topTimeToday,
      generated_at: new Date().toISOString(),
    });
  }

  return json({ error: 'Not found' }, { status: 404 });
}

async function handlePost(request, pathParts) {
  // POST /api/claim-requests – öffentlich, mit Rate-Limit (max 3/h pro IP)
  if (pathParts[0] === 'claim-requests' && !pathParts[1]) {
    let body = {};
    try { body = await request.json(); } catch { body = {}; }

    const email = String(body.email || '').trim().toLowerCase();
    const firstName = String(body.first_name || '').trim();
    const lastName = String(body.last_name || '').trim();
    const doctorName = String(body.doctor_name || '').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Ungültige E-Mail' }, { status: 400 });
    if (!firstName || !lastName) return json({ error: 'Vor- und Nachname erforderlich' }, { status: 400 });
    if (!doctorName && !body.doctor_id) return json({ error: 'Praxisname erforderlich' }, { status: 400 });
    if (body.agree !== true) return json({ error: 'Einwilligung fehlt' }, { status: 400 });

    // Simples Anti-Spam: max 3 Anfragen pro IP-Hash in der letzten Stunde
    const ip = getClientIp(request);
    const ipHash = hashIp(ip);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const col = await getCollection('claim_requests');
    if (ipHash) {
      const recent = await col.countDocuments({ ip_hash: ipHash, created_at: { $gte: oneHourAgo } });
      if (recent >= 3) return json({ error: 'Rate-Limit: Bitte später erneut versuchen.' }, { status: 429 });
    }

    // Honeypot-artiger UA-Check: einfache Bots blockieren
    const ua = request.headers.get('user-agent') || '';
    if (isBot(ua)) return json({ ok: true, spam: true }); // silent-drop

    const doc = {
      id: uuidv4(),
      doctor_id: body.doctor_id || null,
      doctor_name: doctorName.slice(0, 200),
      doctor_city: String(body.doctor_city || '').trim().slice(0, 100) || null,
      role: ['inhaber', 'praxismanager', 'sonstige'].includes(body.role) ? body.role : 'sonstige',
      first_name: firstName.slice(0, 80),
      last_name: lastName.slice(0, 80),
      email: email.slice(0, 160),
      phone: String(body.phone || '').trim().slice(0, 40) || null,
      website: String(body.website || '').trim().slice(0, 200) || null,
      company_name: String(body.company_name || '').trim().slice(0, 160) || null,
      message: String(body.message || '').trim().slice(0, 1500) || null,
      ip_hash: ipHash,
      user_agent: ua.slice(0, 300),
      status: 'new',
      created_at: new Date(),
      updated_at: new Date(),
    };
    try { await col.createIndex({ created_at: -1 }); await col.createIndex({ status: 1 }); } catch {}
    await col.insertOne(doc);
    return json({ ok: true, id: doc.id });
  }

  // POST /api/track – First-Party Analytics (öffentlich, kein Auth)
  if (pathParts[0] === 'track' && !pathParts[1]) {
    let body = {};
    try { body = await request.json(); } catch { body = {}; }
    const path = typeof body.path === 'string' ? body.path.slice(0, 300) : null;
    if (!path) return json({ ok: false }, { status: 400 });
    // Kein Tracking von Admin-Routen und Track-Endpunkt
    if (path.startsWith('/admin') || path.startsWith('/api/')) return json({ ok: true, skipped: true });

    const ua = request.headers.get('user-agent') || '';
    const referrer = typeof body.referrer === 'string' ? body.referrer.slice(0, 300) : null;
    const bot = isBot(ua);
    const ip = getClientIp(request);
    const geo = getGeo(request);

    // 1st-party session_id cookie – strictly-necessary, kein Consent erforderlich
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/(?:^|; )navoria_sid=([^;]+)/);
    let sessionId = match ? match[1] : null;
    const setCookie = !sessionId;
    if (setCookie) sessionId = uuidv4();

    const doc = {
      id: uuidv4(),
      session_id: sessionId,
      path,
      referrer: referrer || null,
      ip_hash: hashIp(ip),
      country: geo.country,
      city: geo.city,
      region: geo.region,
      device_type: getDeviceType(ua),
      browser: getBrowserFamily(ua),
      screen: typeof body.screen === 'string' ? body.screen.slice(0, 20) : null,
      is_bot: bot,
      bot_name: bot ? (ua.match(/(googlebot|bingbot|gptbot|claudebot|perplexitybot|applebot|amazonbot|ccbot|semrushbot|ahrefsbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp)/i)?.[1]?.toLowerCase() || 'other') : null,
      timestamp: new Date(),
    };

    try {
      const col = await getCollection('page_views');
      // Best-effort Index setup (idempotent)
      try {
        await col.createIndex({ timestamp: -1 });
        await col.createIndex({ session_id: 1, timestamp: -1 });
        // TTL: 90 Tage
        await col.createIndex({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });
      } catch { /* Indexe können bereits existieren */ }
      await col.insertOne(doc);
    } catch (e) {
      // Tracking-Fehler dürfen niemals nach außen fallen
      return json({ ok: false }, { status: 200 });
    }

    const res = json({ ok: true });
    if (setCookie) {
      // 1 Jahr Session-ID, HttpOnly, SameSite=Lax
      res.headers.set('Set-Cookie', `navoria_sid=${sessionId}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
    }
    return res;
  }

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
  //
  //   Zusatz: Abhaken markiert die Praxis zusätzlich als "verifiziert/beansprucht"
  //   (is_verified:true, verification_method:'admin_no_website_check').
  //   Beim Zurücksetzen wird die Verifizierung nur entfernt, wenn sie ursprünglich
  //   über diesen Flow kam (nicht wenn ein echter Claim-Request approved wurde).
  if (pathParts[0] === 'admin' && pathParts[1] === 'doctors' && pathParts[2] && pathParts[3] === 'website-checked') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const { checked, website_url } = body || {};
    const doctors = await getCollection('doctor_places');
    const existing = await doctors.findOne({ id: pathParts[2] }, { projection: { verification_method: 1, is_verified: 1 } });
    if (!existing) return json({ error: 'Nicht gefunden' }, { status: 404 });

    const set = { updated_at: new Date() };
    const unset = {};

    if (checked) {
      const now = new Date();
      set.website_checked_at = now;
      // Zusätzlich als verifiziert/beansprucht markieren (redaktionell durch Admin)
      set.is_verified = true;
      set.verified_at = now;
      set.verification_method = 'admin_no_website_check';
    } else {
      set.website_checked_at = null;
      // Nur eigene Verifizierung zurücknehmen – Claim-Request-Verifizierungen unangetastet lassen
      if (existing.is_verified && existing.verification_method === 'admin_no_website_check') {
        set.is_verified = false;
        set.verified_at = null;
        unset.verification_method = '';
      }
    }

    if (website_url && typeof website_url === 'string' && website_url.trim().length > 0) {
      const url = website_url.trim().startsWith('http') ? website_url.trim() : `https://${website_url.trim()}`;
      set.website_url = url;
      set['manual_overrides.website_url'] = url;
    }

    const update = Object.keys(unset).length > 0 ? { $set: set, $unset: unset } : { $set: set };
    const res = await doctors.findOneAndUpdate({ id: pathParts[2] }, update, { returnDocument: 'after' });
    if (!res) return json({ error: 'Nicht gefunden' }, { status: 404 });
    return json({ ok: true, doctor: stripId(res) });
  }

  // POST /api/admin/doctors/:id/homepage – Homepage-Modus toggeln
  //   body: {
  //     enabled: true|false,
  //     mode_only?: boolean  // Wenn true: NUR homepage_mode togglen, Verifizierung/Website-check unangetastet
  //   }
  //   Standard-Verhalten (mode_only:false):
  //     enabled:true → Praxis wird als eigenständige One-Page-Website gerendert,
  //                    verification_method='navoria_homepage', is_verified=true, website_checked_at=now
  //     enabled:false → alles zurück (nur wenn eigenes verification_method)
  //   mode_only:true → nur homepage_mode ändern, sonst nichts.
  //     Wird verwendet für den "Zum Standard-Profil"-Button im Admin, wenn Admin nur
  //     die Darstellung wechseln will (Praxis bleibt "abgehakt" und verifiziert).
  if (pathParts[0] === 'admin' && pathParts[1] === 'doctors' && pathParts[2] && pathParts[3] === 'homepage') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const { enabled, mode_only, custom_slug } = body || {};
    const doctors = await getCollection('doctor_places');
    const now = new Date();
    const set = { updated_at: now };
    const unset = {};

    if (enabled) {
      set.homepage_mode = true;
      set.homepage_generated_at = now;
      // Root-Level Homepage-Slug generieren oder aus custom_slug übernehmen
      const { findFreeHomepageSlug, validateHomepageSlug } = await import('@/lib/homepageSlug');
      const existingDoc = await doctors.findOne({ id: pathParts[2] });
      if (!existingDoc) return json({ error: 'Nicht gefunden' }, { status: 404 });
      if (custom_slug) {
        const err = validateHomepageSlug(custom_slug);
        if (err) return json({ error: err }, { status: 400 });
        // Kollisionsprüfung (andere Praxis mit diesem Slug?)
        const taken = await doctors.findOne({ homepage_slug: custom_slug.trim().toLowerCase(), id: { $ne: pathParts[2] } });
        if (taken) return json({ error: `Slug "${custom_slug}" ist bereits an eine andere Praxis vergeben` }, { status: 409 });
        set.homepage_slug = custom_slug.trim().toLowerCase();
      } else if (!existingDoc.homepage_slug) {
        set.homepage_slug = await findFreeHomepageSlug(existingDoc, doctors);
      }
      if (!mode_only) {
        set.website_checked_at = now;
        set.is_verified = true;
        set.verified_at = now;
        set.verification_method = 'navoria_homepage';
      }
    } else {
      unset.homepage_mode = '';
      unset.homepage_generated_at = '';
      // homepage_slug bleibt bewusst ERHALTEN – so bleibt ein späterer Re-Toggle stabil (gleiche URL).
      if (!mode_only) {
        // Website-check + Verifizierung zurück (nur wenn wir sie gesetzt hatten)
        const existing = await doctors.findOne({ id: pathParts[2] }, { projection: { verification_method: 1 } });
        if (existing?.verification_method === 'navoria_homepage') {
          // WICHTIG: website_checked_at bewusst BEIBEHALTEN (auf now), damit die Praxis
          // nach Deaktivierung automatisch in der Sitemap landet. Der Admin hat die
          // Praxis manuell qualifiziert (durch das Aktivieren der Homepage). Beim
          // Zurückschalten auf das Standard-Profil soll dieser Prüfstatus erhalten
          // bleiben, damit das jetzt indexierbare Directory-Profil crawlbar wird.
          set.website_checked_at = now;
          set.is_verified = true;
          set.verified_at = now;
          set.verification_method = 'admin_no_website_check';
        }
      } else {
        // mode_only: wenn verification_method='navoria_homepage' war, auf editoriell umstellen,
        // damit die Verifizierung erhalten bleibt, aber semantisch stimmig ist.
        const existing = await doctors.findOne({ id: pathParts[2] }, { projection: { verification_method: 1 } });
        if (existing?.verification_method === 'navoria_homepage') {
          set.verification_method = 'admin_no_website_check';
        }
      }
    }

    const update = Object.keys(unset).length > 0 ? { $set: set, $unset: unset } : { $set: set };
    const res = await doctors.findOneAndUpdate({ id: pathParts[2] }, update, { returnDocument: 'after' });
    if (!res) return json({ error: 'Nicht gefunden' }, { status: 404 });
    return json({ ok: true, doctor: stripId(res) });
  }
  // POST /api/admin/doctors/:id/verification – setzt/entfernt einen Google-Search-Console-Token
  // (Meta-Tag: <meta name="google-site-verification" content="...">). Wird auf der
  // Homepage-Modus-Seite gerendert, damit die Praxis eine URL-Präfix-Property in ihrer
  // Search Console verifizieren kann.
  // Body: { google_verification_token: string | null }
  if (pathParts[0] === 'admin' && pathParts[1] === 'doctors' && pathParts[2] && pathParts[3] === 'verification') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const raw = body?.google_verification_token;
    const doctors = await getCollection('doctor_places');
    if (raw === null || raw === '' || raw === undefined) {
      // Token entfernen
      const r = await doctors.findOneAndUpdate(
        { id: pathParts[2] },
        { $unset: { google_verification_token: '' }, $set: { updated_at: new Date() } },
        { returnDocument: 'after' },
      );
      if (!r) return json({ error: 'Nicht gefunden' }, { status: 404 });
      return json({ ok: true, google_verification_token: null });
    }
    // Basic Sanity-Check: Alphanumerisch, Bindestriche, Unterstriche; max 200 Zeichen.
    // Google-Tokens sehen aus wie: "abcDEF123_-xyz…" (43 Zeichen Base64-ähnlich).
    const trimmed = String(raw).trim();
    if (trimmed.length < 10 || trimmed.length > 200 || !/^[A-Za-z0-9_\-]+$/.test(trimmed)) {
      return json({ error: 'Ungültiger Token (nur A-Z, a-z, 0-9, _, -; 10-200 Zeichen)' }, { status: 400 });
    }
    const r = await doctors.findOneAndUpdate(
      { id: pathParts[2] },
      { $set: { google_verification_token: trimmed, updated_at: new Date() } },
      { returnDocument: 'after' },
    );
    if (!r) return json({ error: 'Nicht gefunden' }, { status: 404 });
    return json({ ok: true, google_verification_token: trimmed });
  }

  // Body: { ids?: [uuid, ...], all?: boolean }
  //   ids: gezielt bestimmte Praxen (Standard-Fall im Admin-UI)
  //   all: TRUE → deaktiviert ALLE aktiven Homepages (Notfall-Fallback)
  // Die homepage_slug bleibt erhalten → Root-URL redirected automatisch auf Verzeichnis-Eintrag.
  // Falls verification_method='navoria_homepage' war, wird sie auf 'admin_no_website_check'
  // umgestellt, damit die Verifizierung erhalten bleibt.
  if (pathParts[0] === 'admin' && pathParts[1] === 'homepages' && pathParts[2] === 'bulk-deactivate') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const { ids, all } = body || {};
    const doctors = await getCollection('doctor_places');
    let filter;
    if (all === true) {
      filter = { homepage_mode: true };
    } else if (Array.isArray(ids) && ids.length > 0) {
      if (ids.length > 5000) return json({ error: 'Zu viele Einträge (>5000)' }, { status: 400 });
      filter = { id: { $in: ids }, homepage_mode: true };
    } else {
      return json({ error: 'ids[] oder all:true erforderlich' }, { status: 400 });
    }

    // Verification-Method-Umstellung: navoria_homepage → admin_no_website_check (falls vorhanden)
    await doctors.updateMany(
      { ...filter, verification_method: 'navoria_homepage' },
      { $set: { verification_method: 'admin_no_website_check', updated_at: new Date() } },
    );
    // Eigentliche Deaktivierung
    const res = await doctors.updateMany(
      filter,
      {
        $set: { updated_at: new Date() },
        $unset: { homepage_mode: '', homepage_generated_at: '' },
      },
    );
    return json({ ok: true, matched: res.matchedCount, modified: res.modifiedCount });
  }

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

  // POST /api/admin/claim-check – Prüft via Outscraper API den Claim-Status von Praxen OHNE Website.
  // Body: { limit?: number (default 100, max 500), only_stale?: boolean (nur nicht/länger nicht geprüfte) }
  // Antwort: { checked, claimed, unclaimed, errors, cost_estimate_usd, batches }
  // WICHTIG: Nur Praxen ohne Website werden geprüft (Kostenkontrolle).
  if (pathParts[0] === 'admin' && pathParts[1] === 'claim-check') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    if (!process.env.OUTSCRAPER_API_KEY) {
      return json({ error: 'OUTSCRAPER_API_KEY nicht konfiguriert' }, { status: 500 });
    }
    const limitInput = Math.max(1, Math.min(parseInt(body?.limit || '100', 10) || 100, 500));
    const onlyStale = body?.only_stale !== false; // Standard: true → nur nicht/länger nicht geprüfte

    const { checkClaimStatusBatch, sleep } = await import('@/lib/outscraperClaim');
    const doctors = await getCollection('doctor_places');

    // Basis-Filter: Praxen ohne Website, aktiv, mit google_place_id
    const baseFilter = {
      $or: [{ website_url: { $exists: false } }, { website_url: null }, { website_url: '' }],
      is_active: { $ne: false },
      google_place_id: { $exists: true, $ne: null, $ne: '' },
    };

    // Nur "stale" (nie geprüft ODER älter als 90 Tage) — Standard
    if (onlyStale) {
      const staleDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      baseFilter.$and = [
        { $or: [
          { gmb_claim_checked_at: { $exists: false } },
          { gmb_claim_checked_at: null },
          { gmb_claim_checked_at: { $lt: staleDate } },
        ] },
      ];
    }

    // Kandidaten laden (mit hoher Bewertungsanzahl priorisiert = Sales-Priority)
    const candidates = await doctors.find(baseFilter, {
      projection: { _id: 0, id: 1, google_place_id: 1, name: 1 },
    }).sort({ user_rating_count: -1, rating: -1 }).limit(limitInput).toArray();

    if (candidates.length === 0) {
      return json({ ok: true, checked: 0, claimed: 0, unclaimed: 0, errors: 0, cost_estimate_usd: 0, batches: 0, message: 'Keine Kandidaten gefunden.' });
    }

    // Batch-Größe: 5 place_ids pro Outscraper-Request (kleinerer Batch = schnellere Antwortzeiten)
    const BATCH_SIZE = 5;
    const DELAY_MS = 200; // 200ms Pause zwischen Batches
    // Zeit-Budget: Vercel Serverless-Function hat maxDuration=60s. Wir stoppen neue Batches
    // nach 45s, damit die Response garantiert vor dem Kill zurückgehen kann.
    const TIME_BUDGET_MS = 45000;
    const startedAt = Date.now();
    let checked = 0, claimed = 0, unclaimed = 0, errors = 0, batches = 0, aborted = false;

    for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
      // Time-Budget-Check: wenn wir bald das Function-Timeout treffen, brechen wir sauber ab
      // und geben die bisherigen Ergebnisse zurück (partial=true).
      if (Date.now() - startedAt > TIME_BUDGET_MS) {
        aborted = true;
        break;
      }
      const batch = candidates.slice(i, i + BATCH_SIZE);
      const placeIds = batch.map((c) => c.google_place_id);
      const results = await checkClaimStatusBatch(placeIds);
      batches += 1;

      // Ergebnisse in DB schreiben (bulk write)
      const bulkOps = [];
      const now = new Date();
      for (let j = 0; j < batch.length; j++) {
        const cand = batch[j];
        const r = results[j] || {};
        const setFields = {
          gmb_claim_checked_at: now,
          gmb_claim_check_status: r.error ? 'error' : 'success',
          updated_at: now,
        };
        if (r.error) {
          setFields.gmb_claim_check_error = String(r.error).slice(0, 200);
          errors += 1;
        } else {
          setFields.gmb_verified = r.verified;
          setFields.gmb_owner_id = r.owner_id || null;
          setFields.gmb_owner_title = r.owner_title || null;
          setFields.gmb_claim_check_error = null;
          checked += 1;
          if (r.verified === true) claimed += 1;
          else if (r.verified === false) unclaimed += 1;
        }
        bulkOps.push({ updateOne: { filter: { id: cand.id }, update: { $set: setFields } } });
      }
      if (bulkOps.length) await doctors.bulkWrite(bulkOps);

      // Delay zwischen Batches (schont API + Rate Limits)
      if (i + BATCH_SIZE < candidates.length) await sleep(DELAY_MS);
    }

    // Kosten-Schätzung (Outscraper ~$0.001 pro Query)
    const costEstimate = (checked + errors) * 0.001;
    const elapsedMs = Date.now() - startedAt;

    return json({
      ok: true,
      checked: checked + errors,
      claimed,
      unclaimed,
      errors,
      batches,
      cost_estimate_usd: Number(costEstimate.toFixed(3)),
      total_candidates_scanned: candidates.length,
      partial: aborted,
      elapsed_ms: elapsedMs,
      remaining_candidates: aborted ? Math.max(0, candidates.length - (checked + errors)) : 0,
    });
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
  //   body: {
  //     cities: string[],
  //     specialtySlugs: string[],
  //     maxPerQuery?: number,
  //     filterNoWebsiteOnly?: boolean,
  //     name?: string
  //   }
  if (pathParts[0] === 'admin' && pathParts[1] === 'campaigns') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const { cities, specialtySlugs, maxPerQuery, filterNoWebsiteOnly, name } = body;
    if (!Array.isArray(cities) || cities.length === 0) return json({ error: 'Keine Städte ausgewählt' }, { status: 400 });
    if (!Array.isArray(specialtySlugs) || specialtySlugs.length === 0) return json({ error: 'Keine Fachrichtungen ausgewählt' }, { status: 400 });
    try {
      const { createCampaign } = await import('@/lib/services/campaignWorker');
      const campaign = await createCampaign({
        cities,
        specialtySlugs,
        maxPerQuery: Math.min(parseInt(maxPerQuery || 60, 10), 60),
        filterNoWebsiteOnly: !!filterNoWebsiteOnly,
        name: name || undefined,
      });
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
  //   Bulk-basiert (500er-Batches), robust für ≥100k Einträge.
  if (pathParts[0] === 'admin' && pathParts[1] === 'import') {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const { doctors, mode = 'merge', force = false } = body || {};
    if (!Array.isArray(doctors)) return json({ error: 'doctors[] erforderlich' }, { status: 400 });
    if (doctors.length > 200000) return json({ error: 'Zu viele Einträge (>200.000)' }, { status: 400 });

    const doctorsCol = await getCollection('doctor_places');
    let inserted = 0, updated = 0, skipped = 0;
    const errors = [];

    if (mode === 'replace') {
      if (!force) return json({ error: 'mode=replace benötigt force=true' }, { status: 400 });
      await doctorsCol.deleteMany({});
    }

    // Existierende gid → manual_overrides Map einmalig aufbauen (statt N mal findOne)
    const gids = doctors.map((d) => d?.google_place_id).filter(Boolean);
    const existingMap = new Map();
    const CHUNK = 500;
    for (let i = 0; i < gids.length; i += CHUNK) {
      const slice = gids.slice(i, i + CHUNK);
      const found = await doctorsCol.find(
        { google_place_id: { $in: slice } },
        { projection: { google_place_id: 1, manual_overrides: 1, created_at: 1, _id: 0 } },
      ).toArray();
      for (const e of found) existingMap.set(e.google_place_id, e);
    }

    // Bulk-Writes in 500er-Batches
    const now = new Date();
    let bulkOps = [];
    const flush = async () => {
      if (!bulkOps.length) return;
      try {
        const res = await doctorsCol.bulkWrite(bulkOps, { ordered: false });
        inserted += res.upsertedCount || 0;
        updated += res.modifiedCount || 0;
      } catch (err) {
        errors.push({ error: String(err.message || err) });
      }
      bulkOps = [];
    };

    for (const raw of doctors) {
      try {
        if (!raw) { skipped += 1; continue; }
        const doc = { ...raw };
        delete doc._id;
        for (const k of ['created_at', 'updated_at', 'last_synced_at', 'last_external_sync_at', 'verified_at', 'website_checked_at']) {
          if (doc[k] && typeof doc[k] === 'string') doc[k] = new Date(doc[k]);
        }

        // Zwei Upsert-Pfade:
        //   1) google_place_id (Standard – aus Places-Importen)
        //   2) id (UUID) – für Migrations-/Review-Profile ohne place_id
        if (doc.google_place_id) {
          const existing = existingMap.get(doc.google_place_id);
          if (existing) {
            const setFields = { ...doc };
            delete setFields.id;
            delete setFields.created_at;
            const overrides = existing.manual_overrides || {};
            for (const field of Object.keys(overrides)) {
              if (overrides[field] != null) delete setFields[field];
            }
            setFields.updated_at = now;
            bulkOps.push({ updateOne: { filter: { google_place_id: doc.google_place_id }, update: { $set: setFields } } });
          } else {
            doc.id = doc.id || uuidv4();
            doc.created_at = doc.created_at || now;
            doc.updated_at = now;
            doc.manual_overrides = doc.manual_overrides || {};
            doc.data_conflicts = doc.data_conflicts || [];
            bulkOps.push({ updateOne: { filter: { google_place_id: doc.google_place_id }, update: { $setOnInsert: doc }, upsert: true } });
          }
        } else if (doc.id) {
          // ID-basierter Upsert (Migrations-/Review-Profile ohne place_id)
          doc.created_at = doc.created_at || now;
          doc.updated_at = now;
          doc.manual_overrides = doc.manual_overrides || {};
          doc.data_conflicts = doc.data_conflicts || [];
          bulkOps.push({ updateOne: { filter: { id: doc.id }, update: { $setOnInsert: doc }, upsert: true } });
        } else {
          skipped += 1;
          continue;
        }
        if (bulkOps.length >= CHUNK) await flush();
      } catch (err) {
        errors.push({ gid: raw?.google_place_id || raw?.id, error: String(err.message || err) });
      }
    }
    await flush();

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

  // PUT /api/admin/claim-requests/:id  – Status ändern
  if (pathParts[0] === 'admin' && pathParts[1] === 'claim-requests' && pathParts[2]) {
    if (!(await requireAdmin(request))) return json({ error: 'Nicht autorisiert' }, { status: 401 });
    const id = pathParts[2];
    const status = body.status;
    if (!['new', 'approved', 'rejected', 'in_review'].includes(status)) {
      return json({ error: 'Ungültiger Status' }, { status: 400 });
    }
    const col = await getCollection('claim_requests');
    const update = { status, updated_at: new Date() };
    if (typeof body.admin_note === 'string') update.admin_note = body.admin_note.slice(0, 1000);
    const res = await col.findOneAndUpdate({ id }, { $set: update }, { returnDocument: 'after' });
    if (!res) return json({ error: 'Nicht gefunden' }, { status: 404 });

    // Wenn approved: das zugehörige Praxis-Profil auf verified setzen
    if (status === 'approved' && res.doctor_id) {
      const doctorsCol = await getCollection('doctor_places');
      await doctorsCol.updateOne({ id: res.doctor_id }, { $set: { is_verified: true, updated_at: new Date() } });
    }
    return json({ ok: true, claim: { ...res, _id: undefined } });
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
