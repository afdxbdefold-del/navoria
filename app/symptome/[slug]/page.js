import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SYMPTOMS, symptomBySlug } from '@/lib/symptomContent';
import { SPECIALTIES, specialtyBySlug } from '@/lib/specialties';
import {
  Stethoscope, HeartPulse, AlertTriangle, PhoneCall, HelpCircle,
  ShieldCheck, ArrowRight, Info, MapPin, Sparkles,
} from 'lucide-react';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function generateStaticParams() {
  return SYMPTOMS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const s = symptomBySlug(slug);
  if (!s) return { title: 'Symptom nicht gefunden' };
  const canonical = `/symptome/${slug}`;
  return {
    title: `${s.label} – Welcher Arzt hilft? Ursachen, Notfall & FAQ`,
    description: s.directAnswer.slice(0, 195),
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'article',
      locale: 'de_DE',
      url: canonical,
      title: `${s.label}: Welcher Arzt ist zuständig?`,
      description: s.directAnswer.slice(0, 200),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${s.label} – welcher Arzt hilft?`,
      description: s.directAnswer.slice(0, 195),
    },
  };
}

export default async function SymptomDetailPage({ params }) {
  const { slug } = await params;
  const s = symptomBySlug(slug);
  if (!s) notFound();

  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const pageUrl = `${base}/symptome/${slug}`;

  // JSON-LD: Breadcrumb
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Start', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: 'Symptome', item: `${base}/symptome` },
      { '@type': 'ListItem', position: 3, name: s.label, item: pageUrl },
    ],
  };

  // JSON-LD: MedicalWebPage + MedicalCondition
  const medicalCondition = {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    name: s.label,
    description: s.directAnswer,
    url: pageUrl,
    inLanguage: 'de-DE',
  };

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id': pageUrl,
    url: pageUrl,
    name: `${s.label} – Welcher Arzt hilft?`,
    inLanguage: 'de-DE',
    isPartOf: { '@type': 'WebSite', url: base, name: 'Navoria' },
    about: medicalCondition,
    mainContentOfPage: { '@type': 'WebPageElement', description: s.directAnswer },
    lastReviewed: new Date().toISOString().split('T')[0],
    publisher: { '@id': `${base}#organization` },
  };

  const faqSchema = s.faqs?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: s.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null;

  // Verwandte Fachrichtungen aus whichDoctor + relatedSlugs
  const relatedSpecSlugs = Array.from(new Set([
    ...(s.whichDoctor || []).map((d) => d.slug).filter(Boolean),
    ...(s.relatedSlugs || []),
  ]));
  const relatedSpecs = relatedSpecSlugs
    .map((sl) => SPECIALTIES.find((x) => x.slug === sl))
    .filter(Boolean);

  // Verwandte Symptome
  const relatedSymptoms = (s.relatedSymptoms || [])
    .map((sl) => SYMPTOMS.find((x) => x.slug === sl))
    .filter(Boolean);

  // Primärer Fachrichtungs-CTA: erster Eintrag in whichDoctor mit Slug
  const primarySpec = (s.whichDoctor || []).find((d) => d.slug);
  const primarySpecObj = primarySpec ? SPECIALTIES.find((x) => x.slug === primarySpec.slug) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalCondition) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link>
        <span>/</span>
        <Link href="/symptome" className="hover:text-sky-700">Symptome</Link>
        <span>/</span>
        <span className="text-slate-700">{s.label}</span>
      </nav>

      {/* Hero */}
      <header className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-sky-50/40 p-6 sm:p-8">
        <div className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
          <HeartPulse className="h-3 w-3" /> Symptom-Ratgeber
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {s.label}: Welcher Arzt ist zuständig?
        </h1>

        {/* Direct Answer – hervorgehoben für LLM- und Featured-Snippet-Extraktion */}
        <div className="mt-5 rounded-xl border-l-4 border-sky-500 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">Kurz-Antwort</div>
          <p className="mt-1 text-[15px] leading-relaxed text-slate-800">
            {s.directAnswer}
          </p>
        </div>
      </header>

      {/* Notfall-Box, wenn 112-Hinweis vorhanden */}
      {s.emergency?.call112 && (
        <section className="mt-6 rounded-2xl border border-red-200 bg-red-50/60 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <h2 className="text-base font-semibold text-red-800">Notfall-Check – wann 112 wählen?</h2>
              <p className="mt-2 text-sm leading-relaxed text-red-900">
                <strong>112 rufen:</strong> {s.emergency.call112}
              </p>
              {s.emergency.call116117 && (
                <p className="mt-2 text-sm leading-relaxed text-red-900">
                  <strong>116 117 (ärztlicher Bereitschaftsdienst):</strong> {s.emergency.call116117}
                </p>
              )}
              {s.emergency.note && (
                <p className="mt-2 text-sm leading-relaxed text-red-900/80">
                  <Info className="mr-1 inline h-3.5 w-3.5 -translate-y-0.5" />
                  {s.emergency.note}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Intro / Kontext */}
      <section className="prose prose-slate mt-10 max-w-none prose-p:text-[15px] prose-p:leading-relaxed prose-p:text-slate-700 prose-h2:mt-10 prose-h2:mb-3 prose-h2:text-2xl prose-h2:font-semibold prose-h2:text-slate-900">
        <h2>Hintergrund zu {s.label}</h2>
        <p>{s.intro}</p>
      </section>

      {/* Welcher Arzt hilft? */}
      {s.whichDoctor?.length > 0 && (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <Stethoscope className="h-5 w-5 text-sky-600" /> Welcher Arzt ist bei {s.label} zuständig?
          </h2>
          <div className="mt-5 space-y-3">
            {s.whichDoctor.map((d, i) => {
              const spec = d.slug ? SPECIALTIES.find((x) => x.slug === d.slug) : null;
              const inner = (
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-500">Wann?</div>
                    <p className="mt-0.5 text-sm text-slate-700">{d.when}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Facharzt</div>
                    <div className="mt-0.5 flex items-center justify-end gap-1 text-sm font-semibold text-sky-700">
                      {d.doctor}
                      {spec && <ArrowRight className="h-3.5 w-3.5" />}
                    </div>
                  </div>
                </div>
              );
              return spec ? (
                <Link
                  key={i}
                  href={`/aerzte/fachrichtung/${spec.slug}`}
                  className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-sm"
                >
                  {inner}
                </Link>
              ) : (
                <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  {inner}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Primärer CTA: Arzt in der Nähe finden */}
      {primarySpecObj && (
        <section className="mt-10 rounded-2xl border border-sky-200 bg-sky-50/60 p-6 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{primarySpecObj.plural} in Ihrer Nähe finden</h2>
              <p className="mt-1 text-sm text-slate-700">
                Adresse, Telefon, Öffnungszeiten und Bewertungen aller {primarySpecObj.plural} in Deutschland.
              </p>
            </div>
            <Link
              href={`/aerzte/fachrichtung/${primarySpecObj.slug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800"
            >
              <MapPin className="h-4 w-4" />
              {primarySpecObj.plural} finden
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* FAQ */}
      {s.faqs?.length > 0 && (
        <section className="mt-12">
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <HelpCircle className="h-5 w-5 text-sky-600" /> Häufige Fragen zu {s.label}
          </h2>
          <div className="mt-5 space-y-3">
            {s.faqs.map((f, i) => (
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

      {/* Verwandte Symptome */}
      {relatedSymptoms.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-slate-900">Verwandte Symptome</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
            Nutzer, die nach {s.label} suchen, informieren sich häufig auch über:
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {relatedSymptoms.map((r) => (
              <Link
                key={r.slug}
                href={`/symptome/${r.slug}`}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
              >
                {r.label}
                <ArrowRight className="h-3 w-3" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Verwandte Fachrichtungen */}
      {relatedSpecs.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-slate-900">Passende Fachrichtungen</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {relatedSpecs.map((r) => (
              <Link
                key={r.slug}
                href={`/aerzte/fachrichtung/${r.slug}`}
                className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700 hover:bg-sky-100"
              >
                <Stethoscope className="h-3.5 w-3.5" />
                {r.plural}
                <ArrowRight className="h-3 w-3" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trust / Redaktions-Hinweis */}
      <section className="mt-14 rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Redaktioneller Hinweis</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Dieser Ratgeber-Text ist redaktionell erstellt und ersetzt keine ärztliche Beratung. Details zu Datenquellen und Prüfprozessen finden Sie in unseren{' '}
              <Link href="/redaktionelle-standards" className="text-sky-700 underline underline-offset-2 hover:text-sky-800">Redaktionellen Standards</Link>. Bei akuten oder lebensbedrohlichen Beschwerden wählen Sie sofort <strong>112</strong>. Der ärztliche Bereitschaftsdienst ist rund um die Uhr unter <strong>116 117</strong> erreichbar.
            </p>
          </div>
        </div>
      </section>

      {/* Zurück zur Symptom-Übersicht */}
      <div className="mt-8 flex justify-center">
        <Link
          href="/symptome"
          className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 hover:text-sky-800"
        >
          <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          Alle Symptome ansehen
        </Link>
      </div>
    </div>
  );
}
