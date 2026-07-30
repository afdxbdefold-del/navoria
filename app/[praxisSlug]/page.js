// Root-Level Praxis-Homepage Route: navoria.de/[praxisSlug]
// Verhalten:
//   1. Praxis mit passendem homepage_slug + homepage_mode:true → rendert PracticeHomepage
//   2. Praxis mit passendem homepage_slug + homepage_mode:false → 301-Redirect auf /praxis/[stadt]/[slug]
//      (behält alte Root-URL als SEO-freundlichen Redirect, wenn Homepage-Modus deaktiviert wurde)
//   3. Reservierter Slug oder kein Match → 404
//
// Statische Routen von Next.js haben Vorrang, daher entstehen keine Konflikte mit /admin, /aerzte etc.

import { getCollection } from '@/lib/mongodb';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { isReservedRootSlug } from '@/lib/reservedSlugs';
import PracticeHomepage from '@/components/PracticeHomepage';
import { getBaseUrl } from '@/lib/baseUrl';
import { getPraxisHomepageUrl, extractPraxisSubdomain, isPreviewHost, MAIN_DOMAIN } from '@/lib/subdomains';

async function loadByHomepageSlug(slug) {
  if (!slug) return null;
  if (isReservedRootSlug(slug)) return null;
  const col = await getCollection('doctor_places');
  // Wir laden UNABHÄNGIG vom homepage_mode – damit wir bei mode:false auf das Verzeichnis
  // umleiten können statt 404 zu liefern (SEO-Wert der URL bleibt erhalten).
  const doc = await col.findOne({
    homepage_slug: slug.toLowerCase(),
    is_active: { $ne: false },
  });
  if (!doc) return null;
  const { _id, source_payload_json, ...rest } = doc;
  return rest;
}

export async function generateMetadata({ params }) {
  const { praxisSlug } = await params;
  const d = await loadByHomepageSlug(praxisSlug);
  if (!d || d.homepage_mode !== true) return { title: 'Nicht gefunden' };

  const cityText = d.city || '';
  const specialty = d.specialty_guess || 'Arztpraxis';
  const displayName = d.name;

  // Canonical zeigt IMMER auf die Subdomain-URL, sobald Homepage-Modus aktiv ist.
  // Auch wenn der Nutzer die Praxis via navoria.de/[slug] aufruft, konsolidiert
  // Google so die Signale auf https://<slug>.navoria.de/.
  // Fallback (Preview/Dev): getBaseUrl → aktueller Host.
  const hdr = await headers();
  const clientHost = (hdr.get('x-forwarded-host') || hdr.get('host') || '').split(',')[0].trim().toLowerCase().split(':')[0];
  const isPreview = isPreviewHost(clientHost);

  const absoluteCanonical = isPreview
    ? `${await getBaseUrl()}/${d.homepage_slug}`
    : getPraxisHomepageUrl(d.homepage_slug);

  const title = `${displayName} – ${specialty} in ${cityText}`;
  const desc = `Praxis ${displayName} in ${cityText}. ${d.formatted_address ? `Adresse: ${d.formatted_address}. ` : ''}${d.phone_national ? `Termine: ${d.phone_national}.` : ''}`;

  return {
    title: { absolute: title },
    description: desc,
    alternates: { canonical: absoluteCanonical },
    // Praxis IST die App / der Autor / der Publisher – keine Navoria-Erwähnung.
    applicationName: displayName,
    authors: [{ name: displayName }],
    creator: displayName,
    publisher: displayName,
    keywords: null, // Navoria-Keywords aus Root-Layout unterdrücken
    // Ehemals: Homepage-Modus-Seiten waren temporär und noindex.
    // Neu: Praxis-Homepages sind produktive, indexierbare Seiten mit eigener Subdomain.
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
      },
    },
    openGraph: {
      title, description: desc,
      type: 'website', locale: 'de_DE',
      url: absoluteCanonical,
      siteName: displayName,
    },
    twitter: { card: 'summary', title, description: desc },
    other: {
      'og:site_name': displayName,
    },
  };
}

export default async function PraxisHomepagePage({ params }) {
  const { praxisSlug } = await params;
  const d = await loadByHomepageSlug(praxisSlug);
  if (!d) notFound();

  // Wenn Homepage-Modus AUS ist, leiten wir permanent auf den Directory-Eintrag um.
  // Damit bleibt die alte URL nutzbar (z.B. wenn sie schon verteilt / gedruckt wurde)
  // und Google konsolidiert den Link-Juice via 301 auf das reguläre Verzeichnis-Profil.
  // Wir prüfen den aktuellen Host: bei Aufruf über die Praxis-Subdomain
  // (<slug>.navoria.de) leiten wir absolut auf navoria.de/praxis/... um, damit
  // die Subdomain sauber verlassen wird (statt sich selbst auf einen Nicht-Root-Pfad
  // umzuleiten und dann noch einen zweiten Hop durch die Middleware zu machen).
  if (d.homepage_mode !== true) {
    const hdr2 = await headers();
    const clientHost2 = (hdr2.get('x-forwarded-host') || hdr2.get('host') || '').split(',')[0].trim().toLowerCase().split(':')[0];
    const cameFromSubdomain = !!extractPraxisSubdomain(clientHost2);
    const directoryPath = `/praxis/${d.city_slug}/${d.slug}`;
    if (cameFromSubdomain && !isPreviewHost(clientHost2)) {
      permanentRedirect(`https://${MAIN_DOMAIN}${directoryPath}`);
    }
    permanentRedirect(directoryPath);
  }

  // Falls Homepage-Modus AKTIV und Aufruf via Root-Domain (navoria.de/[slug]) statt
  // Subdomain: 301-Redirect auf die kanonische <slug>.navoria.de/-URL.
  // Preview-/Dev-Hosts sind ausgenommen — dort läuft das alte Root-Slug-Verhalten weiter.
  const hdr = await headers();
  const clientHost = (hdr.get('x-forwarded-host') || hdr.get('host') || '').split(',')[0].trim().toLowerCase().split(':')[0];
  const requestedFromSubdomain = extractPraxisSubdomain(clientHost);

  if (!isPreviewHost(clientHost) && !requestedFromSubdomain) {
    // Root-Domain-Aufruf → Redirect zur Subdomain
    redirect(getPraxisHomepageUrl(d.homepage_slug), 'replace');
  }

  return (
    <>
      {/* Google Search Console Verifikation – wird pro Praxis vom Admin gepflegt.
          Wenn die Praxis eine eigene URL-Präfix-Property für ihre Homepage
          eingerichtet hat, kann sie den Token hier hinterlegen. Der Meta-Tag
          wird von Google zur Verifizierung ausgelesen. */}
      {d.google_verification_token && (
        <meta
          name="google-site-verification"
          content={String(d.google_verification_token).trim()}
        />
      )}
      <PracticeHomepage doctor={d} />
    </>
  );
}

