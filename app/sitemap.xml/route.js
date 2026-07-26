// Sitemap-Index: verweist auf die eigentlichen Sub-Sitemaps.
// Vorteile: keine 50k-URL-Grenze pro Datei, schnelleres Crawling.
import { getCollection } from '@/lib/mongodb';
import { hasExternalWebsite } from '@/lib/ownUrl';
import { getBaseUrl } from '@/lib/baseUrl';
import { getCitySpecialtyCombos } from '@/lib/cityContent';

export const dynamic = 'force-dynamic';

const PRAXIS_CHUNK = 10000;
const CITY_SPEC_CHUNK = 10000;

export async function GET() {
  const base = await getBaseUrl();
  const doctorsCol = await getCollection('doctor_places');

  // Praxen-Chunks: nur abgehakt (website_checked_at gesetzt), aktiv, kein homepage_mode,
  // ohne externe Website.
  const doctorsRaw = await doctorsCol.find(
    {
      is_active: true,
      homepage_mode: { $ne: true },
      website_checked_at: { $ne: null },
    },
    { projection: { website_url: 1 } }
  ).toArray();
  const indexablePraxen = doctorsRaw.filter((d) => !hasExternalWebsite(d.website_url)).length;
  const praxisChunks = Math.max(1, Math.ceil(indexablePraxen / PRAXIS_CHUNK));

  // City×Fach-Chunks: nur Kombinationen mit >= CITY_SPEC_MIN_DOCTORS.
  const combos = await getCitySpecialtyCombos();
  const citySpecChunks = Math.max(0, Math.ceil(combos.length / CITY_SPEC_CHUNK));

  const now = new Date().toISOString();
  const sitemaps = [];
  sitemaps.push(sitemap(base, '/sitemap-pages.xml', now));
  sitemaps.push(sitemap(base, '/sitemap-cities.xml', now));
  sitemaps.push(sitemap(base, '/sitemap-homepages.xml', now));
  for (let i = 1; i <= citySpecChunks; i += 1) {
    sitemaps.push(sitemap(base, `/sitemap-city-specs/${i}`, now));
  }
  for (let i = 1; i <= praxisChunks; i += 1) {
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
