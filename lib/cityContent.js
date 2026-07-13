// Content-Anreicherung für Stadt-Seiten (Adsense-Thin-Content-Schutz).
// Liefert Statistiken, Nachbarstädte und FAQ-Templates pro Stadt.
//
// Produktions-Skalierung:
//   - Nachbarstädte-Aggregation läuft global EINMAL pro Instanz (TTL 1h),
//     danach nur noch In-Memory-Filter statt DB-Aggregation.
//   - City-Stats werden pro Slug 10 min gecached.
//   - Sitemap-Aggregationen (City×Fach-Counts) werden separat unter
//     `getCitySpecialtyCounts` bereitgestellt, 1h gecached.
//   - Caches liegen auf globalThis, überleben Next-HMR.

import { getCollection } from './mongodb';
import { specialtyByLabel } from './specialties';

// Schwellen: Seiten unterhalb dieser Werte werden noindexed & nicht in Sitemap gelistet.
export const CITY_MIN_DOCTORS = 5;
export const CITY_SPEC_MIN_DOCTORS = 3;

const STATS_TTL_MS = 10 * 60 * 1000;
const NEARBY_TTL_MS = 60 * 60 * 1000;
const CITY_SPEC_TTL_MS = 60 * 60 * 1000;

function getCache(bucket) {
  if (!globalThis.__navoriaCache) globalThis.__navoriaCache = {};
  if (!globalThis.__navoriaCache[bucket]) globalThis.__navoriaCache[bucket] = { at: 0, data: null, promise: null };
  return globalThis.__navoriaCache[bucket];
}
function getMapCache(bucket) {
  if (!globalThis.__navoriaCache) globalThis.__navoriaCache = {};
  if (!globalThis.__navoriaCache[bucket]) globalThis.__navoriaCache[bucket] = new Map();
  return globalThis.__navoriaCache[bucket];
}

function toRad(deg) { return (deg * Math.PI) / 180; }
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// ---------- Globale "cities-with-doctors" Aggregation ----------
// Wird einmal ausgeführt (per Instanz, 1h TTL) und liefert ein Array aller Städte
// mit Zentroid + Anzahl. Basiert allein auf `doctor_places` (is_active), erfordert
// keine cities-Collection-Struktur. Bei Kaltstart mit 100k+ Ärzten dauert das
// wenige Sekunden – daher globaler Single-Flight über Promise-Deduplication.
async function loadAllCityAggregates() {
  const bucket = getCache('allCityAggregates');
  const now = Date.now();
  if (bucket.data && now - bucket.at < NEARBY_TTL_MS) return bucket.data;
  if (bucket.promise) return bucket.promise;

  bucket.promise = (async () => {
    const col = await getCollection('doctor_places');
    const rows = await col.aggregate([
      { $match: { is_active: true, latitude: { $ne: null }, longitude: { $ne: null }, city_slug: { $nin: [null, ''] } } },
      {
        $group: {
          _id: '$city_slug',
          cityName: { $first: '$city' },
          state: { $first: '$state' },
          n: { $sum: 1 },
          lat: { $avg: '$latitude' },
          lng: { $avg: '$longitude' },
        },
      },
      { $match: { n: { $gte: CITY_MIN_DOCTORS } } },
    ], { allowDiskUse: true }).toArray();

    bucket.data = rows.map((r) => ({
      slug: r._id,
      name: r.cityName || r._id,
      state: r.state || null,
      count: r.n,
      lat: r.lat,
      lng: r.lng,
    }));
    bucket.at = Date.now();
    bucket.promise = null;
    return bucket.data;
  })();

  return bucket.promise;
}

