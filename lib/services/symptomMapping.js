// Statisches Mapping: Beschwerden -> Fachrichtung(en)
export const SYMPTOM_MAP = [
  { keywords: ['rückenschmerz', 'ruckenschmerz', 'kreuzschmerz', 'bandscheib'], specialties: ['Orthopäde', 'Hausarzt', 'Physiotherapeut'] },
  { keywords: ['herzrasen', 'herzstolper', 'brustschmerz', 'herzklopf', 'palpitat'], specialties: ['Hausarzt', 'Kardiologe'] },
  { keywords: ['hautausschlag', 'ekzem', 'akne', 'juckreiz', 'muttermal', 'hautproblem'], specialties: ['Hautarzt'] },
  { keywords: ['zahnschmerz', 'zahn schmerz', 'zahn weh', 'karies'], specialties: ['Zahnarzt'] },
  { keywords: ['kopfschmerz', 'migräne', 'migrane'], specialties: ['Hausarzt', 'Neurologe'] },
  { keywords: ['sehen', 'sehschwäche', 'sehschwache', 'brille', 'augen', 'sehstörung'], specialties: ['Augenarzt'] },
  { keywords: ['ohr', 'gehör', 'gehor', 'schwindel', 'tinnitus', 'hals'], specialties: ['HNO-Arzt', 'Hausarzt'] },
  { keywords: ['schwanger', 'menstruation', 'periode', 'vorsorge frau', 'wechseljahre'], specialties: ['Frauenarzt'] },
  { keywords: ['kind krank', 'kinderarzt', 'säugling', 'saugling'], specialties: ['Kinderarzt'] },
  { keywords: ['blase', 'urin', 'prostata', 'harnwegs'], specialties: ['Urologe', 'Hausarzt'] },
  { keywords: ['depression', 'angst', 'panik', 'burnout', 'stress', 'schlafstör'], specialties: ['Psychotherapeut', 'Psychiater', 'Hausarzt'] },
  { keywords: ['knie', 'schulter', 'gelenk', 'sportverletz'], specialties: ['Orthopäde', 'Physiotherapeut'] },
  { keywords: ['erkältung', 'erkaltung', 'husten', 'fieber', 'grippe'], specialties: ['Hausarzt'] },
  { keywords: ['bauchschmerz', 'magen', 'verdauung', 'durchfall'], specialties: ['Hausarzt', 'Internist'] },
];

export function suggestSpecialtiesForSymptom(input) {
  if (!input || typeof input !== 'string') return [];
  const q = input.toLowerCase().trim();
  const matches = new Set();
  for (const entry of SYMPTOM_MAP) {
    if (entry.keywords.some((kw) => q.includes(kw))) {
      entry.specialties.forEach((s) => matches.add(s));
    }
  }
  return Array.from(matches);
}
