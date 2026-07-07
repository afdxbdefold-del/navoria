// Fachrichtungs-spezifische Homepage-Inhalte (Templates).
// Werden verwendet, wenn eine Praxis in den Homepage-Modus wechselt.
// Enthält Hero-Headline, Über-Text (2 Absätze) und 6 Standard-Leistungen pro Fachrichtung.
// Formulierung neutral gehalten – 3. Person, kein „Ich“/„Wir“-Ton, damit sie zu jeder Praxis passt.

const TEMPLATES = {
  hausarzt: {
    tagline: 'Hausarztpraxis',
    hero_headline: 'Persönliche hausärztliche Versorgung im Herzen {city}s.',
    about_p1: 'Die Praxis versteht sich als erste Anlaufstelle für alle Fragen rund um Ihre Gesundheit – mit gründlicher Diagnostik, verständlicher Aufklärung und einer auf Sie zugeschnittenen Behandlung.',
    about_p2: 'Der Fokus liegt auf einer ganzheitlichen Betreuung: von der akuten Erkrankung über Vorsorge und Impfschutz bis hin zur langfristigen Begleitung bei chronischen Erkrankungen. Enge Zusammenarbeit mit Fachärztinnen, Fachärzten und Kliniken der Region.',
    services: [
      { title: 'Allgemeinmedizin', text: 'Beratung, Diagnostik und Behandlung bei akuten und chronischen Erkrankungen.' },
      { title: 'Vorsorgeuntersuchungen', text: 'Check-up 35, Krebsvorsorge und weitere Vorsorgeleistungen.' },
      { title: 'Impfberatung', text: 'Beratung und Durchführung von Standard-, Reise- und Auffrischimpfungen nach STIKO.' },
      { title: 'DMP-Programme', text: 'Strukturierte Behandlungsprogramme für Diabetes, KHK, Asthma und COPD.' },
      { title: 'Kleine Chirurgie', text: 'Wundversorgung, Nähte und ambulante kleinchirurgische Eingriffe.' },
      { title: 'Hausbesuche', text: 'Hausbesuche bei nicht mobilen Patientinnen und Patienten im Praxisumfeld.' },
    ],
  },
  internist: {
    tagline: 'Internistische Praxis',
    hero_headline: 'Persönliche internistische Versorgung in {city}.',
    about_p1: 'Die Praxis bietet eine umfassende Betreuung bei internistischen Fragestellungen. Klare Diagnostik, sorgfältige Beratung und langjährige Erfahrung stehen im Vordergrund.',
    about_p2: 'Der Schwerpunkt liegt auf allgemeininternistischen Erkrankungen, kardiologischer Basisdiagnostik und der ganzheitlichen Betreuung chronischer Erkrankungen wie Bluthochdruck, Diabetes oder Fettstoffwechselstörungen.',
    services: [
      { title: 'Allgemeine Innere Medizin', text: 'Beratung, Diagnostik und Behandlung internistischer Erkrankungen.' },
      { title: 'Vorsorgeuntersuchungen', text: 'Check-ups und Gesundheits-Check-up ab 35.' },
      { title: 'EKG & Belastungs-EKG', text: 'Ruhe- und Belastungs-EKG zur Abklärung von Herz-Kreislauf-Beschwerden.' },
      { title: 'Blutdruck-Diagnostik', text: 'Langzeit-Blutdruckmessung und individuelle Therapieplanung.' },
      { title: 'Labor & Blutanalyse', text: 'Umfassende Blut-, Urin- und Stuhldiagnostik.' },
      { title: 'Impfberatung', text: 'Grippeschutz-, Reise- und Auffrischimpfungen nach STIKO-Empfehlung.' },
    ],
  },
  zahnarzt: {
    tagline: 'Zahnarztpraxis',
    hero_headline: 'Moderne Zahnmedizin im Herzen {city}s.',
    about_p1: 'Die Praxis bietet eine umfassende zahnärztliche Versorgung für Erwachsene und Kinder. Sanfte Behandlung, moderne Technik und individuelle Beratung stehen im Mittelpunkt.',
    about_p2: 'Von der professionellen Zahnreinigung über Prophylaxe bis hin zu Zahnersatz und ästhetischer Zahnheilkunde – die Praxis begleitet Sie langfristig auf dem Weg zu einer stabilen Mundgesundheit.',
    services: [
      { title: 'Prophylaxe & PZR', text: 'Professionelle Zahnreinigung und individuelles Prophylaxe-Konzept.' },
      { title: 'Kinder-Zahnheilkunde', text: 'Behandlung und Kariesprävention bereits im Kindesalter.' },
      { title: 'Zahnerhaltung', text: 'Füllungen, Wurzelkanalbehandlungen und Erhaltung erkrankter Zähne.' },
      { title: 'Zahnersatz', text: 'Kronen, Brücken, Prothesen und implantatgetragener Zahnersatz.' },
      { title: 'Parodontologie', text: 'Behandlung von Zahnfleischerkrankungen.' },
      { title: 'Ästhetische Zahnheilkunde', text: 'Bleaching und keramische Restaurationen für ein natürliches Lächeln.' },
    ],
  },
  kinderarzt: {
    tagline: 'Kinder- und Jugendarztpraxis',
    hero_headline: 'Kinderheilkunde mit Herz und Erfahrung in {city}.',
    about_p1: 'Die Praxis begleitet Kinder und Jugendliche von der Geburt bis zum Erwachsenenalter. Behandlung, Vorsorge und Beratung erfolgen kindgerecht und einfühlsam.',
    about_p2: 'Von den U-Untersuchungen über Impfschutz bis zur Behandlung akuter und chronischer Erkrankungen – die Praxis ist Ansprechpartner für die gesunde Entwicklung Ihres Kindes.',
    services: [
      { title: 'U-Untersuchungen', text: 'Vollständige Vorsorgeuntersuchungen U1 bis J2.' },
      { title: 'Impfungen', text: 'Alle STIKO-empfohlenen Impfungen für Kinder und Jugendliche.' },
      { title: 'Akutbehandlung', text: 'Diagnostik und Behandlung bei Infekten und akuten Erkrankungen.' },
      { title: 'Entwicklungsberatung', text: 'Beratung zu körperlicher, geistiger und sprachlicher Entwicklung.' },
      { title: 'Allergie-Diagnostik', text: 'Abklärung von Allergien und Nahrungsmittelunverträglichkeiten.' },
      { title: 'Jugendmedizin', text: 'Beratung für Jugendliche zu körperlichen und seelischen Fragen.' },
    ],
  },
  frauenarzt: {
    tagline: 'Frauenarztpraxis',
    hero_headline: 'Gynäkologische Versorgung mit Empathie in {city}.',
    about_p1: 'Die Praxis bietet gynäkologische Betreuung in allen Lebensphasen – einfühlsam, kompetent und diskret.',
    about_p2: 'Von der Vorsorge über Verhütungsberatung, Schwangerschaftsbetreuung bis hin zu den Wechseljahren begleitet die Praxis Sie auf dem Weg durch alle Lebensabschnitte.',
    services: [
      { title: 'Krebsvorsorge', text: 'Jährliche Vorsorgeuntersuchungen inkl. Zellabstrich.' },
      { title: 'Schwangerenbetreuung', text: 'Vollständige Betreuung während der Schwangerschaft.' },
      { title: 'Verhütungsberatung', text: 'Individuelle Beratung zu allen Methoden der Empfängnisverhütung.' },
      { title: 'Mädchensprechstunde', text: 'Erste Beratung für Jugendliche in vertrauensvoller Atmosphäre.' },
      { title: 'Wechseljahrs-Beratung', text: 'Beratung und Behandlung bei Beschwerden in den Wechseljahren.' },
      { title: 'Ultraschall-Diagnostik', text: 'Moderne Ultraschall-Untersuchungen von Gebärmutter und Brust.' },
    ],
  },
  orthopaede: {
    tagline: 'Orthopädische Praxis',
    hero_headline: 'Orthopädie & Bewegung wiederherstellen in {city}.',
    about_p1: 'Die Praxis diagnostiziert und behandelt Beschwerden des Bewegungsapparats – vom akuten Bandscheibenvorfall bis zur langfristigen Gelenkverschleiß-Therapie.',
    about_p2: 'Moderne konservative Behandlungsmethoden werden kombiniert mit gezielter Physiotherapie und, falls nötig, chirurgischer Beratung. Ziel: schmerzfreie Bewegung für Sie im Alltag.',
    services: [
      { title: 'Rücken- & Wirbelsäulen', text: 'Diagnostik und konservative Behandlung von Rückenschmerzen.' },
      { title: 'Gelenkbeschwerden', text: 'Behandlung bei Arthrose, Meniskusschaden und Bandverletzungen.' },
      { title: 'Sportmedizin', text: 'Sportverletzungen, Prävention und Leistungsdiagnostik.' },
      { title: 'Stoßwellentherapie', text: 'Extrakorporale Stoßwellentherapie bei chronischen Schmerzen.' },
      { title: 'Osteoporose-Diagnostik', text: 'Knochendichtemessung und Behandlung von Osteoporose.' },
      { title: 'Ambulante Operationen', text: 'Ambulante orthopädische Eingriffe in Zusammenarbeit mit Kliniken.' },
    ],
  },
  augenarzt: {
    tagline: 'Augenarztpraxis',
    hero_headline: 'Klare Sicht – Augenheilkunde in {city}.',
    about_p1: 'Die Praxis bietet moderne augenärztliche Versorgung für Erwachsene und Kinder.',
    about_p2: 'Von der Vorsorge über die Behandlung von Grauem Star, Grauem Star und Netzhauterkrankungen – modernste Diagnostik und individuelle Beratung.',
    services: [
      { title: 'Vorsorge & Sehtest', text: 'Regelmäßige Untersuchungen zur Erhaltung Ihrer Sehkraft.' },
      { title: 'Brillenanpassung', text: 'Objektive Bestimmung der benötigten Brillenstärke.' },
      { title: 'Glaukom-Vorsorge', text: 'Früherkennung des Grünen Stars.' },
      { title: 'Netzhaut-Untersuchung', text: 'Vorsorge zur Früherkennung altersbedingter Veränderungen (AMD).' },
      { title: 'Kinder-Augenheilkunde', text: 'Sehschule, Schielbehandlung und Schwachsichtigkeitstherapie.' },
      { title: 'Führerscheingutachten', text: 'Sehtest und Gutachten für Führerscheinklassen.' },
    ],
  },
  'hno-arzt': {
    tagline: 'HNO-Praxis',
    hero_headline: 'Hals-, Nasen- und Ohrenheilkunde in {city}.',
    about_p1: 'Die Praxis bietet moderne HNO-Versorgung für Erwachsene und Kinder – von der Akutbehandlung bis zur allergologischen Diagnostik.',
    about_p2: 'Modernste gerätegestützte Diagnostik in Kombination mit individueller Beratung. Enge Kooperation mit umliegenden Kliniken für operative Eingriffe.',
    services: [
      { title: 'Hördiagnostik', text: 'Umfassende Untersuchung des Hörvermögens.' },
      { title: 'Nasennebenhöhlen', text: 'Diagnostik und Behandlung akuter und chronischer Beschwerden.' },
      { title: 'Allergie-Diagnostik', text: 'Prick-Test und Behandlung von Heuschnupfen & Co.' },
      { title: 'Schwindel-Abklärung', text: 'Ursachensuche bei Schwindel und Gleichgewichtsstörungen.' },
      { title: 'Schnarch-Therapie', text: 'Beratung und Behandlung bei Schnarchen und Schlafapnoe.' },
      { title: 'Kinder-HNO', text: 'Behandlung typischer HNO-Beschwerden im Kindesalter.' },
    ],
  },
  hautarzt: {
    tagline: 'Dermatologische Praxis',
    hero_headline: 'Dermatologie – Gesunde Haut in {city}.',
    about_p1: 'Die Praxis bietet umfassende dermatologische Versorgung für alle Altersgruppen.',
    about_p2: 'Von der Hautkrebs-Vorsorge über die Behandlung von Ekzemen und Akne bis zur ästhetischen Dermatologie – moderne Diagnostik und individuelle Behandlungskonzepte.',
    services: [
      { title: 'Hautkrebs-Screening', text: 'Früherkennung von Hautveränderungen und Melanomen.' },
      { title: 'Allergie-Diagnostik', text: 'Prick-Test und Behandlung von Kontakt- und Nahrungsmittelallergien.' },
      { title: 'Akne-Behandlung', text: 'Individuelle Therapiekonzepte bei Akne aller Schweregrade.' },
      { title: 'Neurodermitis & Psoriasis', text: 'Langfristige Betreuung chronischer Hauterkrankungen.' },
      { title: 'Ästhetische Dermatologie', text: 'Faltenbehandlung, Peelings und Hautverjüngung.' },
      { title: 'Muttermalkontrolle', text: 'Video-Dermatoskopie zur Verlaufskontrolle von Muttermalen.' },
    ],
  },
  urologe: {
    tagline: 'Urologische Praxis',
    hero_headline: 'Urologische Versorgung – vertrauensvoll in {city}.',
    about_p1: 'Die Praxis bietet urologische Diagnostik und Behandlung für Männer, Frauen und Kinder.',
    about_p2: 'Diskrete Atmosphäre, moderne Untersuchungsmethoden und individuelle Beratung stehen im Mittelpunkt – von der Vorsorge bis zur Behandlung komplexer Erkrankungen.',
    services: [
      { title: 'Krebsvorsorge Mann', text: 'PSA-Test und Prostata-Vorsorge ab dem 45. Lebensjahr.' },
      { title: 'Ultraschall-Diagnostik', text: 'Untersuchung von Nieren, Blase und Prostata.' },
      { title: 'Harnwegsinfekte', text: 'Diagnostik und Behandlung akuter und chronischer Infekte.' },
      { title: 'Nierensteine', text: 'Diagnostik und konservative Therapie.' },
      { title: 'Andrologie', text: 'Beratung bei erektiler Dysfunktion und Kinderwunsch.' },
      { title: 'Kinder-Urologie', text: 'Diagnostik und Behandlung typischer urologischer Beschwerden im Kindesalter.' },
    ],
  },
  neurologe: {
    tagline: 'Neurologische Praxis',
    hero_headline: 'Neurologie – Nerven, Gehirn und Bewegung in {city}.',
    about_p1: 'Die Praxis bietet neurologische Diagnostik und Behandlung bei Erkrankungen von Nervensystem, Gehirn und Rückenmark.',
    about_p2: 'Von der Kopfschmerz-Sprechstunde bis zur Betreuung bei Multipler Sklerose und Parkinson – moderne apparative Diagnostik und individuelle Therapiekonzepte.',
    services: [
      { title: 'Kopfschmerz-Sprechstunde', text: 'Diagnostik und Therapie bei Migräne und Spannungskopfschmerz.' },
      { title: 'Schwindel-Diagnostik', text: 'Ursachensuche bei Schwindel und Gleichgewichtsstörungen.' },
      { title: 'EEG & Elektroneurographie', text: 'Elektrophysiologische Untersuchungen bei Nervenkrankheiten.' },
      { title: 'Bandscheibenvorfall', text: 'Konservative Behandlung von Wirbelsäulen-bedingten Beschwerden.' },
      { title: 'Parkinson & Demenz', text: 'Früherkennung und Verlaufskontrolle neurodegenerativer Erkrankungen.' },
      { title: 'MS-Sprechstunde', text: 'Betreuung von Patient:innen mit Multipler Sklerose.' },
    ],
  },
  psychotherapeut: {
    tagline: 'Psychotherapeutische Praxis',
    hero_headline: 'Psychotherapie mit Zeit für Sie in {city}.',
    about_p1: 'Die Praxis bietet einen geschützten Rahmen für die Behandlung psychischer Erkrankungen und Krisen.',
    about_p2: 'Wissenschaftlich anerkannte Therapieverfahren, empathische Gesprächsführung und ein individuelles Behandlungskonzept begleiten Sie auf dem Weg zu psychischer Stabilität.',
    services: [
      { title: 'Angst- & Panikstörungen', text: 'Behandlung von Angststörungen und Panikattacken.' },
      { title: 'Depression', text: 'Diagnostik und Therapie bei depressiven Erkrankungen.' },
      { title: 'Trauma-Therapie', text: 'Behandlung von posttraumatischen Belastungsstörungen.' },
      { title: 'Burnout-Prävention', text: 'Beratung bei Erlebnissen von Erschhäpfung und Belastung im Beruf.' },
      { title: 'Beziehungskrisen', text: 'Beratung bei privaten Beziehungs- und Lebenskrisen.' },
      { title: 'Verhaltenstherapie', text: 'Wissenschaftlich anerkannte kognitive Verhaltenstherapie.' },
    ],
  },
};

