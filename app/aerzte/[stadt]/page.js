import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCollection } from '@/lib/mongodb';
import { SPECIALTIES } from '@/lib/specialties';
import { Phone, Globe, MapPin, ArrowRight, Info, HelpCircle, Building2 } from 'lucide-react';
import RatingBadge from '@/components/RatingBadge';
import { getBaseUrl } from '@/lib/baseUrl';
import { specialtyByLabel } from '@/lib/specialties';
import {
  getCityStats,
  getNearbyCities,
  buildCityFaqs,
  buildFaqSchema,
  isRichCityPage,
  CITY_MIN_DOCTORS,
} from '@/lib/cityContent';

export const revalidate = 300;

async function loadCity(stadtSlug) {
  const col = await getCollection('cities');
  return col.findOne({ slug: stadtSlug });
}

async function loadDoctors(stadtSlug, limit = 60) {
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
  const stats = await getCityStats(stadt);
  const rich = isRichCityPage(stats);
  return {
    title: `Ärzte in ${cityName} finden`,
    description: `Finden Sie passende Ärzte und Praxen in ${cityName}. Mit Adresse, Telefonnummer, Website, Öffnungszeiten und Kartenlink.`,
    alternates: { canonical: `/aerzte/${stadt}` },
    robots: rich ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title: `Ärzte in ${cityName} finden`,
      description: `Finden Sie passende Ärzte und Praxen in ${cityName}.`,
      url: `/aerzte/${stadt}`,
      type: 'website',
      locale: 'de_DE',
    },
  };
}

