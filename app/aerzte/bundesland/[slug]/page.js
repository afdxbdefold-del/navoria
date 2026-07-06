import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BUNDESLAENDER, bundeslandBySlug } from '@/lib/bundeslaender';
import { SPECIALTIES } from '@/lib/specialties';
import { getCollection } from '@/lib/mongodb';
import { MapPin, ArrowRight, Stethoscope, ShieldCheck, Info, Sparkles } from 'lucide-react';
import RatingBadge from '@/components/RatingBadge';

export const revalidate = 600;

export async function generateStaticParams() {
  return BUNDESLAENDER.map((b) => ({ slug: b.slug }));
}

async function loadStats(stateNames) {
  const col = await getCollection('doctor_places');
  const total = await col.countDocuments({ is_active: { $ne: false }, state: { $in: stateNames } });
  // Top-Städte im Bundesland aus DB
  const cities = await col.aggregate([
    { $match: { is_active: { $ne: false }, state: { $in: stateNames }, city_slug: { $nin: [null, ''] } } },
    { $group: { _id: { slug: '$city_slug', name: '$city' }, count: { $sum: 1 } } },
    { $sort: { count: -1, '_id.name': 1 } },
    { $limit: 20 },
  ]).toArray();
  // Top-Specialties im Bundesland
  const specs = await col.aggregate([
    { $match: { is_active: { $ne: false }, state: { $in: stateNames }, specialty_guess: { $nin: [null, ''] } } },
    { $group: { _id: '$specialty_guess', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]).toArray();
  // Featured Doctors (min. 20 Reviews, Rating >= 4.5)
  const featured = await col.find(
    {
      is_active: { $ne: false },
      state: { $in: stateNames },
      rating: { $gte: 4.5 },
      user_rating_count: { $gte: 20 },
    },
    { projection: { name: 1, slug: 1, city_slug: 1, city: 1, formatted_address: 1, rating: 1, user_rating_count: 1, specialty_guess: 1, website_url: 1, is_verified: 1, google_place_id: 1, id: 1 } }
  )
    .sort({ user_rating_count: -1, rating: -1 })
    .limit(6)
    .toArray();
  return { total, cities, specs, featured };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const b = bundeslandBySlug(slug);
  if (!b) return { title: 'Bundesland nicht gefunden' };
  const canonical = `/aerzte/bundesland/${slug}`;
  return {
    title: `Ärzte ${b.dativ} finden – Fachärzte, Hausärzte & Praxen`,
    description: `Ärzte ${b.dativ}: Fachärzte, Hausärzte und Praxen in ${b.topCities.slice(0, 4).map((c) => c.name).join(', ')} und weiteren Städten. Adresse, Telefon, Öffnungszeiten und Bewertungen.`,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'de_DE',
      url: canonical,
      title: `Ärzte ${b.dativ} finden`,
      description: b.intro.slice(0, 200),
    },
  };
}

export default async function BundeslandDetailPage({ params }) {
  const { slug } = await params;
  const b = bundeslandBySlug(slug);
  if (!b) notFound();

  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const pageUrl = `${base}/aerzte/bundesland/${slug}`;

  const { total, cities, specs, featured } = await loadStats(b.stateNames);

  // Merge DB cities + hardcoded topCities: DB values first with counts,
  // dann die hardcoded ohne count wenn noch nicht in DB-Liste
  const cityMap = new Map();
  for (const c of cities) {
    cityMap.set(c._id.slug, { slug: c._id.slug, name: c._id.name, count: c.count });
  }
  for (const c of b.topCities) {
    if (!cityMap.has(c.slug)) {
      cityMap.set(c.slug, { slug: c.slug, name: c.name, count: 0 });
    }
  }
  const cityList = Array.from(cityMap.values());

  // JSON-LD
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Start', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: 'Ärzte', item: `${base}/aerzte` },
      { '@type': 'ListItem', position: 3, name: 'Bundesland', item: `${base}/aerzte/bundesland` },
      { '@type': 'ListItem', position: 4, name: b.label, item: pageUrl },
    ],
  };

  const place = {
    '@context': 'https://schema.org',
    '@type': 'AdministrativeArea',
    name: b.label,
    description: b.intro,
    url: pageUrl,
    containedInPlace: { '@type': 'Country', name: 'Deutschland' },
  };

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': pageUrl,
    url: pageUrl,
    name: `Ärzte ${b.dativ} finden`,
    inLanguage: 'de-DE',
    isPartOf: { '@type': 'WebSite', url: base, name: 'Navoria' },
    about: place,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(place) }} />

      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link>
        <span>/</span>
        <Link href="/aerzte" className="hover:text-sky-700">Ärzte</Link>
        <span>/</span>
        <Link href="/aerzte/bundesland" className="hover:text-sky-700">Bundesland</Link>
        <span>/</span>
        <span className="text-slate-700">{b.label}</span>
      </nav>

      <header className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-sky-50/40 p-6 sm:p-8">
        <div className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
          <MapPin className="h-3 w-3" /> Bundesland
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Ärzte {b.dativ} finden
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-700 sm:text-lg">
          {b.intro}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1">Hauptstadt: <strong className="text-slate-800">{b.capital}</strong></span>
          {total > 0 && (
            <>
              <span className="text-slate-300">·</span>
              <span>{total.toLocaleString('de-DE')} Praxen gelistet</span>
            </>
          )}
          {cityList.length > 0 && (
            <>
              <span className="text-slate-300">·</span>
              <span>{cityList.length} Städte</span>
            </>
          )}
        </div>
      </header>

      {/* Städte im Bundesland */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-slate-900">Städte {b.dativ}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
          Wählen Sie eine Stadt, um die dort verfügbaren Praxen anzusehen.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {cityList.map((c) => (
            <Link
              key={c.slug}
              href={`/aerzte/${c.slug}`}
              className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 hover:shadow-sm"
            >
              <span className="flex items-center gap-2 font-medium text-slate-800 group-hover:text-sky-700">
                <MapPin className="h-3.5 w-3.5 text-slate-400 group-hover:text-sky-500" />
                {c.name}
              </span>
              {c.count > 0 && (
                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500 group-hover:border-sky-200 group-hover:text-sky-700">
                  {c.count}
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Fachrichtungen im Bundesland */}
      {specs.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-slate-900">Fachrichtungen {b.dativ}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
            Direkt zur Fachrichtungs-Übersicht – dort finden Sie alle Praxen sortiert nach Stadt.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {specs.map((s) => {
              const spec = SPECIALTIES.find((x) => x.label === s._id);
              if (!spec) return null;
              return (
                <Link
                  key={spec.slug}
                  href={`/aerzte/fachrichtung/${spec.slug}`}
                  className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700 hover:bg-sky-100"
                >
                  <Stethoscope className="h-3.5 w-3.5" />
                  {spec.plural}
                  <span className="ml-1 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold text-sky-800">{s.count}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured Practices */}
      {featured.length > 0 && (
        <section className="mt-12">
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Empfohlene Praxen {b.dativ}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
            Praxen mit besonders vielen und guten Google-Bewertungen (mindestens 20 Rezensionen, ⌀ 4,5 Sterne).
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {featured.map((d) => (
              <Link
                key={d.id || d.google_place_id}
                href={`/praxis/${d.city_slug}/${d.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-sm"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900 group-hover:text-sky-700">{d.name}</h3>
                  </div>
                  <p className="mt-1 flex items-start gap-1 text-xs text-slate-500">
                    <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                    <span>{d.formatted_address}</span>
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {d.rating != null && (
                    <RatingBadge rating={d.rating} count={d.user_rating_count} size="sm" />
                  )}
                  {d.specialty_guess && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {d.specialty_guess}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-slate-400">Bewertungen von Google (öffentliche Google-Rezensionen). Keine Empfehlung im medizinischen Sinne.</p>
        </section>
      )}

      {/* Trust */}
      <section className="mt-14 rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Redaktioneller Hinweis</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Die Praxis-Angaben stammen aus Google Places. Bei Fragen zu Daten oder Korrekturen sehen Sie unsere{' '}
              <Link href="/redaktionelle-standards" className="text-sky-700 underline underline-offset-2 hover:text-sky-800">Redaktionellen Standards</Link>.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 flex justify-center">
        <Link
          href="/aerzte/bundesland"
          className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 hover:text-sky-800"
        >
          <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          Alle Bundesländer ansehen
        </Link>
      </div>
    </div>
  );
}
