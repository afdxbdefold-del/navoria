// Deutsche Ärztekammern und zuständige Aufsichtsbehörden pro Bundesland.
// Datenbasis: Öffentliche Publikationen der Landesärztekammern (Stand 2025).
// Für korrektes Impressum nach § 5 DDG/TMG bei Praxis-Homepages.

export const AERZTEKAMMERN = {
  'baden-wuerttemberg': {
    name: 'Landesärztekammer Baden-Württemberg',
    address: 'Jahnstraße 40, 70597 Stuttgart',
    website: 'https://www.aerztekammer-bw.de',
    aufsicht: 'Ministerium für Soziales, Gesundheit und Integration Baden-Württemberg',
    berufsordnung: 'Berufsordnung der Landesärztekammer Baden-Württemberg',
    heilberufsgesetz: 'Heilberufe-Kammergesetz Baden-Württemberg (HBKG)',
    ldi: 'Landesbeauftragter für den Datenschutz und die Informationsfreiheit Baden-Württemberg (LfDI), Königstraße 10a, 70173 Stuttgart',
  },
  'bayern': {
    name: 'Bayerische Landesärztekammer',
    address: 'Mühlbaurstraße 16, 81677 München',
    website: 'https://www.blaek.de',
    aufsicht: 'Bayerisches Staatsministerium für Gesundheit, Pflege und Prävention',
    berufsordnung: 'Berufsordnung für die Ärzte Bayerns',
    heilberufsgesetz: 'Heilberufe-Kammergesetz Bayern (HKaG)',
    ldi: 'Bayerischer Landesbeauftragter für den Datenschutz, Wagmüllerstraße 18, 80538 München',
  },
  'berlin': {
    name: 'Ärztekammer Berlin',
    address: 'Friedrichstraße 16, 10969 Berlin',
    website: 'https://www.aerztekammer-berlin.de',
    aufsicht: 'Senatsverwaltung für Wissenschaft, Gesundheit und Pflege des Landes Berlin',
    berufsordnung: 'Berufsordnung der Ärztekammer Berlin',
    heilberufsgesetz: 'Berliner Kammergesetz (BlnKaG)',
    ldi: 'Berliner Beauftragte für Datenschutz und Informationsfreiheit, Alt-Moabit 59–61, 10555 Berlin',
  },
  'brandenburg': {
    name: 'Landesärztekammer Brandenburg',
    address: 'Dreifert-Straße 12, 03044 Cottbus',
    website: 'https://www.laekb.de',
    aufsicht: 'Ministerium für Soziales, Gesundheit, Integration und Verbraucherschutz des Landes Brandenburg',
    berufsordnung: 'Berufsordnung der Landesärztekammer Brandenburg',
    heilberufsgesetz: 'Heilberufsgesetz des Landes Brandenburg (HeilBerG BB)',
    ldi: 'Landesbeauftragte für den Datenschutz und für das Recht auf Akteneinsicht Brandenburg, Stahnsdorfer Damm 77, 14532 Kleinmachnow',
  },
  'bremen': {
    name: 'Ärztekammer Bremen',
    address: 'Schwachhauser Heerstraße 30, 28209 Bremen',
    website: 'https://www.aekhb.de',
    aufsicht: 'Senatorin für Gesundheit, Frauen und Verbraucherschutz der Freien Hansestadt Bremen',
    berufsordnung: 'Berufsordnung der Ärztekammer Bremen',
    heilberufsgesetz: 'Heilberufsgesetz des Landes Bremen',
    ldi: 'Landesbeauftragte für Datenschutz und Informationsfreiheit der Freien Hansestadt Bremen, Arndtstraße 1, 27570 Bremerhaven',
  },
  'hamburg': {
    name: 'Ärztekammer Hamburg',
    address: 'Weidestraße 122b, 22083 Hamburg',
    website: 'https://www.aerztekammer-hamburg.org',
    aufsicht: 'Behörde für Arbeit, Gesundheit, Soziales, Familie und Integration der Freien und Hansestadt Hamburg',
    berufsordnung: 'Berufsordnung für die Hamburger Ärzte und Ärztinnen',
    heilberufsgesetz: 'Hamburgisches Kammergesetz für die Heilberufe (HmbKGH)',
    ldi: 'Hamburgischer Beauftragter für Datenschutz und Informationsfreiheit, Ludwig-Erhard-Str. 22, 20459 Hamburg',
  },
  'hessen': {
    name: 'Landesärztekammer Hessen',
    address: 'Im Vogelsgesang 3, 60488 Frankfurt am Main',
    website: 'https://www.laekh.de',
    aufsicht: 'Hessisches Ministerium für Familie, Senioren, Sport, Gesundheit und Pflege',
    berufsordnung: 'Berufsordnung für die Ärztinnen und Ärzte in Hessen',
    heilberufsgesetz: 'Heilberufsgesetz Hessen',
    ldi: 'Der Hessische Beauftragte für Datenschutz und Informationsfreiheit, Gustav-Stresemann-Ring 1, 65189 Wiesbaden',
  },
  'mecklenburg-vorpommern': {
    name: 'Ärztekammer Mecklenburg-Vorpommern',
    address: 'August-Bebel-Straße 9a, 18055 Rostock',
    website: 'https://www.aek-mv.de',
    aufsicht: 'Ministerium für Soziales, Gesundheit und Sport Mecklenburg-Vorpommern',
    berufsordnung: 'Berufsordnung der Ärztekammer Mecklenburg-Vorpommern',
    heilberufsgesetz: 'Heilberufsgesetz Mecklenburg-Vorpommern (HeilBerG M-V)',
    ldi: 'Der Landesbeauftragte für Datenschutz und Informationsfreiheit Mecklenburg-Vorpommern, Werderstraße 74a, 19055 Schwerin',
  },
  'niedersachsen': {
    name: 'Ärztekammer Niedersachsen',
    address: 'Berliner Allee 20, 30175 Hannover',
    website: 'https://www.aekn.de',
    aufsicht: 'Niedersächsisches Ministerium für Soziales, Arbeit, Gesundheit und Gleichstellung',
    berufsordnung: 'Berufsordnung der Ärztekammer Niedersachsen',
    heilberufsgesetz: 'Kammergesetz für die Heilberufe (HKG) Niedersachsen',
    ldi: 'Die Landesbeauftragte für den Datenschutz Niedersachsen, Prinzenstraße 5, 30159 Hannover',
  },
  // Nordrhein-Westfalen: ZWEI Kammern (Nordrhein und Westfalen-Lippe) – Zuordnung per PLZ näher unten
  'nordrhein-westfalen': null, // → wird dynamisch per PLZ aufgelöst
  'rheinland-pfalz': {
    name: 'Landesärztekammer Rheinland-Pfalz',
    address: 'Deutschhausplatz 3, 55116 Mainz',
    website: 'https://www.laek-rlp.de',
    aufsicht: 'Ministerium für Wissenschaft und Gesundheit Rheinland-Pfalz',
    berufsordnung: 'Berufsordnung für die Ärztinnen und Ärzte in Rheinland-Pfalz',
    heilberufsgesetz: 'Heilberufsgesetz Rheinland-Pfalz (HeilBG)',
    ldi: 'Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Rheinland-Pfalz, Hintere Bleiche 34, 55116 Mainz',
  },
  'saarland': {
    name: 'Ärztekammer des Saarlandes',
    address: 'Faktoreistraße 4, 66111 Saarbrücken',
    website: 'https://www.aerztekammer-saarland.de',
    aufsicht: 'Ministerium für Arbeit, Soziales, Frauen und Gesundheit des Saarlandes',
    berufsordnung: 'Berufsordnung für die Ärztinnen und Ärzte des Saarlandes',
    heilberufsgesetz: 'Saarländisches Heilberufekammergesetz (SHKG)',
    ldi: 'Unabhängiges Datenschutzzentrum Saarland, Fritz-Dobisch-Str. 12, 66111 Saarbrücken',
  },
  'sachsen': {
    name: 'Sächsische Landesärztekammer',
    address: 'Schützenhöhe 16, 01099 Dresden',
    website: 'https://www.slaek.de',
    aufsicht: 'Sächsisches Staatsministerium für Soziales und Gesellschaftlichen Zusammenhalt',
    berufsordnung: 'Berufsordnung der Sächsischen Landesärztekammer',
    heilberufsgesetz: 'Sächsisches Heilberufekammergesetz (SHKG)',
    ldi: 'Sächsischer Datenschutz- und Transparenzbeauftragter, Devrientstr. 5, 01067 Dresden',
  },
  'sachsen-anhalt': {
    name: 'Ärztekammer Sachsen-Anhalt',
    address: 'Doctor-Eisenbart-Ring 2, 39120 Magdeburg',
    website: 'https://www.aeksa.de',
    aufsicht: 'Ministerium für Arbeit, Soziales, Gesundheit und Gleichstellung des Landes Sachsen-Anhalt',
    berufsordnung: 'Berufsordnung der Ärztekammer Sachsen-Anhalt',
    heilberufsgesetz: 'Kammergesetz für die Heilberufe Sachsen-Anhalt (KGHB-LSA)',
    ldi: 'Landesbeauftragter für den Datenschutz Sachsen-Anhalt, Leiterstraße 9, 39104 Magdeburg',
  },
  'schleswig-holstein': {
    name: 'Ärztekammer Schleswig-Holstein',
    address: 'Bismarckallée 8–12, 23795 Bad Segeberg',
    website: 'https://www.aeksh.de',
    aufsicht: 'Ministerium für Justiz und Gesundheit des Landes Schleswig-Holstein',
    berufsordnung: 'Berufsordnung der Ärztinnen und Ärzte Schleswig-Holsteins',
    heilberufsgesetz: 'Heilberufekammergesetz Schleswig-Holstein (HBKG)',
    ldi: 'Unabhängiges Landeszentrum für Datenschutz Schleswig-Holstein, Holstenstraße 98, 24103 Kiel',
  },
  'thueringen': {
    name: 'Landesärztekammer Thüringen',
    address: 'Im Semmicht 33, 07751 Jena',
    website: 'https://www.laek-thueringen.de',
    aufsicht: 'Thüringer Ministerium für Gesundheit, Soziales, Familie und Arbeit',
    berufsordnung: 'Berufsordnung der Landesärztekammer Thüringen',
    heilberufsgesetz: 'Thüringer Heilberufegesetz (ThürHeilBG)',
    ldi: 'Thüringer Landesbeauftragter für den Datenschutz und die Informationsfreiheit, Häßlerstraße 8, 99096 Erfurt',
  },
};