export default async function CityPage({ params }) {
  const { stadt } = await params;
  const [city, doctors, stats] = await Promise.all([
    loadCity(stadt),
    loadDoctors(stadt, 60),
    getCityStats(stadt),
  ]);
  if (!city && doctors.length === 0) notFound();

  const cityName = city?.name || stadt.charAt(0).toUpperCase() + stadt.slice(1);

  // Fachrichtungszähler für diese Stadt
  const bySpecialty = {};
  doctors.forEach((d) => {
    if (d.specialty_guess) bySpecialty[d.specialty_guess] = (bySpecialty[d.specialty_guess] || 0) + 1;
  });

  const base = await getBaseUrl();
  const rich = isRichCityPage(stats);
  const faqs = buildCityFaqs(cityName, stats);
  const nearby = await getNearbyCities(stadt, stats.centerLat, stats.centerLng, stats.state, 8);

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
  const faqSchema = buildFaqSchema(faqs);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link> <span>/</span>
        <Link href="/aerzte" className="hover:text-sky-700"> Ärzte</Link> <span>/</span>
        <span className="text-slate-700">{cityName}</span>
      </nav>

      <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Ärzte in {cityName} finden</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        {doctors.length} Praxen in unserer Datenbasis für {cityName}
        {stats.state ? ` (${stats.state})` : ''} – mit Kontaktdaten, Google-Bewertungen und Kartenlink.
      </p>

      {/* Stadt-Kennzahlen (Content-Signal für Google/Adsense) */}
      {rich && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Praxen gesamt" value={stats.count} />
          <StatCard label="Mit eigener Website" value={`${Math.round((stats.withWebsite / Math.max(1, stats.count)) * 100)}%`} sub={`${stats.withWebsite} von ${stats.count}`} />
          {stats.avgRating != null && (
            <StatCard label="⌀-Google-Bewertung" value={`${stats.avgRating.toFixed(1)} / 5`} sub={`${stats.totalReviews.toLocaleString('de-DE')} Bewertungen`} />
          )}
          {stats.topSpecialties[0] && (
            <StatCard label="Häufigste Fachrichtung" value={stats.topSpecialties[0].label} sub={`${stats.topSpecialties[0].count} Praxen`} />
          )}
        </div>
      )}

      {/* Sekundäre Nav: Stadtteile falls verfügbar */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/aerzte/${stadt}/stadtteil`}
          className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100"
        >
          <MapPin className="h-3 w-3" /> Nach Stadtteil sortieren
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Einleitungstext (Adsense/E-E-A-T-Content) */}
      {rich && (
        <section className="mt-8 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <Info className="h-4 w-4" />
            <h2 className="text-sm font-semibold uppercase tracking-wide">Medizinische Versorgung in {cityName}</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            {cityName}{stats.state ? ` im Bundesland ${stats.state}` : ''} ist medizinisch mit {stats.count} auf Navoria gelisteten Arzt- und Therapiepraxen vertreten.
            Die Datenbasis umfasst {stats.topSpecialties.length > 0 ? `unter anderem ${stats.topSpecialties.slice(0, 3).map((s) => specialtyByLabel(s.label)?.plural || s.label).join(', ')}` : 'alle wichtigen Fachrichtungen'}.
            {stats.withWebsite > 0 && ` ${Math.round((stats.withWebsite / stats.count) * 100)}% der Praxen führen eine eigene Website mit Terminbuchung oder detaillierten Praxis-Informationen.`}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            Der ärztliche Bereitschaftsdienst ist außerhalb der regulären Öffnungszeiten bundesweit unter <strong>116 117</strong> kostenfrei erreichbar. Bei lebensbedrohlichen Notfällen wählen Sie den Notruf <strong>112</strong>. Zahnärztliche Notdienste am Wochenende koordiniert die Landeszahnärztekammer{stats.state ? ` in ${stats.state}` : ''}.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            Alle Praxis-Informationen auf dieser Seite basieren auf öffentlich verfügbaren Google-Places-Daten (Adresse, Telefon, Website, Öffnungszeiten, Google-Bewertungen). Bewertungen und Rezensionen stammen ausschließlich von Google und werden nicht redaktionell verändert.
          </p>
        </section>
      )}

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
            <p className="pt-2 text-[11px] text-slate-500">Bewertungen von Google (öffentliche Google-Rezensionen)</p>
          )}
        </div>
      </div>

      {/* Nachbarstädte */}
      {rich && nearby.length > 0 && (
        <section className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center gap-2 text-slate-700">
            <Building2 className="h-4 w-4" />
            <h2 className="text-base font-semibold text-slate-900">Ärzte auch in der Region</h2>
          </div>
          <p className="mt-1 text-sm text-slate-600">Städte in der Umgebung von {cityName} mit Arzt- und Praxis-Verzeichnis:</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {nearby.map((n) => (
              <Link
                key={n.slug}
                href={`/aerzte/${n.slug}`}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
              >
                {n.name} <span className="text-slate-400">·</span> <span className="text-slate-500">{n.count} Praxen</span>
                {Math.round(n.distanceKm) > 0 && <span className="text-[10px] text-slate-400">· {Math.round(n.distanceKm)} km</span>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ (Adsense/SEO Content-Booster + FAQPage-JSON-LD) */}
      {rich && faqs.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center gap-2 text-slate-700">
            <HelpCircle className="h-4 w-4" />
            <h2 className="text-lg font-semibold text-slate-900">Häufige Fragen zu Ärzten in {cityName}</h2>
          </div>
          <div className="mt-4 space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 group-open:text-sky-700">{f.q}</summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Datenherkunft (E-E-A-T) */}
      <section className="mt-10 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
        <p><strong>Datenquelle:</strong> Praxisdaten (Adresse, Telefon, Website, Öffnungszeiten) und Bewertungen stammen aus öffentlichen Google-Places-Informationen. Alle Angaben werden regelmäßig aktualisiert und ohne redaktionelle Veränderung dargestellt. Für die Aktualität der Angaben übernehmen wir keine Gewähr; verbindliche Informationen erhalten Sie direkt bei der jeweiligen Praxis.</p>
      </section>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{value}</div>
      {sub && <div className="text-[11px] text-slate-500">{sub}</div>}
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
              <a href={d.website_url} target="_blank" rel="nofollow noopener noreferrer" className="flex items-center gap-1 text-slate-600 hover:text-sky-700"><Globe className="h-4 w-4" /> Website</a>
            )}
          </div>
        </div>
        <Link href={`/praxis/${stadt}/${d.slug}`} className="btn-secondary shrink-0 self-start">Profil <ArrowRight className="ml-1 h-4 w-4" /></Link>
      </div>
    </article>
  );
}
