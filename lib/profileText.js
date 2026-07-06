// Erzeugt ein individuelles, datenbasiertes Kurzprofil (80–140 Wörter).
// KEIN Marketing-Wording, KEINE medizinischen Aussagen, KEINE Werbe-Adjektive.

export function buildProfileText(d, { humanizedType } = {}) {
  const name = d.name || 'Diese Praxis';
  const city = d.city || null;
  const specialty = d.specialty_guess || null;
  const district = d.district || null;
  const address = d.formatted_address || null;
  const hasPhone = !!(d.phone_national || d.phone_international);
  const hasSite = !!d.website_url;
  const hasHours = !!(d.regular_opening_hours?.periods?.length || d.opening_hours_json?.periods?.length);

  const parts = [];

  if (specialty) {
    parts.push(`${name} ist als ${specialty}${humanizedType && humanizedType !== specialty && humanizedType !== `${specialty}praxis` ? ` – ${humanizedType}` : ''} in ${city || 'Deutschland'} eingetragen.`);
  } else {
    parts.push(`${name} ist als medizinischer Standort${humanizedType ? ` (${humanizedType})` : ''} in ${city || 'Deutschland'} eingetragen.`);
  }

  if (address) {
    parts.push(`Die Praxis befindet sich in ${address}${district ? ` (Stadtteil ${district})` : ''}.`);
  }

  const sig = [];
  if (hasPhone) sig.push('Kontaktinformationen inklusive Telefonnummer');
  if (hasSite) sig.push('einem Link zur offiziellen Praxiswebsite');
  if (hasHours) sig.push('den regulären Öffnungszeiten');
  sig.push('einem Routenlink zur Anfahrt');

  const listText = sig.length > 1
    ? sig.slice(0, -1).join(', ') + ' sowie ' + sig[sig.length - 1]
    : sig[0];

  parts.push(`Auf dieser Seite finden Sie ${listText}.`);

  if (!specialty) {
    parts.push('Konkrete Angaben zum Fachgebiet, zu Behandlungsschwerpunkten und zu Terminmöglichkeiten sollten direkt bei der Praxis bestätigt werden.');
  } else {
    parts.push('Angaben zu Behandlungsschwerpunkten und Terminverfügbarkeit können sich ändern – bitte bestätigen Sie wichtige Informationen direkt bei der Praxis.');
  }

  return parts.join(' ');
}
