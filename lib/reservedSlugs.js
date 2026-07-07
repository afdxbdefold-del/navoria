// Slugs, die auf Root-Level NICHT als Praxis-Homepage-Slug erlaubt sind.
// Werden verwendet, um Kollisionen mit statischen Routen zu verhindern.

export const RESERVED_ROOT_SLUGS = new Set([
  // Statische Routen
  'admin', 'aerzte', 'praxis', 'suche', 'symptome', 'symptom', 'ratgeber',
  'impressum', 'datenschutz', 'agb', 'barrierefreiheit', 'korrekturen',
  'redaktionelle-standards', 'ueber-uns', 'kontakt',
  'praxis-beanspruchen', 'beanspruchen', 'beanspruchungen',
  // API / Assets / Meta
  'api', '_next', '_vercel', 'sitemap.xml', 'sitemap', 'sitemap-praxen',
  'robots.txt', 'robots', 'favicon.ico', 'favicon', 'manifest.json', 'manifest',
  'icon.svg', 'icon', 'webmcp',
  // Fehlerseiten & System
  '404', '500', 'not-found', 'error',
  // Reserviert für zukünftige Features
  'blog', 'news', 'events', 'karriere', 'jobs', 'presse', 'partner',
  'login', 'register', 'signup', 'signin', 'logout', 'account', 'profil', 'profile',
  'settings', 'dashboard', 'help', 'hilfe', 'faq', 'support',
]);

/**
 * Prüft, ob ein Slug für die Nutzung als Root-Homepage-Slug erlaubt ist.
 */
export function isReservedRootSlug(slug) {
  if (!slug) return true;
  const s = String(slug).toLowerCase().trim();
  return RESERVED_ROOT_SLUGS.has(s);
}
