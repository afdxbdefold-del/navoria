import Link from 'next/link';

export const metadata = {
  title: 'Über Navoria – was wir tun und was nicht',
  description: 'Navoria ist ein deutschsprachiges Verzeichnis für Arztpraxen. Betreiber, Aufgabe, Grenzen und Aktualisierung der Daten – ehrlich erklärt.',
  alternates: { canonical: '/ueber-uns' },
};

const h2 = 'mt-10 text-xl font-semibold text-slate-900';
const p = 'mt-3 text-[15px] leading-relaxed text-slate-700';
const ul = 'mt-3 space-y-2 text-[15px] leading-relaxed text-slate-700 list-disc pl-6 marker:text-slate-400';
const a = 'text-sky-700 underline underline-offset-2 hover:text-sky-800';

export default function UeberUnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">Über Navoria</span>
      </nav>

      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Über Navoria</h1>
      <p className="mt-3 text-lg text-slate-600">Ein Verzeichnis, das eine Sache gut machen soll: den Weg zur passenden Praxis kurz halten.</p>

      <h2 className={h2}>Was Navoria ist</h2>
      <p className={p}>Navoria sammelt öffentlich verfügbare Informationen zu Arzt-, Zahnarzt- und Facharztpraxen in Deutschland und stellt sie so dar, dass drei Fragen schnell beantwortet sind:</p>
      <ul className={ul}>
        <li>Wo ist die Praxis?</li>
        <li>Wie kontaktiere ich sie?</li>
        <li>Wann hat sie geöffnet?</li>
      </ul>
      <p className={p}>Zum Start (Sommer 2026) sind rund 120 Praxen aus Berlin, Hamburg und München erfasst. Der Bestand wird schrittweise erweitert – nicht in einem großen Rundumschlag, sondern Stadt für Stadt, damit die Datenqualität pro Ort hoch bleibt.</p>

      <h2 className={h2}>Was Navoria nicht ist</h2>
      <p className={p}>Damit klar ist, was Sie hier <em>nicht</em> finden:</p>
      <ul className={ul}>
        <li><strong>Keine medizinische Beratung.</strong> Auf den Praxisseiten steht, wer wo praktiziert – nicht, welche Behandlung für Sie richtig ist. Bei akuten Beschwerden rufen Sie 112 oder die 116 117.</li>
        <li><strong>Keine Terminvergabe.</strong> Termine vereinbaren Sie direkt bei der Praxis. Wenn ein Praxis-Website-Link hinterlegt ist, führt er zu deren eigenem Buchungssystem – sofern vorhanden.</li>
        <li><strong>Keine Werbe-Rankings.</strong> Reihenfolgen in Suchen und Listen entstehen aus Datenvollständigkeit und Relevanz, nicht aus bezahlten Platzierungen.</li>
      </ul>

      <h2 className={h2}>Wer betreibt Navoria</h2>
      <p className={p}>Navoria wird als Einzelprojekt der <strong>AF Consulting, Am Nesseufer 1, 26789 Leer</strong> betrieben. Verantwortlich ist Andreas Frey. Vollständige Kontakt- und Anschriftsangaben stehen im <Link href="/impressum" className={a}>Impressum</Link>.</p>
      <p className={p}>Erreichbar per E-Mail: <a href="mailto:mail@navoria.de" className={a}>mail@navoria.de</a>. Auf Anfragen wird werktags in der Regel innerhalb von zwei Arbeitstagen reagiert.</p>

      <h2 className={h2}>Wie die Daten entstehen</h2>
      <p className={p}>Praxis-Grunddaten (Name, Adresse, Telefon, Website, Öffnungszeiten, Barrierefreiheit) stammen aus externen Karten- und Geschäftsverzeichnisdiensten und werden über deren offizielle Programmierschnittstellen bezogen. Details zu diesen Quellen stehen im <Link href="/impressum" className={a}>Impressum</Link> und in der <Link href="/datenschutz" className={a}>Datenschutzerklärung</Link>.</p>
      <p className={p}>Die Daten werden <strong>manuell kontrolliert</strong> und – wo nötig – nachbearbeitet. Manuelle Korrekturen überschreiben nicht automatisch die externen Quellen: die Korrektur bleibt bestehen, auch wenn die externe Quelle abweicht. Details dazu unter <Link href="/redaktionelle-standards" className={a}>Redaktionelle Standards</Link>.</p>

      <h2 className={h2}>Wie Sie mithelfen können</h2>
      <p className={p}>Wenn Ihnen ein Fehler auffällt – falsche Nummer, veränderte Öffnungszeiten, umgezogene Praxis – nutzen Sie den <strong>„Fehler melden“-Button</strong> auf der jeweiligen Praxisseite. Meldungen werden werktags geprüft. Praxisinhaber, die ihr Profil selbst pflegen möchten, schreiben bitte kurz an <a href="mailto:mail@navoria.de" className={a}>mail@navoria.de</a>. Ein Self-Service-Claim ist für spätere Ausbaustufen geplant.</p>

      <h2 className={h2}>Was noch fehlt</h2>
      <p className={p}>Ehrlich gesagt einiges. Die Roadmap enthält derzeit:</p>
      <ul className={ul}>
        <li>Ausbau auf 100+ Städte.</li>
        <li>Verifizierungs-Programm für Praxisinhaber (Claim-Flow).</li>
        <li>Redaktionell geprüfte Zusatzinformationen (Sprachen, Kassen/Privat, Schwerpunkte) – nur wenn bestätigt.</li>
        <li>Verlinkung mit amtlichen Facharzt-Registern, sobald technisch verfügbar.</li>
      </ul>
      <p className={p}>Bis dahin gilt: <strong>Was auf Navoria steht, bitte vor dem Besuch bei der Praxis kurz bestätigen.</strong> Das steht auch auf jeder Praxisseite, aber es ist wichtig genug, um es hier zu wiederholen.</p>

      <h2 className={h2}>Weiterführend</h2>
      <ul className={ul}>
        <li><Link href="/redaktionelle-standards" className={a}>Wie Daten geprüft und aktualisiert werden</Link></li>
        <li><Link href="/korrekturen" className={a}>Wie Sie Korrekturen einreichen können</Link></li>
        <li><Link href="/impressum" className={a}>Impressum</Link></li>
        <li><Link href="/datenschutz" className={a}>Datenschutz</Link></li>
      </ul>
    </div>
  );
}
