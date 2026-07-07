import { Suspense } from 'react';
import Link from 'next/link';
import { BadgeCheck, ShieldCheck, Info, ArrowRight, Mail } from 'lucide-react';
import { getCollection } from '@/lib/mongodb';
import ClaimForm from './ClaimForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Praxisprofil beanspruchen – Verifizierung für Praxisinhaber',
  description: 'Als Praxisinhaber:in Ihr Navoria-Profil verifizieren, Angaben korrigieren und um Zusatzinformationen ergänzen. Kostenlos.',
  alternates: { canonical: '/praxis-beanspruchen' },
  robots: { index: true, follow: true },
};

async function loadDoctor(doctorId) {
  if (!doctorId) return null;
  try {
    const col = await getCollection('doctor_places');
    return await col.findOne(
      { id: doctorId, is_active: { $ne: false } },
      { projection: { id: 1, name: 1, slug: 1, city_slug: 1, city: 1, formatted_address: 1, specialty_guess: 1 } }
    );
  } catch { return null; }
}

export default async function PraxisBeanspruchenPage({ searchParams }) {
  const sp = await searchParams;
  const doctorId = typeof sp?.doctor_id === 'string' ? sp.doctor_id : null;
  const doctor = await loadDoctor(doctorId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-700">Start</Link>
        <span aria-hidden="true">/</span>
        <span className="text-slate-700">Profil beanspruchen</span>
      </nav>

      <header>
        <div className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
          <BadgeCheck className="h-3 w-3" aria-hidden="true" /> Verifizierung für Praxisinhaber
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Praxisprofil beanspruchen
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-700">
          Sie sind Inhaber:in oder autorisierte Ansprechperson einer auf Navoria gelisteten Praxis? Beanspruchen Sie hier das Profil und lassen Sie es als geprüft markieren.
        </p>
      </header>

      {/* Was passiert – 3-Schritte */}
      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { n: '1', title: 'Formular ausfüllen', desc: 'Kurz Ihre Kontaktdaten & Rolle in der Praxis angeben.' },
          { n: '2', title: 'Wir prüfen', desc: 'Innerhalb von 5 Werktagen kontaktieren wir Sie zur Verifizierung.' },
          { n: '3', title: 'Profil verifiziert', desc: 'Nach Freigabe erscheint ein „verifiziert"-Siegel und Sie können Angaben pflegen.' },
        ].map((s) => (
          <div key={s.n} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">{s.n}</div>
            <h3 className="mt-2 text-sm font-semibold text-slate-900">{s.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{s.desc}</p>
          </div>
        ))}
      </section>

      {/* Ausgewählte Praxis */}
      {doctor && (
        <section className="mt-8 rounded-xl border border-sky-200 bg-sky-50/50 p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">Ihre Praxis</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">{doctor.name}</div>
          {doctor.formatted_address && <div className="mt-0.5 text-sm text-slate-600">{doctor.formatted_address}</div>}
          {doctor.specialty_guess && <div className="mt-1 text-xs text-slate-500">Fachrichtung: {doctor.specialty_guess}</div>}
          <Link href={`/praxis/${doctor.city_slug}/${doctor.slug}`} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:text-sky-800">
            Zum aktuellen Profil <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </section>
      )}

      {!doctor && doctorId && (
        <section className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Info className="mr-1 inline h-4 w-4 -translate-y-0.5" aria-hidden="true" />
          Die angegebene Praxis wurde nicht gefunden. Bitte verwenden Sie den Button auf der jeweiligen Praxisseite oder tragen Sie den Praxisnamen im Formular ein.
        </section>
      )}

      {/* Formular */}
      <Suspense fallback={<div className="mt-10 h-40 animate-pulse rounded-xl bg-slate-100" />}>
        <ClaimForm doctor={doctor ? { id: doctor.id, name: doctor.name, city: doctor.city } : null} />
      </Suspense>

      {/* Trust */}
      <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Was wir mit Ihren Daten machen</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Ihre Kontaktdaten verwenden wir ausschließlich zur Verifizierung der Beanspruchung und zur Rückmeldung. Wir geben sie nicht an Dritte weiter. Details in unserer <Link href="/datenschutz" className="text-sky-700 underline underline-offset-2 hover:text-sky-800">Datenschutzerklärung</Link>.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Kontakt zur Redaktion: <a href="mailto:mail@navoria.de" className="text-sky-700 underline underline-offset-2 hover:text-sky-800"><Mail className="mr-1 inline h-3.5 w-3.5 -translate-y-0.5" aria-hidden="true" />mail@navoria.de</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
