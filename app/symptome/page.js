import Link from 'next/link';
import { SYMPTOMS } from '@/lib/symptomContent';
import { Stethoscope, HeartPulse, Info, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { getBaseUrl } from '@/lib/baseUrl';

export const dynamic = 'force-static';
export const revalidate = 3600;

// Kategorisierung der Symptome nach Themen-Cluster – für SEO-Struktur und LLM-Verständnis
const CATEGORIES = [
  {
    id: 'schmerzen',
    title: 'Schmerzen',
    description: 'Verschiedene Schmerzformen und ihre Ursachen – vom Rücken bis zum Zahn.',
    slugs: ['rueckenschmerzen', 'kopfschmerzen', 'brustschmerzen', 'bauchschmerzen', 'zahnschmerzen', 'ohrenschmerzen', 'halsschmerzen', 'gelenkschmerzen', 'knieschmerzen'],
  },
  {
    id: 'atem-herz',
    title: 'Herz, Kreislauf & Atmung',
    description: 'Symptome des Herz-Kreislauf-Systems und der Atemwege.',
    slugs: ['herzstolpern', 'bluthochdruck', 'atemnot', 'husten'],
  },
  {
    id: 'verdauung',
    title: 'Magen, Darm & Ausscheidung',
    description: 'Beschwerden des Verdauungstrakts und der Harnwege.',
    slugs: ['sodbrennen', 'blut-im-stuhl', 'blut-im-urin'],
  },
  {
    id: 'haut-sinne',
    title: 'Haut, Sehen, Hören',
    description: 'Hautveränderungen, Seh- und Hörprobleme.',
    slugs: ['hautausschlag', 'juckreiz', 'sehstoerungen', 'tinnitus'],
  },
  {
    id: 'psyche-schlaf',
    title: 'Psyche, Schlaf & Erschöpfung',
    description: 'Psychische Symptome und Beschwerden rund um Schlaf und Erschöpfung.',
    slugs: ['depression', 'angst-panik', 'schlafstoerungen', 'muedigkeit'],
  },
  {
    id: 'allgemein',
    title: 'Allgemeine Symptome',
    description: 'Unspezifische Beschwerden, die viele Ursachen haben können.',
    slugs: ['fieber', 'schwindel'],
  },
];

export async function generateMetadata() {
  return {
    title: 'Symptome & Beschwerden – welcher Arzt ist zuständig?',
    description: 'Von Rückenschmerzen bis Tinnitus: Der Navoria-Symptom-Ratgeber erklärt, welcher Facharzt für welche Beschwerden zuständig ist – kurz, präzise und redaktionell geprüft.',
    alternates: { canonical: '/symptome' },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'de_DE',
      url: '/symptome',
      title: 'Symptome & Beschwerden – welcher Arzt hilft?',
      description: 'Über 25 medizinische Symptome mit Fachrichtungs-Empfehlung, Notfall-Hinweisen und häufigen Fragen.',
    },
  };
}

export default async function SymptomOverviewPage() {
  const base = await getBaseUrl();

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Start', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: 'Symptome', item: `${base}/symptome` },
    ],
  };

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Symptome und Beschwerden',
    numberOfItems: SYMPTOMS.length,
    itemListElement: SYMPTOMS.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${base}/symptome/${s.slug}`,
      name: s.label,
    })),
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link>
        <span>/</span>
        <span className="text-slate-700">Symptome</span>
      </nav>

      {/* Hero */}
      <header className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-sky-50/40 p-6 sm:p-8">
        <div className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
          <HeartPulse className="h-3 w-3" /> Symptom-Ratgeber
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Symptome & Beschwerden – welcher Arzt ist zuständig?
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-700 sm:text-lg">
          Nicht jedes Symptom braucht denselben Facharzt. Unser redaktionell geprüfter Ratgeber zeigt Ihnen für die {SYMPTOMS.length} häufigsten Beschwerden, welcher Arzt zuständig ist, ab wann Sie unbedingt handeln sollten und was Sie selbst tun können.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Redaktionell geprüft</span>
          <span className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1"><Info className="h-3.5 w-3.5" /> Keine Diagnose. Notfall: 112</span>
        </div>
      </header>

      {/* Kategorien */}
      <section className="mt-10 space-y-10">
        {CATEGORIES.map((cat) => {
          const symptoms = cat.slugs
            .map((sl) => SYMPTOMS.find((x) => x.slug === sl))
            .filter(Boolean);
          if (!symptoms.length) return null;
          return (
            <div key={cat.id}>
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-slate-900">{cat.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{cat.description}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {symptoms.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/symptome/${s.slug}`}
                    className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-sm"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-sky-700">{s.label}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                        {s.directAnswer}
                      </p>
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-sky-700">
                      Ratgeber lesen <ArrowRight className="h-3 w-3" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Cross-Link zu Fachrichtungen */}
      <section className="mt-14 rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
          <div>
            <h3 className="text-base font-semibold text-slate-900">Sie kennen bereits die Fachrichtung?</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Gehen Sie direkt zu unseren Fachrichtungs-Übersichten – Hausarzt, Kardiologe, Orthopäde und viele weitere.
            </p>
            <Link href="/aerzte/fachrichtung" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-sky-700 hover:text-sky-800">
              Alle Fachrichtungen ansehen <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Redaktions-Hinweis */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Redaktioneller Hinweis</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Die Ratgeber-Texte sind redaktionell erstellt und ersetzen keine ärztliche Diagnose oder Behandlung. Details zu Datenquellen und Prüfprozessen finden Sie in unseren{' '}
              <Link href="/redaktionelle-standards" className="text-sky-700 underline underline-offset-2 hover:text-sky-800">Redaktionellen Standards</Link>. Bei akuten oder lebensbedrohlichen Beschwerden wählen Sie <strong>112</strong>, für ärztlichen Bereitschaftsdienst außerhalb der Öffnungszeiten <strong>116 117</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