const FALLBACK = {
  tagline: 'Arztpraxis',
  hero_headline: 'Persönliche medizinische Versorgung in {city}.',
  about_p1: 'Die Praxis bietet umfassende medizinische Betreuung in ruhiger und vertrauensvoller Atmosphäre.',
  about_p2: 'Individuelle Beratung, moderne Diagnostik und langjährige Erfahrung stehen im Mittelpunkt der Behandlung.',
  services: [
    { title: 'Diagnostik & Beratung', text: 'Beratung, Diagnostik und Behandlung typischer Beschwerden.' },
    { title: 'Vorsorgeuntersuchungen', text: 'Vorsorge und Früherkennung nach aktuellen Leitlinien.' },
    { title: 'Impfberatung', text: 'Beratung und Durchführung von Impfungen nach STIKO.' },
    { title: 'Labor', text: 'Blut-, Urin- und weitere Basisuntersuchungen.' },
    { title: 'Bescheinigungen', text: 'Ausstellung von Attesten und medizinischen Bescheinigungen.' },
    { title: 'Zweitmeinung', text: 'Sachliche Einordnung von Befunden anderer Behandler.' },
  ],
};

/**
 * Ermittelt das Template für eine Fachrichtung.
 * @param {string} specialtySlug Slug wie 'hausarzt', 'zahnarzt', 'internist' etc.
 * @param {string} city Ortsname zum Einsetzen in Hero-Headline
 * @returns Template-Objekt mit hero_headline (rendered), about_p1, about_p2, services
 */
export function getTemplateForSpecialty(specialtySlug, city = 'Ihrer Stadt') {
  const slug = String(specialtySlug || '').toLowerCase().trim();
  const template = TEMPLATES[slug] || FALLBACK;
  return {
    ...template,
    hero_headline: template.hero_headline.replace('{city}', city),
  };
}