// NRW-Splitting: PLZ-Bereiche der Ärztekammer Nordrhein vs. Westfalen-Lippe
// Nordrhein: Düsseldorf, Köln, Aachen, Bonn – grob PLZ 40–53
// Westfalen-Lippe: Münster, Dortmund, Bielefeld, Hagen – grob PLZ 32–33, 44–59, 48–49
const NRW_KAMMER_NORDRHEIN = {
  name: 'Ärztekammer Nordrhein',
  address: 'Tersteegenstraße 9, 40474 Düsseldorf',
  website: 'https://www.aekno.de',
  aufsicht: 'Ministerium für Arbeit, Gesundheit und Soziales des Landes Nordrhein-Westfalen',
  berufsordnung: 'Berufsordnung für die nordrheinischen Ärztinnen und Ärzte',
  heilberufsgesetz: 'Heilberufsgesetz Nordrhein-Westfalen (HeilBerG NRW)',
  ldi: 'Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LDI NRW), Kavalleriestraße 2–4, 40213 Düsseldorf',
};

const NRW_KAMMER_WESTFALEN_LIPPE = {
  name: 'Ärztekammer Westfalen-Lippe',
  address: 'Gartenstraße 210–214, 48147 Münster',
  website: 'https://www.aekwl.de',
  aufsicht: 'Ministerium für Arbeit, Gesundheit und Soziales des Landes Nordrhein-Westfalen',
  berufsordnung: 'Berufsordnung für die westfälisch-lippischen Ärztinnen und Ärzte',
  heilberufsgesetz: 'Heilberufsgesetz Nordrhein-Westfalen (HeilBerG NRW)',
  ldi: 'Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LDI NRW), Kavalleriestraße 2–4, 40213 Düsseldorf',
};

