// Heuristik: Aus Praxis-Name, Website-URL oder Suchbegriff eine Fachrichtung erraten
export const SPECIALTY_KEYWORDS = [
  { specialty: 'Kardiologe', patterns: ['kardiolog', 'herz-', 'herzpraxis', 'kardio ', 'herz-und-'] },
  { specialty: 'Orthopäde', patterns: ['orthopäd', 'orthopadie', 'orthopedie', 'wirbelsäul', 'orthop-'] },
  { specialty: 'Hautarzt', patterns: ['dermatolog', 'hautarzt', 'hautärzt', 'hautpraxis', 'hautzentrum'] },
  { specialty: 'Frauenarzt', patterns: ['gynäkolog', 'gynakolog', 'gynaekolog', 'frauenarzt', 'frauenärzt', 'frauenheilkunde', 'frauenaerztin'] },
  { specialty: 'Kinderarzt', patterns: ['pädiatr', 'padiatr', 'paediatr', 'kinderarzt', 'kinderärzt', 'kinderheilkunde', 'kinder-und-jugend'] },
  { specialty: 'Urologe', patterns: ['urolog'] },
  { specialty: 'HNO-Arzt', patterns: ['hno', 'hals-nasen', 'hals nasen', 'ohrenheil'] },
  { specialty: 'Augenarzt', patterns: ['augenarzt', 'augenärzt', 'augenheilkunde', 'ophthalm', 'augenklinik', 'augenzentrum'] },
  { specialty: 'Zahnarzt', patterns: ['zahnarzt', 'zahnärzt', 'zahnmedizin', 'zahnheil', 'dental', 'kieferorthop', 'implantolog'] },
  { specialty: 'Neurologe', patterns: ['neurolog'] },
  { specialty: 'Psychiater', patterns: ['psychiater', 'psychiatr'] },
  { specialty: 'Psychotherapeut', patterns: ['psychotherap'] },
  { specialty: 'Radiologe', patterns: ['radiolog', 'röntgen', 'roentgen', 'mrt-', 'ct-praxis'] },
  { specialty: 'Internist', patterns: ['internist', 'innere medizin', 'innere-medizin'] },
  { specialty: 'Hausarzt', patterns: ['hausarzt', 'hausärzt', 'allgemeinmedizin', 'allgemeinarzt', 'allgemein-arzt', 'praktischer arzt', 'praxis-fuer-allgemein'] },
  { specialty: 'Chirurg', patterns: ['chirurg'] },
  { specialty: 'Physiotherapeut', patterns: ['physiotherap', 'krankengymn', 'physiopraxis', 'physio-'] },
  { specialty: 'Apotheke', patterns: ['apotheke'] },
  { specialty: 'Krankenhaus', patterns: ['krankenhaus', 'klinikum', 'klinik ', 'hospital'] },
];

export function detectSpecialty(text, primaryType, types = [], websiteUrl = null) {
  if (!text && !primaryType && !websiteUrl) return { guess: null, confidence: 0 };

  // Aufbau Analyse-String: Name + Suchbegriff + Website-Domain
  let searchStr = (text || '').toLowerCase();
  if (websiteUrl) {
    try {
      const host = new URL(websiteUrl).hostname.toLowerCase().replace(/^www\./, '');
      searchStr += ' ' + host.replace(/\./g, ' ').replace(/-/g, ' ');
    } catch { /* invalid url */ }
  }

  for (const { specialty, patterns } of SPECIALTY_KEYWORDS) {
    for (const p of patterns) {
      if (searchStr.includes(p)) {
        // Höhere Confidence, wenn Match aus Name UND Website
        const nameMatch = (text || '').toLowerCase().includes(p);
        return { guess: specialty, confidence: nameMatch ? 0.9 : 0.75 };
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
  if (primaryType && typeMap[primaryType]) return { guess: typeMap[primaryType], confidence: 0.7 };
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
