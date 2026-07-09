'use client';

import { useEffect, useState } from 'react';
import { Lock, LogOut, RefreshCw, Play, Database, Building2, ListChecks, AlertTriangle, CheckCircle2, Clock, Loader2, Sparkles, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';

const PLACE_TYPES = [
  { v: 'any', l: 'Beliebig' },
  { v: 'doctor', l: 'Arzt (doctor)' },
  { v: 'dentist', l: 'Zahnarzt (dentist)' },
  { v: 'dental_clinic', l: 'Zahnklinik (dental_clinic)' },
  { v: 'hospital', l: 'Krankenhaus (hospital)' },
  { v: 'physiotherapist', l: 'Physiotherapeut' },
  { v: 'chiropractor', l: 'Chiropraktiker' },
  { v: 'pharmacy', l: 'Apotheke' },
];

export default function AdminPage() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('navoria_admin_token') : null;
    if (t) setToken(t);
  }, []);

  if (!token) return <Login onLogin={(t) => { localStorage.setItem('navoria_admin_token', t); setToken(t); }} />;
  return <Dashboard token={token} onLogout={() => { localStorage.removeItem('navoria_admin_token'); setToken(null); }} />;
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@navoria.de');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await r.json();
      if (!r.ok) { toast.error(data.error || 'Login fehlgeschlagen'); setLoading(false); return; }
      toast.success('Willkommen zurück');
      onLogin(data.token);
    } catch (err) { toast.error('Netzwerkfehler'); }
    setLoading(false);
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4">
      <form onSubmit={submit} className="card-soft w-full p-8" aria-labelledby="admin-login-title">
        <div className="flex items-center gap-2 text-sky-700"><Lock className="h-5 w-5" aria-hidden="true" /><span className="text-sm font-semibold">Navoria Admin</span></div>
        <h1 id="admin-login-title" className="mt-2 text-2xl font-semibold text-slate-900">Anmelden</h1>
        <p className="mt-1 text-sm text-slate-500">Zugang zum Datenmanagement.</p>
        <div className="mt-6 space-y-3">
          <div>
            <label htmlFor="admin-email" className="label">E-Mail</label>
            <input id="admin-email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input mt-1.5" placeholder="admin@navoria.de" />
          </div>
          <div>
            <label htmlFor="admin-password" className="label">Passwort</label>
            <input id="admin-password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input mt-1.5" placeholder="••••••••" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Anmelden …</> : 'Anmelden'}
        </button>
        <p className="mt-4 text-[11px] text-slate-500">Standardzugang: admin@navoria.de / navoria2025</p>
      </form>
    </div>
  );
}

