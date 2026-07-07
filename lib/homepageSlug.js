// Generator für Root-Level Praxis-Homepage-Slugs.
// Beispiel: "Dr. med. Jaroslaw Raczynski" → "jaroslaw-raczynski"
//
// Bei Kollisionen wird ein Suffix (Stadt oder Zahl) angehängt.
// Die Prüfung, ob der Slug bereits vergeben ist, muss vom Aufrufer erfolgen (DB-Lookup).

import { isReservedRootSlug } from './reservedSlugs';

/**
 * Wandelt einen String in einen URL-sicheren Slug um (Kleinbuchstaben, Bindestriche,
 * Umlaute konvertiert, nur ASCII).
 */
function toSlug(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

/**
 * Entfernt Titel und Fachbezeichnungen aus einem Praxisnamen.
 * "Dr. med. Jaroslaw Raczynski Facharzt für ..." → "Jaroslaw Raczynski"
 */
function cleanNameForSlug(fullName) {
  if (!fullName) return '';
  return String(fullName)
    // Titel entfernen
    .replace(/^(Prof\.?\s*Dr\.?\s*med\.?\s*dent\.?|Prof\.?\s*Dr\.?\s*med\.?|Prof\.?\s*Dr\.?|Dr\.?\s*med\.?\s*dent\.?|Dr\.?\s*med\.?|Dr\.?\s*dent\.?|Dr\.?|Priv\.?\s*Doz\.?|MU?Dr\.?)\s+/gi, '')
    // Fachbezeichnungen abschneiden
    .replace(/,?\s*(Fachärztin?|Facharzt|Fachzahnärztin?|Fachzahnarzt|Ärztin|Arzt|Zahnärztin?|Zahnarzt|Praxis|Gemeinschaftspraxis|MVZ|Klinik|Ordination|Praxisgemeinschaft).*/i, '')
    .trim();
}

/**
 * Erzeugt einen Homepage-Slug-Kandidaten aus dem Praxisnamen.
 * Fällt zurück auf city + zufälligen Suffix falls Name unbrauchbar.
 */
export function generateHomepageSlug(doctor) {
  const cleaned = cleanNameForSlug(doctor?.name || '');
  const base = toSlug(cleaned) || toSlug(doctor?.name || '');
  if (base && base.length >= 3) return base;
  // Fallback: city + kurzer suffix aus place_id
  const citySlug = toSlug(doctor?.city || 'praxis');
  const suffix = String(doctor?.google_place_id || doctor?.id || '').slice(-4).toLowerCase();
  return `${citySlug}-${suffix}`;
}

/**
 * Prüft, ob ein Homepage-Slug gültig ist (nicht reserviert, nicht leer, richtiges Format).
 * @returns {string|null} Fehlermeldung oder null wenn gültig
 */
export function validateHomepageSlug(slug) {
  if (!slug || typeof slug !== 'string') return 'Slug fehlt';
  const s = slug.trim().toLowerCase();
  if (s.length < 3) return 'Slug zu kurz (min. 3 Zeichen)';
  if (s.length > 80) return 'Slug zu lang (max. 80 Zeichen)';
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(s)) return 'Nur Kleinbuchstaben, Ziffern und Bindestriche erlaubt';
  if (isReservedRootSlug(s)) return `"${s}" ist ein reservierter Slug`;
  return null;
}

/**
 * Ermittelt einen freien Homepage-Slug für eine Praxis, indem bei Kollision
 * automatisch ein Suffix (Stadt bzw. Zahl) angehängt wird.
 *
 * @param {object} doctor Das doctor_places-Dokument
 * @param {object} collection MongoDB-Collection doctor_places (für Kollisionsprüfung)
 * @returns {Promise<string>} Freier Slug
 */
export async function findFreeHomepageSlug(doctor, collection) {
  let candidate = generateHomepageSlug(doctor);
  const cityToken = toSlug(doctor?.city || '');
  const currentId = doctor?.id || null;

  // Reserved? → sofort city anhängen
  if (isReservedRootSlug(candidate)) {
    candidate = cityToken ? `${candidate}-${cityToken}` : `${candidate}-praxis`;
  }

  // Kollisionsprüfung – existiert bereits jemand mit diesem homepage_slug (der nicht wir sind)?
  const isTaken = async (s) => {
    const existing = await collection.findOne({ homepage_slug: s, id: { $ne: currentId } }, { projection: { _id: 0, id: 1 } });
    return !!existing;
  };

  // Erst-Try
  if (!(await isTaken(candidate))) return candidate;

  // City-Suffix probieren
  if (cityToken) {
    const withCity = `${candidate}-${cityToken}`;
    if (!isReservedRootSlug(withCity) && !(await isTaken(withCity))) return withCity;
  }

  // Nummerierten Suffix probieren
  for (let i = 2; i <= 20; i++) {
    const numbered = `${candidate}-${i}`;
    if (!(await isTaken(numbered))) return numbered;
  }

  // Fallback: place_id Suffix
  const suffix = String(doctor?.google_place_id || '').slice(-6).toLowerCase();
  return `${candidate}-${suffix}`;
}
