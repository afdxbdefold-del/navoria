import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Korrekturen und Fehlermeldungen',
  description: 'So melden Sie falsche Angaben zu einer Praxis auf Navoria. Bearbeitungszeit, Verfahren und Ansprechpartner.',
  alternates: { canonical: '/korrekturen' },
};

const h2 = 'mt-10 text-xl font-semibold text-slate-900';
const p = 'mt-3 text-[15px] leading-relaxed text-slate-700';
const ul = 'mt-3 space-y-2 text-[15px] leading-relaxed text-slate-700 list-disc pl-6 marker:text-slate-400';
const ol = 'mt-3 space-y-2 text-[15px] leading-relaxed text-slate-700 list-decimal pl-6 marker:text-slate-500';
const a = 'text-sky-700 underline underline-offset-2 hover:text-sky-800';

export default function KorrekturenPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">Korrekturen</span>
      </nav>

      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Korrekturen einreichen</h1>
      <p className="mt-3 text-lg text-slate-600">Kurz erklärt: wie Sie einen falschen Eintrag korrigieren lassen und wie lange das dauert.</p>

      <div className="mt-8 flex items-start gap-3 rounded-xl border border-sky-100 bg-sky-50/60 p-5 text-sm text-sky-900">
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
        <div>Auf jeder Praxisseite finden Sie unten den Button <strong>„Fehler melden“</strong>. Das ist der schnellste Weg.</div>
      </div>

      <h2 className={h2}>1. Was Sie melden können</h2>
      <ul className={ul}>
        <li>Falsche Telefonnummer, Adresse, Website</li>
        <li>Geänderte oder falsche Öffnungszeiten</li>
        <li>Praxis ist umgezogen oder geschlossen</li>
        <li>Falsche Fachrichtung</li>
        <li>Falscher oder veränderter Praxisname</li>
        <li>Doppelte Einträge</li>
      </ul>

      <h2 className={h2}>2. Wie es abläuft</h2>
      <ol className={ol}>
        <li>Sie klicken auf der Praxisseite auf <em>Fehler melden</em>.</li>
        <li>Sie wählen das betroffene Feld, tragen den korrekten Wert und optional eine kurze Begründung ein.</li>
        <li>Wenn Sie eine E-Mail-Adresse angeben, erhalten Sie eine Nachricht, sobald die Meldung bearbeitet wurde.</li>
        <li>Werktags meldet sich die Redaktion in der Regel innerhalb von <strong>zwei Arbeitstagen</strong> zurück oder übernimmt die Korrektur direkt.</li>
      </ol>

      <h2 className={h2}>3. Wie mit Korrekturen umgegangen wird</h2>
      <p className={p}>Bestätigte Korrekturen werden als <em>manueller Override</em> gespeichert. Ein späterer automatischer Datenabgleich überschreibt diese Korrektur nicht. Weicht die externe Quelle in Zukunft ab, wird der Konflikt intern protokolliert und erneut geprüft. Details unter <Link href="/redaktionelle-standards" className={a}>Redaktionelle Standards</Link>, Abschnitt 4.</p>

      <h2 className={h2}>4. Wer meldet, was passiert mit meiner E-Mail?</h2>
      <p className={p}>Die E-Mail-Adresse wird ausschließlich für die Rückmeldung zur konkreten Korrektur genutzt. Keine Werbung, keine Weitergabe. Ohne E-Mail-Adresse wird die Meldung anonym bearbeitet, dann gibt es allerdings keine Rückmeldung an Sie.</p>

      <h2 className={h2}>5. Praxisinhaber</h2>
      <p className={p}>Wenn Sie Inhaber der Praxis sind und Ihren Eintrag selbst pflegen oder löschen lassen möchten, schreiben Sie bitte direkt an <a href="mailto:mail@navoria.de" className={a}>mail@navoria.de</a> – idealerweise mit einer Absender-Adresse Ihrer Praxis-Domain. Wir arbeiten an einem Self-Service-Claim, der später eigenständiges Verwalten erlauben soll.</p>

      <h2 className={h2}>6. Kontakt für Sonderfälle</h2>
      <p className={p}>Für rechtliche Anliegen, Datenschutz-Anfragen oder Beschwerden nutzen Sie bitte die Kontaktdaten aus dem <Link href="/impressum" className={a}>Impressum</Link>. Für allgemeine Rückfragen zur Redaktion: <a href="mailto:mail@navoria.de" className={a}>mail@navoria.de</a>.</p>
    </div>
  );
}
