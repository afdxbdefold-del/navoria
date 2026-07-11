// Ermittelt die "richtige" Basis-URL für canonicals, og:url, JSON-LD @ids etc.
//
// Warum brauchen wir das?
// Wenn NEXT_PUBLIC_BASE_URL in Production versehentlich auf die Preview-URL zeigt
// (z.B. https://medic-portal-preview.emergent.host), brechen alle SEO-Signale zusammen –
// Google indexiert die Preview-URLs statt navoria.de.
//
// Zweischichtiger Schutz:
//   1. Runtime: aus Host-Header ableiten (funktioniert nur in Server-Kontexten mit headers())
//   2. Env: NEXT_PUBLIC_BASE_URL, mit "navoria.de" als absoluter Fallback

const HARDCODED_FALLBACK = 'https://navoria.de';
const PROD_HOSTS = new Set(['navoria.de', 'www.navoria.de']);
// Diese Marker deuten auf Preview-/Dev-Environments hin. Wenn der Host DIESE enthält,
// bleiben wir bei der Env-Variable (weil wir dann tatsächlich in Preview sind).
// Wenn der Host stattdessen 'navoria.de' ist, forcieren wir navoria.de.
const PREVIEW_HOST_MARKERS = ['preview', 'emergent.host', 'emergentagent.com', 'localhost', 'vercel.app'];

function stripTrailingSlash(u) {
  return String(u || '').replace(/\/$/, '');
}

/**
 * Async Version – bevorzugt Runtime-Host-Detection.
 * Verwenden in Server Components / Route Handlers / generateMetadata.
 */
export async function getBaseUrl() {
  try {
    const { headers } = await import('next/headers');
    const h = await headers();
    const host = (h.get('host') || h.get('x-forwarded-host') || '').toLowerCase().split(':')[0];

    // 1. Wenn Request tatsächlich auf navoria.de kommt → hart darauf setzen
    //    (unabhängig von der Env-Variable – das ist der Kern des Sicherheits-Fallbacks)
    if (PROD_HOSTS.has(host)) return HARDCODED_FALLBACK;

    // 2. Wenn Host bekannt & nicht Preview/Dev → dynamisch aus Request bauen
    //    (für z.B. Custom-Domains, die wir noch nicht kennen)
    if (host && !PREVIEW_HOST_MARKERS.some((m) => host.includes(m)) && !host.startsWith('127.') && !host.startsWith('0.')) {
      const proto = h.get('x-forwarded-proto') || 'https';
      return `${proto}://${host}`;
    }

    // 3. Preview/Dev Host: benutze Host als Base-URL (das ist im Preview korrekt)
    if (host) {
      const proto = h.get('x-forwarded-proto') || 'https';
      return `${proto}://${host}`;
    }
  } catch {
    // headers() ist nicht verfügbar (z.B. beim Build-Time-Rendering statischer Routen)
  }

  // 4. Kein Host → Env-Variable
  const env = stripTrailingSlash(process.env.NEXT_PUBLIC_BASE_URL);
  return env || HARDCODED_FALLBACK;
}

/**
 * Synchrone Version ohne Host-Detection.
 * Verwenden wenn kein headers() verfügbar ist (z.B. metadataBase im Layout).
 *
 * Sicherheits-Fallback bei production builds:
 *   Wenn NEXT_PUBLIC_BASE_URL in einem PRODUCTION-Deploy (NODE_ENV=production) auf
 *   eine Preview-Marker-URL zeigt, wird auf 'https://navoria.de' korrigiert.
 *   Grund: In Production-Deploys ist die Preview-URL immer eine Fehlkonfiguration.
 *
 *   Preview-Deploys laufen mit NODE_ENV=development (next dev) und werden hierdurch
 *   nicht beeinflusst – dort bleibt die Preview-URL erhalten.
 */
export function getBaseUrlSync() {
  const env = stripTrailingSlash(process.env.NEXT_PUBLIC_BASE_URL);
  if (!env) return HARDCODED_FALLBACK;
  if (process.env.NODE_ENV === 'production') {
    const lower = env.toLowerCase();
    const looksLikePreview = PREVIEW_HOST_MARKERS.some((m) => lower.includes(m));
    if (looksLikePreview) return HARDCODED_FALLBACK;
  }
  return env;
}