// ---------- Per-Stadt Kennzahlen ----------
export async function getCityStats(citySlug) {
  const cache = getMapCache('cityStats');
  const cached = cache.get(citySlug);
  if (cached && Date.now() - cached.at < STATS_TTL_MS) return cached.data;

  const col = await getCollection('doctor_places');
  const [row] = await col.aggregate([
    { $match: { city_slug: citySlug, is_active: true } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        withWebsite: { $sum: { $cond: [{ $ifNull: ['$website_url', false] }, 1, 0] } },
        withPhone: { $sum: { $cond: [{ $or: [{ $ifNull: ['$phone_national', false] }, { $ifNull: ['$phone_international', false] }] }, 1, 0] } },
        ratingSum: { $sum: { $cond: [{ $gt: ['$user_rating_count', 0] }, { $multiply: ['$rating', '$user_rating_count'] }, 0] } },
        totalReviews: { $sum: { $ifNull: ['$user_rating_count', 0] } },
        centerLat: { $avg: '$latitude' },
        centerLng: { $avg: '$longitude' },
      },
    },
  ]).toArray();

  const specAgg = await col.aggregate([
    { $match: { city_slug: citySlug, is_active: true, specialty_guess: { $nin: [null, ''] } } },
    { $group: { _id: '$specialty_guess', n: { $sum: 1 } } },
    { $sort: { n: -1 } },
    { $limit: 6 },
  ]).toArray();

  const stateAgg = await col.aggregate([
    { $match: { city_slug: citySlug, is_active: true, state: { $nin: [null, ''] } } },
    { $group: { _id: '$state', n: { $sum: 1 } } },
    { $sort: { n: -1 } },
    { $limit: 1 },
  ]).toArray();

  const data = {
    count: row?.count || 0,
    withWebsite: row?.withWebsite || 0,
    withPhone: row?.withPhone || 0,
    avgRating: row && row.totalReviews > 0 ? Math.round((row.ratingSum / row.totalReviews) * 10) / 10 : null,
    totalReviews: row?.totalReviews || 0,
    topSpecialties: specAgg.map((s) => ({ label: s._id, count: s.n })),
    state: stateAgg[0]?._id || null,
    centerLat: row?.centerLat || null,
    centerLng: row?.centerLng || null,
  };
  cache.set(citySlug, { at: Date.now(), data });
  return data;
}

// Nachbarstädte: einmalige Aggregation, danach O(cities) Filter pro Request.
// Bevorzugt Städte im gleichen Bundesland, sonst nach Distanz.
export async function getNearbyCities(citySlug, centerLat, centerLng, state, limit = 6) {
  if (!centerLat || !centerLng) return [];
  const all = await loadAllCityAggregates();

  const scored = [];
  for (const c of all) {
    if (c.slug === citySlug) continue;
    if (!c.lat || !c.lng) continue;
    const d = haversineKm(centerLat, centerLng, c.lat, c.lng);
    if (d > 400) continue; // regionaler Radius
    scored.push({
      slug: c.slug,
      name: c.name,
      state: c.state,
      count: c.count,
      distanceKm: d,
      sameState: state && c.state === state ? 1 : 0,
    });
  }
  scored.sort((a, b) => (b.sameState - a.sameState) || (a.distanceKm - b.distanceKm));
  return scored.slice(0, limit);
}

// ---------- Sitemap-Helfer ----------
// Liefert Liste aller (city_slug, specialty_guess)-Kombinationen mit >= CITY_SPEC_MIN_DOCTORS.
// Wird für /sitemap-city-specs/[chunk] genutzt. TTL 1h.
export async function getCitySpecialtyCombos() {
  const bucket = getCache('citySpecCombos');
  const now = Date.now();
  if (bucket.data && now - bucket.at < CITY_SPEC_TTL_MS) return bucket.data;
  if (bucket.promise) return bucket.promise;

  bucket.promise = (async () => {
    const col = await getCollection('doctor_places');
    const rows = await col.aggregate([
      { $match: { is_active: true, city_slug: { $nin: [null, ''] }, specialty_guess: { $nin: [null, ''] } } },
      { $group: { _id: { city: '$city_slug', spec: '$specialty_guess' }, n: { $sum: 1 } } },
      { $match: { n: { $gte: CITY_SPEC_MIN_DOCTORS } } },
      { $sort: { '_id.city': 1, '_id.spec': 1 } },
    ], { allowDiskUse: true }).toArray();
    bucket.data = rows.map((r) => ({ city: r._id.city, spec: r._id.spec, n: r.n }));
    bucket.at = Date.now();
    bucket.promise = null;
    return bucket.data;
  })();
  return bucket.promise;
}

