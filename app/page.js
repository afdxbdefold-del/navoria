import Link from 'next/link';
import Image from 'next/image';
import { getBaseUrl } from '@/lib/baseUrl';
import { MAGAZINE_ARTICLES, CATEGORIES } from '@/lib/magazineArticles';
import { SPECIALTIES } from '@/lib/specialties';
import { SYMPTOMS } from '@/lib/symptomContent';
import { ArticleCard, CategoryEmoji, labelForCategory, formatDate } from '@/components/MagazineCard';
import { Search, ArrowRight, Clock, HeartPulse, Baby, Brain, Shield, Stethoscope, Building2, Phone, MapPin } from 'lucide-react';

export const revalidate = 300;

export const metadata = {
  title: 'Gesundheit verständlich: Magazin, Ratgeber und Ärzteverzeichnis',
  description: 'Redaktionelle Gesundheitsartikel, Vorsorge-Tipps und Symptom-Wissen. Verständlich, alltagstauglich, ohne Fachchinesisch. Dazu ein Verzeichnis mit Ärzten und Praxen in Deutschland.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Navoria: Gesundheit verständlich',
    description: 'Magazin, Ratgeber, Symptome, Fachrichtungen. Und wenn Sie eine Praxis brauchen, finden Sie sie auch bei uns.',
    type: 'website',
    locale: 'de_DE',
    url: '/',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Navoria: Gesundheit verständlich' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Navoria: Gesundheit verständlich',
    description: 'Magazin, Ratgeber, Fachrichtungen. Dazu ein Verzeichnis mit Praxen in Deutschland.',
    images: ['/opengraph-image'],
  },
};

const THEMEN_HUBS = [
  { slug: 'vorsorge', label: 'Vorsorge', icon: Shield, blurb: 'Check-up, Screening, Impfungen.' },
  { slug: 'herz-kreislauf', label: 'Herz & Kreislauf', icon: HeartPulse, blurb: 'Blutdruck, Rhythmus, Cholesterin.' },
  { slug: 'psyche', label: 'Psyche & Schlaf', icon: Brain, blurb: 'Depression, Angst, Schlafprobleme.' },
  { slug: 'kinder', label: 'Kinder & Familie', icon: Baby, blurb: 'U-Untersuchungen, Fieber, Impfen.' },
];

const FACHRICHTUNGEN_HIGHLIGHT = [
  'hausarzt', 'zahnarzt', 'kardiologe', 'orthopaede', 'hautarzt',
  'frauenarzt', 'kinderarzt', 'augenarzt', 'hno-arzt', 'urologe',
  'neurologe', 'psychiater',
];

