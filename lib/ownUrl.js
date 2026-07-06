// Erkennt, ob eine URL auf eine unserer eigenen Domains zeigt.
// Wird an mehreren Stellen genutzt (Sitemap, Robots-Meta), damit Praxen, die als
// „Website" ihre eigene Navoria-Profilseite eingetragen haben, weiterhin indexiert werden.
//
// Erkannt wird alles was auf:
//   - navoria.de
//   - www.navoria.de
//   - *.navoria.de (Subdomains)
//   - preview.emergentagent.com (Preview-Deployment)
//   - localhost (Dev)
// ...zeigt.

const OWN_HOST_PATTERNS = [
  /(^|\.)navoria\.de$/i,
  /(^|\.)preview\.emergentagent\.com$/i,
  /^localhost(:\d+)?$/i,
];

/**
 * @param {string|null|undefined} url
 * @returns {boolean} true, wenn URL leer / eine eigene Navoria-URL ist.
 * Praxen ohne echte externe Website sollen indexierbar bleiben.
 */
export function isOwnOrEmptyWebsite(url) {
  if (!url || typeof url !== 'string') return true;
  const trimmed = url.trim();
  if (!trimmed) return true;
  try {
    const withScheme = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const host = new URL(withScheme).hostname;
    return OWN_HOST_PATTERNS.some((rx) => rx.test(host));
  } catch {
    // Ungültige URL → so behandeln, als hätte die Praxis keine Website
    return true;
  }
}

/**
 * Umgekehrt: true, wenn eine ECHTE externe Website hinterlegt ist.
 */
export function hasExternalWebsite(url) {
  return !isOwnOrEmptyWebsite(url);
}
