import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCollection } from '@/lib/mongodb';
import { SPECIALTIES } from '@/lib/specialties';
import { districtToSlug, districtDisplayName } from '@/lib/districtSlug';
import { MapPin, ArrowRight, Stethoscope, ShieldCheck, Info, Sparkles } from 'lucide-react';
import RatingBadge from '@/components/RatingBadge';

export const revalidate = 600;

async function loadCity(stadtSlug) {
  const col = await getCollection('cities');
  return col.findOne({ slug: stadtSlug });
}

async function loadDistrict(stadtSlug, districtSlug) {
  const col = await getCollection('doctor_places');
  // Alle Praxen der Stadt mit District-Feld laden – dann filter nach normalisiertem Slug
  const rows = await col.find(
    { is_active: { $ne: false }, city_slug: stadtSlug, district: { $nin: [null, ''] } },
    { projection: { name: 1, slug: 1, city_slug: 1, city: 1, district: 1, formatted_address: 1, rating: 1, user_rating_count: 1, specialty_guess: 1, website_url: 1, is_verified: 1, google_place_id: 1, id: 1 } }
  ).toArray();
  const matching = rows.filter((r) => districtToSlug(r.district) === districtSlug);
  return matching;
}

export async function generateMetadata({ params }) {
  const { stadt, slug } = await params;
  const city = await loadCity(stadt);
  const cityName = city?.name || stadt;
  const doctors = await loadDistrict(stadt, slug);
  const displayName = doctors.length > 0 ? districtDisplayName(doctors[0].district) : slug;
  return {
    title: `Ärzte in ${cityName}-${displayName} finden – Praxen im Stadtteil`,
    description: `Fachärzte, Hausärzte und Praxen im Stadtteil ${displayName} von ${cityName}. Adresse, Telefon, Öffnungszeiten und Bewertungen von ${doctors.length} Praxen.`,
    alternates: { canonical: `/aerzte/${stadt}/stadtteil/${slug}` },
    robots: { index: doctors.length > 0, follow: true },
    openGraph: {
      type: 'website',
      locale: 'de_DE',
      url: `/aerzte/${stadt}/stadtteil/${slug}`,
      title: `Ärzte in ${cityName}-${displayName}`,
      description: `${doctors.length} Praxen im Stadtteil ${displayName} von ${cityName}.`,
    },
  };
}

export default async function DistrictDetailPage({ params }) {
  const { stadt, slug } = await params;
  const city = await loadCity(stadt);
  const doctors = await loadDistrict(stadt, slug);

  if (doctors.length === 0) notFound();

  const cityName = city?.name || stadt.charAt(0).toUpperCase() + stadt.slice(1);
  const displayName = districtDisplayName(doctors[0].district);

  // Sortieren: nach reviewsCount x rating (Best-Rated + populair)
  doctors.sort((a, b) => {
    const scoreA = (a.rating || 0) * Math.log((a.user_rating_count || 0) + 1);
    const scoreB = (b.rating || 0) * Math.log((b.user_rating_count || 0) + 1);
    return scoreB - scoreA;
  });

  // Fachrichtungs-Aufschlüsselung
  const bySpecialty = {};
  doctors.forEach((d) => {
    if (d.specialty_guess) bySpecialty[d.specialty_guess] = (bySpecialty[d.specialty_guess] || 0) + 1;
  });

  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const pageUrl = `${base}/aerzte/${stadt}/stadtteil/${slug}`;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Start', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: 'Ärzte', item: `${base}/aerzte` },
      { '@type': 'ListItem', position: 3, name: cityName, item: `${base}/aerzte/${stadt}` },
      { '@type': 'ListItem', position: 4, name: 'Stadtteile', item: `${base}/aerzte/${stadt}/stadtteil` },
      { '@type': 'ListItem', position: 5, name: displayName, item: pageUrl },
    ],
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': pageUrl,
    url: pageUrl,
    name: `Ärzte in ${cityName}-${displayName}`,
    inLanguage: 'de-DE',
    isPartOf: { '@type': 'WebSite', url: base, name: 'Navoria' },
    about: {
      '@type': 'Place',
      name: `${cityName}-${displayName}`,
      containedInPlace: { '@type': 'City', name: cityName },
    },
    numberOfItems: doctors.length,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />

      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link>
        <span>/</span>
        <Link href="/aerzte" className="hover:text-sky-700">Ärzte</Link>
        <span>/</span>
        <Link href={`/aerzte/${stadt}`} className="hover:text-sky-700">{cityName}</Link>
        <span>/</span>
        <Link href={`/aerzte/${stadt}/stadtteil`} className="hover:text-sky-700">Stadtteile</Link>
        <span>/</span>
        <span className="text-slate-700">{displayName}</span>
      </nav>

      <header className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-sky-50/40 p-6 sm:p-8">
        <div className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
          <MapPin className="h-3 w-3" /> Stadtteil in {cityName}
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Ärzte in {cityName}-{displayName} finden
        </h1>
        <p className="mt-3 text-base text-slate-600">
          {doctors.length} {doctors.length === 1 ? 'Praxis' : 'Praxen'} im Stadtteil {displayName} von {cityName}. Sortiert nach Bewertung und Anzahl der Rezensionen.
        </p>
      </header>

      {/* Fachrichtungen im Stadtteil */}
      {Object.keys(bySpecialty).length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-slate-900">Fachrichtungen im Stadtteil</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(bySpecialty)
              .sort((a, b) => b[1] - a[1])
              .map(([label, count]) => {
                const spec = SPECIALTIES.find((x) => x.label === label);
                if (!spec) return null;
                return (
                  <Link
                    key={spec.slug}
                    href={`/aerzte/${stadt}/${spec.slug}`}
                    className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700 hover:bg-sky-100"
                  >
                    <Stethoscope className="h-3.5 w-3.5" />
                    {spec.plural}
                    <span className="ml-1 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold text-sky-800">{count}</span>
                  </Link>
                );
              })}
          </div>
        </section>
      )}

      {/* Praxen-Liste */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">Praxen in {displayName}</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {doctors.map((d) => (
            <Link
              key={d.id || d.google_place_id}
              href={`/praxis/${d.city_slug}/${d.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-sm"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900 group-hover:text-sky-700">{d.name}</h3>
                  {d.is_verified && (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">verifiziert</span>
                  )}
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
      </section>

      {/* Trust */}
      <section className="mt-14 rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Datengrundlage</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Die Zuordnung zum Stadtteil erfolgt über Google Places. Für fehlende oder falsche Angaben sehen Sie unsere{' '}
              <Link href="/redaktionelle-standards" className="text-sky-700 underline underline-offset-2 hover:text-sky-800">Redaktionellen Standards</Link>.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 flex justify-center">
        <Link
          href={`/aerzte/${stadt}/stadtteil`}
          className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 hover:text-sky-800"
        >
          <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          Alle Stadtteile in {cityName}
        </Link>
      </div>
    </div>
  );
}
