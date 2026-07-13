// Sitemap-Index: verweist auf die eigentlichen Sub-Sitemaps.
// Vorteile: keine 50k-URL-Grenze pro Datei, schnelleres Crawling durch Google
// (Google überspringt Sub-Sitemaps mit unverändertem lastmod).
import { getCollection } from '@/lib/mongodb';
import { hasExternalWebsite } from '@/lib/ownUrl';
import { getBaseUrl } from '@/lib/baseUrl';

export const dynamic = 'force-dynamic';

const CHUNK_SIZE = 10000; // Praxen pro Sub-Sitemap; sicher unter Google's 50k Limit

export async function GET() {
  const base = await getBaseUrl();
  const doctorsCol = await getCollection('doctor_places');

  // Anzahl der indexierbaren Praxen ermitteln um zu wissen, wie viele Chunks nötig sind.
  // Muss dem Filter in /sitemap-praxen/[chunk] entsprechen:
  //   - is_active: true
  //   - nicht im homepage_mode
  //   - website_checked_at gesetzt ("abgehakt")
  //   - keine externe Website
  const doctorsRaw = await doctorsCol.find(
    {
      is_active: true,
      homepage_mode: { $ne: true },
      website_checked_at: { $ne: null },
    },
    { projection: { website_url: 1 } }
  ).toArray();
  const indexableCount = doctorsRaw.filter((d) => !hasExternalWebsite(d.website_url)).length;
  const chunkCount = Math.max(1, Math.ceil(indexableCount / CHUNK_SIZE));

  const now = new Date().toISOString();
  const sitemaps = [];
  sitemaps.push(sitemap(base, '/sitemap-pages.xml', now));
  sitemaps.push(sitemap(base, '/sitemap-cities.xml', now));
  for (let i = 1; i <= chunkCount; i += 1) {
    sitemaps.push(sitemap(base, `/sitemap-praxen/${i}`, now));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps.join('\n')}\n</sitemapindex>`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

function sitemap(base, path, lastmod) {
  return `  <sitemap><loc>${base}${path}</loc><lastmod>${lastmod}</lastmod></sitemap>`;
}
