import Link from 'next/link';
import { getBaseUrl } from '@/lib/baseUrl';
import { MAGAZINE_ARTICLES, CATEGORIES } from '@/lib/magazineArticles';
import { SPECIALTIES } from '@/lib/specialties';
import { SYMPTOMS } from '@/lib/symptomContent';
import { ArticleCard, CategoryEmoji, labelForCategory, formatDate } from '@/components/MagazineCard';
import { Search, ArrowRight, Clock, BookOpen, HeartPulse, Baby, Brain, Shield, Stethoscope, Building2, Phone } from 'lucide-react';

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
  { slug: 'vorsorge', label: 'Vorsorge', icon: Shield, blurb: 'Check-up, Screening, Impfungen.', color: 'from-teal-500 to-emerald-500' },
  { slug: 'herz-kreislauf', label: 'Herz & Kreislauf', icon: HeartPulse, blurb: 'Blutdruck, Rhythmus, Cholesterin.', color: 'from-rose-500 to-red-500' },
  { slug: 'psyche', label: 'Psyche & Schlaf', icon: Brain, blurb: 'Depression, Angst, Schlafprobleme.', color: 'from-indigo-500 to-purple-500' },
  { slug: 'kinder', label: 'Kinder & Familie', icon: Baby, blurb: 'U-Untersuchungen, Fieber, Impfen.', color: 'from-pink-500 to-rose-500' },
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
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-medium text-sky-700 shadow-sm">
            <BookOpen className="h-3.5 w-3.5" /> Redaktionelles Gesundheits-Magazin
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
            Gesundheit ohne Fachchinesisch
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            Was tun bei Rückenschmerzen im Homeoffice? Ab wann ist ein Hautkrebs-Screening sinnvoll? Wir schreiben über die Themen, die Sie im Alltag betreffen. Verständlich, sorgfältig recherchiert und ohne Panikmache.
          </p>

          <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <Link href="/magazin" className="flex-1 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700">
              Magazin lesen
            </Link>
            <Link href="/ratgeber" className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700">
              Ratgeber durchsuchen
            </Link>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            Sie suchen eine Praxis? <Link href="/finden" className="font-medium text-sky-700 hover:underline">Zur Arzt-Suche</Link>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* FEATURED ARTIKEL */}
        {featured && (
          <section className="mt-8">
            <SectionHeader eyebrow="Heute im Magazin" title="Aktueller Schwerpunkt" />
            <Link href={`/magazin/${featured.slug}`} className="group mt-6 block">
              <article className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:grid-cols-[1fr_1.3fr] sm:p-10">
                <div className={`flex items-center justify-center rounded-2xl bg-gradient-to-br ${featured.heroGradient} min-h-[220px] text-7xl`}>
                  <CategoryEmoji slug={featured.category} />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="text-xs font-medium text-sky-700">{labelForCategory(featured.category)}</div>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900 group-hover:text-sky-700 sm:text-3xl">{featured.title}</h2>
                  <p className="mt-3 text-slate-600">{featured.lead}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {featured.readingMinutes} Min. Lesezeit</span>
                    <span>{formatDate(featured.publishedAt)}</span>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-sky-700 group-hover:underline">
                    Ganzen Artikel lesen <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </article>
            </Link>
          </section>
        )}

        {/* NEUESTE ARTIKEL */}
        {latest.length > 0 && (
          <section className="mt-14">
            <div className="flex items-end justify-between">
              <SectionHeader eyebrow="Frisch redigiert" title="Neueste Artikel" />
              <Link href="/magazin" className="hidden text-sm font-medium text-sky-700 hover:underline sm:inline-flex">
                Alle anzeigen →
              </Link>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {latest.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </section>
        )}

        {/* THEMEN-HUBS */}
        <section className="mt-16">
          <SectionHeader eyebrow="Nach Thema stöbern" title="Themen-Welten" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {THEMEN_HUBS.map((h) => {
              const Icon = h.icon;
              return (
                <Link
                  key={h.slug}
                  href={`/magazin/kategorie/${h.slug}`}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${h.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-sky-700">{h.label}</h3>
                  <p className="mt-1 text-sm text-slate-500">{h.blurb}</p>
                </Link>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.filter((c) => !THEMEN_HUBS.find((h) => h.slug === c.slug)).map((c) => (
              <Link key={c.slug} href={`/magazin/kategorie/${c.slug}`} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700">
                {c.label}
              </Link>
            ))}
          </div>
        </section>

        {/* TRENDING */}
        <section className="mt-16 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-10">
          <SectionHeader eyebrow="Am häufigsten gelesen" title="10 Themen, die viele beschäftigen" />
          <ol className="mt-6 grid gap-3 sm:grid-cols-2">
            {trending.map((a, i) => (
              <li key={a.slug}>
                <Link href={`/magazin/${a.slug}`} className="group flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
                  <span className="text-2xl font-bold text-slate-300 group-hover:text-sky-500">{String(i + 1).padStart(2, '0')}</span>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-sky-700">{labelForCategory(a.category)}</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900 group-hover:text-sky-700">{a.title}</div>
                    <div className="mt-1 text-xs text-slate-500">{a.readingMinutes} Min. Lesezeit</div>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* FACHRICHTUNGEN */}
        <section className="mt-16">
          <SectionHeader eyebrow="Von A bis Z" title="Fachrichtungen im Überblick" />
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Alles über die Aufgabengebiete, wann man hingeht und was die Kassen zahlen. Redaktionelle Pillar-Seiten pro Fachgebiet.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {FACHRICHTUNGEN_HIGHLIGHT.map((slug) => {
              const s = SPECIALTIES.find((x) => x.slug === slug);
              if (!s) return null;
              return (
                <Link
                  key={s.slug}
                  href={`/aerzte/fachrichtung/${s.slug}`}
                  className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-sky-200 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <Stethoscope className="h-4 w-4 text-sky-600" />
                    <span className="text-sm font-medium text-slate-800 group-hover:text-sky-700">{s.plural}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-sky-600" />
                </Link>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <Link href="/aerzte/fachrichtung" className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 hover:underline">
              Alle Fachrichtungen anzeigen <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* SYMPTOME */}
        {SYMPTOMS && SYMPTOMS.length > 0 && (
          <section className="mt-16">
            <SectionHeader eyebrow="Was fehlt Ihnen" title="Häufige Beschwerden" />
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Vom Symptom zur richtigen Fachrichtung. Klare Zuordnung, was der erste Weg sein sollte, wann man abwarten kann und wann nicht.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {SYMPTOMS.slice(0, 16).map((s) => (
                <Link
                  key={s.slug}
                  href={`/symptome/${s.slug}`}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                >
                  {s.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/symptome" className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 hover:underline">
                Alle Symptome anzeigen <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </section>
        )}

        {/* NOTDIENST-BOX */}
        <section className="mt-16 rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50 to-red-50 p-6 sm:p-10">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
              <Phone className="h-7 w-7 text-rose-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-900">Wenn es schnell gehen muss</h2>
              <p className="mt-1 text-sm text-slate-600">Ärztlicher Bereitschaftsdienst außerhalb der Praxis-Öffnungszeiten. Kostenfrei, bundesweit.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-rose-200 bg-white px-4 py-3">
                <div className="text-xs text-slate-500">Notfall (lebensbedrohlich)</div>
                <div className="text-2xl font-bold text-rose-600">112</div>
              </div>
              <div className="rounded-xl border border-rose-200 bg-white px-4 py-3">
                <div className="text-xs text-slate-500">Bereitschaftsdienst</div>
                <div className="text-2xl font-bold text-slate-900">116 117</div>
              </div>
            </div>
          </div>
        </section>

        {/* PRAXEN-VERZEICHNIS (klein, unten) */}
        <section className="mt-16 mb-20 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10">
          <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                <Building2 className="h-3.5 w-3.5" /> Zusätzlich verfügbar
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Praxen-Verzeichnis für Deutschland</h2>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                Sie suchen eine Adresse, Öffnungszeiten oder Bewertungen? Neben dem Magazin führen wir ein Verzeichnis mit Praxen in ganz Deutschland. Suche nach Fachrichtung, Stadt oder Postleitzahl.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href="/finden" className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700">
                <Search className="h-4 w-4" /> Praxis finden
              </Link>
              <Link href="/aerzte" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700">
                Verzeichnis durchsuchen <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wider text-sky-600">{eyebrow}</div>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
    </div>
  );
}
