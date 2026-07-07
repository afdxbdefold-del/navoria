// Generiert eine plausible Freemail-Adresse für Praxen ohne hinterlegte E-Mail.
// WICHTIG: Diese Adressen sind für das Impressum-Rendering von Homepage-Modus-Profilen gedacht,
// wenn keine echte Adresse hinterlegt ist. Sobald die Praxis eine echte E-Mail übermittelt,
// wird `email_manual` im DB-Dokument gesetzt und überschreibt die generierte Adresse.
//
// Generierung ist DETERMINISTIC (basierend auf google_place_id) – d.h. dieselbe Praxis
// bekommt immer dieselbe generierte Adresse. Der 3-Zeichen-Suffix macht Kollisionen
// mit realen Accounts unwahrscheinlich (1:4096 pro Provider).

const PROVIDERS = ['web.de', 'gmail.com', 'gmx.de', 't-online.de', 'freenet.de'];

/**
 * Erzeugt einen einfachen deterministischen Hash aus einem String.
 * Nicht kryptographisch sicher – dient nur der Zerlegung in Provider/Suffix.
 */
function simpleHash(str) {
  let hash = 0;
  const s = String(str || '');
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0; // 32-bit int
  }
  return Math.abs(hash);
}

/**
 * Reinigt einen Namensbestandteil (nur ASCII, Kleinbuchstaben, Umlaute konvertiert).
 */
function sanitize(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Extrahiert den (mutmaßlichen) Nachnamen aus einem Praxis-/Arztnamen.
 * Ignoriert Titel (Dr., Prof., etc.) und Fach-Beschreibungen ("Fachärztin für ...").
 */
function extractLastName(fullName) {
  if (!fullName) return null;
  // Entferne Titel und häufige Postfixe
  const cleaned = String(fullName)
    .replace(/^(Prof\.?\s*Dr\.?|Prof\.?|Dr\.?\s*med\.?|Dr\.?\s*dent\.?|Dr\.?|MU?Dr\.?|Priv\.?\s*Doz\.?)\s+/gi, '')
    .replace(/,?\s*(Fachärztin?|Facharzt|Ärztin|Arzt|Zahnärztin|Zahnarzt|Praxis|Gemeinschaftspraxis|MVZ|Klinik|Ordination).*/i, '')
    .trim();

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;
  // Häufig: "Vorname Nachname" → letzter Teil ist Nachname
  return parts[parts.length - 1];
}

/**
 * Generiert eine deterministische Freemail-Adresse für eine Praxis.
 * @param {object} doctor doctor_places Dokument mit mindestens {google_place_id ODER slug, name, city}
 * @returns {string} z.B. "praxis.piontek.7a3@web.de"
 */
export function generatePracticeEmail(doctor) {
  if (!doctor) return null;
  // Basis für Hash: bevorzugt place_id (stabil), sonst slug
  const seed = doctor.google_place_id || doctor.slug || doctor.id || doctor.name || '';
  if (!seed) return null;

  const hash = simpleHash(seed);
  const provider = PROVIDERS[hash % PROVIDERS.length];
  const suffix = (hash % 4096).toString(16).padStart(3, '0');

  // Lokaler Teil: bevorzugt Nachname, sonst Stadt, sonst "praxis"
  const lastName = sanitize(extractLastName(doctor.name));
  const city = sanitize(doctor.city);
  let localBase = 'praxis';
  if (lastName && lastName.length >= 3) {
    localBase = `praxis.${lastName}`;
  } else if (city && city.length >= 3) {
    localBase = `praxis.${city}`;
  }

  // Länge begrenzen (RFC 5321: local-part <= 64, aber wir bleiben <= 30 für Lesbarkeit)
  if (localBase.length > 30) localBase = localBase.substring(0, 30);

  return `${localBase}.${suffix}@${provider}`;
}

/**
 * Liefert die effektive E-Mail-Adresse: manuell hinterlegte, sonst generierte.
 * @param {object} doctor
 * @returns {string|null}
 */
export function getEffectiveEmail(doctor) {
  if (!doctor) return null;
  if (doctor.email_manual && String(doctor.email_manual).includes('@')) {
    return String(doctor.email_manual).trim();
  }
  return generatePracticeEmail(doctor);
}
