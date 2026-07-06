import { getCollection } from '@/lib/mongodb';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Phone, Globe, MapPin, ExternalLink, Clock, ShieldAlert, Info, CalendarClock,
  Accessibility, CreditCard, ParkingCircle, HelpCircle, Stethoscope, ArrowRight, RefreshCw, BadgeCheck,
} from 'lucide-react';
import CopyButton from '@/components/CopyButton';
import CorrectionButton from '@/components/CorrectionButton';
import RatingBadge from '@/components/RatingBadge';
import FaqAccordion from '@/components/praxis/FaqAccordion';
import MobileStickyCta from '@/components/praxis/MobileStickyCta';
import { parseDisplayName } from '@/lib/doctorFormatter';
import { humanizePrimaryType } from '@/lib/specialtyLabels';
import { isOpenNow, nextOpening, buildWeekTable, toSchemaOpeningHours, todayLabel } from '@/lib/openingHours';
import { buildProfileText } from '@/lib/profileText';
import { buildFaqs } from '@/lib/faqBuilder';
import { SPECIALTIES } from '@/lib/specialties';

async function loadDoctor(slug) {
  const col = await getCollection('doctor_places');
  const doc = await col.findOne({ slug });
  if (!doc) return null;
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
  const title = specialty
    ? `${displayName} – ${specialty} in ${cityText} | Adresse, Telefon & Öffnungszeiten`
    : `${displayName} in ${cityText} | Adresse, Telefon & Praxisinfos`;
  const description = `Informationen zu ${displayName}${specialty ? ` (${specialty})` : ''} in ${cityText}: Adresse, Telefonnummer, Öffnungszeiten, Fachgebiet, Website und Anfahrt. Angaben bitte vor dem Termin bestätigen.`;
  const canonical = `/praxis/${d.city_slug}/${d.slug}`;
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const ogImage = `${base}${canonical}/opengraph-image${d.last_synced_at ? `?v=${new Date(d.last_synced_at).getTime()}` : ''}`;
  return {
    title,
    description,
    alternates: { canonical },
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

  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
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
    ...(d.website_url && { url: d.website_url }),
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
    breadcrumb: { '@type': 'BreadcrumbList', '@id': `${profileUrl}#breadcrumb` },
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

      {/* 2. Hero */}
      <header className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-sky-50/40 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          {specialty && <span className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700"><Stethoscope className="h-3 w-3" />{specialty}</span>}
          {humanizedType && humanizedType !== specialty && humanizedType !== `${specialty}praxis` && (
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600">{humanizedType}</span>
          )}
          {d.business_status === 'OPERATIONAL' && <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Aktiv</span>}
          {d.is_verified && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800" title="Vom Praxis-Team oder redaktionell bestätigt">
              <BadgeCheck className="h-3.5 w-3.5" /> Verifiziert
            </span>
          )}
          {d.rating != null && (
            <RatingBadge rating={d.rating} count={d.user_rating_count} size="md" showAttribution={false} />
          )}
          {openNow === true && <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800"><span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />Jetzt geöffnet</span>}
          {openNow === false && <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600"><span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />Aktuell geschlossen{nextOpen ? ` · öffnet ${nextOpen.dayLabel} ${String(nextOpen.hour).padStart(2, '0')}:${String(nextOpen.minute).padStart(2, '0')}` : ''}</span>}
        </div>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {nameParts.title_prefix ? <span className="text-slate-500 font-medium">{nameParts.title_prefix} </span> : null}
          {displayName}
        </h1>
        {specialty && (
          <p className="mt-1 text-base text-slate-600">
            {specialty}
            {humanizedType && humanizedType !== specialty && humanizedType !== `${specialty}praxis` ? ` · ${humanizedType}` : ''}
            {city ? ` in ${city}` : ''}
          </p>
        )}

        {d.formatted_address && (
          <p className="mt-4 flex items-start gap-2 text-sm text-slate-700 sm:text-base">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span>{d.formatted_address}{d.district ? ` · ${d.district}` : ''}</span>
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {phone && (
            <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700">
              <Phone className="h-4 w-4" /> {d.phone_national || d.phone_international}
            </a>
          )}
          {routeUrl && (
            <a href={routeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
              <MapPin className="h-4 w-4" /> Route planen
            </a>
          )}
          {d.website_url && (
            <a href={d.website_url} target="_blank" rel="nofollow noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
              <Globe className="h-4 w-4" /> Website öffnen
            </a>
          )}
        </div>
        {d.rating != null && d.user_rating_count > 0 && (
          <p className="mt-3 text-[11px] text-slate-400">Bewertungen von Google (öffentliche Google-Rezensionen)</p>
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
              {d.website_url ? (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Website</dt>
                  <dd className="mt-1 flex items-center justify-between gap-3 text-sm">
                    <a href={d.website_url} target="_blank" rel="nofollow noopener noreferrer" className="font-medium text-sky-700 hover:underline break-all">{d.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  </dd>
                </div>
              ) : (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Website</dt>
                  <dd className="mt-1 text-sm italic text-slate-500">Eine offizielle Website ist uns aktuell nicht bekannt.</dd>
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
                              ? <span className="text-slate-400">Geschlossen</span>
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
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                <iframe
                  src={mapEmbed}
                  title={`Standort ${displayName}`}
                  width="100%"
                  height="320"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="block"
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
