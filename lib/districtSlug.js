// Helper zur Normalisierung von Stadtteil-/Bezirks-Namen (District) aus Google Places
// zu URL-Slugs. Google liefert Namen inkonsistent: "Mitte", "Bezirk Friedrichshain-Kreuzberg",
// "Hamburg-Mitte" – wir bringen sie auf ein einheitliches Slug-Format.

export function districtToSlug(district) {
  if (!district || typeof district !== 'string') return null;
  return district
    .toLowerCase()
    .replace(/^bezirk\s+/i, '')       // "Bezirk Friedrichshain-Kreuzberg" → "friedrichshain-kreuzberg"
    .replace(/^stadtteil\s+/i, '')
    .replace(/^ortsteil\s+/i, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Diakritika entfernen
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\-\s]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Umgekehrter Weg fehlt bewusst: wir speichern beide (Anzeige-Name aus DB, Slug
// berechnet) und filtern per aggregation-side slug.

export function districtDisplayName(district) {
  if (!district) return '';
  // "Bezirk Friedrichshain-Kreuzberg" → "Friedrichshain-Kreuzberg"
  return district.replace(/^Bezirk\s+/i, '').trim();
}
