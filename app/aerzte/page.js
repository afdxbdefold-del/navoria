import Link from 'next/link';
import { getCollection } from '@/lib/mongodb';
import { SPECIALTIES } from '@/lib/specialties';
import { MapPin, Stethoscope, ArrowRight, ShieldCheck, Database, HelpCircle, Info } from 'lucide-react';
import { getBaseUrl } from '@/lib/baseUrl';

export const metadata = {
  title: 'Ärzteverzeichnis Deutschland — nach Stadt und Fachrichtung',
  description: 'Das Navoria-Ärzteverzeichnis mit Praxen in ganz Deutschland. Direkter Einstieg nach Stadt oder Fachrichtung, mit transparenter Datenherkunft und redaktionellen Standards.',
  alternates: { canonical: '/aerzte' },
};

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export default async function AerzteHubPage() {
  const base = await getBaseUrl();
  const citiesCol = await getCollection('cities');
  const cities = await citiesCol
    .find({ doctor_count: { $gt: 0 } })
    .sort({ doctor_count: -1 })
    .limit(60)
    .toArray();

  const totalDoctors = cities.reduce((s, c) => s + (c.doctor_count || 0), 0);

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Start', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: 'Ärzte', item: `${base}/aerzte` },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* HERO */}
      <section className="nv-surface-primary">
        <div className="nv-container py-14 sm:py-20">
          <nav className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>
            <Link href="/" className="hover:underline">Start</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Ärzte</span>
          </nav>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Ärzteverzeichnis Deutschland
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed" style={{ color: 'var(--color-primary-light)' }}>
            Navoria führt ein Verzeichnis von Arzt- und Therapiepraxen in Deutschland. Sie finden Adresse, Telefonnummer,
            Website, Öffnungszeiten sowie Google-Bewertungen kompakt auf einer Seite —
            {totalDoctors > 0
              ? ` aktuell mit ${totalDoctors.toLocaleString('de-DE')} gelisteten Praxen in ${cities.length} Städten.`
              : ' redaktionell kuratiert und laufend erweitert.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#nach-stadt" className="nv-btn nv-btn-on-navy">
              <MapPin className="h-4 w-4" /> Nach Stadt suchen
            </Link>
            <Link href="/aerzte/fachrichtung" className="nv-btn nv-btn-outline-white">
              <Stethoscope className="h-4 w-4" /> Nach Fachrichtung
            </Link>
          </div>
        </div>
      </section>

      {/* WIE FUNKTIONIERT DAS VERZEICHNIS */}
      <section className="nv-surface-white">
        <div className="nv-container nv-section-tight">
          <div className="mx-auto max-w-4xl">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>Transparent &amp; unabhängig</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: 'var(--color-navy)' }}>
              Wie funktioniert das Navoria-Verzeichnis?
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed nv-text-muted">
              Wir aggregieren öffentlich verfügbare Praxis-Informationen (Adresse, Kontakt,
              Öffnungszeiten, Google-Bewertungen) und stellen sie in einer einheitlichen, gut
              lesbaren Form dar. Ziel ist es, Patientinnen und Patienten den Zugang zur
              medizinischen Versorgung zu vereinfachen — unabhängig, werbefrei und ohne
              versteckte Rankings.
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <FeatureCard
                icon={Database}
                title="Woher kommen die Daten?"
                body="Praxis-Stammdaten und Google-Bewertungen stammen aus öffentlich abrufbaren Google-Places-Informationen. Wir verändern Bewertungen redaktionell nicht."
              />
              <FeatureCard
                icon={ShieldCheck}
                title="Wie prüfen wir die Daten?"
                body='Jedes Profil erhält einen Aktualitätsstempel („Zuletzt geprüft am"). Praxen können ihr Profil kostenfrei beanspruchen und Angaben ergänzen oder korrigieren.'
              />
              <FeatureCard
                icon={Info}
                title="Wie ranken wir Ärzte?"
                body="Die Reihenfolge folgt objektiven Kriterien: durchschnittliche Google-Bewertung und Anzahl der Rezensionen. Es gibt keine bezahlten Positionen und keine Auszeichnungen."
              />
            </div>

            <div className="mt-8 nv-panel-soft">
              <p className="text-[14px] leading-relaxed" style={{ color: 'var(--color-navy)' }}>
                <strong>Wichtig für Nutzerinnen und Nutzer:</strong> Navoria ist ein
                Verzeichnis-Dienst und ersetzt keine medizinische Beratung. Bei akuten
                Beschwerden wenden Sie sich an Ihre Hausarzt- oder Facharzt-Praxis, den
                ärztlichen Bereitschaftsdienst unter <strong>116 117</strong> oder bei
                lebensbedrohlichen Notfällen an den Notruf <strong>112</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NACH STADT */}
      <section id="nach-stadt" className="nv-surface-white">
        <div className="nv-container nv-section-tight">
          <h2 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--color-navy)' }}>
            <MapPin className="h-6 w-6" style={{ color: 'var(--color-primary)' }} /> Nach Stadt
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] nv-text-muted">
            Praxen sortiert nach Stadt. Die Anzahl der gelisteten Praxen sehen Sie direkt an
            jeder Kachel. Alternativ können Sie über die {' '}
            <Link href="/aerzte/bundesland" className="nv-link">Bundesland-Übersicht</Link>{' '}
            einsteigen.
          </p>
          {cities.length === 0 ? (
            <p className="mt-6 text-sm nv-text-muted">Noch keine Städte verfügbar.</p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {cities.map((c) => (
                <Link
                  key={c.slug}
                  href={`/aerzte/${c.slug}`}
                  className="nv-card group flex items-center justify-between transition hover:-translate-y-0.5"
                  style={{ padding: '1rem' }}
                >
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-navy)' }}>{c.name}</span>
                  <span className="nv-badge">{c.doctor_count}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* NACH FACHRICHTUNG */}
      <section className="nv-page-bg">
        <div className="nv-container nv-section-tight">
          <h2 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--color-navy)' }}>
            <Stethoscope className="h-6 w-6" style={{ color: 'var(--color-primary)' }} /> Nach Fachrichtung
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] nv-text-muted">
            Von Hausarzt bis Radiologe: jede Fachrichtung hat eine redaktionelle Übersichtsseite
            mit den wichtigsten Aufgaben, häufigen Anlässen und einer Praxis-Liste.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {SPECIALTIES.map((s) => (
              <Link
                key={s.slug}
                href={`/aerzte/fachrichtung/${s.slug}`}
                className="nv-card group flex items-center gap-3 transition hover:-translate-y-0.5"
                style={{ padding: '1rem' }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                  <Stethoscope className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-navy)' }}>{s.plural || s.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="nv-surface-white">
        <div className="nv-container nv-section-tight">
          <div className="mx-auto max-w-4xl">
            <h2 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--color-navy)' }}>
              <HelpCircle className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
              Häufige Fragen zum Verzeichnis
            </h2>
            <div className="mt-6 space-y-3">
              {FAQ_ITEMS.map((f, i) => (
                <details key={i} className="group nv-card">
                  <summary className="cursor-pointer list-none text-[16px] font-semibold" style={{ color: 'var(--color-navy)' }}>
                    {f.q}
                  </summary>
                  <p className="mt-3 text-[15px] leading-relaxed nv-text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRAXIS-EINLADUNG */}
      <section className="nv-surface-white">
        <div className="nv-container pb-20">
          <div className="mx-auto max-w-4xl nv-panel-soft flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center" style={{ padding: '1.5rem 1.75rem' }}>
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-navy)' }}>
                Sie sind Arzt oder Praxis-Team?
              </h3>
              <p className="mt-1 text-[15px] nv-text-muted">
                Beanspruchen Sie Ihr Praxis-Profil kostenfrei und ergänzen Sie Angaben.
              </p>
            </div>
            <Link href="/praxis-beanspruchen" className="nv-btn nv-btn-primary whitespace-nowrap">
              Profil beanspruchen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureCard({ icon: Icon, title, body }) {
  return (
    <div className="nv-card">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-[17px] font-bold" style={{ color: 'var(--color-navy)' }}>{title}</h3>
      <p className="mt-2 text-[14px] leading-relaxed nv-text-muted">{body}</p>
    </div>
  );
}

const FAQ_ITEMS = [
  {
    q: 'Ist Navoria unabhängig oder von Ärzten bezahlt?',
    a: 'Navoria ist ein unabhängiges Verzeichnis. Der Basis-Eintrag ist für alle Praxen kostenfrei, und die Reihenfolge in Ergebnislisten hängt nicht von Zahlungen ab. Wir finanzieren uns über redaktionelle Werbung und optionale, klar gekennzeichnete Zusatzangebote für Praxen.',
  },
  {
    q: 'Wie kann ich als Praxis mein Profil ändern?',
    a: 'Nutzen Sie das kostenfreie Beanspruchen-Formular unter /praxis-beanspruchen. Nach kurzer Verifikation können Sie Praxis-Beschreibung, Leistungen, Öffnungszeiten und Kontaktdaten selbst pflegen.',
  },
  {
    q: 'Sind die Bewertungen echt?',
    a: 'Die Bewertungen stammen ausschließlich von Google (öffentliche Google-Rezensionen). Wir zeigen sie unverändert an und ergänzen keine eigenen Bewertungen. Bei begründetem Verdacht auf gefälschte Bewertungen wenden Sie sich direkt an Google.',
  },
  {
    q: 'Woher kommen Adresse, Telefonnummer und Öffnungszeiten?',
    a: 'Diese Daten stammen aus öffentlich zugänglichen Quellen (u. a. Google Places, Praxis-Websites). Praxen können nach Beanspruchung ihres Profils Angaben selbst korrigieren und aktualisieren.',
  },
  {
    q: 'Warum finde ich meine Stadt oder meinen Ort nicht?',
    a: 'Wir listen nur Städte mit einer Mindestanzahl an Praxis-Einträgen, damit die Seite für Nutzer relevant bleibt. In der Bundesland-Übersicht finden Sie Nachbarstädte mit vollem Verzeichnis.',
  },
  {
    q: 'Ersetzt Navoria eine ärztliche Beratung?',
    a: 'Nein. Navoria ist ein Verzeichnis-Dienst mit redaktionellen Ratgeber-Inhalten. Bei akuten Beschwerden wenden Sie sich an Ihre Hausarzt- oder Facharzt-Praxis, den ärztlichen Bereitschaftsdienst (116 117) oder — bei lebensbedrohlichen Notfällen — an den Notruf (112).',
  },
  {
    q: 'Kann ich eine falsche Information melden?',
    a: 'Ja. Auf jeder Praxis-Seite finden Sie einen Link "Korrekturen melden". Alternativ erreichen Sie uns unter mail@navoria.de. Korrekturen prüfen wir zeitnah und aktualisieren gegebenenfalls.',
  },
];
