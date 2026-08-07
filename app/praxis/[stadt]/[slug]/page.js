import { getCollection } from '@/lib/mongodb';
import InteractivePracticeContent from '@/components/InteractivePracticeContent';
import { notFound, redirect, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import {
  Phone, Globe, MapPin, ExternalLink, Clock, ShieldAlert, Info, CalendarClock,
  Accessibility, CreditCard, ParkingCircle, HelpCircle, Stethoscope, ArrowRight, ArrowLeft, RefreshCw, BadgeCheck, Star, Mail, Building2,
} from 'lucide-react';
import CopyButton from '@/components/CopyButton';
import CorrectionButton from '@/components/CorrectionButton';
import RatingBadge from '@/components/RatingBadge';
import MapEmbed from '@/components/MapEmbed';
import FaqAccordion from '@/components/praxis/FaqAccordion';
import MobileStickyCta from '@/components/praxis/MobileStickyCta';
import EzoicAd from '@/components/EzoicAd';  // noqa: aktuell ungenutzt (Sidebar-Ad läuft über Layout), Import behalten für spätere Inline-Slots
import { parseDisplayName } from '@/lib/doctorFormatter';
import { humanizePrimaryType } from '@/lib/specialtyLabels';
import { hasExternalWebsite } from '@/lib/ownUrl';
import { isOpenNow, nextOpening, buildWeekTable, toSchemaOpeningHours, todayLabel } from '@/lib/openingHours';
import { buildProfileText } from '@/lib/profileText';
import { buildFaqs } from '@/lib/faqBuilder';
import { SPECIALTIES } from '@/lib/specialties';
import { getBaseUrl } from '@/lib/baseUrl';
import { buildDoctorSchema } from '@/lib/schemaBuilder';

async function loadDoctor(slug) {
  const col = await getCollection('doctor_places');
  const doc = await col.findOne({ slug });
  if (!doc) return null;
  // Verworfene Praxen werden von der öffentlichen Seite ausgeblendet
  if (doc.is_active === false) return null;
  const { _id, source_payload_json, ...rest } = doc;
  return rest;
}

async function findSimilarDoctors(d, limit = 6) {
  const col = await getCollection('doctor_places');
  const filters = [];
  if (d.specialty_guess && d.city_slug) {
    filters.push({ specialty_guess: d.specialty_guess, city_slug: d.city_slug, slug: { $ne: d.slug } });
  }
  if (d.city_slug) {
    filters.push({ city_slug: d.city_slug, slug: { $ne: d.slug } });
  }
  const results = [];
  const seen = new Set([d.slug]);
  for (const f of filters) {
    if (results.length >= limit) break;
    const cursor = col.find({ ...f, is_active: { $ne: false } }, {
      projection: { _id: 0, source_payload_json: 0 },
    }).limit(limit * 2);
    const docs = await cursor.toArray();
    for (const doc of docs) {
      if (seen.has(doc.slug)) continue;
      seen.add(doc.slug);
      results.push(doc);
      if (results.length >= limit) break;
    }
  }
  return results;
}

export async function generateMetadata({ params }) {
  const { slug, stadt } = await params;
  const d = await loadDoctor(slug);
  if (!d) return { title: 'Nicht gefunden | Navoria' };
  const cityText = d.city || stadt;
  const specialty = d.specialty_guess;
  const displayName = d.name;
  const canonical = `/praxis/${d.city_slug}/${d.slug}`;
  const base = await getBaseUrl();

  // HOMEPAGE-MODUS: Metadaten so gestalten, dass Google diese Seite als
  // eigenständige Praxis-Website erkennt (kein Navoria-Bezug).
  if (d.homepage_mode === true) {
    const specialtyLabel = specialty || 'Arztpraxis';
    const hpTitle = `${displayName} – ${specialtyLabel} in ${cityText}`;
    const hpDesc = `Praxis ${displayName} in ${cityText}. ${d.formatted_address ? `Adresse: ${d.formatted_address}. ` : ''}${d.phone_national ? `Termine: ${d.phone_national}.` : ''}`;
    const absoluteCanonical = `${base}${canonical}`;
    return {
      title: { absolute: hpTitle },
      description: hpDesc,
      // Absolute Canonical – stärkeres Signal an Google, dass die Praxis-URL die maßgebliche Adresse ist.
      alternates: { canonical: absoluteCanonical },
      // Homepage-Modus ist temporär und dient ausschließlich der Google-Business-Verifizierung.
      // Google darf die URL crawlen, aber nicht indexieren.
      robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
          index: false,
          follow: false,
          noimageindex: true,
          'max-snippet': -1,
          'max-image-preview': 'none',
        },
      },
      openGraph: {
        title: hpTitle,
        description: hpDesc,
        type: 'website',
        locale: 'de_DE',
        url: absoluteCanonical,
        // Bewusst KEIN Navoria-siteName – Google/OG-Clients zeigen die Praxis als Herausgeber.
        siteName: displayName,
      },
      twitter: { card: 'summary', title: hpTitle, description: hpDesc },
      other: {
        'og:site_name': displayName,
        publisher: displayName,
        'X-Robots-Tag': 'noindex, nofollow, noarchive, noimageindex',
      },
    };
  }

  // STANDARD-DIRECTORY-PROFIL
  const title = specialty
    ? `${displayName} – ${specialty} in ${cityText} | Adresse, Telefon & Öffnungszeiten`
    : `${displayName} in ${cityText} | Adresse, Telefon & Praxisinfos`;
  const description = `Informationen zu ${displayName}${specialty ? ` (${specialty})` : ''} in ${cityText}: Adresse, Telefonnummer, Öffnungszeiten, Fachgebiet, Website und Anfahrt. Angaben bitte vor dem Termin bestätigen.`;
  const ogImage = `${base}${canonical}/opengraph-image${d.last_synced_at ? `?v=${new Date(d.last_synced_at).getTime()}` : ''}`;
  // Praxen MIT eigener EXTERNER Website: noindex,follow – vermeidet Duplicate-Content, Praxis-Website rankt selbst.
  // Praxen OHNE Website (oder mit Navoria-URL als Website): normal indexieren – hier liefern wir echten Mehrwert.
  const hasOwnWebsite = hasExternalWebsite(d.website_url);
  return {
    title,
    description,
    alternates: { canonical },
    robots: hasOwnWebsite
      ? { index: false, follow: true, googleBot: { index: false, follow: true } }
      : { index: true, follow: true },
    openGraph: {
      title, description, type: 'profile', locale: 'de_DE', url: canonical,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${displayName} – ${cityText}` }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

function daysBetween(a, b) {
  return Math.floor(Math.abs(a - b) / (1000 * 60 * 60 * 24));
}

export default async function ProfilePage({ params }) {
  const { slug, stadt } = await params;
  const d = await loadDoctor(slug);
  if (!d) notFound();

  // Homepage-Modus: Praxis wird als eigenständige One-Page-Website gerendert
  // statt als Navoria-Directory-Profil. Toggle im Admin-Bereich.
  if (d.homepage_mode === true) {
    // Wenn homepage_slug gesetzt → 301-Redirect auf die Root-Level Praxis-URL /[homepage_slug].
    // Das trennt die Praxis-Homepage sauber von der Navoria-Directory-URL (SEO-Decoupling).
    // Ohne homepage_slug (Legacy-Fall) → wir rendern die Homepage inline wie bisher.
    if (d.homepage_slug) {
      permanentRedirect(`/${d.homepage_slug}`);
    }
    const { default: PracticeHomepage } = await import('@/components/PracticeHomepage');
    return <PracticeHomepage doctor={d} />;
  }

  // Namensbestandteile ableiten (falls nicht bereits in DB gespeichert)
  const nameParts = (d.title_prefix || d.doctor_name_normalized || d.practice_name)
    ? { title_prefix: d.title_prefix, doctor_name_normalized: d.doctor_name_normalized, practice_name: d.practice_name }
    : parseDisplayName(d.name);

  const displayName = d.name;
  const specialty = d.specialty_guess || null;
  const city = d.city || stadt;
  const humanizedType = humanizePrimaryType(d.primary_type, specialty);

  const openingHours = d.regular_opening_hours || d.opening_hours_json || null;
  const hasHours = !!(openingHours?.periods?.length);
  const openNow = hasHours ? isOpenNow(openingHours) : null;
  const nextOpen = hasHours && openNow === false ? nextOpening(openingHours) : null;
  const weekTable = hasHours ? buildWeekTable(openingHours) : null;
  const today = todayLabel();

  const phone = d.phone_national || d.phone_international;
  const routeUrl = d.google_maps_url
    || (d.latitude && d.longitude ? `https://www.openstreetmap.org/?mlat=${d.latitude}&mlon=${d.longitude}#map=17/${d.latitude}/${d.longitude}` : null)
    || (d.formatted_address ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(d.formatted_address)}` : null);

  const lastSynced = d.last_external_sync_at || d.last_synced_at;
  const lastSyncedText = lastSynced ? new Date(lastSynced).toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' }) : null;
  const staleData = lastSynced && daysBetween(new Date(), new Date(lastSynced)) > 90;

  const profileText = buildProfileText(d, { humanizedType });
  const faqs = buildFaqs(d, { humanizedType, hasHours });
  const similar = await findSimilarDoctors(d, 6);

  const mapEmbed = d.latitude && d.longitude
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${d.longitude - 0.01},${d.latitude - 0.007},${d.longitude + 0.01},${d.latitude + 0.007}&layer=mapnik&marker=${d.latitude},${d.longitude}`
    : null;

  const base = await getBaseUrl();
  const profileUrl = `${base}/praxis/${d.city_slug}/${d.slug}`;

  // Schema.org Type
  const typeFor = (pt) => {
    if (pt === 'dentist' || pt === 'dental_clinic') return 'Dentist';
    if (pt === 'pharmacy') return 'Pharmacy';
    if (pt === 'hospital' || pt === 'general_hospital') return 'Hospital';
    if (pt === 'physiotherapist') return ['MedicalBusiness', 'Physiotherapy'];
    if (specialty && specialty !== 'Krankenhaus' && specialty !== 'Apotheke') return ['MedicalBusiness', 'Physician'];
    return 'MedicalBusiness';
  };

  const openingHoursSpec = hasHours ? toSchemaOpeningHours(openingHours) : undefined;

  // Amenities (Zahlungsarten / Barrierefreiheit) für Schema
  const paymentAccepted = [];
  if (d.payment_options?.acceptsCreditCards) paymentAccepted.push('Kreditkarte');
  if (d.payment_options?.acceptsDebitCards) paymentAccepted.push('EC-/Debitkarte');
  if (d.payment_options?.acceptsCashOnly) paymentAccepted.push('Barzahlung');
  if (d.payment_options?.acceptsNfc) paymentAccepted.push('Kontaktloses Bezahlen');

  const amenityFeatures = [];
  if (d.accessibility_options?.wheelchairAccessibleEntrance) amenityFeatures.push({ '@type': 'LocationFeatureSpecification', name: 'Rollstuhlgerechter Eingang', value: true });
  if (d.accessibility_options?.wheelchairAccessibleParking) amenityFeatures.push({ '@type': 'LocationFeatureSpecification', name: 'Rollstuhlgerechte Parkplätze', value: true });
  if (d.accessibility_options?.wheelchairAccessibleRestroom) amenityFeatures.push({ '@type': 'LocationFeatureSpecification', name: 'Rollstuhlgerechte Toilette', value: true });
  if (d.parking_options?.freeParkingLot) amenityFeatures.push({ '@type': 'LocationFeatureSpecification', name: 'Kostenlose Parkplätze', value: true });
  if (d.parking_options?.paidParkingLot) amenityFeatures.push({ '@type': 'LocationFeatureSpecification', name: 'Kostenpflichtige Parkplätze', value: true });
  if (d.parking_options?.freeStreetParking) amenityFeatures.push({ '@type': 'LocationFeatureSpecification', name: 'Kostenloses Straßenparken', value: true });

  // Zentraler Schema-Builder – produziert GENAU eine medizinische Hauptentität
  // (Physician / MedicalClinic / MedicalBusiness) mit @id gebunden an profileUrl.
  const schema = buildDoctorSchema(d, { canonicalUrl: profileUrl });
  // Zusatzfelder, die nur auf der Directory-Seite Sinn machen
  if (schema) {
    schema.mainEntityOfPage = profileUrl;
    schema.logo = `${base}/icon.svg`;
    schema.publisher = { '@id': `${base}#organization` };
    if (amenityFeatures.length) schema.amenityFeature = amenityFeatures;
    if (d.is_verified && d.verified_at) {
      schema.identifier = {
        '@type': 'PropertyValue',
        propertyID: 'navoria:verified',
        value: `verified:${new Date(d.verified_at).toISOString().slice(0, 10)}`,
      };
    }
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    // @id ist erforderlich, damit die Referenz aus dem WebPage-Block (breadcrumb: { @id: … })
    // auf diese Entität aufgelöst wird. Ohne @id sieht Google die Referenz als leeren Stub
    // ohne itemListElement (führte zu "Feld itemListElement fehlt"-Fehler in Search Console).
    '@id': `${profileUrl}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Start', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: 'Ärzte', item: `${base}/aerzte` },
      ...(city ? [{ '@type': 'ListItem', position: 3, name: city, item: `${base}/aerzte/${d.city_slug}` }] : []),
      { '@type': 'ListItem', position: city ? 4 : 3, name: displayName, item: profileUrl },
    ],
  };

  // FAQPage-Schema NUR ausgeben, wenn FAQs sichtbar sind (was hier der Fall ist)
  const faqSchema = faqs.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null;

  // WebPage-Wrapper
  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': profileUrl,
    url: profileUrl,
    name: `${displayName}${specialty ? ` – ${specialty}` : ''} in ${city}`,
    inLanguage: 'de-DE',
    isPartOf: { '@type': 'WebSite', url: base, name: 'Navoria' },
    ...(schema?.['@id'] && { about: { '@id': schema['@id'] } }),
    breadcrumb: { '@id': `${profileUrl}#breadcrumb` },
  };

  // Fachrichtung → SEO-Slug (für "Weitere Suchen")
  const specialtyEntry = specialty ? SPECIALTIES.find((s) => s.label === specialty) : null;
  const specialtySlug = specialtyEntry?.slug || null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-24 sm:px-6 sm:py-10 md:pb-10">
      {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}


      <InteractivePracticeContent doctor={d} city={city} similar={similar} />
    </div>
  );
}

function RowKv({ k, v }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{k}</dt>
      <dd className="text-slate-800 text-right">{v}</dd>
    </div>
  );
}

function DetailCard({ icon, title, children }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span className="text-slate-400">{icon}</span>{title}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function FeatureList({ items }) {
  const list = (items || []).filter(Boolean);
  if (list.length === 0) return <p className="text-xs italic text-slate-500">Keine Angaben</p>;
  return (
    <ul className="space-y-1 text-sm text-slate-700">
      {list.map((t, i) => (
        <li key={i} className="flex items-start gap-1.5">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" /> {t}
        </li>
      ))}
    </ul>
  );
}

function RelatedLink({ href, children }) {
  return (
    <li>
      <Link href={href} className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800">{children}</Link>
    </li>
  );
}
