// Sitemap für Praxis-Homepage-Subdomains (Homepage-Modus).
// URLs im Format https://<slug>.navoria.de/
//
// Hinweis: Homepage-Modus-Seiten sind derzeit `noindex` (temporär für GMB-Verifizierung).
// Diese Sitemap dient primär der Discovery / Übersicht, nicht der Indexierung.

import { getCollection } from '@/lib/mongodb';
import { getPraxisHomepageUrl } from '@/lib/subdomains';

export const revalidate = 3600;

export async function GET() {
  const col = await getCollection('doctor_places');
  const rows = await col.find(
    {
      homepage_mode: true,
      is_active: { $ne: false },
      homepage_slug: { $exists: true, $ne: null, $type: 'string' },
    },
    { projection: { homepage_slug: 1, updated_at: 1, _id: 0 } }
  ).sort({ homepage_slug: 1 }).toArray();

  const urls = rows
    .filter((r) => r.homepage_slug && /^[a-z0-9][a-z0-9-]{2,79}$/.test(r.homepage_slug))
    .map((r) => {
      const iso = r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString();
      const url = getPraxisHomepageUrl(r.homepage_slug);
      return `  <url><loc>${url}/</loc><lastmod>${iso}</lastmod><changefreq>weekly</changefreq><priority>0.5</priority></url>`;
    });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
