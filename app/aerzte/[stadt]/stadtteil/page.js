import Link from 'next/link';
import { getCollection } from '@/lib/mongodb';
import { districtToSlug, districtDisplayName } from '@/lib/districtSlug';
import { MapPin, ArrowRight, Info, HelpCircle, Compass } from 'lucide-react';
import { getBaseUrl } from '@/lib/baseUrl';

export const revalidate = 600;

async function loadCity(stadtSlug) {
  const col = await getCollection('cities');
  return col.findOne({ slug: stadtSlug });
}

async function loadDistricts(stadtSlug) {
  const col = await getCollection('doctor_places');
  const rows = await col.aggregate([
    { $match: { is_active: { $ne: false }, city_slug: stadtSlug, district: { $nin: [null, ''] } } },
    { $group: { _id: '$district', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]).toArray();
  const bySlug = new Map();
  for (const r of rows) {
    const slug = districtToSlug(r._id);
    if (!slug) continue;
    const display = districtDisplayName(r._id);
    if (bySlug.has(slug)) {
      const ex = bySlug.get(slug);
      ex.count += r.count;
    } else {
      bySlug.set(slug, { slug, display, count: r.count });
    }
  }
  return Array.from(bySlug.values()).sort((a, b) => b.count - a.count);
}

export async function generateMetadata({ params }) {
  const { stadt } = await params;
  const city = await loadCity(stadt);
  const cityName = city?.name || stadt;
  return {
    title: `Ärzte in ${cityName} nach Stadtteil finden`,
    description: `Alle Stadtteile und Bezirke in ${cityName} mit gelisteten Arzt- und Therapiepraxen. Übersicht nach Bezirk, Anzahl der Praxen und redaktioneller Kurzvorstellung der Versorgungslage.`,
    alternates: { canonical: `/aerzte/${stadt}/stadtteil` },
    robots: { index: true, follow: true },
  };
}

function buildFaqs(cityName) {
  return [
    {
      q: `Warum sollte ich nach Stadtteil in ${cityName} filtern?`,
      a: `Große Städte wie ${cityName} sind medizinisch sehr unterschiedlich versorgt: In zentralen Bezirken finden Sie meist mehr Fachärzte, an den Stadträndern eher Hausarzt-Praxen und ambulante Zentren. Eine Suche nach Stadtteil hilft, Praxen in fußläufiger Entfernung oder mit vertretbarer Fahrzeit zu finden — gerade bei chronischen Beschwerden, wo regelmäßige Termine anstehen.`,
    },
    {
      q: `Wie werden die Stadtteile ${cityName === 'Berlin' ? 'in Berlin' : 'in dieser Stadt'} zugeordnet?`,
      a: `Die Stadtteil-Zuordnung basiert auf den Adress- und Geodaten der Praxen aus öffentlich verfügbaren Google-Places-Informationen. Wir übernehmen die dortige Bezirks-Bezeichnung und normalisieren sie, sodass unterschiedliche Schreibweisen desselben Bezirks zusammengefasst werden.`,
    },
    {
      q: 'Was tue ich, wenn mein gesuchter Stadtteil nicht gelistet ist?',
      a: `Das kann zwei Gründe haben: (1) In dem Bezirk ist noch keine Praxis mit klarer Stadtteil-Angabe erfasst, oder (2) die Anzahl liegt unter unserer Mindest-Schwelle für eine eigene Detailseite. In beiden Fällen nutzen Sie die {' '}Gesamt-Übersicht der Stadt oder suchen Sie über eine benachbarte Stadtteil-Bezeichnung.`,
    },
    {
      q: 'Ist die Reihenfolge der Stadtteile eine Rangliste?',
      a: 'Nein. Die Kacheln sind nach der Anzahl der gelisteten Praxen sortiert — nicht nach Qualität. Ein Stadtteil mit vielen Praxen bedeutet lediglich, dass die medizinische Versorgungsdichte höher ist, nicht dass die Praxen besser oder schlechter sind.',
    },
    {
      q: 'Gilt der ärztliche Bereitschaftsdienst auch je Stadtteil?',
      a: 'Nein. Der ärztliche Bereitschaftsdienst unter der bundeseinheitlichen Nummer 116 117 ist stadtübergreifend erreichbar. Bei lebensbedrohlichen Notfällen wählen Sie den Notruf 112 — unabhängig von Stadtteil oder Bezirk.',
    },
  ];
}

export default async function CityDistrictOverviewPage({ params }) {
  const { stadt } = await params;
  const [city, districts] = await Promise.all([loadCity(stadt), loadDistricts(stadt)]);
  const cityName = city?.name || stadt.charAt(0).toUpperCase() + stadt.slice(1);
  const totalPraxen = districts.reduce((s, d) => s + d.count, 0);

  const base = await getBaseUrl();
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Start', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: 'Ärzte', item: `${base}/aerzte` },
      { '@type': 'ListItem', position: 3, name: cityName, item: `${base}/aerzte/${stadt}` },
      { '@type': 'ListItem', position: 4, name: 'Stadtteile', item: `${base}/aerzte/${stadt}/stadtteil` },
    ],
  };

  const faqs = buildFaqs(cityName);
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  if (districts.length === 0) {
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
        <div className="nv-container py-12 sm:py-16">
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs nv-text-muted">
            <Link href="/" className="hover:underline">Start</Link>
            <span>/</span>
            <Link href="/aerzte" className="hover:underline">Ärzte</Link>
            <span>/</span>
            <Link href={`/aerzte/${stadt}`} className="hover:underline">{cityName}</Link>
            <span>/</span>
            <span style={{ color: 'var(--color-navy)' }}>Stadtteile</span>
          </nav>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-navy)' }}>Stadtteile in {cityName}</h1>
          <p className="mt-3 nv-text-muted">
            Aktuell liegen für {cityName} noch keine Stadtteil-Zuordnungen vor.
          </p>
          <Link href={`/aerzte/${stadt}`} className="nv-btn nv-btn-primary mt-6">
            Alle Praxen in {cityName} ansehen <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* HERO */}
      <section className="nv-surface-primary">
        <div className="nv-container py-12 sm:py-16">
          <nav aria-label="Breadcrumb" className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>
            <Link href="/" className="hover:underline">Start</Link>
            <span className="mx-1.5">/</span>
            <Link href="/aerzte" className="hover:underline">Ärzte</Link>
            <span className="mx-1.5">/</span>
            <Link href={`/aerzte/${stadt}`} className="hover:underline">{cityName}</Link>
            <span className="mx-1.5">/</span>
            <span className="text-white">Stadtteile</span>
          </nav>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ärzte in {cityName} nach Stadtteil
          </h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed" style={{ color: 'var(--color-primary-light)' }}>
            {districts.length} Stadtteile mit gelisteten Praxen — insgesamt {totalPraxen.toLocaleString('de-DE')} Einträge.
            Wählen Sie Ihren Bezirk, um Ärzte in fußläufiger oder verkehrsgünstiger Entfernung zu finden.
          </p>
        </div>
      </section>

      {/* Einleitungstext */}
      <section className="nv-surface-white">
        <div className="nv-container nv-section-tight">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
              <Compass className="h-4 w-4" /> Orientierung in {cityName}
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: 'var(--color-navy)' }}>
              Warum die Wahl des Stadtteils zählt
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed nv-text-muted">
              Die medizinische Versorgung ist innerhalb einer Stadt selten gleichmäßig verteilt.
              Fachärzte konzentrieren sich häufig in zentralen Bezirken oder in Ärztehäusern
              nahe Kliniken, während Hausarzt-Praxen breiter über Wohnquartiere gestreut sind.
              Wer regelmäßig eine Praxis aufsucht — etwa bei chronischen Erkrankungen,
              Physiotherapie oder Vorsorge — profitiert von einer wohnortnahen Wahl.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed nv-text-muted">
              Die folgende Übersicht zeigt Ihnen, in welchen Stadtteilen von {cityName} die
              meisten Praxen bei Navoria gelistet sind. Die Sortierung erfolgt nach Anzahl
              der Einträge — nicht nach Qualität oder redaktioneller Bewertung.
              Bei jedem Stadtteil sehen Sie die aktuelle Anzahl der gelisteten Praxen.
            </p>

            <div className="mt-6 nv-panel-soft">
              <p className="text-[14px] leading-relaxed" style={{ color: 'var(--color-navy)' }}>
                <strong>Hinweis zur Datenherkunft:</strong> Die Stadtteil-Zuordnung basiert
                auf öffentlichen Google-Places-Adressdaten. In manchen Fällen erfassen wir
                Bezirke unter mehreren Schreibweisen und fassen diese zusammen. Sollte ein
                Stadtteil in Ihrer Nähe fehlen, prüfen Sie die {' '}
                <Link href={`/aerzte/${stadt}`} className="nv-link">Gesamt-Übersicht für {cityName}</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STADTTEIL-KACHELN */}
      <section className="nv-surface-white">
        <div className="nv-container nv-section-tight">
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-navy)' }}>
            Alle Stadtteile mit Praxen
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {districts.map((d) => (
              <Link
                key={d.slug}
                href={`/aerzte/${stadt}/stadtteil/${d.slug}`}
                className="nv-card group flex items-center justify-between transition hover:-translate-y-0.5"
                style={{ padding: '0.9rem 1.1rem' }}
              >
                <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--color-navy)' }}>
                  <MapPin className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                  {d.display}
                </span>
                <span className="nv-badge">{d.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="nv-page-bg">
        <div className="nv-container nv-section-tight">
          <div className="mx-auto max-w-4xl">
            <h2 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--color-navy)' }}>
              <HelpCircle className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
              Häufige Fragen
            </h2>
            <div className="mt-6 space-y-3">
              {faqs.map((f, i) => (
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

      {/* Notdienst-Reminder */}
      <section className="nv-surface-white">
        <div className="nv-container pb-16">
          <div className="mx-auto max-w-4xl nv-panel-soft" style={{ padding: '1.25rem 1.5rem' }}>
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0" style={{ color: 'var(--color-primary)' }} />
              <p className="text-[14px] leading-relaxed" style={{ color: 'var(--color-navy)' }}>
                <strong>Notdienst außerhalb der Sprechzeiten:</strong> Ärztlicher
                Bereitschaftsdienst bundesweit unter <strong>116 117</strong> (kostenfrei).
                Bei lebensbedrohlichen Beschwerden — z.&nbsp;B. Verdacht auf Herzinfarkt oder
                Schlaganfall — wählen Sie sofort den Notruf <strong>112</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
