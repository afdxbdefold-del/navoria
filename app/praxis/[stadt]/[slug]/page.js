import { getCollection } from '@/lib/mongodb';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star, Phone, Globe, MapPin, ExternalLink, Clock, ShieldAlert, Info } from 'lucide-react';

async function loadDoctor(slug) {
  const col = await getCollection('doctor_places');
  const doc = await col.findOne({ slug });
  if (!doc) return null;
  const { _id, source_payload_json, ...rest } = doc;
  return rest;
}

export async function generateMetadata({ params }) {
  const { slug, stadt } = await params;
  const d = await loadDoctor(slug);
  if (!d) return { title: 'Nicht gefunden | Navoria' };
  const cityText = d.city || stadt;
  const title = `${d.name} in ${cityText} | Adresse, Telefon & Öffnungszeiten | Navoria`;
  const description = `Informationen zu ${d.name}${d.specialty_guess ? ' (' + d.specialty_guess + ')' : ''} in ${cityText}. Adresse: ${d.formatted_address || ''}. Mit Telefon, Website und Kartenlink.`;
  const canonical = `/praxis/${d.city_slug}/${d.slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'profile',
      locale: 'de_DE',
      url: canonical,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function ProfilePage({ params }) {
  const { slug, stadt } = await params;
  const d = await loadDoctor(slug);
  if (!d) notFound();

  const lastSynced = d.last_synced_at ? new Date(d.last_synced_at).toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' }) : null;
  const mapEmbed = d.latitude && d.longitude
    ? `https://www.google.com/maps?q=${d.latitude},${d.longitude}&hl=de&z=15&output=embed`
    : d.formatted_address
      ? `https://www.google.com/maps?q=${encodeURIComponent(d.formatted_address)}&hl=de&z=15&output=embed`
      : null;

  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const profileUrl = `${base}/praxis/${d.city_slug}/${d.slug}`;

  // Präziser @type nach Kategorie
  const typeFor = (pt) => {
    if (pt === 'dentist' || pt === 'dental_clinic') return 'Dentist';
    if (pt === 'pharmacy') return 'Pharmacy';
    if (pt === 'hospital' || pt === 'general_hospital') return 'Hospital';
    if (pt === 'physiotherapist') return ['MedicalBusiness', 'Physiotherapy'];
    // Wenn wir eine spezifische Fachrichtung erkannt haben und die Praxis wie eine Einzelpraxis wirkt
    if (d.specialty_guess && d.specialty_guess !== 'Krankenhaus') return ['MedicalBusiness', 'Physician'];
    return 'MedicalBusiness';
  };

  // Öffnungszeiten in schema.org OpeningHoursSpecification umwandeln
  // Google Places days: 0=Sonntag, 1=Montag, ..., 6=Samstag
  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const hhmm = (h, m) => `${String(h ?? 0).padStart(2, '0')}:${String(m ?? 0).padStart(2, '0')}`;
  const openingHoursSpec = (() => {
    const periods = d.opening_hours_json?.periods;
    if (!Array.isArray(periods) || periods.length === 0) return undefined;
    return periods
      .filter((p) => p?.open && p?.close)
      .map((p) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${daysMap[p.open.day] || 'Monday'}`,
        opens: hhmm(p.open.hour, p.open.minute),
        closes: hhmm(p.close.hour, p.close.minute),
      }));
  })();

  const schema = {
    '@context': 'https://schema.org',
    '@type': typeFor(d.primary_type),
    '@id': profileUrl,
    name: d.name,
    url: profileUrl,
    mainEntityOfPage: profileUrl,
    ...(d.specialty_guess && { medicalSpecialty: d.specialty_guess }),
    ...(d.website_url && { sameAs: [d.website_url] }),
    address: d.formatted_address ? {
      '@type': 'PostalAddress',
      streetAddress: d.street || undefined,
      postalCode: d.postal_code || undefined,
      addressLocality: d.city || undefined,
      addressRegion: d.state || undefined,
      addressCountry: d.country === 'Deutschland' ? 'DE' : (d.country || 'DE'),
    } : undefined,
    telephone: d.phone_international || d.phone_national || undefined,
    ...(d.website_url && { url: d.website_url }),
    ...(d.google_maps_url && { hasMap: d.google_maps_url }),
    ...(d.latitude != null && d.longitude != null && {
      geo: { '@type': 'GeoCoordinates', latitude: d.latitude, longitude: d.longitude },
    }),
    ...(openingHoursSpec && openingHoursSpec.length > 0 && { openingHoursSpecification: openingHoursSpec }),
    ...(d.city && { areaServed: { '@type': 'City', name: d.city } }),
    ...(d.business_status === 'OPERATIONAL' ? { isAccessibleForFree: true } : {}),
    inLanguage: 'de-DE',
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Start', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: 'Ärzte', item: `${base}/aerzte` },
      ...(d.city ? [{ '@type': 'ListItem', position: 3, name: d.city, item: `${base}/aerzte/${d.city_slug}` }] : []),
      { '@type': 'ListItem', position: d.city ? 4 : 3, name: d.name, item: profileUrl },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <nav className="mb-4 flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link>
        <span>/</span>
        <Link href="/suche" className="hover:text-sky-700">Suche</Link>
        {d.city && (<><span>/</span><Link href={`/suche?ort=${encodeURIComponent(d.city)}`} className="hover:text-sky-700">{d.city}</Link></>)}
        <span>/</span>
        <span className="text-slate-700">{d.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="card-soft p-6">
            <div className="flex flex-wrap items-center gap-2">
              {d.specialty_guess && <span className="chip border-sky-100 bg-sky-50 text-sky-700">{d.specialty_guess}</span>}
              {d.primary_type && <span className="chip">{d.primary_type}</span>}
              {d.business_status === 'OPERATIONAL' && <span className="chip border-emerald-100 bg-emerald-50 text-emerald-700">Aktiv</span>}
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 break-words">{d.name}</h1>
            <p className="mt-2 flex items-start gap-2 text-slate-600 break-words"><MapPin className="h-4 w-4 shrink-0 mt-0.5" /> {d.formatted_address}</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {(d.phone_national || d.phone_international) && (
                <a href={`tel:${d.phone_international || d.phone_national}`} className="btn-primary justify-center break-all">
                  <Phone className="mr-2 h-4 w-4 shrink-0" /> {d.phone_national || d.phone_international}
                </a>
              )}
              {d.website_url && (
                <a href={d.website_url} target="_blank" rel="noreferrer" className="btn-secondary justify-center">
                  <Globe className="mr-2 h-4 w-4" /> Website
                </a>
              )}
              {d.google_maps_url && (
                <a href={d.google_maps_url} target="_blank" rel="noreferrer" className="btn-secondary justify-center">
                  <ExternalLink className="mr-2 h-4 w-4" /> Route berechnen
                </a>
              )}
            </div>
          </div>

          {/* Karte */}
          {mapEmbed && (
            <div className="card-soft mt-6 overflow-hidden">
              <iframe
                src={mapEmbed}
                width="100%"
                height="340"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block"
              />
            </div>
          )}

          {/* Öffnungszeiten */}
          {d.opening_hours_json?.weekdayDescriptions && (
            <div className="card-soft mt-6 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Clock className="h-4 w-4" /> Öffnungszeiten</div>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
                {d.opening_hours_json.weekdayDescriptions.map((w, i) => (
                  <li key={i} className="flex justify-between border-b border-slate-100 py-1 last:border-0">
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-slate-400">Öffnungszeiten laut externem Verzeichnis. Bitte im Zweifel telefonisch bestätigen.</p>
            </div>
          )}

          {/* Rechtlicher Hinweis */}
          <div className="card-soft mt-6 p-6">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 text-amber-500" />
              <div className="text-sm text-slate-600">
                <p>Diese Praxis-Information wurde aus öffentlich verfügbaren Quellen zusammengestellt. Navoria trifft keine medizinische Aussage über die Qualität der Praxis oder Behandlung. Bewertungen stammen von externen Verzeichnissen.</p>
                <p className="mt-2">Navoria ersetzt keine ärztliche Diagnose. Bei akuten Beschwerden rufen Sie 112.</p>
              </div>
            </div>
          </div>
        </div>

        <aside>
          <div className="card-soft p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Info className="h-4 w-4" /> Datenstand</div>
            <dl className="mt-3 space-y-2 text-sm">
              {lastSynced && (
                <div className="flex justify-between"><dt className="text-slate-500">Zuletzt aktualisiert</dt><dd className="text-slate-800">{lastSynced}</dd></div>
              )}
              <div className="flex justify-between"><dt className="text-slate-500">Quelle</dt><dd className="text-slate-800">Öffentliche Verzeichnisse</dd></div>
              {d.postal_code && <div className="flex justify-between"><dt className="text-slate-500">PLZ</dt><dd className="text-slate-800">{d.postal_code}</dd></div>}
              {d.city && <div className="flex justify-between"><dt className="text-slate-500">Stadt</dt><dd className="text-slate-800">{d.city}</dd></div>}
            </dl>
            <p className="mt-4 text-[11px] leading-relaxed text-slate-400">Praxis-Informationen basieren auf öffentlichen Quellen. Alle Rechte bei den jeweiligen Inhabern.</p>
          </div>

          <Link href={`/suche?ort=${encodeURIComponent(d.city || '')}${d.specialty_guess ? `&q=${encodeURIComponent(d.specialty_guess)}` : ''}`} className="card-soft mt-4 block p-5 hover:shadow-md">
            <div className="text-sm font-semibold text-slate-900">Ähnliche Praxen finden</div>
            <p className="mt-1 text-xs text-slate-500">{d.specialty_guess ? `${d.specialty_guess} in ${d.city || 'Ihrer Nähe'}` : `Weitere Ärzte in ${d.city || 'Ihrer Nähe'}`}</p>
          </Link>
        </aside>
      </div>
    </div>
  );
}
