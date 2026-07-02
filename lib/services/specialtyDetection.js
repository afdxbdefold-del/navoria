// Heuristik: Aus Praxis-Name oder Suchbegriff eine Fachrichtung erraten
export const SPECIALTY_KEYWORDS = [
  { specialty: 'Kardiologe', patterns: ['kardiolog', 'herz-', 'herzpraxis', 'kardio '] },
  { specialty: 'Orthopäde', patterns: ['orthopäd', 'orthopadie', 'wirbelsäul'] },
  { specialty: 'Hautarzt', patterns: ['dermatolog', 'hautarzt', 'hautärzt', 'hautpraxis'] },
  { specialty: 'Frauenarzt', patterns: ['gynäkolog', 'gynakolog', 'frauenarzt', 'frauenärzt', 'frauenheilkunde'] },
  { specialty: 'Kinderarzt', patterns: ['pädiatr', 'padiatr', 'kinderarzt', 'kinderärzt', 'kinderheilkunde'] },
  { specialty: 'Urologe', patterns: ['urolog'] },
  { specialty: 'HNO-Arzt', patterns: ['hno', 'hals-nasen', 'hals nasen', 'ohrenheil'] },
  { specialty: 'Augenarzt', patterns: ['augenarzt', 'augenärzt', 'augenheilkunde', 'ophthalm'] },
  { specialty: 'Zahnarzt', patterns: ['zahnarzt', 'zahnärzt', 'zahnmedizin', 'zahnheil', 'dental'] },
  { specialty: 'Neurologe', patterns: ['neurolog'] },
  { specialty: 'Psychiater', patterns: ['psychiater', 'psychiatr'] },
  { specialty: 'Psychotherapeut', patterns: ['psychotherap'] },
  { specialty: 'Radiologe', patterns: ['radiolog', 'röntgen'] },
  { specialty: 'Internist', patterns: ['internist', 'innere medizin'] },
  { specialty: 'Hausarzt', patterns: ['hausarzt', 'hausärzt', 'allgemeinmedizin', 'allgemeinarzt', 'allgemein-arzt'] },
  { specialty: 'Chirurg', patterns: ['chirurg'] },
  { specialty: 'Physiotherapeut', patterns: ['physiotherap', 'krankengymn', 'physiopraxis'] },
  { specialty: 'Apotheke', patterns: ['apotheke'] },
  { specialty: 'Krankenhaus', patterns: ['krankenhaus', 'klinikum', 'klinik ', 'hospital'] },
];

export function detectSpecialty(text, primaryType, types = []) {
  if (!text && !primaryType) return { guess: null, confidence: 0 };
  const searchStr = (text || '').toLowerCase();

  for (const { specialty, patterns } of SPECIALTY_KEYWORDS) {
    for (const p of patterns) {
      if (searchStr.includes(p)) {
        return { guess: specialty, confidence: 0.85 };
      }
    }
  }

  // Fallback aus primary_type
  const typeMap = {
    dentist: 'Zahnarzt',
    dental_clinic: 'Zahnarzt',
    hospital: 'Krankenhaus',
    general_hospital: 'Krankenhaus',
    pharmacy: 'Apotheke',
    physiotherapist: 'Physiotherapeut',
    chiropractor: 'Chiropraktiker',
  };
  if (primaryType && typeMap[primaryType]) {
    return { guess: typeMap[primaryType], confidence: 0.7 };
  }
  const allTypes = [primaryType, ...(types || [])];
  for (const t of allTypes) {
    if (t && typeMap[t]) return { guess: typeMap[t], confidence: 0.6 };
  }
  if (primaryType === 'doctor') return { guess: 'Arzt', confidence: 0.3 };
  return { guess: null, confidence: 0 };
}

export function slugify(text) {
  return (text || '')
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}
