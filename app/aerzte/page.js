import Link from 'next/link';
import { getCollection } from '@/lib/mongodb';
import { SPECIALTIES } from '@/lib/specialties';
import { MapPin, Stethoscope, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Ärzte finden nach Stadt und Fachrichtung',
  description: 'Übersicht aller Standorte und Fachrichtungen bei Navoria. Ihr direkter Einstieg zur passenden Praxis in Deutschland.',
  alternates: { canonical: '/aerzte' },
};

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export default async function AerzteHubPage() {
  const citiesCol = await getCollection('cities');
  const cities = await citiesCol.find({ doctor_count: { $gt: 0 } }).sort({ doctor_count: -1 }).limit(60).toArray();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link> <span>/</span> <span className="text-slate-700">Ärzte</span>
      </nav>
      <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Ärzte finden in Deutschland</h1>
      <p className="mt-3 max-w-2xl text-slate-600">Direkteinstieg nach Stadt oder Fachrichtung. Alle Angaben aus öffentlichen Quellen.</p>

      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900"><MapPin className="h-5 w-5 text-sky-600" /> Nach Stadt</h2>
        {cities.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Noch keine Städte verfügbar. Im Adminbereich können Daten importiert werden.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {cities.map((c) => (
              <Link key={c.slug} href={`/aerzte/${c.slug}`} className="card-soft group p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">{c.name}</span>
                  <span className="chip text-[10px]">{c.doctor_count}</span>
                </div>
                <span className="mt-1 flex items-center text-xs text-sky-700 opacity-0 transition group-hover:opacity-100">Ärzte ansehen <ArrowRight className="ml-1 h-3 w-3" /></span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-14">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900"><Stethoscope className="h-5 w-5 text-sky-600" /> Nach Fachrichtung</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {SPECIALTIES.map((s) => (
            <Link key={s.slug} href={`/aerzte/fachrichtung/${s.slug}`} className="card-soft p-4 transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="text-sm font-medium text-slate-900">{s.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
