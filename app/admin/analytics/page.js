'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Activity, MapPin, Users, TrendingUp, Bot, Smartphone, Monitor, Tablet, RefreshCw, ArrowUp, ArrowDown, Minus, ExternalLink, Globe, Building2, Stethoscope, ChevronDown, Timer, MousePointerClick, Layers } from 'lucide-react';
import { SPECIALTIES } from '@/lib/specialties';

// City-Slug → Anzeigename (formatiert)
function cityLabel(slug) {
  if (!slug) return '?';
  return slug.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}
// Specialty-Slug → Plural-Label aus SPECIALTIES-Katalog
function specialtyLabel(slug) {
  if (!slug) return '?';
  const spec = SPECIALTIES.find((s) => s.slug === slug);
  return spec ? spec.plural : slug;
}

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
      // Auth-Ablauf: Token entfernen, User zur Login-Seite schicken.
      if (r1.status === 401 || r2.status === 401) {
        try { localStorage.removeItem('navoria_admin_token'); } catch { /* ignore */ }
        setToken(null);
        setErr('Ihre Admin-Sitzung ist abgelaufen. Bitte erneut anmelden.');
        if (typeof window !== 'undefined') {
          setTimeout(() => { window.location.href = '/admin?redirect=/admin/analytics'; }, 1500);
        }
        return;
      }
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
          <Link href="/admin/bots" className="btn-secondary text-xs">Bot-Detail →</Link>
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

      {/* Engagement-Metriken: Bounce Rate + Time on Page */}
      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900">
          <MousePointerClick aria-hidden="true" className="h-4 w-4 text-sky-600" />
          Engagement-Metriken
        </h2>
        <div className="grid gap-3 md:grid-cols-4">
          <EngagementCard
            icon={<MousePointerClick className="h-5 w-5" />}
            label="Bounce Rate heute"
            value={summary?.today?.bounce_rate_percent != null ? `${summary.today.bounce_rate_percent}%` : '—'}
            delta={summary && diffPct(summary.yesterday?.bounce_rate_percent, summary.today?.bounce_rate_percent)}
            deltaHint="niedriger = besser"
            good={summary?.today?.bounce_rate_percent != null && summary.today.bounce_rate_percent < 60}
            sub={`7 Tage: ${summary?.last_7_days?.bounce_rate_percent ?? '—'}%`}
          />
          <EngagementCard
            icon={<Timer className="h-5 w-5" />}
            label="Ø Zeit pro Seite"
            value={fmtDuration(summary?.today?.avg_time_on_page_seconds)}
            delta={summary && diffPct(summary.today?.avg_time_on_page_seconds, summary.yesterday?.avg_time_on_page_seconds)}
            deltaHint="höher = besser"
            good={summary?.today?.avg_time_on_page_seconds > 30}
            sub={`7 Tage: ${fmtDuration(summary?.last_7_days?.avg_time_on_page_seconds)}`}
          />
          <EngagementCard
            icon={<Layers className="h-5 w-5" />}
            label="Seiten / Session"
            value={summary?.today?.pages_per_session ?? '—'}
            delta={summary && diffPct(summary.today?.pages_per_session, summary.yesterday?.pages_per_session)}
            deltaHint="höher = besser"
            good={summary?.today?.pages_per_session > 1.5}
            sub={`7 Tage: ${summary?.last_7_days?.pages_per_session ?? '—'}`}
          />
          <EngagementCard
            icon={<Activity className="h-5 w-5" />}
            label="Ø Session-Dauer"
            value={fmtDuration(summary?.today?.avg_session_duration_seconds)}
            deltaHint="Multi-Pageview"
            good={summary?.today?.avg_session_duration_seconds > 60}
            sub={`7 Tage: ${fmtDuration(summary?.last_7_days?.avg_session_duration_seconds)}`}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Bounce = Sessions mit nur 1 Aufruf. Zeit pro Seite = Median Delta zwischen aufeinanderfolgenden Pageviews (gekappt bei 30 Min). Bots ausgeschlossen.
        </p>
      </section>

      {/* Top Bounce & Top Time-on-Page */}
      <section className="mb-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <h3 className="text-base font-semibold text-slate-900">Höchste Bounce-Rates (7d)</h3>
            <span className="text-xs text-slate-500">Startseiten mit min. 10 Sessions</span>
          </div>
          {summary?.top_bounce_paths_7d?.length ? (
            <ul className="divide-y divide-slate-50">
              {summary.top_bounce_paths_7d.slice(0, 10).map((r, i) => (
                <li key={i} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
                  <a href={r.path} target="_blank" rel="noreferrer"
                    className="truncate text-sky-700 hover:text-sky-800">{r.path}</a>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-500">{r.sessions} S.</span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.bounce_rate >= 80 ? 'bg-red-100 text-red-800' :
                      r.bounce_rate >= 60 ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>{Math.round(r.bounce_rate)}%</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-6 text-sm text-slate-500">Noch keine Daten. Braucht Sessions mit min. 10 Aufrufen pro Startseite.</p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <h3 className="text-base font-semibold text-slate-900">Höchste Zeit pro Seite (7d)</h3>
            <span className="text-xs text-slate-500">min. 5 Übergänge · gekappt bei 30 min</span>
          </div>
          {summary?.top_time_on_page_paths_7d?.length ? (
            <ul className="divide-y divide-slate-50">
              {summary.top_time_on_page_paths_7d.slice(0, 10).map((r, i) => (
                <li key={i} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
                  <a href={r.path} target="_blank" rel="noreferrer"
                    className="truncate text-sky-700 hover:text-sky-800">{r.path}</a>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-500">{r.samples}×</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800">
                      <Timer className="h-3 w-3" /> {fmtDuration(r.avg_time_seconds)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-6 text-sm text-slate-500">Noch keine Daten. Braucht Sessions mit min. 2 Pageviews.</p>
          )}
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
          title="Top-Städte (Besucher) heute"
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
          title="Top-Directory-Städte heute"
          icon={<Building2 className="h-4 w-4 text-teal-600" />}
          items={summary?.top_directory_cities_today?.map((c) => ({
            label: cityLabel(c.city_slug),
            value: c.views,
            secondary: `${c.uniques} unique`,
            link: `/aerzte/${c.city_slug}`,
          })) || []}
          valueLabel="PV"
          initialLimit={10}
        />
        <ListCard
          title="Top-Fachrichtungen heute"
          icon={<Stethoscope className="h-4 w-4 text-teal-600" />}
          items={summary?.top_directory_specialties_today?.map((c) => ({
            label: specialtyLabel(c.spec_slug),
            value: c.views,
            secondary: `${c.uniques} unique`,
            link: `/aerzte/fachrichtung/${c.spec_slug}`,
          })) || []}
          valueLabel="PV"
          initialLimit={10}
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
          initialLimit={10}
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

function EngagementCard({ icon, label, value, delta, deltaHint, good, sub }) {
  return (
    <div className={`relative rounded-2xl border p-4 shadow-sm ${good ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span className={good ? 'text-emerald-700' : 'text-slate-500'}>{icon}</span>
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={`text-2xl font-semibold tabular-nums ${good ? 'text-emerald-800' : 'text-slate-900'}`}>{value}</span>
        {delta && <DeltaBadge value={delta} />}
      </div>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
      {deltaHint && <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">{deltaHint}</p>}
    </div>
  );
}

function fmtDuration(seconds) {
  if (seconds == null || seconds === '' || Number.isNaN(seconds)) return '—';
  const s = Math.round(Number(seconds));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem > 0 ? `${m}m ${rem}s` : `${m}m`;
}

function ListCard({ title, icon, items, valueLabel, initialLimit = 10 }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = items.length > initialLimit;
  const visible = expanded ? items : items.slice(0, initialLimit);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          {icon} {title}
        </h3>
        <span className="text-[10px] uppercase tracking-wide text-slate-600">
          {items.length > 0 && <span className="mr-2 text-slate-400">{items.length}</span>}
          {valueLabel}
        </span>
      </div>
      {items.length ? (
        <>
          <ul className="divide-y divide-slate-50">
            {visible.map((it, i) => (
              <li key={i} className="flex items-center justify-between px-5 py-2 text-sm hover:bg-sky-50/40">
                <div className="flex min-w-0 flex-1 items-center gap-2 truncate pr-4">
                  <span className="w-6 shrink-0 text-right text-[11px] tabular-nums text-slate-400">{i + 1}.</span>
                  {it.link ? (
                    <a href={it.link} target="_blank" rel="noreferrer" className="truncate text-slate-800 hover:text-sky-700">{it.label}</a>
                  ) : (
                    <span className="truncate text-slate-800">{it.label}</span>
                  )}
                  {it.secondary && <span className="ml-1 shrink-0 text-xs text-slate-400">{it.secondary}</span>}
                </div>
                <span className="tabular-nums text-slate-600">{typeof it.value === 'number' ? it.value.toLocaleString('de-DE') : it.value}</span>
              </li>
            ))}
          </ul>
          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex w-full items-center justify-center gap-1 border-t border-slate-100 px-5 py-2 text-xs font-medium text-sky-700 hover:bg-sky-50"
            >
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              {expanded ? 'Weniger anzeigen' : `Alle ${items.length} anzeigen`}
            </button>
          )}
        </>
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
