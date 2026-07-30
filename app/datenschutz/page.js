import Link from 'next/link';

export const metadata = {
  title: 'Datenschutzerklärung',
  description: 'Informationen zur Datenverarbeitung bei Navoria nach DSGVO.',
  alternates: { canonical: '/datenschutz' },
  robots: { index: true, follow: false },
};

export default function DatenschutzPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link> <span>/</span> <span className="text-slate-700">Datenschutz</span>
      </nav>

      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Datenschutzerklärung</h1>
      <p className="mt-2 text-sm text-slate-500">Informationen zur Datenverarbeitung nach Art. 13/14 DSGVO. Stand: {new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}</p>

      <section className="mt-8 space-y-8 text-slate-700">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">1. Verantwortlicher</h2>
          <address className="not-italic mt-2 leading-relaxed">
            HYPERAI ADVERTISING LLC<br />
            3500 South DuPont Hwy<br />
            Dover, DE 19901<br />
            USA<br />
            E-Mail: <a href="mailto:mail@navoria.de" className="text-sky-700 hover:underline">mail@navoria.de</a>
          </address>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">2. Zweck und Umfang von Navoria</h2>
          <p className="mt-2">
            Navoria ist ein öffentliches Verzeichnis von Arztpraxen, Zahnarztpraxen, Apotheken und
            weiteren Gesundheitseinrichtungen in Deutschland. Die angezeigten Praxis-Informationen (Name,
            Adresse, Telefonnummer, Website, Öffnungszeiten, Bewertungsdurchschnitt und Anzahl der Bewertungen)
            werden aus öffentlich zugänglichen Quellen – insbesondere über die Google Places API – abgerufen
            und in unserer Datenbank gespeichert. Es handelt sich um Angaben über Unternehmen bzw.
            berufliche Kontaktdaten, nicht um private personenbezogene Daten von Patient:innen.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">3. Zugriff auf die Website (Server-Logs)</h2>
          <p className="mt-2">
            Beim Aufruf unserer Seiten werden von unserem Hosting-Anbieter automatisch technische Daten
            in Server-Logfiles erfasst, die Ihr Browser übermittelt: Datum und Uhrzeit der Anfrage,
            aufgerufene URL, HTTP-Statuscode, übertragene Datenmenge, verwendeter Browser, Betriebssystem
            und eine anonymisierte oder vollständige IP-Adresse. Rechtsgrundlage ist Art. 6 Abs. 1
            lit. f DSGVO (berechtigtes Interesse an sicherem und stabilem Betrieb). Diese Logs werden
            ausschließlich zur Erkennung von Störungen sowie zur Abwehr von Angriffen genutzt und nach
            spätestens 30 Tagen gelöscht, sofern nicht ein konkreter Sicherheitsvorfall vorliegt.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">4. Suchanfragen und Symptom-Assistent</h2>
          <p className="mt-2">
            Wenn Sie in unserer Suche einen Begriff, einen Ort oder Beschwerden eingeben, wird diese
            Eingabe zur Ermittlung der Ergebnisse an unseren Server übermittelt. Wir speichern diese
            Eingaben nicht dauerhaft und verknüpfen sie nicht mit Ihrer Person oder Ihrer IP-Adresse.
            Der Symptom-Assistent verwendet ein lokales, statisches Zuordnungssystem (Beschwerden
            → Fachrichtung) und leitet Ihre Eingabe nicht an externe Dienste weiter.
          </p>
          <p className="mt-2">
            Wichtiger Hinweis: Navoria ist ein Informationsangebot und ersetzt keine ärztliche
            Diagnose oder Beratung. Bei akuten oder lebensbedrohlichen Beschwerden wählen Sie den
            Notruf 112.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">5. Cookies und Zustimmung</h2>
          <p className="mt-2">
            Beim ersten Besuch von Navoria fragen wir Sie über einen Consent-Banner, ob Sie
            der Nutzung von Werbe-Cookies zustimmen möchten. Sie haben die Wahl zwischen:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li><b>Nur notwendige</b> – es werden keine Werbe- oder Tracking-Cookies gesetzt, und Google AdSense wird nicht geladen.</li>
            <li><b>Alle akzeptieren</b> – Google AdSense wird geladen und darf Cookies für personalisierte Anzeigen setzen (Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO).</li>
          </ul>
          <p className="mt-3">
            Ihre Entscheidung wird lokal in Ihrem Browser (localStorage-Schlüssel <code>navoria_consent_v1</code>) gespeichert.
            Sie können Ihre Einwilligung jederzeit über den Link „Cookie-Einstellungen ändern" im Footer widerrufen; künftig
            geladene Seiten laden AdSense dann nicht mehr.
          </p>
          <p className="mt-3">
            Im geschützten Administrationsbereich (<code>/admin</code>) wird zur Anmeldung ein technisch notwendiger
            Sitzungs-Token ebenfalls im lokalen Speicher (localStorage) Ihres Browsers abgelegt. Dieser dient allein der
            Authentifizierung angemeldeter Redaktions-Accounts und wird beim Abmelden gelöscht.
          </p>
          <p className="mt-3">
            Zusätzlich setzen wir ein technisch notwendiges First-Party-Cookie <code>navoria_sid</code>
            (Session-ID, 1&nbsp;Jahr Laufzeit, HttpOnly, SameSite=Lax). Es dient ausschließlich der reichweiten- und
            fehleranalytischen Erhebung („Wie viele Nutzer:innen sind aktuell aktiv?"). Wir setzen dieses Cookie
            <b> ohne Einwilligung</b>, da es strictly-necessary im Sinne von § 25 Abs. 2 Nr.&nbsp;2 TTDSG ist. Details
            zur Verarbeitung siehe Abschnitt „Reichweitenmessung".
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">5a. Reichweitenmessung (First-Party-Analytics)</h2>
          <p className="mt-2">
            Wir erheben zur Reichweitenmessung und Fehleranalyse folgende pseudonymisierte Daten in einer eigenen
            Datenbank (keine Weitergabe an Dritte, kein Google Analytics, kein Cross-Site-Tracking):
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li>Session-ID (siehe oben) – kein Personenbezug</li>
            <li>Aufgerufener Pfad und Verweisquelle (Referrer)</li>
            <li>Grober Standort (Land, Region, Stadt) aus Server-Headern der Content Delivery Infrastruktur</li>
            <li>Geräte-Kategorie (Desktop/Mobile/Tablet) und Browser-Familie</li>
            <li>Ein <b>täglich rotierender SHA-256-Hash</b> der IP-Adresse (nicht die IP selbst)</li>
          </ul>
          <p className="mt-3">
            Rechtsgrundlage: Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO (berechtigtes Interesse an einem stabilen,
            zielgruppengerecht betriebenen Angebot). Rohdaten werden automatisch nach <b>90 Tagen</b> gelöscht
            (MongoDB TTL-Index). Die Speicherung erfolgt ausschließlich in unserer eigenen Datenbank und wird nicht
            an Dritte übermittelt.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">5a. Google AdSense (nur bei Einwilligung)</h2>
          <p className="mt-2">
            Wenn Sie im Consent-Banner „Alle akzeptieren" wählen, integrieren wir das Werbe-Netzwerk
            Google AdSense zur Anzeige von Werbeanzeigen. Anbieter ist die Google Ireland Limited,
            Gordon House, Barrow Street, Dublin 4, Irland (im Folgenden „Google").
          </p>
          <p className="mt-3">
            Google AdSense verwendet Cookies (u.&nbsp;a. <code>__gads</code>, <code>__gpi</code>, <code>NID</code>) und
            vergleichbare Technologien (Web Beacons), um Werbeanzeigen personalisiert auszuspielen, Anzeigen-Betrug zu
            verhindern und die Wirksamkeit der Anzeigen zu messen. Dabei können folgende Daten an Google übermittelt werden:
            IP-Adresse (gekürzt), Browsertyp und -version, aufgerufene Seiten, Verweildauer, Klicks, Gerätetyp.
          </p>
          <p className="mt-3">
            <b>Rechtsgrundlage:</b> Ihre ausdrückliche Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO
            und § 25 Abs. 1 TDDDG (früher TTDSG). Ohne diese Einwilligung wird das AdSense-Script <b>nicht</b> geladen.
          </p>
          <p className="mt-3">
            <b>Datenübermittlung in Drittländer:</b> Google verarbeitet Daten teilweise in den USA. Google LLC ist unter dem
            EU-US Data Privacy Framework zertifiziert und bietet damit ein anerkanntes Schutzniveau.
          </p>
          <p className="mt-3">
            <b>Widerruf & Einstellungen:</b>
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Über den Link „Cookie-Einstellungen ändern" im Footer können Sie Ihre Einwilligung jederzeit widerrufen.</li>
            <li>Direkt bei Google unter{' '}
              <a href="https://adssettings.google.com/" target="_blank" rel="noreferrer" className="text-sky-700 hover:underline">adssettings.google.com</a>{' '}
              können Sie personalisierte Werbung ganz deaktivieren.
            </li>
            <li>Weitere Informationen: {' '}
              <a href="https://policies.google.com/technologies/ads?hl=de" target="_blank" rel="noreferrer" className="text-sky-700 hover:underline">policies.google.com/technologies/ads</a>.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">6. Eingebundene Drittdienste</h2>

          <h3 className="mt-3 text-sm font-semibold text-slate-800">6.1 Google Places API (Datenquelle)</h3>
          <p className="mt-1">
            Zur Befüllung der Praxisdatenbank rufen wir serverseitig über die Google Places API
            öffentliche Ortsdaten ab. Die Anfrage geht ausschließlich von unserem Server an Google
            aus; Ihre IP-Adresse wird dabei nicht übertragen. Anbieter: Google Ireland Limited,
            Gordon House, Barrow Street, Dublin 4, Irland. Datenschutz: {' '}
            <a href="https://policies.google.com/privacy?hl=de" target="_blank" rel="noreferrer" className="text-sky-700 hover:underline">policies.google.com/privacy</a>.
          </p>

          <h3 className="mt-4 text-sm font-semibold text-slate-800">6.2 Google-Maps-Karte auf Profilseiten</h3>
          <p className="mt-1">
            Auf einzelnen Praxis-Profilseiten binden wir eine Google-Maps-Karte per <code>iframe</code>
            von <code>google.com/maps</code> ein. Beim Aufruf der Profilseite baut Ihr Browser eine
            direkte Verbindung zu Google-Servern auf; dabei können Ihre IP-Adresse und die aufgerufene
            Karte an Google übertragen werden. Wir haben auf diesen Datenaustausch keinen Einfluss.
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer bequemen
            Wegbeschreibung für Nutzer). Anbieter: Google Ireland Limited (siehe oben).
          </p>

          <h3 className="mt-4 text-sm font-semibold text-slate-800">6.3 OpenStreetMap-Kachelkarten auf der Suchseite</h3>
          <p className="mt-1">
            In der Kartenansicht der Suche verwenden wir Kartenmaterial (Tiles) von OpenStreetMap.
            Beim Laden der Kartenkacheln wird Ihre IP-Adresse an Server der OpenStreetMap Foundation
            übermittelt. Anbieter: OpenStreetMap Foundation, St John’s Innovation Centre, Cowley Road,
            Cambridge, CB4 0WS, Vereinigtes Königreich. Datenschutz: {' '}
            <a href="https://osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noreferrer" className="text-sky-700 hover:underline">osmfoundation.org/wiki/Privacy_Policy</a>.
          </p>

          <p className="mt-4 text-sm">
            Bei den unter 6.1 und 6.2 genannten Google-Diensten kann eine Übermittlung von Daten in
            Länder außerhalb der EU (insbesondere USA) nicht vollständig ausgeschlossen werden. Google
            LLC hat sich dem EU-US Data Privacy Framework unterworfen.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">7. Kontaktaufnahme per E-Mail</h2>
          <p className="mt-2">
            Wenn Sie uns per E-Mail kontaktieren, werden Ihre Angaben (E-Mail-Adresse, Name, Nachricht)
            zur Bearbeitung der Anfrage gespeichert. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO
            (vorvertragliche Maßnahmen) bzw. Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der
            Beantwortung Ihrer Anfrage). Wir löschen die Daten, sobald die Anfrage abschließend
            bearbeitet wurde, spätestens jedoch nach 6 Monaten – sofern keine gesetzlichen
            Aufbewahrungspflichten dem entgegenstehen.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">8. Ihre Rechte</h2>
          <p className="mt-2">Sie haben nach DSGVO folgende Rechte gegenüber uns bezüglich Ihrer personenbezogenen Daten:</p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
            <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
            <li>Recht auf Löschung (Art. 17 DSGVO)</li>
            <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerspruchsrecht gegen Verarbeitungen aus berechtigtem Interesse (Art. 21 DSGVO)</li>
            <li>Beschwerderecht bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
          </ul>
          <p className="mt-3">
            Bei Fragen oder zur Ausübung Ihrer Rechte wenden Sie sich per E-Mail an{' '}
            <a href="mailto:mail@navoria.de" className="text-sky-700 hover:underline">mail@navoria.de</a>.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">9. Aufnahme in oder Löschung aus dem Verzeichnis</h2>
          <p className="mt-2">
            Praxen und Einrichtungen, die in Navoria gelistet sind und deren Eintrag nicht (mehr) öffentlich
            angezeigt werden soll, können dies formlos per E-Mail an{' '}
            <a href="mailto:mail@navoria.de" className="text-sky-700 hover:underline">mail@navoria.de</a>{' '}
            beantragen. Wir deaktivieren den Eintrag zeitnah, spätestens innerhalb von 14 Tagen.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">10. Änderungen dieser Datenschutzerklärung</h2>
          <p className="mt-2">
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen
            rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen umzusetzen.
            Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.
          </p>
        </div>
      </section>
    </div>
  );
}
