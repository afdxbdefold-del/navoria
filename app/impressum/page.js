import Link from 'next/link';

export const metadata = {
  title: 'Impressum | Navoria',
  description: 'Impressum und Anbieterkennzeichnung nach § 5 TMG für Navoria.',
  robots: { index: true, follow: false },
};

export default function ImpressumPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link> <span>/</span> <span className="text-slate-700">Impressum</span>
      </nav>

      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Impressum</h1>
      <p className="mt-2 text-sm text-slate-500">Angaben gemäß § 5 TMG</p>

      <section className="mt-8 space-y-6 text-slate-700">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Anbieter</h2>
          <address className="not-italic mt-2 leading-relaxed">
            AF Consulting<br />
            Am Nesseufer 1<br />
            26789 Leer
          </address>
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-900">Vertreten durch</h2>
          <p className="mt-2">Andreas Frey</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-900">Kontakt</h2>
          <p className="mt-2">E-Mail: <a href="mailto:mail@navoria.de" className="text-sky-700 hover:underline">mail@navoria.de</a></p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-900">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
          <p className="mt-2">Andreas Frey, Anschrift wie oben</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-900">Haftung für Inhalte</h2>
          <p className="mt-2">
            Die Inhalte dieser Seite wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit,
            Vollständigkeit und Aktualität der Praxisdaten übernehmen wir jedoch keine Gewähr, da diese
            Informationen aus öffentlich zugänglichen Quellen (insbesondere Google Places) stammen und sich
            jederzeit ändern können. Nutzer sollten Angaben zu Öffnungszeiten, Telefonnummern und Adressen
            vor einem Besuch bei der jeweiligen Praxis bestätigen. Navoria trifft keine medizinische Aussage
            über die Qualität einer Praxis oder Behandlung. Bewertungen und Rezensionen stammen von
            Google-Nutzern.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-900">Haftung für Links</h2>
          <p className="mt-2">
            Unser Angebot enthält Links zu externen Websites Dritter (z.B. Praxis-Websites, Google Maps),
            auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch
            keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
            Anbieter oder Betreiber verantwortlich.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-900">Urheberrecht</h2>
          <p className="mt-2">
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem
            deutschen Urheberrecht. Google-Datenquellen (Ortsangaben, Bewertungen, Öffnungszeiten) werden
            mit Attribution kenntlich gemacht. Nicht als Kopie eingebunden werden Inhalte anderer
            Arztverzeichnisse oder Portale.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-900">Streitschlichtung</h2>
          <p className="mt-2">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noreferrer" className="text-sky-700 hover:underline">https://ec.europa.eu/consumers/odr/</a>.
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </div>
      </section>
    </div>
  );
}
