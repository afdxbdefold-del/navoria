import Link from 'next/link';

const PRACTICE = {
  name: 'Dr. med. Thomas Gerhardt',
  role: 'Facharzt für Innere Medizin',
  tagline: 'Innere Medizin in Hagen',
  hero_headline: 'Persönliche internistische Versorgung im Herzen Hagens.',
  hero_intro: 'Willkommen in der Praxis von Dr. med. Thomas Gerhardt. Wir nehmen uns Zeit für Ihre Beschwerden – mit klarer Diagnostik, sorgfältiger Beratung und langjähriger internistischer Erfahrung.',
  street: 'Elberfelder Str. 55',
  postal_code: '58095',
  city: 'Hagen',
  phone_display: '02331 338447',
  phone_link: '+4923313 38447',
  email: null,
  website: null,
  hours: [
    { day: 'Montag', ranges: ['07:30 – 12:00', '14:00 – 16:00'] },
    { day: 'Dienstag', ranges: ['07:30 – 12:00', '14:00 – 16:00'] },
    { day: 'Mittwoch', ranges: ['07:30 – 12:00'] },
    { day: 'Donnerstag', ranges: ['07:30 – 12:00'] },
    { day: 'Freitag', ranges: ['07:30 – 12:00'] },
    { day: 'Samstag', ranges: ['Geschlossen'] },
    { day: 'Sonntag', ranges: ['Geschlossen'] },
  ],
  services: [
    { title: 'Allgemeine Innere Medizin', text: 'Beratung, Diagnostik und Behandlung bei internistischen Erkrankungen des Alltags.' },
    { title: 'Vorsorgeuntersuchungen', text: 'Check-ups, Gesundheits-Check-up ab 35 und Hautkrebs-Screening in Zusammenarbeit.' },
    { title: 'EKG & Belastungs-EKG', text: 'Ruhe- und Belastungs-EKG zur Abklärung von Herz- und Kreislaufbeschwerden.' },
    { title: 'Blutdruck-Diagnostik', text: 'Langzeit-Blutdruckmessung und individuelle Therapieplanung bei Hypertonie.' },
    { title: 'Labor & Blutanalyse', text: 'Umfassende Blut-, Urin- und Stuhldiagnostik direkt in der Praxis.' },
    { title: 'Impfberatung', text: 'Grippeschutz-, Reise- und Auffrischimpfungen nach STIKO-Empfehlung.' },
  ],
};

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://navoria.de';
const PAGE_PATH = '/drmed-thomas-gerhard';
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

export const metadata = {
  title: {
    absolute: `${PRACTICE.name} – ${PRACTICE.role} in ${PRACTICE.city}`,
  },
  description: `Praxis ${PRACTICE.name} in ${PRACTICE.city}. Adresse: ${PRACTICE.street}, ${PRACTICE.postal_code} ${PRACTICE.city}. Termine telefonisch unter ${PRACTICE.phone_display}.`,
  alternates: { canonical: PAGE_PATH },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: PAGE_URL,
    title: `${PRACTICE.name} – ${PRACTICE.role} in ${PRACTICE.city}`,
    description: `Praxis für Innere Medizin in ${PRACTICE.city}. ${PRACTICE.street}, ${PRACTICE.postal_code} ${PRACTICE.city}. Telefon: ${PRACTICE.phone_display}.`,
    siteName: `Praxis ${PRACTICE.name}`,
  },
  twitter: {
    card: 'summary',
    title: `${PRACTICE.name} – ${PRACTICE.role} in ${PRACTICE.city}`,
    description: `${PRACTICE.tagline}. Termine: ${PRACTICE.phone_display}.`,
  },
};

function buildJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    '@id': `${PAGE_URL}#physician`,
    name: PRACTICE.name,
    medicalSpecialty: 'InternalMedicine',
    url: PAGE_URL,
    telephone: PRACTICE.phone_display,
    address: {
      '@type': 'PostalAddress',
      streetAddress: PRACTICE.street,
      postalCode: PRACTICE.postal_code,
      addressLocality: PRACTICE.city,
      addressCountry: 'DE',
    },
    openingHoursSpecification: PRACTICE.hours
      .filter((h) => h.ranges[0] !== 'Geschlossen')
      .map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: {
          'Montag': 'https://schema.org/Monday',
          'Dienstag': 'https://schema.org/Tuesday',
          'Mittwoch': 'https://schema.org/Wednesday',
          'Donnerstag': 'https://schema.org/Thursday',
          'Freitag': 'https://schema.org/Friday',
        }[h.day],
        opens: h.ranges[0].split(' – ')[0].trim(),
        closes: (h.ranges[h.ranges.length - 1] || h.ranges[0]).split(' – ')[1].trim(),
      })),
  };
}

