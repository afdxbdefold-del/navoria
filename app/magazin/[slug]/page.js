import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { articleBySlug, MAGAZINE_ARTICLES, categoryBySlug } from '@/lib/magazineArticles';
import { specialtyBySlug } from '@/lib/specialties';
import { getBaseUrl } from '@/lib/baseUrl';
import { Clock, ArrowLeft, ArrowRight, Info, AlertTriangle, CheckCircle2, HelpCircle, BookOpen } from 'lucide-react';
import { CategoryEmoji, labelForCategory, formatDate } from '@/components/MagazineCard';

export const revalidate = 3600;

export async function generateStaticParams() {
  return MAGAZINE_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const a = articleBySlug(slug);
  if (!a) return { title: 'Nicht gefunden' };
  return {
    title: a.title,
    description: a.lead,
    alternates: { canonical: `/magazin/${a.slug}` },
    openGraph: {
      title: a.title,
      description: a.lead,
      url: `/magazin/${a.slug}`,
      type: 'article',
      locale: 'de_DE',
      publishedTime: a.publishedAt,
      modifiedTime: a.updatedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: a.title,
      description: a.lead,
    },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const a = articleBySlug(slug);
  if (!a) notFound();

  const base = await getBaseUrl();
  const category = categoryBySlug(a.category);
  const relatedArticles = MAGAZINE_ARTICLES.filter((x) => x.slug !== a.slug && x.category === a.category).slice(0, 3);
  if (relatedArticles.length < 3) {
    for (const other of MAGAZINE_ARTICLES) {
      if (relatedArticles.length >= 3) break;
      if (other.slug !== a.slug && !relatedArticles.find((r) => r.slug === other.slug)) {
        relatedArticles.push(other);
      }
    }
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.lead,
    datePublished: a.publishedAt,
    dateModified: a.updatedAt,
    inLanguage: 'de-DE',
    author: { '@type': 'Organization', name: 'Navoria Redaktion', url: base },
    publisher: {
      '@type': 'Organization',
      name: 'Navoria',
      logo: { '@type': 'ImageObject', url: `${base}/icon.svg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${base}/magazin/${a.slug}` },
    articleSection: category?.label || a.category,
    keywords: a.tags.join(', '),
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Start', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: 'Magazin', item: `${base}/magazin` },
      { '@type': 'ListItem', position: 3, name: a.title, item: `${base}/magazin/${a.slug}` },
    ],
  };

  const faqSchema = a.faqs.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: a.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link> <span>/</span>
        <Link href="/magazin" className="hover:text-sky-700"> Magazin</Link> <span>/</span>
        <span className="text-slate-700">{category?.label}</span>
      </nav>

      <Link href="/magazin" className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-sky-700">
        <ArrowLeft className="h-3 w-3" /> Zurück zum Magazin
      </Link>

      <div className="mt-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
          <BookOpen className="h-3 w-3" /> {category?.label}
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{a.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-700">{a.lead}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-slate-200 py-3 text-xs text-slate-500">
          <span className="font-medium text-slate-700">Navoria Redaktion</span>
          <span className="text-slate-300">|</span>
          <span>Veröffentlicht {formatDate(a.publishedAt)}</span>
          {a.updatedAt && a.updatedAt !== a.publishedAt && (
            <>
              <span className="text-slate-300">|</span>
              <span>Aktualisiert {formatDate(a.updatedAt)}</span>
            </>
          )}
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {a.readingMinutes} Min. Lesezeit</span>
        </div>
      </div>

      <div className={`relative mt-8 h-64 w-full overflow-hidden rounded-2xl bg-slate-100 sm:h-96 ${a.heroImage ? '' : `bg-gradient-to-br ${a.heroGradient}`}`}>
        {a.heroImage ? (
          <Image
            src={a.heroImage}
            alt={a.heroImageAlt || a.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-8xl">
            <CategoryEmoji slug={a.category} />
          </div>
        )}
      </div>

      <article className="prose prose-slate mt-10 max-w-none">
        {a.sections.map((s, i) => (
          <RenderSection key={i} section={s} />
        ))}
      </article>

      {/* FAQ */}
      {a.faqs.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center gap-2 text-slate-700">
            <HelpCircle className="h-4 w-4" />
            <h2 className="text-lg font-semibold text-slate-900">Häufige Fragen</h2>
          </div>
          <div className="mt-4 space-y-3">
            {a.faqs.map((f, i) => (
              <details key={i} className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 group-open:text-sky-700">{f.q}</summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Verwandte Fachrichtungen */}
      {a.relatedSpecialties && a.relatedSpecialties.length > 0 && (
        <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-sm font-semibold text-slate-900">Passende Ratgeber-Themen</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {a.relatedSpecialties.map((slugName) => {
              const spec = specialtyBySlug(slugName);
              if (!spec) return null;
              return (
                <Link key={slugName} href={`/aerzte/fachrichtung/${slugName}`} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700">
                  Ratgeber: {spec.plural}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Quellen */}
      {a.sources && a.sources.length > 0 && (
        <section className="mt-10 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
          <p className="font-semibold text-slate-700">Quellen und Leitlinien</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {a.sources.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] italic text-slate-400">
            Redaktioneller Hinweis: Dieser Artikel ist eine informierende Aufbereitung und ersetzt keine ärztliche Beratung. Bei konkreten Beschwerden fragen Sie Ihren Haus- oder Facharzt.
          </p>
        </section>
      )}

      {/* Weitere Artikel */}
      {relatedArticles.length > 0 && (
        <section className="mt-14 border-t border-slate-200 pt-10">
          <h2 className="text-xl font-semibold text-slate-900">Weiterlesen</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {relatedArticles.map((r) => (
              <Link key={r.slug} href={`/magazin/${r.slug}`} className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                <div className="relative h-24 w-full overflow-hidden bg-slate-100">
                  {r.heroImage ? (
                    <Image
                      src={r.heroImage}
                      alt={r.heroImageAlt || r.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className={`flex h-full items-center justify-center bg-gradient-to-br ${r.heroGradient} text-3xl`}>
                      <CategoryEmoji slug={r.category} />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="text-xs font-medium text-sky-700">{labelForCategory(r.category)}</div>
                  <h3 className="mt-1 text-sm font-semibold text-slate-900 group-hover:text-sky-700">{r.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function RenderSection({ section }) {
  if (section.type === 'paragraph') {
    return <p className="mt-4 leading-relaxed text-slate-700">{section.text}</p>;
  }
  if (section.type === 'heading') {
    const Tag = section.level === 3 ? 'h3' : 'h2';
    return <Tag className={`mt-8 ${section.level === 3 ? 'text-lg' : 'text-xl'} font-semibold text-slate-900`}>{section.text}</Tag>;
  }
  if (section.type === 'list') {
    return (
      <ul className="mt-4 space-y-2 text-slate-700">
        {section.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (section.type === 'callout') {
    const toneMap = {
      info: { bg: 'bg-sky-50', border: 'border-sky-200', icon: <Info className="h-4 w-4 text-sky-700" />, textColor: 'text-sky-900' },
      warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: <AlertTriangle className="h-4 w-4 text-amber-700" />, textColor: 'text-amber-900' },
      success: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <CheckCircle2 className="h-4 w-4 text-emerald-700" />, textColor: 'text-emerald-900' },
    };
    const t = toneMap[section.tone] || toneMap.info;
    return (
      <div className={`mt-6 rounded-2xl border ${t.border} ${t.bg} p-5`}>
        <div className={`flex items-center gap-2 text-sm font-semibold ${t.textColor}`}>
          {t.icon}
          <span>{section.title}</span>
        </div>
        <p className={`mt-2 text-sm leading-relaxed ${t.textColor}`}>{section.text}</p>
      </div>
    );
  }
  return null;
}
