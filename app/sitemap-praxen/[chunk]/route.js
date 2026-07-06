// Sub-Sitemap für Praxen, chunked à 10.000 URLs.
// URL-Schema: /sitemap-praxen/1, /sitemap-praxen/2, ...
// Enthält NUR Praxen ohne externe Website (SEO-Regel: index,follow),
// Praxen mit eigener externer Website sind noindex,follow und gehören nicht in die Sitemap.
import { getCollection } from '@/lib/mongodb';
import { hasExternalWebsite } from '@/lib/ownUrl';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const CHUNK_SIZE = 10000;

export async function GET(request, { params }) {
  const { chunk } = await params;
  const chunkNum = parseInt(chunk, 10);
  if (Number.isNaN(chunkNum) || chunkNum < 1) notFound();

  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://navoria.de';
  const doctorsCol = await getCollection('doctor_places');

  // Alle aktiven Praxen holen (nur benötigte Felder für Sitemap)
  const doctorsRaw = await doctorsCol.find(
    { is_active: true },
    { projection: { slug: 1, city_slug: 1, updated_at: 1, website_url: 1, _id: 1 } }
  ).sort({ _id: 1 }).toArray();

  // Nur Praxen ohne externe Website behalten und mit gültigen URL-Feldern
  const doctors = doctorsRaw.filter((d) =>
    !hasExternalWebsite(d.website_url) && d.city_slug && d.slug
  );

  // Chunk auswählen
  const start = (chunkNum - 1) * CHUNK_SIZE;
  const chunkDocs = doctors.slice(start, start + CHUNK_SIZE);

  // 404 wenn Chunk-Nummer außerhalb der Range liegt (aber Chunk 1 immer OK)
  if (chunkDocs.length === 0 && chunkNum > 1) notFound();

  const urls = chunkDocs.map((d) => {
    const iso = d.updated_at ? new Date(d.updated_at).toISOString() : new Date().toISOString();
    return `  <url><loc>${base}/praxis/${d.city_slug}/${d.slug}</loc><lastmod>${iso}</lastmod><priority>0.7</priority></url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
