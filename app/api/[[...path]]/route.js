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
    let docs = await col.find(filter).limit(500).toArray();

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
