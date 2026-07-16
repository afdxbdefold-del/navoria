'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Stethoscope, Heart, Baby, Smile, Eye, Ear, Bone, Brain, Sparkles, ArrowRight, Info, HeartPulse, BookOpen } from 'lucide-react';

const POPULAR_SPECIALTIES = [
  { name: 'Hausarzt', icon: Stethoscope, slug: 'hausarzt' },
  { name: 'Zahnarzt', icon: Smile, slug: 'zahnarzt' },
  { name: 'Kardiologe', icon: Heart, slug: 'kardiologe' },
  { name: 'Orthopäde', icon: Bone, slug: 'orthopaede' },
  { name: 'Hautarzt', icon: Sparkles, slug: 'hautarzt' },
  { name: 'Frauenarzt', icon: Heart, slug: 'frauenarzt' },
  { name: 'Kinderarzt', icon: Baby, slug: 'kinderarzt' },
  { name: 'Augenarzt', icon: Eye, slug: 'augenarzt' },
  { name: 'HNO-Arzt', icon: Ear, slug: 'hno-arzt' },
  { name: 'Neurologe', icon: Brain, slug: 'neurologe' },
];

const BIG_CITIES = [
  { name: 'Berlin', slug: 'berlin' },
  { name: 'Hamburg', slug: 'hamburg' },
  { name: 'München', slug: 'muenchen' },
  { name: 'Köln', slug: 'koeln' },
  { name: 'Frankfurt', slug: 'frankfurt-am-main' },
  { name: 'Stuttgart', slug: 'stuttgart' },
  { name: 'Düsseldorf', slug: 'duesseldorf' },
  { name: 'Leipzig', slug: 'leipzig' },
  { name: 'Dortmund', slug: 'dortmund' },
  { name: 'Bremen', slug: 'bremen' },
  { name: 'Hannover', slug: 'hannover' },
  { name: 'Nürnberg', slug: 'nuernberg' },
];

const POPULAR_SYMPTOMS = [
  { label: 'Rückenschmerzen', slug: 'rueckenschmerzen' },
  { label: 'Kopfschmerzen', slug: 'kopfschmerzen' },
  { label: 'Bauchschmerzen', slug: 'bauchschmerzen' },
  { label: 'Zahnschmerzen', slug: 'zahnschmerzen' },
  { label: 'Halsschmerzen', slug: 'halsschmerzen' },
  { label: 'Ohrenschmerzen', slug: 'ohrenschmerzen' },
  { label: 'Fieber', slug: 'fieber' },
  { label: 'Schwindel', slug: 'schwindel' },
  { label: 'Hautausschlag', slug: 'hautausschlag' },
  { label: 'Bluthochdruck', slug: 'bluthochdruck' },
  { label: 'Schlafstörungen', slug: 'schlafstoerungen' },
  { label: 'Herzstolpern', slug: 'herzstolpern' },
];

