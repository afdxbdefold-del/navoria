import Link from 'next/link';
import Image from 'next/image';
import { MAGAZINE_ARTICLES, CATEGORIES } from '@/lib/magazineArticles';
import { getBaseUrl } from '@/lib/baseUrl';
import { Clock, ArrowRight, BookOpen } from 'lucide-react';
import { ArticleCard, CategoryEmoji, labelForCategory, formatDate } from '@/components/MagazineCard';

export const revalidate = 3600;

export async function generateMetadata() {
  return {
    title: 'Gesundheits-Magazin: aktuelle Themen verständlich erklärt',
    description: 'Gesundheit ohne Fachchinesisch. Beschwerden, Vorsorge, Diagnosen und was die Kasse zahlt. Redaktionell recherchiert und alltagstauglich.',
    alternates: { canonical: '/magazin' },
    openGraph: {
      title: 'Navoria Magazin – Gesundheit verständlich',
      description: 'Beschwerden, Vorsorge, Diagnosen. Redaktionell recherchiert.',
      url: '/magazin',
      type: 'website',
      locale: 'de_DE',
    },
  };
}

export default async function MagazinePage() {
  const base = await getBaseUrl();
  const sorted = [...MAGAZINE_ARTICLES].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  const featured = sorted[0];
  const rest = sorted.slice(1);

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Navoria Magazin',
    description: 'Aktuelle Gesundheitsthemen redaktionell aufbereitet.',
    url: `${base}/magazin`,
    inLanguage: 'de-DE',
    numberOfItems: MAGAZINE_ARTICLES.length,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />

      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
          <BookOpen className="h-3.5 w-3.5" /> Redaktion
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Gesundheits-Magazin</h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          Beschwerden, Vorsorge, Diagnosen. Redaktionell recherchiert, ohne Fachchinesisch, mit dem Blick auf das, was im Alltag zählt.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/magazin/kategorie/${c.slug}`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
          >
            {c.label}
          </Link>
        ))}
      </div>

      {featured && (
        <Link href={`/magazin/${featured.slug}`} className="group mt-12 block">
          <article className="grid gap-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md sm:grid-cols-[1fr_1.2fr]">
            <div className="relative min-h-[240px] w-full overflow-hidden bg-slate-100 sm:min-h-[320px]">
              {featured.heroImage ? (
                <Image
                  src={featured.heroImage}
                  alt={featured.heroImageAlt || featured.title}
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <div className={`flex h-full items-center justify-center bg-gradient-to-br ${featured.heroGradient} text-6xl`}>
                  <CategoryEmoji slug={featured.category} />
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-10">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-sky-700">
                <span className="rounded-full bg-sky-50 px-2 py-0.5">Featured</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">{labelForCategory(featured.category)}</span>
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900 group-hover:text-sky-700 sm:text-3xl">{featured.title}</h2>
              <p className="mt-3 text-slate-600">{featured.lead}</p>
              <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {featured.readingMinutes} Min. Lesezeit</span>
                <span>{formatDate(featured.publishedAt)}</span>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-700 group-hover:underline">
                Weiterlesen <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </article>
        </Link>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </div>
  );
}
