// Root-Level Praxis-Homepage Route: navoria.de/[praxisSlug]
// Wird NUR gerendert, wenn eine Praxis mit homepage_mode:true und homepage_slug:<slug> existiert.
//
// Das ist die "echte" SEO-Trennung: Die Praxis-Homepage sieht für Google wie eine
// eigenständige Website aus (keine /praxis/[stadt]/ Route mehr).
//
// Reserved Slugs (admin, aerzte, praxis, api, ...) werden abgefangen und geben 404.
// Alle statischen Routen von Next.js haben Vorrang vor dieser dynamischen Route,
// daher entstehen keine Konflikte.

import { getCollection } from '@/lib/mongodb';
import { notFound } from 'next/navigation';
import { isReservedRootSlug } from '@/lib/reservedSlugs';
import PracticeHomepage from '@/components/PracticeHomepage';

async function loadByHomepageSlug(slug) {
  if (!slug) return null;
  if (isReservedRootSlug(slug)) return null;
  const col = await getCollection('doctor_places');
  const doc = await col.findOne({
    homepage_slug: slug.toLowerCase(),
    homepage_mode: true,
    is_active: { $ne: false },
  });
  if (!doc) return null;
  const { _id, source_payload_json, ...rest } = doc;
  return rest;
}

export async function generateMetadata({ params }) {
  const { praxisSlug } = await params;
  const d = await loadByHomepageSlug(praxisSlug);
  if (!d) return { title: 'Nicht gefunden' };

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
      siteName: displayName, // Praxis als "Publisher" – NICHT Navoria
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
  return <PracticeHomepage doctor={d} />;
}