// PLZ-Präfix (erste 2 Stellen) → Westfalen-Lippe (WL) oder Nordrhein (N)
const NRW_PLZ_MAP = {
  '32': 'WL', '33': 'WL', '34': 'WL', // Bielefeld, Paderborn, Kassel-Region-Rand
  '44': 'WL', '45': 'WL', '46': 'N', // Dortmund/Bochum=WL, Essen=Grenze, Oberhausen=N
  '47': 'N', '48': 'WL', '49': 'WL', // Duisburg=N, Münster/Osnabrück-Region=WL
  '50': 'N', '51': 'N', '52': 'N', '53': 'N', // Köln, Leverkusen, Aachen, Bonn
  '57': 'WL', '58': 'WL', '59': 'WL', // Siegen/Hagen/Iserlohn/Menden = WL
  '40': 'N', '41': 'N', '42': 'N', // Düsseldorf, Mönchengladbach, Wuppertal
};

export function bundeslandSlugFromState(state) {
  if (!state) return null;
  const s = String(state).toLowerCase().trim();
  const map = {
    'baden-württemberg': 'baden-wuerttemberg', 'baden-wuerttemberg': 'baden-wuerttemberg',
    'bayern': 'bayern', 'freistaat bayern': 'bayern',
    'berlin': 'berlin',
    'brandenburg': 'brandenburg',
    'bremen': 'bremen', 'freie hansestadt bremen': 'bremen',
    'hamburg': 'hamburg', 'freie und hansestadt hamburg': 'hamburg',
    'hessen': 'hessen',
    'mecklenburg-vorpommern': 'mecklenburg-vorpommern',
    'niedersachsen': 'niedersachsen',
    'nordrhein-westfalen': 'nordrhein-westfalen',
    'rheinland-pfalz': 'rheinland-pfalz',
    'saarland': 'saarland',
    'sachsen': 'sachsen', 'freistaat sachsen': 'sachsen',
    'sachsen-anhalt': 'sachsen-anhalt',
    'schleswig-holstein': 'schleswig-holstein',
    'thüringen': 'thueringen', 'thueringen': 'thueringen', 'freistaat thüringen': 'thueringen',
  };
  return map[s] || null;
}

/**
 * Ermittelt die zuständige Ärztekammer & Aufsicht basierend auf Bundesland + PLZ.
 * @param {string} state Bundesland-Name oder -Slug
 * @param {string} postalCode 5-stellige PLZ (nur für NRW-Splitting relevant)
 * @returns {object|null} Kammer-Objekt mit name, address, website, aufsicht, berufsordnung, heilberufsgesetz, ldi
 */
export function getKammerForPractice(state, postalCode) {
  const slug = bundeslandSlugFromState(state);
  if (!slug) return null;
  if (slug === 'nordrhein-westfalen') {
    const plzPrefix = String(postalCode || '').substring(0, 2);
    const region = NRW_PLZ_MAP[plzPrefix];
    if (region === 'WL') return NRW_KAMMER_WESTFALEN_LIPPE;
    if (region === 'N') return NRW_KAMMER_NORDRHEIN;
    // Fallback: Nordrhein (Düsseldorf) als größere Kammer
    return NRW_KAMMER_NORDRHEIN;
  }
  return AERZTEKAMMERN[slug] || null;
}
