import Link from 'next/link';
import { getCollection } from '@/lib/mongodb';
import { SPECIALTIES } from '@/lib/specialties';
import { contentForSlug } from '@/lib/specialtyContent';
import { Stethoscope, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Fachrichtungen – Ärzte-Ratgeber und Verzeichnis',
  description: 'Ratgeber und Verzeichnis für alle in Deutschland vertretenen Fachrichtungen – von Hausarzt und Zahnarzt bis Kardiologie, Neurologie und Radiologie. Redaktionell geprüft.',
  alternates: { canonical: '/aerzte/fachrichtung' },
};

export const dynamic = 'force-dynamic';
export const revalidate = 600;

const SPECIFIC_PRIMARY_TYPES = new Set(['dentist', 'dental_clinic', 'pharmacy', 'hospital', 'general_hospital', 'physiotherapist']);

async function loadCounts() {
  const col = await getCollection('doctor_places');
  const counts = {};
  await Promise.all(SPECIALTIES.map(async (s) => {
    const orFilters = [{ specialty_guess: s.label }];
    if (s.placeType && SPECIFIC_PRIMARY_TYPES.has(s.placeType)) {
      orFilters.push({ primary_type: s.placeType });
    }
    counts[s.slug] = await col.countDocuments({ is_active: { $ne: false }, $or: orFilters });
  }));
  return counts;
}

export default async function FachrichtungIndex() {
  const counts = await loadCounts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <nav className="mb-6 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link> <span>/</span>
        <Link href="/aerzte" className="hover:text-sky-700"> Ärzte</Link> <span>/</span>
        <span className="text-slate-700">Fachrichtungen</span>
      </nav>

      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        Ärzte-Fachrichtungen im Überblick
      </h1>
      <p className="mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">
        Ratgeber, Aufgabenbereiche und Praxis-Verzeichnis für die 19 wichtigsten Fachrichtungen in Deutschland.
        Jede Seite erklärt kompakt: wer die Fachrichtung ausübt, wann Sie hingehen sollten und wo Sie eine Praxis in Ihrer Nähe finden.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {SPECIALTIES.map((s) => {
          const c = contentForSlug(s.slug);
          const count = counts[s.slug] || 0;
          return (
            <Link
              key={s.slug}
              href={`/aerzte/fachrichtung/${s.slug}`}
              className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-100">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-900 group-hover:text-sky-700">{s.plural}</h2>
                  {count > 0 && (
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500">
                      {count}
                    </span>
                  )}
                </div>
                {c?.subline && (
                  <p className="mt-1 text-sm leading-snug text-slate-600 line-clamp-2">{c.subline}</p>
                )}
                <span className="mt-2 inline-flex items-center text-xs font-medium text-sky-700 opacity-0 transition group-hover:opacity-100">
                  Zum Ratgeber <ArrowRight className="ml-1 h-3 w-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