// Liefert Liste aller Städte mit >= CITY_MIN_DOCTORS für die Stadt-Sitemap.
export async function getIndexableCities() {
  return loadAllCityAggregates();
}

// ---------- FAQ-Templates ----------
export function buildCityFaqs(cityName, stats) {
  const count = stats?.count ?? 0;
  const state = stats?.state || null;
  const withWebsite = stats?.withWebsite ?? 0;
  const withWebsitePct = count > 0 ? Math.round((withWebsite / count) * 100) : 0;
  const avgRating = stats?.avgRating;
  const topSpecPlurals = (stats?.topSpecialties || []).slice(0, 3)
    .map((s) => specialtyByLabel(s.label)?.plural || s.label);
  const topSpecTxt = topSpecPlurals.join(', ');

  return [
    {
      q: `Wie finde ich in ${cityName} einen passenden Arzt oder eine Praxis?`,
      a: `Auf Navoria filtern Sie ${count} Praxen in ${cityName} nach Fachrichtung, Bewertung und Stadtteil. Nutzen Sie die Sidebar, um direkt zu einer Fachrichtung zu springen, oder öffnen Sie das Profil einer Praxis, um Adresse, Telefonnummer, Öffnungszeiten und einen Kartenlink zu sehen.`,
    },
    {
      q: `Welche Fachrichtungen sind in ${cityName} vertreten?`,
      a: topSpecTxt
        ? `In ${cityName} sind unter anderem ${topSpecTxt} in unserer Datenbasis besonders häufig vertreten. Die vollständige Übersicht mit Anzahl der jeweiligen Praxen finden Sie in der Sidebar dieser Seite.`
        : `Die verfügbaren Fachrichtungen in ${cityName} sehen Sie in der Sidebar oben – von Hausarzt und Zahnarzt bis zu Fachärzten wie Kardiologe, Orthopäde oder Dermatologe.`,
    },
    {
      q: `Wie erreiche ich den ärztlichen Bereitschaftsdienst in ${cityName}?`,
      a: `Der ärztliche Bereitschaftsdienst ist außerhalb der Praxis-Öffnungszeiten bundesweit unter der Nummer 116 117 kostenfrei erreichbar${state ? ` – auch in ${state}` : ''}. Bei akuten Notfällen wählen Sie den Notruf 112. Für zahnärztliche Notfälle bieten in ${cityName} die zuständigen Zahnärztekammern einen Wochenend-Notdienst.`,
    },
    {
      q: `Woher stammen die Praxisdaten und wie aktuell sind sie?`,
      a: `Die auf Navoria gelisteten Praxen in ${cityName} basieren auf öffentlich verfügbaren Google-Places-Informationen und werden regelmäßig aktualisiert. ${withWebsitePct}% der ${count} gelisteten Praxen führen eine eigene Website. Bewertungen stammen aus öffentlichen Google-Rezensionen.`,
    },
    ...(avgRating ? [{
      q: `Wie gut sind die Praxen in ${cityName} bewertet?`,
      a: `Die durchschnittliche Google-Bewertung aller aktiven Einträge in ${cityName} liegt bei ${avgRating.toFixed(1)} von 5 Sternen (Basis: ${stats.totalReviews.toLocaleString('de-DE')} öffentliche Google-Rezensionen). Bei Fachrichtungen mit vielen Bewertungen ist die Aussagekraft besonders hoch.`,
    }] : []),
  ];
}

export function buildFaqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function isRichCityPage(stats) {
  return (stats?.count ?? 0) >= CITY_MIN_DOCTORS;
}
