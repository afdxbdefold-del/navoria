// Rettet Traffic von der alten Domain xn--rzte-online-k8a.org (ärzte-online.org)
// bzw. rzte-online.vercel.app.
//
// Kontext: Der alte Betreiber hat einen Catch-All-Redirect auf navoria.de/. Für alle
// URLs die nicht in seiner 231er-Redirect-Liste stehen, landen User damit generisch
// auf der Startseite und verlieren ihren Sucherfolg (≈ 2900/Tag).
//
// Lösung: Referer enthält den ursprünglichen Alt-Pfad. Auf der Startseite prüfen wir
// den Referer, parsen den Alt-Pfad und leiten den User zur passenden Navoria-Seite.
//
// Auswertung erfolgt in app/page.js VOR jedem Render — via headers().

import { getCollection } from '@/lib/mongodb';

const LEGACY_HOST_REGEX = /(xn--rzte-online-k8a|rzte-online\.vercel|ärzte-online|%C3%A4rzte-online)/i;
const KNOWN_SPECIALTIES = new Set([
  'hausarzt', 'zahnarzt', 'augenarzt', 'hautarzt', 'orthopaede',
  'frauenarzt', 'kinderarzt', 'hno-arzt', 'arzt',
]);

function parseLegacyUrl(refererStr) {
  try {
    const u = new URL(refererStr);
    if (!LEGACY_HOST_REGEX.test(u.hostname)) return null;
    const parts = u.pathname.replace(/^\/+/, '').split('/').filter(Boolean);
    if (!parts.length) return null;
    const specialty = decodeURIComponent(parts[0]).toLowerCase();
    if (!KNOWN_SPECIALTIES.has(specialty)) return null;
    const city = parts[1] ? decodeURIComponent(parts[1]).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') : null;
    const slug = parts[2] ? decodeURIComponent(parts.slice(2).join('-')).toLowerCase() : null;
    return { specialty, city, slug };
  } catch { return null; }
}

// Versucht anhand von City + Namens-Tokens eine konkrete Praxis in doctor_places zu finden.
async function findConcretePractice({ specialty, city, slug }) {
  if (!city || !slug) return null;
  // Namens-Tokens aus dem Alt-Slug (letzter Pfad-Teil enthält oft City-Suffix)
  const stops = new Set([
    'dr', 'med', 'prof', 'dipl', 'univ', 'hc', 'mudr', 'herr', 'frau', 'md',
    'praxis', 'arztpraxis', 'hausarztpraxis', 'facharzt', 'fachaerztin', 'fachrztin',
    'gemeinschaftspraxis', 'fuer', 'fur', 'und', city,
  ]);
  const tokens = slug.replace(/-\d+$/, '').split('-')
    .filter((t) => t.length >= 3 && !stops.has(t));
  if (tokens.length < 2) return null;

  const col = await getCollection('doctor_places');
  const regex = tokens.slice(0, 4).map((t) => new RegExp(`\\b${t.replace(/[.*+?^${}()|[\\]\\\\]/g, '')}`, 'i'));
  const doc = await col.findOne(
    {
      city_slug: city,
      is_active: { $ne: false },
      $and: regex.map((r) => ({ name: r })),
    },
    { projection: { slug: 1, city_slug: 1, _id: 0 } },
  );
  if (!doc) return null;
  return `/praxis/${doc.city_slug}/${doc.slug}`;
}

/**
 * Prüft den Referer und liefert bei Match eine Ziel-URL, sonst null.
 * @param {string|null} referer
 * @returns {Promise<string|null>}
 */
export async function resolveLegacyReferrerRedirect(referer) {
  if (!referer) return null;
  const parsed = parseLegacyUrl(referer);
  if (!parsed) return null;
  const { specialty, city, slug } = parsed;

  // 1. Konkrete Praxis finden (Deep-Match auf Name+Stadt)
  if (city && slug) {
    const concrete = await findConcretePractice(parsed).catch(() => null);
    if (concrete) return concrete;
  }

  // 2. Fallback: Fachrichtungs-/Stadt-Übersicht
  if (specialty === 'arzt') {
    if (city) return `/aerzte/${city}`;
    return '/aerzte';
  }
  if (city) return `/aerzte/${city}/${specialty}`;
  return `/aerzte/fachrichtung/${specialty}`;
}
