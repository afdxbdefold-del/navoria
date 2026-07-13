// Sitemap-Chunk für City×Fachrichtung-URLs, à 10.000 URLs.
// Enthält NUR Kombinationen mit >= CITY_SPEC_MIN_DOCTORS (Adsense-Thin-Content-Schutz).
// URL-Schema: /sitemap-city-specs/1, /sitemap-city-specs/2, ...
import { notFound } from 'next/navigation';
import { getBaseUrl } from '@/lib/baseUrl';
import { getCitySpecialtyCombos } from '@/lib/cityContent';
import { specialtyByLabel } from '@/lib/specialties';

export const dynamic = 'force-dynamic';

const CHUNK_SIZE = 10000;

export async function GET(request, { params }) {
  const { chunk } = await params;
  const chunkNum = parseInt(chunk, 10);
  if (Number.isNaN(chunkNum) || chunkNum < 1) notFound();

  const base = await getBaseUrl();
  const combos = await getCitySpecialtyCombos();

  const start = (chunkNum - 1) * CHUNK_SIZE;
  const slice = combos.slice(start, start + CHUNK_SIZE);
  if (slice.length === 0 && chunkNum > 1) notFound();

  const now = new Date().toISOString();
  const urls = [];
  for (const c of slice) {
    // specialty_guess ist das Label ("Kardiologe") → in Slug übersetzen
    const spec = specialtyByLabel(c.spec);
    if (!spec) continue;
    urls.push(`  <url><loc>${base}/aerzte/${c.city}/${spec.slug}</loc><lastmod>${now}</lastmod><priority>0.5</priority></url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
