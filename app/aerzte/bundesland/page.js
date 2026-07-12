import Link from 'next/link';
import { BUNDESLAENDER } from '@/lib/bundeslaender';
import { getCollection } from '@/lib/mongodb';
import { MapPin, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { getBaseUrl } from '@/lib/baseUrl';

export const revalidate = 600;

async function loadCountsPerBundesland() {
  const col = await getCollection('doctor_places');
  const rows = await col.aggregate([
    { $match: { is_active: { $ne: false }, state: { $nin: [null, ''] } } },
    { $group: { _id: '$state', count: { $sum: 1 } } },
  ]).toArray();
  const map = {};
  for (const r of rows) map[r._id] = r.count;
  return map;
}

export async function generateMetadata() {
  return {
    title: 'Ärzte nach Bundesland finden – alle 16 Bundesländer',
    description: 'Ärzte, Fachärzte und Praxen in Baden-Württemberg, Bayern, Berlin, Nordrhein-Westfalen und allen weiteren Bundesländern. Übersicht aller 16 Bundesländer Deutschlands.',
    alternates: { canonical: '/aerzte/bundesland' },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'de_DE',
      url: '/aerzte/bundesland',
      title: 'Ärzte nach Bundesland finden – alle 16 Bundesländer',
      description: 'Ärzte und Praxen sortiert nach Bundesland. Direktzugang zu den 16 Bundesländern Deutschlands.',
    },
  };
}

export default async function BundeslandOverviewPage() {
  const base = await getBaseUrl();
  const counts = await loadCountsPerBundesland();

  // Ordnen: Bundesländer mit Praxen zuerst, alphabetisch innerhalb der Gruppen
  const withCount = BUNDESLAENDER.map((b) => {
    const cnt = b.stateNames.reduce((s, n) => s + (counts[n] || 0), 0);
    return { ...b, doctorCount: cnt };
  });

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Start', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: 'Ärzte', item: `${base}/aerzte` },
      { '@type': 'ListItem', position: 3, name: 'Bundesland', item: `${base}/aerzte/bundesland` },
    ],
  };

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Bundesländer Deutschlands',
    numberOfItems: BUNDESLAENDER.length,
    itemListElement: BUNDESLAENDER.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${base}/aerzte/bundesland/${b.slug}`,
      name: b.label,
    })),
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />

      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link>
        <span>/</span>
        <Link href="/aerzte" className="hover:text-sky-700">Ärzte</Link>
        <span>/</span>
        <span className="text-slate-700">Bundesland</span>
      </nav>

      <header className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-sky-50/40 p-6 sm:p-8">
        <div className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
          <MapPin className="h-3 w-3" /> Deutschland-Karte
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Ärzte nach Bundesland finden
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-700 sm:text-lg">
          Von Baden-Württemberg bis Thüringen – Übersicht aller 16 Bundesländer Deutschlands mit den wichtigsten Städten und Facharzt-Praxen.
        </p>
      </header>

      <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {withCount.map((b) => (
          <Link
            key={b.slug}
            href={`/aerzte/bundesland/${b.slug}`}
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold text-slate-900 group-hover:text-sky-700">{b.label}</h2>
                {b.doctorCount > 0 && (
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500 group-hover:border-sky-200 group-hover:text-sky-700">
                    {b.doctorCount}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">Hauptstadt: {b.capital}</p>
              <p className="mt-2 text-sm text-slate-600">
                Top-Städte: {b.topCities.slice(0, 4).map((c) => c.name).join(', ')}{b.topCities.length > 4 ? ' u. a.' : ''}
              </p>
            </div>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-sky-700">
              Ärzte in {b.label} ansehen <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-12 rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Hinweis</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Die Anzahl gelisteter Praxen wächst kontinuierlich. Wenn Sie noch keinen Arzt in Ihrem Bundesland finden, nutzen Sie unsere Suche oder wechseln Sie auf eine Fachrichtungs-Übersicht.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
