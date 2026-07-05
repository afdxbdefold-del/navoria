'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, AlertTriangle, RefreshCw, Play, Pause, RotateCw, Rocket, MapPin, Stethoscope, Clock, TrendingUp, ArrowLeft } from 'lucide-react';
import { TOP_100_CITIES } from '@/lib/germanCities';
import { SPECIALTIES } from '@/lib/specialties';

const TOP_10_CITIES = TOP_100_CITIES.slice(0, 10);
const TOP_20_CITIES = TOP_100_CITIES.slice(0, 20);
const TOP_50_CITIES = TOP_100_CITIES.slice(0, 50);

export default function KampagnenPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [selectedCities, setSelectedCities] = useState([...TOP_100_CITIES]);
  const [selectedSpecs, setSelectedSpecs] = useState(SPECIALTIES.map((s) => s.slug));
  const [maxPerQuery, setMaxPerQuery] = useState(60);
  const [starting, setStarting] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [activeCampaign, setActiveCampaign] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('navoria_admin_token') : null;
    if (!t) { router.push('/admin'); return; }
    setToken(t);
  }, [router]);

  const auth = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const loadCampaigns = async () => {
    if (!token) return;
    try {
      const r = await fetch('/api/admin/campaigns', { headers: auth });
      if (r.status === 401) { localStorage.removeItem('navoria_admin_token'); router.push('/admin'); return; }
      const data = await r.json();
      setCampaigns(Array.isArray(data) ? data : []);
      const running = (data || []).find((c) => c.status === 'running');
      setActiveCampaign(running || null);
    } catch {}
  };

  useEffect(() => { if (token) loadCampaigns(); /* eslint-disable-next-line */ }, [token]);

  // Live-Poll wenn aktive Kampagne läuft
  useEffect(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (!activeCampaign || activeCampaign.status !== 'running') return;
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`/api/admin/campaigns/${activeCampaign.id}`, { headers: auth });
        if (!r.ok) return;
        const data = await r.json();
        setActiveCampaign(data);
        if (data.status !== 'running') {
          clearInterval(pollRef.current);
          pollRef.current = null;
          loadCampaigns();
          if (data.status === 'succeeded') toast.success(`Kampagne fertig: ${data.inserted} neu, ${data.updated} aktualisiert`);
          else if (data.status === 'aborted') toast.info(`Kampagne abgebrochen (${data.done_queries}/${data.total_queries} Queries fertig).`);
          else if (data.status === 'failed') toast.error(`Kampagne fehlgeschlagen`);
        }
      } catch {}
    }, 2500);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
    // eslint-disable-next-line
  }, [activeCampaign?.id, activeCampaign?.status]);

  const toggleCity = (c) => setSelectedCities((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  const toggleSpec = (s) => setSelectedSpecs((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const totalQueries = selectedCities.length * selectedSpecs.length;
  const estimatedMinutes = Math.ceil((totalQueries * 4) / 5 / 60); // 4s/query, 5 parallel

  const startCampaign = async () => {
    if (activeCampaign?.status === 'running') { toast.error('Es läuft bereits eine Kampagne'); return; }
    if (selectedCities.length === 0 || selectedSpecs.length === 0) { toast.error('Bitte Städte und Fachrichtungen auswählen'); return; }
    setStarting(true);
    try {
      const r = await fetch('/api/admin/campaigns', {
        method: 'POST', headers: auth,
        body: JSON.stringify({ cities: selectedCities, specialtySlugs: selectedSpecs, maxPerQuery }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Fehler');
      toast.success(`Kampagne gestartet: ${totalQueries} Queries in Warteschlange`);
      setActiveCampaign(data.campaign);
      loadCampaigns();
    } catch (e) { toast.error(String(e.message || e)); }
    setStarting(false);
  };

  const abortCampaign = async (id) => {
    if (!confirm('Kampagne wirklich abbrechen? Der bisherige Fortschritt bleibt erhalten.')) return;
    try {
      const r = await fetch(`/api/admin/campaigns/${id}/abort`, { method: 'POST', headers: auth });
      if (!r.ok) throw new Error((await r.json()).error || 'Fehler');
      toast.success('Abbruch angefordert – Worker beendet nach der aktuellen Query.');
      setTimeout(loadCampaigns, 1500);
    } catch (e) { toast.error(String(e.message || e)); }
  };

  const resumeCampaign = async (id) => {
    try {
      const r = await fetch(`/api/admin/campaigns/${id}/resume`, { method: 'POST', headers: auth });
      if (!r.ok) throw new Error((await r.json()).error || 'Fehler');
      toast.success('Kampagne wird fortgesetzt.');
      loadCampaigns();
    } catch (e) { toast.error(String(e.message || e)); }
  };

  if (!token) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-sky-700"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900"><Rocket className="h-6 w-6 text-sky-600" /> Bulk-Import-Kampagnen</h1>
          <p className="text-sm text-slate-500">Städte × Fachrichtungen in einem Rutsch importieren. Parallel-Verarbeitung, Live-Fortschritt.</p>
        </div>
        <button onClick={loadCampaigns} className="btn-secondary"><RefreshCw className="mr-1.5 h-4 w-4" /> Aktualisieren</button>
      </div>

      {/* Aktive Kampagne */}
      {activeCampaign && (
        <div className="card-soft mt-6 border-sky-100 bg-sky-50/30 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-sky-800">
              {activeCampaign.status === 'running' ? <Loader2 className="h-4 w-4 animate-spin" /> : activeCampaign.status === 'succeeded' ? <CheckCircle2 className="h-4 w-4" /> : activeCampaign.status === 'aborted' ? <Pause className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              {activeCampaign.status === 'running' ? 'Kampagne läuft …' : activeCampaign.status === 'aborted' ? 'Kampagne abgebrochen' : 'Zuletzt abgeschlossen'}
            </div>
            <div className="flex gap-2">
              {activeCampaign.status === 'running' && (
                <button onClick={() => abortCampaign(activeCampaign.id)} className="inline-flex items-center rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50">
                  <Pause className="mr-1.5 h-4 w-4" /> Abbrechen
                </button>
              )}
              {activeCampaign.status === 'aborted' && activeCampaign.done_queries < activeCampaign.total_queries && (
                <button onClick={() => resumeCampaign(activeCampaign.id)} className="inline-flex items-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700">
                  <RotateCw className="mr-1.5 h-4 w-4" /> Fortsetzen ({activeCampaign.total_queries - activeCampaign.done_queries} offen)
                </button>
              )}
            </div>
          </div>
          <div className="mt-2 text-lg font-semibold text-slate-900">{activeCampaign.name}</div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{activeCampaign.done_queries} / {activeCampaign.total_queries} Queries</span>
              <span className="font-semibold text-slate-900">{Math.round((activeCampaign.done_queries / activeCampaign.total_queries) * 100)}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-gradient-to-r from-sky-500 to-teal-500 transition-all" style={{ width: `${(activeCampaign.done_queries / activeCampaign.total_queries) * 100}%` }} />
            </div>
            {activeCampaign.current_query && <p className="mt-2 text-xs text-slate-500">Aktuell: {activeCampaign.current_query}</p>}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
            <Stat label="Gefunden" value={activeCampaign.found} />
            <Stat label="Neu" value={activeCampaign.inserted} color="text-emerald-700" />
            <Stat label="Aktualisiert" value={activeCampaign.updated} color="text-sky-700" />
            <Stat label="Übersprungen" value={activeCampaign.skipped} />
            <Stat label="Fehler" value={activeCampaign.errors} color={activeCampaign.errors > 0 ? 'text-rose-700' : ''} />
          </div>
          {activeCampaign.error_samples?.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-slate-500">Fehler-Beispiele anzeigen</summary>
              <ul className="mt-2 space-y-1 rounded-lg bg-white p-3 text-xs text-rose-700">
                {activeCampaign.error_samples.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </details>
          )}
        </div>
      )}

      {/* Neue Kampagne */}
      <div className="card-soft mt-6 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Neue Kampagne konfigurieren</h2>

        {/* Presets */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-xs font-medium text-slate-500 mr-2 self-center">Städte-Presets:</span>
          <button onClick={() => setSelectedCities([...TOP_10_CITIES])} className="chip hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700">Top 10</button>
          <button onClick={() => setSelectedCities([...TOP_20_CITIES])} className="chip hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700">Top 20</button>
          <button onClick={() => setSelectedCities([...TOP_50_CITIES])} className="chip hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700">Top 50</button>
          <button onClick={() => setSelectedCities([...TOP_100_CITIES])} className="chip hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700">Top 100</button>
          <button onClick={() => setSelectedCities([])} className="chip hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700">Keine</button>
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div>
            <label className="label flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Städte ({selectedCities.length} / {TOP_100_CITIES.length})</label>
            <div className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3">
              <div className="grid grid-cols-2 gap-1.5">
                {TOP_100_CITIES.map((c) => (
                  <label key={c} className="flex items-center gap-2 rounded px-2 py-1 text-sm text-slate-700 hover:bg-slate-50">
                    <input type="checkbox" checked={selectedCities.includes(c)} onChange={() => toggleCity(c)} className="h-4 w-4 rounded border-slate-300 text-sky-600" />
                    <span className="truncate">{c}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="label flex items-center gap-1"><Stethoscope className="h-3.5 w-3.5" /> Fachrichtungen ({selectedSpecs.length} / {SPECIALTIES.length})</label>
            <div className="mt-2 flex flex-wrap gap-2 mb-2">
              <button onClick={() => setSelectedSpecs(SPECIALTIES.map((s) => s.slug))} className="chip hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700">Alle</button>
              <button onClick={() => setSelectedSpecs([])} className="chip hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700">Keine</button>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="grid grid-cols-2 gap-1.5">
                {SPECIALTIES.map((s) => (
                  <label key={s.slug} className="flex items-center gap-2 rounded px-2 py-1 text-sm text-slate-700 hover:bg-slate-50">
                    <input type="checkbox" checked={selectedSpecs.includes(s.slug)} onChange={() => toggleSpec(s.slug)} className="h-4 w-4 rounded border-slate-300 text-sky-600" />
                    <span className="truncate">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-end gap-4">
          <div>
            <label className="label">Max. Ergebnisse pro Query</label>
            <select value={maxPerQuery} onChange={(e) => setMaxPerQuery(parseInt(e.target.value, 10))} className="input mt-1.5">
              <option value="20">20 (1 API-Seite)</option>
              <option value="40">40 (2 Seiten)</option>
              <option value="60">60 (max, 3 Seiten)</option>
            </select>
          </div>

          <div className="ml-auto flex flex-col items-end gap-3 sm:flex-row sm:items-end">
            <div className="text-right">
              <div className="text-xs text-slate-500">Kampagnen-Umfang</div>
              <div className="text-lg font-semibold text-slate-900">{totalQueries.toLocaleString('de-DE')} Queries</div>
              <div className="flex items-center gap-1 text-xs text-slate-500"><Clock className="h-3 w-3" /> ca. {estimatedMinutes} Min. geschätzt</div>
            </div>
            <button onClick={startCampaign} disabled={starting || totalQueries === 0 || activeCampaign?.status === 'running'} className="btn-primary disabled:cursor-not-allowed">
              {starting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starte …</> : <><Play className="mr-2 h-4 w-4" /> Kampagne starten</>}
            </button>
          </div>
        </div>
      </div>

      {/* Historie */}
      <div className="card-soft mt-8 overflow-hidden">
        <div className="border-b border-slate-100 p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><TrendingUp className="h-4 w-4" /> Historie</h2>
        </div>
        {campaigns.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">Noch keine Kampagnen.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {campaigns.map((c) => (
              <div key={c.id} className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <StatusBadge status={c.status} />
                      <span className="font-medium text-slate-900">{c.name}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>{new Date(c.created_at).toLocaleString('de-DE')}</span>
                      <span>{c.done_queries} / {c.total_queries} Queries</span>
                      <span>Neu: <b className="text-emerald-700">{c.inserted}</b></span>
                      <span>Aktualisiert: <b className="text-sky-700">{c.updated}</b></span>
                      <span>Fehler: <b className="text-rose-700">{c.errors}</b></span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {c.status === 'running' && (
                      <button onClick={() => abortCampaign(c.id)} className="inline-flex items-center rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50">
                        <Pause className="mr-1 h-3 w-3" /> Abbrechen
                      </button>
                    )}
                    {(c.status === 'aborted' || c.status === 'failed') && c.done_queries < c.total_queries && (
                      <button onClick={() => resumeCampaign(c.id)} className="inline-flex items-center rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700">
                        <RotateCw className="mr-1 h-3 w-3" /> Fortsetzen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color = 'text-slate-900' }) {
  return (
    <div className="rounded-lg bg-white p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-lg font-semibold ${color}`}>{(value ?? 0).toLocaleString('de-DE')}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === 'succeeded') return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"><CheckCircle2 className="h-3 w-3" /> fertig</span>;
  if (status === 'failed') return <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700"><AlertTriangle className="h-3 w-3" /> Fehler</span>;
  if (status === 'aborted') return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"><Pause className="h-3 w-3" /> abgebrochen</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700"><Loader2 className="h-3 w-3 animate-spin" /> läuft</span>;
}
