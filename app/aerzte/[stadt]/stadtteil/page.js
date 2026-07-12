import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCollection } from '@/lib/mongodb';
import { districtToSlug, districtDisplayName } from '@/lib/districtSlug';
import { MapPin, ArrowRight, Info, ShieldCheck } from 'lucide-react';
import { getBaseUrl } from '@/lib/baseUrl';

export const revalidate = 600;

async function loadCity(stadtSlug) {
  const col = await getCollection('cities');
  return col.findOne({ slug: stadtSlug });
}

async function loadDistricts(stadtSlug) {
  const col = await getCollection('doctor_places');
  const rows = await col.aggregate([
    { $match: { is_active: { $ne: false }, city_slug: stadtSlug, district: { $nin: [null, ''] } } },
    { $group: { _id: '$district', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]).toArray();
  // Slug-Normalisierung + Zusammenfassung nach Slug (falls verschiedene Schreibweisen desselben Bezirks)
  const bySlug = new Map();
  for (const r of rows) {
    const slug = districtToSlug(r._id);
    if (!slug) continue;
    const display = districtDisplayName(r._id);
    if (bySlug.has(slug)) {
      const ex = bySlug.get(slug);
      ex.count += r.count;
    } else {
      bySlug.set(slug, { slug, display, count: r.count });
    }
  }
  return Array.from(bySlug.values()).sort((a, b) => b.count - a.count);
}

export async function generateMetadata({ params }) {
  const { stadt } = await params;
  const city = await loadCity(stadt);
  const cityName = city?.name || stadt;
  return {
    title: `Stadtteile in ${cityName} – Ärzte nach Bezirk finden`,
    description: `Alle Stadtteile und Bezirke in ${cityName} mit Ärzten und Praxen. Wählen Sie Ihren Bezirk, um passende Fachärzte in Ihrer Nähe zu finden.`,
    alternates: { canonical: `/aerzte/${stadt}/stadtteil` },
    robots: { index: true, follow: true },
  };
}

export default async function CityDistrictOverviewPage({ params }) {
  const { stadt } = await params;
  const [city, districts] = await Promise.all([loadCity(stadt), loadDistricts(stadt)]);
  const cityName = city?.name || stadt.charAt(0).toUpperCase() + stadt.slice(1);

  if (districts.length === 0) {
    // Keine District-Daten – zeige einen freundlichen Fallback-Hinweis
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
          <Link href="/" className="hover:text-sky-700">Start</Link>
          <span>/</span>
          <Link href="/aerzte" className="hover:text-sky-700">Ärzte</Link>
          <span>/</span>
          <Link href={`/aerzte/${stadt}`} className="hover:text-sky-700">{cityName}</Link>
          <span>/</span>
          <span className="text-slate-700">Stadtteile</span>
        </nav>
        <h1 className="text-2xl font-semibold text-slate-900">Stadtteile in {cityName}</h1>
        <p className="mt-3 text-slate-600">
          Aktuell liegen für {cityName} noch keine Stadtteil-Zuordnungen vor. Sie können alle Ärzte in {cityName} auf einen Blick sehen:
        </p>
        <Link href={`/aerzte/${stadt}`} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700">
          <MapPin className="h-4 w-4" /> Alle Ärzte in {cityName} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const base = await getBaseUrl();
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Start', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: 'Ärzte', item: `${base}/aerzte` },
      { '@type': 'ListItem', position: 3, name: cityName, item: `${base}/aerzte/${stadt}` },
      { '@type': 'ListItem', position: 4, name: 'Stadtteile', item: `${base}/aerzte/${stadt}/stadtteil` },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link>
        <span>/</span>
        <Link href="/aerzte" className="hover:text-sky-700">Ärzte</Link>
        <span>/</span>
        <Link href={`/aerzte/${stadt}`} className="hover:text-sky-700">{cityName}</Link>
        <span>/</span>
        <span className="text-slate-700">Stadtteile</span>
      </nav>

      <header className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-sky-50/40 p-6 sm:p-8">
        <div className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
          <MapPin className="h-3 w-3" /> Stadtteile
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Ärzte in {cityName} nach Stadtteil
        </h1>
        <p className="mt-3 text-base text-slate-600">
          {districts.length} Stadtteile mit Praxen in unserer Datenbank – wählen Sie Ihren Bezirk, um passende Ärzte in Ihrer Nähe zu sehen.
        </p>
      </header>

      <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {districts.map((d) => (
          <Link
            key={d.slug}
            href={`/aerzte/${stadt}/stadtteil/${d.slug}`}
            className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 hover:shadow-sm"
          >
            <span className="flex items-center gap-2 font-medium text-slate-800 group-hover:text-sky-700">
              <MapPin className="h-3.5 w-3.5 text-slate-400 group-hover:text-sky-500" />
              {d.display}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500 group-hover:border-sky-200 group-hover:text-sky-700">
              {d.count}
            </span>
          </Link>
        ))}
      </section>

      <section className="mt-12 rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Hinweis</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Die Stadtteil-Zuordnung stammt aus Google Places und deckt möglicherweise nicht jeden Ortsteil ab. Um alle Ärzte in {cityName} zu sehen, nutzen Sie die{' '}
              <Link href={`/aerzte/${stadt}`} className="text-sky-700 underline underline-offset-2 hover:text-sky-800">Gesamt-Übersicht</Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
