import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RATGEBER, ratgeberBySlug } from '@/lib/ratgeberContent';
import { BookOpen, ArrowRight, HelpCircle, ShieldCheck, Calendar } from 'lucide-react';
import { getBaseUrl } from '@/lib/baseUrl';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function generateStaticParams() {
  return RATGEBER.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const r = ratgeberBySlug(slug);
  if (!r) return { title: 'Ratgeber nicht gefunden' };
  return {
    title: `${r.label} – Ratgeber für Patienten`,
    description: r.directAnswer.slice(0, 195),
    alternates: { canonical: `/ratgeber/${slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'article',
      locale: 'de_DE',
      url: `/ratgeber/${slug}`,
      title: r.label,
      description: r.directAnswer.slice(0, 200),
    },
  };
}

export default async function RatgeberDetail({ params }) {
  const { slug } = await params;
  const r = ratgeberBySlug(slug);
  if (!r) notFound();

  const base = await getBaseUrl();
  const pageUrl = `${base}/ratgeber/${slug}`;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Start', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: 'Ratgeber', item: `${base}/ratgeber` },
      { '@type': 'ListItem', position: 3, name: r.label, item: pageUrl },
    ],
  };

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': pageUrl,
    url: pageUrl,
    headline: r.label,
    description: r.directAnswer,
    articleSection: r.category,
    inLanguage: 'de-DE',
    datePublished: `${r.lastUpdated}T00:00:00Z`,
    dateModified: `${r.lastUpdated}T00:00:00Z`,
    author: { '@type': 'Organization', name: 'Navoria Redaktion', url: base },
    publisher: { '@id': `${base}#organization` },
    isPartOf: { '@type': 'WebSite', url: base, name: 'Navoria' },
  };

  const faqSchema = r.faqs?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: r.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null;

  const relatedItems = (r.relatedRatgeberSlugs || [])
    .map((sl) => RATGEBER.find((x) => x.slug === sl))
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link>
        <span>/</span>
        <Link href="/ratgeber" className="hover:text-sky-700">Ratgeber</Link>
        <span>/</span>
        <span className="text-slate-700">{r.label}</span>
      </nav>

      <header className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-sky-50/40 p-6 sm:p-8">
        <div className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
          <BookOpen className="h-3 w-3" /> {r.category}
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {r.label}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Aktualisiert: {new Date(r.lastUpdated).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
        </div>

        {/* Direct Answer */}
        <div className="mt-5 rounded-xl border-l-4 border-sky-500 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">Kurz-Antwort</div>
          <p className="mt-1 text-[15px] leading-relaxed text-slate-800">
            {r.directAnswer}
          </p>
        </div>
      </header>

      {/* Intro */}
      <section className="prose prose-slate mt-10 max-w-none prose-p:text-[15px] prose-p:leading-relaxed prose-p:text-slate-700">
        <p>{r.intro}</p>
      </section>

      {/* Sections */}
      <div className="mt-8 space-y-8">
        {r.sections.map((s, i) => (
          <section key={i}>
            <h2 className="text-2xl font-semibold text-slate-900">{s.h2}</h2>
            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-slate-700">
              {s.body}
            </p>
          </section>
        ))}
      </div>

      {/* FAQ */}
      {r.faqs?.length > 0 && (
        <section className="mt-12">
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <HelpCircle className="h-5 w-5 text-sky-600" /> Häufige Fragen
          </h2>
          <div className="mt-5 space-y-3">
            {r.faqs.map((f, i) => (
              <details
                key={i}
                className="group rounded-xl border border-slate-200 bg-white p-5 open:border-sky-200 open:bg-sky-50/30"
              >
                <summary className="cursor-pointer list-none text-base font-semibold text-slate-900 group-open:text-sky-800">
                  <span className="mr-2 inline-block text-sky-600">›</span>
                  {f.q}
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-700">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Verwandte Ratgeber */}
      {relatedItems.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-slate-900">Auch interessant</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {relatedItems.map((item) => (
              <Link
                key={item.slug}
                href={`/ratgeber/${item.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-sm"
              >
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">{item.category}</div>
                  <h3 className="mt-1 font-semibold text-slate-900 group-hover:text-sky-700">{item.label}</h3>
                </div>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-sky-700">
                  Ratgeber lesen <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trust */}
      <section className="mt-14 rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Redaktioneller Hinweis</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Dieser Ratgeber-Text ist redaktionell erstellt und ersetzt keine ärztliche Beratung. Bei individuellen medizinischen Fragen wenden Sie sich an Ihren Hausarzt. Details zu Datenquellen und Prüfprozessen finden Sie in unseren{' '}
              <Link href="/redaktionelle-standards" className="text-sky-700 underline underline-offset-2 hover:text-sky-800">Redaktionellen Standards</Link>.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 flex justify-center">
        <Link
          href="/ratgeber"
          className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 hover:text-sky-800"
        >
          <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          Alle Ratgeber ansehen
        </Link>
      </div>
    </div>
  );
}
