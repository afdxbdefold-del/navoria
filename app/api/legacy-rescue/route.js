// Deep-Match Rescue-Route für Traffic von der alten Domain ärzte-online.org.
//
// Aufruf via Middleware-Rewrite von navoria.de/ mit ?path=<alter Pfad>.
// Diese Route hat vollen DB-Zugriff (Node.js Runtime) und sucht die konkrete
// Praxis via Name-Tokens + City. Bei Treffer → 302 zur Directory-URL.
// Sonst → 302 auf die passende /aerzte/[stadt]/[fachrichtung] Übersicht.

import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KNOWN_SPECIALTIES = new Set([
  'hausarzt', 'zahnarzt', 'augenarzt', 'hautarzt', 'orthopaede',
  'frauenarzt', 'kinderarzt', 'hno-arzt', 'arzt',
]);

function parseLegacyPath(rawPath) {
  const p = String(rawPath || '').replace(/^\/+/, '').split('?')[0].split('#')[0];
  const parts = p.split('/').filter(Boolean);
  if (!parts.length) return null;
  const specialty = decodeURIComponent(parts[0]).toLowerCase();
  if (!KNOWN_SPECIALTIES.has(specialty)) return null;
  const cityRaw = parts[1] ? decodeURIComponent(parts[1]).toLowerCase() : null;
  const city = cityRaw
    ? cityRaw.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
        .replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    : null;
  const slugRaw = parts[2] ? decodeURIComponent(parts.slice(2).join('/')).toLowerCase() : null;
  return { specialty, city, slug: slugRaw };
}

