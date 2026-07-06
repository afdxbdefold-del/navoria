// Sub-Sitemap für statische Seiten + Fachrichtungs-Pillars.
// Wenige Dutzend URLs, schnell zu generieren.
import { SPECIALTIES } from '@/lib/specialties';

export const dynamic = 'force-dynamic';

export async function GET() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://navoria.de';
  const now = new Date().toISOString();

  const urls = [];
  urls.push(url(base, '', 1.0, now));
  urls.push(url(base, '/aerzte', 0.9, now));
  urls.push(url(base, '/aerzte/fachrichtung', 0.9, now));
  urls.push(url(base, '/ueber-uns', 0.7, now));
  urls.push(url(base, '/redaktionelle-standards', 0.6, now));
  urls.push(url(base, '/korrekturen', 0.5, now));
  urls.push(url(base, '/impressum', 0.3, now));
  urls.push(url(base, '/datenschutz', 0.3, now));
  for (const s of SPECIALTIES) {
    urls.push(url(base, `/aerzte/fachrichtung/${s.slug}`, 0.8, now));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

function url(base, path, priority, lastmod) {
  return `  <url><loc>${base}${path}</loc><lastmod>${lastmod}</lastmod><priority>${priority.toFixed(1)}</priority></url>`;
}
