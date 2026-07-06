import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCollection } from '@/lib/mongodb';
import { specialtyBySlug, SPECIALTIES } from '@/lib/specialties';
import { Star, Phone, Globe, MapPin, ArrowRight } from 'lucide-react';
import RatingBadge from '@/components/RatingBadge';

export const revalidate = 300;

async function loadCity(stadtSlug) {
  const col = await getCollection('cities');
  return col.findOne({ slug: stadtSlug });
}

async function loadDoctorsForSpecialty(stadtSlug, specialtyLabel, primaryType) {
  const col = await getCollection('doctor_places');
  const orFilters = [{ specialty_guess: specialtyLabel }];
  if (primaryType) orFilters.push({ primary_type: primaryType });
  return col.find({ city_slug: stadtSlug, is_active: true, $or: orFilters })
    .sort({ rating: -1, user_rating_count: -1 })
    .limit(80)
    .toArray();
}

export async function generateMetadata({ params }) {
  const { stadt, fachrichtung } = await params;
  const spec = specialtyBySlug(fachrichtung);
  const city = await loadCity(stadt);
  const cityName = city?.name || stadt;
  if (!spec) return { title: 'Nicht gefunden | Navoria' };
  return {
    title: `${spec.plural} in ${cityName} finden | Navoria`,
    description: `Finden Sie ${spec.plural} in ${cityName}. Mit Adresse, Telefonnummer, Website, Öffnungszeiten und Kartenlink. Aktuelle Praxis-Informationen aus öffentlichen Quellen.`,
  };
}

export default async function CitySpecialtyPage({ params }) {
  const { stadt, fachrichtung } = await params;
  const spec = specialtyBySlug(fachrichtung);
  if (!spec) notFound();
  const city = await loadCity(stadt);
  const cityName = city?.name || stadt.charAt(0).toUpperCase() + stadt.slice(1);
  const doctors = await loadDoctorsForSpecialty(stadt, spec.label, spec.placeType);

  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${spec.plural} in ${cityName}`,
    description: `Übersicht von ${spec.plural} in ${cityName}.`,
    url: `${base}/aerzte/${stadt}/${fachrichtung}`,
    inLanguage: 'de-DE',
    isPartOf: { '@type': 'WebSite', name: 'Navoria', url: base },
    numberOfItems: doctors.length,
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Start', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: 'Ärzte', item: `${base}/aerzte` },
      { '@type': 'ListItem', position: 3, name: cityName, item: `${base}/aerzte/${stadt}` },
      { '@type': 'ListItem', position: 4, name: spec.plural, item: `${base}/aerzte/${stadt}/${fachrichtung}` },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link> <span>/</span>
        <Link href="/aerzte" className="hover:text-sky-700"> Ärzte</Link> <span>/</span>
        <Link href={`/aerzte/${stadt}`} className="hover:text-sky-700">{cityName}</Link> <span>/</span>
        <span className="text-slate-700">{spec.plural}</span>
      </nav>

      <h1 className="text-4xl font-semibold tracking-tight text-slate-900">{spec.plural} in {cityName} finden</h1>
      <p className="mt-3 max-w-2xl text-slate-600">{doctors.length} {spec.plural} in unserer Datenbasis für {cityName}. Alle Angaben aus öffentlichen Quellen.</p>

      {/* Related specialties in this city */}
      <div className="mt-6 flex flex-wrap gap-2">
        {SPECIALTIES.filter((s) => s.slug !== fachrichtung).slice(0, 10).map((s) => (
          <Link key={s.slug} href={`/aerzte/${stadt}/${s.slug}`} className="chip hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700">{s.plural} in {cityName}</Link>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        {doctors.length === 0 ? (
          <div className="card-soft p-10 text-center">
            <h3 className="text-lg font-semibold text-slate-900">Noch keine {spec.plural} in {cityName}</h3>
            <p className="mt-1 text-sm text-slate-500">Im Adminbereich können gezielt Daten für diese Fachrichtung importiert werden.</p>
            <Link href={`/suche?q=${encodeURIComponent(spec.query)}&ort=${encodeURIComponent(cityName)}`} className="btn-primary mt-4 inline-flex">Trotzdem suchen</Link>
          </div>
        ) : (
          doctors.map((d) => (
            <article key={d.google_place_id} className="card-soft p-4 sm:p-5 transition hover:shadow-md">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 break-words">
                      <Link href={`/praxis/${stadt}/${d.slug}`} className="hover:text-sky-700">{d.name}</Link>
                    </h3>
                    {d.rating != null && d.user_rating_count > 0 && (
                      <RatingBadge rating={d.rating} count={d.user_rating_count} size="sm" />
                    )}
                  </div>
                  <p className="mt-1 flex items-start gap-1 text-sm text-slate-600 break-words"><MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" /> {d.formatted_address}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    {(d.phone_national || d.phone_international) && (
                      <a href={`tel:${d.phone_international || d.phone_national}`} className="flex items-center gap-1 text-slate-600 hover:text-sky-700 break-all"><Phone className="h-4 w-4 shrink-0" /> {d.phone_national || d.phone_international}</a>
                    )}
                    {d.website_url && (
                      <a href={d.website_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-slate-600 hover:text-sky-700"><Globe className="h-4 w-4" /> Website</a>
                    )}
                  </div>
                </div>
                <Link href={`/praxis/${stadt}/${d.slug}`} className="btn-secondary shrink-0 self-start">Profil <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </div>
            </article>
          ))
        )}
        {doctors.some((d) => d.rating != null && d.user_rating_count > 0) && (
          <p className="pt-2 text-[11px] text-slate-400">Bewertungen von Google (öffentliche Google-Rezensionen)</p>
        )}
      </div>
    </div>
  );
}