// Konkrete Praxis suchen anhand Name-Tokens + Stadt.
async function findConcretePractice({ city, slug }) {
  if (!city || !slug) return null;
  const stops = new Set([
    'dr', 'med', 'prof', 'dipl', 'univ', 'hc', 'mudr', 'herr', 'frau', 'md',
    'praxis', 'arztpraxis', 'hausarztpraxis', 'facharzt', 'fachaerztin', 'fachrztin',
    'gemeinschaftspraxis', 'fuer', 'fur', 'und', 'am', 'im', 'in',
    city, city.replace(/-/g, ''),
  ]);
  const tokens = slug.replace(/-\d+$/, '').split(/[-/]/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && !stops.has(t) && !/^\d+$/.test(t));
  if (tokens.length < 2) return null;

  const col = await getCollection('doctor_places');
  // Kandidaten in dieser Stadt suchen (+ Nachbar-Städte via city_slug prefix)
  const cityRegex = new RegExp(`^${city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
  const cands = await col.find(
    { city_slug: cityRegex, is_active: { $ne: false } },
    { projection: { slug: 1, city_slug: 1, name: 1, _id: 0 } },
  ).limit(400).toArray();
  if (!cands.length) return null;

  // Score: gewichte Anzahl Token-Treffer
  const wanted = tokens.slice(0, 5);
  let best = null;
  let bestScore = 0;
  for (const c of cands) {
    const nm = String(c.name || '').toLowerCase().replace(/ß/g, 'ss')
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
      .replace(/[^a-z0-9\s]/g, ' ');
    let hits = 0;
    for (const t of wanted) if (nm.includes(t)) hits += 1;
    const score = hits / wanted.length;
    if (score > bestScore) { bestScore = score; best = c; }
  }
  // Mindestens 60% der Tokens müssen im Namen erscheinen, damit wir "sicher" sind
  if (bestScore >= 0.6 && best) {
    return `/praxis/${best.city_slug}/${best.slug}`;
  }
  return null;
}

// Legacy-Referer erkennen (Domains und Muster)
const LEGACY_REFERER_RE = /(xn--rzte-online-k8a|rzte-online\.vercel|%C3%A4rzte-online|ärzte-online)/i;

// Aus einem beliebigen Legacy-URL-String den Pfad extrahieren.
function extractPathFromReferer(rawReferrer) {
  if (!rawReferrer) return null;
  if (!LEGACY_REFERER_RE.test(rawReferrer)) return null;
  try {
    const u = new URL(rawReferrer);
    const path = u.pathname || '';
    if (!path || path === '/' || path.length < 3) return null;
    if (/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|txt|xml|pdf)$/i.test(path)) return null;
    if (/^\/(impressum|datenschutz|agb|kontakt|robots\.txt|favicon)/i.test(path)) return null;
    return path;
  } catch {
    return null;
  }
}

// Kern-Logik: Rescue-Path auflösen und in DB loggen. Wird von GET und POST genutzt.
async function resolveRescue({ rawPath, source, referrer, userAgent }) {
  const parsed = parseLegacyPath(rawPath);
  const logRescue = async (result, target) => {
    try {
      const col = await getCollection('legacy_rescues');
      await col.insertOne({
        legacy_path: rawPath,
        parsed_specialty: parsed?.specialty || null,
        parsed_city: parsed?.city || null,
        parsed_slug: parsed?.slug || null,
        result,
        redirect_target: target,
        source, // 'referer' | 'query-param' | 'client-beacon'
        referer: referrer || null,
        user_agent: (userAgent || '').slice(0, 240),
        timestamp: new Date(),
      });
    } catch { /* ignore */ }
  };

  if (!parsed) {
    await logRescue('invalid', '/');
    return { target: '/', result: 'invalid' };
  }

  const { specialty, city, slug } = parsed;
  const concrete = await findConcretePractice({ city, slug }).catch(() => null);
  if (concrete) {
    await logRescue('concrete', concrete);
    return { target: concrete, result: 'concrete' };
  }
  let target;
  let resultKind;
  if (specialty === 'arzt') {
    target = city ? `/aerzte/${city}` : '/aerzte';
    resultKind = city ? 'category_city' : 'category_all';
  } else if (city) {
    target = `/aerzte/${city}/${specialty}`;
    resultKind = 'category_city_specialty';
  } else {
    target = `/aerzte/fachrichtung/${specialty}`;
    resultKind = 'category_specialty';
  }
  await logRescue(resultKind, target);
  return { target, result: resultKind };
}

export async function GET(request) {
  const url = new URL(request.url);
  const rawPath = url.searchParams.get('path') || '';
  const source = url.searchParams.get('src') || 'referer';
  const origin = url.origin;

  const { target, result } = await resolveRescue({
    rawPath,
    source,
    referrer: request.headers.get('referer'),
    userAgent: request.headers.get('user-agent'),
  });

  return NextResponse.redirect(new URL(target, origin), {
    status: 302,
    headers: { 'X-Navoria-Legacy-Rescue': result },
  });
}

// POST — vom client-seitigen LegacyReferrerCatcher aufgerufen. Umgeht das
// Problem des HTTP-Referer-Strippings, da document.referrer im Browser noch
// verfügbar sein kann selbst wenn die HTTP-Request-Header ihn nicht enthalten.
//
// Body: { referrer?: string, legacyPath?: string }
// Response: { ok: true, redirect_to: '/...', result: 'concrete' | ... }
//        oder { ok: false, reason: 'no_match' } wenn nichts erkannt wurde.
export async function POST(request) {
  let body = {};
  try { body = await request.json(); } catch { body = {}; }
  const referrer = typeof body.referrer === 'string' ? body.referrer.slice(0, 500) : '';
  const providedPath = typeof body.legacyPath === 'string' ? body.legacyPath.slice(0, 300) : '';

  // Priorität: expliziter legacyPath > extractPathFromReferer(referrer)
  let rawPath = providedPath && providedPath.startsWith('/') ? providedPath : '';
  if (!rawPath) {
    rawPath = extractPathFromReferer(referrer) || '';
  }

  if (!rawPath) {
    // Kein nutzbarer Legacy-Pfad. Trotzdem loggen (best-effort) für Diagnose.
    try {
      const col = await getCollection('legacy_rescues');
      await col.insertOne({
        legacy_path: null,
        parsed_specialty: null, parsed_city: null, parsed_slug: null,
        result: 'client_no_match',
        redirect_target: null,
        source: 'client-beacon',
        referer: referrer || null,
        user_agent: (request.headers.get('user-agent') || '').slice(0, 240),
        timestamp: new Date(),
      });
    } catch { /* ignore */ }
    return NextResponse.json({ ok: false, reason: 'no_match' });
  }

  const { target, result } = await resolveRescue({
    rawPath,
    source: 'client-beacon',
    referrer,
    userAgent: request.headers.get('user-agent'),
  });

  return NextResponse.json({ ok: true, redirect_to: target, result });
}