export default function HomePage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [ort, setOrt] = useState('');
  const [symptomInput, setSymptomInput] = useState('');
  const [symptomSuggestions, setSymptomSuggestions] = useState(null);
  const [suggestLoading, setSuggestLoading] = useState(false);

  useEffect(() => {
    if (!symptomInput || symptomInput.length < 3) {
      setSymptomSuggestions(null);
      return;
    }
    setSuggestLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/symptom-suggest?q=${encodeURIComponent(symptomInput)}`);
        const data = await r.json();
        setSymptomSuggestions(data.specialties || []);
      } catch { setSymptomSuggestions([]); }
      setSuggestLoading(false);
    }, 350);
    return () => clearTimeout(t);
  }, [symptomInput]);

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (ort) params.set('ort', ort);
    router.push(`/suche?${params.toString()}`);
  };

  return (
    <>
      {/* HERO — solid Primary Blue mit integrierter Suche */}
      <section className="nv-surface-primary relative overflow-hidden">
        <div className="nv-container py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-[38px] font-bold leading-[1.05] tracking-tight text-white sm:text-[48px] lg:text-[56px]">
              Ärzte in Ihrer Nähe finden
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed sm:text-[18px]" style={{ color: 'var(--color-primary-light)' }}>
              Adresse, Telefon, Öffnungszeiten und Bewertungen — deutschlandweit,
              übersichtlich und aktuell auf einer Seite.
            </p>
          </div>

          {/* Suchbox — auf dem Hero */}
          <form
            onSubmit={submit}
            className="mx-auto mt-8 max-w-3xl rounded-2xl p-3 sm:p-4"
            style={{ background: '#ffffff', boxShadow: '0 12px 40px rgba(0,0,0,0.16)' }}
            aria-label="Arztsuche"
            toolname="searchDoctors"
            tooldescription="Sucht Ärzt:innen und Praxen in Deutschland nach Fachrichtung, Stadt oder Postleitzahl. Beispiele: 'Hausarzt' in 'Berlin', 'Zahnarzt' in '80331'. Öffnet die Suchergebnisseite auf Navoria mit passenden Praxen inkl. Adresse, Bewertung und Kontaktdaten."
            toolautosubmit="true"
          >
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <div className="relative">
                <label htmlFor="home-search-q" className="sr-only">Suchbegriff (z. B. Hausarzt, Kardiologe)</label>
                <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  id="home-search-q"
                  name="q"
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Fachrichtung, Praxis oder Name"
                  className="nv-input pl-9"
                  toolparamdescription="Fachrichtung oder freier Suchbegriff, z. B. 'Hausarzt', 'Zahnarzt', 'Kardiologe', 'Physiotherapeut'."
                />
              </div>
              <div className="relative">
                <label htmlFor="home-search-ort" className="sr-only">Ort oder Postleitzahl</label>
                <MapPin aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  id="home-search-ort"
                  name="ort"
                  type="text"
                  autoComplete="postal-code"
                  value={ort}
                  onChange={(e) => setOrt(e.target.value)}
                  placeholder="Ort oder PLZ"
                  className="nv-input pl-9"
                  toolparamdescription="Deutscher Ortsname oder 5-stellige Postleitzahl, z. B. 'Berlin' oder '10115'."
                />
              </div>
              <button type="submit" className="nv-btn nv-btn-lg nv-btn-primary">
                Ärzte finden <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </form>

          <p className="mx-auto mt-4 flex max-w-2xl items-center justify-center gap-2 text-xs" style={{ color: 'rgba(221,240,252,0.85)' }}>
            <Info aria-hidden="true" className="h-3.5 w-3.5" /> Keine medizinische Diagnose. Bei akutem Notfall 112.
          </p>
        </div>
      </section>

      {/* Symptom-Assistent — White Surface Card */}
      <section className="nv-surface-white">
        <div className="nv-container nv-section-tight">
          <div className="nv-card-elevated mx-auto max-w-4xl">
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
              <Sparkles aria-hidden="true" className="h-4 w-4" /> Symptom-Assistent
            </div>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--color-navy)' }}>
              Sagen Sie uns, was fehlt. Wir sagen Ihnen, wer hilft.
            </h2>
            <p className="mt-2 text-[15px] nv-text-muted">
              Kein Fachbegriff nötig — einfach Beschwerden eintippen. Wir schlagen die passende Fachrichtung vor.
            </p>
            <form
              role="search"
              onSubmit={(e) => e.preventDefault()}
              className="mt-5"
              aria-label="Symptom-Assistent"
              toolname="findSpecialtyForSymptom"
              tooldescription="Empfiehlt die passende Fachrichtung (z. B. Orthopäde, Hausarzt) für ein Symptom oder eine Beschwerde. Reine Empfehlung, keine medizinische Diagnose."
            >
              <label htmlFor="symptom-input" className="sr-only">Symptom oder Beschwerde beschreiben</label>
              <input
                id="symptom-input"
                name="symptom"
                type="search"
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
                placeholder="z. B. Rückenschmerzen, Herzrasen, Hautausschlag"
                className="nv-input"
                aria-describedby="symptom-help"
                toolparamdescription="Freitext-Beschwerde, z. B. 'Rückenschmerzen', 'Kopfschmerzen', 'Herzrasen', 'Hautausschlag'."
              />
            </form>
            <p id="symptom-help" className="sr-only">Geben Sie ein Symptom ein – wir schlagen passende Fachrichtungen vor.</p>
            {suggestLoading && <p className="mt-3 text-xs nv-text-muted">Suche Fachrichtungen …</p>}
            {symptomSuggestions !== null && !suggestLoading && (
              <div className="mt-4">
                {symptomSuggestions.length === 0 ? (
                  <p className="text-sm nv-text-muted">
                    Keine spezifische Zuordnung gefunden. Ein Hausarzt ist meist ein guter erster Ansprechpartner.
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm nv-text-muted">Vorschläge:</span>
                    {symptomSuggestions.map((s) => {
                      const specSlug = {
                        'Hausarzt': 'hausarzt', 'Zahnarzt': 'zahnarzt', 'Kardiologe': 'kardiologe',
                        'Orthopäde': 'orthopaede', 'Hautarzt': 'hautarzt', 'Frauenarzt': 'frauenarzt',
                        'Kinderarzt': 'kinderarzt', 'Augenarzt': 'augenarzt', 'HNO-Arzt': 'hno-arzt',
                        'Urologe': 'urologe', 'Neurologe': 'neurologe', 'Psychiater': 'psychiater',
                        'Psychotherapeut': 'psychotherapeut', 'Radiologe': 'radiologe', 'Internist': 'internist',
                        'Chirurg': 'chirurg', 'Physiotherapeut': 'physiotherapeut',
                      }[s];
                      const href = specSlug ? `/aerzte/fachrichtung/${specSlug}` : `/suche?q=${encodeURIComponent(s)}`;
                      return (
                        <a key={s} href={href} className="nv-chip hover:opacity-90">
                          {s} <ArrowRight className="ml-1 h-3 w-3" />
                        </a>
                      );
                    })}
                  </div>
                )}
                <p className="mt-4 text-[11px] nv-text-muted">
                  Navoria ersetzt keine ärztliche Diagnose. Bei akuten oder lebensbedrohlichen Beschwerden rufen Sie 112.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Häufige Beschwerden — Ratgeber-Pillar-Chips */}
      <section className="nv-surface-white">
        <div className="nv-container nv-section-tight">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--color-navy)' }}>
                <HeartPulse className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                Häufige Beschwerden
              </h2>
              <p className="mt-2 text-[15px] nv-text-muted">
                Welcher Arzt hilft bei welchem Symptom? Redaktionell geprüfte Ratgeber.
              </p>
            </div>
            <a href="/symptome" className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
              Alle Symptome <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SYMPTOMS.map((s) => (
              <a key={s.slug} href={`/symptome/${s.slug}`} className="nv-chip hover:opacity-90">
                {s.label}
                <ArrowRight className="ml-1 h-3 w-3" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Beliebte Fachrichtungen — Karten-Grid */}
      <section className="nv-page-bg">
        <div className="nv-container nv-section">
          <div className="mb-8">
            <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: 'var(--color-navy)' }}>
              Beliebte Fachrichtungen
            </h2>
            <p className="mt-2 text-[15px] nv-text-muted">Häufig gesuchte Facharzt-Kategorien.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {POPULAR_SPECIALTIES.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.name}
                  href={`/aerzte/fachrichtung/${s.slug}`}
                  className="nv-card group flex items-center gap-3 transition hover:-translate-y-0.5"
                  style={{ padding: '1rem' }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-navy)' }}>{s.name}</span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Große Städte — Primary Blue Konversions-Sektion */}
      <section className="nv-surface-primary">
        <div className="nv-container nv-section">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-primary-light)' }}>Direktzugang</p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Ärzte in großen Städten
              </h2>
              <p className="mt-3 text-[16px]" style={{ color: 'var(--color-primary-light)' }}>
                Zu den wichtigsten deutschen Standorten und Fachrichtungen.
              </p>
            </div>
            <a
              href="/aerzte/bundesland"
              className="inline-flex items-center gap-1 text-sm font-semibold text-white hover:underline"
            >
              Nach Bundesland <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {BIG_CITIES.map((c) => (
              <a
                key={c.slug}
                href={`/aerzte/${c.slug}`}
                className="group flex items-center justify-between rounded-xl px-4 py-3.5 transition"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4" style={{ color: 'var(--color-primary-light)' }} />
                  <span className="text-[15px] font-semibold">{c.name}</span>
                </div>
                <ArrowRight className="h-4 w-4 opacity-70 transition group-hover:opacity-100" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* USPs — 3-Spalten Karten */}
      <section className="nv-surface-white">
        <div className="nv-container nv-section">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: 'var(--color-navy)' }}>
              Warum Navoria
            </h2>
            <p className="mt-3 text-[15px] nv-text-muted">
              Übersichtlich, transparent und werbefrei recherchierte Praxis-Profile.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                title: 'Alles auf einer Seite',
                desc: 'Adresse, Telefon, Website, Öffnungszeiten, Bewertungen und Karte — kompakt und übersichtlich pro Praxis.',
              },
              {
                title: 'Datenstand transparent',
                desc: 'Jedes Profil zeigt, wann wir es zuletzt geprüft haben. Kein Rätselraten über veraltete Telefonnummern.',
              },
              {
                title: 'Symptom-Assistent',
                desc: 'Sie wissen nicht, welche Fachrichtung passt? Beschreiben Sie kurz Ihre Beschwerden — wir schlagen passende Ärzte vor.',
              },
            ].map((f) => (
              <div key={f.title} className="nv-card">
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-navy)' }}>{f.title}</h3>
                <p className="mt-2 text-[15px] nv-text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ratgeber-CTA — Soft Panel */}
      <section className="nv-surface-white">
        <div className="nv-container pb-20">
          <div className="nv-panel-soft flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center" style={{ padding: '1.5rem 1.75rem' }}>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-navy)' }}>Patienten-Ratgeber</h3>
                <p className="mt-1 text-[15px] nv-text-muted">
                  Facharzt-Termin schneller bekommen, Zweitmeinung einholen, was zahlt die Kasse — kurz und konkret erklärt.
                </p>
              </div>
            </div>
            <a href="/ratgeber" className="nv-btn nv-btn-primary whitespace-nowrap">
              Ratgeber ansehen <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
