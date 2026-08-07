'use client';

// Legacy Referrer Rescue - Monitoring Dashboard.
// Zeigt, wie viele Nutzer per alter Domain (ärzte-online.org) auf navoria.de landen,
// und wie viele davon erfolgreich auf konkrete Praxis-Seiten umgeleitet werden.

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Rewind, CheckCircle2, AlertTriangle, TrendingUp, Clock, ExternalLink, RefreshCw, ArrowLeft,
  Search, Info, Shield,
} from 'lucide-react';

const WINDOWS = [
  { days: 1, label: '24h' },
  { days: 7, label: '7 Tage' },
  { days: 30, label: '30 Tage' },
  { days: 90, label: '90 Tage' },
];

export default function LegacyRescueDashboard() {
  const [token, setToken] = useState(null);
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('navoria_admin_token') : null;
    setToken(t);
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/legacy-rescue-stats?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.status === 401) {
        try { localStorage.removeItem('navoria_admin_token'); } catch { /* ignore */ }
        setToken(null);
        setErr('Sitzung abgelaufen. Bitte neu einloggen.');
        setTimeout(() => { if (typeof window !== 'undefined') window.location.href = '/admin?redirect=/admin/legacy-rescue'; }, 1500);
        return;
      }
      if (!r.ok) throw new Error(`Status ${r.status}`);
      setData(await r.json());
      setErr(null);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }, [token, days]);

  useEffect(() => { load(); }, [load]);

  if (!token) {
    return (
      <div className="mx-auto max-w-md p-6">
        <p className="text-sm text-slate-600">Nicht eingeloggt. <Link href="/admin?redirect=/admin/legacy-rescue" className="text-emerald-700 underline">Zum Login</Link></p>
      </div>
    );
  }

  const successRate = data?.success_rate_percent || 0;
  const isHealthy = successRate >= 60;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-3.5 w-3.5" /> Zurück
          </Link>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <Rewind className="h-6 w-6 text-emerald-700" /> Legacy Referrer Rescue
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Nutzer, die per alter Domain (ärzte-online.org) auf navoria.de landen, werden auf konkrete Praxis-Seiten umgeleitet.
          </p>
        </div>
        <button type="button" onClick={load} disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-emerald-300 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Aktualisieren
        </button>
      </div>

      {/* Zeitraum */}
      <div className="mb-6 flex flex-wrap gap-2">
        {WINDOWS.map((w) => (
          <button key={w.days} type="button" onClick={() => setDays(w.days)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              days === w.days
                ? 'border border-emerald-600 bg-emerald-600 text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-emerald-300'
            }`}>
            {w.label}
          </button>
        ))}
      </div>

      {err && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="mr-1 inline h-4 w-4" /> {err}
        </div>
      )}

      {/* Diagnose-Panel: sofortige Ursachen-Analyse warum Rescue evtl. 0 zeigt */}
      {data?.diagnostics && (
        <div className="mb-6 rounded-2xl border border-sky-200 bg-sky-50/60 p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <Search className="h-4 w-4 text-sky-700" /> Diagnose · Homepage-Traffic der letzten {data.window_days}&nbsp;Tage
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-white p-3 shadow-sm">
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Hits auf /</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{data.diagnostics.homepage_hits_total ?? '—'}</p>
              <p className="text-xs text-slate-500">Nutzer (ohne Bots)</p>
            </div>
            <div className="rounded-lg bg-white p-3 shadow-sm">
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Ohne Referer</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {data.diagnostics.homepage_hits_no_referer ?? '—'}
                {data.diagnostics.homepage_hits_total > 0 && (
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    ({Math.round((data.diagnostics.homepage_hits_no_referer / data.diagnostics.homepage_hits_total) * 100)}%)
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-500">Direkt / Bookmark / stripped</p>
            </div>
            <div className="rounded-lg bg-white p-3 shadow-sm">
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Mit Referer</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-700">{data.diagnostics.homepage_hits_with_referer ?? 0}</p>
              <p className="text-xs text-slate-500">Nutzbar für Rescue</p>
            </div>
            <div className="rounded-lg bg-white p-3 shadow-sm">
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Legacy-Signal / kein Rescue</p>
              <p className={`mt-1 text-2xl font-semibold ${data.diagnostics.homepage_hits_with_legacy_referer_but_no_rescue > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                {data.diagnostics.homepage_hits_with_legacy_referer_but_no_rescue ?? 0}
              </p>
              <p className="text-xs text-slate-500">Regex matcht, Pfad aber leer</p>
            </div>
          </div>

          {/* Top externe Referer */}
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">Top externe Referer (Homepage-Landings)</p>
            {data.diagnostics.top_external_referers?.length ? (
              <ul className="mt-2 divide-y divide-slate-100 rounded-lg bg-white">
                {data.diagnostics.top_external_referers.map((r, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      {r.is_legacy && <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800">Legacy</span>}
                      <a href={`https://${r.host}`} target="_blank" rel="noopener noreferrer"
                        className="truncate font-mono text-xs text-slate-700 hover:text-emerald-700">{r.host}</a>
                    </div>
                    <span className="tabular-nums text-slate-600">{r.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-2 rounded-lg bg-white p-3 text-xs text-slate-500">
                Keine externen Referer registriert. Die Wahrscheinlichste Ursache: Modernen Browsern (Chrome/Safari mit strict Referrer-Policy) senden bei cross-site Navigation nur die Origin — und das wird oft gefiltert oder ist die Praxis-Alt-Domain, die ihre <code>Referrer-Policy</code> auf <code>same-origin</code> gesetzt hat.
              </div>
            )}
          </div>

          {/* Interpretations-Guide */}
          {data.diagnostics.homepage_hits_total > 0 && data.diagnostics.homepage_hits_with_referer === 0 && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">Warum steht der Rescue-Zähler auf 0?</p>
                <p className="mt-1">Bei <strong>{data.diagnostics.homepage_hits_total}</strong> Homepage-Landings war <strong>0×</strong> ein Referer verfügbar. Ursachen:</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  <li><strong>Alt-Domain hat Referrer-Policy</strong> <code>no-referrer</code>/<code>same-origin</code> gesetzt — dann leiten Browser gar keinen Header weiter.</li>
                  <li>Traffic kommt von Bookmarks, Direkteingaben, E-Mail-Clients oder Suchmaschinen-Snippets (kein Referer).</li>
                  <li>Alte Domain nutzt Meta-Refresh statt HTTP-301 — dann sind Referer meist leer.</li>
                </ul>
                <p className="mt-1"><strong>Was hilft?</strong> Prüfe ob die alte Domain (rzte-online.vercel.app) einen HTTP 301-Redirect setzt <em>und</em> keine strenge Referrer-Policy. Alternative: Setze auf der Alt-Domain einen <code>?src=legacy</code>-Parameter der auf navoria.de mitgereicht wird.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Gesamt-Rescues</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{data?.total_rescues ?? '–'}</p>
          <p className="mt-1 text-xs text-slate-500">In den letzten {data?.window_days || days} Tagen</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Direkt-Treffer</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-700">{data?.concrete_hits ?? '–'}</p>
          <p className="mt-1 text-xs text-slate-500">Konkrete Praxis gefunden</p>
        </div>
        <div className={`rounded-xl border p-4 ${isHealthy ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Trefferquote</p>
          <p className={`mt-2 text-3xl font-semibold ${isHealthy ? 'text-emerald-700' : 'text-amber-800'}`}>{successRate}%</p>
          <p className="mt-1 text-xs text-slate-500">Ziel: ≥ 60% direkt-treffer</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Kategorie-Fallback</p>
          <p className="mt-2 text-3xl font-semibold text-slate-700">{(data?.total_rescues || 0) - (data?.concrete_hits || 0)}</p>
          <p className="mt-1 text-xs text-slate-500">Übersichtsseite statt Praxis</p>
        </div>
      </div>

      {/* Tages-Trend */}
      {data?.daily?.length > 0 && (
        <div className="mt-8 rounded-xl border border-slate-100 bg-white p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <TrendingUp className="h-5 w-5 text-emerald-700" /> Verlauf pro Tag
          </h2>
          <div className="mt-4 space-y-1.5">
            {data.daily.map((d) => {
              const total = d.total || 0;
              const concrete = d.concrete || 0;
              const max = Math.max(...data.daily.map((x) => x.total || 0), 1);
              return (
                <div key={d.day} className="flex items-center gap-3 text-xs">
                  <span className="w-24 shrink-0 text-slate-500">{d.day}</span>
                  <div className="relative h-6 flex-1 overflow-hidden rounded bg-slate-100">
                    <div className="h-full bg-slate-300" style={{ width: `${(total / max) * 100}%` }} />
                    <div className="absolute inset-y-0 left-0 h-full bg-emerald-500" style={{ width: `${(concrete / max) * 100}%` }} />
                  </div>
                  <span className="w-32 shrink-0 tabular-nums text-slate-700">{concrete}/{total} · {total > 0 ? Math.round((concrete / total) * 100) : 0}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Aufteilung nach Kategorie */}
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-white p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">Ergebnis-Verteilung</h3>
          <ul className="mt-3 space-y-2">
            {(data?.by_result || []).map((r) => (
              <li key={r.result} className="flex items-center justify-between text-sm">
                <span className={r.result === 'concrete' ? 'font-medium text-emerald-700' : 'text-slate-600'}>
                  {resultLabel(r.result)}
                </span>
                <span className="font-mono text-slate-800">{r.count}</span>
              </li>
            ))}
            {!data?.by_result?.length && <li className="text-sm text-slate-400">Keine Daten</li>}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">Top Städte</h3>
          <ul className="mt-3 space-y-2">
            {(data?.by_city || []).slice(0, 10).map((r) => (
              <li key={r.city} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{r.city}</span>
                <span className="font-mono text-slate-800">{r.count}</span>
              </li>
            ))}
            {!data?.by_city?.length && <li className="text-sm text-slate-400">Keine Daten</li>}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">Top Fachrichtungen</h3>
          <ul className="mt-3 space-y-2">
            {(data?.by_specialty || []).slice(0, 10).map((r) => (
              <li key={r.specialty} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{r.specialty}</span>
                <span className="font-mono text-slate-800">{r.count}</span>
              </li>
            ))}
            {!data?.by_specialty?.length && <li className="text-sm text-slate-400">Keine Daten</li>}
          </ul>
        </div>
      </div>

      {/* Top Praxis-Ziele */}
      {data?.top_targets?.length > 0 && (
        <div className="mt-8 rounded-xl border border-slate-100 bg-white p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Top gerettete Praxis-Ziele
          </h3>
          <ul className="mt-3 divide-y divide-slate-100">
            {data.top_targets.map((t) => (
              <li key={t.target} className="flex items-center justify-between gap-2 py-2 text-sm">
                <a href={t.target} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 truncate text-emerald-700 hover:underline">
                  {t.target} <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
                <span className="font-mono text-slate-800">{t.count}×</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent Rescues */}
      {data?.recent?.length > 0 && (
        <div className="mt-8 rounded-xl border border-slate-100 bg-white p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Clock className="h-4 w-4 text-slate-500" /> Letzte Rescue-Events
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-widest text-slate-500">
                  <th className="py-2 pr-3">Zeit</th>
                  <th className="py-2 pr-3">Legacy-Pfad</th>
                  <th className="py-2 pr-3">Ergebnis</th>
                  <th className="py-2">Ziel</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((r, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    <td className="py-2 pr-3 text-xs text-slate-500">{new Date(r.timestamp).toLocaleString('de-DE')}</td>
                    <td className="py-2 pr-3 font-mono text-xs text-slate-700">{r.legacy_path}</td>
                    <td className="py-2 pr-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                        r.result === 'concrete' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {resultLabel(r.result)}
                      </span>
                    </td>
                    <td className="py-2">
                      <a href={r.redirect_target} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-emerald-700 hover:underline">
                        {r.redirect_target}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data && data.total_rescues === 0 && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          <p className="font-medium text-slate-800">Noch keine Rescue-Events im gewählten Zeitraum.</p>
          <p className="mt-2">Mögliche Gründe:</p>
          <ul className="mt-2 list-disc pl-5">
            <li>Der aktuelle Docker-Build wurde noch nicht deployed – der Rescue mit DB-Logging existiert erst seit diesem Deployment.</li>
            <li>Legacy-Traffic wird von der alten Domain nicht mehr per Referer weitergegeben (z. B. weil <code>meta referrer=&quot;no-referrer&quot;</code> gesetzt ist).</li>
            <li>Der Traffic-Peak (~2 900/Tag) findet inzwischen an anderer Stelle statt – prüfen Sie Analytics.</li>
          </ul>
        </div>
      )}
    </div>
  );
}

function resultLabel(k) {
  if (!k) return 'unbekannt';
  return {
    concrete: 'Konkrete Praxis',
    category_city_specialty: 'Stadt + Fachrichtung',
    category_specialty: 'Nur Fachrichtung',
    category_city: 'Nur Stadt',
    category_all: 'Alle Ärzte',
    invalid: 'Ungültig',
  }[k] || k;
}
