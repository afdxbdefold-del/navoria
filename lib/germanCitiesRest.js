// Deutsche Mittelstädte (~20.000 – 100.000 Einwohner), die NICHT in der TOP_100 sind.
// Quelle: Statistische Ämter des Bundes und der Länder, Stand 2024 (grobe Auswahl).
// Ziel: Rest-Deutschland-Abdeckung für Bulk-Imports jenseits der Großstädte.
//
// Struktur pro Bundesland gruppiert, alphabetisch. Kein Anspruch auf Vollständigkeit,
// aber hohe Praxisdichte-Relevanz (Kreisstädte, Mittelzentren).

export const REST_DE_CITIES = [
  // Baden-Württemberg
  'Aalen', 'Achern', 'Albstadt', 'Backnang', 'Baden-Baden', 'Balingen', 'Biberach an der Riß',
  'Bietigheim-Bissingen', 'Böblingen', 'Bruchsal', 'Bühl', 'Calw', 'Crailsheim', 'Ehingen',
  'Ellwangen', 'Emmendingen', 'Eppingen', 'Ettlingen', 'Fellbach', 'Filderstadt', 'Freudenstadt',
  'Friedrichshafen', 'Gaggenau', 'Geislingen an der Steige', 'Göppingen', 'Heidenheim an der Brenz',
  'Herrenberg', 'Kehl', 'Kirchheim unter Teck', 'Kornwestheim', 'Lahr/Schwarzwald', 'Leimen',
  'Leinfelden-Echterdingen', 'Leonberg', 'Lörrach', 'Lud­wigsburg', 'Metzingen', 'Mosbach',
  'Mühlacker', 'Nagold', 'Nürtingen', 'Offenburg', 'Öhringen', 'Ostfildern', 'Radolfzell am Bodensee',
  'Rastatt', 'Ravensburg', 'Rheinfelden (Baden)', 'Rottenburg am Neckar', 'Rottweil',
  'Schorndorf', 'Schramberg', 'Schwäbisch Gmünd', 'Schwäbisch Hall', 'Schwetzingen', 'Sindelfingen',
  'Singen', 'Stutensee', 'Tuttlingen', 'Überlingen', 'Vaihingen an der Enz', 'Waghäusel',
  'Waiblingen', 'Waldshut-Tiengen', 'Wangen im Allgäu', 'Weil am Rhein', 'Weinheim', 'Weinstadt',
  'Wertheim', 'Wiesloch', 'Winnenden', 'Bretten',

  // Bayern
  'Amberg', 'Ansbach', 'Aschaffenburg', 'Bad Kissingen', 'Bad Reichenhall', 'Bad Tölz', 'Bamberg',
  'Bayreuth', 'Coburg', 'Dachau', 'Deggendorf', 'Dillingen an der Donau', 'Dinkelsbühl', 'Donauwörth',
  'Ebersberg', 'Eichstätt', 'Erding', 'Forchheim', 'Freising', 'Freilassing', 'Fürstenfeldbruck',
  'Garmisch-Partenkirchen', 'Germering', 'Günzburg', 'Hof', 'Kaufbeuren', 'Kempten (Allgäu)',
  'Kitzingen', 'Kulmbach', 'Landsberg am Lech', 'Landshut', 'Lauf an der Pegnitz', 'Lindau (Bodensee)',
  'Marktoberdorf', 'Marktredwitz', 'Memmingen', 'Miesbach', 'Mühldorf am Inn', 'Neuburg an der Donau',
  'Neumarkt in der Oberpfalz', 'Neu-Ulm', 'Nördlingen', 'Passau', 'Penzberg', 'Pfaffenhofen an der Ilm',
  'Rosenheim', 'Roth', 'Rothenburg ob der Tauber', 'Schwabach', 'Schwandorf', 'Schweinfurt',
  'Selb', 'Sonthofen', 'Starnberg', 'Straubing', 'Traunstein', 'Unterschleißheim', 'Vilshofen an der Donau',
  'Waldkraiburg', 'Wasserburg am Inn', 'Weiden in der Oberpfalz', 'Weilheim in Oberbayern', 'Weißenburg in Bayern',

  // Berlin – Berlin ist eine einzige Kommune und Top-1, keine weiteren Städte.

  // Brandenburg
  'Bernau bei Berlin', 'Brandenburg an der Havel', 'Eberswalde', 'Falkensee', 'Frankfurt (Oder)',
  'Fürstenwalde/Spree', 'Hennigsdorf', 'Königs Wusterhausen', 'Luckenwalde', 'Neuruppin',
  'Oranienburg', 'Rathenow', 'Schwedt/Oder', 'Senftenberg', 'Strausberg', 'Wittenberge',

  // Bremen – nur Bremen und Bremerhaven, beide in TOP_100.

  // Hamburg – ein einziger Stadtstaat, in TOP_100.

  // Hessen
  'Bad Homburg vor der Höhe', 'Bad Nauheim', 'Bad Vilbel', 'Bensheim', 'Butzbach', 'Dietzenbach',
  'Dreieich', 'Eschwege', 'Frankenberg (Eder)', 'Friedberg (Hessen)', 'Fulda', 'Gießen',
  'Groß-Gerau', 'Hattersheim am Main', 'Heppenheim (Bergstraße)', 'Herborn', 'Hofheim am Taunus',
  'Kelsterbach', 'Königstein im Taunus', 'Korbach', 'Langen (Hessen)', 'Lampertheim', 'Limburg an der Lahn',
  'Marburg', 'Mörfelden-Walldorf', 'Neu-Isenburg', 'Oberursel (Taunus)', 'Rodgau', 'Rüsselsheim am Main',
  'Viernheim', 'Weiterstadt', 'Wetzlar',

  // Mecklenburg-Vorpommern
  'Anklam', 'Bergen auf Rügen', 'Demmin', 'Greifswald', 'Grevesmühlen', 'Güstrow', 'Neubrandenburg',
  'Neustrelitz', 'Parchim', 'Ribnitz-Damgarten', 'Schwerin', 'Stralsund', 'Waren (Müritz)', 'Wismar', 'Wolgast',

  // Niedersachsen
  'Achim', 'Alfeld (Leine)', 'Aurich', 'Bad Salzuflen', 'Bramsche', 'Buchholz in der Nordheide',
  'Buxtehude', 'Celle', 'Cloppenburg', 'Cuxhaven', 'Delmenhorst', 'Emden', 'Garbsen', 'Gifhorn',
  'Goslar', 'Hameln', 'Helmstedt', 'Holzminden', 'Isernhagen', 'Laatzen', 'Langenhagen',
  'Lehrte', 'Leer (Ostfriesland)', 'Lingen (Ems)', 'Lüneburg', 'Melle', 'Meppen', 'Neustadt am Rübenberge',
  'Nienburg/Weser', 'Nordhorn', 'Northeim', 'Osterholz-Scharmbeck', 'Papenburg', 'Peine', 'Rinteln',
  'Schaumburg', 'Seelze', 'Seesen', 'Springe', 'Stade', 'Stadthagen', 'Uelzen', 'Vechta', 'Verden (Aller)',
  'Walsrode', 'Wedemark', 'Winsen (Luhe)', 'Wolfenbüttel',

  // Nordrhein-Westfalen
  'Ahlen', 'Arnsberg', 'Beckum', 'Bergheim', 'Bocholt', 'Borken', 'Brühl (Rheinland)', 'Castrop-Rauxel',
  'Coesfeld', 'Datteln', 'Detmold', 'Dinslaken', 'Dormagen', 'Dorsten', 'Dülmen', 'Emsdetten',
  'Erftstadt', 'Eschweiler', 'Euskirchen', 'Frechen', 'Geilenkirchen', 'Geldern', 'Gladbeck',
  'Grevenbroich', 'Gummersbach', 'Haan', 'Haltern am See', 'Heiligenhaus', 'Hemer', 'Hennef (Sieg)',
  'Herford', 'Herten', 'Herzogenrath', 'Hilden', 'Höxter', 'Hückelhoven', 'Hürth', 'Ibbenbüren',
  'Jülich', 'Kaarst', 'Kamen', 'Kamp-Lintfort', 'Kempen', 'Kerpen', 'Kleve', 'Kreuztal', 'Langenfeld (Rheinland)',
  'Lemgo', 'Lippstadt', 'Lohmar', 'Löhne', 'Lüdenscheid', 'Marsberg', 'Meerbusch', 'Menden (Sauerland)',
  'Meschede', 'Mettmann', 'Monheim am Rhein', 'Neukirchen-Vluyn', 'Niederkassel', 'Nordwalde',
  'Oer-Erkenschwick', 'Olpe', 'Overath', 'Pulheim', 'Rees', 'Rheinbach', 'Rheinberg', 'Rheine',
  'Rösrath', 'Sankt Augustin', 'Schwelm', 'Schwerte', 'Selm', 'Siegburg', 'Soest', 'Sprockhövel',
  'Steinfurt', 'Stolberg (Rheinland)', 'Sundern (Sauerland)', 'Troisdorf', 'Übach-Palenberg', 'Unna',
  'Velbert', 'Verl', 'Viersen', 'Voerde (Niederrhein)', 'Warendorf', 'Wegberg', 'Werl', 'Wermelskirchen',
  'Werne', 'Wesel', 'Wesseling', 'Wetter (Ruhr)', 'Wiehl', 'Willich', 'Wülfrath', 'Würselen',

  // Rheinland-Pfalz
  'Alzey', 'Andernach', 'Bad Dürkheim', 'Bad Kreuznach', 'Bendorf', 'Bingen am Rhein', 'Bitburg',
  'Frankenthal (Pfalz)', 'Germersheim', 'Grünstadt', 'Idar-Oberstein', 'Ingelheim am Rhein',
  'Landau in der Pfalz', 'Lahnstein', 'Mayen',
  'Neustadt an der Weinstraße', 'Neuwied', 'Pirmasens', 'Remagen', 'Sinzig', 'Speyer',
  'Wittlich', 'Zweibrücken',

  // Saarland
  'Blieskastel', 'Dillingen/Saar', 'Homburg', 'Lebach', 'Merzig', 'Neunkirchen (Saar)',
  'Püttlingen', 'Saarlouis', 'Sankt Ingbert', 'Sankt Wendel', 'Völklingen',

  // Sachsen
  'Annaberg-Buchholz', 'Aue-Bad Schlema', 'Bautzen', 'Coswig (Sachsen)', 'Döbeln', 'Freiberg',
  'Freital', 'Görlitz', 'Grimma', 'Hoyerswerda', 'Kamenz', 'Limbach-Oberfrohna', 'Markkleeberg',
  'Meißen', 'Mittweida', 'Pirna', 'Plauen', 'Radebeul', 'Reichenbach im Vogtland', 'Riesa', 'Schkeuditz',
  'Torgau', 'Werdau', 'Zittau',

  // Sachsen-Anhalt
  'Aschersleben', 'Bernburg (Saale)', 'Bitterfeld-Wolfen', 'Burg', 'Dessau-Roßlau', 'Eisleben (Lutherstadt)',
  'Halberstadt', 'Köthen (Anhalt)', 'Merseburg', 'Naumburg (Saale)', 'Quedlinburg', 'Sangerhausen',
  'Schönebeck (Elbe)', 'Stendal', 'Wernigerode', 'Wittenberg',

  // Schleswig-Holstein
  'Ahrensburg', 'Bad Oldesloe', 'Bad Schwartau', 'Elmshorn', 'Eutin', 'Geesthacht',
  'Glinde', 'Heide', 'Henstedt-Ulzburg', 'Husum', 'Itzehoe', 'Kaltenkirchen', 'Neumünster',
  'Norderstedt', 'Pinneberg', 'Preetz', 'Quickborn', 'Ratzeburg', 'Reinbek', 'Rendsburg',
  'Schleswig', 'Uetersen', 'Wedel',

  // Thüringen
  'Altenburg', 'Apolda', 'Arnstadt', 'Bad Langensalza', 'Eisenach', 'Gotha', 'Greiz',
  'Ilmenau', 'Meiningen', 'Mühlhausen/Thüringen', 'Nordhausen', 'Rudolstadt', 'Saalfeld/Saale',
  'Sömmerda', 'Sondershausen', 'Sonneberg', 'Suhl', 'Weimar', 'Zeulenroda-Triebes',
];

// Duplikate mit Top 100 entfernen (Sicherheitsnetz, falls User sowohl TOP als auch REST wählt)
// wird an der aufrufenden Stelle mit TOP_100_CITIES gefiltert.

/**
 * Anzahl Städte in dieser Liste. Zum Anzeigen im UI.
 */
export const REST_DE_CITIES_COUNT = REST_DE_CITIES.length;
