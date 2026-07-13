// Redaktionelle Fachrichtungs-Inhalte für die Pillar-Seiten unter /aerzte/fachrichtung/[slug].
// Bewusst deskriptiv gehalten, keine Behandlungsempfehlungen. Ziel: Nutzern eine seriöse Orientierung
// geben und Google klare Themen-Cluster liefern (Topical Authority).

export const SPECIALTY_CONTENT = {
  hausarzt: {
    subline: 'Erste Anlaufstelle bei nahezu allen Beschwerden',
    intro: `Der Hausarzt – in der Fachsprache Facharzt für Allgemeinmedizin oder hausärztlicher Internist – ist in Deutschland die erste Anlaufstelle bei nahezu jeder gesundheitlichen Frage. Von der akuten Erkältung über die Vorsorgeuntersuchung bis hin zur Betreuung chronischer Erkrankungen wie Bluthochdruck oder Diabetes koordiniert der Hausarzt Ihre medizinische Versorgung und überweist bei Bedarf an Fachärzte. Wer in ein Hausarzt-Modell seiner Krankenkasse eingeschrieben ist (HZV), profitiert von einer verbesserten Vernetzung zwischen den behandelnden Ärzten.`,
    intro2: `In Deutschland gibt es rund 55.000 Hausarztpraxen, deren Zahl aufgrund des demografischen Wandels in vielen Regionen unter Druck steht. Bei der Auswahl einer Hausarztpraxis lohnt sich neben der räumlichen Nähe ein Blick auf Öffnungszeiten (Abendsprechstunde, Samstage), Barrierefreiheit sowie darauf, ob die Praxis neue Patientinnen und Patienten aufnimmt.`,
    whenToVisit: [
      'Akute Beschwerden wie Erkältung, Fieber, Husten, Halsschmerzen',
      'Chronische Erkrankungen (Bluthochdruck, Diabetes, COPD, Schilddrüse)',
      'Vorsorgeuntersuchungen und Check-ups ab 35',
      'Impfungen (Grippe, Tetanus, Reise-Impfungen)',
      'Krankschreibung bei Arbeitsunfähigkeit',
      'Überweisung an Fachärzte',
      'Rezepte für Dauermedikation',
      'Erste Einschätzung bei unklaren Beschwerden',
    ],
    faqs: [
      { q: 'Was macht ein Hausarzt?', a: 'Ein Hausarzt ist Facharzt für Allgemeinmedizin oder hausärztlich tätiger Internist. Er behandelt akute und chronische Erkrankungen, führt Vorsorgeuntersuchungen durch, stellt Rezepte und Krankschreibungen aus und überweist an Fachärzte, wenn eine spezialisierte Abklärung nötig ist.' },
      { q: 'Brauche ich eine Überweisung vom Hausarzt zum Facharzt?', a: 'Gesetzlich versicherte Patienten in Deutschland benötigen für die meisten Facharztbesuche keine formale Überweisung. Ausnahmen sind Radiologen und Nuklearmediziner. Wer im Hausarzt-Modell (HZV) eingeschrieben ist, geht in der Regel immer zuerst zum Hausarzt.' },
      { q: 'Wie finde ich einen Hausarzt, der neue Patienten aufnimmt?', a: 'Viele Praxen kommunizieren offen auf ihrer Website oder telefonisch, ob sie neue Patienten annehmen. Alternativ hilft der Arztsuche-Service Ihrer Krankenkasse. In ländlichen Regionen sind Wartelisten üblich.' },
      { q: 'Was kostet ein Hausarztbesuch?', a: 'Gesetzlich Versicherte zahlen bei Hausarztbesuchen keine Praxisgebühr. Für Privatpatienten und Selbstzahler richtet sich das Honorar nach der Gebührenordnung für Ärzte (GOÄ). Attesten und Bescheinigungen für arbeits- oder versicherungsrechtliche Zwecke können gesondert berechnet werden.' },
      { q: 'Kann ich meinen Hausarzt wechseln?', a: 'Ja, jederzeit. Es gibt in Deutschland freie Arztwahl. Bei Wechsel innerhalb eines HZV-Vertrags sind die Fristen der jeweiligen Krankenkasse zu beachten. Die Krankenakte wird auf schriftliche Anforderung an die neue Praxis übermittelt.' },
    ],
    relatedSlugs: ['internist', 'kinderarzt', 'kardiologe'],
    symptomHints: ['Erkältung, Husten, Fieber', 'Bluthochdruck, Diabetes-Kontrolle', 'Rückenschmerzen (erste Einschätzung)', 'Impfberatung', 'Vorsorge'],
  },

  zahnarzt: {
    subline: 'Prävention, Zahnerhalt und ästhetische Zahnheilkunde',
    intro: `Der Zahnarzt ist zuständig für die Vorsorge, Diagnose und Behandlung von Erkrankungen der Zähne, des Zahnfleischs und des Kiefers. Neben der klassischen Karies- und Zahnfleischbehandlung umfasst das Leistungsspektrum die professionelle Zahnreinigung, Wurzelkanalbehandlungen, Zahnersatz (Kronen, Brücken, Implantate), Kieferorthopädie sowie oft ästhetische Behandlungen wie Bleaching oder Veneers.`,
    intro2: `Die gesetzlichen Krankenkassen empfehlen mindestens einen Kontrolltermin pro Jahr; Erwachsene mit lückenlos geführtem Bonusheft erhalten bei Zahnersatz höhere Zuschüsse. In Deutschland praktizieren rund 72.000 Zahnärzte; viele Praxen kooperieren mit spezialisierten Praxen für Kieferchirurgie oder Kieferorthopädie.`,
    whenToVisit: [
      'Vorsorge und Kontrolle (mindestens einmal pro Jahr)',
      'Zahnschmerzen, Schmerzen beim Kauen oder Kälte-/Wärmeempfindlichkeit',
      'Zahnfleischbluten oder Zahnfleischrückgang',
      'Professionelle Zahnreinigung',
      'Karies, Füllungen, Wurzelbehandlungen',
      'Zahnersatz (Krone, Brücke, Implantat, Prothese)',
      'Kieferorthopädische Beratung (Zahnfehlstellung)',
      'Ästhetische Zahnheilkunde (Bleaching, Veneers)',
    ],
    faqs: [
      { q: 'Wie oft sollte ich zum Zahnarzt gehen?', a: 'Empfohlen wird mindestens ein Kontrolltermin pro Jahr, für Erwachsene mit Zahnersatz-Bonusheft sogar halbjährlich. Kinder und Jugendliche haben laut Kassenrichtlinien Anspruch auf zwei Vorsorgetermine pro Jahr.' },
      { q: 'Was zahlt die Krankenkasse beim Zahnarzt?', a: 'Die gesetzliche Krankenkasse übernimmt vollständig Kontrolluntersuchungen, einfache Füllungen (im Seitenzahnbereich Amalgam oder ähnliche Kunststoffe), Wurzelbehandlungen unter bestimmten Voraussetzungen und einen Festzuschuss für Zahnersatz. Ästhetische Behandlungen und höherwertige Materialien sind meist Eigenleistung.' },
      { q: 'Was ist eine professionelle Zahnreinigung (PZR)?', a: 'Die PZR ist eine intensive Reinigung durch geschultes Fachpersonal, die Zahnbelag, Zahnstein und Verfärbungen entfernt und die Zähne poliert. Sie gilt als effektive Präventionsmaßnahme, wird aber von den meisten gesetzlichen Kassen nicht vollständig übernommen (Zuschüsse variieren).' },
      { q: 'Ab wann ist ein Zahnimplantat sinnvoll?', a: 'Ein Implantat ersetzt die Zahnwurzel und ist eine Option, wenn ein Zahn nicht mehr zu erhalten ist oder eine Lücke geschlossen werden soll. Voraussetzung sind ausreichendes Kieferknochenvolumen und eine gesunde Mundschleimhaut. Die Kosten liegen in der Regel bei mehreren hundert bis über tausend Euro pro Implantat.' },
      { q: 'Was tun bei akuten Zahnschmerzen am Wochenende?', a: 'In Deutschland gibt es einen zahnärztlichen Notdienst, der auch an Wochenenden und Feiertagen erreichbar ist. Die Notdienstnummer variiert regional und ist auf den Websites der Landeszahnärztekammern zu finden.' },
    ],
    relatedSlugs: ['hausarzt'],
    symptomHints: ['Zahnschmerzen', 'Zahnfleischbluten', 'Karies', 'Zahnersatz', 'Ästhetische Zahnheilkunde'],
  },

  kardiologe: {
    subline: 'Facharzt für Herz und Kreislauf',
    intro: `Der Kardiologe ist Facharzt für Innere Medizin mit Schwerpunkt Kardiologie und behandelt Erkrankungen des Herzens und des Kreislaufsystems. Dazu zählen koronare Herzkrankheit, Herzinfarkt-Nachsorge, Herzinsuffizienz, Herzrhythmusstörungen (etwa Vorhofflimmern), Bluthochdruck sowie angeborene und erworbene Herzklappenerkrankungen. Zur diagnostischen Ausstattung einer kardiologischen Praxis gehören typischerweise EKG, Belastungs-EKG (Ergometrie), Langzeit-EKG, Echokardiographie und Langzeit-Blutdruckmessung.`,
    intro2: `Ein Kardiologe wird meist auf Überweisung durch den Hausarzt aufgesucht, wenn Symptome wie Brustschmerzen, Atemnot bei geringer Belastung, Herzrasen oder Schwindel abgeklärt werden müssen – oder zur regelmäßigen Kontrolle bekannter Herzerkrankungen. Bei akuten Beschwerden wie länger anhaltendem Brustschmerz mit Ausstrahlung in den linken Arm, Kaltschweißigkeit oder Atemnot ist umgehend der Notruf 112 zu wählen; das ist kein Fall für die reguläre Sprechstunde.`,
    whenToVisit: [
      'Brustschmerzen oder Engegefühl in der Brust',
      'Herzrasen, Herzstolpern, unregelmäßiger Puls',
      'Atemnot bei körperlicher Belastung',
      'Häufige oder anhaltend hohe Blutdruckwerte',
      'Bekannte koronare Herzkrankheit (KHK) oder Zustand nach Herzinfarkt',
      'Herzklappenerkrankungen',
      'Familiäre Vorbelastung mit plötzlichem Herztod',
      'Vor größeren Operationen (kardiologische Freigabe)',
    ],
    faqs: [
      { q: 'Was macht ein Kardiologe?', a: 'Ein Kardiologe ist Facharzt für Innere Medizin mit dem Schwerpunkt Herz- und Kreislauferkrankungen. Er diagnostiziert und behandelt Erkrankungen wie die koronare Herzkrankheit, Herzinsuffizienz, Herzrhythmusstörungen sowie Bluthochdruck – meist unter Einsatz von EKG, Belastungs-EKG und Ultraschall des Herzens (Echokardiographie).' },
      { q: 'Wann muss ich zum Kardiologen?', a: 'Ein kardiologischer Termin ist sinnvoll bei anhaltendem Brustschmerz, wiederkehrendem Herzrasen, Atemnot bei geringer Belastung, unklarem Schwindel oder Ohnmachtsanfällen, schlecht eingestelltem Bluthochdruck sowie zur Vorsorge bei familiärer Herz-Kreislauf-Belastung. Die Überweisung erfolgt meist durch den Hausarzt.' },
      { q: 'Wie lange dauert ein Termin beim Kardiologen?', a: 'Erstuntersuchungen dauern in der Regel 30 bis 60 Minuten und umfassen Anamnese, EKG und häufig eine Echokardiographie. Belastungs-EKG oder Langzeit-Untersuchungen können weitere Termine erfordern.' },
      { q: 'Was ist eine Echokardiographie?', a: 'Die Echokardiographie ist eine Ultraschalluntersuchung des Herzens. Sie zeigt Größe, Wandbewegung und Pumpfunktion der Herzkammern sowie den Zustand der Herzklappen – ohne Strahlenbelastung, meist innerhalb weniger Minuten.' },
      { q: 'Bei welchen Symptomen sofort den Notruf 112 wählen?', a: 'Starker, anhaltender Brustschmerz mit Ausstrahlung in Arm, Schulter, Hals oder Kiefer, kombiniert mit Atemnot, Kaltschweißigkeit oder Vernichtungsgefühl kann ein Herzinfarkt sein – umgehend 112 wählen. Das ist keine Situation für die Praxis-Wartezeit.' },
    ],
    relatedSlugs: ['internist', 'hausarzt'],
    symptomHints: ['Brustschmerz', 'Herzrasen, Herzstolpern', 'Bluthochdruck', 'Belastungs-Atemnot', 'Herzinfarkt-Nachsorge'],
  },

  orthopaede: {
    subline: 'Facharzt für Erkrankungen des Bewegungsapparats',
    intro: `Der Orthopäde – heute meist als Facharzt für Orthopädie und Unfallchirurgie bezeichnet – behandelt Erkrankungen und Verletzungen des Muskel-Skelett-Systems: Wirbelsäule, Gelenke, Bänder, Sehnen und Muskeln. Häufige Behandlungsanlässe sind Rücken- und Nackenschmerzen, Bandscheibenprobleme, Knie- und Hüftgelenksarthrose, Schulterschmerzen, Sportverletzungen sowie Fußprobleme wie Hallux valgus oder Fersensporn.`,
    intro2: `Zur orthopädischen Diagnostik gehören klinische Untersuchung, Röntgen, Ultraschall der Gelenke und – in Kooperation mit Radiologen – MRT und CT. Konservative Therapieoptionen reichen von Physiotherapie, orthopädischen Hilfsmitteln (Einlagen, Bandagen) über gezielte Injektionen bis hin zur medikamentösen Schmerztherapie. Operative Eingriffe erfolgen meist in Kliniken oder ambulanten OP-Zentren; Nachsorge und Rehabilitation begleitet der niedergelassene Orthopäde.`,
    whenToVisit: [
      'Rücken-, Nacken- und Kreuzschmerzen',
      'Gelenkschmerzen (Knie, Hüfte, Schulter, Handgelenk)',
      'Sportverletzungen und Verstauchungen',
      'Bandscheibenvorfall-Verdacht (Taubheit, Kribbeln, Ausstrahlung in Bein oder Arm)',
      'Arthrose und Gelenkverschleiß',
      'Osteoporose-Abklärung',
      'Fußfehlstellungen, Hallux valgus, Fersensporn',
      'Nach Operationen zur Nachsorge und Rehabilitation',
    ],
    faqs: [
      { q: 'Was ist der Unterschied zwischen Orthopäde und Chirurg?', a: 'Der Orthopäde ist auf konservative und operative Behandlung des Bewegungsapparats spezialisiert. Der Chirurg deckt ein breiteres Feld ab, das Weichteil-, Bauch- oder Unfallchirurgie umfasst. Seit 2005 gibt es in Deutschland die gemeinsame Facharztbezeichnung „Orthopädie und Unfallchirurgie".' },
      { q: 'Wann sollte ich mit Rückenschmerzen zum Orthopäden?', a: 'Bei akuten, kurzzeitigen Rückenschmerzen ohne Ausstrahlung oder neurologische Symptome reicht meist der Hausarzt. Zum Orthopäden sollten Sie bei anhaltenden Beschwerden über mehrere Wochen, Ausstrahlung in Bein oder Arm, Taubheitsgefühlen, Kraftverlust oder wenn eine spezifische Diagnostik (etwa MRT) angezeigt ist.' },
      { q: 'Was macht ein Orthopäde bei einem Bandscheibenvorfall?', a: 'Zunächst erfolgt eine klinische Untersuchung, ergänzt durch MRT-Bildgebung zur Sicherung der Diagnose. Die Behandlung ist in etwa 90 % der Fälle konservativ – mit Schmerztherapie, Physiotherapie, ggf. gezielten Injektionen. Nur bei anhaltenden neurologischen Ausfällen oder Blasen-/Mastdarmstörungen wird operiert.' },
      { q: 'Braucht man für Orthopäden eine Überweisung?', a: 'Nein, gesetzlich Versicherte können in Deutschland direkt einen Orthopäden aufsuchen. Bei akuten Beschwerden werden jedoch oft dringende Termine über den Hausarzt oder die Terminservicestelle der Kassenärztlichen Vereinigung koordiniert.' },
      { q: 'Wie lange dauert die Wartezeit auf einen Termin?', a: 'Orthopäden gehören zu den nachgefragtesten Facharztgruppen. Für Routinetermine sind Wartezeiten von mehreren Wochen üblich, für dringende Fälle bietet die Terminservicestelle (Telefon 116 117) kurzfristige Termine.' },
    ],
    relatedSlugs: ['physiotherapeut', 'chirurg', 'radiologe'],
    symptomHints: ['Rückenschmerzen', 'Knieschmerzen, Hüftschmerzen', 'Sportverletzungen', 'Arthrose', 'Bandscheibenvorfall'],
  },

  hautarzt: {
    subline: 'Facharzt für Dermatologie und Venerologie',
    intro: `Der Hautarzt (Dermatologe) behandelt Erkrankungen der Haut, der Haare, der Nägel und der angrenzenden Schleimhäute. Das Spektrum reicht von häufigen Beschwerden wie Akne, Ekzemen, Neurodermitis, Psoriasis (Schuppenflechte) und allergischen Reaktionen über die Krebs­vorsorge (Hautkrebs-Screening) bis hin zu venerologischen Themen und ästhetischer Dermatologie (Laser, Botulinumtoxin, Filler).`,
    intro2: `Ab dem 35. Lebensjahr haben gesetzlich Versicherte in Deutschland alle zwei Jahre Anspruch auf ein kostenfreies Hautkrebs-Screening – frühere oder häufigere Kontrollen können bei familiärer Vorbelastung, vielen Muttermalen (Nävi) oder häufiger Sonnen­exposition sinnvoll sein und werden von manchen Kassen bezuschusst.`,
    whenToVisit: [
      'Neu aufgetretene oder veränderte Muttermale',
      'Hautkrebs-Vorsorge (Screening ab 35 alle 2 Jahre)',
      'Akne, hormonelle oder chronische Hautprobleme',
      'Ekzeme, Neurodermitis, Psoriasis (Schuppenflechte)',
      'Allergische Hautreaktionen',
      'Haarausfall (diffus oder kreisrund)',
      'Nagelveränderungen (Nagelpilz, Verfärbungen)',
      'Warzen, Pigmentflecken, gutartige Hautveränderungen',
      'Ästhetische Dermatologie (Laser, Peelings)',
    ],
    faqs: [
      { q: 'Wann ist ein Hautkrebs-Screening sinnvoll?', a: 'Gesetzlich Versicherte in Deutschland haben ab dem 35. Lebensjahr alle zwei Jahre Anspruch auf ein kostenfreies Hautkrebs-Screening. Personen mit vielen Muttermalen, heller Haut, familiärer Vorbelastung oder häufigen Sonnenbränden in der Vergangenheit sollten mit ihrem Hautarzt individuelle Kontrollintervalle besprechen.' },
      { q: 'Was ist der Unterschied zwischen Kassen- und Privatleistungen beim Hautarzt?', a: 'Diagnostik und Behandlung medizinisch notwendiger Hauterkrankungen sind Kassenleistung. Rein ästhetische Behandlungen (Laser, Botulinumtoxin, Filler) sowie bestimmte Sonderuntersuchungen wie die Auflichtmikroskopie einzelner Muttermale sind meist Selbstzahlerleistungen (IGeL).' },
      { q: 'Wie erkenne ich ein verdächtiges Muttermal?', a: 'Als grobe Orientierung dient die ABCDE-Regel: A = Asymmetrie, B = unregelmäßige Begrenzung, C = uneinheitliche Farbe (Colour), D = Durchmesser über 5 mm, E = Erhabenheit oder Entwicklung (Veränderung). Ein oder mehrere dieser Kriterien sollten hautärztlich abgeklärt werden.' },
      { q: 'Sind Neurodermitis und Ekzem dasselbe?', a: 'Neurodermitis (atopische Dermatitis) ist eine chronisch-entzündliche Hauterkrankung, die oft schubweise verläuft. „Ekzem" ist der Oberbegriff für eine entzündliche, juckende Hautreaktion, die viele Ursachen haben kann – Neurodermitis ist eine Unterform.' },
      { q: 'Wie schnell bekomme ich einen Termin beim Hautarzt?', a: 'Wartezeiten für Routinetermine liegen häufig bei mehreren Wochen bis Monaten. Bei akuten Beschwerden (schnell wachsende Muttermale, plötzliche Ausschläge, Hautkrebs-Verdacht) sollten Sie direkt telefonisch auf die Dringlichkeit hinweisen – die Terminservicestelle 116 117 vermittelt bei entsprechender Indikation kurzfristig.' },
    ],
    relatedSlugs: ['hausarzt'],
    symptomHints: ['Hautausschlag, Juckreiz', 'Muttermal-Kontrolle', 'Akne, Neurodermitis', 'Hautkrebs-Vorsorge', 'Haarausfall'],
  },

  frauenarzt: {
    subline: 'Gynäkologie, Vorsorge und Schwangerschaftsbetreuung',
    intro: `Der Frauenarzt (Gynäkologe) ist Facharzt für Frauenheilkunde und Geburtshilfe. Sein Aufgabengebiet umfasst die gynäkologische Krebs­vorsorge, Verhütungsberatung, Diagnose und Therapie von Erkrankungen der weiblichen Geschlechts­organe und der Brust, Schwangerschafts­betreuung und -begleitung sowie die medizinische Betreuung in den Wechseljahren.`,
    intro2: `Die gesetzlichen Krankenkassen übernehmen ab dem 20. Lebensjahr die jährliche gynäkologische Krebsvorsorge (Zervix-Karzinom-Screening). Ab 30 kommt die Untersuchung der Brust hinzu, ab 50 bis 70 die Mammographie-Screening-Untersuchung im Zwei-Jahres-Rhythmus. Die HPV-Impfung wird von der STIKO für Mädchen und Jungen zwischen 9 und 14 Jahren empfohlen.`,
    whenToVisit: [
      'Jährliche Krebsvorsorge ab 20',
      'Verhütungsberatung und Rezepte',
      'Kinderwunsch-Beratung, Zyklusstörungen',
      'Schwangerschaftsvorsorge und Nachsorge',
      'Beschwerden in den Wechseljahren',
      'Regel- oder Unterleibsschmerzen',
      'Auffälligkeiten in der Selbstuntersuchung der Brust',
      'HPV-Impfung',
      'Beratung zu sexuell übertragbaren Infektionen',
    ],
    faqs: [
      { q: 'Ab welchem Alter sollte man zum Frauenarzt?', a: 'Es gibt keine feste Altersgrenze für den ersten Termin. Empfohlen wird ein erster Kontakt zwischen 13 und 16 Jahren, vor allem bei Fragen zu Menstruation, Verhütung oder ausbleibender Periode. Die Krebsvorsorge wird ab dem 20. Lebensjahr empfohlen.' },
      { q: 'Was gehört zur gynäkologischen Krebsvorsorge?', a: 'Zur jährlichen Krebsvorsorge ab 20 gehören ein Gespräch (Anamnese), eine gynäkologische Untersuchung sowie ab 20 ein Abstrich vom Gebärmutterhals (Pap-Test). Ab 30 kommt die Untersuchung der Brust und der Achselhöhlen hinzu. Ab 35 wird das Zervix-Karzinom-Screening alle drei Jahre um einen HPV-Test ergänzt.' },
      { q: 'Wie oft sollte man während einer Schwangerschaft zum Frauenarzt?', a: 'Die Mutterschaftsrichtlinien sehen im ersten Trimester alle vier Wochen Kontrollen vor, ab der 30. Schwangerschafts­woche alle zwei Wochen und ab der 36. Woche wöchentlich. Zusätzlich sind drei Ultraschall-Untersuchungen im gesetzlichen Katalog vorgesehen.' },
      { q: 'Werden Wechseljahres-Beschwerden von der Kasse behandelt?', a: 'Ja, medizinisch notwendige Beratung, Diagnostik und Therapie von Wechseljahres-Beschwerden sind Kassenleistung. Eine Hormonersatztherapie erfolgt nach individueller Nutzen-Risiko-Abwägung.' },
      { q: 'Wo bekomme ich Hilfe bei ungewollter Schwangerschaft?', a: 'Anerkannte Schwangerschafts-Konfliktberatungsstellen (etwa Pro Familia, Diakonie, Caritas, kommunale Stellen) beraten kostenfrei und vertraulich. Die medizinische Betreuung erfolgt anschließend beim Frauenarzt oder in spezialisierten Zentren.' },
    ],
    relatedSlugs: ['hausarzt', 'urologe'],
    symptomHints: ['Krebsvorsorge', 'Schwangerschaft', 'Verhütung', 'Zyklusstörungen', 'Wechseljahre'],
  },

  kinderarzt: {
    subline: 'Facharzt für Kinder- und Jugendmedizin',
    intro: `Der Kinderarzt (Pädiater) betreut Kinder und Jugendliche in der Regel bis zum vollendeten 18. Lebensjahr – von der Neugeborenen-Untersuchung über die U-Vorsorgen bis hin zur Beratung in der Pubertät. Zu seinem Aufgabenfeld gehören Vorsorge- und Früherkennungs­untersuchungen (U1 bis U9 und J1), Impfungen nach STIKO-Empfehlung, die Behandlung akuter Erkrankungen wie Infekten, Kinderkrankheiten sowie chronischer Erkrankungen wie Asthma, Allergien oder ADHS.`,
    intro2: `Kinderärzte arbeiten oft im Team mit Kinder-Kardiologen, -Psychiatern, Sozialpädiatrischen Zentren (SPZ) und Ergotherapeuten. Im Notfall stehen kinderärztliche Notdienste zur Verfügung; bei Säuglingen und Kleinkindern gilt der Grundsatz: Lieber einmal mehr abklären als zu spät.`,
    whenToVisit: [
      'Vorsorgeuntersuchungen U1 bis U9 sowie J1 (Jugendvorsorge)',
      'Impfungen nach STIKO-Empfehlung',
      'Akute Infekte (Fieber, Husten, Ohrenschmerzen)',
      'Kinderkrankheiten (Windpocken, Masern, Röteln)',
      'Allergien, Asthma, Neurodermitis bei Kindern',
      'Entwicklungs- und Verhaltensauffälligkeiten',
      'Beratung zu Ernährung, Stillen, Beikost',
      'Chronische Erkrankungen bei Kindern und Jugendlichen',
    ],
    faqs: [
      { q: 'Bis zu welchem Alter geht mein Kind zum Kinderarzt?', a: 'In Deutschland betreuen Kinderärzte Patienten in der Regel bis zum vollendeten 18. Lebensjahr. Der Übergang zum Hausarzt oder Internisten kann individuell abgestimmt werden – bei chronischen Erkrankungen manchmal etwas später.' },
      { q: 'Welche Vorsorgeuntersuchungen gibt es?', a: 'Die gesetzlichen Vorsorgen U1 bis U9 begleiten Kinder von der Geburt bis etwa zum 5. Lebensjahr, danach folgen U10, U11 und die Jugenduntersuchung J1. Sie werden im „Gelben Heft" dokumentiert. Diese Termine sind fester Bestandteil des Kassenleistungs­katalogs und werden zu bestimmten Alters­fenstern empfohlen.' },
      { q: 'Was tun bei hohem Fieber beim Kleinkind?', a: 'Fieber ist eine natürliche Reaktion des Körpers. Bei Säuglingen unter drei Monaten sollte jedes Fieber ärztlich abgeklärt werden. Bei älteren Kindern hängt die Dringlichkeit vom Allgemeinzustand ab – anhaltend hohes Fieber, Trinkverweigerung, Bewusstseinstrübung oder Nackensteifigkeit sind Alarmzeichen. Bei Unsicherheit ist der Kinderarzt-Notdienst (116 117) oder in akuten Situationen die 112 der richtige Ansprechpartner.' },
      { q: 'Muss mein Kind alle empfohlenen Impfungen erhalten?', a: 'Impfempfehlungen der Ständigen Impfkommission (STIKO) sind wissenschaftlich fundiert. Bis auf die Masernimpfung (Nachweispflicht für Gemeinschaftseinrichtungen seit 2020) sind sie in Deutschland freiwillig. Der Kinderarzt berät ausführlich über Nutzen und mögliche Nebenwirkungen.' },
      { q: 'Wie finde ich schnell einen Kinderarzt-Termin?', a: 'Für dringende Termine ist die Terminservicestelle 116 117 zuständig. Bei akuten Beschwerden am Wochenende oder abends bieten kinderärztliche Notdienste, Kinderkliniken und in vielen Städten spezielle Kinder-Notaufnahmen Hilfe.' },
    ],
    relatedSlugs: ['hausarzt', 'frauenarzt'],
    symptomHints: ['U-Untersuchungen', 'Impfungen', 'Fieber, Infekte', 'Allergien bei Kindern', 'Entwicklung'],
  },

  augenarzt: {
    subline: 'Facharzt für Augenheilkunde',
    intro: `Der Augenarzt (Ophthalmologe) diagnostiziert und behandelt Erkrankungen des Auges, der Augenhöhle, der Tränenwege und der Sehbahn. Zu seinen Aufgaben gehören die Untersuchung des Sehvermögens, die Verordnung von Brillen und Kontaktlinsen, die Früherkennung und Behandlung von Grauem und Grünem Star, Netzhaut­erkrankungen, altersbedingter Makuladegeneration (AMD) sowie diabetischer Retinopathie.`,
    intro2: `Regelmäßige augenärztliche Kontrollen sind besonders wichtig bei Diabetes, Bluthochdruck, familiärer Belastung mit Glaukom (Grüner Star) oder ab dem 40. Lebensjahr, da viele Augenerkrankungen zunächst symptomlos verlaufen und nur durch spezifische Untersuchungen (Messung des Augeninnendrucks, Sehnervendarstellung, OCT) frühzeitig erkannt werden.`,
    whenToVisit: [
      'Nachlassende Sehschärfe, Sehstörungen',
      'Kontrolle bei bekannter Diabetes-Erkrankung',
      'Verdacht auf Grauen Star (Katarakt) oder Grünen Star (Glaukom)',
      'Plötzliche Sehverschlechterung oder Blitze im Blickfeld (Notfall)',
      'Doppelbilder',
      'Trockene, brennende oder gerötete Augen',
      'Verordnung von Brille und Kontaktlinsen',
      'Kindliche Sehstörungen und Schielen',
      'Vorsorge ab 40 (Glaukom-Screening als IGeL)',
    ],
    faqs: [
      { q: 'Wie oft sollte ich zum Augenarzt?', a: 'Ohne Beschwerden reicht meist alle 2 bis 3 Jahre ein Termin. Ab 40 empfehlen Fachgesellschaften eine Glaukom-Vorsorge alle 2 Jahre, ab 60 auch eine Netzhaut-Kontrolle. Bei Diabetes ist eine jährliche augenärztliche Kontrolle Standard.' },
      { q: 'Was ist der Unterschied zwischen Grauem und Grünem Star?', a: 'Der Graue Star (Katarakt) ist eine Trübung der Augenlinse, meist altersbedingt und operativ gut behandelbar. Der Grüne Star (Glaukom) ist eine Erkrankung des Sehnervs, oft mit erhöhtem Augeninnendruck – die schleichende Schädigung ist nicht mehr rückgängig zu machen und macht die Früherkennung so wichtig.' },
      { q: 'Was ist eine OCT-Untersuchung?', a: 'Die Optische Kohärenztomographie (OCT) ist ein bildgebendes Verfahren, das Netzhaut und Sehnerv in feinsten Schichten darstellt. Sie wird zur Diagnose und Verlaufskontrolle von Glaukom, Makuladegeneration und diabetischen Netzhautveränderungen eingesetzt.' },
      { q: 'Welche augenärztlichen Leistungen zahlt die Kasse?', a: 'Medizinisch notwendige Untersuchungen, Operationen (z. B. Katarakt-OP) und Standard-Sehhilfen (bei starken Fehlsichtigkeiten oder Kindern) sind Kassenleistung. Vorsorge-Untersuchungen wie die Glaukom-Früherkennung ohne Symptome oder die OCT als reine Vorsorge sind meist Selbstzahlerleistungen (IGeL).' },
      { q: 'Bei welchen Augen-Symptomen sofort in die Klinik?', a: 'Plötzlicher Sehverlust, „Vorhang" oder schwarze Flecken im Sichtfeld, plötzlich auftretende Blitze oder viele neue schwarze Punkte (Verdacht auf Netzhautablösung), sehr starke Augenschmerzen mit Übelkeit (Verdacht auf Glaukomanfall) sind augenärztliche Notfälle – umgehend Augenklinik oder Notdienst aufsuchen.' },
    ],
    relatedSlugs: ['hausarzt', 'neurologe'],
    symptomHints: ['Sehverschlechterung', 'Trockene Augen', 'Grauer/Grüner Star', 'Diabetes-Kontrolle', 'Brille, Kontaktlinsen'],
  },

  'hno-arzt': {
    subline: 'Hals-Nasen-Ohren-Heilkunde',
    intro: `Der HNO-Arzt (Facharzt für Hals-Nasen-Ohren-Heilkunde) behandelt Erkrankungen im Bereich Ohren, Nase, Nasennebenhöhlen, Mundhöhle, Rachen und Kehlkopf. Häufige Beratungs­gründe sind Ohrenschmerzen, Hörprobleme, Tinnitus, Schwindel, Schnarchen, chronische Nebenhöhlen­entzündungen, Nasenpolypen sowie Halsentzündungen und Stimmprobleme.`,
    intro2: `Zum diagnostischen Repertoire gehören Ohrmikroskopie, Ton- und Sprachaudiometrie, Endoskopie von Nase und Kehlkopf sowie Gleichgewichts­prüfungen. Manche HNO-Praxen sind auf Schlafmedizin, Allergologie oder Stimmheilkunde spezialisiert.`,
    whenToVisit: [
      'Ohrenschmerzen, Ohrgeräusche, Tinnitus',
      'Hörverlust, plötzlich oder schleichend (Hörsturz-Verdacht ist ein Notfall!)',
      'Schwindel und Gleichgewichtsstörungen',
      'Chronische Nasennebenhöhlenentzündung',
      'Nasenpolypen, verstopfte Nase',
      'Schnarchen, Verdacht auf Schlafapnoe',
      'Anhaltende Halsschmerzen oder Heiserkeit über 3 Wochen',
      'Verdacht auf Kehlkopf- oder Rachentumor',
      'Allergien mit HNO-Beteiligung (Heuschnupfen)',
    ],
    faqs: [
      { q: 'Was macht ein HNO-Arzt?', a: 'Der HNO-Arzt behandelt Erkrankungen der Ohren, der Nase und der Nebenhöhlen, des Mundes, Rachens und Kehlkopfs sowie Störungen von Hören, Gleichgewicht, Riechen, Schmecken und Stimme. Diagnostik umfasst unter anderem Hörtests, Endoskopie und Gleichgewichts­prüfungen.' },
      { q: 'Ist ein Hörsturz ein Notfall?', a: 'Ein Hörsturz – die plötzliche einseitige Hörminderung ohne erkennbare Ursache – sollte innerhalb weniger Tage HNO-ärztlich abgeklärt und behandelt werden. Zwar handelt es sich nicht um einen 112-Notfall, aber je früher die Therapie beginnt, desto besser die Chance auf Erholung des Hörvermögens.' },
      { q: 'Was hilft gegen chronischen Tinnitus?', a: 'Ein neu aufgetretener Tinnitus sollte HNO-ärztlich abgeklärt werden. Bei chronischem Tinnitus (länger als drei Monate) stehen keine „Heilverfahren" zur Verfügung, aber verschiedene therapeutische Ansätze wie Tinnitus-Retraining, Verhaltenstherapie oder Hörgeräteanpassung können den Umgang deutlich verbessern.' },
      { q: 'Wann ist ein Hörgerät sinnvoll?', a: 'Wenn ein audiometrisch nachweisbarer Hörverlust den Alltag beeinträchtigt (Verstehen in Gesprächen, Fernseher zu laut, häufiges Nachfragen), ist eine Hörgeräte­anpassung sinnvoll. Der HNO-Arzt stellt die Verordnung aus, die Anpassung erfolgt beim Hörakustiker.' },
      { q: 'Wie oft sollten Kinder zum HNO-Arzt?', a: 'Nur bei Beschwerden – meist bei wiederkehrenden Mittelohrentzündungen, vergrößerten Rachenmandeln (Polypen), Sprachentwicklungs­verzögerungen oder Verdacht auf eingeschränktes Hörvermögen. Ansonsten übernimmt der Kinderarzt die HNO-relevanten Basisuntersuchungen.' },
    ],
    relatedSlugs: ['hausarzt', 'kinderarzt', 'neurologe'],
    symptomHints: ['Ohrenschmerzen', 'Hörsturz', 'Tinnitus, Schwindel', 'Chronische Nebenhöhlen', 'Schnarchen, Schlafapnoe'],
  },

  urologe: {
    subline: 'Facharzt für Urologie',
    intro: `Der Urologe ist Facharzt für Erkrankungen der Harnorgane (Nieren, Harnleiter, Blase, Harnröhre) sowie der männlichen Geschlechtsorgane. Zu seinen häufigen Behandlungs­feldern gehören Blasenentzündungen und Harnwegsinfekte, Nieren- und Harnleiter­steine, Prostatabeschwerden (gutartige Vergrößerung, Entzündung, Krebsvorsorge), Blasenfunktions­störungen (Inkontinenz) sowie andrologische Themen (Fruchtbarkeit, Erektionsstörungen).`,
    intro2: `Für gesetzlich versicherte Männer besteht ab dem 45. Lebensjahr Anspruch auf eine jährliche Krebs­früherkennungs­untersuchung, die vor allem die Prostata und äußeren Geschlechtsorgane umfasst. Die zusätzliche PSA-Bestimmung im Blut ist keine reine Kassenleistung und wird häufig als IGeL angeboten – der individuelle Nutzen sollte urologisch besprochen werden.`,
    whenToVisit: [
      'Brennen beim Wasserlassen, häufiger Harndrang (Harnwegsinfekt-Verdacht)',
      'Blut im Urin oder Sperma',
      'Flankenschmerzen (Nierenstein-Verdacht)',
      'Erhöhter Harndrang nachts, abgeschwächter Harnstrahl (Prostata-Beschwerden)',
      'Krebs-Vorsorge Prostata (ab 45)',
      'Verdacht auf Hoden-Erkrankungen (Verhärtungen, Schmerzen)',
      'Kinderwunsch, Fruchtbarkeitsstörungen des Mannes',
      'Erektions- oder Ejakulations-Störungen',
      'Vasektomie (Sterilisation des Mannes)',
    ],
    faqs: [
      { q: 'Ist Urologie eine Fachrichtung nur für Männer?', a: 'Nein, der Urologe betreut sowohl Männer als auch Frauen bei Erkrankungen der Nieren, Harnleiter, Blase und Harnröhre – etwa bei Nierensteinen, wiederkehrenden Harnwegsinfekten oder Inkontinenz. Zusätzlich versorgt er speziell die männlichen Geschlechtsorgane (Prostata, Hoden, Penis).' },
      { q: 'Ab wann Prostata-Vorsorge?', a: 'Die gesetzliche Krebsfrüherkennung für Männer beginnt ab 45. Bei familiärer Vorbelastung (Vater, Bruder) empfehlen Fachgesellschaften ein Erstgespräch bereits ab 40 – auch wenn keine Beschwerden bestehen.' },
      { q: 'Was ist ein PSA-Test und wird er von der Kasse bezahlt?', a: 'Das PSA (Prostata-spezifisches Antigen) ist ein Bluttest, der Hinweise auf Prostata-Erkrankungen liefert. Er ist Bestandteil des IGeL-Katalogs und wird nicht regulär von den gesetzlichen Kassen übernommen. Der urologische Arzt bespricht Nutzen und Grenzen der Untersuchung individuell.' },
      { q: 'Was hilft bei wiederkehrenden Harnwegsinfekten?', a: 'Bei wiederkehrenden Infekten (mehr als 2 pro Halbjahr oder 3 pro Jahr) sollte urologisch abgeklärt werden, ob eine anatomische oder funktionelle Ursache vorliegt. Neben antibiotischer Behandlung akuter Infekte kommen präventive Maßnahmen wie ausreichende Trinkmenge, Miktionsverhalten, D-Mannose, Impfungen oder Immunstimulantien in Betracht.' },
      { q: 'Sind Erektionsstörungen ein Fall für den Urologen?', a: 'Ja. Erektionsstörungen können vielfältige Ursachen haben – von Herz-Kreislauf-Erkrankungen über Diabetes und hormonelle Störungen bis zu psychischen Faktoren. Der Urologe (idealerweise mit andrologischer Schwerpunktbezeichnung) klärt die Ursache ab und bespricht Therapieoptionen.' },
    ],
    relatedSlugs: ['hausarzt', 'internist', 'chirurg'],
    symptomHints: ['Harnwegsinfekt', 'Prostata-Beschwerden', 'Nierenstein', 'Inkontinenz', 'Erektionsstörungen'],
  },

  neurologe: {
    subline: 'Facharzt für Erkrankungen des Nervensystems',
    intro: `Der Neurologe ist auf Erkrankungen des zentralen (Gehirn, Rückenmark) und peripheren Nervensystems sowie der Muskeln spezialisiert. Häufige Erkrankungs­bilder sind Migräne und Spannungs­kopfschmerz, Bandscheibenvorfälle mit Nervenwurzel-Beteiligung, Polyneuropathien, Multiple Sklerose (MS), Morbus Parkinson, Epilepsie sowie die Abklärung nach Schlaganfall.`,
    intro2: `Neurologische Diagnostik nutzt EEG (Elektroenzephalographie), ENG/EMG (Nerv- und Muskelfunktions­messungen), Ultraschall der hirnversorgenden Gefäße, evozierte Potenziale sowie in Zusammenarbeit mit Radiologen MRT und CT. Bei akuten Symptomen wie plötzlicher Lähmung, Sprachstörung oder Sehstörung ist umgehend der Notruf 112 zu wählen – Verdacht auf Schlaganfall!`,
    whenToVisit: [
      'Wiederkehrende Kopfschmerzen, Migräne',
      'Verdacht auf Multiple Sklerose (MS)',
      'Zittern, Bewegungs­störungen (Parkinson-Abklärung)',
      'Epileptische Anfälle',
      'Taubheit, Kribbeln oder Kraftverlust in Armen oder Beinen',
      'Schwindel neurologischer Ursache',
      'Nach Schlaganfall (Diagnostik und Nachsorge)',
      'Demenz-Abklärung',
      'Chronische Nervenschmerzen',
    ],
    faqs: [
      { q: 'Wo liegt der Unterschied zwischen Neurologe und Psychiater?', a: 'Der Neurologe behandelt organische Erkrankungen des Nervensystems (z. B. Schlaganfall, MS, Parkinson, Epilepsie), der Psychiater primär psychische Erkrankungen (z. B. Depression, Schizophrenie, bipolare Störung). Beide Fachrichtungen überschneiden sich bei Themen wie Demenz oder somatoformen Störungen und arbeiten dort oft eng zusammen.' },
      { q: 'Was ist ein EEG?', a: 'Das Elektroenzephalogramm (EEG) misst die elektrische Aktivität des Gehirns über Elektroden auf der Kopfhaut. Es ist die wichtigste Untersuchung bei Epilepsie-Verdacht, wird aber auch bei bestimmten Kopfschmerz- und Bewusstseins­störungen eingesetzt.' },
      { q: 'Sind alle Kopfschmerzen ein Fall für den Neurologen?', a: 'Nein. Alltägliche Kopfschmerzen kann meist der Hausarzt behandeln. Zum Neurologen sollten Sie bei starken, wiederkehrenden Migräne-Attacken, plötzlich auftretenden ungewohnten Kopfschmerzen, Kopfschmerzen mit neurologischen Ausfällen oder ausbleibender Besserung unter Standard­therapie.' },
      { q: 'Bei welchen Symptomen sofort den Notruf 112?', a: 'Bei den FAST-Symptomen: F = Face (einseitige Gesichtslähmung), A = Arms (einseitige Armschwäche), S = Speech (Sprachstörung), T = Time (Zeit ist Hirn – sofort 112). Auch plötzliches Sehen von Doppelbildern oder starker Schwindel mit Erbrechen sind Alarmzeichen.' },
      { q: 'Wie lange dauert es bis zu einem Neurologen-Termin?', a: 'Neurologische Praxen haben oft mehrere Wochen Wartezeit. Für dringliche Fragestellungen ist die Terminservicestelle 116 117 der schnellste Weg, für akute neurologische Symptome die Notaufnahme.' },
    ],
    relatedSlugs: ['psychiater', 'hausarzt', 'orthopaede'],
    symptomHints: ['Migräne, Kopfschmerz', 'Taubheit, Kribbeln', 'Schwindel neurologischer Art', 'Demenz-Abklärung', 'Nach Schlaganfall'],
  },

  psychiater: {
    subline: 'Facharzt für Psychiatrie und Psychotherapie',
    intro: `Der Psychiater ist Facharzt für psychische Erkrankungen und darf – im Gegensatz zum reinen Psychotherapeuten – auch Medikamente verschreiben. Behandlungs­schwerpunkte sind Depressionen, Angst- und Panikstörungen, bipolare Störung, Schizophrenie, Zwangs- und Ess­störungen, Suchterkrankungen, ADHS sowie Demenzerkrankungen.`,
    intro2: `Die Behandlung kombiniert häufig medikamentöse Therapie (Antidepressiva, Neuroleptika, Stimmungsstabilisierer) mit psychotherapeutischen Verfahren – oft in Kooperation mit einem Psychologischen Psychotherapeuten. In Akutsituationen (Suizidalität, schwere psychotische Zustände) sind psychiatrische Ambulanzen und Kliniken auch außerhalb der Sprechzeiten erreichbar.`,
    whenToVisit: [
      'Anhaltende Niedergeschlagenheit, Antriebslosigkeit, Interessenverlust',
      'Panikattacken, Angstzustände, soziale Ängste',
      'Zwangs­gedanken, Zwangs­handlungen',
      'Schlafstörungen mit deutlichem Leidensdruck',
      'Abhängigkeitserkrankungen (Alkohol, Medikamente, Drogen)',
      'Verdacht auf ADHS im Erwachsenenalter',
      'Bipolare Störungen (starke Stimmungsschwankungen)',
      'Psychotische Symptome (Halluzinationen, Wahn)',
      'Medikamentöse Einstellung bei bekannter Diagnose',
    ],
    faqs: [
      { q: 'Was unterscheidet einen Psychiater von einem Psychotherapeuten?', a: 'Der Psychiater ist Arzt mit Facharztausbildung in Psychiatrie – er darf Medikamente verordnen und arbeitet oft interdisziplinär. Der Psychologische Psychotherapeut ist Psychologe mit therapeutischer Weiterbildung und arbeitet ausschließlich mit Gesprächs- und verhaltens­therapeutischen Verfahren; er darf keine Medikamente verschreiben.' },
      { q: 'Wann sollte ich zum Psychiater?', a: 'Bei deutlichem Leidensdruck durch psychische Symptome über mehrere Wochen (Depression, Angst, Zwang, Sucht), bei Verdacht auf schwere psychische Erkrankungen, bei Bedarf an medikamentöser Behandlung oder wenn eine ambulante Psychotherapie allein nicht ausreicht.' },
      { q: 'Sind psychiatrische Medikamente gefährlich oder machen sie abhängig?', a: 'Antidepressiva und die meisten Neuroleptika machen nicht abhängig. Bei Benzodiazepinen und einigen Schlafmitteln besteht Abhängigkeits­potenzial – hier wird psychiatrisch besonders sorgfältig indiziert und dosiert. Alle Präparate haben ein Nebenwirkungsprofil, das vor der Verordnung besprochen wird.' },
      { q: 'Wie lange dauert eine psychiatrische Behandlung?', a: 'Das hängt vom Krankheitsbild ab. Depressionen werden meist über 6 Monate bis mehrere Jahre medikamentös behandelt (auch nach Symptomfreiheit zur Rückfallprophylaxe). Chronische Erkrankungen wie Schizophrenie oder bipolare Störung erfordern oft eine mehrjährige oder dauerhafte Betreuung.' },
      { q: 'Was tun in einer psychischen Krise?', a: 'Bei akuter Suizidgefahr oder unmittelbarem Fremd- oder Selbstgefährdungs­risiko wählen Sie sofort den Notruf 112 oder fahren in die nächste psychiatrische Klinik. Für nicht-lebensbedrohliche Krisen ist der Telefonseelsorge-Notruf 0800 111 0 111 oder 0800 111 0 222 rund um die Uhr kostenfrei erreichbar.' },
    ],
    relatedSlugs: ['psychotherapeut', 'neurologe', 'hausarzt'],
    symptomHints: ['Depression', 'Angst, Panik', 'Zwang', 'Sucht', 'ADHS Erwachsene'],
  },

  psychotherapeut: {
    subline: 'Psychologische und ärztliche Psychotherapie',
    intro: `Der Psychotherapeut behandelt psychische Erkrankungen und Belastungen mit anerkannten psychotherapeutischen Verfahren. In Deutschland gibt es zwei Berufsgruppen: den Psychologischen Psychotherapeuten (Studium der Psychologie plus mehrjährige Therapieausbildung) und den Ärztlichen Psychotherapeuten (approbierter Arzt mit psychotherapeutischer Zusatzweiterbildung). Beide dürfen abrechnungs­fähig therapieren, aber nur der ärztliche Psychotherapeut oder Psychiater darf Medikamente verordnen.`,
    intro2: `Die von den gesetzlichen Krankenkassen erstatteten Therapieformen sind Verhaltenstherapie (VT), Tiefenpsychologisch fundierte Psychotherapie (TP), Analytische Psychotherapie (AP) und Systemische Therapie (ST). Vor Therapiebeginn erfolgen bis zu vier probatorische Sitzungen; danach wird die Weiter­behandlung bei der Kasse beantragt (Kurzzeit- oder Langzeit­therapie).`,
    whenToVisit: [
      'Depressive Verstimmungen, Antriebslosigkeit',
      'Angst- und Panikstörungen, Phobien',
      'Traumafolgestörungen (PTBS)',
      'Zwangserkrankungen',
      'Essstörungen (Anorexie, Bulimie, Binge-Eating)',
      'Beziehungs- oder Lebenskrisen',
      'Burnout und chronische Erschöpfung',
      'Somatoforme Störungen (körperliche Beschwerden ohne organische Ursache)',
      'Persönlichkeits­störungen',
    ],
    faqs: [
      { q: 'Wer bezahlt eine Psychotherapie?', a: 'Bei nachgewiesener psychischer Erkrankung übernehmen die gesetzlichen Krankenkassen die Kosten für Verhaltens-, Tiefenpsychologisch fundierte, Analytische und Systemische Therapie – vorausgesetzt der Therapeut ist Kassen­zugelassen. Privat­versicherte und Selbstzahler klären Umfang und Erstattung vorab mit ihrer Versicherung.' },
      { q: 'Wie lange dauert eine Psychotherapie?', a: 'Kurzzeittherapie: 12 bis 24 Sitzungen. Langzeittherapie: bis zu 60 (VT), 100 (TP) oder 300 Sitzungen (AP). Die Sitzungen finden meist wöchentlich statt und dauern 50 Minuten (Einzel).' },
      { q: 'Wie finde ich einen Therapieplatz?', a: 'Erstberatung („Psychotherapeutische Sprechstunde") ist bei allen Kassenzugelassenen möglich. Wartezeiten bis zum Beginn der eigentlichen Therapie sind jedoch häufig lang (Monate). Die Terminservicestelle 116 117 vermittelt Sprechstunden. Alternativ hilft die Suche nach Praxen mit freien Kapazitäten – oft am schnellsten in der Verhaltenstherapie.' },
      { q: 'Verhaltenstherapie oder Tiefenpsychologie – was passt zu mir?', a: 'Verhaltenstherapie ist zielorientiert und arbeitet an aktuellen Denk- und Verhaltensmustern. Tiefenpsychologisch fundierte Therapie sucht nach unbewussten Konflikten aus der eigenen Biografie. Beide Verfahren sind wirksam; die Wahl hängt vom Störungsbild, Ihrer Erwartung und der persönlichen Passung mit dem Therapeuten ab. Die probatorischen Sitzungen dienen genau dieser Klärung.' },
      { q: 'Muss der Arbeitgeber von der Therapie erfahren?', a: 'Nein. Psychotherapeutische Behandlungen unterliegen der ärztlichen Schweigepflicht. Nur bei Krankschreibung erhält der Arbeitgeber – ohne Diagnose – die Bescheinigung über Arbeitsunfähigkeit. Auch Verbeamtung oder Berufsunfähigkeits­versicherung sind ein separates Thema, das im Vorfeld individuell zu prüfen ist.' },
    ],
    relatedSlugs: ['psychiater', 'hausarzt'],
    symptomHints: ['Depression', 'Angst, Panik', 'Trauma', 'Burnout', 'Essstörung'],
  },

  radiologe: {
    subline: 'Bildgebende Diagnostik – MRT, CT, Röntgen',
    intro: `Der Radiologe ist Facharzt für bildgebende Diagnostik und interventionelle Radiologie. Sein Arbeitsfeld umfasst Röntgen, Ultraschall, Computertomographie (CT), Magnetresonanz­tomographie (MRT), Mammographie sowie bildgesteuerte therapeutische Eingriffe. Die überweisenden Ärzte sind meist Orthopäden, Neurologen, Internisten oder Hausärzte.`,
    intro2: `Ein Radiologen-Termin erfordert in aller Regel eine Überweisung – radiologische Leistungen gehören zu den wenigen Facharzt­leistungen, für die gesetzlich Versicherte in Deutschland zwingend eine Überweisung benötigen. Für MRT-Untersuchungen sind Wartezeiten von mehreren Wochen üblich; dringende Fragestellungen werden bevorzugt terminiert.`,
    whenToVisit: [
      'Vom behandelnden Arzt angeordnete Bildgebung (Röntgen, CT, MRT)',
      'Abklärung von Rückenschmerzen, Bandscheibenvorfällen',
      'Tumor-Diagnostik oder -Verlaufskontrolle',
      'Gefäßuntersuchungen (Angiographie)',
      'Mammographie-Screening',
      'Sport- oder Unfallverletzungen',
      'Kopfschmerzen mit neurologischer Fragestellung',
      'Bildgesteuerte Eingriffe (z. B. Facettengelenks-Infiltration)',
    ],
    faqs: [
      { q: 'Was ist der Unterschied zwischen CT und MRT?', a: 'Die Computertomographie (CT) arbeitet mit Röntgenstrahlen und ist besonders gut für Knochen, akute Blutungen und Lungenuntersuchungen. Die Magnetresonanz­tomographie (MRT) nutzt starke Magnetfelder ohne Strahlenbelastung und zeigt Weichteile, Gehirn, Rückenmark und Gelenke sehr detailliert.' },
      { q: 'Warum brauche ich eine Überweisung zum Radiologen?', a: 'Für radiologische Kassenleistungen in Deutschland ist eine Überweisung zwingend – anders als bei den meisten anderen Facharzt­gruppen. Der überweisende Arzt gibt die Frage­stellung an und beurteilt die Notwendigkeit unter Strahlen­schutz­aspekten.' },
      { q: 'Wie läuft ein MRT ab?', a: 'Sie werden auf einer Liege in eine Röhre gefahren. Die Untersuchung dauert je nach Fragestellung 15 bis 45 Minuten und ist mit lauten Klopfgeräuschen verbunden (Gehörschutz wird bereitgestellt). Bei Klaustrophobie gibt es offene MRT-Geräte oder eine leichte Beruhigung nach Absprache. Metall-Implantate müssen vorab bekannt sein.' },
      { q: 'Muss ich für Kontrastmittel bezahlen?', a: 'Medizinisch indiziertes Kontrastmittel ist Bestandteil der radiologischen Untersuchung und wird von der Kasse übernommen. Bei bekannter Nierenschwäche, Schilddrüsen­überfunktion oder früheren allergischen Reaktionen ist die Anwendung mit dem Radiologen zu besprechen.' },
      { q: 'Wie schnell erhalte ich den Befund?', a: 'Der schriftliche Befund geht in der Regel innerhalb weniger Tage an den überweisenden Arzt. Bei dringlichen Fragestellungen kann eine mündliche Erst­einschätzung direkt nach der Untersuchung erfolgen. Manche Praxen stellen Bilder auf CD/USB oder digital über Patienten­portale bereit.' },
    ],
    relatedSlugs: ['orthopaede', 'neurologe', 'internist'],
    symptomHints: ['MRT nach Überweisung', 'Bandscheibenvorfall bildlich', 'Tumor-Diagnostik', 'Mammographie'],
  },

  internist: {
    subline: 'Facharzt für Innere Medizin',
    intro: `Der Internist ist Facharzt für Innere Medizin und beschäftigt sich mit den Erkrankungen der inneren Organe: Herz-Kreislauf-System, Verdauungstrakt, Nieren, Lunge, Blut, Hormonsystem sowie Stoffwechsel. Viele Internisten haben zusätzliche Schwerpunkte wie Kardiologie, Gastroenterologie, Pneumologie, Nephrologie, Endokrinologie/Diabetologie, Hämatologie/Onkologie oder Rheumatologie.`,
    intro2: `Internisten arbeiten sowohl als „hausärztlich tätige Internisten" (mit denselben Aufgaben wie Hausärzte) als auch als spezialisierte Fachärzte auf Überweisung. Zum diagnostischen Basisprogramm gehören Ultraschall, Labor, EKG und Endoskopien wie Magenspiegelung und Darmspiegelung.`,
    whenToVisit: [
      'Unklare Beschwerden im Brust- oder Bauchraum',
      'Bluthochdruck-Einstellung, Diabetes-Betreuung',
      'Magen-Darm-Beschwerden, Refluxkrankheit',
      'Vorsorge-Darmspiegelung ab 50/55',
      'Gewichtsverlust, chronische Müdigkeit, unklare Blutwerte',
      'Schilddrüsen­erkrankungen',
      'Rheumatologische Fragestellungen',
      'Chronische Lungenerkrankungen (Asthma, COPD)',
      'Hämatologische Fragen (Blutbild-Auffälligkeiten)',
    ],
    faqs: [
      { q: 'Ist der Internist mein Hausarzt?', a: 'Nicht automatisch. Es gibt hausärztlich tätige Internisten – die übernehmen die gleiche Rolle wie ein Allgemeinmediziner. Fachinternisten arbeiten als Spezialisten (etwa Kardiologe, Gastroenterologe) auf Überweisung. Das Praxisschild oder die Website gibt Aufschluss.' },
      { q: 'Ab wann Darmspiegelung zur Krebsvorsorge?', a: 'Männer haben Anspruch auf eine Vorsorge-Darmspiegelung ab dem 50. Lebensjahr, Frauen ab dem 55. Alternativ kann jährlich ein immunologischer Stuhltest (iFOBT) durchgeführt werden. Bei familiärer Vorbelastung wird individuell ein früherer Beginn empfohlen.' },
      { q: 'Was ist eine Endoskopie?', a: 'Eine Endoskopie ist die Untersuchung von Hohlorganen mit einem flexiblen Instrument, das Kamera und Instrumente enthält. Gastroskopie = Magenspiegelung, Koloskopie = Darmspiegelung. Beide werden in der Regel mit einer leichten Sedierung durchgeführt.' },
      { q: 'Wie unterscheidet sich der Internist vom Kardiologen?', a: 'Der Kardiologe ist ein spezialisierter Internist mit Schwerpunkt Herz-Kreislauf-Erkrankungen. Andere internistische Spezialisten sind Gastroenterologen (Magen-Darm), Nephrologen (Nieren), Pneumologen (Lunge), Endokrinologen (Hormone) und Hämato-Onkologen (Blut/Krebs).' },
      { q: 'Was macht die internistische Vorsorge?', a: 'Kernbestandteile sind ein ausführliches Anamnesegespräch, körperliche Untersuchung, Blutdruck, EKG, Blutlabor (u. a. Blutbild, Blutzucker, Cholesterin, Nieren- und Leberwerte, Schilddrüse), Urinuntersuchung sowie je nach Alter und Risikoprofil weiterführende Untersuchungen wie Bauch-Ultraschall.' },
    ],
    relatedSlugs: ['hausarzt', 'kardiologe', 'radiologe'],
    symptomHints: ['Bluthochdruck, Diabetes', 'Magen-Darm-Beschwerden', 'Darmkrebs-Vorsorge', 'Schilddrüse', 'Unklare Blutwerte'],
  },

  chirurg: {
    subline: 'Operative Medizin – von der Wundversorgung bis zur Fach-OP',
    intro: `Der Chirurg deckt ein breites operatives Fachgebiet ab. Die klassische Fachbezeichnung „Chirurgie" wurde in Deutschland in mehrere Fachgebiete unterteilt: Allgemein- und Viszeralchirurgie (Bauchorgane), Gefäßchirurgie, Herzchirurgie, Thoraxchirurgie, Kinderchirurgie, Plastische und Ästhetische Chirurgie, Mund-Kiefer-Gesichtschirurgie sowie Orthopädie und Unfallchirurgie. Niedergelassene Chirurgen führen ambulante Eingriffe durch und betreuen die Wund- und Nachsorge nach stationären Operationen.`,
    intro2: `Für Praxen mit Schwerpunkt Unfallchirurgie ist häufig die berufsgenossen­schaftliche Zulassung (D-Arzt-Verfahren) gegeben – dort werden Arbeitsunfälle behandelt. Ambulante Eingriffe reichen von kleineren Weichteil-Operationen über Hernien (Leistenbruch) bis zu Verletzungen von Sehnen, Bändern und kleineren Frakturen.`,
    whenToVisit: [
      'Unfallverletzungen, Wundversorgung',
      'Ambulante Operationen (Muttermal-Entfernung, kleine Weichteil-Eingriffe)',
      'Hernien (Leistenbruch, Nabelbruch)',
      'Krampfadern (Varizen)',
      'Präoperative Beratung und postoperative Nachsorge',
      'Sportverletzungen',
      'Verletzungen von Sehnen, Bändern, Nerven',
      'Chronische Wunden (u.a. bei Diabetes)',
      'Berufsgenossenschaftlich versicherte Arbeitsunfälle',
    ],
    faqs: [
      { q: 'Was ist der Unterschied zwischen Chirurg und Orthopäde?', a: 'Der Orthopäde konzentriert sich auf Erkrankungen des Bewegungsapparats – konservativ und operativ. Der (allgemeine) Chirurg deckt Weichteile, Bauchorgane, Wundversorgung und operative Eingriffe außerhalb des Bewegungs­apparats ab. Seit 2005 gibt es die gemeinsame Facharzt­bezeichnung „Orthopädie und Unfallchirurgie".' },
      { q: 'Kann eine OP ambulant durchgeführt werden?', a: 'Viele kleinere Eingriffe (Hautveränderungen, kleinere Weichteil-Operationen, Krampfadern, gewisse arthroskopische Eingriffe) werden ambulant durchgeführt. Die Entscheidung hängt vom Eingriff, dem Allgemeinzustand des Patienten und den häuslichen Bedingungen ab.' },
      { q: 'Was ist ein D-Arzt?', a: 'Der Durchgangsarzt (D-Arzt) ist ein von der gesetzlichen Unfallversicherung (Berufsgenossenschaft) besonders qualifizierter Chirurg oder Orthopäde. Bei Arbeitsunfällen und Wegeunfällen ist der Erstvorstellung beim D-Arzt vorgeschrieben.' },
      { q: 'Was ist eine Hernie (Leistenbruch)?', a: 'Eine Hernie ist eine Lücke in der Bauchwand, durch die Gewebe (meist Fett oder Darmschlingen) austreten kann. Leistenbrüche sind bei Männern häufiger und werden meist operativ verschlossen. Die OP ist gut planbar und wird oft ambulant durchgeführt.' },
      { q: 'Was tun bei einer akuten Wunde am Wochenende?', a: 'Kleine, oberflächliche Wunden können nach gründlicher Reinigung und Desinfektion selbst versorgt werden. Tiefe Schnitte, klaffende Wunden oder Wunden mit Fremdkörpern gehören in die Notaufnahme oder zum chirurgischen Notdienst. Bei Bisswunden oder unklarem Impfschutz gegen Tetanus zeitnah ärztliche Vorstellung.' },
    ],
    relatedSlugs: ['orthopaede', 'internist', 'urologe'],
    symptomHints: ['Wundversorgung', 'Ambulante OPs', 'Hernien', 'Krampfadern', 'Sportverletzungen'],
  },

  physiotherapeut: {
    subline: 'Bewegungstherapie und funktionelle Rehabilitation',
    intro: `Der Physiotherapeut behandelt auf ärztliche Verordnung Beschwerden des Bewegungs­apparats, neurologische Erkrankungen und postoperative Rehabilitations­bedarfe. Zu den anerkannten Verfahren gehören Krankengymnastik, Manuelle Therapie, Lymphdrainage, Elektro­therapie, Wärme-/Kälte­anwendungen und Bobath (in der Neuro­rehabilitation).`,
    intro2: `Physiotherapie ist in Deutschland ein Heilmittel – die Kosten werden von der gesetzlichen Krankenkasse übernommen, wenn eine ärztliche Verordnung („Rezept über Heilmittel") vorliegt. Erwachsene zahlen 10 % Zuzahlung plus 10 € pro Verordnung. Physiotherapeutische Praxen haben oft mehrere Wochen Wartezeit; ein direkter Zugang ohne Verordnung („Direct Access") ist in Deutschland weitgehend nicht möglich, außerhalb von reinen Selbstzahler-Anwendungen wie Personal Training.`,
    whenToVisit: [
      'Nach orthopädischer Diagnose (Rückenschmerzen, Arthrose, Bandscheibenvorfall)',
      'Postoperative Rehabilitation (nach Knie-, Hüft-OP)',
      'Nach Frakturen und Sportverletzungen',
      'Chronische Nackenschmerzen und Verspannungen',
      'Neurologische Rehabilitation (Schlaganfall, Multiple Sklerose, Parkinson)',
      'Kinderphysio­therapie (Bobath, Vojta)',
      'Lymphödem nach Operation',
      'Skoliose und Haltungsprobleme',
    ],
    faqs: [
      { q: 'Wer verordnet Physiotherapie?', a: 'In der Regel Ihr Hausarzt oder ein Facharzt (Orthopäde, Neurologe, Chirurg). Das Rezept enthält Anzahl der Sitzungen, Behandlungsart und die Diagnose. Erst mit dieser Verordnung ist die Physiotherapie Kassenleistung.' },
      { q: 'Was ist Manuelle Therapie?', a: 'Die Manuelle Therapie ist eine spezialisierte Behandlungsform zur Diagnostik und Therapie von Funktions­störungen der Gelenke, Muskeln und Nerven. Sie umfasst gezielte Handgriffe und Mobilisationen. Nicht jeder Physiotherapeut hat die Zusatz­qualifikation – für eine kassenübernommene Behandlung ist sie erforderlich.' },
      { q: 'Wie oft und wie lange Physiotherapie?', a: 'Die Regelverordnung umfasst meist 6 Behandlungen; nach ärztlicher Kontrolle kann verlängert werden. Sitzungen dauern typischerweise 15 bis 30 Minuten (Krankengymnastik) oder länger bei Manueller Therapie oder Manueller Lymphdrainage.' },
      { q: 'Was mache ich, wenn kein Physio-Termin verfügbar ist?', a: 'Wartelisten sind üblich. Ein Wechsel der Praxis kann helfen, ebenso das Nachfragen nach Absagen. Bei akutem Bedarf (frisch operiert, akuter Bandscheibenvorfall) sollten Sie beim Rezept auf die Dringlichkeit hinweisen; dann ist eine „vorrangige Versorgung" möglich.' },
      { q: 'Ist Osteopathie das Gleiche wie Physiotherapie?', a: 'Nein. Osteopathie ist ein manuelles Behandlungsverfahren mit eigenem Ansatz. Sie darf in Deutschland von Heilpraktikern und Ärzten mit Zusatzausbildung ausgeübt werden – nicht von Physiotherapeuten ohne entsprechende Weiterbildung. Die Kostenübernahme durch die Krankenkasse ist begrenzt und regelt jede Kasse anders.' },
    ],
    relatedSlugs: ['orthopaede', 'chirurg'],
    symptomHints: ['Rückenschmerzen', 'Nach OP', 'Sportverletzung', 'Verspannungen', 'Neuro-Rehabilitation'],
  },

  apotheke: {
    subline: 'Beratung, Rezepte, Notdienst',
    intro: `Die Apotheke ist die zentrale Anlaufstelle für die Ausgabe verschreibungs­pflichtiger und rezeptfreier Medikamente sowie für pharmazeutische Beratung. Apotheker durchlaufen ein fünfjähriges Studium der Pharmazie und ein Praktisches Jahr. Neben der reinen Medikamentenabgabe bieten viele Apotheken ergänzende Leistungen an: Blutdruck- und Blutzuckermessungen, Medikamentenchecks, Impfaktionen (Grippe), individuelle Rezepturen und Beratung bei Reisemedizin.`,
    intro2: `Seit 2023 gilt in Deutschland stufenweise das E-Rezept: Rezepte werden digital über die elektronische Gesundheitskarte eingelöst. Notdienst­apotheken sind rund um die Uhr erreichbar; die aktuelle Notdienstapotheke wird über die telefonische Auskunft 0800 00 22 8 33 (kostenfrei) oder die Websites der Landes­apothekerkammern gefunden.`,
    whenToVisit: [
      'Einlösung ärztlicher Rezepte (Papier oder E-Rezept)',
      'Beratung zu rezeptfreien Arzneimitteln',
      'Wechselwirkungs-Check bei mehreren Medikamenten',
      'Impfberatung und Impfstoff-Bereitstellung',
      'Reisemedizinische Beratung',
      'Blutdruck- oder Blutzucker-Messung',
      'Notfallverhütung („Pille danach")',
      'Bestellung individueller Rezepturen',
              'Notdienst-Ausgabe rund um die Uhr',
    ],
    faqs: [
      { q: 'Was ist ein E-Rezept?', a: 'Das E-Rezept ist die digitale Version des Papier-Rezepts. Es wird auf der elektronischen Gesundheitskarte (eGK) gespeichert oder über die Gematik-E-Rezept-App abgerufen. Sie legen einfach Ihre Karte in der Apotheke vor. Für Privatrezepte gilt es aktuell nicht flächendeckend.' },
      { q: 'Was leistet die Notdienst-Apotheke?', a: 'Notdienstapotheken haben rund um die Uhr geöffnet und geben verschreibungs­pflichtige Medikamente auch außerhalb der Öffnungszeiten aus. Für den Notdienst­einsatz wird eine Zuzahlung von 2,50 Euro erhoben.' },
      { q: 'Können Apotheken impfen?', a: 'Seit 2020 dürfen Apotheker gegen Grippe und in einigen Bundesländern gegen COVID-19 impfen, sofern sie eine entsprechende Fortbildung absolviert haben. Weitere Impfungen (Reiseimpfungen, Standardimpfungen) erfolgen weiterhin beim Arzt.' },
      { q: 'Was ist eine Rezeptur?', a: 'Rezepturen sind Arzneimittel, die individuell in der Apotheke hergestellt werden – häufig Salben, Cremes oder Tropfen mit ärztlich vorgegebener Zusammensetzung. Die Herstellung dauert je nach Rezeptur einige Stunden bis wenige Tage.' },
      { q: 'Gibt es einen Botendienst?', a: 'Viele Apotheken bieten einen kostenfreien oder kostenpflichtigen Botendienst innerhalb ihres Einzugsgebiets an. Fragen Sie in Ihrer Stammapotheke telefonisch nach – gerade für ältere oder immobile Patienten ist das eine bequeme Option.' },
    ],
    relatedSlugs: ['hausarzt', 'krankenhaus'],
    symptomHints: ['Rezept einlösen', 'Beratung OTC', 'Notdienst', 'Reisemedizin', 'Impfstoff'],
  },

  krankenhaus: {
    subline: 'Stationäre Versorgung, Notaufnahme und Facharzt-Zentren',
    intro: `Krankenhäuser (Kliniken) stellen die stationäre medizinische Versorgung sicher. In Deutschland gibt es rund 1.900 Krankenhäuser mit verschiedenen Versorgungsstufen: Grund- und Regelversorgung, Schwerpunkt­versorgung, Maximal­versorgung sowie Universitäts­kliniken. Jedes Krankenhaus unterhält eine Notaufnahme; Universitäts­kliniken bieten Zentren für hochspezialisierte Behandlungen (Onkologie, Kardiologie, Neurochirurgie, Transplantations­medizin).`,
    intro2: `Bei akuten, lebensbedrohlichen Notfällen wählen Sie die 112. Für dringende, aber nicht lebensbedrohliche medizinische Anliegen außerhalb der Praxis-Öffnungszeiten ist der Bereitschafts­dienst 116 117 die richtige Anlaufstelle. Die Auswahl eines Krankenhauses (etwa für eine geplante Operation) sollte anhand von Fallzahlen, Zertifizierungen und Erfahrung mit dem konkreten Krankheitsbild getroffen werden – öffentliche Qualitätsberichte helfen dabei.`,
    whenToVisit: [
      'Geplante Operationen (Aufnahme durch Überweisung)',
      'Akute, aber nicht lebensbedrohliche Beschwerden über Notaufnahme',
      'Geburten (Kreißsaal, Wochenbett-Station)',
      'Diagnostik komplexer Krankheitsbilder',
      'Onkologische Behandlungen (Chemo, Bestrahlung, OP)',
      'Rehabilitation nach schweren Erkrankungen',
      'Zweitmeinungen in Fachzentren',
      'Ambulante Behandlung in spezialisierten Kliniken',
    ],
    faqs: [
      { q: 'Wann in die Notaufnahme, wann zu 116 117?', a: 'Notaufnahme (112) bei akut lebensbedrohlichen Symptomen: starke Brustschmerzen, plötzliche Lähmung/Sprachstörung, Atemnot, starke Blutungen, Bewusstlosigkeit, schwere Verletzungen. Für dringende, aber nicht lebensbedrohliche Anliegen außerhalb der Praxis­öffnungs­zeiten ist die 116 117 die richtige Nummer.' },
      { q: 'Wie wähle ich das richtige Krankenhaus für eine geplante OP?', a: 'Hilfreiche Kriterien sind Fallzahlen des jeweiligen Eingriffs, spezifische Zertifizierungen (etwa Brustzentrum, Endoprothesen­zentrum), Qualitätsberichte, Erfahrungen des Operateurs sowie die räumliche Nähe für Angehörige. Auch die Weiterbehandlung nach der OP (Rehabilitation, Nachsorge) sollte in die Auswahl einfließen.' },
      { q: 'Wie funktioniert die Aufnahme im Krankenhaus?', a: 'Sie benötigen die elektronische Gesundheitskarte und – bei geplanter Aufnahme – die Krankenhauseinweisung Ihres Arztes. Bei elektiven (geplanten) Eingriffen erfolgt in der Regel ein Vorstellungsgespräch, Untersuchungen und OP-Aufklärung einige Tage vorher.' },
      { q: 'Was zahle ich als gesetzlich Versicherter im Krankenhaus?', a: 'Erwachsene zahlen pro Tag stationärer Behandlung eine Zuzahlung von 10 € (maximal 28 Tage pro Kalenderjahr). Zahlungen fallen weg oder werden reduziert bei Härtefallregelungen oder bei Reha-Aufenthalten. Wahlleistungen wie Einbettzimmer oder Chefarzt­behandlung werden nur bei entsprechender Versicherung übernommen.' },
      { q: 'Muss ich mich als Patient auf eine bestimmte Fachabteilung festlegen?', a: 'Für die Aufnahme wird das Krankenhaus die passende Fachabteilung wählen (etwa Innere, Chirurgie, HNO). Bei komplexen Krankheitsbildern arbeiten mehrere Fachabteilungen zusammen (interdisziplinäre Fallkonferenzen).' },
    ],
    relatedSlugs: ['apotheke', 'hausarzt'],
    symptomHints: ['Notfall (112!)', 'Geplante OP', 'Geburt', 'Onkologie', 'Zweitmeinung'],
  },

  heilpraktiker: {
    subline: 'Alternative und ergänzende Heilverfahren – rechtlich klar geregelt',
    intro: `Der Heilpraktiker ist ein staatlich zugelassener Beruf, der eigenverantwortlich Diagnosen stellen und Behandlungen durchführen darf – jedoch ohne das Medizin-Studium eines Arztes. Zugelassene Heilpraktiker bieten Verfahren aus der Naturheilkunde, Homöopathie, Osteopathie, Akupunktur und traditioneller chinesischer Medizin an. Die Zulassung erfolgt über eine amtsärztliche Überprüfung des Gesundheitsamtes; Voraussetzung ist der Nachweis medizinischer Grundkenntnisse.`,
    intro2: `Wichtig: Heilpraktiker dürfen keine verschreibungspflichtigen Medikamente verordnen, keine Röntgenaufnahmen anfertigen und dürfen weder Geburtshilfe leisten noch bestimmte meldepflichtige Erkrankungen behandeln. Die Kosten übernehmen gesetzliche Krankenkassen in der Regel nicht, private Zusatzversicherungen erstatten je nach Tarif einen Teil.`,
    whenToVisit: [
      'Als Ergänzung zur konventionellen ärztlichen Behandlung',
      'Chronische Beschwerden, bei denen die Schulmedizin ausgereizt scheint',
      'Interesse an Naturheilverfahren (Phytotherapie, Homöopathie)',
      'Akupunktur, Osteopathie, Chiropraktik',
      'Bach-Blüten, Schüßler-Salze, Traditionelle Chinesische Medizin',
    ],
    faqs: [
      { q: 'Ist der Heilpraktiker ein anerkannter Beruf?', a: 'Ja. Der Beruf ist im Heilpraktikergesetz von 1939 geregelt. Die Ausübung ist erlaubnispflichtig; die Zulassung erfolgt durch das Gesundheitsamt nach einer amtsärztlichen Überprüfung. Es gibt jedoch keine bundeseinheitliche Ausbildung – die Qualifikation kann sehr unterschiedlich sein.' },
      { q: 'Zahlt die Krankenkasse Heilpraktiker-Behandlungen?', a: 'Gesetzliche Krankenkassen erstatten Heilpraktiker-Leistungen in der Regel nicht. Private Krankenversicherungen und ergänzende Zusatzversicherungen erstatten je nach Tarif teilweise oder vollständig; prüfen Sie die Bedingungen Ihres Vertrags vorab.' },
      { q: 'Kann ein Heilpraktiker eine Krankschreibung ausstellen?', a: 'Nein. Heilpraktiker dürfen keine Arbeitsunfähigkeitsbescheinigung (Krankschreibung) ausstellen – das ist Ärzten vorbehalten. Auch verschreibungspflichtige Medikamente können sie nicht verordnen.' },
    ],
    relatedSlugs: ['hausarzt', 'osteopath', 'physiotherapeut'],
    symptomHints: ['Chronische Beschwerden ergänzend', 'Naturheilverfahren', 'Akupunktur', 'Homöopathie'],
  },

  osteopath: {
    subline: 'Manuelle Behandlung bei Bewegungs- und Funktionsstörungen',
    intro: `Osteopathie ist eine manuelle Therapieform, bei der Behandler mit den Händen Blockaden und Spannungen im Bewegungsapparat, in inneren Organen und im Nervensystem lösen. In Deutschland ist die Berufsbezeichnung Osteopath nicht geschützt – Behandler sind meist zugelassene Physiotherapeuten oder Heilpraktiker mit osteopathischer Zusatzausbildung.`,
    intro2: `Die osteopathische Behandlung dauert typischerweise 45–60 Minuten und wird oft in Serien von 3–6 Terminen empfohlen. Viele gesetzliche Krankenkassen bezuschussen inzwischen osteopathische Behandlungen bei entsprechender Verordnung – prüfen Sie die Bedingungen Ihrer Kasse.`,
    whenToVisit: [
      'Rückenschmerzen, Nackenverspannungen',
      'Kopfschmerzen und Migräne',
      'Kiefergelenks-Beschwerden (CMD)',
      'Verdauungsprobleme funktioneller Natur',
      'Nach Sportverletzungen oder Operationen',
      'Bei Säuglingen: KISS-Syndrom, Schrei-Babys',
    ],
    faqs: [
      { q: 'Ist Osteopath ein geschützter Beruf?', a: 'Nein, die Berufsbezeichnung „Osteopath" ist in Deutschland nicht geschützt. Nur Ärzte, Heilpraktiker und Physiotherapeuten mit entsprechender Zusatzausbildung dürfen osteopathisch behandeln. Achten Sie auf eine mehrjährige, anerkannte Ausbildung (mind. 1350 Stunden nach BAO-Standard).' },
      { q: 'Zahlt die Krankenkasse Osteopathie?', a: 'Viele gesetzliche Krankenkassen bezuschussen osteopathische Behandlungen mit 40–120 € pro Sitzung, meist bei 3–6 Sitzungen pro Jahr. Voraussetzung ist meist eine ärztliche Verordnung. Details variieren je nach Kasse.' },
      { q: 'Osteopathie oder Physiotherapie?', a: 'Physiotherapie arbeitet stärker mit gezielten Übungen und Kräftigung; Osteopathie ist ganzheitlicher und rein manuell. Bei akuten muskulär bedingten Beschwerden ist Physiotherapie oft der erste Schritt (per Verordnung), Osteopathie eignet sich häufig als Ergänzung oder bei komplexeren funktionellen Störungen.' },
    ],
    relatedSlugs: ['physiotherapeut', 'orthopaede', 'heilpraktiker'],
    symptomHints: ['Rückenschmerzen', 'Kopfschmerzen', 'Kiefergelenks-Probleme'],
  },

  logopaede: {
    subline: 'Diagnose und Therapie von Sprach-, Sprech-, Stimm- und Schluckstörungen',
    intro: `Logopäden diagnostizieren und behandeln Störungen der Sprache, des Sprechens, der Stimme und des Schluckens – bei Kindern wie Erwachsenen. Zu den häufigen Behandlungsanlässen zählen kindliche Sprachentwicklungsstörungen, Stottern, Stimmstörungen (z. B. bei Lehrern), Aphasie nach Schlaganfall und Schluckstörungen bei neurologischen Erkrankungen.`,
    intro2: `In Deutschland ist Logopädie eine dreijährige Berufsausbildung, zunehmend auch als Studium. Behandlungen erfolgen auf ärztliche Verordnung; die gesetzliche Krankenkasse übernimmt in der Regel die Kosten. Erwachsene zahlen eine Rezeptgebühr von 10 % plus 10 € pro Verordnung.`,
    whenToVisit: [
      'Sprachentwicklungsstörungen bei Kindern',
      'Stottern und Poltern',
      'Stimmstörungen (Heiserkeit, Räusperzwang, „berufsbedingt")',
      'Aphasie nach Schlaganfall',
      'Schluckstörungen (Dysphagie) bei Parkinson, ALS, Demenz',
      'Sprachverständnis- und Wortfindungsprobleme',
    ],
    faqs: [
      { q: 'Wer verordnet Logopädie?', a: 'Meist der Hausarzt, Kinderarzt, HNO-Arzt oder Neurologe – je nach Indikation. Die Verordnung erfolgt als Heilmittel-Verordnung, ähnlich wie Physiotherapie.' },
      { q: 'Wann sollte mein Kind zur Logopädie?', a: 'Wenn Ihr Kind mit 3 Jahren weniger als 50 Wörter aktiv nutzt, keine Zweiwortsätze bildet, oder wenn ab 4 Jahren einzelne Laute (z. B. „S" als Lispeln, „K" oder „G") anhaltend fehlerhaft gebildet werden. Frühzeitige Intervention ist bei Sprachentwicklungsstörungen oft entscheidend.' },
      { q: 'Wie lange dauert eine Logopädie-Behandlung?', a: 'Eine Sitzung dauert meist 30–60 Minuten. Die Gesamttherapie erstreckt sich je nach Störungsbild über wenige Wochen bis zu mehreren Jahren (v. a. bei Aphasie oder komplexen Sprachentwicklungsstörungen).' },
    ],
    relatedSlugs: ['hno-arzt', 'kinderarzt', 'neurologe'],
    symptomHints: ['Sprachentwicklung Kind', 'Stottern', 'Nach Schlaganfall'],
  },

  ergotherapeut: {
    subline: 'Wiederherstellung von Alltagsfähigkeiten und Handlungskompetenz',
    intro: `Ergotherapie unterstützt Menschen jeden Alters darin, Alltagsaktivitäten selbstständig zu bewältigen – nach Verletzungen, bei chronischen Erkrankungen, in der Entwicklung von Kindern oder im Alter. Zu den Anwendungsbereichen zählen Handrehabilitation nach Verletzungen, Behandlung nach Schlaganfall, Konzentrations- und Aufmerksamkeitsförderung bei Kindern (ADHS) und Sturzprophylaxe im Alter.`,
    intro2: `Die Ergotherapie-Ausbildung dauert 3 Jahre. Behandlungen erfolgen auf ärztliche Verordnung; die gesetzliche Krankenkasse übernimmt die Kosten. Neben der Praxis-Behandlung sind Haus- oder Klinikbesuche möglich.`,
    whenToVisit: [
      'Nach Schlaganfall oder Schädel-Hirn-Trauma',
      'Handrehabilitation nach Verletzung oder Operation',
      'ADHS und Konzentrationsstörungen bei Kindern',
      'Entwicklungsverzögerungen (Fein-/Grobmotorik)',
      'Bei rheumatischer Erkrankung, MS, Parkinson',
      'Sturzprophylaxe und Alltags-Training bei Senioren',
    ],
    faqs: [
      { q: 'Wer verordnet Ergotherapie?', a: 'Meist der Hausarzt, Neurologe, Orthopäde, Kinderarzt oder Psychiater. Die Verordnung erfolgt als Heilmittel-Verordnung; die Kasse übernimmt die Kosten bis auf die Rezeptgebühr.' },
      { q: 'Ergotherapie oder Physiotherapie?', a: 'Physiotherapie fokussiert auf Bewegung, Kraft und Beweglichkeit (Muskeln, Gelenke). Ergotherapie zielt auf die konkrete Alltagsbewältigung ab – etwa Anziehen, Essen mit Besteck, Schreiben. Bei komplexer Rehabilitation (z. B. nach Schlaganfall) werden beide Therapien kombiniert.' },
      { q: 'Ergotherapie bei Kindern – was passiert dort?', a: 'Bei Kindern arbeitet der Ergotherapeut spielerisch an motorischen Fähigkeiten (Fein- und Grobmotorik), Wahrnehmung, Konzentration und sozialem Verhalten. Häufige Indikationen sind ADHS, motorische Entwicklungsverzögerung, Autismus-Spektrum-Störungen und Störungen der sensorischen Integration.' },
    ],
    relatedSlugs: ['physiotherapeut', 'neurologe', 'kinderarzt'],
    symptomHints: ['Nach Schlaganfall', 'ADHS bei Kindern', 'Handverletzung'],
  },

  hebamme: {
    subline: 'Begleitung von Schwangerschaft, Geburt und Wochenbett',
    intro: `Hebammen begleiten Frauen medizinisch und beratend während der Schwangerschaft, bei der Geburt und im Wochenbett. In Deutschland haben Frauen einen gesetzlichen Anspruch auf hebammliche Betreuung – die Kosten übernimmt die gesetzliche Krankenkasse. Hebammen bieten Vorsorgeuntersuchungen (alternativ zur Frauenarzt-Vorsorge), Geburtsvorbereitung, Geburtshilfe (im Krankenhaus, Geburtshaus oder zu Hause) und Wochenbett-Betreuung inklusive Rückbildung.`,
    intro2: `Aufgrund des Fachkräftemangels ist es empfehlenswert, sich bereits sehr früh in der Schwangerschaft (idealerweise im ersten Trimester) um eine Hebamme zu bemühen. Für die Wochenbett-Betreuung besucht die Hebamme die Familie zu Hause und unterstützt bei Stillen, Rückbildung und Säuglingspflege.`,
    whenToVisit: [
      'Ab bestätigter Schwangerschaft für Vorsorge und Beratung',
      'Geburtsvorbereitungskurse',
      'Geburtsbegleitung (Klinik, Geburtshaus, Hausgeburt)',
      'Wochenbett-Betreuung (bis 12 Wochen nach Geburt)',
      'Stillberatung',
      'Rückbildungskurse',
    ],
    faqs: [
      { q: 'Zahlt die Krankenkasse eine Hebamme?', a: 'Ja, komplett. Jede schwangere Frau hat gesetzlichen Anspruch auf hebammliche Betreuung während der Schwangerschaft, Geburt und im Wochenbett bis 12 Wochen nach der Geburt (bei Stillproblemen bis zum Ende der Stillzeit).' },
      { q: 'Wann sollte ich eine Hebamme suchen?', a: 'Möglichst früh – ideal ist das erste Trimester. Wegen des Hebammen-Mangels sind gute Hebammen oft schon Monate im Voraus ausgebucht. Sie können sich über die Website Ihrer Krankenkasse, hebammensuche.de oder direkt bei Geburtshäusern erkundigen.' },
      { q: 'Frauenarzt oder Hebamme für die Schwangerschaftsvorsorge?', a: 'Die Vorsorgeuntersuchungen können vollständig durch eine Hebamme durchgeführt werden – Ultraschall darf jedoch nur der Frauenarzt machen. Viele Frauen kombinieren beides: Ultraschall beim Frauenarzt (Standarduntersuchungen um SSW 10, 20, 30), Zwischenkontrollen bei der Hebamme.' },
    ],
    relatedSlugs: ['frauenarzt', 'kinderarzt'],
    symptomHints: ['Schwangerschaft', 'Geburt', 'Wochenbett', 'Stillberatung'],
  },

  podologe: {
    subline: 'Medizinische Fußpflege – bei Diabetes und Fußproblemen',
    intro: `Podologen sind medizinisch ausgebildete Fußspezialisten. Sie behandeln krankhafte Veränderungen am Fuß wie eingewachsene Zehennägel, Hühneraugen, Warzen, Hornhaut-Schwielen oder Nagelpilz und sind besonders wichtig für Diabetiker (Vorbeugung des diabetischen Fußes) sowie Patienten mit rheumatischen Fußdeformitäten.`,
    intro2: `Die Podologie ist ein staatlich anerkannter Beruf mit 2-jähriger Ausbildung. Bei medizinischer Indikation (v. a. Diabetes mellitus mit Neuropathie) übernimmt die gesetzliche Krankenkasse die Kosten der podologischen Behandlung – Voraussetzung ist eine ärztliche Verordnung.`,
    whenToVisit: [
      'Als Diabetiker – regelmäßige Vorsorge',
      'Eingewachsener Zehennagel',
      'Hühneraugen und Hornhaut',
      'Nagelpilz und Nagelveränderungen',
      'Warzen an der Fußsohle',
      'Bei rheumatischen Fußdeformitäten',
    ],
    faqs: [
      { q: 'Was ist der Unterschied zwischen kosmetischer Fußpflege und Podologie?', a: 'Kosmetische Fußpflege ist ein handwerklicher Dienstleistungsberuf ohne medizinische Ausbildung. Podologen sind medizinisch ausgebildet, dürfen Wunden versorgen und behandeln krankhafte Fußveränderungen. Diabetiker sollten ausschließlich zum Podologen (nicht zum kosmetischen Fußpfleger).' },
      { q: 'Zahlt die Krankenkasse den Podologen?', a: 'Bei diagnostiziertem diabetischem Fußsyndrom oder anderen medizinisch relevanten Fußerkrankungen (rheumatische Fußdeformität, Neuropathie) übernimmt die gesetzliche Krankenkasse die Kosten – nach ärztlicher Verordnung.' },
      { q: 'Wie oft sollte ein Diabetiker zum Podologen?', a: 'In der Regel alle 6–8 Wochen zur präventiven Kontrolle. Bei akuten Problemen (Verletzung, Wunde am Fuß) sofort. Regelmäßige podologische Betreuung senkt das Risiko für schwere Komplikationen wie das diabetische Fußsyndrom deutlich.' },
    ],
    relatedSlugs: ['hausarzt', 'internist', 'orthopaede'],
    symptomHints: ['Diabetischer Fuß', 'Eingewachsener Nagel', 'Hornhaut'],
  },
};