export default function DrGerhardtPage() {
  const jsonLd = buildJsonLd();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2" aria-label="Zurück zum Seitenanfang">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-sm font-semibold text-white" aria-hidden="true">TG</span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-slate-900">{PRACTICE.name}</span>
              <span className="text-[11px] text-slate-500">{PRACTICE.tagline}</span>
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex" aria-label="Praxis-Navigation">
            <a href="#ueber" className="hover:text-emerald-700">Über</a>
            <a href="#leistungen" className="hover:text-emerald-700">Leistungen</a>
            <a href="#kontakt" className="hover:text-emerald-700">Kontakt</a>
            <a href="#impressum" className="hover:text-emerald-700">Impressum</a>
          </nav>
          <a
            href={`tel:${PRACTICE.phone_link}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-800 sm:text-sm"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            {PRACTICE.phone_display}
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-800">Internistische Praxis · {PRACTICE.city}</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              {PRACTICE.hero_headline}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl">{PRACTICE.hero_intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`tel:${PRACTICE.phone_link}`} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                {PRACTICE.phone_display}
              </a>
              <a href="#kontakt" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700">
                Anfahrt &amp; Öffnungszeiten
              </a>
            </div>
          </div>

          {/* Quick-Info Karten */}
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickCard label="Adresse" value={`${PRACTICE.street}, ${PRACTICE.postal_code} ${PRACTICE.city}`} />
            <QuickCard label="Telefon" value={PRACTICE.phone_display} />
            <QuickCard label="Fachrichtung" value="Innere Medizin" />
            <QuickCard label="Sprechzeiten" value="Mo–Fr nach Plan" />
          </div>
        </div>
      </section>

      {/* Über */}
      <section id="ueber" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-800">Über die Praxis</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Internistische Kompetenz mit Zeit für den Menschen.</h2>
          </div>
          <div className="space-y-4 text-base text-slate-700 sm:text-lg">
            <p>
              Dr. med. Thomas Gerhardt ist als Facharzt für Innere Medizin in {PRACTICE.city} niedergelassen. In
              ruhiger Atmosphäre erhalten Sie eine gründliche Anamnese, verständliche Aufklärung und eine auf Sie
              zugeschnittene Behandlung.
            </p>
            <p>
              Der Schwerpunkt liegt auf allgemeininternistischen Fragestellungen, kardiologischer Basisdiagnostik
              (EKG, Belastungs-EKG, Langzeit-Blutdruck) und der ganzheitlichen Betreuung chronischer Erkrankungen wie
              Bluthochdruck, Diabetes oder Fettstoffwechselstörungen. Wir arbeiten eng mit umliegenden Fachärztinnen
              und Fachärzten sowie Kliniken zusammen.
            </p>
            <p className="text-sm text-slate-500">
              Hinweis: Die auf dieser Seite dargestellten Informationen dienen der allgemeinen Orientierung und
              ersetzen keine ärztliche Beratung.
            </p>
          </div>
        </div>
      </section>

      {/* Leistungen */}
      <section id="leistungen" className="border-y border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-800">Leistungen</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Was wir für Sie tun können</h2>
            <p className="mt-4 text-slate-600">Sprechen Sie uns bei individuellen Fragen gerne persönlich an.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PRACTICE.services.map((s) => (
              <article key={s.title} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 transition hover:border-emerald-300 hover:bg-white">
                <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Kontakt */}
      <section id="kontakt" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-800">Kontakt</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Termine nach Vereinbarung</h2>
            <p className="mt-6 text-base text-slate-700">
              Bitte vereinbaren Sie Ihren Termin telefonisch innerhalb unserer Sprechzeiten. In dringenden Fällen
              außerhalb der Öffnungszeiten wenden Sie sich bitte an den ärztlichen Bereitschaftsdienst unter{' '}
              <strong>116 117</strong> oder in Notfällen an die <strong>112</strong>.
            </p>

            <dl className="mt-8 space-y-4 text-sm">
              <div>
                <dt className="font-semibold text-slate-500">Adresse</dt>
                <dd className="mt-1 text-slate-900">{PRACTICE.street}<br />{PRACTICE.postal_code} {PRACTICE.city}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Telefon</dt>
                <dd className="mt-1">
                  <a href={`tel:${PRACTICE.phone_link}`} className="text-emerald-700 underline underline-offset-2 hover:no-underline">{PRACTICE.phone_display}</a>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Anfahrt</dt>
                <dd className="mt-1">
                  <a
                    href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(PRACTICE.street + ', ' + PRACTICE.postal_code + ' ' + PRACTICE.city)}`}
                    className="text-emerald-700 underline underline-offset-2 hover:no-underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >Route auf OpenStreetMap ansehen &rarr;</a>
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900">Öffnungszeiten</h3>
            <ul className="mt-4 divide-y divide-slate-100">
              {PRACTICE.hours.map((h) => (
                <li key={h.day} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                  <span className="font-medium text-slate-700">{h.day}</span>
                  <span className="text-right text-slate-900">
                    {h.ranges.map((r, i) => <div key={i}>{r}</div>)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-500">Abweichungen an Feiertagen oder durch Praxisurlaub sind möglich.</p>
          </div>
        </div>
      </section>

      {/* Impressum */}
      <section id="impressum" className="border-t border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-800">Rechtliches</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Impressum</h2>

          <div className="mt-10 space-y-8 text-sm text-slate-700 sm:text-base">
            <ImpressumSection title="Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz) / § 5 TMG">
              <p><strong>{PRACTICE.name}</strong><br />Facharzt für Innere Medizin<br />{PRACTICE.street}<br />{PRACTICE.postal_code} {PRACTICE.city}</p>
            </ImpressumSection>

            <ImpressumSection title="Kontakt">
              <p>Telefon: <a href={`tel:${PRACTICE.phone_link}`} className="text-emerald-700 underline underline-offset-2">{PRACTICE.phone_display}</a></p>
              <p className="text-slate-500">Eine E-Mail-Adresse wird auf Wunsch der Praxis nicht veröffentlicht – bitte nutzen Sie für Anfragen den Telefonkontakt.</p>
            </ImpressumSection>

            <ImpressumSection title="Berufsbezeichnung und berufsrechtliche Regelungen">
              <ul className="space-y-1">
                <li><strong>Berufsbezeichnung:</strong> Arzt / Facharzt für Innere Medizin (verliehen in der Bundesrepublik Deutschland)</li>
                <li><strong>Zuständige Kammer:</strong> Ärztekammer Westfalen-Lippe, Gartenstraße 210–214, 48147 Münster</li>
                <li><strong>Aufsichtsbehörde:</strong> Bezirksregierung Arnsberg</li>
                <li>
                  <strong>Berufsrechtliche Regelungen:</strong> Berufsordnung für die westfälisch-lippischen Ärztinnen und Ärzte, Heilberufsgesetz Nordrhein-Westfalen, Heilberufe-Kammergesetz. Einsehbar unter{' '}
                  <a href="https://www.aekwl.de" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline underline-offset-2">www.aekwl.de</a>.
                </li>
              </ul>
            </ImpressumSection>

            <ImpressumSection title="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
              <p>{PRACTICE.name}<br />Anschrift wie oben.</p>
            </ImpressumSection>

            <ImpressumSection title="Streitschlichtung">
              <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline underline-offset-2">ec.europa.eu/consumers/odr</a>.
                Unsere E-Mail-Adresse finden Sie oben im Impressum.
              </p>
              <p className="mt-3">Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
            </ImpressumSection>

            <ImpressumSection title="Haftung für Inhalte">
              <p>Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.</p>
            </ImpressumSection>

            <ImpressumSection title="Haftung für Links">
              <p>Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.</p>
            </ImpressumSection>

            <ImpressumSection title="Urheberrecht">
              <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.</p>
              <p className="mt-3">Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.</p>
            </ImpressumSection>

            <ImpressumSection title="Bildnachweise">
              <p className="text-slate-500">Auf dieser Website werden keine Fotografien Dritter verwendet. Grafische Elemente wurden individuell für diese Praxisseite gestaltet.</p>
            </ImpressumSection>

            <ImpressumSection title="Datenschutz">
              <p>Diese Praxis-Website erhebt keine personenbezogenen Daten. Es werden keine Cookies gesetzt, kein Analytics-Tool und kein externes Tracking eingesetzt. Beim Anklicken der Telefonnummer wird lediglich die native Telefon-App Ihres Endgeräts geöffnet. Beim Anklicken des Anfahrts-Links werden Sie zu OpenStreetMap weitergeleitet; ab diesem Zeitpunkt gilt die dortige Datenschutzerklärung.</p>
              <p className="mt-3">Ihre Rechte nach Art. 15–22 DSGVO (Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit, Widerspruch) können Sie jederzeit telefonisch unter {PRACTICE.phone_display} geltend machen. Beschwerderecht bei der Landesbeauftragten für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LDI NRW), Kavalleriestraße 2–4, 40213 Düsseldorf.</p>
            </ImpressumSection>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-100 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center text-xs text-slate-500 sm:flex-row sm:justify-between sm:text-left">
          <p>&copy; {new Date().getFullYear()} {PRACTICE.name} – {PRACTICE.street}, {PRACTICE.postal_code} {PRACTICE.city}</p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#impressum" className="hover:text-emerald-700">Impressum</a>
            <a href="tel:112" className="font-semibold text-rose-700">Notruf 112</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function QuickCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/80 p-4 backdrop-blur-sm shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-emerald-800">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}

function ImpressumSection({ title, children }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <div className="mt-3 space-y-2 leading-relaxed">{children}</div>
    </div>
  );
}
