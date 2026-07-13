// ads.txt: eigene Direct-Einträge + dynamische Ezoic-Publisher-Liste.
//
// Vorher: 301-Redirect auf Ezoic Manager. Nachteil: eigene AdSense-Direct-
// Einträge liessen sich so nicht ergänzen.
// Jetzt: eigene Zeilen werden vorangestellt und die Ezoic-Liste
// (via ads.txt Manager, ID 19390) wird server-seitig geholt und angehängt.
// Cache: 1 Stunde. Bei Timeout/Fehler: Fallback auf eigene Einträge.
export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const DIRECT_LINES = [
  'google.com, pub-8583619451045805, DIRECT, f08c47fec0942fa0',
];

const EZOIC_MANAGER_BASE = 'https://srv.adstxtmanager.com/19390/';

export async function GET(request) {
  const hdrHost =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    'navoria.de';
  const cleanHost = hdrHost.split(':')[0].trim().toLowerCase();

  // Ezoic-Liste server-seitig laden (Timeout 5 s, damit ads.txt-Request nicht hängt).
  let ezoicContent = '';
  let ezoicOk = false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${EZOIC_MANAGER_BASE}${cleanHost}`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Navoria-adsTxt-Fetcher/1.0' },
      cache: 'no-store',
    });
    clearTimeout(timeout);
    if (res.ok) {
      ezoicContent = (await res.text()).trim();
      ezoicOk = ezoicContent.length > 0;
    }
  } catch {
    // Fallback: nur eigene Einträge ausliefern.
  }

  const header = [
    '# Navoria ads.txt',
    '# Direkte Publisher-Einträge und Ezoic Managed Publisher List',
    '# Ezoic Ads.txt Manager ID: 19390',
    '',
    '# --- Direct ---',
    ...DIRECT_LINES,
  ];

  const body = ezoicOk
    ? [...header, '', '# --- Ezoic Managed Publisher List ---', ezoicContent].join('\n')
    : [...header, '', '# --- Ezoic list temporarily unavailable ---'].join('\n');

  return new Response(body + '\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
