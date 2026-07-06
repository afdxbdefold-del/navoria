// Zentraler Fachrichtungs-Katalog: slug <-> Anzeige-Label
export const SPECIALTIES = [
  { slug: 'hausarzt', label: 'Hausarzt', plural: 'Hausärzte', placeType: 'doctor', query: 'Hausarzt' },
  { slug: 'zahnarzt', label: 'Zahnarzt', plural: 'Zahnärzte', placeType: 'dentist', query: 'Zahnarzt' },
  { slug: 'kardiologe', label: 'Kardiologe', plural: 'Kardiologen', placeType: 'doctor', query: 'Kardiologe' },
  { slug: 'orthopaede', label: 'Orthopäde', plural: 'Orthopäden', placeType: 'doctor', query: 'Orthopäde' },
  { slug: 'hautarzt', label: 'Hautarzt', plural: 'Hautärzte', placeType: 'doctor', query: 'Dermatologe' },
  { slug: 'frauenarzt', label: 'Frauenarzt', plural: 'Frauenärzte', placeType: 'doctor', query: 'Gynäkologe' },
  { slug: 'kinderarzt', label: 'Kinderarzt', plural: 'Kinderärzte', placeType: 'doctor', query: 'Kinderarzt' },
  { slug: 'augenarzt', label: 'Augenarzt', plural: 'Augenärzte', placeType: 'doctor', query: 'Augenarzt' },
  { slug: 'hno-arzt', label: 'HNO-Arzt', plural: 'HNO-Ärzte', placeType: 'doctor', query: 'HNO' },
  { slug: 'urologe', label: 'Urologe', plural: 'Urologen', placeType: 'doctor', query: 'Urologe' },
  { slug: 'neurologe', label: 'Neurologe', plural: 'Neurologen', placeType: 'doctor', query: 'Neurologe' },
  { slug: 'psychiater', label: 'Psychiater', plural: 'Psychiater', placeType: 'doctor', query: 'Psychiater' },
  { slug: 'psychotherapeut', label: 'Psychotherapeut', plural: 'Psychotherapeuten', placeType: 'doctor', query: 'Psychotherapeut' },
  { slug: 'radiologe', label: 'Radiologe', plural: 'Radiologen', placeType: 'doctor', query: 'Radiologe' },
  { slug: 'internist', label: 'Internist', plural: 'Internisten', placeType: 'doctor', query: 'Internist' },
  { slug: 'chirurg', label: 'Chirurg', plural: 'Chirurgen', placeType: 'doctor', query: 'Chirurg' },
  { slug: 'physiotherapeut', label: 'Physiotherapeut', plural: 'Physiotherapeuten', placeType: 'physiotherapist', query: 'Physiotherapie' },
  { slug: 'apotheke', label: 'Apotheke', plural: 'Apotheken', placeType: 'pharmacy', query: 'Apotheke' },
  { slug: 'krankenhaus', label: 'Krankenhaus', plural: 'Krankenhäuser', placeType: 'hospital', query: 'Krankenhaus' },
  // Erweiterte Gesundheitsberufe (Sprint 3, teilweise ohne dediziertes Google-Place-Type)
  { slug: 'heilpraktiker', label: 'Heilpraktiker', plural: 'Heilpraktiker', placeType: null, query: 'Heilpraktiker' },
  { slug: 'osteopath', label: 'Osteopath', plural: 'Osteopathen', placeType: null, query: 'Osteopathie' },
  { slug: 'logopaede', label: 'Logopäde', plural: 'Logopäden', placeType: null, query: 'Logopädie' },
  { slug: 'ergotherapeut', label: 'Ergotherapeut', plural: 'Ergotherapeuten', placeType: null, query: 'Ergotherapie' },
  { slug: 'hebamme', label: 'Hebamme', plural: 'Hebammen', placeType: null, query: 'Hebamme' },
  { slug: 'podologe', label: 'Podologe', plural: 'Podologen', placeType: null, query: 'Podologie' },
];

export function specialtyBySlug(slug) {
  return SPECIALTIES.find((s) => s.slug === slug) || null;
}

export function specialtyByLabel(label) {
  return SPECIALTIES.find((s) => s.label === label) || null;
}
