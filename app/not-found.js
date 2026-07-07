import Link from 'next/link';
import { Search, Home, MapPin, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Seite nicht gefunden',
  robots: { index: false, follow: true },
};

const BIG_CITIES = [
  { name: 'Berlin', slug: 'berlin' },
  { name: 'Hamburg', slug: 'hamburg' },
  { name: 'München', slug: 'muenchen' },
  { name: 'Köln', slug: 'koeln' },
  { name: 'Frankfurt', slug: 'frankfurt-am-main' },
  { name: 'Stuttgart', slug: 'stuttgart' },
];

const POPULAR_QUERIES = ['Hausarzt', 'Zahnarzt', 'Kardiologe', 'Orthopäde', 'Hautarzt', 'Kinderarzt'];

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-sky-600">Fehler 404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Diese Seite gibt es nicht.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-600">
          Die gesuchte Praxis existiert nicht mehr oder wurde aus dem Verzeichnis entfernt. Kein Grund zur Sorge – hier geht’s weiter.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700">
            <Home className="h-4 w-4" /> Zur Startseite
          </Link>
          <Link href="/suche" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
            <Search className="h-4 w-4" /> Ärzte suchen
          </Link>
          <Link href="/aerzte" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
            <MapPin className="h-4 w-4" /> Ärzte-Verzeichnis
          </Link>
        </div>
      </div>

      {/* Hilfreiche Einstiege */}
      <div className="mt-16 grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <MapPin className="h-4 w-4 text-sky-600" /> Beliebte Städte
          </h2>
          <ul className="mt-3 space-y-1.5">
            {BIG_CITIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/aerzte/${c.slug}`}
                  className="group inline-flex items-center gap-1 text-sm text-slate-700 hover:text-sky-700"
                >
                  Ärzte in {c.name}
                  <ArrowRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Search className="h-4 w-4 text-sky-600" /> Häufige Suchen
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {POPULAR_QUERIES.map((q) => (
              <li key={q}>
                <Link
                  href={`/suche?q=${encodeURIComponent(q)}`}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                >
                  {q}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="mt-16 text-center text-xs text-slate-400">
        Kein Ersatz für ärztliche Beratung. Bei Notfall 112, bei dringenden Beschwerden 116 117.
      </p>
    </div>
  );
}
