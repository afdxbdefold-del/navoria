// Sub-Sitemap für statische Seiten + Fachrichtungs-Pillars + Symptom-Pillars + Bundesland-Pillars + Ratgeber.
// Wenige Dutzend URLs, schnell zu generieren.
import { SPECIALTIES } from '@/lib/specialties';
import { SYMPTOMS } from '@/lib/symptomContent';
import { BUNDESLAENDER } from '@/lib/bundeslaender';
import { RATGEBER } from '@/lib/ratgeberContent';
import { MAGAZINE_ARTICLES, CATEGORIES as MAG_CATEGORIES } from '@/lib/magazineArticles';
import { getBaseUrl } from '@/lib/baseUrl';

export const dynamic = 'force-dynamic';

export async function GET() {
  const base = await getBaseUrl();
  const now = new Date().toISOString();

  const urls = [];
  urls.push(url(base, '', 1.0, now));
  urls.push(url(base, '/magazin', 0.9, now));
  urls.push(url(base, '/finden', 0.8, now));
  urls.push(url(base, '/aerzte', 0.9, now));
  urls.push(url(base, '/aerzte/fachrichtung', 0.9, now));
  urls.push(url(base, '/aerzte/bundesland', 0.9, now));
  urls.push(url(base, '/symptome', 0.9, now));
  urls.push(url(base, '/ratgeber', 0.9, now));
  urls.push(url(base, '/ueber-uns', 0.7, now));
  urls.push(url(base, '/redaktionelle-standards', 0.6, now));
  urls.push(url(base, '/korrekturen', 0.5, now));
  urls.push(url(base, '/impressum', 0.3, now));
  urls.push(url(base, '/datenschutz', 0.3, now));
  urls.push(url(base, '/barrierefreiheit', 0.4, now));
  for (const s of SPECIALTIES) {
    urls.push(url(base, `/aerzte/fachrichtung/${s.slug}`, 0.8, now));
  }
  for (const s of SYMPTOMS) {
    urls.push(url(base, `/symptome/${s.slug}`, 0.8, now));
  }
  for (const b of BUNDESLAENDER) {
    urls.push(url(base, `/aerzte/bundesland/${b.slug}`, 0.7, now));
  }
  for (const r of RATGEBER) {
    urls.push(url(base, `/ratgeber/${r.slug}`, 0.7, now));
  }
  for (const c of MAG_CATEGORIES) {
    urls.push(url(base, `/magazin/kategorie/${c.slug}`, 0.7, now));
  }
  for (const a of MAGAZINE_ARTICLES) {
    urls.push(url(base, `/magazin/${a.slug}`, 0.8, now));
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
