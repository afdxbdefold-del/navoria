// Magazin-Artikel: aktuelle, gut recherchierte Themen mit Alltagsbezug.
// Schreibstil: nüchtern, konkret, Alltagsbeispiele, kein KI-Vibe, keine langen Bindestriche.
// Struktur pro Artikel: hero, lead, sections[], faqs[], sources[]
//
// Kategorien: vorsorge, herz-kreislauf, orthopaedie, hno, kinder, psyche, magen-darm, haut, allgemein

export const CATEGORIES = [
  { slug: 'vorsorge', label: 'Vorsorge', description: 'Was die Kasse zahlt, was sinnvoll ist, wann.' },
  { slug: 'herz-kreislauf', label: 'Herz & Kreislauf', description: 'Blutdruck, Herzrhythmus, Cholesterin und Co.' },
  { slug: 'orthopaedie', label: 'Rücken & Gelenke', description: 'Rücken, Nacken, Knie, Hüfte, Bandscheibe.' },
  { slug: 'psyche', label: 'Psyche & Schlaf', description: 'Stress, Depression, Schlafprobleme, Therapieplatz.' },
  { slug: 'kinder', label: 'Kinder & Familie', description: 'U-Untersuchungen, Fieber, Impfen, Kinderkrankheiten.' },
  { slug: 'hno', label: 'HNO & Atemwege', description: 'Erkältung, Grippe, Nebenhöhlen, Ohren, Kehlkopf.' },
  { slug: 'magen-darm', label: 'Magen & Darm', description: 'Reflux, Reizdarm, Vorsorge-Koloskopie.' },
  { slug: 'haut', label: 'Haut & Vorsorge', description: 'Hautkrebs, Allergien, Neurodermitis.' },
];

