import Link from 'next/link';
import { RATGEBER, ratgeberCategories } from '@/lib/ratgeberContent';
import { BookOpen, ArrowRight, ShieldCheck } from 'lucide-react';
import { getBaseUrl } from '@/lib/baseUrl';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function generateMetadata() {
  return {
    title: 'Ratgeber – Gesundheitssystem, Vorsorge & Patienten-Rechte',
    description: 'Praktische Ratgeber für Patienten in Deutschland: Facharzt-Termine, Zweitmeinung, Krankenkassen-Leistungen, elektronische Patientenakte, Impfungen und mehr. Redaktionell geprüft.',
    alternates: { canonical: '/ratgeber' },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'de_DE',
      url: '/ratgeber',
      title: 'Ratgeber – Gesundheitssystem, Vorsorge & Patienten-Rechte',
      description: 'Praktische Anleitungen für Patienten – kurz, konkret und aktuell.',
    },
  };
}

export default async function RatgeberOverview() {
  const base = await getBaseUrl();
  const cats = ratgeberCategories();

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Start', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: 'Ratgeber', item: `${base}/ratgeber` },
    ],
  };

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Patienten-Ratgeber',
    numberOfItems: RATGEBER.length,
    itemListElement: RATGEBER.map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${base}/ratgeber/${r.slug}`,
      name: r.label,
    })),
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />

      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link>
        <span>/</span>
        <span className="text-slate-700">Ratgeber</span>
      </nav>

      <header className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-sky-50/40 p-6 sm:p-8">
        <div className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
          <BookOpen className="h-3 w-3" /> Ratgeber
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Ratgeber & Patienten-Wissen
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-700 sm:text-lg">
          Praktische Anleitungen für den Alltag im deutschen Gesundheitssystem: von Facharzt-Terminen über Zweitmeinung und Krankenkassen-Leistungen bis zur elektronischen Patientenakte.
        </p>
      </header>

      <section className="mt-10 space-y-10">
        {Object.entries(cats).map(([catName, items]) => (
          <div key={catName}>
            <h2 className="text-2xl font-semibold text-slate-900">{catName}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {items.map((r) => (
                <Link
                  key={r.slug}
                  href={`/ratgeber/${r.slug}`}
                  className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-sm"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-sky-700">{r.label}</h3>
                    <p className="mt-2 line-clamp-3 text-sm text-slate-600">{r.directAnswer}</p>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-sky-700">
                    Ratgeber lesen <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-14 rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Redaktioneller Hinweis</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Alle Ratgeber-Inhalte sind redaktionell erstellt und ersetzen keine ärztliche Beratung. Bei individuellen medizinischen Fragen wenden Sie sich an Ihren Hausarzt. Details zu Datenquellen und Prüfprozessen finden Sie in unseren{' '}
              <Link href="/redaktionelle-standards" className="text-sky-700 underline underline-offset-2 hover:text-sky-800">Redaktionellen Standards</Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
