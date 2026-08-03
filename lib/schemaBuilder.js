// Zentraler JSON-LD-Builder für Arzt-/Praxis-Seiten.
// Verwendet auf:
//   - components/PracticeHomepage.jsx  (Subdomain / Homepage-Modus)
//   - app/praxis/[stadt]/[slug]/page.js (Directory-Profil)
// Ergebnis: GENAU EIN Objekt der medizinischen Hauptentität pro Seite.
//
// Typenauswahl:
//   Physician       – konkreter Arzt (Name enthält Titel wie "Dr.", "Prof.", "Dipl. med.")
//   MedicalClinic   – Praxis / MVZ / Ärztehaus / Klinik / Gemeinschaftspraxis
//   MedicalBusiness – Fallback (nichts davon eindeutig)

import { toSchemaOpeningHours } from '@/lib/openingHours';
import { getEffectiveEmail } from '@/lib/emailGenerator';

const PERSON_TITLE_REGEX = /\b(dr\.?|prof\.?|dipl\.?[\s-]?med|priv\.?[\s-]?doz)\b|\bmed\.\s?dent\b/i;
const CLINIC_MARKER_REGEX = /(praxis|mvz|gemeinschaftspraxis|praxisgemeinschaft|ärztehaus|aerztehaus|klinik|zentrum|ambulanz|poliklinik|medizinisches?\s?versorgungszentrum)/i;

export function chooseMedicalType(doctor) {
  const name = String(doctor?.name || '').trim();
  if (!name) return 'MedicalBusiness';
  const isPerson = PERSON_TITLE_REGEX.test(name);
  const isClinic = CLINIC_MARKER_REGEX.test(name);
  // Person-Titel und keine "Praxis-XY" → Physician
  if (isPerson && !isClinic) return 'Physician';
  // Praxis-/MVZ-/Kliniknamen → MedicalClinic
  if (isClinic) return 'MedicalClinic';
  // Titel im Namen (auch mit Praxis-Zusatz) → Physician gewinnt bei nur "Praxis Dr. X"
  if (isPerson) return 'Physician';
  return 'MedicalBusiness';
}

// Telefonnummer in E.164-ähnliches internationales Format bringen.
// Beispiel: "02371 25687" → "+49 2371 25687"
export function formatPhoneIntl(natOrIntl) {
  const raw = String(natOrIntl || '').trim();
  if (!raw) return null;
  // Schon international?
  if (raw.startsWith('+')) return raw;
  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return null;
  if (digits.startsWith('00')) return '+' + digits.slice(2);
  if (digits.startsWith('0')) return '+49 ' + digits.slice(1);
  return '+' + digits;
}

function pickPhone(doctor) {
  const raw = doctor.phone_international || doctor.phone_national || doctor.phone;
  return formatPhoneIntl(raw);
}

function pickImage(doctor, { canonicalUrl }) {
  // Reihenfolge: hinterlegtes Praxis-/Arztbild → dynamisch generiertes Profilbild.
  if (doctor.image_url) return doctor.image_url;
  if (doctor.profile_image_url) return doctor.profile_image_url;
  const base = canonicalUrl.replace(/\/$/, '');
  // Dynamische Profilbild-Route – neutrales Navoria-Branding, kein erfundenes Porträt.
  return `${base}/api/profile-image`;
}

function buildAddress(doctor) {
  const parts = {};
  if (doctor.street) parts.streetAddress = doctor.street;
  if (doctor.postal_code) parts.postalCode = doctor.postal_code;
  if (doctor.city) parts.addressLocality = doctor.city;
  if (doctor.state) parts.addressRegion = doctor.state;
  parts.addressCountry = 'DE';
  if (Object.keys(parts).length <= 1) return null; // Nur addressCountry → weglassen
  return { '@type': 'PostalAddress', ...parts };
}

function buildGeo(doctor) {
  if (doctor.latitude == null || doctor.longitude == null) return null;
  return { '@type': 'GeoCoordinates', latitude: doctor.latitude, longitude: doctor.longitude };
}

function buildSameAs(doctor) {
  const out = [];
  if (doctor.google_maps_url && /maps\.google\.com/i.test(doctor.google_maps_url)) {
    // Der Suffix ?g_mp=… ist Places-API-Metadata und für sameAs nicht sinnvoll → trimmen.
    out.push(doctor.google_maps_url.split(/[&?]g_mp=/)[0]);
  }
  if (doctor.website_url && !/navoria\.de/i.test(doctor.website_url)) {
    out.push(doctor.website_url);
  }
  return out;
}

function buildAggregateRating(doctor) {
  if (doctor.rating == null) return null;
  const count = Number(doctor.user_rating_count || 0);
  if (count < 5) return null; // Google warnt bei sehr geringen Zahlen.
  return {
    '@type': 'AggregateRating',
    ratingValue: Number(doctor.rating).toFixed(1),
    reviewCount: count,
    bestRating: '5',
    worstRating: '1',
  };
}

/**
 * Baut die medizinische Hauptentität als flaches JSON-LD-Objekt.
 * @param {object} doctor - Datensatz aus doctor_places
 * @param {object} opts   - { canonicalUrl }   → kanonische URL dieser Seite
 */
export function buildDoctorSchema(doctor, { canonicalUrl }) {
  if (!doctor || !canonicalUrl) return null;
  const type = chooseMedicalType(doctor);
  const name = String(doctor.name || 'Arztpraxis').trim();
  const url = canonicalUrl.replace(/\/$/, '') || canonicalUrl;
  const id = `${url}#${type.toLowerCase()}`;
  const address = buildAddress(doctor);
  const geo = buildGeo(doctor);
  const sameAs = buildSameAs(doctor);
  const rating = buildAggregateRating(doctor);
  const email = getEffectiveEmail(doctor);
  const phone = pickPhone(doctor);
  const image = pickImage(doctor, { canonicalUrl: url });
  const specialty = doctor.specialty_guess || null;
  const openingHoursSpec = toSchemaOpeningHours(
    doctor.regular_opening_hours || doctor.opening_hours_json || doctor.opening_hours
  );

  const paymentAccepted = [];
  if (doctor.payment_options?.acceptsCreditCards) paymentAccepted.push('Kreditkarte');
  if (doctor.payment_options?.acceptsDebitCards) paymentAccepted.push('EC-/Debitkarte');
  if (doctor.payment_options?.acceptsCashOnly) paymentAccepted.push('Barzahlung');
  if (doctor.payment_options?.acceptsNfc) paymentAccepted.push('Kontaktloses Bezahlen');

  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': id,
    name,
    url,
    image, // Pflichtfeld für Rich-Results-Fitness
    ...(phone && { telephone: phone }),
    ...(email && { email }),
    ...(address && { address }),
    ...(geo && { geo }),
    ...(specialty && { medicalSpecialty: specialty }),
    ...(sameAs.length && { sameAs }),
    ...(openingHoursSpec?.length && { openingHoursSpecification: openingHoursSpec }),
    ...(doctor.city && { areaServed: { '@type': 'City', name: doctor.city } }),
    ...(paymentAccepted.length && { paymentAccepted: paymentAccepted.join(', ') }),
    inLanguage: 'de-DE',
    ...(rating && { aggregateRating: rating }),
  };
}
