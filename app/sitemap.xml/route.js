import { getCollection } from '@/lib/mongodb';
import { SPECIALTIES } from '@/lib/specialties';

export const dynamic = 'force-dynamic';

export async function GET() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://navoria.de';
  const citiesCol = await getCollection('cities');
  const doctorsCol = await getCollection('doctor_places');
  const cities = await citiesCol.find({ doctor_count: { $gt: 0 } }).limit(200).toArray();
  const doctors = await doctorsCol.find({ is_active: true }, { projection: { slug: 1, city_slug: 1, updated_at: 1 } }).limit(5000).toArray();

  const urls = [];
  urls.push(url(base, '', 1.0));
  urls.push(url(base, '/aerzte', 0.9));
  urls.push(url(base, '/ueber-uns', 0.7));
  urls.push(url(base, '/redaktionelle-standards', 0.6));
  urls.push(url(base, '/korrekturen', 0.5));
  urls.push(url(base, '/impressum', 0.3));
  urls.push(url(base, '/datenschutz', 0.3));
  for (const c of cities) {
    urls.push(url(base, `/aerzte/${c.slug}`, 0.8));
    for (const s of SPECIALTIES) {
      urls.push(url(base, `/aerzte/${c.slug}/${s.slug}`, 0.6));
    }
  }
  for (const d of doctors) {
    if (d.city_slug && d.slug) {
      urls.push(url(base, `/praxis/${d.city_slug}/${d.slug}`, 0.7, d.updated_at));
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}

function url(base, path, priority, lastmod) {
  const iso = lastmod ? new Date(lastmod).toISOString() : new Date().toISOString();
  return `  <url><loc>${base}${path}</loc><lastmod>${iso}</lastmod><priority>${priority.toFixed(1)}</priority></url>`;
}
