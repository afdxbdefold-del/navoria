// Symptom-Content-Library für /symptome/[slug]-Pillars.
// AI-OPTIMIERT: Direct-Answer als erster Satz jedes Symptoms — LLMs sollen sofort
// die Kernaussage zitieren können ohne den ganzen Text zu lesen.
// Struktur: intro (Direct Answer), whichDoctor (Symptom → Fachrichtung),
// emergency (Notfall-Check), faqs (FAQPage), relatedSlugs (Cross-Links).

export const SYMPTOMS = [
  {
    slug: 'rueckenschmerzen',
    label: 'Rückenschmerzen',
    // Direct-Answer: erster Satz enthält die Kernaussage, für AI-Snippet-Extraktion optimiert
    directAnswer: 'Bei Rückenschmerzen ist der erste Ansprechpartner meist der Hausarzt. Halten die Schmerzen länger als 2–3 Wochen an, strahlen ins Bein aus, oder gehen sie mit Taubheit oder Kraftverlust einher, ist eine orthopädische Abklärung notwendig.',
    intro: `Rückenschmerzen gehören zu den häufigsten Behandlungsanlässen in Deutschland: rund 85 Prozent der Erwachsenen erleben sie mindestens einmal im Leben. In etwa 80 Prozent der Fälle sind sie „unspezifisch" – ohne erkennbare Struktur-Ursache – und klingen mit Bewegung, Wärme und leichter Schmerzmedikation innerhalb weniger Wochen wieder ab. Bei anhaltenden oder ausstrahlenden Beschwerden lohnt eine gezielte fachärztliche Abklärung.`,
    whichDoctor: [
      { when: 'Erste Einschätzung, akute Kreuzschmerzen ohne Ausstrahlung', doctor: 'Hausarzt', slug: 'hausarzt' },
      { when: 'Anhaltend > 2–3 Wochen, Ausstrahlung in Bein oder Arm', doctor: 'Orthopäde', slug: 'orthopaede' },
      { when: 'Taubheit, Kribbeln, Kraftverlust in Extremität', doctor: 'Neurologe', slug: 'neurologe' },
      { when: 'Bewegungs- und Kräftigungstherapie nach ärztlicher Verordnung', doctor: 'Physiotherapeut', slug: 'physiotherapeut' },
    ],
    emergency: {
      call112: 'Akute Lähmung der Beine, Blasen- oder Mastdarmstörung, plötzlicher Kraftverlust – Verdacht auf Cauda-equina-Syndrom.',
      call116117: 'Sehr starke, neu aufgetretene Rückenschmerzen mit Fieber oder nach Sturz außerhalb der Öffnungszeiten.',
      note: 'Ansonsten reicht ein regulärer Hausarzt-Termin, oft innerhalb weniger Tage.',
    },
    faqs: [
      { q: 'Wann sollte ich mit Rückenschmerzen zum Arzt?', a: 'Halten die Schmerzen länger als 2 bis 3 Wochen an, strahlen sie in Bein oder Arm aus, oder treten Taubheit, Kribbeln oder Kraftverlust auf, ist eine ärztliche Abklärung angezeigt. Bei plötzlichem Kraftverlust in den Beinen oder Blasen-/Mastdarmstörungen ist es ein Notfall (112).' },
      { q: 'Rückenschmerzen: Orthopäde oder Neurologe?', a: 'Der Orthopäde ist zuständig für strukturelle Ursachen (Bandscheiben, Wirbelgelenke, Muskulatur). Der Neurologe wird eingeschaltet, wenn Nervenreizungen im Vordergrund stehen (Taubheit, Kribbeln, Ausfälle). Meist beginnt der Weg beim Hausarzt oder Orthopäden.' },
      { q: 'Hilft ein MRT bei Rückenschmerzen immer?', a: 'Nein. Ein MRT wird nur bei spezifischen Verdachtsdiagnosen (Bandscheibenvorfall mit Nervenausfällen, Tumor, Entzündung) empfohlen. Bei unspezifischen Kreuzschmerzen ist Bildgebung ohne klinische Indikation nicht sinnvoll und liefert oft „Zufallsbefunde" ohne therapeutische Konsequenz.' },
    ],
    relatedSlugs: ['hausarzt', 'orthopaede', 'neurologe', 'physiotherapeut'],
    relatedSymptoms: ['nackenschmerzen', 'gelenkschmerzen', 'ischias'],
  },

  {
    slug: 'kopfschmerzen',
    label: 'Kopfschmerzen',
    directAnswer: 'Bei gelegentlichen Kopfschmerzen ist der Hausarzt die richtige Anlaufstelle. Bei wiederkehrender Migräne, plötzlichen sehr starken Kopfschmerzen („Donnerschlag") oder Kopfschmerzen mit Sehstörungen oder Sprachstörungen ist eine neurologische Abklärung – im Notfall über die 112 – nötig.',
    intro: `Kopfschmerzen sind extrem häufig. Weltweit unterscheiden Mediziner mehr als 200 Kopfschmerzformen; am bekanntesten sind Spannungskopfschmerz (ca. 60 % der Fälle) und Migräne (ca. 15 %). Meist sind sie harmlos und selbstlimitierend – aber bei Alarm-Symptomen wie plötzlichem sehr starken „Vernichtungskopfschmerz", Sehstörungen, Sprachstörungen oder Lähmungen ist sofortige ärztliche Abklärung nötig.`,
    whichDoctor: [
      { when: 'Gelegentliche oder milde Kopfschmerzen', doctor: 'Hausarzt', slug: 'hausarzt' },
      { when: 'Wiederkehrende Migräne, Cluster-Kopfschmerz, chronische Kopfschmerzen', doctor: 'Neurologe', slug: 'neurologe' },
      { when: 'Kopfschmerzen mit Sehverschlechterung', doctor: 'Augenarzt', slug: 'augenarzt' },
      { when: 'Kopfschmerzen bei Nasennebenhöhlen-Entzündung', doctor: 'HNO-Arzt', slug: 'hno-arzt' },
    ],
    emergency: {
      call112: 'Plötzlich einsetzende, extrem starke Kopfschmerzen („Donnerschlag") oder kombiniert mit Lähmung, Sprachstörung, Bewusstseinstrübung – Verdacht auf Schlaganfall oder Hirnblutung.',
      call116117: 'Neu aufgetretene starke Kopfschmerzen mit Fieber und Nackensteife außerhalb der Praxis-Öffnungszeiten.',
      note: 'Regelmäßige Migräne oder Spannungskopfschmerz werden im geplanten Termin abgeklärt.',
    },
    faqs: [
      { q: 'Kopfschmerzen: Neurologe oder Hausarzt?', a: 'Bei gelegentlichen, milden Kopfschmerzen reicht meist der Hausarzt mit Anamnese und einfachen Medikamenten. Zum Neurologen sollten Sie bei wiederkehrender Migräne (mehr als 2 Attacken/Monat), Cluster-Kopfschmerzen, chronischen Kopfschmerzen (>15 Tage/Monat), plötzlich neu aufgetretenen Kopfschmerzen oder wenn Standard-Therapien nicht helfen.' },
      { q: 'Wann sind Kopfschmerzen ein Notfall?', a: 'Bei plötzlich einsetzenden, extrem starken Kopfschmerzen („Donnerschlag"), Kopfschmerzen mit Lähmung, Sprachstörung, Bewusstseinstrübung, hohem Fieber und Nackensteife, oder nach Kopftrauma. Wählen Sie 112.' },
      { q: 'Was ist der Unterschied zwischen Spannungskopfschmerz und Migräne?', a: 'Spannungskopfschmerz ist meist dumpf-drückend, beidseitig, mild bis moderat, ohne Übelkeit. Migräne ist typischerweise pulsierend, einseitig, moderat bis stark, mit Übelkeit/Erbrechen, Licht- und Geräuschempfindlichkeit, und kann von einer Aura (Sehstörungen, Kribbeln) eingeleitet werden.' },
    ],
    relatedSlugs: ['hausarzt', 'neurologe', 'augenarzt', 'hno-arzt'],
    relatedSymptoms: ['migraene', 'schwindel', 'sehstoerungen'],
  },

  {
    slug: 'brustschmerzen',
    label: 'Brustschmerzen',
    directAnswer: 'Akute, starke oder anhaltende Brustschmerzen sind IMMER ein Notfall – wählen Sie sofort die 112. Verdacht auf Herzinfarkt darf nie in der regulären Sprechstunde abgewartet werden.',
    intro: `Brustschmerzen sind eines der wichtigsten Alarm-Symptome der Medizin. Sie können harmlos sein (Muskelverspannung, Sodbrennen, Rippenprellung) – oder lebensbedrohlich (Herzinfarkt, Lungenembolie, Aortendissektion). Weil sich diese Ursachen im Frühstadium klinisch überlappen, gilt: neu aufgetretener, starker oder anhaltender Brustschmerz gehört immer ärztlich abgeklärt – im Zweifel über die 112.`,
    whichDoctor: [
      { when: 'AKUT und stark: sofort 112 wählen (nicht Praxis!)', doctor: 'Notruf 112', slug: null },
      { when: 'Wiederkehrende, belastungsabhängige Brustschmerzen', doctor: 'Kardiologe', slug: 'kardiologe' },
      { when: 'Brennende Schmerzen hinter dem Brustbein, Sodbrennen', doctor: 'Internist / Gastroenterologe', slug: 'internist' },
      { when: 'Lokale Muskel- oder Rippen-Schmerzen', doctor: 'Hausarzt', slug: 'hausarzt' },
    ],
    emergency: {
      call112: 'Sofort 112 bei: starkem, anhaltendem Brustschmerz mit Ausstrahlung in Arm, Schulter, Hals oder Kiefer, kombiniert mit Atemnot, Kaltschweißigkeit, Übelkeit oder Vernichtungsgefühl. Verdacht auf Herzinfarkt.',
      call116117: 'Milde, wiederkehrende Beschwerden ohne akute Verschlechterung – über den ärztlichen Bereitschaftsdienst.',
      note: 'BEI BRUSTSCHMERZEN NIE MIT DEM ANRUF ZÖGERN. Jede Minute zählt beim Herzinfarkt.',
    },
    faqs: [
      { q: 'Ist jeder Brustschmerz ein Herzinfarkt?', a: 'Nein. Die Mehrzahl der Brustschmerzen sind muskuloskelettal (Rippenprellung, Muskelverspannung) oder gastroösophageal (Sodbrennen). ABER: die Unterscheidung ist klinisch nicht sicher möglich. Neu auftretender oder starker Brustschmerz gehört im Zweifel immer über die 112 abgeklärt.' },
      { q: 'Wie erkenne ich einen Herzinfarkt?', a: 'Typisch: anhaltender (>15 Minuten) starker Druck, Enge oder Brennen hinter dem Brustbein, oft mit Ausstrahlung in linken Arm, Schulter, Hals oder Kiefer. Begleitet von Atemnot, Kaltschweiß, Übelkeit, Vernichtungsgefühl. Bei Frauen und Diabetikern können die Symptome atypisch sein (nur Übelkeit, Rückenschmerz, Kurzatmigkeit).' },
      { q: 'Wann zum Kardiologen mit Brustschmerzen?', a: 'Zur planbaren Abklärung: bei wiederkehrenden, belastungsabhängigen Brustschmerzen (z. B. beim Treppensteigen), bei bekannten Risikofaktoren (Bluthochdruck, hohes Cholesterin, Rauchen, Diabetes, familiäre Belastung) oder nach einem stationär abgeklärten Herzinfarkt zur Nachsorge.' },
    ],
    relatedSlugs: ['kardiologe', 'hausarzt', 'internist'],
    relatedSymptoms: ['herzstolpern', 'atemnot', 'bluthochdruck'],
  },

  {
    slug: 'bauchschmerzen',
    label: 'Bauchschmerzen',
    directAnswer: 'Bei akuten oder anhaltenden Bauchschmerzen ist der Hausarzt oder Internist die richtige Anlaufstelle. Sehr starke Schmerzen, harte Bauchdecke, blutiger Stuhl, blutiges Erbrechen oder anhaltendes hohes Fieber sind ein Notfall (112).',
    intro: `Bauchschmerzen haben unzählige Ursachen – von harmlosen Verdauungsproblemen über Blinddarmentzündung, Gallenkolik, Nierenstein bis zu schweren Notfällen wie Perforationen oder Darmverschluss. Die Lage (Oberbauch, Mittelbauch, rechter oder linker Unterbauch), die Art des Schmerzes (kolikartig vs. anhaltend) und Begleitsymptome (Übelkeit, Erbrechen, Fieber, Stuhlveränderungen) geben Ärzten wichtige Hinweise.`,
    whichDoctor: [
      { when: 'Erste Einschätzung, akute Bauchschmerzen', doctor: 'Hausarzt', slug: 'hausarzt' },
      { when: 'Chronische Verdauungsbeschwerden, Reflux', doctor: 'Internist / Gastroenterologe', slug: 'internist' },
      { when: 'Bei Frauen: Unterbauchschmerzen mit gynäkologischem Bezug', doctor: 'Frauenarzt', slug: 'frauenarzt' },
      { when: 'Nierenkolik (Flankenschmerz mit Ausstrahlung), Harnwegssymptome', doctor: 'Urologe', slug: 'urologe' },
      { when: 'AKUT starke Schmerzen, harte Bauchdecke – 112!', doctor: 'Notruf 112', slug: null },
    ],
    emergency: {
      call112: 'Plötzlich sehr starke Bauchschmerzen, harte Bauchdecke („brettharter Bauch"), Bewusstseinstrübung, Blut im Erbrochenen oder Stuhl, oder Kombination mit hohem Fieber und Herzrasen.',
      call116117: 'Anhaltende starke Bauchschmerzen außerhalb der Öffnungszeiten ohne die genannten Notfallzeichen.',
      note: 'Blinddarmentzündung: anfangs unklarer Bauchschmerz, wandert typischerweise in den rechten Unterbauch – im Zweifel Notaufnahme.',
    },
    faqs: [
      { q: 'Bauchschmerzen: wann sofort in die Notaufnahme?', a: 'Bei plötzlich sehr starken Schmerzen, hartem („brettartigem") Bauch, blutigem Erbrechen oder Stuhl, hohem Fieber mit Bauchschmerz, ausstrahlenden Schmerzen in Schulter oder Rücken bei Frauen (Verdacht auf Eileiterschwangerschaft) oder Bewusstseinstrübung.' },
      { q: 'Was ist die Blinddarmentzündung?', a: 'Eine Entzündung des Wurmfortsatzes (Appendix). Beginnt oft mit unklaren Bauchschmerzen um den Nabel, wandert typischerweise in den rechten Unterbauch, kombiniert mit Übelkeit, Appetitlosigkeit und mäßigem Fieber. Im Zweifel Notaufnahme – die Verdachtsdiagnose braucht Ultraschall/CT und ggf. eine OP.' },
      { q: 'Wann Hausarzt, wann Gastroenterologe?', a: 'Erste Einschätzung akuter Bauchschmerzen: Hausarzt. Chronische Verdauungsbeschwerden (>4 Wochen), Refluxkrankheit, unklares Reizdarm-Syndrom, familiäre Belastung mit Darmkrebs, oder wenn eine Magen-/Darmspiegelung indiziert ist: Gastroenterologe (nach Überweisung durch Hausarzt).' },
    ],
    relatedSlugs: ['hausarzt', 'internist', 'frauenarzt', 'urologe'],
    relatedSymptoms: ['sodbrennen', 'durchfall', 'blut-im-stuhl'],
  },

  {
    slug: 'zahnschmerzen',
    label: 'Zahnschmerzen',
    directAnswer: 'Bei Zahnschmerzen ist der Zahnarzt die richtige Anlaufstelle. Nachts oder am Wochenende ist der zahnärztliche Notdienst über die Landeszahnärztekammer erreichbar.',
    intro: `Zahnschmerzen sind eines der intensivsten Schmerzerlebnisse, weil die Zahnnerven besonders empfindlich sind. Die häufigste Ursache ist eine tiefe Karies, die den Zahnnerv erreicht (Pulpitis). Weitere Ursachen: Entzündung des Zahnhalteapparats (Parodontitis), Zahnfraktur, Weisheitszahn-Durchbruch, Abszess. Nur der Zahnarzt kann die Ursache klären und dauerhaft behandeln – Schmerzmittel überbrücken bestenfalls die Wartezeit bis zum Termin.`,
    whichDoctor: [
      { when: 'Anhaltende Zahnschmerzen', doctor: 'Zahnarzt', slug: 'zahnarzt' },
      { when: 'Nachts, Wochenende, Feiertag', doctor: 'Zahnärztlicher Notdienst', slug: null },
      { when: 'Kieferschmerzen mit Fieber und Schwellung', doctor: 'Zahnärztlicher Notdienst oder Notaufnahme', slug: null },
    ],
    emergency: {
      call112: 'Kombiniert mit hohem Fieber, Schwellung mit Atemnot, oder starker Schwellung im Kiefer/Halsbereich (Verdacht auf Abszess mit Ausbreitung).',
      call116117: 'Nicht relevant – für Zahnnotdienst separate Nummern der Landeszahnärztekammer.',
      note: 'Zahnärztlicher Notdienst über 116 117 nur bedingt – meist über die Landeszahnärztekammer (regional unterschiedliche Nummer).',
    },
    faqs: [
      { q: 'Was tun bei Zahnschmerzen am Wochenende?', a: 'Der zahnärztliche Notdienst ist in Deutschland auch an Wochenenden und Feiertagen erreichbar. Die aktuelle Notdienst-Apotheke und Notdienst-Praxis finden Sie über die Website Ihrer Landeszahnärztekammer oder telefonisch bei der Rufbereitschaft der Kammer. In der Zwischenzeit können Ibuprofen 400 mg (Erwachsene, wenn verträglich) und Kühlung helfen.' },
      { q: 'Zahnschmerzen ohne erkennbare Karies – was kann das sein?', a: 'Mögliche Ursachen: Zahnhals-Empfindlichkeit durch freiliegende Zahnhälse, Kieferverspannung (Bruxismus/Zähneknirschen), Kieferhöhlen-Entzündung (bei Oberkiefer-Zähnen), Nervenschmerzen (Trigeminusneuralgie) oder Herz-Beschwerden (Ausstrahlung in den Unterkiefer). Der Zahnarzt klärt und überweist ggf. weiter.' },
      { q: 'Reichen Schmerzmittel bei Zahnschmerzen?', a: 'Schmerzmittel behandeln nur das Symptom, nicht die Ursache. Sie können die Nacht bis zum Termin überbrücken, aber die zugrundeliegende Ursache (meist Karies oder Wurzelentzündung) schreitet weiter fort. Ein Zahnarzt-Termin ist immer nötig – je früher, desto weniger invasiv die Behandlung.' },
    ],
    relatedSlugs: ['zahnarzt', 'hausarzt'],
    relatedSymptoms: ['zahnfleischbluten', 'mundgeruch'],
  },

  {
    slug: 'ohrenschmerzen',
    label: 'Ohrenschmerzen',
    directAnswer: 'Bei Ohrenschmerzen ist der HNO-Arzt oder – bei Kindern – der Kinderarzt zuständig. Erste Einschätzung akuter Ohrenschmerzen kann auch der Hausarzt vornehmen.',
    intro: `Ohrenschmerzen entstehen meist durch Mittelohrentzündung (besonders häufig bei Kindern nach Infekten), Gehörgangs-Entzündung („Bade-Otitis"), Fremdkörper im Ohr oder Kieferbeschwerden (ausstrahlend). Auch ein Zahnproblem im Oberkiefer, eine Kiefergelenks-Störung oder eine Rachen-/Kehlkopf-Entzündung kann sich als Ohrenschmerz anfühlen. Bei Kindern ist der Kinderarzt erste Wahl, bei Erwachsenen der HNO-Arzt oder Hausarzt.`,
    whichDoctor: [
      { when: 'Kinder bis 12 Jahre', doctor: 'Kinderarzt', slug: 'kinderarzt' },
      { when: 'Erwachsene, akute Beschwerden', doctor: 'Hausarzt', slug: 'hausarzt' },
      { when: 'Chronische oder wiederkehrende Ohrenschmerzen, Verdacht auf Hörverlust', doctor: 'HNO-Arzt', slug: 'hno-arzt' },
    ],
    emergency: {
      call112: 'Extrem selten – nur bei plötzlichem starkem Ohrenschmerz mit hohem Fieber und Bewusstseinstrübung (Verdacht auf Ausbreitung der Infektion).',
      call116117: 'Kinder mit starkem Ohrenschmerz und Fieber außerhalb der Öffnungszeiten.',
      note: 'Bei Ohrenschmerz mit Ausfluss aus dem Ohr: nicht in Panik geraten – der Trommelfell-Durchbruch entlastet oft den Druck und heilt meist folgenlos ab. Trotzdem ärztlich abklären.',
    },
    faqs: [
      { q: 'Ohrenschmerzen beim Kind – wann zum Arzt?', a: 'Bei anhaltenden Ohrenschmerzen über 24 Stunden, bei hohem Fieber, wenn das Kind besonders unruhig oder apathisch ist, bei Ausfluss aus dem Ohr, oder bei wiederkehrenden Beschwerden. Bei Säuglingen (< 1 Jahr) immer zeitnah abklären lassen.' },
      { q: 'HNO oder Hausarzt bei Ohrenschmerzen?', a: 'Erste Einschätzung akuter Beschwerden: Hausarzt oder Kinderarzt (bei Kindern). Der HNO-Arzt kommt ins Spiel bei chronischen oder wiederkehrenden Ohrenschmerzen, Verdacht auf Hörminderung, Tinnitus, chronischen Mittelohr-Entzündungen oder Trommelfell-Verletzungen.' },
      { q: 'Ohrenschmerzen ohne erkennbare Ursache – was kann das sein?', a: 'Häufige Ursachen ohne offensichtliches Ohrproblem: Kiefergelenks-Störung (CMD), Zahnprobleme im Oberkiefer, Kehlkopf-/Rachen-Entzündung (ausstrahlend), Neuralgien, Nasennebenhöhlen-Entzündung. Der HNO-Arzt schließt Ohr-Ursachen aus und überweist ggf. an Zahnarzt oder Kieferorthopäde.' },
    ],
    relatedSlugs: ['hno-arzt', 'kinderarzt', 'hausarzt'],
    relatedSymptoms: ['tinnitus', 'schwindel', 'halsschmerzen'],
  },

  {
    slug: 'halsschmerzen',
    label: 'Halsschmerzen',
    directAnswer: 'Bei Halsschmerzen ist der Hausarzt oder Kinderarzt die erste Anlaufstelle. Bei anhaltenden Beschwerden über 3 Wochen oder Heiserkeit ist eine HNO-ärztliche Abklärung nötig.',
    intro: `Halsschmerzen sind meist Symptom eines viralen Infekts (Erkältung, Grippe, Corona) und heilen innerhalb einer Woche ab. Nur ein kleiner Teil ist bakteriell (z. B. Streptokokken-Angina) und benötigt Antibiotika. Bei anhaltenden Halsschmerzen über drei Wochen, Heiserkeit oder Schluckstörungen sollte HNO-ärztlich abgeklärt werden, um seltene aber ernste Ursachen (Kehlkopf-Tumor) auszuschließen.`,
    whichDoctor: [
      { when: 'Akute Halsschmerzen bei Erkältung', doctor: 'Hausarzt (Erwachsene) / Kinderarzt (Kinder)', slug: 'hausarzt' },
      { when: 'Anhaltend > 3 Wochen, Heiserkeit, Schluckstörung', doctor: 'HNO-Arzt', slug: 'hno-arzt' },
      { when: 'Kloßgefühl, Fremdkörpergefühl ohne Erklärung', doctor: 'HNO-Arzt', slug: 'hno-arzt' },
    ],
    emergency: {
      call112: 'Starke Halsschmerzen mit Atemnot, Speichelfluss und hohem Fieber (Verdacht auf Epiglottitis – v.a. bei ungeimpften Kindern).',
      call116117: 'Sehr starke Halsschmerzen mit hohem Fieber und Schluckunfähigkeit außerhalb der Öffnungszeiten.',
      note: 'Nach einer Woche unverändertem oder verstärktem Verlauf: Hausarzt-Termin.',
    },
    faqs: [
      { q: 'Halsschmerzen: wann Antibiotikum?', a: 'Antibiotika helfen nur bei bakteriellen Infektionen (v.a. Streptokokken). Der Hausarzt erkennt das an Anamnese, Untersuchung und ggf. Streptokokken-Schnelltest. 80–90 % der Halsschmerzen sind aber viral und Antibiotika hier wirkungslos.' },
      { q: 'Wann zum HNO bei Halsschmerzen?', a: 'Bei Halsschmerzen länger als 3 Wochen, bei anhaltender Heiserkeit über 3 Wochen (unklar für Raucher!), bei chronischen Schluckstörungen, bei Kloßgefühl ohne Infektzeichen, oder wenn Untersuchung von Kehlkopf mit Endoskop nötig wird.' },
      { q: 'Halsschmerzen bei Kindern: ansteckend?', a: 'Ja, virale Halsschmerzen sind hochansteckend, meist über Tröpfchen. Kinder mit Fieber gehören nicht in Kita/Schule. Bakterielle Streptokokken-Angina ist unter Antibiotika nach 24 Stunden nicht mehr ansteckend.' },
    ],
    relatedSlugs: ['hausarzt', 'hno-arzt', 'kinderarzt'],
    relatedSymptoms: ['husten', 'fieber', 'ohrenschmerzen'],
  },

  {
    slug: 'husten',
    label: 'Husten',
    directAnswer: 'Bei akutem Husten im Rahmen eines Infekts reicht meist der Hausarzt. Bei chronischem Husten über 8 Wochen ist eine internistische oder pneumologische Abklärung nötig.',
    intro: `Husten ist ein wichtiger Schutzreflex, der die Atemwege frei hält. Akut: fast immer viral (Erkältung, Grippe). Subakut (3–8 Wochen): oft postinfektiös. Chronisch (>8 Wochen): braucht Abklärung – häufigste Ursachen sind Reflux, chronische Bronchitis (v.a. bei Rauchern), Asthma, ACE-Hemmer-Nebenwirkung, seltener Lungenerkrankungen inkl. Krebs. Bei Blut im Auswurf, Gewichtsverlust oder Nachtschweiß ist zügige Abklärung angezeigt.`,
    whichDoctor: [
      { when: 'Akuter Husten bei Erkältung', doctor: 'Hausarzt', slug: 'hausarzt' },
      { when: 'Chronischer Husten > 8 Wochen', doctor: 'Internist / Pneumologe', slug: 'internist' },
      { when: 'Husten mit Reflux/Sodbrennen', doctor: 'Internist / Gastroenterologe', slug: 'internist' },
      { when: 'Husten bei Kindern', doctor: 'Kinderarzt', slug: 'kinderarzt' },
    ],
    emergency: {
      call112: 'Husten mit akuter Atemnot, blutigem Auswurf in großer Menge, Kollaps, oder blauen Lippen (Zyanose).',
      call116117: 'Anhaltender starker Husten mit hohem Fieber außerhalb der Praxis-Öffnungszeiten.',
      note: 'Blut im Auswurf immer zeitnah abklären lassen (Hausarzt, ggf. mit Röntgen-Überweisung).',
    },
    faqs: [
      { q: 'Ab wann ist Husten chronisch?', a: 'Als chronisch gilt Husten, der länger als 8 Wochen (bei Erwachsenen) bzw. 4 Wochen (bei Kindern) anhält. Chronischer Husten sollte immer abgeklärt werden – häufig ist die Ursache harmlos (Reizhusten nach Infekt), manchmal aber behandlungsbedürftig (Asthma, Reflux, Lungenerkrankung).' },
      { q: 'Husten mit Blut – was tun?', a: 'Blut im Auswurf sollte immer zeitnah ärztlich abgeklärt werden. Meist harmlos (kleine Gefäßverletzung durch Husten selbst), aber es können auch Lungenentzündung, Lungenembolie oder Tumor dahinterstecken. Bei großen Mengen oder Kombination mit Atemnot: 112.' },
      { q: 'Pneumologe oder Internist bei chronischem Husten?', a: 'Der internistische Pneumologe (Lungenfacharzt) ist die spezialisierteste Anlaufstelle für chronischen Husten. Zugang meist über Überweisung vom Hausarzt oder Internisten. Wenn Reflux die Ursache ist, kommt der Gastroenterologe ins Spiel.' },
    ],
    relatedSlugs: ['hausarzt', 'internist', 'kinderarzt'],
    relatedSymptoms: ['atemnot', 'fieber', 'halsschmerzen'],
  },

  {
    slug: 'atemnot',
    label: 'Atemnot',
    directAnswer: 'Akute, plötzliche Atemnot ist immer ein Notfall – wählen Sie 112. Chronische Atemnot bei Belastung gehört in kardiologische oder pneumologische Abklärung.',
    intro: `Atemnot (Dyspnoe) hat viele Ursachen. Akute plötzliche Atemnot kann durch Lungenembolie, Herzinfarkt, Asthmaanfall, Pneumothorax oder Anaphylaxie ausgelöst werden – lebensbedrohlich. Chronische Belastungs-Atemnot deutet oft auf Herz- (Herzinsuffizienz) oder Lungenerkrankung (COPD, Asthma). Bei jedem neu aufgetretenen oder plötzlich verstärkten Atemnot-Ereignis gilt: nicht abwarten.`,
    whichDoctor: [
      { when: 'AKUT plötzlich – sofort 112', doctor: 'Notruf 112', slug: null },
      { when: 'Belastungs-Atemnot chronisch', doctor: 'Kardiologe oder Pneumologe', slug: 'kardiologe' },
      { when: 'Chronischer Husten mit Atemnot', doctor: 'Internist / Pneumologe', slug: 'internist' },
      { when: 'Erste Einschätzung', doctor: 'Hausarzt', slug: 'hausarzt' },
    ],
    emergency: {
      call112: 'Plötzliche starke Atemnot, blaue Lippen, Bewusstseinsstörung, kombiniert mit Brustschmerz oder nach Verletzung/Sturz.',
      call116117: 'Zunehmende Atemnot ohne akute Verschlechterung außerhalb der Praxis-Öffnungszeiten.',
      note: 'Kinder mit Atemnot IMMER zeitnah abklären lassen – Kinder dekompensieren schnell.',
    },
    faqs: [
      { q: 'Wann ist Atemnot ein Notfall?', a: 'Bei plötzlicher, unerklärlicher Atemnot, blauen Lippen (Zyanose), Bewusstseinsstörung, extremem Angst-Gefühl, oder Kombination mit Brustschmerz, Schwitzen oder Kreislaufkollaps. Immer 112.' },
      { q: 'Kardiologe oder Pneumologe?', a: 'Bei Belastungs-Atemnot mit Bein-Ödemen, nächtlichem Aufwachen und Kurzatmigkeit im Liegen: Kardiologe (Herzinsuffizienz-Verdacht). Bei chronischem Husten mit Auswurf und Atemnot vor allem bei Rauchern: Pneumologe/Internist (COPD-Verdacht). Erste Einschätzung: Hausarzt.' },
      { q: 'Was tun beim Asthma-Anfall?', a: 'Ruhig bleiben, aufrecht sitzen (nicht liegen!), Bronchospasmolytikum-Spray anwenden (2 Hübe, ggf. nach 5 Minuten wiederholen). Bei ausbleibender Besserung oder Verschlechterung sofort 112. Wer Asthma hat, sollte einen Notfallplan mit dem behandelnden Arzt vereinbart haben.' },
    ],
    relatedSlugs: ['kardiologe', 'internist', 'hausarzt'],
    relatedSymptoms: ['brustschmerzen', 'husten', 'herzstolpern'],
  },

  {
    slug: 'schwindel',
    label: 'Schwindel',
    directAnswer: 'Schwindel gehört initial zum Hausarzt. Bei Drehschwindel mit Ohrsymptomen zum HNO-Arzt, bei Schwankschwindel mit neurologischen Symptomen zum Neurologen. Plötzlicher starker Schwindel kann ein Schlaganfall sein – im Zweifel 112.',
    intro: `Schwindel ist eines der häufigsten Symptome in der Hausarztpraxis. Wichtig ist die Unterscheidung: Drehschwindel (typisch bei Ohr-Erkrankungen wie gutartigem Lagerungsschwindel oder Morbus Menière), Schwankschwindel (oft neurologisch, muskulär oder psychogen), Benommenheit (kreislaufbedingt oder medikamentös). Plötzlicher starker Schwindel mit neurologischen Ausfällen (Sprachstörung, Sehstörung, Lähmung) ist ein Schlaganfall-Verdacht.`,
    whichDoctor: [
      { when: 'Erste Einschätzung', doctor: 'Hausarzt', slug: 'hausarzt' },
      { when: 'Drehschwindel, Ohrsymptome, Tinnitus', doctor: 'HNO-Arzt', slug: 'hno-arzt' },
      { when: 'Schwankschwindel mit neurologischen Symptomen', doctor: 'Neurologe', slug: 'neurologe' },
      { when: 'Herz-Kreislauf-bedingter Schwindel', doctor: 'Kardiologe', slug: 'kardiologe' },
    ],
    emergency: {
      call112: 'Plötzlicher starker Schwindel mit Sprachstörung, einseitiger Lähmung, Doppelbildern oder Bewusstseinstrübung (Schlaganfall-Verdacht – FAST-Regel).',
      call116117: 'Anhaltend starker Schwindel mit Übelkeit außerhalb der Praxis-Öffnungszeiten.',
      note: 'Gutartiger Lagerungsschwindel (BPPV) ist meist harmlos und mit Lagerungsmanövern binnen Minuten zu behandeln – aber die Erstdiagnose gehört zum HNO oder Neurologen.',
    },
    faqs: [
      { q: 'Drehschwindel oder Schwankschwindel?', a: 'Drehschwindel: die Umgebung dreht sich, meist mit Übelkeit – typisch für Innenohr-Erkrankungen wie den gutartigen Lagerungsschwindel (BPPV) oder Morbus Menière. Schwankschwindel: das Gefühl, kein festen Boden zu haben – häufig neurologisch, muskulär oder psychogen. Die Unterscheidung ist diagnostisch wichtig.' },
      { q: 'Was ist der gutartige Lagerungsschwindel?', a: 'Der benigne paroxysmale Lagerungsschwindel (BPPV) ist die häufigste Schwindel-Ursache. Kleine Kalzium-Kristalle im Innenohr lösen bei Kopfbewegung sekundenlange Dreh-Attacken aus. Diagnose und Behandlung (Epley- oder Semont-Manöver) durch HNO-Arzt oder Neurologen sind meist sehr wirksam.' },
      { q: 'Schwindel: wann sofort 112?', a: 'Bei plötzlichem starken Schwindel mit neurologischen Ausfällen (Sprachstörung, einseitige Lähmung, Doppelbilder, Bewusstseinstrübung), oder Kombination mit Brustschmerz, Kollaps oder anhaltender Herzrhythmus-Störung.' },
    ],
    relatedSlugs: ['hno-arzt', 'neurologe', 'hausarzt', 'kardiologe'],
    relatedSymptoms: ['kopfschmerzen', 'sehstoerungen', 'tinnitus'],
  },

  {
    slug: 'fieber',
    label: 'Fieber',
    directAnswer: 'Bei Fieber bei Erwachsenen ist der Hausarzt zuständig. Kinder unter drei Monaten mit Fieber sollten immer zeitnah kinderärztlich untersucht werden. Sehr hohes Fieber (>40 °C) mit Bewusstseinstrübung oder Nackensteife ist ein Notfall (112).',
    intro: `Fieber ist eine natürliche Reaktion des Immunsystems auf Infektionen (viral, bakteriell) oder Entzündungen. Ab 38,0 °C spricht man von Fieber, ab 39,5 °C von hohem Fieber. Meist selbstlimitierend nach 3–5 Tagen. Bei Säuglingen unter drei Monaten, bei Fieber über 3 Tagen ohne erkennbare Ursache, bei sehr hohem Fieber (>40 °C), oder bei Alarmzeichen (Nackensteife, Bewusstseinstrübung, Petechien) ist zeitnahe ärztliche Abklärung nötig.`,
    whichDoctor: [
      { when: 'Erwachsene mit Fieber', doctor: 'Hausarzt', slug: 'hausarzt' },
      { when: 'Kinder mit Fieber', doctor: 'Kinderarzt', slug: 'kinderarzt' },
      { when: 'Fieber ohne erkennbaren Fokus > 5 Tage', doctor: 'Internist', slug: 'internist' },
    ],
    emergency: {
      call112: 'Fieber mit Bewusstseinstrübung, Nackensteife, Krampfanfällen, Kreislaufversagen, oder punktförmige Blutungen unter der Haut (Petechien – Verdacht auf Meningokokken-Sepsis).',
      call116117: 'Hohes Fieber (>39,5 °C) außerhalb der Praxis-Öffnungszeiten, besonders bei Kleinkindern.',
      note: 'Säuglinge (< 3 Monate) mit ANY Fieber immer zeitnah ärztlich abklären lassen.',
    },
    faqs: [
      { q: 'Ab welcher Temperatur ist es Fieber?', a: 'Erwachsene: ab 38,0 °C spricht man von Fieber, ab 39,5 °C von hohem Fieber. Kinder: ab 38,5 °C rektal gemessen. Werte davor werden als „erhöhte Temperatur" bezeichnet.' },
      { q: 'Wie senkt man Fieber?', a: 'Ausreichend trinken, Wadenwickel, leichte Kleidung, ruhen. Fiebersenker (Paracetamol, Ibuprofen) nur bei Bedarf und in der empfohlenen Dosis. Fieber ist eine Immunreaktion, nicht die Krankheit selbst – nicht immer sofort senken. Bei sehr hohem Fieber (>39,5 °C) und unwohlem Zustand: Fiebersenker sinnvoll.' },
      { q: 'Fieber bei Kindern: wann zum Arzt?', a: 'Immer bei Säuglingen unter 3 Monaten. Kinder 3–24 Monate: bei Fieber >39 °C oder mehr als 3 Tage. Ältere Kinder: bei hohem Fieber >39,5 °C, ausgeprägter Beeinträchtigung, Nackensteife, Petechien, Krampfanfall oder Fieber über 5 Tage. Im Zweifel immer.' },
    ],
    relatedSlugs: ['hausarzt', 'kinderarzt', 'internist'],
    relatedSymptoms: ['husten', 'halsschmerzen', 'ohrenschmerzen'],
  },

  {
    slug: 'muedigkeit',
    label: 'Chronische Müdigkeit / Erschöpfung',
    directAnswer: 'Bei anhaltender Müdigkeit oder Erschöpfung ist der Hausarzt die richtige Anlaufstelle. Er ordnet Blutuntersuchungen an (Schilddrüse, Eisen, Vitamin B12, Blutbild) und überweist bei Bedarf an Fachärzte.',
    intro: `Anhaltende Müdigkeit hat viele Ursachen: Schlafmangel und Schlafstörungen, Eisenmangel (v.a. bei Frauen), Schilddrüsenunterfunktion, Vitamin-D- oder B12-Mangel, Depression, chronische Infektionen, Diabetes, Herzerkrankungen, Schlafapnoe, ME/CFS (myalgische Enzephalomyelitis / chronisches Fatigue-Syndrom) oder Nebenwirkungen von Medikamenten. Der Hausarzt startet mit gezielter Blutuntersuchung und Anamnese.`,
    whichDoctor: [
      { when: 'Erste Einschätzung, Basis-Labor', doctor: 'Hausarzt', slug: 'hausarzt' },
      { when: 'Schilddrüsenunterfunktion, hormonelle Ursachen', doctor: 'Internist / Endokrinologe', slug: 'internist' },
      { when: 'Depression, Erschöpfungssyndrom, Burnout', doctor: 'Psychiater / Psychotherapeut', slug: 'psychiater' },
      { when: 'Schlafapnoe (Schnarchen, Tagesmüdigkeit)', doctor: 'HNO-Arzt oder Schlafmediziner', slug: 'hno-arzt' },
    ],
    emergency: {
      call112: 'Extrem selten – nur bei plötzlicher schwerer Erschöpfung mit Bewusstseinstrübung, Herzrasen oder Kreislaufversagen.',
      call116117: 'Nicht typischerweise.',
      note: 'Auch wenn die Symptomatik nicht dramatisch wirkt: chronische Müdigkeit sollte immer ärztlich abgeklärt werden – zu viele mögliche organische Ursachen.',
    },
    faqs: [
      { q: 'Ab wann ist Müdigkeit „chronisch"?', a: 'Chronisch: Erschöpfung, die trotz ausreichenden Schlafs länger als vier bis sechs Wochen anhält und die Alltagsleistung beeinträchtigt. Immer diagnostisch abklären.' },
      { q: 'Welche Blutwerte prüfen bei Müdigkeit?', a: 'Basis: großes Blutbild, Ferritin (Eisen-Speicher), TSH (Schilddrüse), Vitamin D, Vitamin B12, Folsäure, Blutzucker, Nieren- und Leberwerte, CRP. Bei entsprechendem Verdacht: HbA1c (Diabetes), Antikörper (Autoimmun), Hormone (Cortisol).' },
      { q: 'Was ist ME/CFS?', a: 'Myalgische Enzephalomyelitis / Chronisches Fatigue-Syndrom ist eine schwere neuroimmunologische Erkrankung mit anhaltender Erschöpfung, die sich nach Belastung typischerweise verschlechtert (post-exertional malaise). Diagnose durch spezialisierte Zentren (nach Ausschluss anderer Ursachen). Wichtig: nicht mit „Burnout" verwechseln.' },
    ],
    relatedSlugs: ['hausarzt', 'internist', 'psychiater', 'hno-arzt'],
    relatedSymptoms: ['schlafstoerungen', 'depression', 'gewichtsverlust'],
  },

  {
    slug: 'hautausschlag',
    label: 'Hautausschlag',
    directAnswer: 'Bei Hautausschlägen ist der Hautarzt (Dermatologe) die richtige Anlaufstelle. Bei akutem, schnell fortschreitendem Ausschlag mit Fieber und Kreislaufsymptomen: 112.',
    intro: `Hautausschläge (Exantheme) haben unzählige Ursachen: allergische Reaktionen (Kontakt- oder Nahrungsmittelallergie), Infektionen (Windpocken, Masern, Röteln), chronische Hauterkrankungen (Neurodermitis, Psoriasis), Autoimmunerkrankungen (Lupus), Arzneimittel-Reaktionen. Die Kombination aus Aussehen, Ausbreitung, Juckreiz und Begleitsymptomen leitet die Diagnose. Bei rasch fortschreitendem Ausschlag mit Fieber, Atembeteiligung oder Kreislaufsymptomen: sofort 112.`,
    whichDoctor: [
      { when: 'Der klassische Ansprechpartner', doctor: 'Hautarzt (Dermatologe)', slug: 'hautarzt' },
      { when: 'Erste Einschätzung bei nicht dringlichen Fällen', doctor: 'Hausarzt', slug: 'hausarzt' },
      { when: 'Kinder mit Ausschlag', doctor: 'Kinderarzt', slug: 'kinderarzt' },
    ],
    emergency: {
      call112: 'Punktförmige Blutungen unter der Haut (Petechien) mit Fieber (Verdacht auf Meningokokken-Sepsis), starke Schwellung im Gesicht/Rachen mit Atemnot (Anaphylaxie), rasch großflächige Blasenbildung (Verdacht auf Stevens-Johnson-Syndrom).',
      call116117: 'Ausgedehnter juckender Ausschlag mit Fieber außerhalb der Praxis-Öffnungszeiten.',
      note: 'Bei Kindern mit Ausschlag und Fieber IMMER zeitnah abklären – Kinderkrankheiten wie Masern sind trotz Impfempfehlung nicht ausgestorben.',
    },
    faqs: [
      { q: 'Hautarzt oder Hausarzt bei Ausschlag?', a: 'Der Hautarzt ist der Facharzt und diagnostisch spezialisiert (Auflichtmikroskopie, Hautbiopsie). Wenn der Hautausschlag nicht bedrohlich wirkt und rasch bewertet werden soll, kann auch der Hausarzt erste Einschätzung geben – Facharzt-Termine haben oft Wartezeiten. Bei Kindern: Kinderarzt.' },
      { q: 'Ist Nesselsucht gefährlich?', a: 'Urtikaria (Nesselsucht) ist an sich meist harmlos und bildet sich nach Stunden oder wenigen Tagen zurück. Gefährlich wird sie bei anaphylaktischer Reaktion mit Beteiligung der Atemwege (Angioödem im Gesicht/Rachen, Atemnot) – dann 112. Chronische Nesselsucht (>6 Wochen) gehört hautärztlich abgeklärt.' },
      { q: 'Wie unterscheide ich Neurodermitis von Psoriasis?', a: 'Neurodermitis: stark juckend, in Ellenbeugen und Kniekehlen bei Kindern, gerötet und schuppig. Psoriasis: silbrig-weiß schuppende, scharf begrenzte Plaques auf Streckseiten (Ellenbogen, Knie), Kopfhaut, weniger juckend. Sichere Unterscheidung durch Hautarzt.' },
    ],
    relatedSlugs: ['hautarzt', 'hausarzt', 'kinderarzt'],
    relatedSymptoms: ['juckreiz', 'schwellung', 'allergie'],
  },

  {
    slug: 'juckreiz',
    label: 'Juckreiz',
    directAnswer: 'Bei anhaltendem Juckreiz ist der Hautarzt der richtige Ansprechpartner. Juckreiz ohne Hautveränderungen kann auch auf innere Erkrankungen (Leber, Niere, Schilddrüse) hinweisen – dann Internist.',
    intro: `Juckreiz (Pruritus) kann lokal auftreten (mit sichtbarem Hautausschlag – meist dermatologische Ursache) oder generalisiert (oft ohne Hautveränderungen – möglicherweise Zeichen einer inneren Erkrankung). Wichtige innere Ursachen: chronische Nieren- oder Lebererkrankungen, Schilddrüsenstörungen, Lymphome, Eisenmangel, medikamentös. Chronischer Juckreiz (>6 Wochen) sollte immer abgeklärt werden.`,
    whichDoctor: [
      { when: 'Juckreiz mit sichtbaren Hautveränderungen', doctor: 'Hautarzt', slug: 'hautarzt' },
      { when: 'Juckreiz ohne Hautveränderungen (generalisiert)', doctor: 'Internist / Hausarzt (Labor)', slug: 'internist' },
      { when: 'Juckreiz nach Neu-Medikament', doctor: 'Hausarzt (Absetzen/Wechsel)', slug: 'hausarzt' },
    ],
    emergency: {
      call112: 'Juckreiz mit Schwellung im Gesicht/Hals, Atemnot – Anaphylaxie-Verdacht.',
      call116117: 'Massiver akuter Juckreiz außerhalb der Praxis-Öffnungszeiten.',
      note: 'Isolierter chronischer Juckreiz ist selten dringlich, sollte aber immer ärztlich abgeklärt werden.',
    },
    faqs: [
      { q: 'Was tun bei chronischem Juckreiz?', a: 'Juckreiz über 6 Wochen sollte hautärztlich oder internistisch abgeklärt werden. Basis-Labor (Blutbild, Nieren-, Leberwerte, TSH, Vitamin D, Ferritin) plus Hautbefund. Bis zur Klärung: hydrophile Cremes, milde Reinigung, kein heißes Duschen, ggf. Antihistaminikum.' },
      { q: 'Warum juckt es ohne Ausschlag?', a: 'Möglich sind Nieren- oder Lebererkrankungen (Urämie, cholestatischer Juckreiz), Schilddrüsenstörungen, Eisenmangel, Diabetes, Nervenreizungen, Krebs (paraneoplastisch), Medikamenten-Nebenwirkung. Wichtig: nicht ignorieren, sondern internistisch abklären lassen.' },
      { q: 'Cortison-Salbe: wie lange darf ich sie nutzen?', a: 'Cortison-haltige Salben (topische Kortikosteroide) sind in kurzen Kuren (max. 2 Wochen) meist unbedenklich. Längere Anwendung oder Anwendung im Gesicht: nur unter hautärztlicher Kontrolle wegen Hautverdünnung. Nach Beschwerdefreiheit ausschleichen, nicht abrupt absetzen.' },
    ],
    relatedSlugs: ['hautarzt', 'internist', 'hausarzt'],
    relatedSymptoms: ['hautausschlag', 'trockene-haut'],
  },

  {
    slug: 'sehstoerungen',
    label: 'Sehstörungen',
    directAnswer: 'Sehstörungen sind ein Fall für den Augenarzt. Plötzliche einseitige Sehverschlechterung, „Vorhang" im Sichtfeld oder Doppelbilder sind Notfälle (Augenklinik oder 112).',
    intro: `Sehstörungen reichen von harmlosen Refraktionsstörungen (Kurz- oder Weitsichtigkeit) bis zu akuten Notfällen. Plötzlicher Sehverlust auf einem Auge, „Vorhang" oder große dunkle Flecken im Sichtfeld sind Verdachtsmomente auf Netzhautablösung oder Zentralvenenthrombose – jede Minute zählt. Doppelbilder mit Kopfschmerz oder Bewusstseinsstörung: Schlaganfall-Verdacht (112).`,
    whichDoctor: [
      { when: 'Alle Sehstörungen (Basis-Abklärung)', doctor: 'Augenarzt', slug: 'augenarzt' },
      { when: 'Doppelbilder mit Kopfschmerz oder Lähmung – 112!', doctor: 'Notruf 112', slug: null },
      { when: 'Sehverschlechterung mit Diabetes', doctor: 'Augenarzt (Netzhaut-Kontrolle)', slug: 'augenarzt' },
      { when: 'Bei plötzlichem Sehverlust: Augenklinik', doctor: 'Augenklinik/Notdienst', slug: null },
    ],
    emergency: {
      call112: 'Plötzliche einseitige Erblindung, Sehverlust mit Sprachstörung oder Lähmung (Schlaganfall-Verdacht), plötzliche Doppelbilder mit Kopfschmerz.',
      call116117: 'Sehverschlechterung nachts außerhalb Praxis-Öffnungszeiten.',
      note: 'Bei Verdacht auf Netzhautablösung („Vorhang", plötzlich viele Rußflocken, Blitze im Auge) direkt in die Augenklinik – jede Stunde ohne Behandlung schadet.',
    },
    faqs: [
      { q: 'Plötzlicher Sehverlust auf einem Auge – Notfall?', a: 'Ja. Plötzlicher einseitiger Sehverlust ohne Schmerz kann durch Netzhautgefäß-Verschluss (Amaurosis fugax / Zentralarterienverschluss) verursacht sein – augenärztlicher Notfall, oft mit Schlaganfall-Risiko verbunden. Sofort in Augenklinik/Notaufnahme.' },
      { q: 'Was ist ein „Vorhang" im Sichtfeld?', a: 'Ein sich ausbreitender dunkler Schatten oder Vorhang, oft von der Peripherie zum Zentrum – typisch für eine Netzhautablösung. Meist geht ein Symptom voraus: viele plötzliche schwarze Rußflocken oder Lichtblitze. Sofort in die Augenklinik – jede Minute ohne Behandlung reduziert die Chance auf vollständige Wiederherstellung.' },
      { q: 'Sehverschlechterung durch Diabetes?', a: 'Ja. Die diabetische Retinopathie (Netzhaut-Erkrankung) ist die häufigste Erblindungsursache bei arbeitsfähigen Erwachsenen. Alle Diabetiker sollten jährlich augenärztlich untersucht werden – Frühformen sind gut behandelbar (Laser, Injektionen), Spätformen führen zu Sehverlust.' },
    ],
    relatedSlugs: ['augenarzt', 'neurologe'],
    relatedSymptoms: ['kopfschmerzen', 'schwindel', 'diabetes'],
  },

  {
    slug: 'depression',
    label: 'Depressive Verstimmung',
    directAnswer: 'Bei anhaltender depressiver Verstimmung ist der Hausarzt eine gute erste Anlaufstelle. Für spezialisierte Behandlung: Psychiater (medikamentös) oder Psychotherapeut (Verhaltens- oder Tiefenpsychologie). Bei Suizidgedanken: sofort Telefonseelsorge 0800 111 0 111 oder 112.',
    intro: `Depressive Verstimmung ist eine der häufigsten psychischen Erkrankungen: rund 15–20 Prozent der Bevölkerung erleben mindestens eine Episode im Leben. Klinisch relevant: anhaltend gedrückte Stimmung, Interessenverlust, Antriebslosigkeit über mehr als zwei Wochen, oft begleitet von Schlafstörungen, Appetitverlust, Konzentrationsproblemen und (in schweren Formen) Suizidgedanken. Wichtig: Depression ist behandelbar – Psychotherapie, Medikamente oder Kombination führen in den meisten Fällen zu Besserung.`,
    whichDoctor: [
      { when: 'Erste Einschätzung, Basis-Labor (Schilddrüse, Vitamin D)', doctor: 'Hausarzt', slug: 'hausarzt' },
      { when: 'Diagnostik + Medikation (z. B. Antidepressiva)', doctor: 'Psychiater', slug: 'psychiater' },
      { when: 'Psychotherapie (Gespräch, Verhaltenstherapie)', doctor: 'Psychotherapeut', slug: 'psychotherapeut' },
    ],
    emergency: {
      call112: 'Akute Suizidgefahr, konkrete Suizid-Pläne, unmittelbare Selbst- oder Fremdgefährdung – nächste psychiatrische Klinik oder 112.',
      call116117: 'Nicht typisch – für psychische Krisen ist die Telefonseelsorge 24/7 unter 0800 111 0 111 und 0800 111 0 222 kostenfrei erreichbar.',
      note: 'Auch ohne akute Krise: bei Suizidgedanken IMMER professionelle Hilfe holen. Die Telefonseelsorge ist anonym und kostenfrei.',
    },
    faqs: [
      { q: 'Psychiater oder Psychotherapeut?', a: 'Der Psychiater ist Arzt und darf Medikamente verordnen (Antidepressiva). Der Psychotherapeut ist meist Psychologe und macht Gesprächs-/Verhaltenstherapie ohne Medikamente. Bei mittelschweren Depressionen wird oft beides kombiniert. Erster Schritt kann der Hausarzt sein, der überweist.' },
      { q: 'Wie erkenne ich, ob es „nur" ein Stimmungstief oder eine Depression ist?', a: 'Als depressive Episode gilt eine mindestens 2 Wochen anhaltende Kombination aus: gedrückter Stimmung, Interessen-/Freudlosigkeit, Antriebsminderung. Zusatzsymptome: Schlafstörung, Appetitverlust, Konzentrationsprobleme, Grübelzwang, Suizidgedanken, Schuldgefühle. Bei anhaltender Beeinträchtigung: ärztlich abklären.' },
      { q: 'Machen Antidepressiva abhängig?', a: 'Nein. Antidepressiva (SSRI, SNRI, Trizyklika) machen nicht abhängig. Das Absetzen sollte schrittweise erfolgen (Ausschleichen über Wochen), weil sonst sogenannte Absetz-Phänomene auftreten können – das ist aber keine Abhängigkeit. Benzodiazepine (Beruhigungsmittel) sind eine andere Substanzklasse und haben ein deutliches Abhängigkeits-Risiko.' },
    ],
    relatedSlugs: ['hausarzt', 'psychiater', 'psychotherapeut'],
    relatedSymptoms: ['schlafstoerungen', 'muedigkeit', 'angst-panik'],
  },

  {
    slug: 'angst-panik',
    label: 'Angst und Panikattacken',
    directAnswer: 'Bei Angst- und Panikstörungen sind Psychiater (medikamentös) und Psychotherapeut (Verhaltenstherapie) die Fachärzte. Erste Anlaufstelle: Hausarzt zur Basis-Abklärung. Panikattacken sind sehr unangenehm, aber nicht lebensbedrohlich.',
    intro: `Panikattacken sind akute Episoden intensiver Angst mit körperlichen Symptomen: Herzrasen, Atemnot, Schwitzen, Zittern, Todesangst. Sie dauern typischerweise 10–20 Minuten. Panikstörung heißt: wiederkehrende Attacken plus Angst vor der nächsten Attacke. Wichtig: Panikattacken sind subjektiv schlimm, aber körperlich nicht gefährlich. Die effektivste Behandlung ist Kognitive Verhaltenstherapie, oft ergänzt durch Medikamente (SSRI).`,
    whichDoctor: [
      { when: 'Erste Einschätzung, Ausschluss körperlicher Ursachen', doctor: 'Hausarzt', slug: 'hausarzt' },
      { when: 'Medikamentöse Therapie (SSRI etc.)', doctor: 'Psychiater', slug: 'psychiater' },
      { when: 'Kognitive Verhaltenstherapie (Goldstandard)', doctor: 'Psychotherapeut', slug: 'psychotherapeut' },
    ],
    emergency: {
      call112: 'Bei erster Panikattacke UND begleitendem starken Brustschmerz kann Herzinfarkt-Verdacht bestehen – im Zweifel 112. Die klinische Unterscheidung ist im Akutfall oft nur nach EKG möglich.',
      call116117: 'Nicht typisch – Panikattacke ist keine Notfall-Situation für 116 117.',
      note: 'Beruhigende Atem-Übungen (Ausatmen betont, langsam durch den Mund) helfen oft, die Attacke abzukürzen.',
    },
    faqs: [
      { q: 'Ist eine Panikattacke gefährlich?', a: 'Subjektiv fühlt sich eine Panikattacke wie ein lebensbedrohliches Ereignis an – körperlich ist sie es aber nicht. Die körperlichen Symptome (Herzrasen, Atemnot, Schwitzen) sind eine adrenerge Stressreaktion und verschwinden nach 10–20 Minuten spontan. Bei erster Attacke mit Brustschmerz sollte einmal EKG-mäßig abgeklärt werden.' },
      { q: 'Was hilft akut bei einer Panikattacke?', a: 'Bewusst langsam durch den Mund ausatmen (länger als einatmen), Blick auf konkreten Gegenstand fokussieren, sich einreden „Das ist Panik, das geht in 10 Minuten vorbei". Ein festes Ritual („Notfall-Anker") aus der Verhaltenstherapie hilft auf Dauer. Alkohol und Benzodiazepine sind KEINE Lösung.' },
      { q: 'Verhaltenstherapie oder Medikamente bei Angststörung?', a: 'Erste Wahl: Kognitive Verhaltenstherapie – wirkt nachhaltig ohne Nebenwirkungen, aber braucht Zeit. Bei starkem Leidensdruck werden zusätzlich SSRI (Antidepressiva) eingesetzt, die auch bei Angststörungen wirksam sind. Benzodiazepine sind nur bei akuten Krisen kurzzeitig indiziert (Abhängigkeits-Risiko).' },
    ],
    relatedSlugs: ['hausarzt', 'psychiater', 'psychotherapeut'],
    relatedSymptoms: ['schlafstoerungen', 'brustschmerzen', 'herzstolpern'],
  },

  {
    slug: 'schlafstoerungen',
    label: 'Schlafstörungen',
    directAnswer: 'Bei Schlafstörungen ist der Hausarzt die erste Anlaufstelle. Bei Verdacht auf Schlafapnoe (Schnarchen mit Atemaussetzern und Tagesmüdigkeit): HNO-Arzt oder Schlafmediziner. Bei psychischen Ursachen: Psychotherapeut oder Psychiater.',
    intro: `Schlafstörungen betreffen etwa 20–30 Prozent der Erwachsenen. Formen: Ein- und Durchschlafstörungen (Insomnie), Schlafapnoe (Atemaussetzer), Restless-Legs-Syndrom, Parasomnien. Ursachen: Stress, Depression, Angst, chronische Schmerzen, Alkohol, Koffein, Medikamente, Wechseljahre, körperliche Erkrankungen. Vor Schlafmitteln steht Schlafhygiene: feste Zeiten, kein Bildschirm 1 h vor Bett, kühles Schlafzimmer, kein Alkohol/Koffein am Abend.`,
    whichDoctor: [
      { when: 'Erste Einschätzung, Basis-Labor', doctor: 'Hausarzt', slug: 'hausarzt' },
      { when: 'Verdacht auf Schlafapnoe (Schnarchen, Tagesmüdigkeit)', doctor: 'HNO-Arzt / Schlafmediziner', slug: 'hno-arzt' },
      { when: 'Schlafstörung bei Depression/Angst', doctor: 'Psychiater / Psychotherapeut', slug: 'psychiater' },
      { when: 'Restless-Legs-Syndrom', doctor: 'Neurologe', slug: 'neurologe' },
    ],
    emergency: {
      call112: 'Nicht typisch.',
      call116117: 'Nicht typisch.',
      note: 'Chronischer Schlafmangel ist ein wichtiger Risikofaktor für Herz-Kreislauf-Erkrankungen und Depressionen – langfristig ernstnehmen.',
    },
    faqs: [
      { q: 'Was ist Schlafhygiene?', a: 'Verhaltensregeln für besseren Schlaf: regelmäßige Bett- und Aufstehzeiten (auch am Wochenende), kein Bildschirm 1 h vor Bett, kühles Schlafzimmer (16–18 °C), dunkles Schlafzimmer, kein Alkohol/Koffein/schweres Essen am Abend, tagsüber Bewegung. Bei anhaltender Schlaflosigkeit: kognitive Verhaltenstherapie für Insomnie (KVT-I) ist Goldstandard.' },
      { q: 'Wann Schlafmittel?', a: 'Rezeptpflichtige Schlafmittel (v.a. Benzodiazepine, Z-Substanzen) sollten nur kurz (max. 4 Wochen) und in Krisen eingesetzt werden – Abhängigkeitspotenzial. Baldrian, Melatonin und pflanzliche Mittel haben geringere Wirkstärke und Nebenwirkungen, aber auch begrenzte Evidenz. Vorrang haben Schlafhygiene und Verhaltenstherapie.' },
      { q: 'Was ist Schlafapnoe?', a: 'Schlafapnoe ist eine ernste Erkrankung mit Atemaussetzern im Schlaf, meist durch Verschluss der oberen Atemwege. Symptome: lautes unregelmäßiges Schnarchen, beobachtete Atempausen, ausgeprägte Tagesmüdigkeit, Konzentrationsstörungen, morgendliche Kopfschmerzen. Diagnose durch Schlaflabor. Behandlung meist mit CPAP-Maske – deutlich lebensverlängernd.' },
    ],
    relatedSlugs: ['hausarzt', 'hno-arzt', 'psychiater', 'neurologe'],
    relatedSymptoms: ['muedigkeit', 'depression', 'angst-panik'],
  },

  {
    slug: 'bluthochdruck',
    label: 'Bluthochdruck',
    directAnswer: 'Bei Bluthochdruck ist der Hausarzt oder Kardiologe zuständig. Bluthochdruck bleibt oft lange symptomlos, ist aber ein zentraler Risikofaktor für Schlaganfall und Herzinfarkt – regelmäßige Kontrolle ist entscheidend.',
    intro: `Etwa 20–30 Prozent der Erwachsenen in Deutschland haben Bluthochdruck (arterielle Hypertonie), viele davon unerkannt. Werte ab 140/90 mmHg gelten als behandlungsbedürftig. Symptome sind unspezifisch (Kopfschmerzen, Nasenbluten, Schwindel) oder fehlen ganz – deshalb der Beiname „stiller Killer". Konsequente Behandlung durch Lebensstil (Bewegung, Salzreduktion, Gewichtsabnahme) plus ggf. Medikamente reduziert das Risiko für Schlaganfall und Herzinfarkt drastisch.`,
    whichDoctor: [
      { when: 'Erst-Diagnose, Basis-Einstellung', doctor: 'Hausarzt', slug: 'hausarzt' },
      { when: 'Schwer einstellbar, Endorgan-Schäden', doctor: 'Kardiologe', slug: 'kardiologe' },
      { when: 'Nieren-bedingter Bluthochdruck', doctor: 'Nephrologe (Internist)', slug: 'internist' },
    ],
    emergency: {
      call112: 'Extreme Blutdruck-Werte (>230/120 mmHg) mit akuten Symptomen: Sehstörungen, Sprachstörung, Lähmung, starke Brustschmerzen – hypertensive Krise mit Endorgan-Schaden.',
      call116117: 'Wiederkehrend erhöhte Werte (z. B. 180/110) ohne Beschwerden außerhalb der Öffnungszeiten.',
      note: 'Auch bei „normalem" Blutdruck über 140/90 mmHg: nicht ignorieren, sondern gezielt abklären lassen. Blutdruck-Selbstmessung zu Hause hilft.',
    },
    faqs: [
      { q: 'Ab wann ist Blutdruck zu hoch?', a: 'In der Praxis gemessen: ab 140/90 mmHg gilt als Hypertonie. In der Selbstmessung zu Hause: ab 135/85 mmHg. Optimal: unter 120/80. Für Diabetiker und Patienten mit Nierenerkrankung gelten strengere Zielwerte.' },
      { q: 'Kann man Bluthochdruck durch Lebensstil senken?', a: 'Ja, oft deutlich: 10 kg Gewichtsabnahme reduzieren den Blutdruck um durchschnittlich 5–20 mmHg. Weniger Salz (< 5 g/Tag): -2 bis -8 mmHg. Regelmäßiger Ausdauersport: -4 bis -9 mmHg. DASH-Diät (viel Obst, Gemüse, wenig Fett): -8 bis -14 mmHg. Bei manchen Patienten reicht das aus, um Medikamente zu vermeiden oder zu reduzieren.' },
      { q: 'Muss ich Bluthochdruck-Medikamente lebenslang nehmen?', a: 'In den meisten Fällen ja. Bluthochdruck ist eine chronische Erkrankung. Bei erfolgreicher Lebensstil-Umstellung kann die Dosis reduziert oder in seltenen Fällen abgesetzt werden – aber nur nach ärztlicher Rücksprache und mit Verlaufskontrolle. Selbstständiges Absetzen ist gefährlich (Rebound-Krise).' },
    ],
    relatedSlugs: ['hausarzt', 'kardiologe', 'internist'],
    relatedSymptoms: ['kopfschmerzen', 'schwindel', 'nasenbluten'],
  },

  {
    slug: 'sodbrennen',
    label: 'Sodbrennen',
    directAnswer: 'Bei gelegentlichem Sodbrennen reicht der Hausarzt. Bei anhaltenden Beschwerden mehr als zweimal pro Woche über mehrere Wochen sollte ein Gastroenterologe (Internist) mit Magenspiegelung abklären.',
    intro: `Sodbrennen (Reflux) betrifft etwa 20 Prozent der Erwachsenen regelmäßig. Ursache: Magensäure fließt in die Speiseröhre zurück, meist durch ein schwaches Schließmuskel-System am Mageneingang, oft verstärkt durch Übergewicht, späte Mahlzeiten, Alkohol, Kaffee, scharfe Speisen. Chronischer Reflux (GERD) kann zu Speiseröhren-Entzündung und langfristig zum Barrett-Ösophagus (Krebsvorstufe) führen – deshalb Abklärung wichtig.`,
    whichDoctor: [
      { when: 'Gelegentliches Sodbrennen', doctor: 'Hausarzt', slug: 'hausarzt' },
      { when: 'Anhaltendes Sodbrennen > 2×/Woche mehrere Wochen', doctor: 'Internist / Gastroenterologe', slug: 'internist' },
      { when: 'Sodbrennen mit Schluckstörung', doctor: 'HNO-Arzt oder Gastroenterologe', slug: 'internist' },
    ],
    emergency: {
      call112: 'Nur wenn Verwechslung mit Herzinfarkt: „Sodbrennen"-artige Beschwerden mit Ausstrahlung in Arm, Atemnot, Kaltschweißigkeit – im Zweifel 112.',
      call116117: 'Nicht typisch.',
      note: 'Warnsignale für Malignität: Schluckbeschwerden, ungewollter Gewichtsverlust, blutiges Erbrechen, Bluterbrechen, Teerstuhl. Sofort Hausarzt.',
    },
    faqs: [
      { q: 'Was hilft gegen Sodbrennen?', a: 'Kurzfristig: Antazida (rezeptfrei), aufrechte Position, kleines Glas Wasser. Mittelfristig: Reduktion von Kaffee, Alkohol, scharfen Speisen, spätes Essen vermeiden (letzte Mahlzeit 3 h vor Bett), Kopfteil im Bett erhöhen, Gewichtsabnahme. Bei häufigem Reflux: PPI-Medikament (z. B. Omeprazol) nach ärztlicher Rücksprache.' },
      { q: 'Wann Magenspiegelung?', a: 'Empfohlen bei: Sodbrennen länger als 4 Wochen unter Therapie, ab 45. Lebensjahr mit neu aufgetretenen Reflux-Beschwerden, Alarmsymptomen (Gewichtsverlust, Blut, Schluckbeschwerden), oder Verdacht auf Helicobacter-pylori-Infektion. Die Gastroskopie dauert 10–15 Minuten, meist in leichter Sedierung.' },
      { q: 'Was ist Barrett-Ösophagus?', a: 'Bei chronischem Reflux verändern sich die Zellen der Speiseröhre („Umbau" zu darmartiger Schleimhaut). Barrett gilt als Vorstufe zu Speiseröhrenkrebs – deshalb regelmäßige gastroskopische Kontrolle. Konsequente Reflux-Behandlung reduziert das Risiko.' },
    ],
    relatedSlugs: ['hausarzt', 'internist'],
    relatedSymptoms: ['bauchschmerzen', 'brustschmerzen', 'husten'],
  },

  {
    slug: 'blut-im-stuhl',
    label: 'Blut im Stuhl',
    directAnswer: 'Blut im Stuhl muss IMMER ärztlich abgeklärt werden. Hellrotes Blut oder Schleimhaut-Blutung meist durch Hämorrhoiden oder Analfissuren – ansonsten Gastroenterologe (Darmspiegelung).',
    intro: `Blut im Stuhl kann harmlos sein (Hämorrhoiden, Analfissur) oder auf ernstere Erkrankungen hinweisen: chronische Darm-Entzündung (Colitis ulcerosa, Morbus Crohn), Divertikel, Polypen oder Darmkrebs. Regel: hellrot = eher tiefer Darm (nahe Anus), dunkel bis schwarz (Teerstuhl) = Blutung im oberen Verdauungstrakt (Magen, Zwölffingerdarm). Jede Blutung braucht Abklärung – Selbstdiagnose reicht nicht.`,
    whichDoctor: [
      { when: 'Erste Einschätzung', doctor: 'Hausarzt', slug: 'hausarzt' },
      { when: 'Darmspiegelung, chronische Blutungen', doctor: 'Internist / Gastroenterologe', slug: 'internist' },
      { when: 'Hämorrhoiden-Behandlung', doctor: 'Proktologe (Chirurg)', slug: 'chirurg' },
    ],
    emergency: {
      call112: 'Große Mengen Blut, Teerstuhl mit Kreislaufsymptomen (Schwindel, Herzrasen, Bewusstlosigkeit) – Verdacht auf schwere gastrointestinale Blutung.',
      call116117: 'Anhaltend blutiger Stuhl mit Bauchschmerzen außerhalb der Praxis-Öffnungszeiten.',
      note: 'Ab 50 (Männer) / 55 (Frauen) empfiehlt sich sowieso eine Vorsorge-Darmspiegelung – Blut im Stuhl ist ein zusätzlicher Grund.',
    },
    faqs: [
      { q: 'Hellrotes vs. schwarzes Blut – Bedeutung?', a: 'Hellrot: meist Blutung nahe Anus (Hämorrhoiden, Analfissur, Enddarm-Polyp). Dunkelrot: höher gelegen im Dickdarm. Schwarz/Teerstuhl (Meläna): Blutung im oberen Verdauungstrakt (Magen, Zwölffingerdarm) – Blut wird durch Magensäure schwarz. Alle Varianten sind ärztlich abklärungsbedürftig.' },
      { q: 'Sind Hämorrhoiden gefährlich?', a: 'Hämorrhoiden sind nicht gefährlich, aber häufig unangenehm. Sie sind erweitertes Gefäßgeflecht am After-Ausgang. Behandlung: Basis mit ballaststoffreicher Ernährung, ausreichend Trinken, keine Pressanstrengung; bei Bedarf lokal (Salben, Zäpfchen) oder proktologisch (Gummiband-Ligatur, OP). Wichtig: erst nach ärztlicher Diagnose selbst behandeln, damit ernstere Ursachen ausgeschlossen sind.' },
      { q: 'Ab wann Darmkrebs-Vorsorge?', a: 'Männer haben Anspruch auf eine kostenlose Vorsorge-Darmspiegelung ab dem 50. Lebensjahr, Frauen ab dem 55. Alternativ: jährlicher immunologischer Stuhltest (iFOBT). Bei familiärer Belastung (Darmkrebs bei Verwandtem ersten Grades unter 50) beginnt die Vorsorge 10 Jahre vor dem Alter des Betroffenen.' },
    ],
    relatedSlugs: ['hausarzt', 'internist', 'chirurg'],
    relatedSymptoms: ['bauchschmerzen', 'durchfall', 'gewichtsverlust'],
  },

  {
    slug: 'blut-im-urin',
    label: 'Blut im Urin',
    directAnswer: 'Blut im Urin (Hämaturie) muss immer urologisch oder hausärztlich abgeklärt werden – auch wenn es nur einmal auftritt. Häufigste Ursachen sind Harnwegsinfekte oder Nierensteine, aber Tumoren müssen ausgeschlossen werden.',
    intro: `Blut im Urin (Hämaturie) reicht von sichtbarer rötlicher Verfärbung bis zu mikroskopisch nachweisbaren Erythrozyten (Mikrohämaturie). Ursachen: Harnwegsinfekt, Nieren- oder Blasensteine, gutartige Nierentumoren, aber auch Blasenkrebs (v.a. bei Rauchern und Männern > 50). Auch nach starker körperlicher Belastung (Marathon) kann harmloses Blut im Urin auftreten. Selbst einmaliges Blut sollte immer ärztlich abgeklärt werden.`,
    whichDoctor: [
      { when: 'Der Facharzt-Zuständige', doctor: 'Urologe', slug: 'urologe' },
      { when: 'Erste Einschätzung, Urinstatus', doctor: 'Hausarzt', slug: 'hausarzt' },
    ],
    emergency: {
      call112: 'Massive Blutung mit Kreislaufsymptomen (Schwindel, Bewusstlosigkeit).',
      call116117: 'Blutiger Urin mit hohem Fieber und Flankenschmerz außerhalb der Öffnungszeiten (Pyelonephritis-Verdacht).',
      note: 'Auch einmaliges Blut im Urin nicht ignorieren, sondern innerhalb weniger Tage urologisch abklären lassen.',
    },
    faqs: [
      { q: 'Blut im Urin ohne Schmerzen – ist das schlimm?', a: 'Schmerzlose Hämaturie ist besonders abklärungsbedürftig, weil Blasenkrebs typischerweise schmerzlos blutet. Auch wenn das Blut nur einmal auftritt und dann verschwindet: urologische Untersuchung (Urinanalyse, Ultraschall, ggf. Zystoskopie) einholen.' },
      { q: 'Kann rote Bete den Urin rot färben?', a: 'Ja. Rote Bete, viel Rhabarber, bestimmte Medikamente (Rifampicin, Metronidazol) und Nahrungsmittelfarbstoffe können den Urin rot bis rötlich färben, ohne dass Blut enthalten ist. Bei Zweifel: Urin-Teststreifen (Apotheke) oder Hausarzt-Untersuchung klärt schnell.' },
      { q: 'Blasenentzündung – reicht die Apotheke?', a: 'Bei erstmaligem, unkompliziertem Harnwegsinfekt der Frau (Brennen, häufiger Harndrang, keine Blut, kein Fieber) kann kurzfristige Selbstbehandlung (viel Trinken, ggf. rezeptfreie Analgetika) einen leichten Verlauf abfangen. Bei Blut im Urin, Fieber, Flankenschmerz, Männern, Kindern, Schwangeren oder wiederkehrenden Infekten: immer ärztlich.' },
    ],
    relatedSlugs: ['urologe', 'hausarzt'],
    relatedSymptoms: ['flankenschmerzen', 'brennen-beim-wasserlassen'],
  },

  {
    slug: 'gelenkschmerzen',
    label: 'Gelenkschmerzen',
    directAnswer: 'Bei Gelenkschmerzen ist der Orthopäde der Facharzt. Bei Verdacht auf entzündliches Rheuma (mehrere kleine Gelenke, morgendliche Steife > 30 Min): Internist mit Schwerpunkt Rheumatologie.',
    intro: `Gelenkschmerzen können mechanisch (Verschleiß = Arthrose), entzündlich (Rheuma, Gicht) oder infektiös (bakterielle Gelenkentzündung) sein. Betroffene Gelenke, Symptomdauer, morgendliche Steife und Begleitsymptome (Fieber, Ausschlag, Augenreizung) geben Hinweise. Bei einzelnem stark geschwollenem, rotem, überwärmten Gelenk: Notfall (bakteriell?). Chronische Gelenkschmerzen gehören zum Orthopäden, mit Verdacht auf Rheuma zum Rheumatologen.`,
    whichDoctor: [
      { when: 'Klassische Anlaufstelle', doctor: 'Orthopäde', slug: 'orthopaede' },
      { when: 'Verdacht auf Rheuma / Autoimmun', doctor: 'Rheumatologe (Internist)', slug: 'internist' },
      { when: 'Erste Einschätzung', doctor: 'Hausarzt', slug: 'hausarzt' },
      { when: 'Kortison-Injektion, Nachsorge', doctor: 'Orthopäde', slug: 'orthopaede' },
    ],
    emergency: {
      call112: 'Selten – nur bei septischem Schock (Fieber, Kreislaufversagen mit Gelenkschwellung).',
      call116117: 'Akut stark geschwollenes, rotes, sehr schmerzhaftes Einzelgelenk mit Fieber außerhalb der Öffnungszeiten – Verdacht auf bakterielle Gelenkentzündung.',
      note: 'Rheumatoide Arthritis früh diagnostizieren und behandeln: Innerhalb der ersten 3 Monate begonnene Therapie verhindert Gelenkzerstörung – „window of opportunity".',
    },
    faqs: [
      { q: 'Arthrose oder Rheuma?', a: 'Arthrose: mechanischer Verschleiß, betrifft einzelne oder wenige Gelenke (Knie, Hüfte, Fingerendgelenke), Schmerz belastungsabhängig, keine ausgeprägte Morgensteife. Rheuma (rheumatoide Arthritis): entzündlich, oft symmetrisch, mehrere kleine Gelenke (Finger, Handgelenk), ausgeprägte Morgensteife > 30 Minuten, Blutwerte erhöht. Diagnostik durch Rheumatologen.' },
      { q: 'Was ist Gicht?', a: 'Gicht ist eine Stoffwechselstörung mit Harnsäure-Kristall-Ablagerung in Gelenken. Typisch: plötzlich stark schmerzhafte, gerötete, geschwollene Zehe (Großzehen-Grundgelenk) – „podagra". Auslöser: fleischreiche Ernährung, Alkohol. Behandlung: entzündungshemmende Medikamente akut, harnsäure-senkende Medikamente langfristig.' },
      { q: 'Wann in die Notaufnahme mit Gelenkschmerzen?', a: 'Bei einzelnem stark geschwollenem, rotem, überwärmten und sehr schmerzhaftem Gelenk mit Fieber – Verdacht auf bakterielle Gelenk-Entzündung (septische Arthritis). Ohne rechtzeitige antibiotische Therapie und Gelenkspülung droht Zerstörung.' },
    ],
    relatedSlugs: ['orthopaede', 'internist', 'hausarzt'],
    relatedSymptoms: ['rueckenschmerzen', 'knieschmerzen', 'schwellung'],
  },

  {
    slug: 'knieschmerzen',
    label: 'Knieschmerzen',
    directAnswer: 'Bei Knieschmerzen ist der Orthopäde die richtige Anlaufstelle. Bei akuter Verletzung mit Schwellung, Instabilität oder Bewegungseinschränkung möglichst zeitnah – ggf. Notaufnahme.',
    intro: `Knieschmerzen sind einer der häufigsten Vorstellungsgründe beim Orthopäden. Ursachen: Meniskus-Riss, Kreuzband-Verletzung, Arthrose (v.a. > 50 Jahre), Patella-Probleme („Läuferknie"), rheumatische Entzündungen, Kristall-Ablagerungen (Gicht/Pseudogicht). Nach einem Sturz oder Trauma mit Schwellung, hörbarem Knacken und Instabilität ist zeitnahe orthopädische Abklärung wichtig – oft mit MRT-Bildgebung.`,
    whichDoctor: [
      { when: 'Der Facharzt für Knie', doctor: 'Orthopäde', slug: 'orthopaede' },
      { when: 'Nach akuter Verletzung mit Instabilität', doctor: 'Orthopäde oder Unfallchirurgie (Notaufnahme)', slug: 'orthopaede' },
      { when: 'Physiotherapie nach Verordnung', doctor: 'Physiotherapeut', slug: 'physiotherapeut' },
    ],
    emergency: {
      call112: 'Bei offenem Bruch oder starker Blutung – 112.',
      call116117: 'Akuter Knieschmerz nach Sturz außerhalb der Öffnungszeiten.',
      note: 'PECH-Schema bei akuter Verletzung: Pause, Eis, Compression, Hochlagern – bis zur ärztlichen Vorstellung.',
    },
    faqs: [
      { q: 'Knieschmerzen ohne Verletzung – was kann das sein?', a: 'Häufig: Arthrose (v.a. > 50 Jahre), Meniskus-Degeneration, Patella-Probleme, Baker-Zyste, Gicht/Pseudogicht, Bursitis (Schleimbeutel-Entzündung), rheumatische Entzündung. Der Orthopäde klärt durch Anamnese, klinische Untersuchung, Röntgen und ggf. MRT.' },
      { q: 'Muss jeder Meniskus-Riss operiert werden?', a: 'Nein. Viele Meniskus-Läsionen, v.a. bei degenerativer Ursache (ältere Patienten), können konservativ mit Physiotherapie und Muskel-Aufbau behandelt werden. OP-Indikation: junge Patienten mit akuter traumatischer Ruptur, Einklemmungs-Erscheinungen („Gelenkblockade"), erhaltener Meniskus-Anteil. Entscheidung nach MRT und OP-Konsil.' },
      { q: 'Wann ein künstliches Kniegelenk?', a: 'Bei fortgeschrittener Arthrose mit erheblichem Leidensdruck, wenn konservative Therapie (Physiotherapie, Schmerzmittel, ggf. Injektionen) ausgeschöpft ist. Voraussetzungen: relevanter Radiologie-Befund und alltagsrelevante Einschränkung. Ein künstliches Kniegelenk hält 15–20 Jahre und ist eine der erfolgreichsten Operationen der modernen Medizin.' },
    ],
    relatedSlugs: ['orthopaede', 'physiotherapeut', 'chirurg'],
    relatedSymptoms: ['gelenkschmerzen', 'rueckenschmerzen', 'schwellung'],
  },

  {
    slug: 'herzstolpern',
    label: 'Herzstolpern und Herzrasen',
    directAnswer: 'Bei wiederkehrendem Herzstolpern oder Herzrasen ist der Kardiologe der Facharzt. Erste Einschätzung durch den Hausarzt mit EKG. Kombination mit Bewusstlosigkeit oder Brustschmerz: 112.',
    intro: `Extraschläge (Extrasystolen) und kurzes Herzrasen (Palpitationen) sind meist harmlos und kommen bei fast jedem gelegentlich vor – ausgelöst durch Stress, Koffein, Alkohol, Schlafmangel. Anhaltende Herzrhythmus-Störungen mit über 100 Schlägen/Min über längere Zeit (v.a. Vorhofflimmern) oder mit Bewusstseinsstörung sind aber ernst und erhöhen langfristig das Schlaganfall-Risiko. Kardiologische Abklärung mit EKG, ggf. Langzeit-EKG.`,
    whichDoctor: [
      { when: 'Erste EKG-Einschätzung', doctor: 'Hausarzt', slug: 'hausarzt' },
      { when: 'Wiederkehrend, mit Symptomen', doctor: 'Kardiologe', slug: 'kardiologe' },
      { when: 'Bei Bewusstlosigkeit oder Brustschmerz', doctor: 'Notruf 112', slug: null },
    ],
    emergency: {
      call112: 'Herzrasen mit Bewusstseinsverlust, Brustschmerz, starker Atemnot oder Kollaps.',
      call116117: 'Anhaltend schnellem Herzschlag (>150/Min) ohne Notfall-Zeichen außerhalb der Öffnungszeiten.',
      note: 'Vorhofflimmern erhöht das Schlaganfall-Risiko um Faktor 5 – deshalb wichtig, es zu erkennen und ggf. mit Blutverdünner zu behandeln.',
    },
    faqs: [
      { q: 'Sind Extraschläge gefährlich?', a: 'Vereinzelte Extraschläge sind in aller Regel harmlos, kommen bei fast allen Menschen gelegentlich vor. Sind sie sehr häufig (>10 % aller Schläge im Langzeit-EKG) oder treten in Salven auf, ist kardiologische Abklärung ratsam, um strukturelle Herzerkrankungen auszuschließen.' },
      { q: 'Was ist Vorhofflimmern?', a: 'Die häufigste dauerhafte Herzrhythmus-Störung mit unregelmäßigem, oft schnellem Herzschlag. Betrifft etwa 2 % der Erwachsenen, ab 65 Jahren steigend. Symptome variabel (von symptomlos bis Herzrasen, Atemnot, Schwindel). Wichtig: erhöht das Schlaganfall-Risiko – ggf. Blutverdünner nötig. Diagnostik durch EKG und Langzeit-EKG.' },
      { q: 'Wie fühlt sich Herzrasen an?', a: 'Palpitationen können als Klopfen, Rasen, Stolpern, „Salto" in der Brust oder im Hals wahrgenommen werden. Die subjektive Wahrnehmung sagt wenig über die Gefährlichkeit aus – deshalb bei wiederkehrenden Beschwerden EKG. Ein tragbares Puls-Messgerät (z. B. Smartwatch mit EKG-Funktion) kann helfen, den Moment einzufangen.' },
    ],
    relatedSlugs: ['kardiologe', 'hausarzt'],
    relatedSymptoms: ['brustschmerzen', 'schwindel', 'atemnot'],
  },

  {
    slug: 'tinnitus',
    label: 'Tinnitus (Ohrgeräusche)',
    directAnswer: 'Bei Tinnitus ist der HNO-Arzt der Facharzt. Ein akuter Tinnitus (v.a. mit Hörminderung) sollte innerhalb weniger Tage abgeklärt werden – als Zeichen eines möglichen Hörsturzes.',
    intro: `Tinnitus ist die subjektive Wahrnehmung eines Ohrgeräuschs (Pfeifen, Rauschen, Brummen) ohne äußere Schallquelle. Etwa 10–15 % der Bevölkerung leiden zeitweise darunter, 3 % chronisch. Ursachen: Lärmschäden, altersbedingter Hörverlust, Hörsturz, Verspannungen, Kiefergelenks-Störung, Medikamente, seltener Hirntumore. Akuter Tinnitus (< 3 Monate) ist oft behandelbar – chronischer wird durch Habituation und Coping-Strategien handhabbar.`,
    whichDoctor: [
      { when: 'Der Facharzt-Zuständige', doctor: 'HNO-Arzt', slug: 'hno-arzt' },
      { when: 'Chronische Belastungsformen mit psychischem Leidensdruck', doctor: 'Psychotherapeut (Tinnitus-Retraining)', slug: 'psychotherapeut' },
    ],
    emergency: {
      call112: 'Nicht relevant.',
      call116117: 'Nicht typisch.',
      note: 'Akuter Tinnitus mit einseitiger Hörminderung: HNO-ärztliche Vorstellung innerhalb weniger Tage – Verdacht auf Hörsturz, der frühzeitig behandelt bessere Chancen hat.',
    },
    faqs: [
      { q: 'Ist Tinnitus heilbar?', a: 'Akuter Tinnitus (< 3 Monate) kann durch Behandlung der Ursache (Hörsturz-Therapie, Entlastung des Kiefers, Ende der Lärm-Belastung) verschwinden. Chronischer Tinnitus (> 6 Monate) ist meist nicht mehr rückgängig zu machen – aber durch Gewöhnung (Habituation), Tinnitus-Retraining und ggf. Hörgeräte deutlich in der Belastung reduzierbar.' },
      { q: 'Machen Kopfhörer Tinnitus?', a: 'Zu laute Musik über Kopfhörer schädigt die Haarzellen im Innenohr – dauerhaft. Faustregel: 60/60-Regel (max. 60 Minuten bei 60 % Lautstärke). Bei starkem Lärm (Konzerte, Baustelle) Gehörschutz nutzen.' },
      { q: 'Was ist ein Tinnitus-Retraining?', a: 'Kognitiv-verhaltenstherapeutisches Verfahren zur Umgewöhnung des Gehirns: Das Ohrgeräusch wird über Zeit als „nicht bedrohlich" gelernt, tritt in den Hintergrund und stört weniger. Kombiniert mit Beratung, Entspannungstechniken und ggf. Rausch-Generator. Kassenleistung, wird von spezialisierten HNO-Praxen und Kliniken angeboten.' },
    ],
    relatedSlugs: ['hno-arzt', 'psychotherapeut'],
    relatedSymptoms: ['ohrenschmerzen', 'schwindel', 'kopfschmerzen'],
  },
];

export function symptomBySlug(slug) {
  return SYMPTOMS.find((s) => s.slug === slug) || null;
}