export function contentForSlug(slug) {
  return SPECIALTY_CONTENT[slug] || null;
}

// Baut kompakten, stadt-kontextualisierten Content für /aerzte/{stadt}/{fachrichtung}.
// Ziel: eindeutig lesbarer Text pro Stadt + Fach ohne 1:1-Duplikat der Pillar-Seite.
export function contentForCitySpecialty(spec, cityName, stats) {
  const base = SPECIALTY_CONTENT[spec.slug];
  const count = stats?.count ?? 0;
  const state = stats?.state || null;

  const intro = base?.intro || `${spec.plural} sind Fachpersonen ihres Bereichs. Die gelisteten Praxen unterliegen den Vorgaben der Kassenärztlichen Vereinigung.`;

  // Kurze, städtische Einleitung – vermeidet Copy-Paste zwischen Städten.
  const cityLead = count > 0
    ? `In ${cityName}${state ? ` (${state})` : ''} führen wir aktuell ${count} ${spec.plural} in unserer Datenbasis. `
    : `${spec.plural} in ${cityName}${state ? ` (${state})` : ''}. `;

  // 3 fachliche FAQs aus Pillar-Content – erste Frage mit Stadt-Bezug angereichert.
  const rawFaqs = (base?.faqs || []).slice(0, 3);
  const cityFaqs = rawFaqs.map((f, i) => {
    if (i === 0) {
      return {
        q: f.q.replace(/\?$/, ` in ${cityName}?`),
        a: f.a,
      };
    }
    return f;
  });

  // Zusätzliche stadt-spezifische FAQ zu Termin/Notdienst
  cityFaqs.push({
    q: `Wie bekomme ich zeitnah einen Termin bei einem ${spec.label} in ${cityName}?`,
    a: `Kontaktieren Sie die gelisteten Praxen direkt telefonisch. Für dringende Fälle vermittelt die Terminservicestelle der Kassenärztlichen Vereinigung unter 116 117 kostenfrei einen Termin bei einem ${spec.label} in ${cityName} oder im näheren Umkreis. Bei akuten Notfällen wählen Sie den Notruf 112.`,
  });

  return {
    subline: base?.subline || spec.plural,
    cityLead,
    intro,
    whenToVisit: (base?.whenToVisit || []).slice(0, 6),
    faqs: cityFaqs,
    symptomHints: (base?.symptomHints || []).slice(0, 4),
    pillarSlug: spec.slug,
  };
}
