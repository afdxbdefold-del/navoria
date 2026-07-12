import Link from 'next/link';
import { ShieldCheck, Mail, AlertTriangle, ExternalLink } from 'lucide-react';
import { getBaseUrl } from '@/lib/baseUrl';

export const dynamic = 'force-static';
export const revalidate = 3600;

export const metadata = {
  title: 'Erklärung zur Barrierefreiheit',
  description: 'Erklärung zur Barrierefreiheit von Navoria gemäß Barrierefreiheitsstärkungsgesetz (BFSG) und WCAG 2.1 Level AA.',
  alternates: { canonical: '/barrierefreiheit' },
  robots: { index: true, follow: true },
};

const h2 = 'mt-10 text-2xl font-semibold text-slate-900';
const h3 = 'mt-6 text-lg font-semibold text-slate-900';
const p = 'mt-3 text-[15px] leading-relaxed text-slate-700';
const ul = 'mt-3 list-disc space-y-1 pl-6 text-[15px] text-slate-700';
const a = 'text-sky-700 underline underline-offset-2 hover:text-sky-800';

export default async function BarrierefreiheitPage() {
  const base = await getBaseUrl();
  const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Start', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: 'Barrierefreiheit', item: `${base}/barrierefreiheit` },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link>
        <span aria-hidden="true">/</span>
        <span className="text-slate-700">Barrierefreiheit</span>
      </nav>

      <header>
        <div className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
          <ShieldCheck aria-hidden="true" className="h-3 w-3" /> BFSG-Erklärung
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Erklärung zur Barrierefreiheit
        </h1>
        <p className="mt-3 text-sm text-slate-500">Zuletzt aktualisiert: {today}</p>
      </header>

      <section>
        <p className={p}>
          AF Consulting ist als Betreiberin von <strong>navoria.de</strong> bemüht, die Website im Einklang mit dem <em>Barrierefreiheitsstärkungsgesetz (BFSG)</em> und der <em>EU-Richtlinie 2019/882</em> barrierefrei zugänglich zu machen. Als Zielstandard gilt die <a className={a} href="https://www.w3.org/Translations/WCAG21-de/" target="_blank" rel="noopener noreferrer">Web Content Accessibility Guidelines (WCAG) 2.1 in Konformitätsstufe AA<ExternalLink aria-hidden="true" className="ml-0.5 inline h-3 w-3" /></a>.
        </p>
      </section>

      <section>
        <h2 className={h2}>Geltungsbereich</h2>
        <p className={p}>
          Diese Erklärung gilt für die Website <a className={a} href={base || 'https://navoria.de'}>{base || 'https://navoria.de'}</a> einschließlich aller Unterseiten (Praxis-Profile, Ärzte-Verzeichnis, Fachrichtungs- und Symptom-Ratgeber, Bundesland-Übersichten, Ratgeber-Artikel und rechtliche Informationsseiten).
        </p>
      </section>

      <section>
        <h2 className={h2}>Stand der Konformität</h2>
        <p className={p}>
          Diese Website ist mit den WCAG 2.1 AA <strong>teilweise konform</strong>. Nachfolgend sind bekannte Einschränkungen sowie geplante Verbesserungen aufgeführt.
        </p>

        <h3 className={h3}>Umgesetzte Maßnahmen</h3>
        <ul className={ul}>
          <li>Semantische HTML-Struktur mit klarer Überschriften-Hierarchie (H1 → H2 → H3)</li>
          <li>Skip-Link „Zum Hauptinhalt springen“ auf jeder Seite</li>
          <li>Alle interaktiven Elemente sind per Tastatur bedienbar (Tab-Navigation)</li>
          <li>Sichtbarer Fokus-Indikator (WCAG 2.4.7)</li>
          <li>Aria-Labels für Bewertungs-Badges, Icon-Buttons und Navigations-Elemente</li>
          <li>Sprachdeklaration <code>lang=&quot;de&quot;</code> auf HTML-Ebene</li>
          <li>Responsives Design ohne horizontales Scrollen bei 320px Viewport (WCAG 1.4.10)</li>
          <li>Berücksichtigung von <code>prefers-reduced-motion</code> (WCAG 2.3.3)</li>
          <li>Structured Data (Schema.org) für maschinenlesbare Inhaltsauszeichnung</li>
          <li>Externe Karten (Google Maps) werden mit beschreibendem <code>title</code>-Attribut eingebettet</li>
        </ul>

        <h3 className={h3}>Bekannte Einschränkungen</h3>
        <p className={p}>
          Folgende Bereiche entsprechen aktuell noch nicht vollständig den Kriterien der WCAG 2.1 AA. An Verbesserungen wird gearbeitet:
        </p>
        <ul className={ul}>
          <li>Farbkontraste bei sekundären Text-Elementen (z. B. Meta-Angaben, Datumsangaben) liegen teilweise nahe am Mindestkontrast; ein systematisches Kontrast-Audit ist geplant.</li>
          <li>Bei eingebetteten Google-Karten sind die Steuerungselemente innerhalb des iframes nicht vollständig unter unserer Kontrolle – Alternative Angaben (Adresse, Route-Link) sind jedoch bereitgestellt.</li>
          <li>Ein automatisiertes Testing (axe-core, Lighthouse Accessibility Score) ist in Vorbereitung.</li>
          <li>Ein vollständiger Screenreader-Test mit NVDA und VoiceOver steht noch aus.</li>
        </ul>
      </section>

      <section>
        <h2 className={h2}>Erstellung dieser Erklärung</h2>
        <p className={p}>
          Diese Erklärung basiert auf einer <strong>Selbstbewertung</strong> der Betreiberin. Ein unabhängiger, extern durchgeführter Test (z. B. BITV-Test) ist geplant, aber noch nicht erfolgt.
        </p>
      </section>

      <section id="feedback">
        <h2 className={h2}>Barriere melden – Feedback-Mechanismus</h2>
        <p className={p}>
          Sind Ihnen Mängel bei der barrierefreien Nutzung von navoria.de aufgefallen, oder benötigen Sie Informationen in einer alternativen Form? Wir freuen uns über Ihre Rückmeldung.
        </p>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
          <div className="flex items-start gap-3">
            <Mail aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Kontakt für Barrierefreiheit</h3>
              <p className="mt-1 text-sm text-slate-600">
                E-Mail: <a className={a} href="mailto:barrierefreiheit@navoria.de">barrierefreiheit@navoria.de</a><br />
                Ersatzweise: <a className={a} href="mailto:mail@navoria.de">mail@navoria.de</a>
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Bitte beschreiben Sie so konkret wie möglich, welche Seite und welches Element betroffen sind. Wir bemühen uns um eine Antwort innerhalb von 5 Werktagen.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className={h2}>Durchsetzungsverfahren</h2>
        <p className={p}>
          Sollten Sie mit unserer Rückmeldung nicht zufrieden sein oder keine Antwort erhalten, können Sie sich an die zuständige Marktüberwachungsstelle nach dem BFSG wenden:
        </p>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Marktüberwachungsstelle der Länder für Barrierefreiheit von Produkten und Dienstleistungen (MLBF)</h3>
              <p className="mt-1 text-sm text-slate-600">
                Landesamt für Soziales, Jugend und Versorgung Rheinland-Pfalz<br />
                Rheinallee 97–101, 55118 Mainz<br />
                Web: <a className={a} href="https://mlbf.rlp.de" target="_blank" rel="noopener noreferrer">mlbf.rlp.de<ExternalLink aria-hidden="true" className="ml-0.5 inline h-3 w-3" /></a><br />
                E-Mail: <a className={a} href="mailto:info@mlbf.rlp.de">info@mlbf.rlp.de</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className={h2}>Weiterführende Informationen</h2>
        <ul className={ul}>
          <li><Link href="/redaktionelle-standards" className={a}>Redaktionelle Standards</Link> – wie Inhalte auf Navoria geprüft werden</li>
          <li><Link href="/impressum" className={a}>Impressum</Link></li>
          <li><Link href="/datenschutz" className={a}>Datenschutzerklärung</Link></li>
          <li><a className={a} href="https://www.bmas.de/DE/Service/Gesetze-und-Gesetzesvorhaben/barrierefreiheitsstaerkungsgesetz.html" target="_blank" rel="noopener noreferrer">BFSG beim Bundesministerium für Arbeit und Soziales<ExternalLink aria-hidden="true" className="ml-0.5 inline h-3 w-3" /></a></li>
        </ul>
      </section>
    </div>
  );
}
