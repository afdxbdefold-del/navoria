import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCollection } from '@/lib/mongodb';
import { specialtyBySlug, SPECIALTIES } from '@/lib/specialties';
import { Phone, Globe, MapPin, ArrowRight, Info, HelpCircle, Stethoscope, Building2 } from 'lucide-react';
import RatingBadge from '@/components/RatingBadge';
import { getBaseUrl } from '@/lib/baseUrl';
import { getCityStats, getNearbyCities, buildFaqSchema, CITY_SPEC_MIN_DOCTORS } from '@/lib/cityContent';
import { contentForCitySpecialty } from '@/lib/specialtyContent';

export const revalidate = 300;

async function loadCity(stadtSlug) {
  const col = await getCollection('cities');
  return col.findOne({ slug: stadtSlug });
}

async function loadDoctorsForSpecialty(stadtSlug, specialtyLabel, primaryType) {
  const col = await getCollection('doctor_places');
  const orFilters = [{ specialty_guess: specialtyLabel }];
  // Der generische Google-Type "doctor" matcht ALLE Ärzte und würde
  // fachfremde Praxen einblenden (z. B. Orthopäden-Seite zeigt Zahnärzte).
  // Nur spezifische placeTypes (dentist, pharmacy, hospital, physiotherapist)
  // als Fallback zulassen.
  if (primaryType && primaryType !== 'doctor') {
    orFilters.push({ primary_type: primaryType });
  }
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
  if (!spec) return { title: 'Nicht gefunden' };

  const doctors = await loadDoctorsForSpecialty(stadt, spec.label, spec.placeType);
  const hasEnoughContent = doctors.length >= CITY_SPEC_MIN_DOCTORS;

  return {
    title: `${spec.plural} in ${cityName} finden`,
    description: `Finden Sie ${spec.plural} in ${cityName}. Mit Adresse, Telefonnummer, Website, Öffnungszeiten und Kartenlink. Aktuelle Praxis-Informationen aus öffentlichen Quellen.`,
    alternates: { canonical: `/aerzte/${stadt}/${fachrichtung}` },
    robots: hasEnoughContent
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title: `${spec.plural} in ${cityName}`,
      description: `Übersicht der ${spec.plural} in ${cityName}.`,
      url: `/aerzte/${stadt}/${fachrichtung}`,
      type: 'website',
      locale: 'de_DE',
    },
  };
}

export default async function CitySpecialtyPage({ params }) {
  const { stadt, fachrichtung } = await params;
  const spec = specialtyBySlug(fachrichtung);
  if (!spec) notFound();

  const [city, doctors, stats] = await Promise.all([
    loadCity(stadt),
    loadDoctorsForSpecialty(stadt, spec.label, spec.placeType),
    getCityStats(stadt),
  ]);
  const cityName = city?.name || stadt.charAt(0).toUpperCase() + stadt.slice(1);
  const rich = doctors.length >= CITY_SPEC_MIN_DOCTORS;

  const specStats = { count: doctors.length, state: stats.state };
  const content = contentForCitySpecialty(spec, cityName, specStats);
  const nearby = rich ? await getNearbyCities(stadt, stats.centerLat, stats.centerLng, stats.state, 6) : [];

  const base = await getBaseUrl();
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
  const faqSchema = buildFaqSchema(content.faqs);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {rich && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link> <span>/</span>
        <Link href="/aerzte" className="hover:text-sky-700"> Ärzte</Link> <span>/</span>
        <Link href={`/aerzte/${stadt}`} className="hover:text-sky-700">{cityName}</Link> <span>/</span>
        <span className="text-slate-700">{spec.plural}</span>
      </nav>

      <h1 className="text-4xl font-semibold tracking-tight text-slate-900">{spec.plural} in {cityName} finden</h1>
      <p className="mt-2 text-sm font-medium uppercase tracking-wide text-sky-700">{content.subline}</p>
      <p className="mt-3 max-w-2xl text-slate-600">
        {content.cityLead}Alle Angaben aus öffentlichen Quellen.
      </p>

      {/* Kontextueller Erklärtext (Content-Anreicherung für Adsense/Google) */}
      {rich && content.intro && (
        <section className="mt-6 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <Stethoscope className="h-4 w-4" />
            <h2 className="text-sm font-semibold uppercase tracking-wide">Was macht ein {spec.label}?</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{content.intro}</p>
          {content.whenToVisit.length > 0 && (
            <>
              <h3 className="mt-5 text-sm font-semibold text-slate-900">Typische Behandlungsanlässe:</h3>
              <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {content.whenToVisit.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-4 text-sm text-slate-500">
            Weiterführende Informationen im{' '}
            <Link href={`/aerzte/fachrichtung/${fachrichtung}`} className="font-medium text-sky-700 hover:underline">
              Ratgeber: {spec.plural} in Deutschland →
            </Link>
          </p>
        </section>
      )}

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
                      <a href={d.website_url} target="_blank" rel="nofollow noopener noreferrer" className="flex items-center gap-1 text-slate-600 hover:text-sky-700"><Globe className="h-4 w-4" /> Website</a>
                    )}
                  </div>
                </div>
                <Link href={`/praxis/${stadt}/${d.slug}`} className="btn-secondary shrink-0 self-start">Profil <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </div>
            </article>
          ))
        )}
        {doctors.some((d) => d.rating != null && d.user_rating_count > 0) && (
          <p className="pt-2 text-[11px] text-slate-500">Bewertungen von Google (öffentliche Google-Rezensionen)</p>
        )}
      </div>

      {/* Nachbarstädte mit derselben Fachrichtung */}
      {rich && nearby.length > 0 && (
        <section className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center gap-2 text-slate-700">
            <Building2 className="h-4 w-4" />
            <h2 className="text-base font-semibold text-slate-900">{spec.plural} in der Region</h2>
          </div>
          <p className="mt-1 text-sm text-slate-600">Auch in diesen Städten nahe {cityName} finden Sie {spec.plural}:</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {nearby.map((n) => (
              <Link
                key={n.slug}
                href={`/aerzte/${n.slug}/${fachrichtung}`}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
              >
                {spec.plural} in {n.name}
                {Math.round(n.distanceKm) > 0 && <span className="text-[10px] text-slate-400">· {Math.round(n.distanceKm)} km</span>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ mit FAQPage-JSON-LD */}
      {rich && content.faqs.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center gap-2 text-slate-700">
            <HelpCircle className="h-4 w-4" />
            <h2 className="text-lg font-semibold text-slate-900">Häufige Fragen: {spec.plural} in {cityName}</h2>
          </div>
          <div className="mt-4 space-y-3">
            {content.faqs.map((f, i) => (
              <details key={i} className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 group-open:text-sky-700">{f.q}</summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Datenherkunft */}
      <section className="mt-10 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
        <p><strong>Datenquelle:</strong> Praxisdaten (Adresse, Telefon, Website, Öffnungszeiten) und Bewertungen stammen aus öffentlichen Google-Places-Informationen. Alle Angaben werden regelmäßig aktualisiert und ohne redaktionelle Veränderung dargestellt. Für die Aktualität übernehmen wir keine Gewähr; verbindliche Informationen erhalten Sie direkt bei der jeweiligen Praxis.</p>
      </section>
    </div>
  );
}
