// Root-Level Praxis-Homepage Route: navoria.de/[praxisSlug]  bzw. <slug>.navoria.de/
// Verhalten:
//   1. Praxis mit passendem homepage_slug + homepage_mode:true → PracticeHomepage rendern
//      (Praxis-eigene Präsenz, ohne Navoria-Branding, kanonisch = Subdomain)
//   2. Praxis mit passendem homepage_slug + homepage_mode:false → Directory-Content
//      rendern, aber weiterhin unter der Subdomain – Subdomain bleibt kanonisch.
//      → aus SEO-Sicht ist der Directory-Eintrag jetzt unter der Subdomain erreichbar.
//   3. Reservierter Slug oder kein Match → 404
//
// Directory-Rendering wird durch Wiederverwendung der ProfilePage-Komponente von
// /praxis/[stadt]/[slug] gelöst. Die Metadaten kommen aus dieser Route hier
// (Canonical / OG / Robots), damit sie die Subdomain als kanonisch führen.

import { getCollection } from '@/lib/mongodb';
import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { isReservedRootSlug } from '@/lib/reservedSlugs';
import PracticeHomepage from '@/components/PracticeHomepage';
import ProfilePage from '@/app/praxis/[stadt]/[slug]/page';
import { getBaseUrl } from '@/lib/baseUrl';
import { getPraxisHomepageUrl, extractPraxisSubdomain, isPreviewHost, MAIN_DOMAIN } from '@/lib/subdomains';
import { hasExternalWebsite } from '@/lib/ownUrl';

async function loadByHomepageSlug(slug) {
  if (!slug) return null;
  if (isReservedRootSlug(slug)) return null;
  const col = await getCollection('doctor_places');
  const doc = await col.findOne({
    homepage_slug: slug.toLowerCase(),
    is_active: { $ne: false },
  });
  if (!doc) return null;
  const { _id, source_payload_json, ...rest } = doc;
  return rest;
}

// Baut die kanonische URL dieser Route: bevorzugt die Praxis-Subdomain.
async function buildSubdomainCanonical(homepageSlug) {
  const hdr = await headers();
  const clientHost = (hdr.get('x-forwarded-host') || hdr.get('host') || '').split(',')[0].trim().toLowerCase().split(':')[0];
  if (isPreviewHost(clientHost)) return `${await getBaseUrl()}/${homepageSlug}`;
  return getPraxisHomepageUrl(homepageSlug);
}

export async function generateMetadata({ params }) {
  const { praxisSlug } = await params;
  const d = await loadByHomepageSlug(praxisSlug);
  if (!d) return { title: 'Nicht gefunden' };

  const displayName = d.name;
  const cityText = d.city || '';
  const specialty = d.specialty_guess || 'Arztpraxis';
  const absoluteCanonical = await buildSubdomainCanonical(d.homepage_slug);

  // Modus AKTIV: eigenständige Praxis-Homepage (Praxis ist Autor/Publisher).
  if (d.homepage_mode === true) {
    const title = `${displayName} – ${specialty} in ${cityText}`;
    const desc = `Praxis ${displayName} in ${cityText}. ${d.formatted_address ? `Adresse: ${d.formatted_address}. ` : ''}${d.phone_national ? `Termine: ${d.phone_national}.` : ''}`;
    return {
      title: { absolute: title },
      description: desc,
      alternates: { canonical: absoluteCanonical },
      applicationName: displayName,
      authors: [{ name: displayName }],
      creator: displayName,
      publisher: displayName,
      keywords: null,
      robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
      },
      openGraph: {
        title, description: desc, type: 'website', locale: 'de_DE',
        url: absoluteCanonical, siteName: displayName,
      },
      twitter: { card: 'summary', title, description: desc },
      other: { 'og:site_name': displayName },
    };
  }

  // Modus AUS: Directory-Content unter der Subdomain – Navoria-Metadaten,
  // Canonical zeigt auf die Subdomain-URL (nicht auf /praxis/…).
  const title = specialty
    ? `${displayName} – ${specialty} in ${cityText} | Adresse, Telefon & Öffnungszeiten`
    : `${displayName} in ${cityText} | Adresse, Telefon & Praxisinfos`;
  const description = `Informationen zu ${displayName}${specialty && specialty !== 'Arztpraxis' ? ` (${specialty})` : ''} in ${cityText}: Adresse, Telefonnummer, Öffnungszeiten, Fachgebiet, Website und Anfahrt. Angaben bitte vor dem Termin bestätigen.`;
  const hasOwnWebsite = hasExternalWebsite(d.website_url);
  return {
    title,
    description,
    alternates: { canonical: absoluteCanonical },
    robots: hasOwnWebsite
      ? { index: false, follow: true, googleBot: { index: false, follow: true } }
      : { index: true, follow: true },
    openGraph: {
      title, description, type: 'profile', locale: 'de_DE', url: absoluteCanonical,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function PraxisHomepagePage({ params }) {
  const { praxisSlug } = await params;
  const d = await loadByHomepageSlug(praxisSlug);
  if (!d) notFound();

  const hdr = await headers();
  const clientHost = (hdr.get('x-forwarded-host') || hdr.get('host') || '').split(',')[0].trim().toLowerCase().split(':')[0];
  const requestedFromSubdomain = extractPraxisSubdomain(clientHost);

  // Bei Root-Domain-Aufruf (navoria.de/[slug]) → 301 auf Subdomain-URL, damit die
  // Praxis-URL kanonisch ist. Preview-/Dev-Hosts sind ausgenommen.
  if (!isPreviewHost(clientHost) && !requestedFromSubdomain) {
    redirect(getPraxisHomepageUrl(d.homepage_slug), 'replace');
  }

  // Modus AKTIV → Praxis-eigene Homepage rendern.
  if (d.homepage_mode === true) {
    return (
      <>
        {d.google_verification_token && (
          <meta name="google-site-verification" content={String(d.google_verification_token).trim()} />
        )}
        <PracticeHomepage doctor={d} />
      </>
    );
  }

  // Modus AUS → Directory-Content unter der Subdomain rendern.
  // Wir delegieren an die bestehende ProfilePage-Komponente. Das Metadata-Handling
  // hat bereits die Subdomain als Canonical gesetzt (siehe generateMetadata oben).
  return <ProfilePage params={Promise.resolve({ stadt: d.city_slug, slug: d.slug })} />;
}
