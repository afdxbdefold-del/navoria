import Link from 'next/link';
import { AlertTriangle, Phone, Heart, Info } from 'lucide-react';
import ContactEmailGate from './ContactEmailGate';

export const metadata = {
  title: 'Impressum',
  description: 'Impressum und Anbieterkennzeichnung nach § 5 DDG für Navoria. Wichtiger Hinweis: Navoria ist ein Arztverzeichnis, keine Arztpraxis.',
  alternates: { canonical: '/impressum' },
  robots: { index: true, follow: false },
};

export default function ImpressumPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link> <span>/</span> <span className="text-slate-700">Impressum</span>
      </nav>

      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Impressum</h1>
      <p className="mt-2 text-sm text-slate-500">Angaben gemäß § 5 DDG</p>

      {/* Kritischer Hinweis: Navoria ist NICHT die Arztpraxis */}
      <div
        role="alert"
        className="mt-6 rounded-xl border-2 p-5"
        style={{ borderColor: '#DC2626', background: '#FEF2F2' }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0" style={{ color: '#DC2626' }} aria-hidden="true" />
          <div>
            <h2 className="text-base font-bold" style={{ color: '#991B1B' }}>
              Wichtig: Navoria ist ein Arztverzeichnis — keine Arztpraxis
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed" style={{ color: '#7F1D1D' }}>
              Wir sind <strong>nicht die behandelnde Praxis</strong>, keine Ärzte und kein
              medizinisches Personal. Wir haben <strong>keinen Zugriff</strong> auf Praxis-Kalender,
              Rezepte, Befunde oder Krankenakten. Wir können <strong>keine Termine vereinbaren,
              keine Rezepte ausstellen und keine medizinischen Fragen beantworten</strong>.
            </p>
            <div className="mt-4 rounded-lg bg-white/60 p-4">
              <p className="text-[14px] font-semibold" style={{ color: '#991B1B' }}>
                Bitte senden Sie uns keine Gesundheitsdaten
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: '#7F1D1D' }}>
                Symptome, Diagnosen, Medikamente, Befunde, Röntgen-, Blut- oder Laborwerte gehören
                <strong> ausschließlich in ärztliche Hände</strong>. Solche Informationen sind
                besondere Daten nach Art. 9 DSGVO und dürfen wir nicht entgegennehmen.
              </p>
            </div>
            <div className="mt-4 space-y-2 text-[14px]" style={{ color: '#7F1D1D' }}>
              <p className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  <strong>Termine / Fragen zu Ihrer Behandlung:</strong> Bitte wenden Sie sich
                  direkt an Ihre Praxis. Die Kontaktdaten finden Sie im jeweiligen Praxis-Profil.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <Heart className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  <strong>Ärztlicher Bereitschaftsdienst (außerhalb der Sprechzeiten):</strong>{' '}
                  <a href="tel:116117" className="font-semibold underline">116 117</a>
                </span>
              </p>
              <p className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  <strong>Lebensbedrohlicher Notfall:</strong>{' '}
                  <a href="tel:112" className="font-semibold underline">112</a>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-10 space-y-6 text-slate-700">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Anbieter</h2>
          <address className="not-italic mt-2 leading-relaxed">
            HYPERAI ADVERTISING LLC<br />
            3500 South DuPont Hwy<br />
            Dover, DE 19901<br />
            USA
          </address>
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-900">Kontakt</h2>
          <p className="mt-2 text-[14px] text-slate-600">
            Nachrichten mit medizinischem oder Gesundheitsbezug können wir aus rechtlichen Gründen
            nicht bearbeiten und werden ungelesen gelöscht. Für Rückfragen zum Verzeichnis (z.&nbsp;B.
            Korrekturen zu Praxisdaten, Löschanträge, Datenschutz, Presse) nutzen Sie bitte:
          </p>
          <div className="mt-3">
            <ContactEmailGate />
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-900">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
          <p className="mt-2">HYPERAI ADVERTISING LLC, Anschrift wie oben</p>
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
          <h2 className="text-base font-semibold text-slate-900">Verbraucherstreitbeilegung</h2>
          <p className="mt-2">
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </div>
      </section>
    </div>
  );
}
