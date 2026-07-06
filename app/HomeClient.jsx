'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Stethoscope, Heart, Baby, Smile, Eye, Ear, Bone, Brain, Sparkles, ArrowRight, ShieldCheck, Info } from 'lucide-react';

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
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-sky-100 via-teal-50 to-transparent blur-3xl" />
        </div>
        <div className="mx-auto max-w-5xl px-4 pt-16 pb-10 text-center sm:px-6 sm:pt-24">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/70 px-3 py-1 text-xs font-medium text-sky-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Für Patienten gemacht
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Ihr nächster Arzt. <span className="bg-gradient-to-r from-sky-600 to-teal-500 bg-clip-text text-transparent">Ohne Umwege.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            Adresse, Telefon, Öffnungszeiten und Bewertungen – alles auf einer Seite. Übersichtlich und aktuell.
          </p>

          {/* Suchbox */}
          <form onSubmit={submit} className="card-soft mt-8 mx-auto max-w-3xl p-3 sm:p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Was suchen Sie? z.B. Hausarzt, Kardiologe"
                  className="input pl-9"
                />
              </div>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={ort}
                  onChange={(e) => setOrt(e.target.value)}
                  placeholder="Ort oder PLZ"
                  className="input pl-9"
                />
              </div>
              <button type="submit" className="btn-primary whitespace-nowrap">
                Ärzte finden <ArrowRight className="ml-1.5 h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Info className="h-3.5 w-3.5" /> Keine medizinische Diagnose. Bei Notfall 112.
          </div>
        </div>
      </section>

      {/* Symptom Assistent */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="card-soft bg-gradient-to-br from-white to-sky-50/40 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-sky-700">
            <Sparkles className="h-4 w-4" /> Symptom-Assistent
          </div>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Sagen Sie uns, was fehlt. Wir sagen Ihnen, wer hilft.</h2>
          <p className="mt-1 text-sm text-slate-600">Kein Fachbegriff nötig – einfach Beschwerden eintippen, wir finden die passende Fachrichtung.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              placeholder="z.B. Rückenschmerzen, Herzrasen, Hautausschlag"
              className="input"
            />
          </div>
          {suggestLoading && <p className="mt-3 text-xs text-slate-500">Suche Fachrichtungen …</p>}
          {symptomSuggestions !== null && !suggestLoading && (
            <div className="mt-4">
              {symptomSuggestions.length === 0 ? (
                <p className="text-sm text-slate-500">Keine spezifische Zuordnung gefunden. Ein Hausarzt ist meist ein guter erster Ansprechpartner.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-slate-600">Vorschläge:</span>
                  {symptomSuggestions.map((s) => {
                    // Symptom-Vorschlag → Pillar-Seite wenn Slug bekannt, sonst Fallback in Suche
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
                      <a key={s} href={href} className="chip border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100">
                        {s} <ArrowRight className="ml-1 h-3 w-3" />
                      </a>
                    );
                  })}
                </div>
              )}
              <p className="mt-4 text-[11px] text-slate-400">Navoria ersetzt keine ärztliche Diagnose. Bei akuten oder lebensbedrohlichen Beschwerden rufen Sie 112.</p>
            </div>
          )}
        </div>
      </section>

      {/* Beliebte Fachrichtungen */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Beliebte Fachrichtungen</h2>
            <p className="text-sm text-slate-500">Häufig gesuchte Facharzt-Kategorien.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {POPULAR_SPECIALTIES.map((s) => {
            const Icon = s.icon;
            return (
              <a key={s.name} href={`/aerzte/fachrichtung/${s.slug}`} className="card-soft group flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition group-hover:bg-sky-100">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-slate-800">{s.name}</span>
              </a>
            );
          })}
        </div>
      </section>

      {/* Große Städte */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">Ärzte in großen Städten</h2>
          <p className="text-sm text-slate-500">Direktzugang zu den wichtigsten deutschen Standorten.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {BIG_CITIES.map((c) => (
            <a key={c.slug} href={`/aerzte/${c.slug}`} className="chip hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700">
              <MapPin className="mr-1 h-3 w-3" /> {c.name}
            </a>
          ))}
        </div>
      </section>

      {/* USPs */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: 'Alles auf einer Seite', desc: 'Adresse, Telefon, Website, Öffnungszeiten, Bewertungen und Karte – kompakt und übersichtlich pro Praxis.' },
            { title: 'Datenstand transparent', desc: 'Jedes Profil zeigt, wann wir es zuletzt geprüft haben. Kein Rätselraten über veraltete Telefonnummern.' },
            { title: 'Symptom-Assistent', desc: 'Sie wissen nicht, welche Fachrichtung passt? Beschreiben Sie kurz Ihre Beschwerden – wir schlagen passende Ärzte vor.' },
          ].map((f) => (
            <div key={f.title} className="card-soft p-6">
              <h3 className="text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
