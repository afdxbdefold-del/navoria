import HomeClient from './HomeClient.jsx';
import { getBaseUrl } from '@/lib/baseUrl';
import { MAGAZINE_ARTICLES } from '@/lib/magazineArticles';

export const revalidate = 300;

export const metadata = {
  title: 'Ärzte in Ihrer Nähe finden — Navoria',
  description: 'Navoria verbindet eine deutschlandweite Arztsuche mit sorgfältig recherchierten Ratgebern und aktuellen Beiträgen aus dem Gesundheitsmagazin.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Navoria: Ärzte finden in Deutschland',
    description: 'Ärzte, Zahnärzte und Fachärzte in Deutschland finden. Adresse, Telefon, Öffnungszeiten und Bewertungen kompakt auf einer Seite.',
    type: 'website',
    locale: 'de_DE',
    url: '/',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Navoria: Ärzte in Deutschland finden' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Navoria: Ärzte finden',
    description: 'Ärzte und Praxen in Deutschland finden.',
    images: ['/opengraph-image'],
  },
};

export default async function HomePage() {
  const base = await getBaseUrl();

  // 3 neueste Magazin-Artikel (serialisierbar an Client-Component reichen)
  const latestArticles = [...MAGAZINE_ARTICLES]
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, 3)
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      lead: a.lead,
      category: a.category,
      publishedAt: a.publishedAt,
      readingMinutes: a.readingMinutes,
      heroImage: a.heroImage || null,
      heroImageAlt: a.heroImageAlt || null,
    }));

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Navoria',
    url: base,
    inLanguage: 'de-DE',
    description: 'Navoria ist ein deutsches Ärzteverzeichnis mit Ratgebern, Symptom-Wissen und einem Gesundheits-Magazin.',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${base}/suche?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <HomeClient latestArticles={latestArticles} />
    </>
  );
}
