import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCollection } from '@/lib/mongodb';
import { SPECIALTIES, specialtyBySlug } from '@/lib/specialties';
import { contentForSlug } from '@/lib/specialtyContent';
import {
  Stethoscope, MapPin, ArrowRight, HelpCircle, Info, ShieldCheck, Sparkles,
  Star, Phone, Globe,
} from 'lucide-react';
import RatingBadge from '@/components/RatingBadge';

export const revalidate = 600;

// Nur sehr spezifische primary_types als Fallback nutzen. 'doctor' ist zu unspezifisch
// und würde jede Praxis matchen, was zu falschen Fach-Zählungen führt.
const SPECIFIC_PRIMARY_TYPES = new Set(['dentist', 'dental_clinic', 'pharmacy', 'hospital', 'general_hospital', 'physiotherapist']);

function buildSpecialtyFilter(specialtyLabel, primaryType) {
  const orFilters = [{ specialty_guess: specialtyLabel }];
  if (primaryType && SPECIFIC_PRIMARY_TYPES.has(primaryType)) {
    orFilters.push({ primary_type: primaryType });
  }
  return orFilters;
}

async function loadTopCities(specialtyLabel, primaryType, limit = 40) {
  const col = await getCollection('doctor_places');
  const orFilters = buildSpecialtyFilter(specialtyLabel, primaryType);
  const pipeline = [
    { $match: { is_active: { $ne: false }, city_slug: { $ne: null }, $or: orFilters } },
    { $group: { _id: { slug: '$city_slug', name: '$city' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 0 } } },
    { $sort: { count: -1, '_id.name': 1 } },
    { $limit: limit },
  ];
  return col.aggregate(pipeline).toArray();
}

async function loadFeaturedDoctors(specialtyLabel, primaryType, limit = 6) {
  const col = await getCollection('doctor_places');
  const orFilters = buildSpecialtyFilter(specialtyLabel, primaryType);
  return col.find(
    { is_active: { $ne: false }, $or: orFilters, rating: { $gte: 4.5 }, user_rating_count: { $gte: 20 } },
    { projection: { _id: 0, source_payload_json: 0 } }
  )
    .sort({ user_rating_count: -1, rating: -1 })
    .limit(limit)
    .toArray();
}

