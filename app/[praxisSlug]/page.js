// Root-Level Praxis-Homepage Route: navoria.de/[praxisSlug]
// Verhalten:
//   1. Praxis mit passendem homepage_slug + homepage_mode:true → rendert PracticeHomepage
//   2. Praxis mit passendem homepage_slug + homepage_mode:false → 301-Redirect auf /praxis/[stadt]/[slug]
//      (behält alte Root-URL als SEO-freundlichen Redirect, wenn Homepage-Modus deaktiviert wurde)
//   3. Reservierter Slug oder kein Match → 404
//
// Statische Routen von Next.js haben Vorrang, daher entstehen keine Konflikte mit /admin, /aerzte etc.

import { getCollection } from '@/lib/mongodb';
import { notFound, permanentRedirect } from 'next/navigation';
import { isReservedRootSlug } from '@/lib/reservedSlugs';
import PracticeHomepage from '@/components/PracticeHomepage';

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
  const canonical = `/${d.homepage_slug}`;
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const absoluteCanonical = `${base}${canonical}`;

  const title = `${displayName} – ${specialty} in ${cityText}`;
  const desc = `Praxis ${displayName} in ${cityText}. ${d.formatted_address ? `Adresse: ${d.formatted_address}. ` : ''}${d.phone_national ? `Termine: ${d.phone_national}.` : ''}`;

  return {
    title: { absolute: title },
    description: desc,
    alternates: { canonical: absoluteCanonical },
    robots: { index: true, follow: true },
    openGraph: {
      title, description: desc,
      type: 'website', locale: 'de_DE',
      url: absoluteCanonical,
      siteName: displayName,
    },
    twitter: { card: 'summary', title, description: desc },
    other: {
      'og:site_name': displayName,
      publisher: displayName,
    },
  };
}

export default async function PraxisHomepagePage({ params }) {
  const { praxisSlug } = await params;
  const d = await loadByHomepageSlug(praxisSlug);
  if (!d) notFound();

  // Wenn Homepage-Modus AUS ist, leiten wir auf den Directory-Eintrag um.
  // Damit bleibt die alte URL nutzbar (z.B. wenn sie schon verteilt / gedruckt wurde)
  // und Google konsolidiert den Link-Juice via 301 auf den Directory-Eintrag.
  if (d.homepage_mode !== true) {
    permanentRedirect(`/praxis/${d.city_slug}/${d.slug}`);
  }

  return <PracticeHomepage doctor={d} />;
}

