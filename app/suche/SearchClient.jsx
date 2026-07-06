'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Search, MapPin, Star, Phone, Globe, ExternalLink, Filter, Loader2, ArrowRight, List, Map as MapIcon } from 'lucide-react';
import RatingBadge from '@/components/RatingBadge';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false, loading: () => <div className="card-soft flex h-[600px] items-center justify-center text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Karte lädt …</div> });

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
  const [view, setView] = useState('list');

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
    params.set('limit', '100');
    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setResults(data.results || []);
      setTotal(data.total || 0);
    } catch { setResults([]); setTotal(0); }
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
        <aside className="card-soft h-fit p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Filter className="h-4 w-4" /> Filter</div>
          <div className="mt-5 space-y-5">
            <div>
              <label className="label">Sortierung</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="input mt-1.5">
                <option value="relevance">Relevanz</option>
                <option value="completeness">Profil-Vollständigkeit</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={withWebsite} onChange={(e) => setWithWebsite(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-sky-600" /> Mit Website
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={withPhone} onChange={(e) => setWithPhone(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-sky-600" /> Mit Telefonnummer
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={hasHours} onChange={(e) => setHasHours(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-sky-600" /> Mit Öffnungszeiten
              </label>
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              {loading ? 'Suche läuft …' : (<><span className="font-semibold text-slate-900">{total}</span> Treffer{q && <> für „<span className="text-slate-900">{q}</span>“</>}{ort && <> in <span className="text-slate-900">{ort}</span></>}</>)}
            </p>
            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
              <button onClick={() => setView('list')} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${view === 'list' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><List className="h-4 w-4" /> Liste</button>
              <button onClick={() => setView('map')} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${view === 'map' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><MapIcon className="h-4 w-4" /> Karte</button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Lade Ergebnisse …</div>
          ) : results.length === 0 ? (
            <div className="card-soft p-10 text-center">
              <h3 className="text-lg font-semibold text-slate-900">Keine Ergebnisse gefunden</h3>
              <p className="mt-1 text-sm text-slate-600">Passen Sie Ihre Suche an oder importieren Sie im Adminbereich neue Daten.</p>
            </div>
          ) : view === 'map' ? (
            <MapView doctors={results} />
          ) : (
            <>
              <div className="space-y-3">{results.map((d) => <ResultCard key={d.google_place_id} d={d} />)}</div>
              {results.some((d) => d.rating != null && d.user_rating_count > 0) && (
                <p className="mt-6 text-[11px] text-slate-400">Bewertungen von Google (öffentliche Google-Rezensionen)</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultCard({ d }) {
  const cityPath = d.city_slug || 'stadt';
  return (
    <article className="card-soft p-4 sm:p-5 transition hover:shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 break-words">
              <a href={`/praxis/${cityPath}/${d.slug}`} className="hover:text-sky-700">{d.name}</a>
            </h3>
            {d.specialty_guess && <span className="chip border-sky-100 bg-sky-50 text-sky-700">{d.specialty_guess}</span>}
            {d.is_verified && <span className="chip border-emerald-100 bg-emerald-50 text-emerald-700">verifiziert</span>}
            {d.rating != null && d.user_rating_count > 0 && (
              <RatingBadge rating={d.rating} count={d.user_rating_count} size="sm" />
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600 break-words">{d.formatted_address || [d.street, d.postal_code, d.city].filter(Boolean).join(', ')}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {(d.phone_national || d.phone_international) && (
              <a href={`tel:${d.phone_international || d.phone_national}`} className="flex items-center gap-1 text-slate-600 hover:text-sky-700 break-all"><Phone className="h-4 w-4 shrink-0" /> {d.phone_national || d.phone_international}</a>
            )}
            {d.website_url && (
              <a href={d.website_url} target="_blank" rel="nofollow noopener noreferrer" className="flex items-center gap-1 text-slate-600 hover:text-sky-700"><Globe className="h-4 w-4" /> Website</a>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-row gap-2 sm:flex-col sm:items-end">
          <a href={`/praxis/${cityPath}/${d.slug}`} className="btn-secondary flex-1 sm:flex-none">Profil <ArrowRight className="ml-1 h-4 w-4" /></a>
          {d.google_maps_url && (
            <a href={d.google_maps_url} target="_blank" rel="noreferrer" className="btn-secondary flex-1 sm:flex-none"><ExternalLink className="mr-1 h-4 w-4" /> Route</a>
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
