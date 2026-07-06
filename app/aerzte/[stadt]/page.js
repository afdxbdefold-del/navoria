import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCollection } from '@/lib/mongodb';
import { SPECIALTIES } from '@/lib/specialties';
import { Star, Phone, Globe, MapPin, ArrowRight } from 'lucide-react';
import RatingBadge from '@/components/RatingBadge';

export const revalidate = 300;

async function loadCity(stadtSlug) {
  const col = await getCollection('cities');
  return col.findOne({ slug: stadtSlug });
}

async function loadDoctors(stadtSlug, limit = 50) {
  const col = await getCollection('doctor_places');
  return col.find({ city_slug: stadtSlug, is_active: true })
    .sort({ rating: -1, user_rating_count: -1 })
    .limit(limit)
    .toArray();
}

export async function generateMetadata({ params }) {
  const { stadt } = await params;
  const city = await loadCity(stadt);
  const cityName = city?.name || stadt;
  return {
    title: `Ärzte in ${cityName} finden | Navoria`,
    description: `Finden Sie passende Ärzte und Praxen in ${cityName}. Mit Adresse, Telefonnummer, Website, Öffnungszeiten und Kartenlink.`,
  };
}

export default async function CityPage({ params }) {
  const { stadt } = await params;
  const city = await loadCity(stadt);
  const doctors = await loadDoctors(stadt, 60);
  if (!city && doctors.length === 0) notFound();

  const cityName = city?.name || stadt.charAt(0).toUpperCase() + stadt.slice(1);

  // Fachrichtungszähler für diese Stadt
  const bySpecialty = {};
  doctors.forEach((d) => {
    if (d.specialty_guess) bySpecialty[d.specialty_guess] = (bySpecialty[d.specialty_guess] || 0) + 1;
  });

  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Ärzte in ${cityName}`,
    description: `Übersicht von Ärzten und Praxen in ${cityName}.`,
    url: `${base}/aerzte/${stadt}`,
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
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link> <span>/</span>
        <Link href="/aerzte" className="hover:text-sky-700"> Ärzte</Link> <span>/</span>
        <span className="text-slate-700">{cityName}</span>
      </nav>

      <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Ärzte in {cityName} finden</h1>
      <p className="mt-3 max-w-2xl text-slate-600">{doctors.length} Praxen in unserer Datenbasis für {cityName} – mit vollständigen Kontaktdaten.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar: Fachrichtungen dieser Stadt */}
        <aside className="card-soft h-fit p-5">
          <h2 className="text-sm font-semibold text-slate-900">Fachrichtungen in {cityName}</h2>
          <ul className="mt-3 space-y-1.5">
            {SPECIALTIES.map((s) => {
              const count = bySpecialty[s.label] || 0;
              return (
                <li key={s.slug}>
                  <Link href={`/aerzte/${stadt}/${s.slug}`} className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-sm ${count ? 'text-slate-800 hover:bg-sky-50 hover:text-sky-700' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <span>{s.plural}</span>
                    {count > 0 && <span className="chip text-[10px]">{count}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Ergebnisliste */}
        <div className="space-y-3">
          {doctors.length === 0 ? (
            <div className="card-soft p-10 text-center">
              <h3 className="text-lg font-semibold text-slate-900">Noch keine Einträge für {cityName}</h3>
              <p className="mt-1 text-sm text-slate-500">Im Adminbereich können Daten für diese Stadt importiert werden.</p>
            </div>
          ) : (
            doctors.map((d) => <DoctorRow key={d.google_place_id} d={d} stadt={stadt} />)
          )}
          {doctors.some((d) => d.rating != null && d.user_rating_count > 0) && (
            <p className="pt-2 text-[11px] text-slate-400">Bewertungen von Google (öffentliche Google-Rezensionen)</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DoctorRow({ d, stadt }) {
  return (
    <article className="card-soft p-4 sm:p-5 transition hover:shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 break-words">
              <Link href={`/praxis/${stadt}/${d.slug}`} className="hover:text-sky-700">{d.name}</Link>
            </h3>
            {d.specialty_guess && <span className="chip border-sky-100 bg-sky-50 text-sky-700">{d.specialty_guess}</span>}
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
  );
}
