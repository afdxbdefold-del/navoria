// Ratgeber-Content: Editorial Long-Form-Artikel zu praktischen Gesundheitssystem-
// Themen. AI-optimiert: erster Absatz enthält Direct-Answer, klare H2s, konkrete
// FAQs für FAQPage-JSON-LD.

export const RATGEBER = [
  {
    slug: 'termin-facharzt-schneller',
    label: 'Facharzt-Termin schneller bekommen',
    category: 'Zugang zur Versorgung',
    lastUpdated: '2025-06-01',
    directAnswer: 'Facharzt-Termine bekommen Sie am schnellsten über die Terminservicestelle 116117 (bundesweit einheitlich, kostenfrei), über Online-Portale wie jameda oder Doctolib, oder durch direkte telefonische Anfrage in mehreren Praxen. Bei dringlichen Anliegen weist Sie 116117 innerhalb von 4 Wochen einen Termin nach.',
    intro: `Viele Patientinnen und Patienten in Deutschland warten Wochen oder Monate auf einen Facharzt-Termin – besonders bei Neurologen, Kinderpsychotherapeuten oder Augenärzten. Dabei gibt es eine ganze Reihe legaler Wege, deutlich schneller einen Termin zu bekommen. Dieser Ratgeber zeigt die wichtigsten Optionen und wann sie sinnvoll sind.`,
    sections: [
      {
        h2: '1. Terminservicestelle 116 117 nutzen',
        body: `Die bundesweit einheitliche Nummer 116 117 der Kassenärztlichen Vereinigung vermittelt gesetzlich Versicherten kostenfrei einen Facharzt-Termin. Der Termin muss innerhalb von 4 Wochen zustandekommen – andernfalls hat die KV das Recht, Sie in eine Klinik-Ambulanz einzuweisen. Voraussetzung: eine ärztliche Überweisung mit Dringlichkeits-Code (11.1 = akut, 11.2 = zeitnah). Auch online buchbar unter 116117.de.`,
      },
      {
        h2: '2. Online-Terminportale',
        body: `Portale wie Doctolib, jameda und Samädico zeigen freie Termine in Echtzeit. Vorteil: sofort buchbar ohne Warteschleife. Nachteil: nicht jede Praxis nutzt diese Portale, und der Termin ist verbindlich (Absage-Regeln beachten). Ein Blick lohnt sich vor allem in Ballungsräumen.`,
      },
      {
        h2: '3. Direkt bei mehreren Praxen anfragen',
        body: `Rufen Sie 5–10 Praxen an und fragen Sie explizit nach Absagen für die kommenden 1–2 Wochen. Viele Praxen haben eine informelle Warteliste. Wichtig: kurz und höflich, klar sagen „Ich bin flexibel bei Absagen".`,
      },
      {
        h2: '4. Privatpatienten-Praxen bei Selbstzahlern',
        body: `Als Selbstzahler oder Privatversicherter erhalten Sie in vielen Facharzt-Praxen deutlich schneller einen Termin, weil die Vergütung nach GOÄ höher ist als nach EBM. Achten Sie darauf, sich vorab über die Kosten aufklären zu lassen (schriftlicher Kostenvoranschlag ab ca. 300 € vorgeschrieben).`,
      },
      {
        h2: '5. Fachambulanz einer Klinik',
        body: `Bei fachlich komplexen Anliegen bieten sich Fachambulanzen der Universitätskliniken an (z. B. Fachambulanz Neurologie an einem Uni-Klinikum). Meist mit Ärztlichem-Überweisungsschein und kurzem Anschreiben zugänglich.`,
      },
    ],
    faqs: [
      { q: 'Wie funktioniert 116 117?', a: 'Sie wählen 116 117, geben Ihren Wohnort und die Fachrichtung an, dazu den Dringlichkeitscode Ihrer Überweisung. Die Terminservicestelle sucht Ihnen innerhalb von 4 Wochen einen Termin. Buchung auch online unter 116117.de möglich.' },
      { q: 'Bekomme ich als Privatpatient schneller Termine?', a: 'Ja, in vielen Fällen deutlich. Nachteil: Sie zahlen zunächst selbst und reichen die Rechnung dann bei Ihrer Versicherung ein. Bei höheren Beträgen (> 300 €) muss die Praxis Sie vorab schriftlich über die Kosten aufklären.' },
      { q: 'Ist die Terminservicestelle wirklich kostenlos?', a: 'Ja. Die Nummer 116 117 ist deutschlandweit kostenfrei aus allen Netzen (Festnetz und Mobil) erreichbar. Die Vermittlung selbst ist ebenfalls kostenlos.' },
    ],
    relatedRatgeberSlugs: ['zweitmeinung-einholen', 'notfall-vs-bereitschaftsdienst'],
  },

  {
    slug: 'zweitmeinung-einholen',
    label: 'Zweitmeinung einholen – wann und wie',
    category: 'Zugang zur Versorgung',
    lastUpdated: '2025-06-01',
    directAnswer: 'Eine ärztliche Zweitmeinung ist Ihr gesetzlich verankertes Recht – besonders vor planbaren Eingriffen. Für bestimmte Operationen (Mandelentfernung, Gebärmutterentfernung, Schulter-OP, Wirbelsäulen-OP, Knie-Endoprothese, Herzkatheter u. a.) haben Sie sogar einen expliziten Anspruch auf Zweitmeinung, den die Kasse voll bezahlt.',
    intro: `Vor einer geplanten Operation oder einer belastenden Behandlung eine unabhängige zweite ärztliche Meinung einzuholen, ist medizinisch sinnvoll – und in vielen Fällen sogar ein gesetzlicher Anspruch. Dieser Ratgeber erklärt, wann eine Zweitmeinung berechtigt ist, wer sie bezahlt und wie Sie einen kompetenten Zweitmeinungsarzt finden.`,
    sections: [
      {
        h2: 'Wann ist eine Zweitmeinung sinnvoll?',
        body: `Immer bei planbaren, nicht dringlichen Eingriffen (elektiv), wenn die Diagnose unklar ist, wenn mehrere Behandlungsoptionen bestehen, oder wenn das Bauchgefühl „da passt etwas nicht" mitspricht. Ein empathischer Erstarzt sollte eine Zweitmeinung immer unterstützen; wer sie ablehnt, wirft Fragen auf.`,
      },
      {
        h2: 'Gesetzliches Zweitmeinungsverfahren',
        body: `Für bestimmte Eingriffe hat der Gemeinsame Bundesausschuss (G-BA) ein strukturiertes Zweitmeinungsverfahren eingeführt. Betroffen sind u. a.:
• Mandelentfernung (Tonsillektomie / Adenotomie bei Kindern)
• Gebärmutterentfernung (Hysterektomie)
• Schulter-Arthroskopie
• Wirbelsäulen-OP bei Bandscheibenvorfall
• Knie-Endoprothese
• Katheterablation bei Vorhofflimmern

Der erstuntersuchende Arzt MUSS Sie mindestens 10 Kalendertage vor dem Eingriff auf diesen Anspruch hinweisen. Kosten übernimmt die Kasse.`,
      },
      {
        h2: 'Wie finde ich einen Zweitmeinungsarzt?',
        body: `Über die Terminservicestelle 116 117, die auch Zweitmeinungs-Termine vermittelt. Portale wie das Zweitmeinungsportal des Bundesverbands der Deutschen Chirurgen listen qualifizierte Ärzte. Wichtig: der Zweitmeinungsarzt sollte NICHT in derselben Praxis oder Klinik wie der Erstarzt tätig sein und sollte den Eingriff selbst regelmäßig durchführen.`,
      },
      {
        h2: 'Unterlagen mitnehmen',
        body: `Zur Zweitmeinung mitbringen: alle Vorbefunde (Bildgebung als CD, Arztberichte, Laborwerte), Medikamenten-Liste, Krankenhauspass. Ihre Ärzte sind verpflichtet, Ihnen Kopien Ihrer Unterlagen kostenfrei zu überlassen (§ 630g BGB).`,
      },
    ],
    faqs: [
      { q: 'Für welche Eingriffe habe ich Anspruch auf Zweitmeinung?', a: 'Für Mandelentfernung, Gebärmutterentfernung, Schulter-Arthroskopie, Wirbelsäulen-OP, Knie-Endoprothese, Herzkatheter-Ablation u. a. Der behandelnde Arzt muss Sie mindestens 10 Tage vorher auf Ihren Anspruch hinweisen.' },
      { q: 'Muss ich für die Zweitmeinung zahlen?', a: 'Beim gesetzlichen Zweitmeinungsverfahren nicht. In allen anderen Fällen können Sie mit Ihrem Krankenkassen-Kundenservice sprechen – viele Kassen übernehmen die Kosten auf Kulanz, wenn medizinisch sinnvoll.' },
      { q: 'Erfährt der Erstarzt von meiner Zweitmeinung?', a: 'Nein, nicht automatisch. Nur wenn Sie es wünschen und schriftlich erlauben, wird der Bericht des Zweitmeinungsarztes an Ihren Erstarzt gesendet. Ihre Ärzte unterliegen der Schweigepflicht.' },
    ],
    relatedRatgeberSlugs: ['termin-facharzt-schneller', 'krankenkasse-leistungen'],
  },

  {
    slug: 'notfall-vs-bereitschaftsdienst',
    label: 'Notaufnahme, 112 oder 116 117?',
    category: 'Notfall',
    lastUpdated: '2025-06-01',
    directAnswer: 'Wählen Sie 112 bei lebensbedrohlichen Notfällen (schwerer Brustschmerz, Bewusstlosigkeit, starke Blutung, Atemnot, Verdacht auf Schlaganfall). Wählen Sie 116 117 für den ärztlichen Bereitschaftsdienst außerhalb der Sprechzeiten bei nicht lebensbedrohlichen, aber dringlichen Beschwerden. Die Notaufnahme ist nur für echte Notfälle da.',
    intro: `Die Wahl zwischen 112, 116 117 und Notaufnahme entscheidet nicht nur über die Behandlungsqualität, sondern manchmal auch über Leben und Tod. Dieser Ratgeber hilft, in der Akutsituation die richtige Entscheidung zu treffen.`,
    sections: [
      {
        h2: 'Wann 112 (Rettungsdienst und Feuerwehr)?',
        body: `Bei allen lebensbedrohlichen Notfällen:
• Starke Brustschmerzen (Verdacht auf Herzinfarkt)
• Plötzliche einseitige Lähmung, Sprachstörung oder Sehstörung (Verdacht auf Schlaganfall – FAST-Regel)
• Bewusstlosigkeit / Krampfanfall
• Schwere Atemnot / blaue Lippen
• Starke Blutungen, die nicht zum Stillstand kommen
• Unfall mit Verletzten
• Vergiftung, Verbrennungen
• Anaphylaxie (allergischer Schock)

Die 112 ist bundesweit einheitlich und kostenfrei, auch aus dem Ausland.`,
      },
      {
        h2: 'Wann 116 117 (ärztlicher Bereitschaftsdienst)?',
        body: `Bei akuten, aber nicht lebensbedrohlichen Beschwerden außerhalb der Praxis-Öffnungszeiten (nachts, an Wochenenden, Feiertagen):
• Fieber mit deutlichem Unwohlsein
• Ohrenschmerzen, Halsschmerzen
• Harnwegsinfektion mit Beschwerden
• Rückenschmerzen ohne neurologische Ausfälle
• Fragen zur Krankschreibung
• Rezept-Notfälle

Der Bereitschaftsdienst-Arzt kommt entweder ins Haus, Sie fahren in eine Bereitschaftspraxis, oder es erfolgt eine Videosprechstunde.`,
      },
      {
        h2: 'Wann direkt in die Notaufnahme?',
        body: `Wenn Sie zwischen 112 und 116 117 unsicher sind und Ihre Beschwerden zunehmen; wenn die 116 117 Sie explizit dorthin schickt; oder bei mäßig-schweren Verletzungen (z. B. tiefe Schnittwunden, Verdacht auf Knochenbruch), die keine Rettungswagen-Fahrt erfordern.

Wichtig: die Notaufnahme darf niemanden abweisen – bei nicht dringlichen Anliegen können die Wartezeiten aber sehr lang sein (Triage-Prinzip).`,
      },
      {
        h2: 'Kinder-Notfall',
        body: `Bei Kindern gilt: bei Unsicherheit immer zeitnah ärztlich abklären. Kinder dekompensieren schnell. Wichtige Alarmzeichen: Apathie, hohes Fieber trotz Fiebersenker, Atemnot, ausgeprägter Flüssigkeitsverlust (Erbrechen, Durchfall), Nackensteife, Petechien (punktförmige Blutungen). Bei Kindern < 3 Monate mit Fieber immer sofort abklären.`,
      },
    ],
    faqs: [
      { q: 'Was ist die FAST-Regel beim Schlaganfall?', a: 'FAST = Face, Arm, Speech, Time. Ist eine Gesichtshälfte herabhängend (Face)? Kann der Betroffene beide Arme gleich hoch heben (Arm)? Kann er einen Satz nachsprechen (Speech)? Wenn eines dieser Zeichen positiv ist: sofort 112 (Time – jede Minute zählt).' },
      { q: 'Kostet 112 oder 116 117 etwas?', a: 'Beide Nummern sind kostenfrei aus allen Netzen (Festnetz, Mobil). Ein Rettungseinsatz per Krankenwagen kann bei nicht gerechtfertigten Fährten Kosten verursachen – im Zweifel aber IMMER 112 wählen.' },
      { q: 'Was, wenn ich mich nicht sicher bin?', a: 'Rufen Sie 116 117 an – die Leitstelle entscheidet dann, ob Sie in die Notaufnahme, den Bereitschaftsdienst oder zu einer Videosprechstunde müssen. Bei jeder Verschlechterung oder Unklarheit gilt: lieber übertriagieren als übersehen.' },
    ],
    relatedRatgeberSlugs: ['termin-facharzt-schneller'],
  },

  {
    slug: 'krankenkasse-leistungen',
    label: 'Was zahlt die gesetzliche Krankenkasse?',
    category: 'Kosten & Versicherung',
    lastUpdated: '2025-06-01',
    directAnswer: 'Die gesetzliche Krankenversicherung (GKV) übernimmt alle medizinisch notwendigen Standardleistungen: Arzt- und Klinikbehandlung, Medikamente auf Rezept, Rehabilitation, Vorsorge, Psychotherapie und Notfall-Versorgung. Nicht übernommen werden reine Wunschleistungen („IGeL"), viele Zahnersatz-Anteile, Sehhilfen für Erwachsene und die meisten Zusatzleistungen wie Ein-Bett-Zimmer.',
    intro: `Rund 90 % der Deutschen sind gesetzlich krankenversichert. Der Leistungskatalog der GKV wird durch den Gemeinsamen Bundesausschuss (G-BA) festgelegt und deckt praktisch alle medizinisch notwendigen Behandlungen ab. Was genau bezahlt wird – und was Sie selbst zahlen –, ist für viele unklar.`,
    sections: [
      {
        h2: 'Was die Kasse voll bezahlt',
        body: `• Hausarzt- und Facharzt-Besuche (ohne Praxisgebühr)
• Krankenhaus-Behandlung (bis auf 10 €/Tag Zuzahlung, max. 28 Tage/Jahr)
• Verschreibungspflichtige Medikamente (mit 5–10 € Rezeptgebühr)
• Vorsorgeuntersuchungen (Check-up 35, Krebs-Vorsorge)
• Schutzimpfungen laut STIKO-Empfehlung
• Notfall-Versorgung inkl. Rettungsdienst
• Psychotherapie bei diagnostizierter Erkrankung
• Rehabilitation (Reha) nach Krankenhaus-Aufenthalt`,
      },
      {
        h2: 'Was Sie teilweise selbst zahlen',
        body: `• Rezeptgebühr: 10 % vom Preis, mindestens 5 €, maximal 10 € (Kinder < 18 Jahre befreit)
• Krankenhaus: 10 € pro Tag, maximal 28 Tage/Jahr
• Heilmittel (Physiotherapie, Logopädie): 10 € Rezept + 10 % der Kosten
• Hilfsmittel (Rollator, Hörgeräte): oft mit Aufzahlung für „Mehrleistungen"
• Zahnersatz: Festzuschuss der Kasse (50–75 %), Rest Eigenanteil

Befreiungsgrenze: 2 % des Bruttoeinkommens (1 % bei chronisch Kranken) – darüber hinausgehende Zuzahlungen kann man sich zurückerstatten lassen.`,
      },
      {
        h2: 'Was NICHT gezahlt wird (IGeL)',
        body: `Individuelle Gesundheitsleistungen (IGeL) sind reine Selbstzahlerleistungen, die die Kasse nicht übernimmt – häufig ohne wissenschaftlich belegten Nutzen. Beispiele: Glaukö-Früherkennung ohne Symptome, Ultraschall der Eierstöcke zur Krebsvorsorge, PSA-Test ohne konkreten Grund, viele „Check-Up Plus"-Pakete. Vor jeder IGeL-Leistung: schriftliche Vereinbarung über Kosten (Aufklärungspflicht § 630c BGB). Bewertungen unter igel-monitor.de.`,
      },
      {
        h2: 'Zusatzleistungen der Kassen',
        body: `Einige Kassen bieten Zusatzleistungen an: osteopathische Behandlungen, alternative Heilverfahren, professionelle Zahnreinigung, Sportkurse. Diese Extras werden aus dem Kassenbeitrag finanziert und variieren stark – ein Vergleich lohnt sich. Wechsel-Chance: alle 12 Monate möglich.`,
      },
    ],
    faqs: [
      { q: 'Bekomme ich eine Brille von der Kasse?', a: 'Für Erwachsene nur in Ausnahmefällen (starke Sehbeeinträchtigung ≥ ± 6 Dioptrien pro Auge). Kinder und Jugendliche bis 18 erhalten in der Regel Zuschuss zu Gläsern. Für die meisten Erwachsenen sind Brillen aus dem Leistungskatalog raus.' },
      { q: 'Zahlt die Kasse eine Zahnreinigung?', a: 'Die klassische professionelle Zahnreinigung ist keine Kassenleistung. Viele Kassen bieten aber Zuschüsse an (30–80 € pro Jahr), im Rahmen ihrer Zusatzleistungen. Prospektiv nachfragen lohnt.' },
      { q: 'Kann ich meine Krankenkasse wechseln?', a: 'Ja, mit einer Frist von 2 Monaten zum Monatsende, frühestens nach 12 Monaten Mitgliedschaft. Bei Beitragserhöhung besteht Sonderkündigungsrecht. Der Wechsel ist einfach online über die neue Kasse zu erledigen – alte Kasse muss nichts unternehmen.' },
    ],
    relatedRatgeberSlugs: ['check-up-35', 'impfungen-erwachsene'],
  },

  {
    slug: 'check-up-35',
    label: 'Gesundheits-Check-Up ab 35',
    category: 'Vorsorge',
    lastUpdated: '2025-06-01',
    directAnswer: 'Der Check-Up 35 ist eine kostenfreie Vorsorge-Untersuchung, die jede gesetzlich versicherte Person alle 3 Jahre ab dem 35. Lebensjahr in Anspruch nehmen kann. Ziel ist die Früherkennung von Herz-Kreislauf-Erkrankungen, Diabetes und Nierenerkrankungen – in der Regel beim Hausarzt.',
    intro: `Der Check-Up 35 (bis 2020 nur einmalig ab 35, jetzt alle 3 Jahre) ist eine der wenigen strukturierten Vorsorge-Untersuchungen für Erwachsene in Deutschland. Die Untersuchung ist für gesetzlich Versicherte kostenfrei und wird beim Hausarzt durchgeführt.`,
    sections: [
      {
        h2: 'Was wird untersucht?',
        body: `• Anamnese: Krankengeschichte, Risikofaktoren, familiaere Belastung
• Körperliche Untersuchung: Blutdruck, Puls, Herz-/Lungen-Auskultation, Körpergewicht
• Blutwerte: Gesamtcholesterin, LDL/HDL, Triglyceride, Blutzucker (nüchtern)
• Urin: Zucker, Eiweiß, Blut
• Beratung zu gesundem Lebensstil und ggf. Impfstatus-Check
• Ab 65: einmalig Screening auf Bauchaortenaneurysma per Ultraschall (Männer)

Die Untersuchung dauert etwa 30 Minuten. Ergebnis-Besprechung in einem Folgetermin.`,
      },
      {
        h2: 'Wann + wie oft?',
        body: `Zwischen 18–34 Jahre: einmalig kostenlos. Ab 35 Jahre: alle 3 Jahre. Ohne Symptome ist der Check-Up der Kern der Primärprävention. Wer bereits chronisch krank ist (Diabetes, Hypertonie), unterliegt anderen, engmaschigeren Kontroll-Schemata.`,
      },
      {
        h2: 'Was ist NICHT Teil des Check-Up 35?',
        body: `NICHT enthalten: Krebsfrüherkennung (das sind separate Programme: Darmspiegelung ab 50/55, Hautkrebs-Screening ab 35, gynäkologische Vorsorge, PSA-Test, Mammographie), EKG (nur bei Verdacht), erweiterte Blutwerte (Vitamine, Hormone), Sonographie. Das sind meist IGeL-Leistungen – vor Beauftragung kritisch prüfen.`,
      },
      {
        h2: 'Wie profitieren Sie am meisten?',
        body: `• Termin zeitnah in der Praxis vereinbaren (Blutentnahme nüchtern morgens)
• Vorbereitung: Medikamentenplan, familiaere Krankengeschichte notieren
• Fragen sammeln: Ernährung, Bewegung, Schlaf, Stress
• Ergebnisse aktiv nachfragen und die Blutwerte per Kopie mitnehmen – für später Vergleiche wertvoll`,
      },
    ],
    faqs: [
      { q: 'Kann ich den Check-Up alle 3 Jahre wirklich erneut nutzen?', a: 'Ja. Seit dem 1. April 2019 haben gesetzlich Versicherte ab 35 alle drei Jahre Anspruch. Zusätzlich: einmalige Möglichkeit zwischen 18 und 34.' },
      { q: 'Ist Krebsvorsorge im Check-Up enthalten?', a: 'Nein. Krebsfrüherkennung sind eigene Programme (Darmspiegelung, Hautkrebs-Screening, gynäkologische Krebsvorsorge, Mammographie) mit eigenen Altersgrenzen. Fragen Sie explizit nach Ihrem Anspruch.' },
      { q: 'Was, wenn beim Check-Up etwas Auffälliges gefunden wird?', a: 'Der Hausarzt bespricht die Ergebnisse und leitet ggf. weitere Diagnostik ein oder überweist an Fachärzte. Auffällige Werte sind häufig; oft handelt es sich um harmlose Abweichungen, manchmal aber um wichtige Früherkennungen.' },
    ],
    relatedRatgeberSlugs: ['impfungen-erwachsene', 'krankenkasse-leistungen'],
  },

  {
    slug: 'krankschreibung-online',
    label: 'Krankschreibung online – was ist erlaubt?',
    category: 'Zugang zur Versorgung',
    lastUpdated: '2025-06-01',
    directAnswer: 'Seit 2024 ist die telefonische Krankschreibung dauerhaft erlaubt – für bis zu 5 Kalendertage bei leichten Erkrankungen (Erkältung, Magen-Darm) und nur bei bekannten Patient:innen der eigenen Praxis. Video-Sprechstunden ermöglichen ebenfalls Krankschreibungen. Rein privatwirtschaftliche „Krankschreibung per WhatsApp"-Anbieter sind rechtlich umstritten und werden von Arbeitgebern zunehmend abgelehnt.',
    intro: `Die telefonische und digitale Krankschreibung hat sich seit der Corona-Pandemie stark verändert. Was rechtlich sicher ist, was Arbeitgeber akzeptieren müssen, und wo die Grenzen liegen – dieser Ratgeber gibt einen Überblick.`,
    sections: [
      {
        h2: 'Telefonische Krankschreibung',
        body: `Seit 7. Dezember 2023 dauerhaft möglich, bis zu 5 Kalendertagen. Voraussetzungen: bekannte Patient:in in der Praxis (schon einmal dort vorgestellt), leichte Erkrankung ohne schwere Symptome, keine Video-Übertragung notwendig. Verlängerung ausschließlich per persönlichem Termin. Die telefonische AU wird von allen gesetzlichen und privaten Kassen anerkannt.`,
      },
      {
        h2: 'Videosprechstunde',
        body: `Krankschreibung per Video-Sprechstunde ist bis zu 7 Tage möglich, auch für unbekannte Patient:innen. Anbieter: TeleClinic, Doctolib, Zava, sowie viele niedergelassene Arztpraxen mit eigener Videosprechstunde. Die AU wird digital direkt an die Krankenkasse und den Arbeitgeber übermittelt (eAU).`,
      },
      {
        h2: 'Kritische Angebote: „AU per WhatsApp"',
        body: `Anbieter wie „AU-Schein.de", „einfach-krankschreiben.de" u. ä. bieten AU-Bescheinigungen ohne persönlichen Kontakt gegen Gebühr. Rechtlich ist die Anerkennung umstritten: Arbeitgeber dürfen die AU-Bescheinigung bei Zweifeln prüfen lassen (medizinischer Dienst der Krankenkassen) und im Ausnahmefall ablehnen. Zudem ist die Kostenerstattung durch Kassen meist NICHT gegeben. Für rechtssichere AU-Bescheinigungen empfehlen sich der eigene Hausarzt (telefonisch) oder etablierte Video-Sprechstunden.`,
      },
      {
        h2: 'eAU – elektronische Arbeitsunfähigkeit',
        body: `Seit 2023 sind Ihre Ärzte verpflichtet, AU-Bescheinigungen elektronisch an Ihre Krankenkasse zu übermitteln (eAU). Der Arbeitgeber ruft die Daten automatisch bei der Kasse ab – Sie müssen keinen Schein mehr weiterleiten (außer bei Privatversicherten). Wichtig: Sie erhalten dennoch ein Papierexemplar für Ihre Unterlagen.`,
      },
    ],
    faqs: [
      { q: 'Kann mein Arbeitgeber die telefonische AU ablehnen?', a: 'Nein, sofern sie regulär vom Arzt ausgestellt ist. Bei Zweifel kann der Arbeitgeber jedoch eine Nachprüfung durch den medizinischen Dienst der Kasse verlangen. Bei formell korrekten AU-Bescheinigungen gilt der volle Anspruch auf Lohnfortzahlung.' },
      { q: 'Wie lange kann ich mich am Stück krankschreiben lassen?', a: 'Grundsätzlich unbegrenzt (medizinisch gerechtfertigt). Nach 6 Wochen übernimmt die Krankenkasse die Zahlungen (Krankengeld) statt der Arbeitgeber. Bei sehr langen AU-Zeiten (mehrere Monate) ist eine Untersuchung durch den medizinischen Dienst üblich.' },
      { q: 'Bekomme ich am ersten Tag eine AU?', a: 'Grundsätzlich ja, ab dem ersten Krankheitstag ist die AU möglich. Viele Arbeitgeber verlangen jedoch die AU-Bescheinigung erst ab dem 4. Krankheitstag (Tarif- oder Arbeitsvertrag prüfen). Bei bestimmten Berufen (Öffentlicher Dienst, Schichtdienste) kann der erste Tag vorgeschrieben sein.' },
    ],
    relatedRatgeberSlugs: ['termin-facharzt-schneller'],
  },

  {
    slug: 'elektronische-patientenakte',
    label: 'Elektronische Patientenakte (ePA) – Chancen und Risiken',
    category: 'Digital & Datenschutz',
    lastUpdated: '2025-06-01',
    directAnswer: 'Die elektronische Patientenakte (ePA) ist eine digitale, versicherten-eigene Sammlung Ihrer Gesundheitsdaten. Seit 15. Januar 2025 wird sie automatisch für alle gesetzlich Versicherten angelegt (Opt-Out-System). Sie können selbst entscheiden, welche Ärzte welche Dokumente sehen dürfen – und die ePA jederzeit vollständig widersprechen.',
    intro: `Die elektronische Patientenakte (ePA) soll Doppel-Untersuchungen vermeiden, Wechselwirkungen bei Medikamenten früher erkennen und Ihnen selbst mehr Kontrolle über Ihre Gesundheitsdaten geben. Dieser Ratgeber erklärt, was drin ist, wer Zugriff hat und wie Sie widersprechen können.`,
    sections: [
      {
        h2: 'Was steht in der ePA?',
        body: `• Arztberichte und Befunde
• Medikamentenplan
• Rezepte (E-Rezept)
• Impfausweis
• Mutterpass, Zahn-Bonusheft, Kinder-Untersuchungsheft
• Notfalldaten (Allergien, chronische Erkrankungen)
• Laborbefunde, Bildgebung (Rechte, MRT, CT)

Der Versicherte kann selbst Dokumente hochladen, etwa Vorbefunde von Privatuntersuchungen.`,
      },
      {
        h2: 'Wer hat Zugriff?',
        body: `Sie – immer. Ärzte, Zahnärzte, Apotheken und Krankenhäuser: nur, wenn Sie das explizit erlauben. Der Zugriff wird per Karte (elektronische Gesundheitskarte + PIN) oder App entwertet. Standard-Zugriffsdauer: 90 Tage – danach automatisch entzogen.

WICHTIG: Standardmäßig sehen behandelnde Ärzte alle Dokumente, sobald Sie ihnen Zugriff geben. Sie können einzelne Dokumente jedoch verbergen.`,
      },
      {
        h2: 'Widerspruch – wenn Sie keine ePA wollen',
        body: `Sie können jederzeit widersprechen – vor, während oder nach der Einrichtung. Widerspruch geht über Ihre Krankenkasse (schriftlich oder über die Kassen-App). Bei späterem Widerspruch werden Ihre bereits gespeicherten Daten gelöscht. Sie können auch selektiv widersprechen: z. B. gegen die pauschale Weitergabe an Forschungszwecke.`,
      },
      {
        h2: 'Datenschutz und Sicherheit',
        body: `Die ePA-Daten sind auf Servern der „Telematik-Infrastruktur" gespeichert (BSI-zertifiziert). Zugriff nur mit doppelter Authentifizierung. Kritiker weisen auf die Zentralisierung sensibler Daten hin – ein einziger erfolgreicher Angriff könnte theoretisch massenhaft Daten offenlegen. Der Bundesdatenschutzbeauftragte hat konkrete Kritik geäußert und Nachbesserungen gefordert.`,
      },
    ],
    faqs: [
      { q: 'Muss ich die ePA nutzen?', a: 'Nein. Sie können jederzeit widersprechen. Ohne Widerspruch wird sie seit 15. Januar 2025 automatisch angelegt. Der Widerspruch geht bei Ihrer Krankenkasse ein – telefonisch, per Brief oder über die Kassen-App.' },
      { q: 'Welche Vorteile hat die ePA?', a: 'Sie haben in Notfällen sofort Ihre wichtigsten Daten dabei (Allergien, Medikamente), Doppel-Untersuchungen werden vermieden, Facharztbesuche sind besser vorbereitet, und Sie können selbst Ihre Krankengeschichte einsehen.' },
      { q: 'Was, wenn ich meine ePA-PIN vergesse?', a: 'Kontaktieren Sie Ihre Krankenkasse – die stellt eine neue PIN aus. Aus Sicherheitsgründen dauert dies wenige Tage; bis dahin ist der Zugriff blockiert.' },
    ],
    relatedRatgeberSlugs: ['krankenkasse-leistungen', 'krankschreibung-online'],
  },

  {
    slug: 'impfungen-erwachsene',
    label: 'Impfungen für Erwachsene – was zahlt die Kasse',
    category: 'Vorsorge',
    lastUpdated: '2025-06-01',
    directAnswer: 'Die gesetzliche Krankenkasse übernimmt alle von der Ständigen Impfkommission (STIKO) empfohlenen Standardimpfungen komplett – dazu zählen Tetanus/Diphtherie/Keuchhusten alle 10 Jahre, die jährliche Grippe-Impfung ab 60, die einmalige Gürtelrose-Impfung ab 60, sowie Pneumokokken-Impfung ab 60. Reise-Impfungen werden meist nicht übernommen – hier lohnt der Blick in den Zusatzleistungs-Katalog Ihrer Kasse.',
    intro: `Impfungen sind eine der wirksamsten präventiven Maßnahmen überhaupt. Für Erwachsene gibt es klare Empfehlungen der Ständigen Impfkommission (STIKO) – die gesetzlichen Krankenkassen zahlen alle STIKO-Empfehlungen. Dieser Ratgeber gibt einen Überblick, welche Impfungen wann sinnvoll sind.`,
    sections: [
      {
        h2: 'Standard-Impfungen für alle Erwachsene',
        body: `• Tetanus + Diphtherie + Keuchhusten (Td/Tdap): alle 10 Jahre Auffrischung
• Masern: alle Erwachsene ab 1970 Geborene ohne bekannten Impfschutz sollten einmalig Masern-Impfung erhalten (Masernschutzgesetz)
• Grippe (Influenza): jährlich, empfohlen für alle ab 60, chronisch Kranke, Schwangere, Medizinisches Personal
• COVID-19: laut aktueller STIKO-Empfehlung (aktualisiert regelmäßig)`,
      },
      {
        h2: 'Ab 60 Jahre',
        body: `• Pneumokokken (einmalig, Auffrischung nach 6 Jahren bei Risiko)
• Herpes Zoster / Gürtelrose: zwei Dosen im Abstand von 2–6 Monaten (Shingrix)
• Grippe: jährlich mit Hochdosis-Impfstoff

Die Gürtelrose-Impfung wird von der Kasse ab 60 komplett getragen – kann persönlich sehr belastende Gürtelrose-Erkrankungen im Alter verhindern.`,
      },
      {
        h2: 'HPV-Impfung',
        body: `Empfohlen für Mädchen und Jungen zwischen 9–14 Jahren (frühestens 9). Nachholimpfung bis 17. Für Erwachsene ab 18: keine STIKO-Empfehlung, wird von der Kasse in der Regel nicht übernommen, kann aber medizinisch sinnvoll sein.`,
      },
      {
        h2: 'Reise-Impfungen',
        body: `Nicht Teil der Standard-Impfungen: FSME (Reise in Zeckengebiete), Hepatitis A + B (Reise in tropische Länder), Gelbfieber (Afrika/Südamerika), Typhus, Meningokokken, Cholera. Kosten müssen meist selbst übernommen werden – viele Kassen erstatten aber im Rahmen ihrer Satzungsleistungen. Vor Reisen: fachliche Beratung durch Tropenmediziner oder Impfsprechstunde.`,
      },
    ],
    faqs: [
      { q: 'Wo lasse ich mich als Erwachsener impfen?', a: 'Beim Hausarzt – Standard-Ort. Reise-Impfungen bei Tropenmedizinern oder speziellen Impfsprechstunden. Grippe- und COVID-Impfung teilweise auch in Apotheken (variiert nach Bundesland).' },
      { q: 'Wie erkenne ich meinen Impfstatus?', a: 'Impfpass mitbringen. Wenn dieser fehlt oder lückenhaft ist: bei Ihrem Hausarzt Impfstatus überprüfen lassen (blutserologisch oder anhand alter Praxis-Daten). In der ePA werden zukünftig alle Impfungen automatisch dokumentiert.' },
      { q: 'Sind Impfungen gefährlich?', a: 'Nein, aber wie jede medizinische Maßnahme haben sie Nebenwirkungen: lokale Rotheit an Impfstelle, Muskel-/Kopfschmerzen, gelegentlich Fieber – in der Regel harmlos nach 1–2 Tagen weg. Schwerwiegende Nebenwirkungen sind extrem selten (unter 1:100.000) und werden vom Paul-Ehrlich-Institut streng überwacht.' },
    ],
    relatedRatgeberSlugs: ['check-up-35', 'krankenkasse-leistungen'],
  },
];

export function ratgeberBySlug(slug) {
  return RATGEBER.find((r) => r.slug === slug) || null;
}

export function ratgeberCategories() {
  const cats = {};
  for (const r of RATGEBER) {
    if (!cats[r.category]) cats[r.category] = [];
    cats[r.category].push(r);
  }
  return cats;
}
