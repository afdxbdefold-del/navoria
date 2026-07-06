'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AlertTriangle, ArrowLeft, Check, X, Loader2, RefreshCw, Mail, Info } from 'lucide-react';

const FIELD_LABEL = {
  phone: 'Telefonnummer',
  address: 'Adresse',
  opening_hours: 'Öffnungszeiten',
  website: 'Website',
  specialty: 'Fachrichtung',
  name: 'Praxisname',
  closed: 'Praxis geschlossen/umgezogen',
  duplicate: 'Doppelter Eintrag',
  other: 'Sonstiges',
};

export default function AdminKorrekturenPage() {
  const [token, setToken] = useState(null);
  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('navoria_admin_token') : null;
    if (!t) window.location.href = '/admin';
    setToken(t);
  }, []);
  if (!token) return null;
  return <KorrekturenList token={token} />;
}

function KorrekturenList({ token }) {
  const [items, setItems] = useState([]);
  const [openCount, setOpenCount] = useState(0);
  const [status, setStatus] = useState('open');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/corrections?status=${status}`, { headers: authHeaders });
      if (r.status === 401) { toast.error('Sitzung abgelaufen'); window.location.href = '/admin'; return; }
      const data = await r.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      setOpenCount(data.open_count || 0);
    } catch { toast.error('Fehler beim Laden'); }
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  const resolve = async (id, action, applyOverride = false) => {
    setBusyId(id);
    try {
      const r = await fetch(`/api/admin/corrections/${id}/resolve`, {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ action, apply_override: applyOverride }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      toast.success(action === 'accept' ? (applyOverride ? 'Angenommen und übernommen' : 'Angenommen') : 'Abgelehnt');
      await load();
    } catch (err) { toast.error(String(err.message || err)); }
    setBusyId(null);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-sky-700"><ArrowLeft className="h-3 w-3" /> Zurück zum Dashboard</Link>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
            <AlertTriangle className="h-6 w-6 text-amber-500" /> Korrektur-Meldungen
          </h1>
          <p className="mt-1 text-sm text-slate-500">{openCount} offene Meldung{openCount === 1 ? '' : 'en'}.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="open">Offen</option>
            <option value="accepted">Angenommen</option>
            <option value="rejected">Abgelehnt</option>
            <option value="all">Alle</option>
          </select>
          <button onClick={load} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Aktualisieren
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Wird geladen…</div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Keine Meldungen in diesem Status.</div>
        ) : items.map((it) => (
          <div key={it.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-medium text-slate-700">
                    {FIELD_LABEL[it.field] || it.field}
                  </span>
                  <StatusBadge status={it.status} />
                  <span className="text-slate-400">{new Date(it.created_at).toLocaleString('de-DE')}</span>
                </div>
                <Link href={`/praxis/${it.doctor_city_slug}/${it.doctor_slug}`} className="mt-2 block text-base font-semibold text-slate-900 hover:text-sky-700">
                  {it.doctor_name}
                </Link>
                {it.correct_value && (
                  <div className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                    <span className="mr-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700">Vorgeschlagen:</span>
                    {it.correct_value}
                  </div>
                )}
                {it.note && (
                  <p className="mt-2 flex items-start gap-2 text-sm text-slate-600">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>{it.note}</span>
                  </p>
                )}
                {it.email && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <Mail className="h-3 w-3" /> <a href={`mailto:${it.email}`} className="hover:underline">{it.email}</a>
                  </p>
                )}
              </div>
              {it.status === 'open' && (
                <div className="flex flex-col gap-2 shrink-0">
                  {it.correct_value && ['phone', 'address', 'website', 'specialty', 'name'].includes(it.field) && (
                    <button
                      disabled={busyId === it.id}
                      onClick={() => resolve(it.id, 'accept', true)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {busyId === it.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      Annehmen &amp; übernehmen
                    </button>
                  )}
                  <button
                    disabled={busyId === it.id}
                    onClick={() => resolve(it.id, 'accept', false)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" /> Annehmen
                  </button>
                  <button
                    disabled={busyId === it.id}
                    onClick={() => resolve(it.id, 'reject', false)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" /> Ablehnen
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    open: 'border-amber-200 bg-amber-50 text-amber-800',
    accepted: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    rejected: 'border-slate-200 bg-slate-100 text-slate-600',
  };
  const label = { open: 'Offen', accepted: 'Angenommen', rejected: 'Abgelehnt' };
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${map[status] || map.open}`}>{label[status] || status}</span>;
}
