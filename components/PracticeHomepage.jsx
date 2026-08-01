// Wiederverwendbare Praxis-Homepage-Rendering-Komponente (Server Component).
// Rendert eine Lovable-Style One-Page-Website für eine Praxis im "Homepage-Modus".
// Wird aus /praxis/[stadt]/[slug]/page.js aufgerufen, wenn doctor.homepage_mode === true.

import { getKammerForPractice } from '@/lib/aerztekammern';
import { getTemplateForSpecialty } from '@/lib/homepageTemplates';
import { toSchemaOpeningHours } from '@/lib/openingHours';
import { getEffectiveEmail } from '@/lib/emailGenerator';
import { getBaseUrlSync } from '@/lib/baseUrl';
import { getPraxisHomepageUrl } from '@/lib/subdomains';

/**
 * @param {object} doctor doctor_places Dokument (bereits stripped)
 */
export default function PracticeHomepage({ doctor }) {
  const name = doctor.name || 'Arztpraxis';
  const city = doctor.city || '';
  const street = doctor.street || (doctor.formatted_address || '').split(',')[0]?.trim() || '';
  const postalCode = doctor.postal_code || '';
  const phone = doctor.phone_national || doctor.phone_international || '';
  const phoneLink = (doctor.phone_international || doctor.phone_national || '').replace(/\s+/g, '');
  const state = doctor.state || '';

  const specialtyKey = String(doctor.specialty_guess || '').toLowerCase();
  const template = getTemplateForSpecialty(specialtyKey, city);
  const kammer = getKammerForPractice(state, postalCode);

  // Effektive E-Mail: manuell hinterlegte (email_manual) oder deterministisch generierte Freemail.
  // Wird im Impressum sichtbar und in JSON-LD emittiert – erfüllt §5 DDG "schnelle Kontaktaufnahme".
  const email = getEffectiveEmail(doctor);
  const isEmailGenerated = !doctor.email_manual;

  // Berufsbezeichnung ableiten
  const berufsbezeichnung = deriveBerufsbezeichnung(specialtyKey);

  const openHours = normalizeOpeningHours(doctor.opening_hours);

  const jsonLd = buildPhysicianJsonLd({ doctor, name, city, street, postalCode, phone, openHours });
  const pagePath = doctor.homepage_slug
    ? `/${doctor.homepage_slug}`
    : `/praxis/${doctor.city_slug}/${doctor.slug}`;
  const pageUrl = `${getBaseUrlSync()}${pagePath}`;
  const initials = getInitials(name);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Navoria-Chrome ist in diesem Modus bereits im Root-Layout ausgeschlossen (via headers).
          Wir behalten die display:none-Regel als Sicherheitsnetz, falls die Header-Erkennung fehlschlägt. */}
      <style dangerouslySetInnerHTML={{ __html: `
        header.navoria-chrome, footer.navoria-chrome, a.navoria-chrome-announce,
        .navoria-consent-banner { display: none !important; }
        body { padding-top: 0 !important; }
      ` }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Sticky Praxis-Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2" aria-label="Zurück zum Seitenanfang">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-sm font-semibold text-white" aria-hidden="true">{initials}</span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-slate-900">{name}</span>
              <span className="text-[11px] text-slate-500">{template.tagline} in {city}</span>
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex" aria-label="Praxis-Navigation">
            <a href="#ueber" className="hover:text-emerald-700">Über</a>
            <a href="#leistungen" className="hover:text-emerald-700">Leistungen</a>
            <a href="#kontakt" className="hover:text-emerald-700">Kontakt</a>
            <a href="#impressum" className="hover:text-emerald-700">Impressum</a>
          </nav>
          {phoneLink && (
            <a href={`tel:${phoneLink}`} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-800 sm:text-sm">
              <PhoneIcon /> {phone}
            </a>
          )}
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-800">{template.tagline} · {city}</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">{template.hero_headline}</h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl">{template.about_p1}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {phoneLink && (
                <a href={`tel:${phoneLink}`} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800">
                  <PhoneIcon /> {phone}
                </a>
              )}
              <a href="#kontakt" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700">
                Anfahrt &amp; Öffnungszeiten
              </a>
            </div>
          </div>

          {/* Quick-Info Karten */}
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickCard label="Adresse" value={[street, `${postalCode} ${city}`.trim()].filter(Boolean).join(', ')} />
            {phone && <QuickCard label="Telefon" value={phone} />}
            <QuickCard label="Fachrichtung" value={berufsbezeichnung.short || 'Arztpraxis'} />
            <QuickCard label="Sprechzeiten" value="Nach Vereinbarung" />
          </div>
        </div>
      </section>

      {/* Über */}
      <section id="ueber" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-800">Über die Praxis</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Kompetenz mit Zeit für den Menschen.</h2>
          </div>
          <div className="space-y-4 text-base text-slate-700 sm:text-lg">
            <p>{template.about_p1}</p>
            <p>{template.about_p2}</p>
            <p className="text-sm text-slate-500">Hinweis: Die auf dieser Seite dargestellten Informationen dienen der allgemeinen Orientierung und ersetzen keine ärztliche Beratung.</p>
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
            {template.services.map((s) => (
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
            <p className="mt-6 text-base text-slate-700">Bitte vereinbaren Sie Ihren Termin telefonisch innerhalb der Sprechzeiten. In dringenden Fällen außerhalb der Öffnungszeiten wenden Sie sich bitte an den ärztlichen Bereitschaftsdienst unter <strong>116 117</strong> oder in Notfällen an die <strong>112</strong>.</p>
            <dl className="mt-8 space-y-4 text-sm">
              <div>
                <dt className="font-semibold text-slate-500">Adresse</dt>
                <dd className="mt-1 text-slate-900">{street}<br />{postalCode} {city}</dd>
              </div>
              {phone && (
                <div>
                  <dt className="font-semibold text-slate-500">Telefon</dt>
                  <dd className="mt-1"><a href={`tel:${phoneLink}`} className="text-emerald-700 underline underline-offset-2 hover:no-underline">{phone}</a></dd>
                </div>
              )}
              <div>
                <dt className="font-semibold text-slate-500">Anfahrt</dt>
                <dd className="mt-1">
                  <a href={`https://www.openstreetmap.org/search?query=${encodeURIComponent([street, postalCode, city].filter(Boolean).join(' '))}`} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline underline-offset-2 hover:no-underline">Route auf OpenStreetMap ansehen &rarr;</a>
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900">Öffnungszeiten</h3>
            {openHours.length > 0 ? (
              <ul className="mt-4 divide-y divide-slate-100">
                {openHours.map((h) => (
                  <li key={h.day} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                    <span className="font-medium text-slate-700">{h.day}</span>
                    <span className="text-right text-slate-900">
                      {h.ranges.length ? h.ranges.map((r, i) => <div key={i}>{r}</div>) : <span className="text-slate-500">Geschlossen</span>}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Termine nach telefonischer Vereinbarung.</p>
            )}
            <p className="mt-4 text-xs text-slate-500">Abweichungen an Feiertagen oder durch Praxisurlaub sind möglich.</p>
          </div>
        </div>
      </section>

      {/* Impressum */}
      <section id="impressum" className="border-t border-slate-200 bg-white py-20" itemScope itemType="https://schema.org/Physician">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-800">Rechtliches</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Impressum</h2>

          <div className="mt-10 space-y-8 text-sm text-slate-700 sm:text-base">
            <ImpressumSection title="Angaben gemäß § 5 DDG">
              <p itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                <strong itemProp="name">{name}</strong><br />
                {berufsbezeichnung.full}<br />
                <span itemProp="streetAddress">{street}</span><br />
                <span itemProp="postalCode">{postalCode}</span> <span itemProp="addressLocality">{city}</span>
                <meta itemProp="addressCountry" content="DE" />
              </p>
            </ImpressumSection>

            <ImpressumSection title="Kontakt">
              {phone && <p>Telefon: <a href={`tel:${phoneLink}`} className="text-emerald-700 underline underline-offset-2" itemProp="telephone">{phone}</a></p>}
              {email && (
                <p>E-Mail: <a href={`mailto:${email}`} className="text-emerald-700 underline underline-offset-2" itemProp="email">{email}</a></p>
              )}
              {!email && (
                <p className="text-slate-500">Anfragen bitte telefonisch. Eine E-Mail-Adresse wird auf Wunsch der Praxis nicht öffentlich hinterlegt.</p>
              )}
            </ImpressumSection>

            <ImpressumSection title="Berufsbezeichnung und berufsrechtliche Regelungen">
              <ul className="space-y-1">
                <li><strong>Berufsbezeichnung:</strong> <span itemProp="medicalSpecialty">{berufsbezeichnung.full}</span> (verliehen in der Bundesrepublik Deutschland)</li>
                {kammer ? (
                  <>
                    <li><strong>Zuständige Kammer:</strong> {kammer.name}, {kammer.address}</li>
                    <li><strong>Aufsichtsbehörde:</strong> {kammer.aufsicht}</li>
                    <li>
                      <strong>Berufsrechtliche Regelungen:</strong> {kammer.berufsordnung}, {kammer.heilberufsgesetz}. Einsehbar unter{' '}
                      <a href={kammer.website} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline underline-offset-2">{kammer.website.replace(/^https?:\/\//, '')}</a>.
                    </li>
                  </>
                ) : (
                  <li className="text-slate-500">Zuständige Kammer siehe {state || 'zuständiges Bundesland'}.</li>
                )}
              </ul>
            </ImpressumSection>

            <ImpressumSection title="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
              <p>{name}<br />Anschrift wie oben.</p>
            </ImpressumSection>

            <ImpressumSection title="Streitschlichtung">
              <p>Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
            </ImpressumSection>

            <ImpressumSection title="Haftung für Inhalte">
              <p>Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.</p>
            </ImpressumSection>

            <ImpressumSection title="Haftung für Links">
              <p>Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.</p>
            </ImpressumSection>

            <ImpressumSection title="Urheberrecht">
              <p>Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>
            </ImpressumSection>

            <ImpressumSection title="Bildnachweise">
              <p className="text-slate-500">Auf dieser Website werden keine Fotografien Dritter verwendet. Grafische Elemente wurden individuell für diese Praxisseite gestaltet.</p>
            </ImpressumSection>

            <ImpressumSection title="Datenschutz">
              <p>Diese Praxis-Website erhebt keine personenbezogenen Daten über Formulare oder Cookies. Es werden keine externen Analytics-, Tracking- oder Werbe-Skripte eingesetzt. Beim Anklicken der Telefonnummer wird die Telefon-App Ihres Endgeräts geöffnet. Beim Anklicken des Anfahrts-Links werden Sie zu OpenStreetMap weitergeleitet; ab diesem Zeitpunkt gilt die dortige Datenschutzerklärung.</p>
              {kammer?.ldi && (
                <p className="mt-3">Ihre Rechte nach Art. 15–22 DSGVO (Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch) können Sie jederzeit telefonisch geltend machen. Zuständige Aufsichtsbehörde: {kammer.ldi}.</p>
              )}
            </ImpressumSection>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-100 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center text-xs text-slate-500 sm:flex-row sm:justify-between sm:text-left">
          <p>&copy; {new Date().getFullYear()} {name} – {street}, {postalCode} {city}</p>
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
  if (!value) return null;
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

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function getInitials(name) {
  const parts = String(name || '').replace(/Dr\.|med\.|Prof\.|Priv\.|Dozent/gi, '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function deriveBerufsbezeichnung(specialtyKey) {
  const map = {
    hausarzt: { short: 'Hausarzt', full: 'Facharzt für Allgemeinmedizin' },
    internist: { short: 'Innere Medizin', full: 'Facharzt für Innere Medizin' },
    zahnarzt: { short: 'Zahnmedizin', full: 'Zahnarzt' },
    kinderarzt: { short: 'Pädiatrie', full: 'Facharzt für Kinder- und Jugendmedizin' },
    frauenarzt: { short: 'Gynäkologie', full: 'Facharzt für Frauenheilkunde und Geburtshilfe' },
    orthopaede: { short: 'Orthopädie', full: 'Facharzt für Orthopädie und Unfallchirurgie' },
    augenarzt: { short: 'Augenheilkunde', full: 'Facharzt für Augenheilkunde' },
    'hno-arzt': { short: 'HNO', full: 'Facharzt für Hals-Nasen-Ohren-Heilkunde' },
    hautarzt: { short: 'Dermatologie', full: 'Facharzt für Dermatologie und Venerologie' },
    urologe: { short: 'Urologie', full: 'Facharzt für Urologie' },
    neurologe: { short: 'Neurologie', full: 'Facharzt für Neurologie' },
    psychotherapeut: { short: 'Psychotherapie', full: 'Psychologische:r Psychotherapeut:in' },
  };
  return map[specialtyKey] || { short: 'Arztpraxis', full: 'Arzt' };
}

function normalizeOpeningHours(hours) {
  if (!hours || !Array.isArray(hours.weekday_text)) {
    // Fallback: nutze regular_opening_hours periods falls vorhanden – in dieser Version simpler Ansatz
    return [];
  }
  const dayMap = {
    'monday': 'Montag', 'tuesday': 'Dienstag', 'wednesday': 'Mittwoch',
    'thursday': 'Donnerstag', 'friday': 'Freitag', 'saturday': 'Samstag', 'sunday': 'Sonntag',
    'montag': 'Montag', 'dienstag': 'Dienstag', 'mittwoch': 'Mittwoch',
    'donnerstag': 'Donnerstag', 'freitag': 'Freitag', 'samstag': 'Samstag', 'sonntag': 'Sonntag',
  };
  return hours.weekday_text.map((line) => {
    const [dayRaw, ...rest] = line.split(':');
    const dayKey = String(dayRaw || '').toLowerCase().trim();
    const day = dayMap[dayKey] || dayRaw;
    const timeStr = rest.join(':').trim();
    if (!timeStr || /geschlossen|closed/i.test(timeStr)) {
      return { day, ranges: [] };
    }
    // Support "07:30–12:0014:00–16:00" or "07:30– 12:00, 14:00– 16:00"
    const ranges = timeStr
      .split(/[,;]\s*|(?<=\d{2})\s*(?=\d{2}:)/)
      .map((r) => r.trim())
      .filter(Boolean);
    return { day, ranges };
  });
}

function buildPhysicianJsonLd({ doctor, name, city, street, postalCode, phone }) {
  // URL: Bei aktivem Homepage-Modus IMMER die Praxis-Subdomain als kanonische Adresse,
  // sonst Directory-URL. Verhindert @id-Mismatch mit <link rel="canonical">.
  const url = (doctor.homepage_mode === true && doctor.homepage_slug)
    ? getPraxisHomepageUrl(doctor.homepage_slug)
    : `${getBaseUrlSync()}/praxis/${doctor.city_slug}/${doctor.slug}`;

  const email = getEffectiveEmail(doctor);
  const specialty = doctor.specialty_guess || null;
  const openingHoursSpec = toSchemaOpeningHours(
    doctor.regular_opening_hours || doctor.opening_hours_json || doctor.opening_hours
  );

  const paymentList = [];
  if (doctor.payment_options?.acceptsCreditCards) paymentList.push('Kreditkarte');
  if (doctor.payment_options?.acceptsDebitCards) paymentList.push('EC-/Debitkarte');
  if (doctor.payment_options?.acceptsCashOnly) paymentList.push('Barzahlung');
  if (doctor.payment_options?.acceptsNfc) paymentList.push('Kontaktloses Bezahlen');

  // sameAs: NUR echte Profile.
  //   - google_maps_url ist der offizielle GBP-Deep-Link (mit CID) — nicht eine ?q=place_id-Suche.
  //   - Externe Website nur, wenn nicht schon auf Navoria.
  const sameAs = [];
  if (doctor.google_maps_url && doctor.google_maps_url.includes('maps.google.com')) {
    sameAs.push(doctor.google_maps_url);
  }
  if (doctor.website_url && !/navoria\.de/i.test(doctor.website_url)) {
    sameAs.push(doctor.website_url);
  }

  const addressLd = {
    '@type': 'PostalAddress',
    streetAddress: street || undefined,
    postalCode: postalCode || undefined,
    addressLocality: city || undefined,
    addressRegion: doctor.state || undefined,
    addressCountry: 'DE',
  };

  const geoLd = (doctor.latitude != null && doctor.longitude != null)
    ? { '@type': 'GeoCoordinates', latitude: doctor.latitude, longitude: doctor.longitude }
    : null;

  // Nur eine Entität: MedicalBusiness (schema.org-Subtyp von LocalBusiness).
  // Kein Physician-Multi-Type (semantisch falsch bei Praxen), kein separates
  // Organization/WebSite (redundant, warnt in Rich-Results-Test).
  const business = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    '@id': `${url}#business`,
    name,
    url,
    telephone: phone || undefined,
    ...(email && { email }),
    address: addressLd,
    ...(geoLd && { geo: geoLd }),
    ...(specialty && { medicalSpecialty: specialty }),
    ...(sameAs.length && { sameAs }),
    ...(openingHoursSpec?.length && { openingHoursSpecification: openingHoursSpec }),
    ...(paymentList.length && { paymentAccepted: paymentList.join(', ') }),
    ...(city && { areaServed: { '@type': 'City', name: city } }),
    inLanguage: 'de-DE',
    // aggregateRating nur bei ≥ 5 Bewertungen — sonst warnt Google Rich Results.
    ...(doctor.rating != null && Number(doctor.user_rating_count) >= 5 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Number(doctor.rating).toFixed(1),
        reviewCount: Number(doctor.user_rating_count),
        bestRating: '5',
        worstRating: '1',
      },
    }),
  };

  return business;
}
