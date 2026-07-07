'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Globe, Phone, MapPin, ExternalLink, RefreshCw, Search, CheckCircle2, Loader2, Copy, Trash2, BadgeCheck, Sparkles, Home } from 'lucide-react';

export default function AdminOhneWebseitePage() {
  const [token, setToken] = useState(null);
  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('navoria_admin_token') : null;
    if (!t) window.location.href = '/admin';
    setToken(t);
  }, []);
  if (!token) return null;
  return <List token={token} />;
}

function List({ token }) {
  const [items, setItems] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [matchCount, setMatchCount] = useState(0);
  const [totals, setTotals] = useState({ total_no_website: 0, unchecked: 0, checked: 0, discarded: 0 });
  const [show, setShow] = useState('unchecked');
  const [cityFilter, setCityFilter] = useState('');
  const [sort, setSort] = useState('reviews'); // 'city' | 'reviews' | 'rating' | 'name'
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const PAGE_SIZE = 100;
  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const load = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ show, sort });
      if (cityFilter) q.set('city', cityFilter);
      q.set('limit', String(PAGE_SIZE));
      q.set('offset', String((page - 1) * PAGE_SIZE));
      const r = await fetch(`/api/admin/doctors-no-website?${q}`, { headers: authHeaders });
      if (r.status === 401) { toast.error('Sitzung abgelaufen'); window.location.href = '/admin'; return; }
      const data = await r.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      setAllCities(Array.isArray(data.all_cities) ? data.all_cities : []);
      setMatchCount(data.match_count || 0);
      setTotals({
        total_no_website: data.total_no_website || 0,
        unchecked: data.unchecked || 0,
        checked: data.checked || 0,
        discarded: data.discarded || 0,
      });
    } catch { toast.error('Fehler beim Laden'); }
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [show, cityFilter, sort, page]);
  // Filter-/View-Wechsel setzt Seite zurück
  useEffect(() => { setPage(1); }, [show, cityFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(matchCount / PAGE_SIZE));

  const toggleChecked = async (doc) => {
    setBusyId(doc.id);
    try {
      // Wenn Homepage-Modus aktiv ist und User "uncheckt", muss zusätzlich Homepage-Mode deaktiviert werden.
      // Der bestehende website-checked-Endpoint macht das nicht → separater Call vorher.
      if (doc.homepage_mode && doc.website_checked_at) {
        const rh = await fetch(`/api/admin/doctors/${doc.id}/homepage`, {
          method: 'POST', headers: authHeaders,
          body: JSON.stringify({ enabled: false }),
        });
        const dh = await rh.json();
        if (!rh.ok) throw new Error(dh.error);
        // Lokal State reflektieren + return: der homepage-Endpoint hat schon alles zurückgesetzt
        toast.success('Homepage-Modus deaktiviert, Praxis zurück auf Standard-Profil');
        if (show === 'checked') setItems((prev) => prev.filter((it) => it.id !== doc.id));
        else setItems((prev) => prev.map((it) => it.id === doc.id ? {
          ...it,
          homepage_mode: false,
          website_checked_at: null,
          is_verified: false,
          verification_method: null,
        } : it));
        setTotals((t) => ({ ...t, unchecked: t.unchecked + 1, checked: Math.max(0, t.checked - 1) }));
        setBusyId(null);
        return;
      }
      const r = await fetch(`/api/admin/doctors/${doc.id}/website-checked`, {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ checked: !doc.website_checked_at }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      toast.success(doc.website_checked_at ? 'Zurückgesetzt' : 'Abgehakt');
      if (show === 'unchecked') setItems((prev) => prev.filter((it) => it.id !== doc.id));
      else if (show === 'checked' && doc.website_checked_at) setItems((prev) => prev.filter((it) => it.id !== doc.id));
      else setItems((prev) => prev.map((it) => it.id === doc.id ? {
        ...it,
        website_checked_at: doc.website_checked_at ? null : new Date().toISOString(),
        // Verifizierung reflektieren (Backend setzt is_verified=true bei check, und
        // entfernt sie beim Uncheck nur, wenn wir sie selbst gesetzt haben)
        is_verified: doc.website_checked_at
          ? (it.verification_method === 'admin_no_website_check' ? false : it.is_verified)
          : true,
        verification_method: doc.website_checked_at
          ? (it.verification_method === 'admin_no_website_check' ? null : it.verification_method)
          : 'admin_no_website_check',
      } : it));
      setTotals((t) => ({
        ...t,
        unchecked: doc.website_checked_at ? t.unchecked + 1 : Math.max(0, t.unchecked - 1),
        checked: doc.website_checked_at ? Math.max(0, t.checked - 1) : t.checked + 1,
      }));
    } catch (err) { toast.error(String(err.message || err)); }
    setBusyId(null);
  };

  // Homepage-Modus für eine Praxis aktivieren (Generate)
  const generateHomepage = async (doc) => {
    if (!confirm(`Homepage-Modus für "${doc.name}" aktivieren?\n\nDas Praxisprofil wird ab sofort als eigenständige One-Page-Website gerendert (statt als Navoria-Directory-Profil). Deaktivierung jederzeit über das Abhaken-Feld möglich.`)) return;
    setBusyId(doc.id);
    try {
      const r = await fetch(`/api/admin/doctors/${doc.id}/homepage`, {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ enabled: true }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      toast.success('Homepage-Modus aktiviert – Profil ist jetzt eine One-Page-Website');
      // Die Praxis fliegt aus "unchecked" raus (weil website_checked_at gesetzt wird)
      if (show === 'unchecked') setItems((prev) => prev.filter((it) => it.id !== doc.id));
      else setItems((prev) => prev.map((it) => it.id === doc.id ? {
        ...it,
        homepage_mode: true,
        website_checked_at: new Date().toISOString(),
        is_verified: true,
        verification_method: 'navoria_homepage',
      } : it));
      setTotals((t) => ({ ...t, unchecked: Math.max(0, t.unchecked - 1), checked: t.checked + 1 }));
    } catch (err) { toast.error(String(err.message || err)); }
    setBusyId(null);
  };

  const discardDoctor = async (doc) => {
    if (!confirm(`Praxis wirklich verwerfen?\n\n"${doc.name}"\n\nSie wird aus dem Verzeichnis, aus der Suche und aus der Sitemap entfernt. Wiederherstellbar über Filter „Verworfen".`)) return;
    setBusyId(doc.id);
    try {
      const r = await fetch(`/api/admin/doctors/${doc.id}/discard`, {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ discarded: true, reason: 'admin_ohne_website' }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      toast.success('Verworfen');
      setItems((prev) => prev.filter((it) => it.id !== doc.id));
      setTotals((t) => ({
        ...t,
        total_no_website: Math.max(0, t.total_no_website - 1),
        unchecked: doc.website_checked_at ? t.unchecked : Math.max(0, t.unchecked - 1),
        checked: doc.website_checked_at ? Math.max(0, t.checked - 1) : t.checked,
        discarded: t.discarded + 1,
      }));
    } catch (err) { toast.error(String(err.message || err)); }
    setBusyId(null);
  };

  const restoreDoctor = async (doc) => {
    setBusyId(doc.id);
    try {
      const r = await fetch(`/api/admin/doctors/${doc.id}/discard`, {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ discarded: false }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      toast.success('Wiederhergestellt');
      setItems((prev) => prev.filter((it) => it.id !== doc.id));
      setTotals((t) => ({
        ...t,
        total_no_website: t.total_no_website + 1,
        unchecked: t.unchecked + 1,
        discarded: Math.max(0, t.discarded - 1),
      }));
    } catch (err) { toast.error(String(err.message || err)); }
    setBusyId(null);
  };

  const filtered = search
    ? items.filter((it) => it.name.toLowerCase().includes(search.toLowerCase()))
    : items;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-sky-700"><ArrowLeft className="h-3 w-3" /> Zurück zum Dashboard</Link>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
            <Globe className="h-6 w-6 text-sky-500" /> Praxen ohne Website
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Insgesamt <strong className="font-semibold text-slate-800">{totals.total_no_website}</strong> Praxen ohne Website ·
            <strong className="mx-1 font-semibold text-amber-700">{totals.unchecked}</strong> noch zu prüfen ·
            <strong className="ml-1 font-semibold text-emerald-700">{totals.checked}</strong> abgehakt ·
            <strong className="ml-1 font-semibold text-slate-500">{totals.discarded}</strong> verworfen
          </p>
          <p className="mt-2 inline-flex items-start gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs text-emerald-800">
            <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              <strong>Neu:</strong> Abhaken markiert die Praxis zusätzlich als <strong>verifiziert</strong> (grüner Badge auf dem Profil, Ranking-Boost in der Suche).
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select value={show} onChange={(e) => setShow(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="unchecked">Zu prüfen ({totals.unchecked})</option>
            <option value="checked">Abgehakt ({totals.checked})</option>
            <option value="discarded">Verworfen ({totals.discarded})</option>
            <option value="all">Aktiv (alle) ({totals.total_no_website})</option>
          </select>
          <button onClick={load} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Aktualisieren
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="mt-4 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nach Praxisname suchen …" className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100" />
        </div>
        {allCities.length > 1 && (
          <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm min-w-[180px]">
            <option value="">Alle Städte ({allCities.length})</option>
            {allCities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm min-w-[190px]"
          title="Sortierung"
        >
          <option value="reviews">🔥 Meiste Bewertungen zuerst</option>
          <option value="rating">⭐ Beste Bewertung zuerst</option>
          <option value="city">📍 Stadt A→Z</option>
          <option value="name">🔤 Name A→Z</option>
        </select>
        {(matchCount > 0 && matchCount !== items.length) && (
          <p className="self-center text-xs text-slate-400">
            Zeige {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, matchCount)} von {matchCount}
          </p>
        )}
      </div>

      {/* Liste */}
      <div className="mt-6 space-y-2">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Wird geladen …</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            {show === 'unchecked' ? '🎉 Alles abgehakt. Keine offenen Praxen mehr.' : 'Keine Einträge in diesem Filter.'}
          </div>
        ) : filtered.map((doc) => {
          const isChecked = !!doc.website_checked_at;
          const isDiscarded = doc.is_active === false;
          const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(doc.name + ' ' + (doc.city || '') + ' website')}`;
          const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/praxis/${doc.city_slug}/${doc.slug}` : `/praxis/${doc.city_slug}/${doc.slug}`;
          return (
            <div key={doc.id} className={`rounded-xl border p-4 transition ${isDiscarded ? 'border-slate-200 bg-slate-100/60 opacity-70' : isChecked ? 'border-emerald-100 bg-emerald-50/40' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              <div className="flex flex-wrap items-start gap-4">
                {/* Checkbox (nicht bei verworfenen) */}
                {!isDiscarded && (
                  <button
                    onClick={() => toggleChecked(doc)}
                    disabled={busyId === doc.id}
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${isChecked ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white hover:border-emerald-400'} disabled:opacity-50`}
                    aria-label={isChecked ? 'Wieder öffnen' : 'Als geprüft markieren'}
                    title={isChecked ? `Abgehakt am ${new Date(doc.website_checked_at).toLocaleDateString('de-DE')}` : 'Als geprüft markieren'}
                  >
                    {busyId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : isChecked ? <CheckCircle2 className="h-4 w-4" /> : null}
                  </button>
                )}
                {isDiscarded && (
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-rose-500" title="Verworfen">
                    <Trash2 className="h-4 w-4" />
                  </div>
                )}

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Link href={`/praxis/${doc.city_slug}/${doc.slug}`} target="_blank" className={`font-semibold hover:text-sky-700 ${isChecked || isDiscarded ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                      {doc.name}
                    </Link>
                    {doc.specialty_guess && <span className="rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">{doc.specialty_guess}</span>}
                    {doc.city && <span className="text-xs text-slate-500">{doc.city}</span>}
                    {doc.is_verified && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800"
                        title={doc.verification_method === 'admin_no_website_check' ? 'Verifiziert durch Abhaken auf dieser Seite' : doc.verification_method === 'navoria_homepage' ? 'Verifiziert durch Homepage-Modus' : 'Verifiziert'}
                      >
                        <BadgeCheck className="h-3 w-3" /> Verifiziert
                      </span>
                    )}
                    {doc.homepage_mode && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-800"
                        title="Praxisprofil wird als eigenständige One-Page-Homepage gerendert"
                      >
                        <Home className="h-3 w-3" /> Homepage-Modus
                      </span>
                    )}
                    {doc.rating != null && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800"
                        title={`Google-Bewertung: ${Number(doc.rating).toFixed(1)} · ${doc.user_rating_count || 0} Rezensionen`}
                      >
                        ⭐ {Number(doc.rating).toFixed(1)}
                        {doc.user_rating_count != null && (
                          <span className="text-amber-700/70">({doc.user_rating_count})</span>
                        )}
                      </span>
                    )}
                    {isDiscarded && <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700">verworfen</span>}
                  </div>
                  {doc.formatted_address && (
                    <p className="mt-1 flex items-start gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3 shrink-0 mt-0.5" /> {doc.formatted_address}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    {doc.phone_national && (
                      <a href={`tel:${doc.phone_national}`} className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-600 hover:bg-slate-50">
                        <Phone className="h-3 w-3" /> {doc.phone_national}
                      </a>
                    )}
                    {doc.google_maps_url && (
                      <a href={doc.google_maps_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800">
                        <ExternalLink className="h-3 w-3" /> Google Maps Eintrag
                      </a>
                    )}
                    <a href={googleSearchUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800">
                      <Search className="h-3 w-3" /> Google-Suche
                    </a>
                    <button
                      onClick={() => { navigator.clipboard.writeText(profileUrl); toast.success('Navoria-Profil-URL kopiert'); }}
                      className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-2 py-1 font-medium text-sky-800 hover:bg-sky-100"
                      title={profileUrl}
                    >
                      <Copy className="h-3 w-3" /> Navoria-URL kopieren
                    </button>
                    {doc.name && (
                      <button
                        onClick={() => { navigator.clipboard.writeText(doc.name); toast.success('Name kopiert'); }}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-500 hover:bg-slate-50"
                      >
                        <Copy className="h-3 w-3" /> Name
                      </button>
                    )}
                    {!isDiscarded && !doc.homepage_mode && (
                      <button
                        disabled={busyId === doc.id}
                        onClick={() => generateHomepage(doc)}
                        className="inline-flex items-center gap-1 rounded-md border border-purple-300 bg-gradient-to-br from-purple-50 to-fuchsia-50 px-2 py-1 font-semibold text-purple-800 shadow-sm transition hover:from-purple-100 hover:to-fuchsia-100 disabled:opacity-50"
                        title="Praxisprofil als eigenständige Homepage rendern"
                      >
                        <Sparkles className="h-3 w-3" /> Generate Homepage
                      </button>
                    )}
                    {!isDiscarded && doc.homepage_mode && (
                      <Link
                        href={`/praxis/${doc.city_slug}/${doc.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-md border border-purple-300 bg-purple-50 px-2 py-1 font-semibold text-purple-800 hover:bg-purple-100"
                        title="Homepage-Preview öffnen"
                      >
                        <Home className="h-3 w-3" /> Homepage ansehen <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                    {!isDiscarded && (
                      <button
                        disabled={busyId === doc.id}
                        onClick={() => discardDoctor(doc)}
                        className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-2 py-1 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                        title="Aus dem Verzeichnis entfernen"
                      >
                        <Trash2 className="h-3 w-3" /> Verwerfen
                      </button>
                    )}
                    {isDiscarded && (
                      <button
                        disabled={busyId === doc.id}
                        onClick={() => restoreDoctor(doc)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        <RefreshCw className="h-3 w-3" /> Wiederherstellen
                      </button>
                    )}
                  </div>

                  {isChecked && !isDiscarded && (
                    <p className="mt-2 text-xs text-emerald-700">
                      Als geprüft markiert am {new Date(doc.website_checked_at).toLocaleDateString('de-DE')}
                    </p>
                  )}
                  {isDiscarded && doc.discarded_at && (
                    <p className="mt-2 text-xs text-rose-700">
                      Verworfen am {new Date(doc.discarded_at).toLocaleDateString('de-DE')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">
            Seite <b>{page}</b> von <b>{totalPages}</b>
            <span className="ml-2 text-xs text-slate-400">({matchCount} Praxen gesamt)</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1 || loading}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              « Erste
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              ‹ Zurück
            </button>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={page}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!Number.isNaN(v) && v >= 1 && v <= totalPages) setPage(v);
              }}
              className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Weiter ›
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages || loading}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Letzte »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