async function loadTotalCount(specialtyLabel, primaryType) {
  const col = await getCollection('doctor_places');
  const orFilters = buildSpecialtyFilter(specialtyLabel, primaryType);
  return col.countDocuments({ is_active: { $ne: false }, $or: orFilters });
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const spec = specialtyBySlug(slug);
  const content = contentForSlug(slug);
  if (!spec || !content) return { title: 'Nicht gefunden' };
  const totalCount = await loadTotalCount(spec.label, spec.placeType);
  const canonical = `/aerzte/fachrichtung/${slug}`;
  return {
    title: `${spec.plural} in Deutschland finden – Aufgabe, Vorsorge & Ratgeber`,
    description: `${spec.plural} in Deutschland: Was macht ${genderedArticle(spec.label)}, wann sollten Sie hin, wo finden Sie eine Praxis in Ihrer Nähe? Redaktionell geprüfter Ratgeber mit ${totalCount} gelisteten Praxen.`,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'de_DE',
      url: canonical,
      title: `${spec.plural} in Deutschland – ${content.subline}`,
      description: content.intro.slice(0, 200),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${spec.plural} in Deutschland finden`,
      description: content.subline,
    },
  };
}

function genderedArticle(label, kasus = 'nom') {
  // Grammatikalisch korrekter unbestimmter Artikel je Kasus
  const feminine = ['Apotheke'];
  const neuter = ['Krankenhaus'];
  if (feminine.includes(label)) return kasus === 'akk' ? `eine ${label}` : `eine ${label}`;
  if (neuter.includes(label)) return `ein ${label}`;
  // maskulin (alle Ärzte-Bezeichnungen): Nominativ "ein", Akkusativ "einen"
  return kasus === 'akk' ? `einen ${label}` : `ein ${label}`;
}

export default async function SpecialtyPillarPage({ params }) {
  const { slug } = await params;
  const spec = specialtyBySlug(slug);
  const content = contentForSlug(slug);
  if (!spec || !content) notFound();

  const [topCities, featured, totalCount] = await Promise.all([
    loadTopCities(spec.label, spec.placeType, 40),
    loadFeaturedDoctors(spec.label, spec.placeType, 6),
    loadTotalCount(spec.label, spec.placeType),
  ]);

  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const pageUrl = `${base}/aerzte/fachrichtung/${slug}`;

  // Schema.org
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Start', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: 'Ärzte', item: `${base}/aerzte` },
      { '@type': 'ListItem', position: 3, name: 'Fachrichtungen', item: `${base}/aerzte/fachrichtung` },
      { '@type': 'ListItem', position: 4, name: spec.plural, item: pageUrl },
    ],
  };

  const medicalSpecialty = {
    '@context': 'https://schema.org',
    '@type': 'MedicalSpecialty',
    name: spec.label,
    alternateName: spec.plural,
    description: content.intro,
    url: pageUrl,
    inLanguage: 'de-DE',
  };

  const faqSchema = content.faqs?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null;

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': pageUrl,
    url: pageUrl,
    name: `${spec.plural} in Deutschland finden`,
    inLanguage: 'de-DE',
    isPartOf: { '@type': 'WebSite', url: base, name: 'Navoria' },
    about: medicalSpecialty,
    publisher: { '@id': `${base}#organization` },
  };

  const relatedSpecs = (content.relatedSlugs || [])
    .map((s) => SPECIALTIES.find((x) => x.slug === s))
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalSpecialty) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link>
        <span>/</span>
        <Link href="/aerzte" className="hover:text-sky-700">Ärzte</Link>
        <span>/</span>
        <Link href="/aerzte/fachrichtung" className="hover:text-sky-700">Fachrichtungen</Link>
        <span>/</span>
        <span className="text-slate-700">{spec.plural}</span>
      </nav>

      {/* Hero */}
      <header className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-sky-50/40 p-6 sm:p-8">
        <div className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
          <Stethoscope className="h-3 w-3" /> Fachrichtung
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {spec.plural} in Deutschland finden
        </h1>
        <p className="mt-2 text-base text-slate-600 sm:text-lg">{content.subline}</p>

        {totalCount > 0 && (
          <div className="mt-5 inline-flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
            <span className="text-slate-500">Bei Navoria gelistet:</span>
            <span className="font-semibold text-slate-900">{totalCount.toLocaleString('de-DE')} {spec.plural}</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">in {topCities.length} Städten</span>
          </div>
        )}
      </header>

      {/* Intro-Content */}
      <section className="prose prose-slate mt-10 max-w-none prose-p:text-[15px] prose-p:leading-relaxed prose-p:text-slate-700 prose-h2:mt-10 prose-h2:mb-3 prose-h2:text-2xl prose-h2:font-semibold prose-h2:text-slate-900 prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-base prose-h3:font-semibold prose-h3:text-slate-900">
        <h2>Was ist {genderedArticle(spec.label)}?</h2>
        <p>{content.intro}</p>
        {content.intro2 && <p>{content.intro2}</p>}
      </section>

      {/* Wann hingehen */}
      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <Info className="h-5 w-5 text-sky-600" /> Wann sollten Sie {genderedArticle(spec.label, 'akk')} aufsuchen?
        </h2>
        <ul className="mt-4 grid gap-x-6 gap-y-2 text-[15px] leading-relaxed text-slate-700 sm:grid-cols-2">
          {content.whenToVisit.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Top-Städte (der Cluster-Link zurück zur Stadt+Fach-Kombi) */}
      {topCities.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-slate-900">{spec.plural} nach Stadt</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
            Direkt zur Übersicht in Ihrer Stadt – sortiert nach Anzahl gelisteter {spec.plural}.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {topCities.map((c) => (
              <Link
                key={c._id.slug}
                href={`/aerzte/${c._id.slug}/${slug}`}
                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 hover:shadow-sm"
              >
                <span className="flex items-center gap-2 font-medium text-slate-800 group-hover:text-sky-700">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 group-hover:text-sky-500" />
                  {c._id.name}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500 group-hover:border-sky-200 group-hover:bg-white group-hover:text-sky-700">
                  {c.count}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Praxen */}
      {featured.length > 0 && (
        <section className="mt-12">
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <Sparkles className="h-5 w-5 text-amber-500" /> Empfohlene {spec.plural} (Google-Bewertung ≥ 4,5)
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
            Praxen aus unserer Datenbank mit besonders vielen und guten Bewertungen. Sortiert nach Anzahl der Rezensionen.
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
                  {d.website_url && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">
                      <Globe className="h-3 w-3" /> Website
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-slate-400">Bewertungen von Google (öffentliche Google-Rezensionen). Keine Empfehlung im medizinischen Sinne.</p>
        </section>
      )}

      {/* FAQ */}
      {content.faqs?.length > 0 && (
        <section className="mt-14">
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <HelpCircle className="h-5 w-5 text-sky-600" /> Häufige Fragen zu {spec.plural}
          </h2>
          <div className="mt-5 space-y-3">
            {content.faqs.map((f, i) => (
              <details
                key={i}
                className="group rounded-xl border border-slate-200 bg-white p-5 open:border-sky-200 open:bg-sky-50/30"
              >
                <summary className="cursor-pointer list-none text-base font-semibold text-slate-900 group-open:text-sky-800">
                  <span className="mr-2 inline-block text-sky-600">›</span>
                  {f.q}
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-700">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Verwandte Fachrichtungen */}
      {relatedSpecs.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-slate-900">Verwandte Fachrichtungen</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
            Nutzer suchen häufig auch nach diesen Fachrichtungen:
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {relatedSpecs.map((r) => (
              <Link
                key={r.slug}
                href={`/aerzte/fachrichtung/${r.slug}`}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
              >
                {r.plural}
                <ArrowRight className="h-3 w-3" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Redaktions-Hinweis / Trust */}
      <section className="mt-16 rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Redaktioneller Hinweis</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Der Ratgeber-Text auf dieser Seite ist redaktionell erstellt und ersetzt keine medizinische Beratung. Details zu Datenquellen und Prüfprozessen finden Sie in unseren{' '}
              <Link href="/redaktionelle-standards" className="text-sky-700 underline underline-offset-2 hover:text-sky-800">Redaktionellen Standards</Link>. Bei akuten Beschwerden wählen Sie 112.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Statische Params für alle 19 Fachrichtungen (ISR)
export async function generateStaticParams() {
  return SPECIALTIES.map((s) => ({ slug: s.slug }));
}
