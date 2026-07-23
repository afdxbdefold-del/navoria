import { getCollection } from '@/lib/mongodb';
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
import EzoicAd from '@/components/EzoicAd';
import { parseDisplayName } from '@/lib/doctorFormatter';
import { humanizePrimaryType } from '@/lib/specialtyLabels';
import { hasExternalWebsite } from '@/lib/ownUrl';
import { isOpenNow, nextOpening, buildWeekTable, toSchemaOpeningHours, todayLabel } from '@/lib/openingHours';
import { buildProfileText } from '@/lib/profileText';
import { buildFaqs } from '@/lib/faqBuilder';
import { SPECIALTIES } from '@/lib/specialties';
import { getBaseUrl } from '@/lib/baseUrl';

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

  const schema = {
    '@context': 'https://schema.org',
    '@type': typeFor(d.primary_type),
    '@id': `${profileUrl}#medicalbusiness`,
    name: displayName,
    url: profileUrl,
    mainEntityOfPage: profileUrl,
    image: `${profileUrl}/opengraph-image${lastSynced ? `?v=${new Date(lastSynced).getTime()}` : ''}`,
    logo: `${base}/icon.svg`,
    ...(specialty && { medicalSpecialty: specialty }),
    ...(d.website_url && { sameAs: [d.website_url] }),
    ...(d.formatted_address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: d.street || undefined,
        postalCode: d.postal_code || undefined,
        addressLocality: d.city || undefined,
        addressRegion: d.state || undefined,
        addressCountry: 'DE',
      },
    }),
    ...(phone && { telephone: phone }),
    ...(d.latitude != null && d.longitude != null && {
      geo: { '@type': 'GeoCoordinates', latitude: d.latitude, longitude: d.longitude },
    }),
    ...(openingHoursSpec?.length && { openingHoursSpecification: openingHoursSpec }),
    ...(d.city && { areaServed: { '@type': 'City', name: d.city } }),
    ...(paymentAccepted.length && { paymentAccepted: paymentAccepted.join(', ') }),
    ...(amenityFeatures.length && { amenityFeature: amenityFeatures }),
    ...(d.rating != null && d.user_rating_count > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Number(d.rating).toFixed(1),
        reviewCount: Number(d.user_rating_count),
        bestRating: '5',
        worstRating: '1',
      },
    }),
    ...(d.is_verified && d.verified_at && {
      identifier: {
        '@type': 'PropertyValue',
        propertyID: 'navoria:verified',
        value: `verified:${new Date(d.verified_at).toISOString().slice(0, 10)}`,
      },
    }),
    publisher: { '@id': `${base}#organization` },
    inLanguage: 'de-DE',
  };

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
    about: { '@id': `${profileUrl}#medicalbusiness` },
    // Reine @id-Referenz auf die separat emittierte BreadcrumbList – KEIN @type wiederholen,
    // sonst interpretiert Google das als eigene (leere) BreadcrumbList ohne itemListElement.
    breadcrumb: { '@id': `${profileUrl}#breadcrumb` },
  };

  // Fachrichtung → SEO-Slug (für "Weitere Suchen")
  const specialtyEntry = specialty ? SPECIALTIES.find((s) => s.label === specialty) : null;
  const specialtySlug = specialtyEntry?.slug || null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-24 sm:px-6 sm:py-10 md:pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      {/* 1. Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link>
        <span>/</span>
        <Link href="/aerzte" className="hover:text-sky-700">Ärzte</Link>
        {city && (
          <>
            <span>/</span>
            <Link href={`/aerzte/${d.city_slug}`} className="hover:text-sky-700">{city}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-slate-700">{displayName}</span>
      </nav>

      {/* 2. Hero — Primary Blue Header nach Doctolib-Muster (aber unabhängig branded) */}
      <header className="-mx-4 sm:-mx-6">
        <div
          className="relative overflow-hidden px-4 pb-16 pt-4 sm:px-6 sm:pb-20 sm:pt-6"
          style={{ background: 'var(--color-primary)' }}
        >
          {/* Top-Bar: Zurück-Pfeil links, Favorit-Stern rechts */}
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <Link
              href={city ? `/aerzte/${d.city_slug}` : '/aerzte'}
              aria-label="Zurück"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span
              aria-hidden="true"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white/90"
              title="Favorit"
            >
              <Star className="h-5 w-5" />
            </span>
          </div>

          {/* Praxis-Info zentriert (Avatar-Kreis entfernt) */}
          <div className="mx-auto mt-6 flex max-w-4xl flex-col items-center text-center">
            {/* Praxis-Name */}
            <h1 className="max-w-3xl text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-[34px]">
              {(() => {
                // title_prefix wird grau vorangestellt, sichtbaren Namen ggf. bereinigen.
                const prefix = nameParts.title_prefix;
                let visible = displayName;
                if (prefix) {
                  const normPrefix = prefix.toLowerCase().replace(/\s+/g, ' ').trim();
                  const normVisible = visible.toLowerCase().replace(/\s+/g, ' ').trim();
                  if (normVisible.startsWith(normPrefix)) {
                    visible = visible.slice(prefix.length).replace(/^\s+/, '').replace(/^[-,·|]+\s*/, '');
                  }
                }
                return (
                  <>
                    {prefix ? <span style={{ color: 'var(--color-primary-light)', fontWeight: 500 }}>{prefix} </span> : null}
                    {visible}
                  </>
                );
              })()}
            </h1>

            {/* Praxis-Typ-Chip */}
            <p
              className="mt-3 inline-flex items-center gap-2 text-[15px] font-medium"
              style={{ color: 'var(--color-primary-light)' }}
            >
              <Building2 className="h-4 w-4" aria-hidden="true" />
              <span>{humanizedType || 'Einzelpraxis'}</span>
            </p>

            {/* Fachrichtung + Stadt-Unterzeile */}
            {(specialty || city) && (
              <p className="mt-1 text-sm text-white/70">
                {specialty}
                {specialty && city ? ' · ' : ''}
                {city ? city : ''}
              </p>
            )}

            {/* Meta-Chips: Rating / Status */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {d.rating != null && (
                <RatingBadge rating={d.rating} count={d.user_rating_count} size="md" showAttribution={false} />
              )}
              {openNow === true && (
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: 'rgba(22,135,103,0.15)', color: '#8FEBBF' }}>
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: '#8FEBBF' }} />
                  Jetzt geöffnet
                </span>
              )}
              {openNow === false && (
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: 'rgba(255,255,255,0.14)', color: '#ffffff' }}>
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.6)' }} />
                  Aktuell geschlossen{nextOpen ? ` · öffnet ${nextOpen.dayLabel} ${String(nextOpen.hour).padStart(2, '0')}:${String(nextOpen.minute).padStart(2, '0')}` : ''}
                </span>
              )}
              {d.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.14)', color: '#ffffff' }} title="Vom Praxis-Team oder redaktionell bestätigt">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verifiziert
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Telefon-CTA — weißer Button mit blauem Text auf blauem Hero-Hintergrund */}
        {phone ? (
          <div className="relative" style={{ zIndex: 10,width:'340px',margin:'0 auto' }}>
            <div className="" style={{ marginTop: '-32px' }}>
              <a
                href={`tel:${phone}`}
                className="flex w-full items-center justify-center gap-3 rounded-2xl px-6 text-base font-bold uppercase tracking-wide transition sm:text-lg"
                style={{
                  height: '64px',
                  background: '#ffffff',
                  color: 'var(--color-primary)',
                  boxShadow: '0 14px 32px rgba(7, 59, 92, 0.28)',
                  letterSpacing: '0.04em',
                  border: '1px solid rgba(15, 122, 202, 0.15)',
                }}
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
                <span>{d.phone_national || d.phone_international || phone}</span>
              </a>
            </div>
          </div>
        ) : null}

        {/* E-Mail-Kontakt-Panel — nur wenn Adresse hinterlegt ist */}
        {(() => {
          const email = (d.email || d.contact_email || '').trim();
          if (!email) return null;
          return (
            <div className="mx-auto mt-6 max-w-4xl px-0">
              <div
                className="flex items-center gap-4 rounded-2xl p-5 sm:p-6"
                style={{ background: '#ffffff', border: '1px solid var(--color-border)' }}
              >
                <div className="flex-1">
                  <p className="text-[15px] leading-relaxed" style={{ color: 'var(--color-text)' }}>
                    Kontaktieren Sie die Praxis für einfache Anfragen außerhalb eines Termins.
                  </p>
                  <a
                    href={`mailto:${email}`}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold uppercase tracking-wide sm:w-auto"
                    style={{
                      border: '1.5px solid var(--color-primary)',
                      color: 'var(--color-primary)',
                      background: '#ffffff',
                      letterSpacing: '0.04em',
                    }}
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    E-Mail senden
                  </a>
                </div>
                <div
                  className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-full sm:flex"
                  style={{ background: 'var(--color-primary-soft)' }}
                  aria-hidden="true"
                >
                  <Mail className="h-9 w-9" style={{ color: 'var(--color-primary)' }} />
                </div>
              </div>
            </div>
          );
        })()}

        {/* Adresse als kleine Zeile unter den Aktionen */}
        {d.formatted_address && (
          <p className="mx-auto mt-6 flex max-w-4xl items-start justify-center gap-2 px-4 text-center text-sm sm:px-6" style={{ color: 'var(--color-text-muted)' }}>
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{d.formatted_address}{d.district ? ` · ${d.district}` : ''}</span>
          </p>
        )}

        {d.rating != null && d.user_rating_count > 0 && (
          <p className="mx-auto mt-2 max-w-4xl px-4 text-center text-xs sm:px-6" style={{ color: 'var(--color-text-muted)' }}>
            Bewertungen von Google (öffentliche Google-Rezensionen)
          </p>
        )}
      </header>

      {/* 3. Datenstand / Aktualitätsbox */}
      <section className={`mt-4 flex items-start gap-3 rounded-xl border p-4 text-sm ${staleData ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
        <RefreshCw className={`mt-0.5 h-4 w-4 shrink-0 ${staleData ? 'text-amber-600' : 'text-slate-400'}`} />
        <div>
          {lastSyncedText && (
            <p><strong className="font-semibold">Datenstand:</strong> {lastSyncedText}</p>
          )}
          <p className="mt-1 leading-relaxed">
            {staleData
              ? 'Diese Angaben wurden seit mehr als 90 Tagen nicht aktualisiert. Bitte bestätigen Sie wichtige Informationen direkt bei der Praxis.'
              : 'Öffnungszeiten, Leistungen und Terminverfügbarkeit können sich ändern. Bitte bestätigen Sie wichtige Angaben direkt bei der Praxis.'}
          </p>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          {/* 4. Kurzprofil */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900">Über die Praxis</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{profileText}</p>
            {!specialty && (
              <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                <Info className="mr-1 inline-block h-3.5 w-3.5" /> Das Fachgebiet dieser Praxis liegt uns aktuell nicht eindeutig vor.
              </p>
            )}
          </section>

          {/* 5. Kontakt & Adresse */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900">Kontakt &amp; Adresse</h2>
            <dl className="mt-4 grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
              {d.formatted_address && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Adresse</dt>
                  <dd className="mt-1 flex items-start justify-between gap-3 text-sm text-slate-800">
                    <span>{d.formatted_address}{d.district ? <><br /><span className="text-slate-500">Stadtteil {d.district}</span></> : null}</span>
                    <CopyButton value={d.formatted_address} label="Adresse kopieren" />
                  </dd>
                </div>
              )}
              {phone && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Telefon</dt>
                  <dd className="mt-1 flex items-center justify-between gap-3 text-sm text-slate-800">
                    <a href={`tel:${phone}`} className="font-medium text-sky-700 hover:underline">{d.phone_national || phone}</a>
                    <CopyButton value={d.phone_national || phone} label="Kopieren" />
                  </dd>
                </div>
              )}
              {!phone && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Telefon</dt>
                  <dd className="mt-1 text-sm italic text-slate-500">Eine Telefonnummer liegt uns aktuell nicht zuverlässig vor.</dd>
                </div>
              )}
              {d.website_url && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Website</dt>
                  <dd className="mt-1 flex items-center justify-between gap-3 text-sm">
                    <a href={d.website_url} target="_blank" rel="nofollow noopener noreferrer" className="font-medium text-sky-700 hover:underline break-all">{d.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  </dd>
                </div>
              )}
              {/* Wenn die Praxis KEINE externe Website hat, aber via Navoria verifiziert wurde
                  ("abgehakt"), ist Navoria selbst die offizielle Praxis-Seite. Wir zeigen die
                  Navoria-URL als Website + Verifizierungs-Badge. */}
              {!d.website_url && d.is_verified && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Offizielle Website</dt>
                  <dd className="mt-1 flex items-center justify-between gap-3 text-sm">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sky-700 break-all">{profileUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                      <span className="inline-flex w-fit items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                        <BadgeCheck className="h-3 w-3" /> Auf Navoria verifiziert
                      </span>
                    </div>
                  </dd>
                </div>
              )}
              {d.postal_code && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">PLZ &amp; Stadt</dt>
                  <dd className="mt-1 text-sm text-slate-800">{d.postal_code} {d.city}</dd>
                </div>
              )}
              {d.district && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Stadtteil</dt>
                  <dd className="mt-1 text-sm text-slate-800">{d.district}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* 6. Öffnungszeiten */}
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><Clock className="h-5 w-5 text-slate-400" /> Öffnungszeiten</h2>
            {hasHours && weekTable ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {weekTable.map((row) => {
                      const isToday = row.dayLabel === today;
                      return (
                        <tr key={row.day} className={isToday ? 'bg-sky-50/60' : ''}>
                          <td className={`px-4 py-2.5 ${isToday ? 'font-semibold text-sky-800' : 'text-slate-600'}`}>{row.dayLabel}{isToday ? ' · heute' : ''}</td>
                          <td className={`px-4 py-2.5 text-right ${isToday ? 'font-medium text-sky-900' : 'text-slate-800'}`}>
                            {row.ranges.length === 0
                              ? <span className="text-slate-500">Geschlossen</span>
                              : row.ranges.map((r, i) => (
                                  <span key={i} className="ml-2 inline-block">
                                    {r.open}–{r.close === '24:00' ? '24:00' : r.close}
                                  </span>
                                ))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p className="border-t border-slate-100 bg-slate-50/60 px-4 py-2 text-xs text-slate-500">
                  Reguläre Öffnungszeiten. Abweichungen an Feiertagen oder durch Praxisurlaub sind möglich.
                </p>
              </div>
            ) : (
              <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Öffnungszeiten liegen uns aktuell nicht zuverlässig vor. Bitte bestätigen Sie die Zeiten direkt bei der Praxis{phone ? <> unter <a href={`tel:${phone}`} className="font-medium text-sky-700 hover:underline">{d.phone_national || phone}</a></> : null}.
              </p>
            )}
          </section>

          {/* 7. Praxis-Details / Ausstattung */}
          {(d.accessibility_options || d.parking_options || d.payment_options) && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900">Praxis-Details</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {d.accessibility_options && (
                  <DetailCard icon={<Accessibility className="h-4 w-4" />} title="Barrierefreiheit">
                    <FeatureList items={[
                      d.accessibility_options.wheelchairAccessibleEntrance && 'Rollstuhlgerechter Eingang',
                      d.accessibility_options.wheelchairAccessibleParking && 'Rollstuhlgerechte Parkplätze',
                      d.accessibility_options.wheelchairAccessibleRestroom && 'Rollstuhlgerechte Toilette',
                      d.accessibility_options.wheelchairAccessibleSeating && 'Rollstuhlgerechte Sitzgelegenheiten',
                    ]} />
                  </DetailCard>
                )}
                {d.parking_options && (
                  <DetailCard icon={<ParkingCircle className="h-4 w-4" />} title="Parken">
                    <FeatureList items={[
                      d.parking_options.freeParkingLot && 'Kostenlose Parkplätze',
                      d.parking_options.paidParkingLot && 'Kostenpflichtige Parkplätze',
                      d.parking_options.freeStreetParking && 'Kostenloses Straßenparken',
                      d.parking_options.paidStreetParking && 'Kostenpflichtiges Straßenparken',
                      d.parking_options.valetParking && 'Valet-Parken',
                    ]} />
                  </DetailCard>
                )}
                {d.payment_options && (
                  <DetailCard icon={<CreditCard className="h-4 w-4" />} title="Bezahlung">
                    <FeatureList items={[
                      d.payment_options.acceptsCreditCards && 'Kreditkarte',
                      d.payment_options.acceptsDebitCards && 'EC-/Debitkarte',
                      d.payment_options.acceptsCashOnly && 'Nur Barzahlung',
                      d.payment_options.acceptsNfc && 'Kontaktloses Bezahlen',
                    ]} />
                  </DetailCard>
                )}
              </div>
            </section>
          )}

          {/* 8. Standort */}
          {mapEmbed && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900">Standort</h2>
              <p className="mt-2 text-sm text-slate-600">Praxis in {city}{d.district ? `, Stadtteil ${d.district}` : ''}{d.postal_code ? `, PLZ ${d.postal_code}` : ''}.</p>
              <div className="mt-3">
                <MapEmbed
                  src={mapEmbed}
                  title={`Standort ${displayName}`}
                  label={[d.postal_code, city].filter(Boolean).join(' ')}
                />
              </div>
              {routeUrl && (
                <a href={routeUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-sky-700 hover:underline">
                  Anfahrt anzeigen <ArrowRight className="h-4 w-4" />
                </a>
              )}
            </section>
          )}

          {/* 9. Hinweis: Leistungen nur bei echten Daten */}
          {Array.isArray(d.services_manual) && d.services_manual.length > 0 ? (
            <section>
              <h2 className="text-lg font-semibold text-slate-900">Leistungen</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {d.services_manual.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" /> {s}
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <section>
              <h2 className="text-lg font-semibold text-slate-900">Leistungen</h2>
              <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Konkrete Leistungen dieser Praxis liegen Navoria aktuell nicht vollständig vor. Bitte informieren Sie sich direkt über die Praxiswebsite{d.website_url ? <> (<a href={d.website_url} target="_blank" rel="nofollow noopener noreferrer" className="text-sky-700 hover:underline">{d.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a>)</> : null} oder telefonisch.
              </p>
            </section>
          )}

          {/* 10. FAQ */}
          {faqs.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <HelpCircle className="h-5 w-5 text-slate-400" /> Häufige Fragen
              </h2>
              <div className="mt-4">
                <FaqAccordion items={faqs} />
              </div>
            </section>
          )}

          {/* 11. Disclaimer */}
          <section className="rounded-xl border border-amber-100 bg-amber-50/60 p-5 text-sm text-amber-900">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div className="space-y-2">
                <p>Navoria stellt öffentlich verfügbare Praxisinformationen bereit. Angaben zu Öffnungszeiten, Leistungen und Terminverfügbarkeit können sich ändern. Bitte bestätigen Sie wichtige Informationen direkt bei der Praxis.</p>
                <p>Diese Seite ersetzt keine medizinische Beratung. Bei akuten lebensbedrohlichen Beschwerden wählen Sie <strong className="font-semibold">112</strong>. Für den ärztlichen Bereitschaftsdienst außerhalb der Sprechzeiten: <strong className="font-semibold">116 117</strong>.</p>
              </div>
            </div>
          </section>

          {/* Vertrauens- / Korrektur-Zeile */}
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <Link href="/redaktionelle-standards" className="hover:text-sky-700">Wie diese Daten geprüft werden</Link>
              <span className="text-slate-300">·</span>
              <Link href="/korrekturen" className="hover:text-sky-700">Korrektur-Verfahren</Link>
              <span className="text-slate-300">·</span>
              <Link href="/ueber-uns" className="hover:text-sky-700">Über Navoria</Link>
            </div>
            <CorrectionButton doctorId={d.id} doctorName={displayName} />
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Info className="h-4 w-4" /> Auf einen Blick</h3>
            <dl className="mt-3 space-y-2 text-sm">
              {specialty && <RowKv k="Fachgebiet" v={specialty} />}
              {humanizedType && humanizedType !== specialty && <RowKv k="Praxisart" v={humanizedType} />}
              {d.city && <RowKv k="Stadt" v={d.city} />}
              {d.district && <RowKv k="Stadtteil" v={d.district} />}
              {d.postal_code && <RowKv k="PLZ" v={d.postal_code} />}
              {d.rating != null && d.user_rating_count > 0 && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">Bewertung</dt>
                  <dd><RatingBadge rating={d.rating} count={d.user_rating_count} size="sm" /></dd>
                </div>
              )}
              {lastSyncedText && <RowKv k="Zuletzt aktualisiert" v={lastSyncedText} />}
            </dl>
          </div>

          {/* Ezoic MREC (300x250) – Sidebar-Slot.
              Placeholder-ID 101 muss im Ezoic-Dashboard angelegt und einem
              MREC-Format zugewiesen sein. */}
          <EzoicAd id={101} className="mx-auto w-full max-w-[300px]" />

          {/* Profil beanspruchen (für Praxisinhaber) */}
          <div className="rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-5">
            <div className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-white px-2 py-0.5 text-[11px] font-medium text-sky-700">
              <BadgeCheck className="h-3 w-3" aria-hidden="true" /> Sind Sie {displayName}?
            </div>
            <h3 className="mt-2 text-sm font-semibold text-slate-900">Profil beanspruchen</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Als Praxisinhaber:in oder autorisierte Ansprechperson können Sie dieses Profil verifizieren, Angaben korrigieren und um Zusatzinformationen (Sprachen, Kassen/Privat, Schwerpunkte) ergänzen.
            </p>
            <Link
              href={`/praxis-beanspruchen?doctor_id=${encodeURIComponent(d.id)}`}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-sky-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-700"
            >
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Profil beanspruchen
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
            <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
              Kostenlos. Wir prüfen Ihre Angaben und melden uns per E-Mail zurück.
            </p>
          </div>

          {/* 12. Ähnliche Ärzte */}
          {similar.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900">
                {specialtyEntry?.plural
                  ? `Weitere ${specialtyEntry.plural} in ${city}`
                  : (specialty ? `Weitere ${specialty}-Praxen in ${city}` : `Weitere Praxen in ${city}`)}
              </h3>
              <ul className="mt-3 divide-y divide-slate-100">
                {similar.map((s) => (
                  <li key={s.slug} className="py-2.5 first:pt-0 last:pb-0">
                    <Link href={`/praxis/${s.city_slug}/${s.slug}`} className="group block">
                      <div className="text-sm font-medium text-slate-900 group-hover:text-sky-700 line-clamp-1">{s.name}</div>
                      <div className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                        {s.specialty_guess ? `${s.specialty_guess} · ` : ''}{s.district || s.postal_code || s.formatted_address?.split(',')[0]}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={`/aerzte/${d.city_slug}${specialtySlug ? `/${specialtySlug}` : ''}`} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:underline">
                Alle anzeigen <ArrowRight className="h-3 w-3" />
              </Link>
              {specialtySlug && specialtyEntry && (
                <Link href={`/aerzte/fachrichtung/${specialtySlug}`} className="mt-2 block text-xs text-slate-500 hover:text-sky-700">
                  Ratgeber: {specialtyEntry.plural} in Deutschland →
                </Link>
              )}
            </div>
          )}

          {/* 13. Weitere Suchen */}
          {city && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
              <h3 className="text-sm font-semibold text-slate-900">Weitere Suchen in {city}</h3>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                <RelatedLink href={`/aerzte/${d.city_slug}`}>Ärzte in {city}</RelatedLink>
                {specialtySlug && <RelatedLink href={`/aerzte/${d.city_slug}/${specialtySlug}`}>{specialty} in {city}</RelatedLink>}
                {specialtySlug === 'hausarzt' && <RelatedLink href={`/aerzte/${d.city_slug}/hausarzt`}>Allgemeinmedizin {city}</RelatedLink>}
                {d.postal_code && <RelatedLink href={`/suche?q=${encodeURIComponent(specialty || 'Arzt')}&ort=${encodeURIComponent(d.postal_code + ' ' + d.city)}`}>Ärzte in {d.postal_code}</RelatedLink>}
                {d.district && <RelatedLink href={`/suche?q=${encodeURIComponent(specialty || 'Arzt')}&ort=${encodeURIComponent(d.district)}`}>Ärzte in {d.district}</RelatedLink>}
                <RelatedLink href={`/suche?ort=${encodeURIComponent(city)}`}>Alle Praxen {city}</RelatedLink>
              </ul>
            </div>
          )}
        </aside>
      </div>

      {/* Mobile Sticky CTA */}
      <MobileStickyCta phone={phone} mapsUrl={routeUrl} />
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
