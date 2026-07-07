'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, CheckCircle2, XCircle, Clock, Mail, Phone, ExternalLink, Globe, Building2, RefreshCw, Loader2 } from 'lucide-react';

const STATUS_TABS = [
  { key: 'new', label: 'Neu' },
  { key: 'in_review', label: 'In Prüfung' },
  { key: 'approved', label: 'Freigegeben' },
  { key: 'rejected', label: 'Abgelehnt' },
  { key: 'all', label: 'Alle' },
];

export default function AdminClaimRequests() {
  const [token, setToken] = useState(null);
  const [status, setStatus] = useState('new');
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('navoria_admin_token') : null;
    setToken(t);
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch(`/api/admin/claim-requests?status=${status}&limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error(`Status: ${r.status}`);
      setData(await r.json());
      setErr(null);
    } catch (e) { setErr(String(e.message || e)); }
  }, [token, status]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id, newStatus) {
    if (!token) return;
    setBusyId(id);
    try {
      const r = await fetch(`/api/admin/claim-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!r.ok) throw new Error((await r.json())?.error || String(r.status));
      await load();
    } catch (e) { alert('Fehler: ' + e.message); }
    finally { setBusyId(null); }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-sm text-slate-600">Nicht angemeldet. Bitte über <Link href="/admin" className="text-sky-700 underline">Admin-Login</Link>.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/admin" className="hover:text-sky-700">Admin</Link>
            <span aria-hidden="true">/</span>
            <span className="text-slate-700">Profil-Beanspruchungen</span>
          </div>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
            <BadgeCheck aria-hidden="true" className="h-6 w-6 text-sky-600" />
            Profil-Beanspruchungen
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {data?.counts && (
              <>
                <strong className="text-slate-700">{data.counts.new || 0}</strong> neu ·{' '}
                <strong className="text-slate-700">{data.counts.approved || 0}</strong> freigegeben ·{' '}
                <strong className="text-slate-700">{data.counts.rejected || 0}</strong> abgelehnt
              </>
            )}
          </p>
        </div>
        <button onClick={load} className="btn-secondary text-xs">
          <RefreshCw aria-hidden="true" className="mr-1.5 h-3.5 w-3.5" /> Aktualisieren
        </button>
      </header>

      <div className="mb-4 flex flex-wrap gap-1 border-b border-slate-200">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setStatus(t.key)}
            className={`border-b-2 px-3 py-2 text-sm font-medium transition ${status === t.key ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {err && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{err}</div>}

      {data?.items?.length ? (
        <div className="space-y-4">
          {data.items.map((it) => (
            <article key={it.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">{it.doctor_name || '—'}</h2>
                    {it.doctor_city && <span className="text-sm text-slate-500">· {it.doctor_city}</span>}
                    <StatusBadge status={it.status} />
                  </div>
                  {it.doctor_id && (
                    <Link href={`/praxis-lookup?id=${it.doctor_id}`} className="mt-1 inline-flex items-center gap-1 text-xs text-sky-700 hover:text-sky-800">
                      Doctor-ID: <code className="font-mono">{it.doctor_id.slice(0, 8)}…</code>
                      <ExternalLink aria-hidden="true" className="h-3 w-3" />
                    </Link>
                  )}
                </div>
                <div className="text-right text-xs text-slate-500">
                  <Clock aria-hidden="true" className="mr-1 inline h-3 w-3" />
                  {new Date(it.created_at).toLocaleString('de-DE')}
                </div>
              </div>

              <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Kontakt</dt>
                  <dd className="mt-0.5 font-medium text-slate-900">
                    {it.first_name} {it.last_name}
                    <span className="ml-2 text-xs text-slate-500">({roleLabel(it.role)})</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">E-Mail</dt>
                  <dd className="mt-0.5">
                    <a href={`mailto:${it.email}`} className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-800">
                      <Mail aria-hidden="true" className="h-3.5 w-3.5" /> {it.email}
                    </a>
                  </dd>
                </div>
                {it.phone && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Telefon</dt>
                    <dd className="mt-0.5">
                      <a href={`tel:${it.phone}`} className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900">
                        <Phone aria-hidden="true" className="h-3.5 w-3.5" /> {it.phone}
                      </a>
                    </dd>
                  </div>
                )}
                {it.website && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Website</dt>
                    <dd className="mt-0.5">
                      <a href={it.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-800">
                        <Globe aria-hidden="true" className="h-3.5 w-3.5" /> {it.website}
                      </a>
                    </dd>
                  </div>
                )}
                {it.company_name && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Rechtsträger</dt>
                    <dd className="mt-0.5 inline-flex items-center gap-1 text-slate-700">
                      <Building2 aria-hidden="true" className="h-3.5 w-3.5" /> {it.company_name}
                    </dd>
                  </div>
                )}
              </dl>

              {it.message && (
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-wrap">
                  {it.message}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
                {it.status !== 'in_review' && (
                  <button
                    onClick={() => updateStatus(it.id, 'in_review')}
                    disabled={busyId === it.id}
                    className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-60"
                  >
                    {busyId === it.id ? <Loader2 aria-hidden="true" className="h-3 w-3 animate-spin" /> : <Clock aria-hidden="true" className="h-3 w-3" />}
                    In Prüfung
                  </button>
                )}
                {it.status !== 'rejected' && (
                  <button
                    onClick={() => { if (confirm('Antrag ablehnen?')) updateStatus(it.id, 'rejected'); }}
                    disabled={busyId === it.id}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-100 disabled:opacity-60"
                  >
                    <XCircle aria-hidden="true" className="h-3 w-3" />
                    Ablehnen
                  </button>
                )}
                {it.status !== 'approved' && (
                  <button
                    onClick={() => { if (confirm('Antrag freigeben? Praxis wird als „verifiziert" markiert.')) updateStatus(it.id, 'approved'); }}
                    disabled={busyId === it.id}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <CheckCircle2 aria-hidden="true" className="h-3 w-3" />
                    Freigeben
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Keine Anfragen im Status „{STATUS_TABS.find((t) => t.key === status)?.label}“.
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    new: { label: 'Neu', className: 'border-sky-200 bg-sky-50 text-sky-800' },
    in_review: { label: 'In Prüfung', className: 'border-amber-200 bg-amber-50 text-amber-800' },
    approved: { label: 'Freigegeben', className: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
    rejected: { label: 'Abgelehnt', className: 'border-red-200 bg-red-50 text-red-800' },
  };
  const cfg = map[status] || { label: status, className: 'border-slate-200 bg-slate-50 text-slate-700' };
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${cfg.className}`}>{cfg.label}</span>;
}

function roleLabel(role) {
  return { inhaber: 'Inhaber:in / Ärzt:in', praxismanager: 'Praxis-Management', sonstige: 'Autorisierte Person' }[role] || role;
}
