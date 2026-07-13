import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CATEGORIES, articlesByCategory, categoryBySlug } from '@/lib/magazineArticles';
import { getBaseUrl } from '@/lib/baseUrl';
import { ArticleCard } from '@/components/MagazineCard';
import { BookOpen } from 'lucide-react';

export const revalidate = 3600;

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const c = categoryBySlug(slug);
  if (!c) return { title: 'Nicht gefunden' };
  return {
    title: `${c.label}: Magazin und Ratgeber`,
    description: `${c.description} Alle Artikel aus der Rubrik ${c.label} im Navoria-Magazin.`,
    alternates: { canonical: `/magazin/kategorie/${c.slug}` },
    openGraph: {
      title: `${c.label} – Navoria Magazin`,
      description: c.description,
      url: `/magazin/kategorie/${c.slug}`,
      type: 'website',
      locale: 'de_DE',
    },
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const cat = categoryBySlug(slug);
  if (!cat) notFound();
  const base = await getBaseUrl();
  const articles = articlesByCategory(slug);

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${cat.label} – Navoria Magazin`,
    description: cat.description,
    url: `${base}/magazin/kategorie/${cat.slug}`,
    inLanguage: 'de-DE',
    numberOfItems: articles.length,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link> <span>/</span>
        <Link href="/magazin" className="hover:text-sky-700"> Magazin</Link> <span>/</span>
        <span className="text-slate-700">{cat.label}</span>
      </nav>

      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
          <BookOpen className="h-3.5 w-3.5" /> Rubrik
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">{cat.label}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">{cat.description}</p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/magazin/kategorie/${c.slug}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${c.slug === cat.slug ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700'}`}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {articles.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">In dieser Rubrik sind noch keine Artikel veröffentlicht. Schauen Sie bald wieder vorbei.</p>
          <Link href="/magazin" className="btn-primary mt-4 inline-flex">Zur Magazin-Übersicht</Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
