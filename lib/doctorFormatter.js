// Extrahiert aus dem displayName strukturierte Bestandteile.
// Beispiel:
//   "Dr. med. Marwa Basalama - Hausarztpraxis Düsseldorf"
//   -> { title_prefix: 'Dr. med.', doctor_name_normalized: 'Marwa Basalama', practice_name: 'Hausarztpraxis Düsseldorf' }
// KEINE Halluzination – wenn nichts erkannt wird, bleiben die Felder null.

const TITLE_PATTERNS = [
  /^(Prof\.?\s*Dr\.?\s*med\.?\s*(?:dent\.?|habil\.?)?)/i,
  /^(Prof\.?\s*Dr\.?\s*(?:dent\.?|rer\.?\s*nat\.?|habil\.?)?)/i,
  /^(PD\s+Dr\.?\s*med\.?)/i,
  /^(Priv\.?-Doz\.?\s*Dr\.?\s*med\.?)/i,
  /^(Dr\.?\s*med\.?\s*(?:dent\.?|vet\.?|univ\.?|habil\.?)?)/i,
  /^(Dr\.?)/i,
  /^(Dipl\.?-Med\.?)/i,
  /^(M\.?Sc\.?\s+med\.?)/i,
];

const PRACTICE_KEYWORDS = [
  'Praxis', 'Praxen', 'Praxisgemeinschaft', 'MVZ', 'Zentrum', 'Klinik', 'Klinikum',
  'Krankenhaus', 'Ärztehaus', 'Gemeinschaftspraxis', 'Berufsausübungsgemeinschaft',
  'BAG', 'Ambulanz', 'Poliklinik', 'Zahnarztpraxis', 'Hausarztpraxis', 'Facharztpraxis',
  'Apotheke', 'Physiotherapie', 'Therapiezentrum', 'Institut', 'Sprechstunde',
];

function stripTitle(name) {
  for (const rx of TITLE_PATTERNS) {
    const m = name.match(rx);
    if (m) {
      const prefix = m[1].trim().replace(/\s+/g, ' ');
      const rest = name.slice(m[0].length).trim().replace(/^[-,·|]+\s*/, '');
      return { prefix, rest };
    }
  }
  return { prefix: null, rest: name };
}

function splitPersonAndPractice(rest) {
  // Trennzeichen: " - ", " – ", " | ", " · ", ","
  const parts = rest.split(/\s+[-–|·]\s+|,\s*/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return { doctor: null, practice: null };
  if (parts.length === 1) {
    const p = parts[0];
    const isPractice = PRACTICE_KEYWORDS.some((k) => p.toLowerCase().includes(k.toLowerCase()));
    return isPractice ? { doctor: null, practice: p } : { doctor: p, practice: null };
  }
  // Mehrere Parts: erster ist meist der Name, folgender die Praxis (oder umgekehrt)
  const firstIsPractice = PRACTICE_KEYWORDS.some((k) => parts[0].toLowerCase().includes(k.toLowerCase()));
  if (firstIsPractice) {
    return { doctor: parts.slice(1).find((p) => !PRACTICE_KEYWORDS.some((k) => p.toLowerCase().includes(k.toLowerCase()))) || null, practice: parts[0] };
  }
  const practiceCand = parts.slice(1).find((p) => PRACTICE_KEYWORDS.some((k) => p.toLowerCase().includes(k.toLowerCase())));
  return { doctor: parts[0], practice: practiceCand || null };
}

export function parseDisplayName(displayName) {
  if (!displayName || typeof displayName !== 'string') {
    return { title_prefix: null, doctor_name_normalized: null, practice_name: null };
  }
  const cleaned = displayName.replace(/\s+/g, ' ').trim();
  const { prefix, rest } = stripTitle(cleaned);
  const { doctor, practice } = splitPersonAndPractice(rest);
  return {
    title_prefix: prefix,
    doctor_name_normalized: doctor,
    practice_name: practice,
  };
}
