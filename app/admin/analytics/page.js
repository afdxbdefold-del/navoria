'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Activity, MapPin, Users, TrendingUp, Bot, Smartphone, Monitor, Tablet, RefreshCw, ArrowUp, ArrowDown, Minus, ExternalLink, Globe } from 'lucide-react';

const REFRESH_MS = 15000;

export default function AdminAnalytics() {
  const [token, setToken] = useState(null);
  const [live, setLive] = useState(null);
  const [summary, setSummary] = useState(null);
  const [err, setErr] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('navoria_admin_token') : null;
    setToken(t);
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [r1, r2] = await Promise.all([
        fetch('/api/admin/analytics/live', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/analytics/summary', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!r1.ok || !r2.ok) throw new Error(`Status: ${r1.status}/${r2.status}`);
      setLive(await r1.json());
      setSummary(await r2.json());
      setLastUpdated(new Date());
      setErr(null);
    } catch (e) {
      setErr(String(e.message || e));
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    load();
    if (!autoRefresh) return undefined;
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [token, autoRefresh, load]);

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
            <span className="text-slate-700">Live-Analytics</span>
          </div>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
            <Activity aria-hidden="true" className="h-6 w-6 text-sky-600" />
            Live-Analytics
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            First-Party, DSGVO-freundlich · Auto-Refresh alle 15&nbsp;s
            {lastUpdated && <span> · zuletzt {lastUpdated.toLocaleTimeString('de-DE')}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 text-xs text-slate-600">
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
            Auto-Refresh
          </label>
          <button onClick={load} className="btn-secondary text-xs">
            <RefreshCw aria-hidden="true" className="mr-1.5 h-3.5 w-3.5" /> Aktualisieren
          </button>
        </div>
      </header>

      {err && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Fehler beim Laden: {err}
        </div>
      )}

      {/* Live counter */}
      <section className="mb-6 grid gap-3 md:grid-cols-4">
        <MetricCard
          icon={<Users className="h-5 w-5" />}
          label="Nutzer online (5 min)"
          value={live?.active_sessions ?? '—'}
          accent="sky"
          highlight
        />
        <MetricCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Aufrufe heute"
          value={summary?.today?.pageviews ?? '—'}
          delta={summary && diffPct(summary.today?.pageviews, summary.yesterday?.pageviews)}
        />
        <MetricCard
          icon={<Users className="h-5 w-5" />}
          label="Unique Sessions heute"
          value={summary?.today?.sessions ?? '—'}
          delta={summary && diffPct(summary.today?.sessions, summary.yesterday?.sessions)}
        />
        <MetricCard
          icon={<Bot className="h-5 w-5" />}
          label="Bot-Aufrufe heute"
          value={summary?.today?.bots ?? '—'}
          accent="slate"
        />
      </section>

      {/* Vergleich Gestern */}
      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Heute vs. Gestern</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <SmallStat label="Aufrufe gestern" value={summary?.yesterday?.pageviews ?? '—'} />
          <SmallStat label="Sessions gestern" value={summary?.yesterday?.sessions ?? '—'} />
          <SmallStat label="Aufrufe letzte 7 Tage" value={summary?.last_7_days?.pageviews ?? '—'} />
        </div>
      </section>

      {/* Live user list */}
      <section className="mb-8 rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h2 className="text-base font-semibold text-slate-900">Aktive Sessions</h2>
          <span className="text-xs text-slate-500">Fenster: 5 Minuten · Bots ausgeschlossen</span>
        </div>
        {live?.users?.length ? (
          <div className="max-h-[420px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Session</th>
                  <th className="px-4 py-2 text-left font-medium">Standort</th>
                  <th className="px-4 py-2 text-left font-medium">Gerät</th>
                  <th className="px-4 py-2 text-left font-medium">Aktuelle Seite</th>
                  <th className="px-4 py-2 text-right font-medium">Aufrufe</th>
                  <th className="px-4 py-2 text-right font-medium">Zuletzt</th>
                </tr>
              </thead>
              <tbody>
                {live.users.map((u, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-none hover:bg-sky-50/40">
                    <td className="px-4 py-2 font-mono text-xs text-slate-500">{u.session_id || '—'}</td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />
                        {u.city ? <>{u.city}{u.country ? `, ${u.country}` : ''}</> : (u.country || <span className="text-slate-400">unbekannt</span>)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        {u.device === 'mobile' && <Smartphone aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />}
                        {u.device === 'desktop' && <Monitor aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />}
                        {u.device === 'tablet' && <Tablet aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />}
                        {u.device || '—'} · {u.browser || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <a href={u.last_path} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-800">
                        {u.last_path}
                        <ExternalLink aria-hidden="true" className="h-3 w-3 opacity-60" />
                      </a>
                    </td>
                    <td className="px-4 py-2 text-right text-slate-600">{u.pageviews_in_window}</td>
                    <td className="px-4 py-2 text-right text-xs text-slate-500">{relativeTime(u.last_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-8 text-center text-sm text-slate-500">
            Keine aktiven Sessions in den letzten 5 Minuten.
          </div>
        )}
      </section>

      {/* Grid: Top-Städte / Top-Länder / Top-Seiten / Bots */}
      <section className="grid gap-4 md:grid-cols-2">
        <ListCard
          title="Top-Städte heute"
          icon={<MapPin className="h-4 w-4 text-sky-600" />}
          items={summary?.top_cities_today?.map((c) => ({
            label: `${c.city}${c.country ? ` (${c.country})` : ''}`,
            value: c.uniques,
          })) || []}
          valueLabel="Unique"
        />
        <ListCard
          title="Top-Länder heute"
          icon={<Globe className="h-4 w-4 text-sky-600" />}
          items={summary?.top_countries_today?.map((c) => ({
            label: countryFlag(c.country) + ' ' + c.country,
            value: c.uniques,
          })) || []}
          valueLabel="Unique"
        />
        <ListCard
          title="Top-Seiten heute"
          icon={<TrendingUp className="h-4 w-4 text-sky-600" />}
          items={summary?.top_paths_today?.map((p) => ({
            label: p.path,
            value: p.views,
            secondary: `${p.uniques} unique`,
            link: p.path,
          })) || []}
          valueLabel="PV"
        />
        <ListCard
          title="Bot-Traffic heute"
          icon={<Bot className="h-4 w-4 text-slate-500" />}
          items={summary?.top_bots_today?.map((b) => ({
            label: b.bot || 'unknown',
            value: b.hits,
          })) || []}
          valueLabel="Hits"
        />
      </section>

      {/* Devices */}
      {summary?.devices_today?.length > 0 && (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Geräte-Verteilung heute</h2>
          <div className="flex flex-wrap gap-3">
            {summary.devices_today.map((d, i) => (
              <div key={i} className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm text-slate-700">
                {d.device === 'mobile' && <Smartphone aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />}
                {d.device === 'desktop' && <Monitor aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />}
                {d.device === 'tablet' && <Tablet aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />}
                <strong>{d.device}</strong>: {d.uniques}
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
        <h3 className="text-sm font-semibold text-slate-900">Datenschutz-Hinweis</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          Diese Analytics läuft rein first-party. Wir speichern keine IP-Adressen im Klartext – nur einen SHA-256-Hash mit einem täglich rotierenden Salt.
          Die Session-ID ist ein 1st-party Cookie (strictly-necessary, keine Einwilligung erforderlich). Rohdaten werden nach 90 Tagen automatisch gelöscht (MongoDB TTL).
          Standort-Daten stammen aus Vercel-Edge-Headern (nur auf Vercel deployed verfügbar; auf Emergent zeigt der Standort „unbekannt“ an).
        </p>
      </footer>
    </div>
  );
}

function MetricCard({ icon, label, value, delta, accent = 'sky', highlight = false }) {
  const accentBg = { sky: 'bg-sky-50 text-sky-700', slate: 'bg-slate-100 text-slate-600', amber: 'bg-amber-50 text-amber-700' }[accent] || 'bg-sky-50 text-sky-700';
  return (
    <div className={`rounded-2xl border ${highlight ? 'border-sky-200 bg-gradient-to-br from-sky-50 to-white' : 'border-slate-200 bg-white'} p-5`}>
      <div className="flex items-center justify-between">
        <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${accentBg}`}>{icon}</div>
        {delta && <DeltaBadge value={delta} />}
      </div>
      <div className="mt-3 text-3xl font-semibold tabular-nums text-slate-900">{typeof value === 'number' ? value.toLocaleString('de-DE') : value}</div>
      <div className="mt-1 text-xs text-slate-500">{label}</div>
    </div>
  );
}

function DeltaBadge({ value }) {
  if (!value || value.type === 'none') return null;
  const cfg = {
    up: { icon: <ArrowUp aria-hidden="true" className="h-3 w-3" />, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    down: { icon: <ArrowDown aria-hidden="true" className="h-3 w-3" />, className: 'bg-red-50 text-red-700 border-red-200' },
    flat: { icon: <Minus aria-hidden="true" className="h-3 w-3" />, className: 'bg-slate-50 text-slate-600 border-slate-200' },
  }[value.type];
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${cfg.className}`}>
      {cfg.icon}
      {value.label}
    </span>
  );
}

function SmallStat({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
      <div className="text-xl font-semibold tabular-nums text-slate-900">{typeof value === 'number' ? value.toLocaleString('de-DE') : value}</div>
      <div className="mt-0.5 text-xs text-slate-500">{label}</div>
    </div>
  );
}

function ListCard({ title, icon, items, valueLabel }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          {icon} {title}
        </h3>
        <span className="text-[10px] uppercase tracking-wide text-slate-400">{valueLabel}</span>
      </div>
      {items.length ? (
        <ul className="divide-y divide-slate-50">
          {items.map((it, i) => (
            <li key={i} className="flex items-center justify-between px-5 py-2 text-sm hover:bg-sky-50/40">
              <div className="min-w-0 flex-1 truncate pr-4">
                {it.link ? (
                  <a href={it.link} target="_blank" rel="noreferrer" className="text-slate-800 hover:text-sky-700">{it.label}</a>
                ) : (
                  <span className="text-slate-800">{it.label}</span>
                )}
                {it.secondary && <span className="ml-2 text-xs text-slate-400">{it.secondary}</span>}
              </div>
              <span className="tabular-nums text-slate-600">{typeof it.value === 'number' ? it.value.toLocaleString('de-DE') : it.value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-5 py-6 text-center text-sm text-slate-400">Noch keine Daten.</div>
      )}
    </div>
  );
}

function diffPct(current, previous) {
  if (current == null || previous == null) return null;
  if (previous === 0) return current > 0 ? { type: 'up', label: 'neu' } : { type: 'flat', label: '0%' };
  const d = ((current - previous) / previous) * 100;
  if (Math.abs(d) < 1) return { type: 'flat', label: '≈' };
  return d > 0 ? { type: 'up', label: `+${d.toFixed(0)}%` } : { type: 'down', label: `${d.toFixed(0)}%` };
}

function relativeTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 5) return 'jetzt';
  if (s < 60) return `vor ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `vor ${m} min`;
  const h = Math.floor(m / 60);
  return `vor ${h} h`;
}

function countryFlag(code) {
  if (!code || code.length !== 2) return '🏳️';
  const OFFSET = 127397;
  return String.fromCodePoint(...code.toUpperCase().split('').map((c) => c.charCodeAt(0) + OFFSET));
}