function Dashboard({ token, onLogout }) {
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [city, setCity] = useState('Berlin');
  const [query, setQuery] = useState('Hausarzt');
  const [placeType, setPlaceType] = useState('doctor');
  const [maxResults, setMaxResults] = useState(20);
  const [importing, setImporting] = useState(false);

  // Backfill state
  const [backfilling, setBackfilling] = useState(false);
  const [backfillForce, setBackfillForce] = useState(false);
  const [backfillProgress, setBackfillProgress] = useState({ total: 0, ok: 0, failed: 0 });

  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const loadAll = async () => {
    setRefreshing(true);
    try {
      const [statsRes, jobsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: authHeaders }),
        fetch('/api/admin/jobs', { headers: authHeaders }),
      ]);
      if (statsRes.status === 401) { toast.error('Sitzung abgelaufen'); onLogout(); return; }
      const [s, j] = await Promise.all([statsRes.json(), jobsRes.json()]);
      setStats(s);
      setJobs(Array.isArray(j) ? j : []);
    } catch { toast.error('Fehler beim Laden'); }
    setRefreshing(false);
  };

  const loadLogs = async (jobId) => {
    setSelectedJob(jobId);
    try {
      const r = await fetch(`/api/admin/logs?job_id=${jobId}`, { headers: authHeaders });
      const data = await r.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch { setLogs([]); }
  };

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, []);

  const startImport = async (e) => {
    e.preventDefault();
    if (!city.trim() && !query.trim()) { toast.error('Bitte Ort oder Suchbegriff angeben'); return; }
    setImporting(true);
    toast.info('Import gestartet … Bitte warten (kann bis zu 60s dauern).');
    try {
      const r = await fetch('/api/admin/sync', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ city, query, placeType, maxResults }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Import fehlgeschlagen');
      toast.success(`Import fertig: ${data.job.inserted} neu, ${data.job.updated} aktualisiert, ${data.job.errors} Fehler`);
      await loadAll();
    } catch (err) {
      toast.error(String(err.message || err));
    }
    setImporting(false);
  };

  // Backfill: alle Praxen via Places Details API neu ziehen (Barrierefreiheit, Parken, Bezahlung, Stadtteil)
  // Läuft in Schleife in Batches à 50, damit Requests nicht in Serverless-Timeouts laufen.
  const runBackfill = async () => {
    if (backfilling) return;
    if (!confirm(`Backfill wirklich starten?\n\n${backfillForce ? '⚠ FORCE-Modus: ALLE Praxen werden neu synchronisiert (kostet 1 API-Request pro Praxis).' : 'Nur Praxen mit letzter Sync-Zeit > 24h werden aktualisiert.'}`)) return;
    setBackfilling(true);
    setBackfillProgress({ total: 0, ok: 0, failed: 0 });
    let totalOk = 0, totalFailed = 0, totalProcessed = 0;
    let emptyRuns = 0;
    try {
      // Bis zu 20 Runden × 50 = max. 1000 Praxen
      for (let i = 0; i < 20; i += 1) {
        const r = await fetch('/api/admin/backfill', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ limit: 50, force: backfillForce }),
        });
        if (r.status === 401) { toast.error('Sitzung abgelaufen'); onLogout(); return; }
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Backfill fehlgeschlagen');
        totalProcessed += data.processed;
        totalOk += data.ok;
        totalFailed += data.failed;
        setBackfillProgress({ total: totalProcessed, ok: totalOk, failed: totalFailed });
        if (data.processed === 0) { emptyRuns += 1; if (emptyRuns >= 1) break; }
        else emptyRuns = 0;
        // Kleine Pause zwischen Batches
        await new Promise((r2) => setTimeout(r2, 400));
      }
      toast.success(`Backfill fertig: ${totalOk} aktualisiert, ${totalFailed} Fehler`);
      await loadAll();
    } catch (err) {
      toast.error(String(err.message || err));
    }
    setBackfilling(false);
  };

  // Export: JSON aller Praxen aus dieser Umgebung herunterladen
  const [exporting, setExporting] = useState(false);
  const [importing2, setImporting2] = useState(false);
  const [importReport, setImportReport] = useState(null);
  const [importForce, setImportForce] = useState(false);

  const runExport = async () => {
    setExporting(true);
    try {
      const r = await fetch('/api/admin/export', { headers: authHeaders });
      if (r.status === 401) { toast.error('Sitzung abgelaufen'); onLogout(); return; }
      if (!r.ok) throw new Error('Export fehlgeschlagen');
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const stamp = new Date().toISOString().slice(0, 10);
      link.download = `navoria-export-${stamp}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success('Export heruntergeladen');
    } catch (err) { toast.error(String(err.message || err)); }
    setExporting(false);
  };

  const runImport = async (file) => {
    if (!file) return;
    if (!confirm(`Import wirklich starten?\n\nDatei: ${file.name}\nModus: ${importForce ? '⚠ REPLACE (löscht alle bestehenden Einträge zuerst)' : 'MERGE (bestehende werden upgedatet, neue eingefügt)'}\n\nManuelle Overrides bleiben erhalten.`)) return;
    setImporting2(true);
    setImportReport(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const doctors = Array.isArray(parsed) ? parsed : (parsed.doctors || parsed.items || []);
      if (!Array.isArray(doctors) || doctors.length === 0) throw new Error('Keine Praxen in der Datei gefunden');
      const r = await fetch('/api/admin/import', {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ doctors, mode: importForce ? 'replace' : 'merge', force: importForce }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Import fehlgeschlagen');
      setImportReport(data);
      toast.success(`Import fertig: ${data.inserted} neu, ${data.updated} aktualisiert, ${data.skipped} übersprungen`);
      await loadAll();
    } catch (err) { toast.error(String(err.message || err)); }
    setImporting2(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Admin · Dashboard</h1>
          <p className="text-sm text-slate-500">Datenbestand verwalten und Praxisdaten aus externen Verzeichnissen importieren.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/admin/kampagnen" className="btn-primary">Bulk-Kampagne</a>
          <a href="/admin/analytics" className="btn-secondary">Live-Analytics</a>
          <a href="/admin/homepages" className="btn-secondary">Aktive Homepages</a>
          <a href="/admin/beanspruchungen" className="btn-secondary">Profil-Beanspruchungen</a>
          <a href="/admin/aerzte" className="btn-secondary">Praxen verwalten</a>
          <a href="/admin/ohne-website" className="btn-secondary">Ohne Website</a>
          <a href="/admin/duplikate" className="btn-secondary">Duplikate</a>
          <a href="/admin/korrekturen" className="btn-secondary">Korrektur-Meldungen</a>
          <button onClick={loadAll} className="btn-secondary"><RefreshCw className={`mr-1.5 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Aktualisieren</button>
          <button onClick={onLogout} className="btn-secondary"><LogOut className="mr-1.5 h-4 w-4" /> Abmelden</button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Database} label="Datensätze" value={stats?.doctor_count ?? '…'} />
        <StatCard icon={Building2} label="Städte" value={stats?.city_count ?? '…'} />
        <StatCard icon={ListChecks} label="Import-Läufe" value={stats?.job_count ?? '…'} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Import Formular */}
        <div className="card-soft p-6">
          <h2 className="text-lg font-semibold text-slate-900">Neuer Praxis-Import</h2>
          <p className="text-sm text-slate-500">Manuell angestoßen. Sprache: Deutsch. Land: Deutschland.</p>
          <form onSubmit={startImport} className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Ort / PLZ / Stadt</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="z.B. Berlin oder 10115" className="input mt-1.5" />
              </div>
              <div>
                <label className="label">Suchbegriff (optional)</label>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="z.B. Hausarzt, Kardiologe" className="input mt-1.5" />
              </div>
              <div>
                <label className="label">Place Type</label>
                <select value={placeType} onChange={(e) => setPlaceType(e.target.value)} className="input mt-1.5">
                  {PLACE_TYPES.map((p) => <option key={p.v} value={p.v}>{p.l}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Max. Ergebnisse (max 60)</label>
                <input type="number" min="1" max="60" value={maxResults} onChange={(e) => setMaxResults(parseInt(e.target.value || '20', 10))} className="input mt-1.5" />
              </div>
            </div>
            <button disabled={importing} className="btn-primary w-full">
              {importing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Import läuft …</> : <><Play className="mr-2 h-4 w-4" /> Import starten</>}
            </button>
          </form>
        </div>

        {/* Letzter Job */}
        <div className="card-soft p-6">
          <h2 className="text-lg font-semibold text-slate-900">Letzter Importlauf</h2>
          {stats?.last_job ? <JobDetails job={stats.last_job} /> : <p className="mt-2 text-sm text-slate-500">Noch keine Läufe.</p>}
        </div>
      </div>

      {/* Sync / Export / Import */}
      <div className="card-soft mt-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Database className="h-5 w-5 text-emerald-600" /> Sync (Export / Import zwischen Umgebungen)
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Aus <b>Production</b> exportieren, dann in <b>Preview</b> importieren – oder umgekehrt. Der Import ist per Default <b>MERGE</b>: bestehende Praxen werden per <code>google_place_id</code> aktualisiert, neue eingefügt. Manuelle Overrides werden respektiert.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button onClick={runExport} disabled={exporting} className="btn-secondary">
            {exporting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Export läuft …</> : <><Download className="mr-2 h-4 w-4" /> JSON exportieren</>}
          </button>
          <label className={`btn-secondary cursor-pointer ${importing2 ? 'opacity-60' : ''}`}>
            {importing2 ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Import läuft …</> : <><Upload className="mr-2 h-4 w-4" /> JSON importieren …</>}
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              disabled={importing2}
              onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; runImport(f); }}
            />
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <input
              type="checkbox"
              checked={importForce}
              onChange={(e) => setImportForce(e.target.checked)}
              disabled={importing2}
              className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <span className="text-rose-700">REPLACE-Modus (löscht ALLES vorher)</span>
          </label>
        </div>
        {importReport && (
          <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-4">
            <div><span className="text-slate-500">Verarbeitet:</span> <b className="text-slate-900">{importReport.total_processed}</b></div>
            <div><span className="text-slate-500">Neu:</span> <b className="text-emerald-700">{importReport.inserted}</b></div>
            <div><span className="text-slate-500">Aktualisiert:</span> <b className="text-sky-700">{importReport.updated}</b></div>
            <div><span className="text-slate-500">Übersprungen:</span> <b className="text-slate-600">{importReport.skipped}</b></div>
            {importReport.errors?.length > 0 && (
              <div className="sm:col-span-4 mt-2 rounded border border-rose-200 bg-rose-50 p-2 text-xs text-rose-800">
                {importReport.errors.length} Fehler beim Import. Erste: {importReport.errors[0].error}
              </div>
            )}
          </div>
        )}
        <p className="mt-3 text-xs text-slate-400">
          <b>So syncst du Production → Preview:</b> Auf navoria.de/admin auf „JSON exportieren" klicken (lädt Datei) → im Preview-Admin auf „JSON importieren" klicken → Datei auswählen. Alle Praxen werden per <code>google_place_id</code> gematcht.
        </p>
      </div>


      {/* Backfill Card */}
      <div className="card-soft mt-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Sparkles className="h-5 w-5 text-sky-600" /> Datenanreicherung (Backfill)
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Zieht für bestehende Praxen die neuen Datenfelder nach: <b>Barrierefreiheit</b>, <b>Parken</b>, <b>Bezahlung</b>, <b>Stadtteil</b>, <b>Titel</b> und aktuelle Öffnungszeiten. Läuft in Batches à 50 mit 250 ms Rate-Limit. Manuelle Overrides werden respektiert.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                checked={backfillForce}
                onChange={(e) => setBackfillForce(e.target.checked)}
                disabled={backfilling}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              Alle erzwingen (statt nur älter 24h)
            </label>
            <button onClick={runBackfill} disabled={backfilling} className="btn-primary">
              {backfilling ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Läuft …</> : <><Sparkles className="mr-2 h-4 w-4" /> Backfill starten</>}
            </button>
          </div>
        </div>
        {(backfilling || backfillProgress.total > 0) && (
          <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white p-2"><Database className="h-4 w-4 text-slate-500" /></div>
              <div>
                <div className="text-xs text-slate-500">Verarbeitet</div>
                <div className="text-lg font-semibold text-slate-900">{backfillProgress.total}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white p-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /></div>
              <div>
                <div className="text-xs text-slate-500">Aktualisiert</div>
                <div className="text-lg font-semibold text-emerald-700">{backfillProgress.ok}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white p-2"><AlertTriangle className="h-4 w-4 text-rose-500" /></div>
              <div>
                <div className="text-xs text-slate-500">Fehler</div>
                <div className="text-lg font-semibold text-rose-700">{backfillProgress.failed}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Job history */}
      <div className="card-soft mt-8 overflow-hidden">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-semibold text-slate-900">Import-Historie</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {jobs.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">Keine Jobs vorhanden.</p>
          ) : jobs.map((j) => (
            <div key={j.id} className="p-4 hover:bg-slate-50">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <StatusBadge status={j.status} />
                    <span className="font-medium text-slate-900">{j.params?.query || '–'} in {j.params?.city || '–'}</span>
                    <span className="chip">{j.params?.placeType || 'any'}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span><Clock className="mr-1 inline h-3 w-3" /> {new Date(j.started_at).toLocaleString('de-DE')}</span>
                    <span>Gefunden: <b className="text-slate-700">{j.found}</b></span>
                    <span>Neu: <b className="text-emerald-700">{j.inserted}</b></span>
                    <span>Aktualisiert: <b className="text-sky-700">{j.updated}</b></span>
                    <span>Fehler: <b className="text-rose-700">{j.errors}</b></span>
                  </div>
                </div>
                <button onClick={() => loadLogs(j.id)} className="btn-secondary shrink-0">Logs</button>
              </div>
              {selectedJob === j.id && (
                <div className="mt-3 rounded-lg bg-slate-50 p-3">
                  {logs.length === 0 ? <p className="text-xs text-slate-500">Keine Logs.</p> : (
                    <ul className="space-y-1 text-xs">
                      {logs.map((l) => (
                        <li key={l.id} className={l.level === 'error' ? 'text-rose-700' : 'text-slate-600'}>
                          <span className="font-mono">[{new Date(l.created_at).toLocaleTimeString('de-DE')}]</span> {l.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="card-soft flex items-center gap-4 p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600"><Icon className="h-5 w-5" /></div>
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
        <div className="text-2xl font-semibold text-slate-900">{value}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === 'succeeded') return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"><CheckCircle2 className="h-3 w-3" /> ok</span>;
  if (status === 'failed') return <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700"><AlertTriangle className="h-3 w-3" /> Fehler</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700"><Loader2 className="h-3 w-3 animate-spin" /> läuft</span>;
}

function JobDetails({ job }) {
  return (
    <div className="mt-3">
      <div className="flex items-center gap-2 text-sm">
        <StatusBadge status={job.status} />
        <span className="font-medium text-slate-900">{job.params?.query || '–'} in {job.params?.city || '–'}</span>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="flex justify-between"><dt className="text-slate-500">Gestartet</dt><dd>{new Date(job.started_at).toLocaleString('de-DE')}</dd></div>
        {job.finished_at && <div className="flex justify-between"><dt className="text-slate-500">Beendet</dt><dd>{new Date(job.finished_at).toLocaleString('de-DE')}</dd></div>}
        <div className="flex justify-between"><dt className="text-slate-500">Gefunden</dt><dd>{job.found}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-500">Neu</dt><dd className="text-emerald-700">{job.inserted}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-500">Aktualisiert</dt><dd className="text-sky-700">{job.updated}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-500">Fehler</dt><dd className="text-rose-700">{job.errors}</dd></div>
      </dl>
      {job.error_message && <p className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{job.error_message}</p>}
    </div>
  );
}
