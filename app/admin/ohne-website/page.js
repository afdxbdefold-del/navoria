'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Globe, Phone, MapPin, ExternalLink, RefreshCw, Search, CheckCircle2, Circle, Loader2, Copy } from 'lucide-react';

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
  const [totals, setTotals] = useState({ total_no_website: 0, unchecked: 0, checked: 0 });
  const [show, setShow] = useState('unchecked');
  const [cityFilter, setCityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [urlDraft, setUrlDraft] = useState({}); // { doctorId: 'https://...' }

  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/doctors-no-website?show=${show}`, { headers: authHeaders });
      if (r.status === 401) { toast.error('Sitzung abgelaufen'); window.location.href = '/admin'; return; }
      const data = await r.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      setTotals({
        total_no_website: data.total_no_website || 0,
        unchecked: data.unchecked || 0,
        checked: data.checked || 0,
      });
    } catch { toast.error('Fehler beim Laden'); }
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [show]);

  const toggleChecked = async (doc, saveUrl = false) => {
    setBusyId(doc.id);
    const url = saveUrl ? (urlDraft[doc.id] || '').trim() : null;
    try {
      const r = await fetch(`/api/admin/doctors/${doc.id}/website-checked`, {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ checked: !doc.website_checked_at, ...(url && { website_url: url }) }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      if (url) toast.success(`Website gespeichert für ${doc.name}`);
      else toast.success(doc.website_checked_at ? 'Zurückgesetzt' : 'Abgehakt');
      // Optimistisch aktualisieren – bei "unchecked"-View filtern wir raus
      if (show === 'unchecked') setItems((prev) => prev.filter((it) => it.id !== doc.id));
      else if (show === 'checked' && doc.website_checked_at) setItems((prev) => prev.filter((it) => it.id !== doc.id));
      else setItems((prev) => prev.map((it) => it.id === doc.id ? { ...it, website_checked_at: doc.website_checked_at ? null : new Date().toISOString() } : it));
      setTotals((t) => ({
        ...t,
        unchecked: doc.website_checked_at ? t.unchecked + 1 : Math.max(0, t.unchecked - 1),
        checked: doc.website_checked_at ? Math.max(0, t.checked - 1) : t.checked + 1,
      }));
      if (saveUrl) setUrlDraft((prev) => ({ ...prev, [doc.id]: '' }));
    } catch (err) { toast.error(String(err.message || err)); }
    setBusyId(null);
  };

  const cities = [...new Set(items.map((i) => i.city).filter(Boolean))].sort();
  const filtered = items.filter((it) => {
    if (cityFilter && it.city !== cityFilter) return false;
    if (search && !it.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
            <strong className="ml-1 font-semibold text-emerald-700">{totals.checked}</strong> bereits abgehakt
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select value={show} onChange={(e) => setShow(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="unchecked">Zu prüfen ({totals.unchecked})</option>
            <option value="checked">Bereits abgehakt ({totals.checked})</option>
            <option value="all">Alle ({totals.total_no_website})</option>
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
        {cities.length > 1 && (
          <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="">Alle Städte</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
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
          const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(doc.name + ' ' + (doc.city || '') + ' website')}`;
          return (
            <div key={doc.id} className={`rounded-xl border p-4 transition ${isChecked ? 'border-emerald-100 bg-emerald-50/40' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              <div className="flex flex-wrap items-start gap-4">
                {/* Checkbox */}
                <button
                  onClick={() => toggleChecked(doc)}
                  disabled={busyId === doc.id}
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${isChecked ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white hover:border-emerald-400'} disabled:opacity-50`}
                  aria-label={isChecked ? 'Wieder öffnen' : 'Als geprüft markieren'}
                  title={isChecked ? `Abgehakt am ${new Date(doc.website_checked_at).toLocaleDateString('de-DE')}` : 'Als geprüft markieren'}
                >
                  {busyId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : isChecked ? <CheckCircle2 className="h-4 w-4" /> : null}
                </button>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Link href={`/praxis/${doc.city_slug}/${doc.slug}`} target="_blank" className={`font-semibold hover:text-sky-700 ${isChecked ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                      {doc.name}
                    </Link>
                    {doc.specialty_guess && <span className="rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">{doc.specialty_guess}</span>}
                    {doc.city && <span className="text-xs text-slate-500">{doc.city}</span>}
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
                    {doc.name && (
                      <button
                        onClick={() => { navigator.clipboard.writeText(doc.name); toast.success('Name kopiert'); }}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-500 hover:bg-slate-50"
                      >
                        <Copy className="h-3 w-3" /> Name
                      </button>
                    )}
                  </div>

                  {/* Optional: Website direkt eintragen */}
                  {!isChecked && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <input
                        type="url"
                        value={urlDraft[doc.id] || ''}
                        onChange={(e) => setUrlDraft((p) => ({ ...p, [doc.id]: e.target.value }))}
                        placeholder="Falls Website gefunden: URL hier eintragen …"
                        className="flex-1 min-w-[240px] rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                      />
                      <button
                        disabled={busyId === doc.id || !urlDraft[doc.id]?.trim()}
                        onClick={() => toggleChecked(doc, true)}
                        className="inline-flex items-center gap-1 rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
                      >
                        Speichern &amp; abhaken
                      </button>
                    </div>
                  )}

                  {isChecked && (
                    <p className="mt-2 text-xs text-emerald-700">
                      Als geprüft markiert am {new Date(doc.website_checked_at).toLocaleDateString('de-DE')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