export default async function HomePage() {
  const base = await getBaseUrl();
  const sortedArticles = [...MAGAZINE_ARTICLES].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  const featured = sortedArticles[0];
  const latest = sortedArticles.slice(1, 5);
  const trending = sortedArticles.slice(0, 10);

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Navoria',
    url: base,
    inLanguage: 'de-DE',
    description: 'Navoria ist ein deutsches Gesundheits-Magazin mit Ratgebern, Symptom-Wissen und einem Verzeichnis von Ärzten und Praxen.',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${base}/suche?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />

      {/* HERO — solid Primary Blue, links-ausgerichtet, Doctolib-inspiriert */}
      <section className="nv-surface-primary relative overflow-hidden">
        <div className="nv-container py-16 sm:py-20 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div>
              <h1 className="text-[38px] font-bold leading-[1.05] tracking-tight text-white sm:text-[48px] lg:text-[56px]">
                Gesundheit ohne Fachchinesisch
              </h1>
              <p className="mt-5 max-w-xl text-[17px] leading-relaxed sm:text-[18px]" style={{ color: 'var(--color-primary-light)' }}>
                Was tun bei Rückenschmerzen im Homeoffice? Ab wann ist ein Hautkrebs-Screening
                sinnvoll? Wir schreiben über die Themen, die Sie im Alltag betreffen.
                Verständlich, sorgfältig recherchiert und ohne Panikmache.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/finden" className="nv-btn nv-btn-lg nv-btn-on-navy">
                  <Search className="h-5 w-5" aria-hidden="true" /> Praxis finden
                </Link>
                <Link href="/magazin" className="nv-btn nv-btn-lg nv-btn-outline-white">
                  Magazin lesen <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" style={{ color: 'var(--color-primary-light)' }}>
                <span className="inline-flex items-center gap-2">
                  <Shield className="h-4 w-4" aria-hidden="true" /> Redaktionelle Standards
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" aria-hidden="true" /> Praxen in ganz Deutschland
                </span>
              </div>
            </div>

            {/* Rechte Seite: kompakter Praxis-Suche-Einstieg (Link-Karte, kein Fake-Formular) */}
            <div className="hidden lg:block">
              <div
                className="rounded-2xl p-6"
                style={{ background: '#ffffff', boxShadow: '0 12px 34px rgba(0,0,0,0.18)' }}
              >
                <p className="text-sm font-semibold" style={{ color: 'var(--color-navy)' }}>
                  Sie suchen eine Praxis?
                </p>
                <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Ärzte und Praxen nach Fachrichtung, Stadt oder Postleitzahl finden.
                </p>
                <Link href="/finden" className="nv-btn nv-btn-primary mt-5 w-full">
                  <Search className="h-4 w-4" aria-hidden="true" /> Zur Arzt-Suche
                </Link>
                <div className="mt-5 flex flex-wrap gap-2">
                  {['Hausarzt', 'Zahnarzt', 'Kardiologe', 'Orthopäde'].map((label) => {
                    const slug = SPECIALTIES.find((s) => s.plural === label || s.label === label)?.slug;
                    if (!slug) return null;
                    return (
                      <Link key={slug} href={`/aerzte/fachrichtung/${slug}`} className="nv-chip hover:underline">
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED ARTIKEL — weißer Content-Bereich */}
      {featured && (
        <section className="nv-surface-white">
          <div className="nv-container nv-section">
            <SectionHeader eyebrow="Heute im Magazin" title="Aktueller Schwerpunkt" />
            <Link href={`/magazin/${featured.slug}`} className="group mt-8 block">
              <article className="grid overflow-hidden rounded-2xl border sm:grid-cols-[1fr_1.2fr]" style={{ borderColor: 'var(--color-border)', background: '#fff' }}>
                <div className="relative min-h-[260px] w-full overflow-hidden sm:min-h-[360px]" style={{ background: 'var(--color-primary-soft)' }}>
                  {featured.heroImage ? (
                    <Image
                      src={featured.heroImage}
                      alt={featured.heroImageAlt || featured.title}
                      fill
                      priority
                      sizes="(max-width: 640px) 100vw, 45vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-7xl">
                      <CategoryEmoji slug={featured.category} />
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-10">
                  <span className="nv-chip w-fit">{labelForCategory(featured.category)}</span>
                  <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: 'var(--color-navy)' }}>
                    {featured.title}
                  </h2>
                  <p className="mt-3 nv-text-muted text-[15px]">{featured.lead}</p>
                  <div className="mt-5 flex items-center gap-4 text-xs nv-text-muted">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {featured.readingMinutes} Min. Lesezeit</span>
                    <span>{formatDate(featured.publishedAt)}</span>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                    Ganzen Artikel lesen <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </article>
            </Link>
          </div>
        </section>
      )}

      {/* NEUESTE ARTIKEL — soft blue */}
      {latest.length > 0 && (
        <section className="nv-surface-soft">
          <div className="nv-container nv-section">
            <div className="flex items-end justify-between">
              <SectionHeader eyebrow="Frisch redigiert" title="Neueste Artikel" />
              <Link href="/magazin" className="hidden text-sm font-semibold sm:inline-flex" style={{ color: 'var(--color-primary)' }}>
                Alle anzeigen →
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {latest.map((a) => <ArticleCard key={a.slug} article={a} />)}
            </div>
          </div>
        </section>
      )}

      {/* THEMEN-HUBS — weiß */}
      <section className="nv-surface-white">
        <div className="nv-container nv-section">
          <SectionHeader eyebrow="Nach Thema stöbern" title="Themen-Welten" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {THEMEN_HUBS.map((h) => {
              const Icon = h.icon;
              return (
                <Link key={h.slug} href={`/magazin/kategorie/${h.slug}`} className="group flex flex-col rounded-2xl p-6 transition" style={{ background: 'var(--color-primary-soft)' }}>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'var(--color-primary)', color: '#fff' }}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold" style={{ color: 'var(--color-navy)' }}>{h.label}</h3>
                  <p className="mt-1.5 text-sm nv-text-muted">{h.blurb}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                    Zum Thema <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {CATEGORIES.filter((c) => !THEMEN_HUBS.find((h) => h.slug === c.slug)).map((c) => (
              <Link key={c.slug} href={`/magazin/kategorie/${c.slug}`} className="nv-chip transition hover:underline">
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING — soft blue */}
      <section className="nv-surface-soft">
        <div className="nv-container nv-section">
          <SectionHeader eyebrow="Am häufigsten gelesen" title="10 Themen, die viele beschäftigen" />
          <ol className="mt-8 grid gap-3 sm:grid-cols-2">
            {trending.map((a, i) => (
              <li key={a.slug}>
                <Link href={`/magazin/${a.slug}`} className="group flex items-start gap-4 rounded-xl p-4 transition" style={{ background: '#fff', border: '1px solid var(--color-border)' }}>
                  <span className="text-2xl font-bold leading-none" style={{ color: 'var(--color-primary)' }}>{String(i + 1).padStart(2, '0')}</span>
                  <div className="flex-1">
                    <div className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>{labelForCategory(a.category)}</div>
                    <div className="mt-1 text-[15px] font-semibold leading-snug" style={{ color: 'var(--color-navy)' }}>{a.title}</div>
                    <div className="mt-1 text-xs nv-text-muted">{a.readingMinutes} Min. Lesezeit</div>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FACHRICHTUNGEN — Primary Blue Konversions-Sektion */}
      <section className="nv-surface-primary">
        <div className="nv-container nv-section">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-primary-light)' }}>Von A bis Z</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Fachrichtungen im Überblick
            </h2>
            <p className="mt-4 text-[16px]" style={{ color: 'var(--color-primary-light)' }}>
              Alles über die Aufgabengebiete, wann man hingeht und was die Kassen zahlen. Redaktionelle Pillar-Seiten pro Fachgebiet.
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {FACHRICHTUNGEN_HIGHLIGHT.map((slug) => {
              const s = SPECIALTIES.find((x) => x.slug === slug);
              if (!s) return null;
              return (
                <Link key={s.slug} href={`/aerzte/fachrichtung/${s.slug}`} className="group flex items-center justify-between rounded-xl px-4 py-3.5 transition" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}>
                  <div className="flex items-center gap-3">
                    <Stethoscope className="h-4 w-4" style={{ color: 'var(--color-primary-light)' }} />
                    <span className="text-sm font-semibold">{s.plural}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                </Link>
              );
            })}
          </div>
          <div className="mt-8">
            <Link href="/aerzte/fachrichtung" className="nv-btn nv-btn-on-navy">
              Alle Fachrichtungen anzeigen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SYMPTOME — weiß */}
      {SYMPTOMS && SYMPTOMS.length > 0 && (
        <section className="nv-surface-white">
          <div className="nv-container nv-section">
            <SectionHeader eyebrow="Was fehlt Ihnen" title="Häufige Beschwerden" />
            <p className="mt-3 max-w-2xl text-[15px] nv-text-muted">Vom Symptom zur richtigen Fachrichtung. Klare Zuordnung, was der erste Weg sein sollte, wann man abwarten kann und wann nicht.</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {SYMPTOMS.slice(0, 16).map((s) => (
                <Link key={s.slug} href={`/symptome/${s.slug}`} className="nv-chip hover:underline">
                  {s.label}
                </Link>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/symptome" className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                Alle Symptome anzeigen <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* NOTDIENST-Panel — restrained warning */}
      <section className="nv-surface-soft">
        <div className="nv-container nv-section-tight">
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: '#ffffff', border: '1px solid var(--color-border)' }}>
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--color-primary-light)', color: 'var(--color-navy)' }}>
                <Phone className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-navy)' }}>Wenn es schnell gehen muss</h2>
                <p className="mt-1.5 text-[15px] nv-text-muted">Ärztlicher Bereitschaftsdienst außerhalb der Praxis-Öffnungszeiten. Kostenfrei, bundesweit.</p>
              </div>
              <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2">
                <div className="rounded-xl px-4 py-3" style={{ background: 'var(--color-primary-soft)' }}>
                  <div className="text-xs nv-text-muted">Notfall (lebensbedrohlich)</div>
                  <a href="tel:112" className="text-2xl font-bold" style={{ color: 'var(--color-danger)' }}>112</a>
                </div>
                <div className="rounded-xl px-4 py-3" style={{ background: 'var(--color-primary-soft)' }}>
                  <div className="text-xs nv-text-muted">Bereitschaftsdienst</div>
                  <a href="tel:116117" className="text-2xl font-bold" style={{ color: 'var(--color-navy)' }}>116 117</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRAXEN-VERZEICHNIS Abschluss-CTA */}
      <section className="nv-surface-white">
        <div className="nv-container nv-section">
          <div className="rounded-2xl p-6 sm:p-10" style={{ background: 'var(--color-primary-soft)' }}>
            <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <span className="nv-chip">
                  <Building2 className="h-3.5 w-3.5" /> Zusätzlich verfügbar
                </span>
                <h2 className="mt-4 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--color-navy)' }}>Praxen-Verzeichnis für Deutschland</h2>
                <p className="mt-3 max-w-xl text-[15px] nv-text-muted">
                  Sie suchen eine Adresse, Öffnungszeiten oder Bewertungen? Neben dem Magazin führen wir ein Verzeichnis mit Praxen in ganz Deutschland. Suche nach Fachrichtung, Stadt oder Postleitzahl.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href="/finden" className="nv-btn nv-btn-primary">
                  <Search className="h-4 w-4" /> Praxis finden
                </Link>
                <Link href="/aerzte" className="nv-btn nv-btn-secondary">
                  Verzeichnis durchsuchen <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeader({ eyebrow, title }) {
  return (
    <div>
      <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-[36px]" style={{ color: 'var(--color-navy)' }}>{title}</h2>
    </div>
  );
}
