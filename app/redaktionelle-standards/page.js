import Link from 'next/link';

export const metadata = {
  title: 'Redaktionelle Standards – wie Navoria Praxisdaten prüft',
  description: 'Datenquellen, Aktualisierungsrhythmus, Umgang mit Konflikten und Korrekturen. Die Arbeitsgrundlage von Navoria im Detail.',
  alternates: { canonical: '/redaktionelle-standards' },
};

const h2 = 'mt-10 text-xl font-semibold text-slate-900';
const p = 'mt-3 text-[15px] leading-relaxed text-slate-700';
const ul = 'mt-3 space-y-2 text-[15px] leading-relaxed text-slate-700 list-disc pl-6 marker:text-slate-400';
const ol = 'mt-3 space-y-2 text-[15px] leading-relaxed text-slate-700 list-decimal pl-6 marker:text-slate-500';
const a = 'text-sky-700 underline underline-offset-2 hover:text-sky-800';

export default function RedaktionellePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">Redaktionelle Standards</span>
      </nav>

      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Redaktionelle Standards</h1>
      <p className="mt-3 text-lg text-slate-600">Wie Praxisdaten auf Navoria entstehen, geprüft und ausgetauscht werden. Ohne Marketing, mit klaren Zuständigkeiten.</p>

      <h2 className={h2}>1. Datenquellen</h2>
      <p className={p}>Praxisdaten auf Navoria kommen aus drei Strömen:</p>
      <ol className={ol}>
        <li><strong>Externe Karten- und Geschäftsverzeichnisdienste</strong> über deren offizielle Schnittstellen. Konkret genannte Anbieter finden Sie im <Link href="/impressum" className={a}>Impressum</Link>.</li>
        <li><strong>Manuell recherchierte Ergänzungen</strong> aus öffentlich einsehbaren Praxis-Websites (Kontakt, Öffnungszeiten, Fachrichtung).</li>
        <li><strong>Korrekturmeldungen</strong> von Nutzern und Praxen (siehe <Link href="/korrekturen" className={a}>Korrekturen einreichen</Link>).</li>
      </ol>
      <p className={p}>Kartendaten für die Anfahrt-Vorschau stammen von OpenStreetMap.</p>

      <h2 className={h2}>2. Was geprüft wird</h2>
      <p className={p}>Vor Veröffentlichung wird pro Praxis manuell durchgesehen:</p>
      <ul className={ul}>
        <li>Ist der Eintrag wirklich eine Praxis oder ein Praxisstandort (kein Handwerksbetrieb, kein Kosmetikstudio, kein Fitnessstudio)?</li>
        <li>Passt die Fachrichtung zum Praxis-Namen oder zur Website?</li>
        <li>Sieht die Adresse plausibel aus (Straße + Hausnummer + PLZ + Ort vollständig)?</li>
        <li>Ist die Praxis nach Angabe der Quelle noch aktiv?</li>
      </ul>
      <p className={p}>Einträge, die eine dieser Prüfungen nicht bestehen, werden entweder korrigiert oder aus der Veröffentlichung genommen.</p>

      <h2 className={h2}>3. Aktualisierungsrhythmus</h2>
      <p className={p}>Praxisdaten werden im Ziel-Rhythmus <strong>alle 90 Tage</strong> gegen die externen Quellen neu abgeglichen. Bei jedem neuen Import werden geänderte Felder – wie neue Öffnungszeiten oder eine geänderte Telefonnummer – übernommen. Auf jeder Praxisseite steht der konkrete Datenstand oben sichtbar.</p>
      <p className={p}>Wenn ein Eintrag älter als 90 Tage ist, erscheint in der Datenstand-Box automatisch ein Hinweis, der zur Bestätigung der Angaben bei der Praxis auffordert.</p>

      <h2 className={h2}>4. Umgang mit Konflikten zwischen manuell und extern</h2>
      <p className={p}>Wird ein Datenfeld manuell korrigiert (etwa nach einer Korrekturmeldung), wird dieses Feld als <em>manueller Override</em> markiert. Ein späterer automatischer Abgleich überschreibt Overrides <strong>nicht</strong>. Weicht die externe Quelle später vom Override ab, wird der Konflikt intern protokolliert und redaktionell erneut geprüft.</p>
      <p className={p}>Das gilt bewusst so, weil externe Verzeichnisdienste zwar breit sind, aber nicht immer die letzte Wahrheit haben – gerade nach Umzügen oder Praxisübergaben.</p>

      <h2 className={h2}>5. Was Navoria bewusst nicht macht</h2>
      <ul className={ul}>
        <li><strong>Keine automatischen Bewertungen oder Sterne.</strong> Navoria stellt keine Qualitätsurteile über Praxen auf.</li>
        <li><strong>Keine automatisch generierten Leistungstexte.</strong> Wenn konkrete Leistungen einer Praxis nicht bestätigt vorliegen, wird das offen benannt – statt einen typischen Fach-Leistungskatalog zu unterstellen.</li>
        <li><strong>Keine Fake-Angaben aus Marketing-Gründen.</strong> Fehlt eine Information, steht das dort.</li>
        <li><strong>Keine künstlich generierten Ratgebertexte auf Praxisseiten.</strong> Beschreibungen sind knapp und rein datenbasiert.</li>
      </ul>

      <h2 className={h2}>6. Zuständigkeit</h2>
      <p className={p}>Redaktionell verantwortlich nach § 18 Abs. 2 MStV: <strong>HYPERAI ADVERTISING LLC, 3500 South DuPont Hwy, Dover, DE 19901, USA</strong>. Kontakt für Anfragen zur Redaktion: <a href="mailto:mail@navoria.de" className={a}>mail@navoria.de</a>.</p>

      <h2 className={h2}>7. Beschwerden und Widersprüche</h2>
      <p className={p}>Betreiber einer Praxis, die ihren Eintrag geändert, entfernt oder unter eigener Kontrolle sehen möchten, kontaktieren <a href="mailto:mail@navoria.de" className={a}>mail@navoria.de</a>. Bearbeitung werktags, in der Regel innerhalb von zwei Arbeitstagen. Bis zur Klärung können einzelne Einträge temporär offline genommen werden.</p>

      <h2 className={h2}>8. Gesundheitsmagazin</h2>
      <p className={p}>Die Beiträge im Navoria-Gesundheitsmagazin dienen der allgemeinen Gesundheitsinformation. Medizinische Aussagen werden anhand öffentlich zugänglicher Leitlinien und Informationen anerkannter Institutionen erstellt und redaktionell geprüft. Als Quellen werden vorrangig AWMF-Leitlinien, G-BA, KBV, RKI, BfArM, BfS, STIKO und medizinische Fachgesellschaften verwendet.</p>
      <p className={p}>Die Beiträge ersetzen keine individuelle Diagnose oder Behandlung. Medikamentendosierungen und konkrete Therapieentscheidungen werden nur dargestellt, wenn dies für das Verständnis erforderlich ist und die notwendige Einordnung zu Risiken, Gegenanzeigen und ärztlicher Beratung möglich ist.</p>
      <p className={p}>Jeder Beitrag trägt ein Veröffentlichungsdatum und nach einer wesentlichen Überarbeitung ein Aktualisierungsdatum. Abgelaufene Leitlinien, geänderte Kassenleistungen und neue Sicherheitsinformationen werden bei der Aktualisierung berücksichtigt. Fehler können über die Korrekturfunktion oder per E-Mail an <a href="mailto:mail@navoria.de" className={a}>mail@navoria.de</a> gemeldet werden.</p>

      <h2 className={h2}>9. Änderungen an diesen Standards</h2>
      <p className={p}>Diese Seite kann sich ändern, wenn sich Prozesse ändern. Wesentliche Änderungen werden im Abschnitt <em>Zuständigkeit</em> mit einem Datum markiert.</p>
      <p className="mt-3 text-sm text-slate-500">Stand: Februar 2026.</p>
    </div>
  );
}
