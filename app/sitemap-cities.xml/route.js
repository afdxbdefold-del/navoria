// Sub-Sitemap für Stadt-Übersichts-Seiten (/aerzte/{stadt}).
// Enthält nur Städte mit >= CITY_MIN_DOCTORS aktiven Praxen (Adsense-Thin-Content-Schutz).
// City×Fachrichtung-URLs liegen separat in /sitemap-city-specs/[chunk].
import { getBaseUrl } from '@/lib/baseUrl';
import { getIndexableCities } from '@/lib/cityContent';

export const dynamic = 'force-dynamic';

export async function GET() {
  const base = await getBaseUrl();
  const now = new Date().toISOString();
  const cities = await getIndexableCities();

  const urls = cities.map((c) => `  <url><loc>${base}/aerzte/${c.slug}</loc><lastmod>${now}</lastmod><priority>0.7</priority></url>`);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
