'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Search, Save, ArrowLeft, ShieldCheck, Star, Phone, Globe } from 'lucide-react';
import { toast } from 'sonner';

const SPECIALTY_OPTIONS = [
  '', 'Hausarzt', 'Zahnarzt', 'Kardiologe', 'Orthopäde', 'Hautarzt', 'Frauenarzt', 'Kinderarzt',
  'Augenarzt', 'HNO-Arzt', 'Urologe', 'Neurologe', 'Psychiater', 'Psychotherapeut',
  'Radiologe', 'Internist', 'Chirurg', 'Physiotherapeut', 'Apotheke', 'Krankenhaus', 'Arzt',
];

export default function AdminDoctorsPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [q, setQ] = useState('');
  const [ort, setOrt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [editing, setEditing] = useState({}); // id -> { specialty_guess, is_verified, is_active }
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('navoria_admin_token') : null;
    if (!t) { router.push('/admin'); return; }
    setToken(t);
  }, [router]);

  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const search = async () => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (ort) params.set('ort', ort);
    params.set('limit', '100');
    try {
      const r = await fetch(`/api/admin/doctors?${params.toString()}`, { headers: authHeaders });
      if (r.status === 401) { localStorage.removeItem('navoria_admin_token'); router.push('/admin'); return; }
      const data = await r.json();
      setResults(data.results || []);
    } catch { toast.error('Fehler beim Laden'); }
    setLoading(false);
  };

  useEffect(() => { if (token) search(); /* eslint-disable-next-line */ }, [token]);

  const setEdit = (id, patch) => {
    setEditing((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }));
  };

  const save = async (d) => {
    setSavingId(d.id);
    const patch = editing[d.id] || {};
    try {
      const r = await fetch(`/api/admin/doctors/${d.id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(patch),
      });
      if (!r.ok) throw new Error((await r.json()).error || 'Fehler');
      const updated = await r.json();
      setResults((rs) => rs.map((x) => x.id === d.id ? { ...x, ...updated.doctor } : x));
      setEditing((prev) => { const c = { ...prev }; delete c[d.id]; return c; });
      toast.success('Gespeichert');
    } catch (e) { toast.error(String(e.message || e)); }
    setSavingId(null);
  };

  if (!token) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-sky-700"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Praxen verwalten</h1>
          <p className="text-sm text-slate-500">Fachrichtung korrigieren, verifizieren oder deaktivieren.</p>
        </div>
      </div>

      <div className="card-soft mt-6 p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, Fachrichtung ..." className="input pl-9" />
          </div>
          <input value={ort} onChange={(e) => setOrt(e.target.value)} placeholder="Stadt oder PLZ" className="input" />
          <button onClick={search} className="btn-primary">{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> …</> : 'Suchen'}</button>
        </div>
      </div>

      <div className="card-soft mt-6 overflow-hidden">
        {loading ? (
          <p className="p-10 text-center text-slate-500"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Lade …</p>
        ) : results.length === 0 ? (
          <p className="p-10 text-center text-slate-500">Keine Einträge.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {results.map((d) => {
              const edit = editing[d.id] || {};
              const displayed = { specialty_guess: edit.specialty_guess !== undefined ? edit.specialty_guess : (d.specialty_guess || ''), is_verified: edit.is_verified !== undefined ? edit.is_verified : !!d.is_verified, is_active: edit.is_active !== undefined ? edit.is_active : !!d.is_active };
              const dirty = editing[d.id] !== undefined;
              return (
                <div key={d.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <a href={`/praxis/${d.city_slug}/${d.slug}`} target="_blank" rel="noreferrer" className="font-semibold text-slate-900 hover:text-sky-700">{d.name}</a>
                      {d.is_verified && <span className="chip border-emerald-100 bg-emerald-50 text-emerald-700"><ShieldCheck className="mr-1 h-3 w-3" />verifiziert</span>}
                      {!d.is_active && <span className="chip border-rose-100 bg-rose-50 text-rose-700">deaktiviert</span>}
                      <span className="chip">{d.primary_type || '–'}</span>
                      {d.specialty_confidence != null && <span className="text-[10px] text-slate-600">conf {(d.specialty_confidence * 100).toFixed(0)}%</span>}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{d.formatted_address}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      {d.phone_national && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {d.phone_national}</span>}
                      {d.website_url && <a href={d.website_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-sky-700"><Globe className="h-3 w-3" /> Website</a>}
                    </div>

                    <div className="mt-3 flex flex-wrap items-end gap-3">
                      <div>
                        <label className="label">Fachrichtung</label>
                        <select value={displayed.specialty_guess} onChange={(e) => setEdit(d.id, { specialty_guess: e.target.value })} className="input mt-1 min-w-[180px]">
                          {SPECIALTY_OPTIONS.map((o) => <option key={o || 'none'} value={o}>{o || '— keine —'}</option>)}
                        </select>
                      </div>
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" checked={displayed.is_verified} onChange={(e) => setEdit(d.id, { is_verified: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-sky-600" /> verifiziert
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" checked={displayed.is_active} onChange={(e) => setEdit(d.id, { is_active: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-sky-600" /> aktiv
                      </label>
                    </div>
                  </div>
                  <div className="flex items-start justify-end">
                    <button disabled={!dirty || savingId === d.id} onClick={() => save(d)} className="btn-primary disabled:cursor-not-allowed">{savingId === d.id ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Speichere …</> : <><Save className="mr-1.5 h-4 w-4" /> Speichern</>}</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
