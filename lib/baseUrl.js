// Ermittelt die "richtige" Basis-URL für canonicals, og:url, JSON-LD @ids etc.
//
// Warum brauchen wir das?
// Wenn NEXT_PUBLIC_BASE_URL in Production versehentlich auf die Preview-URL zeigt
// (z.B. https://medic-portal-preview.cluster-1.deploy.emergentcf.cloud), brechen
// alle SEO-Signale zusammen – Google indexiert die Preview-URLs statt navoria.de.
//
// Dreischichtiger Schutz:
//   1. Runtime: aus x-forwarded-host / host Header ableiten (Server-Kontext)
//   2. Production-Hard-Guard: bei NODE_ENV=production niemals eine Preview-URL zurückgeben
//   3. Env: NEXT_PUBLIC_BASE_URL, mit "navoria.de" als absoluter Fallback

const HARDCODED_FALLBACK = 'https://navoria.de';
const PROD_HOSTS = new Set(['navoria.de', 'www.navoria.de']);
// Diese Marker deuten auf Preview-/Dev-/Interne-Cluster-Hosts hin. Wenn ein
// production-Deployment einen solchen Host detektiert, wird auf navoria.de
// hart-gemapped (der User kam via navoria.de rein, das ist der interne Cluster).
const PREVIEW_HOST_MARKERS = [
  'preview',
  'emergent.host',
  'emergentagent.com',
  'emergentcf.cloud',
  'deploy.emergent',
  'cluster',
  'localhost',
  'vercel.app',
];

function stripTrailingSlash(u) {
  return String(u || '').replace(/\/$/, '');
}

function isPreviewHost(host) {
  if (!host) return true;
  const h = host.toLowerCase();
  return PREVIEW_HOST_MARKERS.some((m) => h.includes(m)) || h.startsWith('127.') || h.startsWith('0.');
}

/**
 * Extrahiert den vom Client tatsächlich angesprochenen Host aus den Request-Headern.
 * Priorität: x-forwarded-host > host. Der Reverse-Proxy (Emergent CDN, Vercel, etc.)
 * setzt x-forwarded-host auf die ursprüngliche Client-Domain; host ist der
 * interne Backend-Hostname und für SEO/Canonical-Zwecke NICHT geeignet.
 */
function extractClientHost(headerBag) {
  const fwd = headerBag.get('x-forwarded-host') || '';
  const host = headerBag.get('host') || '';
  // x-forwarded-host kann eine kommaseparierte Liste sein → erstes Element
  const raw = fwd.split(',')[0].trim() || host;
  return raw.toLowerCase().split(':')[0];
}

/**
 * Async Version – bevorzugt Runtime-Host-Detection.
 * Verwenden in Server Components / Route Handlers / generateMetadata.
 */
export async function getBaseUrl() {
  try {
    const { headers } = await import('next/headers');
    const h = await headers();
    const clientHost = extractClientHost(h);
    const proto = h.get('x-forwarded-proto') || 'https';

    // 1. Wenn Request von navoria.de / www.navoria.de kommt → hart auf navoria.de mappen
    //    (unabhängig von der Env-Variable – Kern des Sicherheits-Fallbacks).
    if (PROD_HOSTS.has(clientHost)) return HARDCODED_FALLBACK;

    // 2. Wenn wir eine Custom-Domain sehen, die nicht Preview/Dev ist → dynamisch bauen.
    if (clientHost && !isPreviewHost(clientHost)) {
      return `${proto}://${clientHost}`;
    }

    // 3. Preview/Dev-Host in PRODUCTION-Deployment: sicherheitshalber navoria.de.
    //    Das schützt vor Google-Leaks, falls der interne Cluster-Host durchreicht.
    if (process.env.NODE_ENV === 'production') {
      return HARDCODED_FALLBACK;
    }

    // 4. Preview-Deployment (NODE_ENV != production) und Preview-Host → Host verwenden.
    if (clientHost) {
      return `${proto}://${clientHost}`;
    }
  } catch {
    // headers() ist nicht verfügbar (z.B. beim Build-Time-Rendering statischer Routen)
  }

  // 5. Kein Host → Env-Variable, sonst Fallback.
  const env = stripTrailingSlash(process.env.NEXT_PUBLIC_BASE_URL);
  if (process.env.NODE_ENV === 'production' && isPreviewHost(env.replace(/^https?:\/\//, ''))) {
    return HARDCODED_FALLBACK;
  }
  return env || HARDCODED_FALLBACK;
}

/**
 * Synchrone Version ohne Host-Detection.
 * Verwenden wenn kein headers() verfügbar ist (z.B. metadataBase im Layout).
 *
 * Sicherheits-Fallback bei production builds:
 *   Wenn NEXT_PUBLIC_BASE_URL in einem PRODUCTION-Deploy (NODE_ENV=production) auf
 *   eine Preview-Marker-URL zeigt, wird auf 'https://navoria.de' korrigiert.
 */
export function getBaseUrlSync() {
  const env = stripTrailingSlash(process.env.NEXT_PUBLIC_BASE_URL);
  if (!env) return HARDCODED_FALLBACK;
  if (process.env.NODE_ENV === 'production') {
    const hostOnly = env.replace(/^https?:\/\//, '').toLowerCase();
    if (isPreviewHost(hostOnly)) return HARDCODED_FALLBACK;
  }
  return env;
}
