// Sub-Sitemap für Städte + Stadt×Fachrichtung-Kombinationen.
// Bei 1000 Städten × 19 Fachrichtungen = 19.000 URLs (sicher unter 50k Limit).
import { getCollection } from '@/lib/mongodb';
import { SPECIALTIES } from '@/lib/specialties';

export const dynamic = 'force-dynamic';

export async function GET() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://navoria.de';
  const now = new Date().toISOString();
  const citiesCol = await getCollection('cities');

  // Alle Städte mit mindestens einer aktiven Praxis (kein Hard-Cap mehr!)
  const cities = await citiesCol.find(
    { doctor_count: { $gt: 0 } },
    { projection: { slug: 1, name: 1, doctor_count: 1 } }
  ).toArray();

  const urls = [];
  for (const c of cities) {
    urls.push(url(base, `/aerzte/${c.slug}`, 0.7, now));
    for (const s of SPECIALTIES) {
      urls.push(url(base, `/aerzte/${c.slug}/${s.slug}`, 0.5, now));
    }
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
