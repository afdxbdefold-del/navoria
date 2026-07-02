'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, MapPin, Star, Phone, Globe, ExternalLink, Filter, Loader2, ArrowRight } from 'lucide-react';

function SearchContent() {
  const sp = useSearchParams();
  const router = useRouter();

  const [q, setQ] = useState(sp.get('q') || '');
  const [ort, setOrt] = useState(sp.get('ort') || '');
  const [sort, setSort] = useState('relevance');
  const [minRating, setMinRating] = useState(0);
  const [minReviews, setMinReviews] = useState(0);
  const [withWebsite, setWithWebsite] = useState(false);
  const [withPhone, setWithPhone] = useState(false);
  const [hasHours, setHasHours] = useState(false);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);

  const runSearch = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (ort) params.set('ort', ort);
    params.set('sort', sort);
    if (minRating) params.set('minRating', String(minRating));
    if (minReviews) params.set('minReviews', String(minReviews));
    if (withWebsite) params.set('withWebsite', '1');
    if (withPhone) params.set('withPhone', '1');
    if (hasHours) params.set('hasHours', '1');
    params.set('limit', '30');
    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setResults(data.results || []);
      setTotal(data.total || 0);
    } catch (e) {
      setResults([]); setTotal(0);
    }
    setLoading(false);
  };

  useEffect(() => { runSearch(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { runSearch(); /* eslint-disable-next-line */ }, [sort, minRating, minReviews, withWebsite, withPhone, hasHours]);

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (ort) params.set('ort', ort);
    router.replace(`/suche?${params.toString()}`);
    runSearch();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Search bar */}
      <form onSubmit={submit} className="card-soft p-3 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Suchbegriff" className="input pl-9" />
          </div>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={ort} onChange={(e) => setOrt(e.target.value)} placeholder="Ort oder PLZ" className="input pl-9" />
          </div>
          <button className="btn-primary">Suchen</button>
        </div>
      </form>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Filter */}
        <aside className="card-soft h-fit p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Filter className="h-4 w-4" /> Filter</div>

          <div className="mt-5 space-y-5">
            <div>
              <label className="label">Sortierung</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="input mt-1.5">
                <option value="relevance">Relevanz</option>
                <option value="rating">Bewertung</option>
                <option value="reviews">Anzahl Bewertungen</option>
                <option value="completeness">Profil-Vollständigkeit</option>
              </select>
            </div>
            <div>
              <label className="label">Mindest-Bewertung</label>
              <select value={minRating} onChange={(e) => setMinRating(parseFloat(e.target.value))} className="input mt-1.5">
                <option value="0">Alle</option>
                <option value="3">3.0+</option>
                <option value="4">4.0+</option>
                <option value="4.5">4.5+</option>
              </select>
            </div>
            <div>
              <label className="label">Min. Anzahl Bewertungen</label>
              <select value={minReviews} onChange={(e) => setMinReviews(parseInt(e.target.value, 10))} className="input mt-1.5">
                <option value="0">Alle</option>
                <option value="5">5+</option>
                <option value="20">20+</option>
                <option value="50">50+</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={withWebsite} onChange={(e) => setWithWebsite(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-sky-600" />
                Mit Website
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={withPhone} onChange={(e) => setWithPhone(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-sky-600" />
                Mit Telefonnummer
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={hasHours} onChange={(e) => setHasHours(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-sky-600" />
                Mit Öffnungszeiten
              </label>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              {loading ? 'Suche läuft …' : (
                <>
                  <span className="font-semibold text-slate-900">{total}</span> Treffer
                  {q && <> für „<span className="text-slate-900">{q}</span>“</>}
                  {ort && <> in <span className="text-slate-900">{ort}</span></>}
                </>
              )}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Lade Ergebnisse …</div>
          ) : results.length === 0 ? (
            <div className="card-soft p-10 text-center">
              <h3 className="text-lg font-semibold text-slate-900">Keine Ergebnisse gefunden</h3>
              <p className="mt-1 text-sm text-slate-600">Passen Sie Ihre Suche an oder importieren Sie im Adminbereich neue Daten.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((d) => (
                <ResultCard key={d.id} d={d} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultCard({ d }) {
  const cityPath = d.city_slug || 'stadt';
  return (
    <article className="card-soft p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-slate-900">
              <a href={`/praxis/${cityPath}/${d.slug}`} className="hover:text-sky-700">{d.name}</a>
            </h3>
            {d.specialty_guess && (
              <span className="chip border-sky-100 bg-sky-50 text-sky-700">{d.specialty_guess}</span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {d.formatted_address || [d.street, d.postal_code, d.city].filter(Boolean).join(', ')}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {d.rating != null && (
              <span className="flex items-center gap-1 text-amber-600">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="font-semibold text-slate-800">{d.rating.toFixed(1)}</span>
                <span className="text-slate-500">({d.user_rating_count || 0} Bewertungen)</span>
              </span>
            )}
            {(d.phone_national || d.phone_international) && (
              <a href={`tel:${d.phone_international || d.phone_national}`} className="flex items-center gap-1 text-slate-600 hover:text-sky-700">
                <Phone className="h-4 w-4" /> {d.phone_national || d.phone_international}
              </a>
            )}
            {d.website_url && (
              <a href={d.website_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-slate-600 hover:text-sky-700">
                <Globe className="h-4 w-4" /> Website
              </a>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <a href={`/praxis/${cityPath}/${d.slug}`} className="btn-secondary">
            Profil <ArrowRight className="ml-1 h-4 w-4" />
          </a>
          {d.google_maps_url && (
            <a href={d.google_maps_url} target="_blank" rel="noreferrer" className="btn-secondary">
              <ExternalLink className="mr-1 h-4 w-4" /> Route
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Lade …</div>}>
      <SearchContent />
    </Suspense>
  );
}
