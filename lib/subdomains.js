// Wildcard-Subdomain-Routing für Navoria Praxis-Homepages
//
// Konzept:
//   praxisname.navoria.de           → rendert die Praxis-Homepage (homepage_mode:true)
//   www.navoria.de / navoria.de     → Verzeichnis (unverändertes Verhalten)
//   [reserved].navoria.de           → 404 (siehe RESERVED_SUBDOMAINS)
//
// Der eigentliche DB-Lookup passiert in /app/[praxisSlug]/page.js — diese Datei
// enthält nur reine String-Utilities ohne DB-Zugriff, damit die Edge-Runtime der
// middleware.js sie nutzen kann.

// Konstanten
export const MAIN_DOMAIN = 'navoria.de';
// Preview-Domains und Emergent-Cluster: kein Subdomain-Modus.
export const PREVIEW_HOST_MARKERS = [
  'preview', 'emergentagent.com', 'emergentcf.cloud',
  'emergent.host', 'deploy.emergent', 'cluster',
  'localhost', 'vercel.app', '127.0.0.1',
];

// Reservierte Subdomains — nie als Praxis-Slug interpretieren.
export const RESERVED_SUBDOMAINS = new Set([
  'www', 'mail', 'api', 'admin', 'cdn', 'static', 'assets',
  'blog', 'shop', 'app', 'dev', 'staging', 'preview', 'test',
  'mx', 'smtp', 'imap', 'pop', 'pop3', 'ftp', 'sftp',
  'ns1', 'ns2', 'dns', 'dns1', 'dns2',
  'autodiscover', 'autoconfig', '_dmarc', '_domainkey',
  'help', 'support', 'docs', 'status',
]);

/**
 * Extrahiert den relevanten Client-Host aus Request-Headern (Reverse-Proxy-safe).
 * Priorität: x-forwarded-host > host.
 */
export function extractClientHost(headerBag) {
  const fwd = (headerBag.get?.('x-forwarded-host') || headerBag['x-forwarded-host'] || '');
  const host = (headerBag.get?.('host') || headerBag['host'] || '');
  const raw = String(fwd).split(',')[0].trim() || String(host);
  return raw.toLowerCase().split(':')[0];
}

/**
 * Prüft ob der Host in einem Preview-/Dev-Kontext läuft (kein Subdomain-Modus).
 */
export function isPreviewHost(host) {
  if (!host) return true;
  const h = host.toLowerCase();
  return PREVIEW_HOST_MARKERS.some((m) => h.includes(m)) || h.startsWith('127.') || h.startsWith('0.');
}

/**
 * Prüft ob der Host `navoria.de` oder `www.navoria.de` ist (Root-Domain).
 */
export function isRootDomain(host) {
  if (!host) return false;
  const h = host.toLowerCase();
  return h === MAIN_DOMAIN || h === `www.${MAIN_DOMAIN}`;
}

/**
 * Extrahiert die Praxis-Subdomain aus dem Host (falls vorhanden).
 * Gibt null zurück wenn:
 *  - Kein *.navoria.de Muster
 *  - Reservierte Subdomain (www, api, admin, ...)
 *  - Preview-/Dev-Host
 *
 * Beispiele:
 *   dr-mustermann.navoria.de → 'dr-mustermann'
 *   www.navoria.de           → null (reserviert)
 *   navoria.de               → null (Root)
 *   admin.navoria.de         → null (reserviert)
 *   arzt-suche.preview.emergentagent.com → null (Preview)
 */
export function extractPraxisSubdomain(host) {
  if (!host) return null;
  const clean = String(host).toLowerCase().split(':')[0];
  if (isPreviewHost(clean)) return null;

  // Nur *.navoria.de matchen (nicht z.B. sub.other-domain.com)
  const suffix = `.${MAIN_DOMAIN}`;
  if (!clean.endsWith(suffix)) return null;

  // Alles vor dem Suffix = Subdomain(s). Bei mehrstufigen Subdomains
  // (z.B. deep.sub.navoria.de) nehmen wir nur die letzte Ebene.
  const prefix = clean.slice(0, clean.length - suffix.length);
  if (!prefix) return null; // navoria.de selbst — keine Subdomain

  // Wenn mehrstufig (a.b.navoria.de), nur die letzte Ebene betrachten.
  const parts = prefix.split('.');
  const sub = parts[parts.length - 1];

  // Slug-Format prüfen: nur a-z, 0-9, Bindestrich, 3–80 Zeichen
  if (!/^[a-z0-9][a-z0-9-]{2,79}$/.test(sub)) return null;

  // Reservierte Namen ausschließen
  if (RESERVED_SUBDOMAINS.has(sub)) return null;

  return sub;
}

/**
 * Konstruiert die kanonische Praxis-Homepage-URL für einen Slug.
 * Beispiel: getPraxisHomepageUrl('dr-mustermann') → 'https://dr-mustermann.navoria.de'
 */
export function getPraxisHomepageUrl(slug) {
  if (!slug) return null;
  return `https://${slug}.${MAIN_DOMAIN}`;
}