export const MAGAZINE_ARTICLES = [
  // 1
  {
    slug: 'rueckenschmerzen-homeoffice',
    title: 'Rückenschmerzen im Homeoffice: was wirklich hilft',
    lead: 'Wer den ganzen Tag am Laptop sitzt, kennt es: irgendwann zieht es zwischen den Schulterblättern, der untere Rücken meldet sich, der Nacken wird steif. Meistens ist die Ursache banal. Und meistens hilft weder das teure Kissen noch die Rückenschule.',
    category: 'orthopaedie',
    tags: ['Rückenschmerzen', 'Homeoffice', 'Ergonomie', 'Physiotherapie'],
    readingMinutes: 6,
    publishedAt: '2026-02-01',
    updatedAt: '2026-02-01',
    heroIcon: 'activity',
    heroGradient: 'from-sky-500 to-teal-500',
    heroImage: 'https://images.unsplash.com/photo-1589362281138-e3f7ebe47f1a?auto=format&fit=crop&w=1600&q=80',
    heroImageAlt: 'Person am Laptop-Schreibtisch im Homeoffice',
    relatedSpecialties: ['orthopaede', 'physiotherapeut', 'hausarzt'],
    sections: [
      { type: 'paragraph', text: 'Rund 80 Prozent aller Erwachsenen in Deutschland haben mindestens einmal im Leben Rückenschmerzen. In den meisten Fällen ist die Ursache muskulär und die Beschwerden verschwinden nach zwei bis sechs Wochen von selbst. Was zählt, ist das richtige Verhalten in dieser Zeit.' },
      { type: 'heading', level: 2, text: 'Warum das Homeoffice besonders belastet' },
      { type: 'paragraph', text: 'Der klassische Bürostuhl im Firmenoffice ist meistens auf den Körper eingestellt. Zuhause wird stattdessen der Küchenstuhl oder das Sofa genutzt, der Laptop steht zu tief, die Schultern hochgezogen. Nach ein paar Wochen macht sich das bemerkbar. Verstärkt wird das durch weniger Bewegung, weil der Weg zur Bahn und die Treppen im Bürogebäude wegfallen.' },
      { type: 'heading', level: 2, text: 'Die drei häufigsten Beschwerdebilder' },
      {
        type: 'list',
        items: [
          'Nacken-Schulter-Bereich: Verspannung durch stundenlanges Fixieren des Bildschirms in leicht gebeugter Haltung.',
          'Lendenwirbelsäule: Muskuläres Ungleichgewicht durch dauerhaftes Sitzen ohne Wechsel der Position.',
          'Ischialgie-artige Beschwerden: ausstrahlend ins Gesäß und Bein, meist ohne echten Bandscheibenvorfall.',
        ],
      },
      { type: 'heading', level: 2, text: 'Was in den ersten Tagen hilft' },
      { type: 'paragraph', text: 'Bei einem akuten Kreuzschmerz gilt nicht mehr die alte Bettruhe-Empfehlung. Aktuelle Leitlinien der Deutschen Gesellschaft für Orthopädie und Unfallchirurgie raten ausdrücklich zu leichter Bewegung und dem Beibehalten des Alltags. Wärme (Wärmflasche, Kirschkernkissen) und ein rezeptfreies Schmerzmittel wie Ibuprofen 400 für zwei bis drei Tage sind gute Erstmaßnahmen. Wichtig: keine Steigerung über die zugelassenen Dosen und nicht länger als drei Tage in Folge ohne Rücksprache mit dem Hausarzt.' },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Wann Sie doch zum Arzt sollten',
        text: 'Wenn Taubheit im Bein oder Fuß, Kraftverlust, Blasen- oder Mastdarmstörungen, Fieber oder ein starker Gewichtsverlust dazukommen, ist ein zeitnaher Arzttermin nötig. Auch nach vier Wochen unveränderter Schmerzen lohnt sich eine Abklärung beim Hausarzt oder Orthopäden.',
      },
      { type: 'heading', level: 2, text: 'Was langfristig etwas bringt' },
      { type: 'paragraph', text: 'Rückenschmerz-Studien zeigen recht deutlich, was funktioniert und was nicht. Deutlich wirksam sind: regelmäßige Bewegung mit Kräftigung der Rumpfmuskulatur (Walking, Radfahren, Schwimmen, gezieltes Krafttraining), zwei bis drei kurze Aufsteh-Pausen pro Stunde am Schreibtisch und ein ergonomisch eingerichteter Arbeitsplatz. Weniger klar ist die Evidenz für Massagen, Rückenkissen oder spezielle Matratzen; sie können angenehm sein, ersetzen aber keine Bewegung.' },
      { type: 'heading', level: 2, text: 'Der Arbeitsplatz zuhause in fünf Punkten' },
      {
        type: 'list',
        items: [
          'Bildschirm-Oberkante etwa auf Augenhöhe, Abstand rund 60 cm zum Kopf.',
          'Oberarme senkrecht, Unterarme parallel zur Tischplatte, Handgelenke gerade.',
          'Sitzhöhe so einstellen, dass die Oberschenkel leicht abfallen und die Füße flach stehen.',
          'Wechsel zwischen Sitzen und Stehen, wenn möglich mit einem höhenverstellbaren Tisch.',
          'Bewusst mehrfach pro Stunde die Position wechseln, aufstehen, gehen, dehnen.',
        ],
      },
    ],
    faqs: [
      { q: 'Wann sollte ich ein MRT machen lassen?', a: 'Bei einfachem Kreuzschmerz ohne begleitende neurologische Symptome ist ein MRT in den ersten sechs Wochen nicht sinnvoll. Es zeigt bei fast allen Erwachsenen altersbedingte Veränderungen, die mit den Beschwerden nichts zu tun haben. Ein MRT ist bei Verdacht auf einen echten Bandscheibenvorfall mit Ausfallerscheinungen oder bei anhaltenden Beschwerden nach konservativer Therapie sinnvoll.' },
      { q: 'Wie schnell bekomme ich Physiotherapie?', a: 'Nach einer Verordnung durch den Haus- oder Facharzt beginnt die Physiotherapie meist innerhalb von zwei bis drei Wochen. In ländlichen Regionen kann die Wartezeit länger sein. Bei einer akuten Verordnung mit dem Vermerk „vorrangig zu versorgen" muss die Praxis Sie priorisiert aufnehmen.' },
      { q: 'Sind Rückenschulen von der Kasse bezahlt?', a: 'Ja, die meisten gesetzlichen Krankenkassen erstatten Präventionskurse nach Paragraph 20 SGB V, wenn diese von zertifizierten Anbietern angeboten werden. In der Regel werden 75 bis 100 Prozent der Kosten für zwei Kurse pro Jahr übernommen.' },
    ],
    sources: [
      'Nationale Versorgungsleitlinie Nicht-spezifischer Kreuzschmerz (2. Auflage, 2017, gültig)',
      'Bertelsmann-Stiftung: Faktencheck Rücken (2016)',
      'IQWiG-Gesundheitsinformation zu Rückenschmerzen',
    ],
  },

  // 2
  {
    slug: 'migraene-oder-spannungskopfschmerz',
    title: 'Kopfweh: Migräne oder Spannungskopfschmerz?',
    lead: 'Fast jeder hat mal Kopfschmerzen. Was viele nicht wissen: Migräne und Spannungskopfschmerz sind zwei ganz unterschiedliche Krankheitsbilder und werden auch unterschiedlich behandelt. Wer die eigenen Attacken einordnen kann, spart sich viele erfolglose Tabletten.',
    category: 'psyche',
    tags: ['Kopfschmerz', 'Migräne', 'Neurologie'],
    readingMinutes: 7,
    publishedAt: '2026-01-28',
    updatedAt: '2026-01-28',
    heroIcon: 'brain',
    heroGradient: 'from-indigo-500 to-sky-500',
    heroImage: 'https://images.unsplash.com/photo-1646433877623-5652622b515b?auto=format&fit=crop&w=1600&q=80',
    heroImageAlt: 'Frau hält sich die Schläfen bei Kopfschmerzen',
    relatedSpecialties: ['neurologe', 'hausarzt'],
    sections: [
      { type: 'paragraph', text: 'In Deutschland leiden nach Angaben der Deutschen Migräne- und Kopfschmerzgesellschaft rund 8 Millionen Menschen unter Migräne. Der Spannungskopfschmerz ist noch häufiger; er trifft irgendwann fast jeden. Beide Formen lassen sich meist gut auseinanderhalten, wenn man auf die Details achtet.' },
      { type: 'heading', level: 2, text: 'Der Unterschied im Alltag' },
      { type: 'paragraph', text: 'Ein Spannungskopfschmerz fühlt sich dumpf und drückend an, meist beidseitig, oft wie ein zu enger Helm oder ein Band um den Kopf. Die Intensität ist leicht bis mittel. Man kann in der Regel weiter arbeiten. Bewegung macht die Beschwerden nicht schlimmer. Übelkeit tritt kaum auf.' },
      { type: 'paragraph', text: 'Eine Migräne dagegen ist pulsierend, oft einseitig, mittel bis stark. Bewegung verstärkt den Schmerz. Licht, Geräusche und manchmal auch Gerüche werden unangenehm. Übelkeit, teils Erbrechen, gehören häufig dazu. Eine Attacke dauert unbehandelt vier Stunden bis drei Tage. Bei rund einem Drittel der Betroffenen kündigt sich eine Migräne mit einer Aura an: Sehstörungen, Flimmern, seltener Kribbeln in Arm oder Gesicht.' },
      {
        type: 'callout',
        tone: 'info',
        title: 'Kopfschmerz-Tagebuch führen',
        text: 'Notieren Sie über vier Wochen jede Kopfschmerz-Attacke: Zeitpunkt, Dauer, Stärke (Skala 0 bis 10), begleitende Symptome, mögliche Auslöser (Schlafmangel, Menstruation, Wetterwechsel, bestimmte Lebensmittel), eingenommene Medikamente. Diese Aufzeichnung ist beim Neurologen viel wert und beschleunigt die richtige Diagnose.',
      },
      { type: 'heading', level: 2, text: 'Was in der akuten Attacke hilft' },
      { type: 'paragraph', text: 'Beim Spannungskopfschmerz genügen häufig Ibuprofen 400 mg oder Paracetamol 1000 mg, Bewegung an der frischen Luft und ein Glas Wasser. Wichtig: nicht mehr als 10 Tage pro Monat, sonst droht der Medikamenten-Übergebrauchs-Kopfschmerz.' },
      { type: 'paragraph', text: 'Bei Migräne wirken normale Schmerzmittel oft nicht ausreichend. Die Standardtherapie sind sogenannte Triptane (etwa Sumatriptan, Rizatriptan). Sie greifen gezielt an den Serotonin-Rezeptoren an und stoppen die Attacke, wenn sie früh genug eingenommen werden. Triptane sind seit 2022 in reduzierter Dosis rezeptfrei in der Apotheke erhältlich, sollten aber vorher einmal ärztlich abgeklärt werden.' },
      { type: 'heading', level: 2, text: 'Prophylaxe: wann und wie' },
      { type: 'paragraph', text: 'Wer mehr als drei bis vier Migräne-Attacken pro Monat hat oder deren Attacken über 48 Stunden dauern, sollte über eine medikamentöse Prophylaxe nachdenken. Wirksam sind unter anderem Betablocker, Topiramat, Amitriptylin und seit 2019 die CGRP-Antikörper (Erenumab, Fremanezumab, Galcanezumab). Nicht-medikamentös helfen Ausdauertraining, Entspannungsverfahren wie progressive Muskelrelaxation, geregelter Schlaf und Vermeidung individueller Auslöser.' },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Wann sofort abklären',
        text: 'Ein plötzlich einsetzender, extrem starker Kopfschmerz („Vernichtungskopfschmerz"), Kopfschmerz mit Nackensteife und Fieber, Kopfschmerz nach Kopfverletzung oder mit neurologischen Ausfällen (Lähmung, Sprachstörung, plötzliche Sehstörung) ist keine normale Attacke. In diesen Fällen 112 wählen oder direkt in die Notaufnahme.',
      },
    ],
    faqs: [
      { q: 'Kann man Migräne heilen?', a: 'Migräne ist eine chronische Erkrankung, die derzeit nicht heilbar ist. Aber sie lässt sich gut behandeln. Bei vielen Betroffenen werden die Attacken mit den richtigen Medikamenten und Lebensstil-Maßnahmen deutlich seltener und schwächer. Bei Frauen bessert sich die Migräne oft nach den Wechseljahren.' },
      { q: 'Wann zum Neurologen statt zum Hausarzt?', a: 'Bei häufigen oder schweren Attacken, bei ungewöhnlichem Verlauf, bei erstmalig auftretendem starken Kopfschmerz oder wenn die Standardtherapie nicht ausreicht. Zur ersten Einschätzung reicht meist der Hausarzt.' },
      { q: 'Was ist ein Medikamenten-Übergebrauchs-Kopfschmerz?', a: 'Wer an mehr als 10 bis 15 Tagen pro Monat Schmerzmittel gegen Kopfschmerzen nimmt, riskiert einen Dauerkopfschmerz, der durch die Medikamente selbst ausgelöst wird. Die einzige wirksame Therapie ist ein kompletter Entzug über sieben bis 14 Tage, oft in ärztlicher Begleitung.' },
    ],
    sources: [
      'Leitlinie „Therapie der Migräneattacke und Prophylaxe der Migräne" der DMKG (Stand 2022)',
      'DGN-S1-Leitlinie „Kopfschmerz vom Spannungstyp"',
    ],
  },

  // 3
  {
    slug: 'check-up-35',
    title: 'Der Check-up 35: was die Kasse wirklich zahlt',
    lead: 'Alle drei Jahre steht sie an, die Gesundheitsuntersuchung für gesetzlich Versicherte ab 35. Klingt sinnvoll und ist es meistens auch. Trotzdem nutzen weniger als die Hälfte der Berechtigten das Angebot. Ein nüchterner Blick auf das, was drinsteckt.',
    category: 'vorsorge',
    tags: ['Check-up 35', 'Vorsorge', 'GKV', 'Hausarzt'],
    readingMinutes: 5,
    publishedAt: '2026-01-25',
    updatedAt: '2026-01-25',
    heroIcon: 'shield-check',
    heroGradient: 'from-teal-500 to-emerald-500',
    heroImage: 'https://images.unsplash.com/photo-1631815587646-b85a1bb027e1?auto=format&fit=crop&w=1600&q=80',
    heroImageAlt: 'Blutdruckmessung beim Hausarzt, Motiv für Vorsorgeuntersuchung',
    relatedSpecialties: ['hausarzt', 'internist'],
    sections: [
      { type: 'paragraph', text: 'Der Check-up 35 ist eine Kassenleistung. Gesetzlich Versicherte haben ab dem 35. Lebensjahr alle drei Jahre Anspruch auf diese Untersuchung, davor einmalig zwischen 18 und 35. Ziel ist die Früherkennung von Herz-Kreislauf-Erkrankungen, Diabetes, Nierenerkrankungen und seit 2021 auch von Hepatitis B und C.' },
      { type: 'heading', level: 2, text: 'Was passiert beim Termin' },
      { type: 'paragraph', text: 'Die Untersuchung dauert meistens 30 bis 45 Minuten. Der Hausarzt oder Internist führt zunächst ein Gespräch über Vorerkrankungen, Familienanamnese, Rauchen, Alkohol, Bewegung und Ernährung. Danach folgt eine körperliche Untersuchung mit Blutdruck, Herz, Lunge, Bauch, Reflexen und Puls. Es wird Blut abgenommen (Gesamtcholesterin, Blutzucker nüchtern), Urin abgegeben (Eiweiß, Glukose, Nitrit), und einmal im Leben wird das Blut auf Hepatitis B und C getestet.' },
      { type: 'heading', level: 2, text: 'Was NICHT im Check-up enthalten ist' },
      {
        type: 'list',
        items: [
          'Ein großes Blutbild mit Leber-, Nieren- und Schilddrüsenwerten (das ist Individuelle Gesundheitsleistung, IGeL)',
          'Bauch-Ultraschall',
          'EKG (nur bei konkretem Verdacht kassenübernommen)',
          'PSA-Wert bei Männern',
          'Vitamin-D-Bestimmung',
        ],
      },
      { type: 'paragraph', text: 'Viele Praxen bieten diese zusätzlichen Leistungen als IGeL an, oft in Paketen ab 40 bis 150 Euro. Ob sich das lohnt, hängt vom individuellen Risikoprofil ab. Wer familiär belastet ist oder konkrete Beschwerden hat, bekommt gezielte Untersuchungen meist auch auf Kassenkosten.' },
      {
        type: 'callout',
        tone: 'info',
        title: 'Tipp für den Termin',
        text: 'Kommen Sie nüchtern (mindestens 8 Stunden vor der Blutabnahme nichts essen, klares Wasser ist erlaubt). Bringen Sie eine Liste Ihrer aktuellen Medikamente mit sowie den Impfpass. Viele Praxen kombinieren den Check-up mit einer Impfstatus-Kontrolle und einer Auffrischung, wenn nötig.',
      },
      { type: 'heading', level: 2, text: 'Was bringt der Check-up wirklich' },
      { type: 'paragraph', text: 'Die Studienlage zu Gesundheits-Checks bei symptomfreien Erwachsenen ist gemischt. Eine große Cochrane-Übersicht aus 2019 fand keinen Effekt auf die Gesamtsterblichkeit. Trotzdem ist der Check sinnvoll: Bluthochdruck, erhöhter Blutzucker und ein Nierenschaden verlaufen anfangs symptomlos und sind dann besonders gut behandelbar. Wer Bluthochdruck erst nach dem Schlaganfall entdeckt, hat mehr verloren als ein paar Tabletten pro Tag.' },
      { type: 'heading', level: 2, text: 'Andere Vorsorge, die parallel läuft' },
      {
        type: 'list',
        items: [
          'Hautkrebs-Screening: ab 35 alle zwei Jahre beim Haus- oder Hautarzt',
          'Darmkrebs-Screening: ab 50 (Männer) bzw. 55 (Frauen) Koloskopie oder jährlicher iFOBT',
          'Prostata-Untersuchung: ab 45 einmal jährlich, Männer',
          'Zervix-Karzinom-Screening: Frauen ab 20 jährlich, ab 35 alle drei Jahre HPV-Test',
          'Brustkrebs-Screening: Frauen von 50 bis 75 alle zwei Jahre Mammographie',
        ],
      },
    ],
    faqs: [
      { q: 'Muss ich zum Check-up nüchtern kommen?', a: 'Ja, für die Blutzuckermessung und die Cholesterinbestimmung ist Nüchternheit erforderlich, üblich sind 8 bis 12 Stunden ohne Essen. Klares Wasser und die morgendlichen Medikamente sind meist erlaubt, im Zweifel in der Praxis nachfragen.' },
      { q: 'Was passiert bei auffälligen Werten?', a: 'Der Arzt bespricht die Ergebnisse mit Ihnen und plant weitere Schritte. Ein leicht erhöhter Blutdruck wird meist erst über mehrere Messungen und ggf. Langzeitblutdruck-Messung bestätigt, bevor Medikamente ins Spiel kommen. Auffällige Blutzuckerwerte werden mit einem Nüchternwert und HbA1c weiter abgeklärt.' },
      { q: 'Ist der Check-up bei Privatversicherten anders?', a: 'Privatversicherte haben in der Regel deutlich umfangreichere Vorsorge-Angebote (großes Blutbild, EKG, Ultraschall) und können den Termin öfter wahrnehmen. Die genauen Leistungen richten sich nach dem individuellen Tarif.' },
    ],
    sources: [
      'G-BA Richtlinie zur Gesundheitsuntersuchung (aktuelle Fassung)',
      'Kassenärztliche Bundesvereinigung (KBV): Check-up 35',
    ],
  },

  // 4
  {
    slug: 'hautkrebs-screening-ab-wann',
    title: 'Hautkrebs-Screening: ab wann es sich wirklich lohnt',
    lead: 'Die Zahl der Hautkrebsdiagnosen steigt seit Jahren. Malignes Melanom, Basaliom, Spinaliom: klingt alles bedrohlich, ist es teils auch. Trotzdem gehen viele Menschen erst dann zum Hautarzt, wenn schon etwas passiert ist. Dabei bekommt man die Kontrolle geschenkt.',
    category: 'haut',
    tags: ['Hautkrebs', 'Screening', 'Dermatologie', 'Vorsorge'],
    readingMinutes: 5,
    publishedAt: '2026-01-20',
    updatedAt: '2026-01-20',
    heroIcon: 'sun',
    heroGradient: 'from-amber-500 to-orange-500',
    heroImage: 'https://images.unsplash.com/photo-1474888505161-1ace11ae3d81?auto=format&fit=crop&w=1600&q=80',
    heroImageAlt: 'Sonne auf Haut, Motiv für Hautkrebs-Vorsorge',
    relatedSpecialties: ['hautarzt', 'hausarzt'],
    sections: [
      { type: 'paragraph', text: 'Ab dem 35. Lebensjahr haben gesetzlich Versicherte in Deutschland alle zwei Jahre Anspruch auf ein kostenfreies Hautkrebs-Screening. Das Robert-Koch-Institut schätzt, dass jedes Jahr rund 240.000 Menschen neu an weißem Hautkrebs erkranken, dazu etwa 23.000 am gefährlicheren malignen Melanom.' },
      { type: 'heading', level: 2, text: 'So läuft die Untersuchung ab' },
      { type: 'paragraph', text: 'Das Screening dauert etwa 10 bis 20 Minuten. Der geschulte Arzt (Haus- oder Hautarzt, mit entsprechender Fortbildung) inspiziert die gesamte Haut von Kopf bis Fuß, inklusive Kopfhaut, Ohren, Zehenzwischenräumen und je nach Bedarf auch der Genitalregion. Zum Einsatz kommt oft ein Dermatoskop, ein Auflichtmikroskop, das die Struktur der Muttermale genauer zeigt.' },
      {
        type: 'callout',
        tone: 'info',
        title: 'Wer sollte früher hin',
        text: 'Wer viele Muttermale hat (mehr als 40), einen sehr hellen Hauttyp, familiäre Belastung mit Melanom oder in der Kindheit häufige Sonnenbrände, sollte nicht bis 35 warten. Viele Kassen bieten das Screening bereits ab 20 als Zusatzleistung an, fragen Sie bei Ihrer Kasse nach.',
      },
      { type: 'heading', level: 2, text: 'Die ABCDE-Regel für den Selbst-Check' },
      {
        type: 'list',
        items: [
          'A wie Asymmetrie: ein Muttermal, das nicht gleichmäßig rund ist',
          'B wie Begrenzung: unscharfe, ausgefranste Ränder',
          'C wie Colour (Farbe): unterschiedliche Farbtöne im selben Fleck',
          'D wie Durchmesser: größer als 5 Millimeter',
          'E wie Entwicklung: verändert sich in Größe, Farbe oder Höhe',
        ],
      },
      { type: 'paragraph', text: 'Trifft eines dieser Kriterien zu, gehört das Muttermal in fachliche Hände. Das gilt auch für Stellen, die jucken, bluten oder nach Wochen nicht abheilen.' },
      { type: 'heading', level: 2, text: 'Was tun bei Auffälligkeiten' },
      { type: 'paragraph', text: 'Verdächtige Muttermale werden meist ambulant in Lokalanästhesie herausgeschnitten und zur histologischen Untersuchung eingeschickt. Die Kosten übernimmt die Krankenkasse. Handelt es sich um weißen Hautkrebs, reicht in vielen Fällen die vollständige Entfernung. Beim malignen Melanom sind die Heilungschancen sehr gut, wenn es früh und mit ausreichendem Sicherheitsabstand entfernt wird.' },
      { type: 'heading', level: 2, text: 'Was das Screening nicht leistet' },
      { type: 'paragraph', text: 'Zwischen zwei Terminen können neue Muttermale entstehen oder sich vorhandene verändern. Der Selbstcheck einmal pro Monat vor dem Spiegel ergänzt das ärztliche Screening. Und: der beste Schutz bleibt die Vorbeugung mit Sonnencreme, Kopfbedeckung, Meiden der Mittagssonne und ausdrücklich kein Solarium.' },
    ],
    faqs: [
      { q: 'Zahlt die Kasse Auflichtmikroskopie einzelner Muttermale?', a: 'Als Bestandteil des regulären Screenings ist die Untersuchung ohne Zusatzkosten. Wird die Auflichtmikroskopie einzelner Muttermale zusätzlich zwischen den Screening-Terminen gewünscht, gilt sie oft als IGeL-Leistung; die Kosten liegen bei 20 bis 40 Euro.' },
      { q: 'Wie lange dauert das Ergebnis nach einer Muttermal-Entfernung?', a: 'Die histologische Aufarbeitung nimmt in der Regel 5 bis 10 Werktage in Anspruch. Bei dringendem Verdacht können Praxen einen Eil-Befund anfordern, dann liegt das Ergebnis nach 2 bis 3 Tagen vor.' },
      { q: 'Muss man auch als Kind zum Hautarzt?', a: 'Kinder brauchen kein regelmäßiges Screening. Bei sehr vielen Muttermalen, familiärer Belastung oder einem einzelnen auffälligen Fleck lohnt sich ein Termin. Sonnenschutz ist im Kindesalter besonders wichtig, weil schwere Sonnenbrände in den ersten Lebensjahrzehnten das spätere Hautkrebsrisiko deutlich erhöhen.' },
    ],
    sources: [
      'Robert-Koch-Institut: Krebs in Deutschland (aktueller Berichtsband)',
      'Arbeitsgemeinschaft Dermatologische Prävention (ADP)',
    ],
  },

  // 5
  {
    slug: 'schlecht-schlafen-wann-arzt',
    title: 'Schlecht schlafen: wann sollte man zum Arzt?',
    lead: 'Fast jeder hat mal eine schlechte Nacht. Wer aber über Wochen kaum in den Schlaf findet oder morgens völlig gerädert aufwacht, sollte das nicht wegdrücken. Schlafprobleme sind ein häufiger und ernst zu nehmender Grund für einen Arztbesuch.',
    category: 'psyche',
    tags: ['Schlaf', 'Insomnie', 'Schlafapnoe', 'Psyche'],
    readingMinutes: 6,
    publishedAt: '2026-01-18',
    updatedAt: '2026-01-18',
    heroIcon: 'moon',
    heroGradient: 'from-indigo-600 to-purple-600',
    heroImage: 'https://images.unsplash.com/photo-1585532292129-5e791e89553c?auto=format&fit=crop&w=1600&q=80',
    heroImageAlt: 'Person wach im Bett bei Nacht, Motiv für Schlafstörungen',
    relatedSpecialties: ['hausarzt', 'neurologe', 'hno-arzt', 'psychiater'],
    sections: [
      { type: 'paragraph', text: 'Nach Daten der DAK-Gesundheit klagen rund 80 Prozent der Berufstätigen in Deutschland gelegentlich über schlechten Schlaf. Bei etwa 10 Prozent liegt eine behandlungsbedürftige Schlafstörung vor. Die häufigsten Formen sind die Insomnie (Ein- und Durchschlafstörung) und das obstruktive Schlafapnoe-Syndrom.' },
      { type: 'heading', level: 2, text: 'Wann ist der Schlaf ein Problem' },
      { type: 'paragraph', text: 'Als behandlungsbedürftige Insomnie gilt, wenn an mindestens drei Nächten pro Woche für mehr als drei Monate der Schlaf gestört ist und das Wohlbefinden am Tag darunter leidet. Wer nach einer stressigen Woche mal eine Nacht wach liegt, ist noch weit davon entfernt.' },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Diese Warnzeichen sind kein Zufall',
        text: 'Wer nachts laut und unregelmäßig schnarcht, mit Atemaussetzern, morgens wie gerädert aufwacht und tagsüber am Steuer fast einschläft, hat vermutlich eine Schlafapnoe. Das ist keine Bagatelle: Unbehandelt steigt das Risiko für Bluthochdruck, Herzinfarkt und Schlaganfall deutlich.',
      },
      { type: 'heading', level: 2, text: 'Erste Anlaufstelle: der Hausarzt' },
      { type: 'paragraph', text: 'Der Hausarzt klärt die häufigsten Ursachen ab: Depression, Angststörung, chronischer Schmerz, unruhige Beine (Restless Legs), Blutdruckentgleisungen oder Wechseljahresbeschwerden. Auch Alkohol, Koffein am Abend und Medikamente können den Schlaf empfindlich stören. Der klassische Griff zu Schlaftabletten (Benzodiazepine, Z-Substanzen) ist meist die schlechteste Lösung: nach zwei bis vier Wochen droht Abhängigkeit.' },
      { type: 'heading', level: 2, text: 'Kognitive Verhaltenstherapie ist erste Wahl' },
      { type: 'paragraph', text: 'Für die Insomnie ist die kognitive Verhaltenstherapie (KVT-I) laut Leitlinie der Deutschen Gesellschaft für Schlafforschung die wirksamste Behandlung. Sie beinhaltet Aufklärung über Schlaf, Regeln zur Schlafhygiene, Entspannungsverfahren und paradoxe Interventionen wie die Schlafrestriktion. Erste Anlaufstellen sind Psychotherapeuten mit entsprechender Zulassung sowie zertifizierte Online-Programme (Somnio, HelloBetter, sleepio), die viele Kassen inzwischen erstatten.' },
      { type: 'heading', level: 2, text: 'Wenn der Verdacht auf Schlafapnoe besteht' },
      { type: 'paragraph', text: 'Der Weg führt über den Hausarzt zur HNO- oder Schlafmedizin-Praxis. Zunächst wird meist ein ambulantes Screening durchgeführt (Polygraphie zuhause), gefolgt von einer Nacht im Schlaflabor bei begründetem Verdacht. Bestätigt sich die Diagnose, ist die Standardtherapie eine CPAP-Maske, die nachts einen leichten Überdruck erzeugt und die Atemwege offen hält. Klingt unbequem, ist es die ersten Nächte auch, aber die meisten Betroffenen berichten nach ein paar Wochen von einer neuen Lebensqualität.' },
      { type: 'heading', level: 2, text: 'Was jeder selbst versuchen kann' },
      {
        type: 'list',
        items: [
          'Feste Aufstehzeit auch am Wochenende, egal wie kurz die Nacht war',
          'Kein Koffein nach 14 Uhr, kein Alkohol als „Schlaftrunk"',
          'Bildschirme mindestens 30 Minuten vor dem Zubettgehen aus',
          'Schlafzimmer kühl, dunkel und still',
          'Bei mehr als 20 Minuten wach im Bett aufstehen und in einem anderen Raum etwas Ruhiges tun',
        ],
      },
    ],
    faqs: [
      { q: 'Sind Melatonin-Präparate sinnvoll?', a: 'Bei kurzzeitigen Störungen (etwa Jetlag) kann Melatonin helfen. Bei chronischer Insomnie ist die Datenlage schwach. Rezeptfreie Produkte in der Drogerie sind meist zu niedrig dosiert; ärztlich verordnetes Circadin ist besser untersucht. Ein Versuch schadet nicht, ersetzt aber nicht die Ursachenklärung.' },
      { q: 'Wie viel Schlaf ist normal?', a: 'Erwachsene brauchen im Schnitt 7 bis 8 Stunden. Es gibt aber echte Kurz- und Langschläfer, die mit 6 oder 9 Stunden gut zurechtkommen. Entscheidend ist nicht die Uhr, sondern das Befinden am Tag.' },
      { q: 'Wann in ein Schlaflabor?', a: 'Bei Verdacht auf Schlafapnoe, ungeklärter Tagesmüdigkeit trotz ausreichender Schlafdauer, Verdacht auf Restless-Legs mit periodischen Beinbewegungen oder auffälligen Ergebnissen der ambulanten Voruntersuchung. Die Zuweisung erfolgt über den Haus- oder HNO-Arzt.' },
    ],
    sources: [
      'S3-Leitlinie „Nicht erholsamer Schlaf/Schlafstörungen" der Deutschen Gesellschaft für Schlafforschung und Schlafmedizin',
      'DAK-Gesundheitsreport Schlaf',
    ],
  },

  // 6
  {
    slug: 'reflux-magen-brennt',
    title: 'Reflux: wenn nach dem Essen alles brennt',
    lead: 'Sodbrennen kennt fast jeder. Wenn es aber zum Dauerzustand wird, sollte man das nicht mit Kaugummi und Antazida verdrängen. Die dauerhaft entzündete Speiseröhre kann echte Probleme machen. Was tun ist und was nicht.',
    category: 'magen-darm',
    tags: ['Reflux', 'Sodbrennen', 'Magen', 'Gastroskopie'],
    readingMinutes: 5,
    publishedAt: '2026-01-15',
    updatedAt: '2026-01-15',
    heroIcon: 'flame',
    heroGradient: 'from-orange-500 to-red-500',
    heroImage: 'https://images.unsplash.com/photo-1604262590904-0039c606dc95?auto=format&fit=crop&w=1600&q=80',
    heroImageAlt: 'Scharfes Essen, Motiv für Reflux',
    relatedSpecialties: ['internist', 'hausarzt'],
    sections: [
      { type: 'paragraph', text: 'Bis zu 20 Prozent der Erwachsenen in westlichen Ländern haben mindestens einmal pro Woche Reflux-Beschwerden. Ursache ist meist eine Schwäche des Muskels am Übergang zwischen Speiseröhre und Magen. Der saure Mageninhalt fließt zurück und reizt die empfindliche Schleimhaut der Speiseröhre.' },
      { type: 'heading', level: 2, text: 'Typische Symptome' },
      {
        type: 'list',
        items: [
          'Brennen hinter dem Brustbein, oft nach fettigem oder scharfem Essen',
          'Saures Aufstoßen, manchmal bis in den Mund',
          'Beschwerden verschlimmern sich im Liegen oder beim Bücken',
          'Nächtliches Aufwachen mit Brennen oder Husten',
          'Chronischer Reizhusten oder Heiserkeit ohne Erkältung',
        ],
      },
      { type: 'heading', level: 2, text: 'Was hilft im Alltag' },
      { type: 'paragraph', text: 'Bei gelegentlichen Beschwerden reichen oft Verhaltensänderungen: kleinere Portionen, letzte Mahlzeit nicht später als drei Stunden vor dem Schlafen, Kopfteil des Bettes 15 bis 20 Zentimeter erhöhen (nicht mit Zusatzkissen, sondern mit Klötzchen unter den Bettpfosten). Alkohol, Kaffee, Schokolade, scharfe Gewürze und Pfefferminz können Beschwerden verstärken; Rauchen ganz besonders. Bei Übergewicht bringt bereits eine Gewichtsabnahme von 5 bis 10 Kilogramm oft eine spürbare Besserung.' },
      { type: 'heading', level: 2, text: 'Medikamente: PPI mit Bedacht' },
      { type: 'paragraph', text: 'Bei stärkeren Beschwerden verordnet der Arzt meist einen Protonenpumpenhemmer (Omeprazol, Pantoprazol, Esomeprazol). Diese Medikamente reduzieren die Magensäureproduktion sehr wirksam. Wichtig: PPIs sind für den Kurzzeiteinsatz von 4 bis 8 Wochen gedacht. Wer sie über Jahre einnimmt, sollte das mit dem Arzt regelmäßig prüfen. Möglicher Zusammenhang mit Vitamin-B12-Mangel, verminderter Aufnahme von Magnesium und einem leicht erhöhten Osteoporose-Risiko werden diskutiert.' },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Wann eine Magenspiegelung',
        text: 'Bei Beschwerden über 8 Wochen trotz Behandlung, bei Schluckbeschwerden, Gewichtsverlust, wiederkehrendem Erbrechen, Blutungen (schwarzer Stuhl, Blut im Erbrochenen) oder erstmaligem Auftreten ab 50 sollte eine Gastroskopie erfolgen. Sie schließt eine Speiseröhrenentzündung, ein Barrett-Syndrom oder in seltenen Fällen ein Karzinom aus.',
      },
      { type: 'heading', level: 2, text: 'Barrett-Syndrom: das muss man wissen' },
      { type: 'paragraph', text: 'Wenn die Speiseröhre über Jahre der Säure ausgesetzt ist, kann sich das Gewebe verändern (Barrett-Metaplasie). Das ist eine Vorstufe zum Speiseröhrenkrebs. Wichtig zu wissen: nur ein kleiner Teil der Barrett-Patienten entwickelt tatsächlich Krebs, und die regelmäßige endoskopische Kontrolle alle 2 bis 5 Jahre findet Veränderungen früh genug. Wer die Diagnose bekommt, sollte den Termin nicht vergessen.' },
    ],
    faqs: [
      { q: 'Kann man Reflux operieren?', a: 'Ja, in schweren Fällen. Die häufigste Operation ist die Fundoplikatio, bei der ein Teil des Magens um die untere Speiseröhre gelegt wird. Neuere Verfahren wie LINX-Ringe kommen selten zum Einsatz. Eine OP kommt meist in Frage, wenn PPI-Therapie nicht ausreicht oder die Nebenwirkungen belasten.' },
      { q: 'Was tun bei nächtlichem Reflux?', a: 'Kopfteil des Bettes erhöhen, letzte Mahlzeit deutlich vor dem Zubettgehen, in Linksseitenlage schlafen (der Magen liegt dann unter dem Übergang zur Speiseröhre). Bei anhaltenden nächtlichen Beschwerden trotz PPI ist eine Abklärung sinnvoll.' },
      { q: 'Sind Kräutertees oder Natron eine Alternative?', a: 'Kamillentee ist angenehm, therapeutisch aber nicht wirksam. Natron neutralisiert die Säure kurz, kann aber bei Dauereinsatz den Blutdruck erhöhen (viel Natrium) und einen Rebound-Effekt auslösen. Bei gelegentlichem Sodbrennen sind Antazida aus der Apotheke die verträglichere Option.' },
    ],
    sources: [
      'S2k-Leitlinie „Gastroösophageale Refluxkrankheit" der DGVS',
      'IQWiG-Gesundheitsinformation zur Refluxkrankheit',
    ],
  },

  // 7
  {
    slug: 'grippe-oder-erkaeltung',
    title: 'Grippe oder nur erkältet? Der ehrliche Unterschied',
    lead: 'Wenn im Winter der Hals kratzt und der Kopf brummt, spricht man schnell von Grippe. In den allermeisten Fällen ist es aber eine Erkältung, medizinisch ein grippaler Infekt. Die echte Grippe (Influenza) fühlt sich anders an. Wer den Unterschied kennt, spart sich unnötige Antibiotika.',
    category: 'hno',
    tags: ['Grippe', 'Erkältung', 'Influenza', 'Impfung'],
    readingMinutes: 4,
    publishedAt: '2026-01-12',
    updatedAt: '2026-01-12',
    heroIcon: 'thermometer',
    heroGradient: 'from-sky-500 to-blue-600',
    heroImage: 'https://images.unsplash.com/photo-1586600485799-3a0165bf805c?auto=format&fit=crop&w=1600&q=80',
    heroImageAlt: 'Person mit Erkältung eingekuschelt zuhause',
    relatedSpecialties: ['hausarzt', 'hno-arzt'],
    sections: [
      { type: 'paragraph', text: 'Etwa 200 verschiedene Erkältungsviren sind bekannt, allen voran Rhinoviren. Die echte Grippe wird dagegen von Influenza-Viren ausgelöst, in Deutschland vor allem in den Wintermonaten von Dezember bis März. Beide Erkrankungen betreffen die Atemwege, unterscheiden sich aber deutlich in Verlauf und Schwere.' },
      { type: 'heading', level: 2, text: 'So fühlt sich eine Erkältung an' },
      { type: 'paragraph', text: 'Sie beginnt schleichend, meist mit Halskratzen, dann laufender oder verstopfter Nase, leichtem Husten. Die Körpertemperatur bleibt oft unter 38,5 Grad oder es gibt gar kein Fieber. Der Allgemeinzustand ist zwar schlechter als sonst, man kommt aber meist noch durch den Tag. Nach fünf bis sieben Tagen ist der Spuk vorbei.' },
      { type: 'heading', level: 2, text: 'So fühlt sich echte Grippe an' },
      { type: 'paragraph', text: 'Die Influenza kommt aus dem Nichts. Innerhalb weniger Stunden hohes Fieber (oft über 39 Grad), starker Kopfschmerz, ausgeprägte Gliederschmerzen, trockener Reizhusten, Abgeschlagenheit im ganzen Körper. Man will nur ins Bett und schafft es kaum aus dem Bett heraus. Der Verlauf dauert meist eine bis zwei Wochen. Bei Risikogruppen (ältere Menschen, chronisch Kranke, Schwangere) können schwere Verläufe mit Lungenentzündung oder Herzmuskelentzündung auftreten.' },
      {
        type: 'callout',
        tone: 'info',
        title: 'Schnelltest sinnvoll?',
        text: 'Bei jungen, gesunden Erwachsenen mit typischen Symptomen ist ein Grippe-Schnelltest meist nicht nötig. Bei Risikogruppen, im Krankenhaus, in Pflegeeinrichtungen oder bei sehr schwerem Verlauf lohnt sich der Test, weil eine antivirale Therapie mit Oseltamivir in den ersten 48 Stunden Vorteile bringen kann.',
      },
      { type: 'heading', level: 2, text: 'Was hilft: bei beiden Krankheiten' },
      {
        type: 'list',
        items: [
          'Ruhen, sich nicht durchkämpfen, Krankschreibung bei Bedarf',
          'Viel trinken (Wasser, ungesüßter Tee), warme Suppen',
          'Nasenspülungen mit Salzwasser gegen Schnupfen',
          'Ibuprofen 400 oder Paracetamol 500 bis 1000 mg bei Bedarf',
          'Feuchte Luft im Schlafzimmer, kein trockene Heizungsluft',
        ],
      },
      { type: 'heading', level: 2, text: 'Was NICHT hilft' },
      { type: 'paragraph', text: 'Antibiotika wirken gegen Bakterien, nicht gegen Viren. Bei einem einfachen Infekt sind sie schlicht wirkungslos und richten Kollateralschäden im Darm an. Ausnahme: Wenn sich nach einer viralen Infektion bakterielle Komplikationen entwickeln (Nasennebenhöhlenentzündung mit einseitigen Schmerzen, Mittelohrentzündung, Lungenentzündung mit anhaltend hohem Fieber und produktivem Husten), kann ein Antibiotikum indiziert sein. Das entscheidet der Arzt.' },
      { type: 'heading', level: 2, text: 'Grippe-Impfung: für wen wirklich' },
      { type: 'paragraph', text: 'Die STIKO empfiehlt die jährliche Grippeimpfung insbesondere für alle ab 60 Jahren, für Schwangere, für chronisch Kranke (Herz, Lunge, Diabetes), für Personal im Gesundheitswesen und für Menschen mit häufigem Publikumsverkehr. Beste Impfzeit ist Oktober bis Mitte Dezember; auch später ist sie noch sinnvoll. Für die Gruppe ab 60 wird der Hochdosis-Impfstoff bevorzugt.' },
    ],
    faqs: [
      { q: 'Wie lange bin ich ansteckend?', a: 'Bei Erkältung ab dem Kratzen im Hals bis etwa Tag 5 bis 7. Bei Grippe bis zu einem Tag vor den ersten Symptomen und ungefähr fünf bis sieben Tage danach, bei Kindern und Immungeschwächten oft länger. Wichtig: in dieser Zeit zuhause bleiben, hygienisch niesen und husten, Hände waschen.' },
      { q: 'Kann man gleichzeitig Grippe und Covid-19 haben?', a: 'Ja, das gibt es. Bei zweifelhaftem Verlauf oder Zugehörigkeit zu einer Risikogruppe kann ein kombinierter Schnelltest sinnvoll sein. Auch Corona ist eine ernstzunehmende Erkrankung, gerade für ältere Menschen. Impfempfehlungen der STIKO beachten.' },
      { q: 'Wann muss ich in die Klinik?', a: 'Bei Atemnot, blau angelaufenen Lippen, anhaltend hohem Fieber trotz Medikamenten, starken Brustschmerzen, ausgeprägter Schwäche mit Kreislaufproblemen, Verwirrtheit oder wenn sich der Zustand nach anfänglicher Besserung wieder verschlechtert. Bei Säuglingen und Kleinkindern gilt der niedrigere Schwellenwert, im Zweifel zuerst 116 117 anrufen.' },
    ],
    sources: [
      'RKI: Ratgeber Influenza',
      'STIKO-Empfehlungen (aktuell gültige Fassung)',
    ],
  },

  // 8
  {
    slug: 'bluthochdruck-was-viele-unterschaetzen',
    title: 'Bluthochdruck: der leise Feind, den viele unterschätzen',
    lead: 'Rund jeder dritte Erwachsene in Deutschland hat einen zu hohen Blutdruck, viele wissen es nicht. Bluthochdruck tut nicht weh, gibt keine Vorwarnung, richtet über Jahre still Schaden an. Der Punkt ist: rechtzeitig entdeckt und behandelt, ist das Risiko sehr gut in den Griff zu bekommen.',
    category: 'herz-kreislauf',
    tags: ['Bluthochdruck', 'Hypertonie', 'Herzinfarkt', 'Schlaganfall'],
    readingMinutes: 6,
    publishedAt: '2026-01-08',
    updatedAt: '2026-01-08',
    heroIcon: 'heart-pulse',
    heroGradient: 'from-rose-500 to-red-600',
    heroImage: 'https://images.unsplash.com/photo-1700832082200-af7deeb63d9b?auto=format&fit=crop&w=1600&q=80',
    heroImageAlt: 'Blutdruckmessung am Arm',
    relatedSpecialties: ['kardiologe', 'internist', 'hausarzt'],
    sections: [
      { type: 'paragraph', text: 'Die Deutsche Hochdruckliga geht davon aus, dass in Deutschland rund 20 bis 30 Millionen Menschen einen erhöhten Blutdruck haben. Etwa die Hälfte davon weiß es nicht, und von denen, die es wissen, ist nur etwa jeder zweite ausreichend behandelt. Dabei sind die Folgen einer unbehandelten Hypertonie beträchtlich: Schlaganfall, Herzinfarkt, Herzinsuffizienz, Nierenschwäche, Netzhautschäden.' },
      { type: 'heading', level: 2, text: 'Ab wann ist der Blutdruck zu hoch' },
      { type: 'paragraph', text: 'Die aktuellen europäischen Leitlinien definieren Bluthochdruck ab wiederholt gemessenen Werten von 140/90 mmHg in der Praxis oder 135/85 mmHg im heimischen Selbstmessen. Grenzwertig sind Werte um 130 bis 139 systolisch. Bei Menschen mit Diabetes oder chronischer Nierenerkrankung gelten strengere Grenzen.' },
      {
        type: 'callout',
        tone: 'info',
        title: 'Richtig messen zuhause',
        text: 'Der Blutdruck schwankt im Tagesverlauf und ist beim Arzttermin oft höher als zuhause (Weißkittel-Effekt). Aussagekräftig ist die Messung morgens und abends über sieben Tage jeweils zweimal im Sitzen nach fünf Minuten Ruhe, Ergebnis notieren. Ein 24-Stunden-Blutdruckmessgerät ist der Goldstandard für die Diagnosestellung.',
      },
      { type: 'heading', level: 2, text: 'Was zunächst hilft (auch ohne Tabletten)' },
      {
        type: 'list',
        items: [
          'Salzkonsum reduzieren: unter 5 bis 6 Gramm pro Tag (viele Fertigprodukte enthalten überraschend viel)',
          'Regelmäßige Bewegung: fünfmal pro Woche 30 Minuten moderate Aktivität wie zügiges Gehen',
          'Gewichtsreduktion: pro Kilogramm weniger sinkt der Blutdruck um etwa 1 mmHg',
          'Alkohol maximal in Maßen: für Männer nicht mehr als 20 Gramm reiner Alkohol pro Tag, Frauen die Hälfte',
          'Nikotin komplett vermeiden (der Effekt zusammen mit Blutdruck ist besonders schlecht)',
          'Stress-Management: Entspannungsverfahren, Yoga, Achtsamkeit haben moderate, messbare Effekte',
        ],
      },
      { type: 'heading', level: 2, text: 'Wann Medikamente' },
      { type: 'paragraph', text: 'Wenn Lebensstil-Änderungen nicht ausreichen oder der Blutdruck schon deutlich erhöht ist, kommen Medikamente ins Spiel. Fünf Wirkstoffgruppen stehen zur Auswahl: ACE-Hemmer, AT1-Antagonisten (Sartane), Kalziumantagonisten, Diuretika und Betablocker. Die meisten Patienten brauchen eine Kombination aus zwei bis drei Wirkstoffen, oft als Fixkombination in einer Tablette. Ziel ist eine gute Verträglichkeit und dauerhaft niedrige Werte, nicht ein Höchstmaß an Medikamenten.' },
      { type: 'heading', level: 2, text: 'Wann zum Kardiologen' },
      { type: 'paragraph', text: 'Die meisten Fälle betreut der Hausarzt hervorragend. Zum Kardiologen sollte man bei sehr hohem Blutdruck (über 180 systolisch), bei jüngeren Menschen unter 30 mit neuer Hypertonie (Verdacht auf sekundäre Ursachen), bei Kombination mit Vorhofflimmern oder Herzinsuffizienz, bei schwer einstellbarem Druck trotz drei Medikamenten oder bei zusätzlichen Herzsymptomen (Enge in der Brust, Atemnot bei Belastung).' },
    ],
    faqs: [
      { q: 'Kann Bluthochdruck wieder verschwinden?', a: 'In frühen Stadien und bei sekundären Ursachen (etwa Schlafapnoe, Nierenarterienstenose, hormonelle Störungen) ja. Bei der primären Hypertonie ist die Behandlung meist lebenslang, kann aber mit konsequenter Lebensstil-Änderung oft mit weniger Medikamenten auskommen.' },
      { q: 'Sind die Tabletten wirklich nötig?', a: 'Bei nachgewiesenem Bluthochdruck und ausgeschöpften Lebensstil-Maßnahmen ja. Ohne Behandlung steigt das Schlaganfall- und Herzinfarktrisiko deutlich. Moderne Blutdruckmedikamente sind gut verträglich und werden von den meisten Menschen jahrzehntelang ohne Probleme genommen.' },
      { q: 'Warum darf man Blutdruckmedikamente nicht einfach absetzen?', a: 'Ein plötzliches Absetzen kann zu Rebound-Effekten mit gefährlich hohen Werten führen, besonders bei Betablockern. Wenn Nebenwirkungen belasten, immer erst mit dem Arzt sprechen; es gibt viele Alternativen.' },
    ],
    sources: [
      'ESH/ESC-Leitlinie zum Management der arteriellen Hypertonie',
      'Deutsche Hochdruckliga: Patienteninformationen',
    ],
  },

  // 9
  {
    slug: 'fieber-beim-kind',
    title: 'Fieber beim Kind: wann abwarten, wann Arzt',
    lead: 'Kaum etwas versetzt Eltern so schnell in Alarmbereitschaft wie ein heißer, glühender Kinderkörper. Meistens ist Fieber ein Zeichen dafür, dass das Immunsystem seine Arbeit macht. Manchmal steckt aber etwas anderes dahinter. Was Eltern wissen sollten.',
    category: 'kinder',
    tags: ['Fieber', 'Kinder', 'U-Untersuchungen', 'Notdienst'],
    readingMinutes: 5,
    publishedAt: '2026-01-05',
    updatedAt: '2026-01-05',
    heroIcon: 'baby',
    heroGradient: 'from-pink-500 to-rose-500',
    heroImage: 'https://images.unsplash.com/photo-1616408621653-6755190009a3?auto=format&fit=crop&w=1600&q=80',
    heroImageAlt: 'Kind wird auf Fieber untersucht',
    relatedSpecialties: ['kinderarzt', 'hausarzt'],
    sections: [
      { type: 'paragraph', text: 'Fieber ist definiert als eine Körpertemperatur ab 38,5 Grad rektal gemessen. Werte zwischen 37,5 und 38,4 gelten als erhöhte Temperatur. Fieber ist keine Krankheit, sondern eine Reaktion. Es hilft dem Körper, Erreger effektiver zu bekämpfen. Sinn und Zweck ist also nicht die möglichst schnelle Senkung, sondern die Sicherheit, dass das Kind es gut übersteht.' },
      { type: 'heading', level: 2, text: 'Was zählt ist der Zustand, nicht die Zahl' },
      { type: 'paragraph', text: 'Ein Kind mit 39,5 Grad, das trinkt, ansprechbar ist und sich zwischendurch für sein Kuscheltier interessiert, ist meist weit weniger besorgniserregend als ein blasses, apathisches Kind mit 38,2 Grad. Der Allgemeinzustand ist wichtiger als der Wert am Thermometer.' },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Wann sofort zum Arzt oder in die Klinik',
        text: 'Bei Säuglingen unter 3 Monaten mit Temperatur über 38 Grad: sofortige ärztliche Vorstellung. Bei allen Kindern: bei Atemnot, Bewusstseinstrübung, Nackensteife, punktförmigen Blutungen unter der Haut (petechiale Ausschläge, die auf Druck nicht verblassen), Fieberkrampf, Trinkverweigerung länger als 8 Stunden, Fieber über 40 Grad oder Fieber, das länger als 3 Tage anhält.',
      },
      { type: 'heading', level: 2, text: 'Wie man Fieber richtig misst' },
      { type: 'paragraph', text: 'Bei Kindern unter zwei Jahren ist die rektale Messung mit einem digitalen Thermometer am zuverlässigsten. Bei älteren Kindern kann auch im Ohr oder unter der Zunge gemessen werden, allerdings mit möglichen Abweichungen. Achselmessungen sind ungenau. Die Stirn-Infrarot-Thermometer sind zwar bequem, geben aber tendenziell niedrigere Werte an.' },
      { type: 'heading', level: 2, text: 'Was Eltern zuhause tun können' },
      {
        type: 'list',
        items: [
          'Viel und häufig zu trinken anbieten (Wasser, Tee, verdünnte Säfte, bei Säuglingen weiter stillen)',
          'Leichte Kleidung, Zimmer nicht überheizt (18 bis 20 Grad)',
          'Wadenwickel nur bei warmen Beinen und wenn das Kind es zulässt',
          'Fiebersenker bei sichtbarem Leiden: Paracetamol 15 mg/kg alle 4 bis 6 Stunden oder Ibuprofen 10 mg/kg alle 6 bis 8 Stunden',
          'Ruhe, Kuscheln, keine Aktivitäten erzwingen',
        ],
      },
      { type: 'paragraph', text: 'Wichtig: Paracetamol und Ibuprofen nicht routinemäßig abwechseln, das erhöht die Fehlerrate. Und: Aspirin ist bei Kindern unter 12 Jahren tabu (Reye-Syndrom).' },
      { type: 'heading', level: 2, text: 'Fieberkrampf: erschreckend, meist harmlos' },
      { type: 'paragraph', text: 'Etwa 3 bis 5 Prozent aller Kinder erleben einen Fieberkrampf, meist zwischen dem 6. Lebensmonat und dem 5. Lebensjahr. Für Eltern ist der Anblick furchtbar, das Kind zuckt, verdreht die Augen, ist kurz nicht ansprechbar. Meistens ist ein einfacher Fieberkrampf nach 1 bis 3 Minuten von selbst vorbei und richtet keinen Schaden an. Trotzdem sollte er beim ersten Mal immer ärztlich abgeklärt werden, um schwerere Ursachen (Meningitis, Enzephalitis) auszuschließen.' },
      { type: 'heading', level: 2, text: 'Bereitschaftsdienst und Notaufnahme' },
      { type: 'paragraph', text: 'Wenn tagsüber Sorge besteht, ist der Kinderarzt die erste Adresse. Abends und am Wochenende ruft man 116 117 an; dort wird kinderärztliche Vermittlung koordiniert. In akuten Notlagen (schweres Trinkverhalten, Atemnot, Bewusstseinstrübung, Fieberkrampf länger als 5 Minuten): sofort 112 oder direkt in die Kinder-Notaufnahme.' },
    ],
    faqs: [
      { q: 'Ab welcher Temperatur zum Arzt?', a: 'Die genaue Zahl ist weniger wichtig als der Verlauf und der Zustand des Kindes. Bei Säuglingen unter 3 Monaten immer ab 38 Grad. Bei älteren Kindern: bei Fieber über 3 Tage, bei sehr hohem Fieber (über 40 Grad), bei schlechtem Allgemeinzustand, bei Zusatzsymptomen wie Nackensteife, Atemnot, ungewöhnlichem Ausschlag.' },
      { q: 'Muss ein Kind mit Fieber ins Bett?', a: 'Nicht zwingend. Was das Kind will und braucht, weiß es meistens selbst. Bei Fieber sind viele Kinder lustlos und ziehen sich zurück, andere wollen weiter spielen. Beides ist okay. Anstrengende Aktivitäten sollten unterbleiben, Frischluft in Maßen ist erlaubt.' },
      { q: 'Ist ein Fieberzäpfchen besser als ein Saft?', a: 'Beides ist gleichwertig wirksam, wenn richtig dosiert. Zäpfchen sind praktisch bei Kindern, die den Saft erbrechen oder gar nicht schlucken. Der Wirkeintritt ist ähnlich, etwa 30 bis 60 Minuten.' },
    ],
    sources: [
      'S1-Leitlinie „Fieber bei Kindern" der DGKJ (Deutsche Gesellschaft für Kinder- und Jugendmedizin)',
      'Bundeszentrale für gesundheitliche Aufklärung: Elternratgeber',
    ],
  },

  // 10
  {
    slug: 'herzstolpern-vorhofflimmern',
    title: 'Herzstolpern: harmlos oder Vorhofflimmern?',
    lead: 'Das Herz macht plötzlich einen Extraschlag, setzt kurz aus, rast für ein paar Sekunden. Fast jeder hat das schon einmal gespürt. Meistens ist es harmlos. Aber es gibt eine Form, die man nicht übersehen sollte, weil sie das Schlaganfallrisiko deutlich erhöht.',
    category: 'herz-kreislauf',
    tags: ['Vorhofflimmern', 'Herzrhythmus', 'Schlaganfall', 'EKG'],
    readingMinutes: 6,
    publishedAt: '2026-01-02',
    updatedAt: '2026-01-02',
    heroIcon: 'heart',
    heroGradient: 'from-red-500 to-pink-600',
    heroImage: 'https://images.unsplash.com/photo-1560306990-18fa759c8713?auto=format&fit=crop&w=1600&q=80',
    heroImageAlt: 'EKG-Kurve, Motiv für Herzrhythmus',
    relatedSpecialties: ['kardiologe', 'internist', 'hausarzt'],
    sections: [
      { type: 'paragraph', text: 'Der medizinische Fachbegriff für Herzstolpern ist Extrasystolen. Der Herzmuskel schlägt zusätzlich zum normalen Rhythmus, was oft als Aussetzer oder starker Einzelschlag wahrgenommen wird. Bei gesunden Menschen ist das in aller Regel ungefährlich. Anders sieht es aus, wenn das Stolpern länger anhält, unregelmäßig ist und mit Symptomen wie Schwindel oder Atemnot einhergeht.' },
      { type: 'heading', level: 2, text: 'Wann Herzstolpern harmlos ist' },
      { type: 'paragraph', text: 'Vereinzelte Extraschläge, die man beim ruhigen Sitzen oder beim Einschlafen spürt, sind meist funktionell, also ohne krankhafte Ursache. Auslöser können Stress, Kaffee, Alkohol, wenig Schlaf, Nikotin oder eine Erkältung sein. Auch Elektrolytstörungen (Mangel an Kalium oder Magnesium) und eine Überfunktion der Schilddrüse können harmlose Rhythmusstörungen begünstigen.' },
      { type: 'heading', level: 2, text: 'Was Vorhofflimmern von Herzstolpern unterscheidet' },
      { type: 'paragraph', text: 'Vorhofflimmern ist die häufigste anhaltende Herzrhythmusstörung. In Deutschland leiden über 2 Millionen Menschen daran, viele davon ohne es zu wissen. Beim Vorhofflimmern schlagen die Vorhöfe unkoordiniert mit bis zu 600 Schlägen pro Minute, was zu einem völlig unregelmäßigen Puls führt. Typische Symptome sind ein wildes, chaotisches Herzgefühl, Atemnot bei Belastung, Schwindel oder Leistungsknick. Manche Betroffene haben aber gar keine Beschwerden; das Vorhofflimmern wird erst zufällig entdeckt oder durch einen Schlaganfall.' },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Das Schlaganfallrisiko',
        text: 'Beim Vorhofflimmern kann sich in den flimmernden Vorhöfen ein Blutgerinnsel bilden, mit dem Blutstrom ins Gehirn wandern und dort eine Ader verschließen. Rund ein Drittel aller Schlaganfälle geht auf Vorhofflimmern zurück. Die gute Nachricht: mit blutverdünnenden Medikamenten (moderne Wirkstoffe wie Apixaban, Rivaroxaban, Dabigatran, Edoxaban) sinkt das Risiko um über 60 Prozent.',
      },
      { type: 'heading', level: 2, text: 'So wird die Diagnose gestellt' },
      { type: 'paragraph', text: 'Zunächst gibt der Hausarzt ein EKG in Auftrag. Wenn der Rhythmus im Moment der Messung normal ist (was beim paroxysmalen Vorhofflimmern häufig der Fall ist), folgt ein Langzeit-EKG über 24 bis 72 Stunden, in schwierigen Fällen ein Event-Recorder oder ein implantierbarer Loop-Recorder für Wochen bis Monate. Moderne Smartwatches (Apple Watch, Fitbit, Samsung) können Vorhofflimmern-Verdachtsfälle erkennen und werden zunehmend als Ergänzung genutzt, ersetzen aber kein ärztliches EKG.' },
      { type: 'heading', level: 2, text: 'Was passiert bei bestätigtem Vorhofflimmern' },
      {
        type: 'list',
          items: [
          'Blutverdünnung, wenn das Schlaganfallrisiko erhöht ist (CHA₂DS₂-VASc-Score)',
          'Frequenzkontrolle mit Betablockern oder Kalziumantagonisten, damit das Herz nicht dauerhaft zu schnell schlägt',
          'Rhythmuskontrolle mit Medikamenten oder Kardioversion (elektrischer Schock in Kurznarkose)',
          'Bei anhaltenden Beschwerden oder jüngeren Patienten: Katheterablation, ein minimalinvasiver Eingriff, bei dem gezielt Herzgewebe verödet wird',
          'Behandlung der Grundursachen: Bluthochdruck einstellen, Schilddrüse checken, Alkohol reduzieren, Übergewicht reduzieren, Schlafapnoe abklären',
        ],
      },
      { type: 'heading', level: 2, text: 'Wann Sie den Arzt anrufen sollten' },
      { type: 'paragraph', text: 'Ein einmaliges kurzes Stolpern nach zwei Espresso ist kein Grund für die Notaufnahme. Ein unregelmäßiges, wildes Herzklopfen über mehrere Minuten oder Stunden, verbunden mit Schwindel, Atemnot oder Brustschmerzen dagegen schon. Bei akuten Brustschmerzen mit Ausstrahlung in den Arm oder Kaltschweißigkeit sofort 112. Für alles andere: einen Termin beim Hausarzt, der bei begründetem Verdacht ans Herz weiter überweist.' },
    ],
    faqs: [
      { q: 'Kann Herzstolpern von Wechseljahren kommen?', a: 'Ja, hormonelle Umstellungen in den Wechseljahren führen bei vielen Frauen zu funktionellen Herzrhythmusstörungen und Palpitationen. Diese sind in der Regel harmlos, sollten aber einmalig kardiologisch abgeklärt werden, um bösartige Ursachen auszuschließen.' },
      { q: 'Sind Smartwatch-Warnungen verlässlich?', a: 'Sie sind besser geworden, aber nicht perfekt. Eine Smartwatch kann Verdachtsfälle aufdecken, die man sonst nie bemerkt hätte, produziert aber auch falsche Alarme. Jeder Verdacht sollte durch ein ärztliches EKG bestätigt werden.' },
      { q: 'Muss man Blutverdünner lebenslang nehmen?', a: 'Bei fortbestehendem Vorhofflimmern ja, weil das Schlaganfallrisiko bestehen bleibt. Es gibt allerdings Situationen, in denen die Behandlung neu bewertet wird (etwa nach erfolgreicher Ablation). Diese Entscheidung trifft immer der Kardiologe individuell mit Ihnen.' },
    ],
    sources: [
      'ESC-Leitlinie zum Management von Vorhofflimmern',
      'Deutsche Gesellschaft für Kardiologie (DGK): Patientenleitlinien',
      'Kompetenznetz Vorhofflimmern',
    ],
  },
];

export function articleBySlug(slug) {
  return MAGAZINE_ARTICLES.find((a) => a.slug === slug) || null;
}

export function articlesByCategory(categorySlug) {
  return MAGAZINE_ARTICLES.filter((a) => a.category === categorySlug);
}

export function categoryBySlug(slug) {
  return CATEGORIES.find((c) => c.slug === slug) || null;
}
