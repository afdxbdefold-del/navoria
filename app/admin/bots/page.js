'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bot, ArrowLeft, RefreshCw, ChevronDown, ChevronRight, Globe, Clock, ExternalLink, Loader2 } from 'lucide-react';

const RANGES = [
  { key: 'today', label: 'Heute' },
  { key: '7d', label: 'Letzte 7 Tage' },
  { key: '30d', label: 'Letzte 30 Tage' },
];

const KNOWN_BOTS = {
  googlebot: { label: 'Googlebot', category: 'Suchmaschine', color: '#4285F4' },
  bingbot: { label: 'Bingbot', category: 'Suchmaschine', color: '#008373' },
  applebot: { label: 'Applebot', category: 'Suchmaschine', color: '#000000' },
  amazonbot: { label: 'Amazonbot', category: 'Suchmaschine', color: '#FF9900' },
  gptbot: { label: 'GPTBot (OpenAI)', category: 'AI-Crawler', color: '#10A37F' },
  claudebot: { label: 'ClaudeBot (Anthropic)', category: 'AI-Crawler', color: '#D97757' },
  perplexitybot: { label: 'PerplexityBot', category: 'AI-Crawler', color: '#20808D' },
  ccbot: { label: 'CCBot (Common Crawl)', category: 'AI-Crawler', color: '#6B7280' },
  semrushbot: { label: 'SemrushBot', category: 'SEO-Tool', color: '#FF642D' },
  ahrefsbot: { label: 'AhrefsBot', category: 'SEO-Tool', color: '#0060B9' },
  facebookexternalhit: { label: 'Facebook Bot', category: 'Social', color: '#1877F2' },
  twitterbot: { label: 'Twitterbot', category: 'Social', color: '#1DA1F2' },
  linkedinbot: { label: 'LinkedIn Bot', category: 'Social', color: '#0A66C2' },
  whatsapp: { label: 'WhatsApp', category: 'Social', color: '#25D366' },
  other: { label: 'Sonstige (nicht identifiziert)', category: 'Sonstige', color: '#94A3B8' },
};

function botMeta(name) {
  return KNOWN_BOTS[name] || { label: name || 'Unbekannt', category: 'Sonstige', color: '#94A3B8' };
}

function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

export default function BotsAdminPage() {
  const [token, setToken] = useState(null);
  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('navoria_admin_token') : null;
    if (t) setToken(t);
  }, []);

  if (!token) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <p className="text-sm text-slate-600">
          Nicht angemeldet. Bitte über <Link href="/admin" className="text-sky-700 underline">Admin-Login</Link>.
        </p>
      </div>
    );
  }
  return <BotsDashboard token={token} />;
}

function BotsDashboard({ token }) {
  const [range, setRange] = useState('today');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/bots?range=${range}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error(`${r.status}`);
      const j = await r.json();
      setData(j);
    } catch (e) {
      console.warn('load bots failed', e);
      setData({ totals: { hits: 0, unique_paths: 0, distinct_bots: 0 }, bots: [], hourly_all: [] });
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [range]);

  const toggle = (bot) => setExpanded((s) => ({ ...s, [bot]: !s[bot] }));
  const maxHourly = Math.max(1, ...(data?.hourly_all || []).map((h) => h.hits));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
        <Link href="/admin" className="hover:text-sky-700">Admin</Link>
        <span>/</span>
        <span className="text-slate-800">Bot-Traffic</span>
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
            <Bot className="h-6 w-6 text-sky-700" /> Bot-Traffic
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Detail-Ansicht aller Bot-Zugriffe: Anzahl, Zeitraum, Top-URLs und Stundenverlauf.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-xs">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`rounded-md px-3 py-1.5 font-medium transition ${range === r.key ? 'bg-sky-100 text-sky-800' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button onClick={load} className="btn-secondary" disabled={loading}>
            <RefreshCw className={`mr-1.5 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </button>
          <Link href="/admin" className="btn-secondary"><ArrowLeft className="mr-1.5 h-4 w-4" /> Zurück</Link>
        </div>
      </div>

      {/* Totals */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat icon={Bot} label="Bot-Requests" value={data?.totals?.hits ?? '—'} sub={`im Zeitraum: ${RANGES.find((r) => r.key === range)?.label}`} />
        <Stat icon={Globe} label="Unterschiedliche URLs" value={data?.totals?.unique_paths ?? '—'} sub="von Bots aufgerufen" />
        <Stat icon={Clock} label="Erkannte Bots" value={data?.totals?.distinct_bots ?? '—'} sub="mit unterschiedlichem Namen" />
      </div>

      {/* Hourly Chart */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-800">Stunden-Verlauf (letzte 24 h)</h2>
        {loading ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Lade …</p>
        ) : (data?.hourly_all?.length ? (
          <div className="mt-4 flex items-end gap-1" style={{ height: '90px' }}>
            {data.hourly_all.map((h, i) => {
              const height = Math.max(2, (h.hits / maxHourly) * 90);
              const hour = h.bucket.slice(11, 16);
              return (
                <div key={i} className="group relative flex-1" style={{ height: `${height}px`, background: '#0F7ACA', borderRadius: '2px' }} title={`${hour}: ${h.hits} Requests`}>
                  <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-white group-hover:block">{h.hits} · {hour}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Kein Bot-Traffic in den letzten 24 Stunden.</p>
        ))}
      </div>

      {/* Bot-Table */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-800">Bots im Detail</h2>
          <p className="text-xs text-slate-500">Klick auf eine Zeile für Top-URLs und Zeitraum.</p>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div>
        ) : (data?.bots?.length ? (
          <div className="divide-y divide-slate-100">
            {data.bots.map((b) => {
              const meta = botMeta(b.bot);
              const isOpen = !!expanded[b.bot];
              return (
                <div key={b.bot}>
                  <button
                    onClick={() => toggle(b.bot)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      {isOpen ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                      <div className="h-3 w-3 rounded-full" style={{ background: meta.color }} />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{meta.label}</div>
                        <div className="text-xs text-slate-500">{meta.category} · {b.paths_count} URLs · Erstmals {formatDateTime(b.first_seen)} · Zuletzt {formatDateTime(b.last_seen)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900">{b.hits.toLocaleString('de-DE')}</div>
                      <div className="text-[11px] text-slate-500">Requests</div>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50/40 px-5 py-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Top-URLs</h4>
                      <ul className="mt-2 space-y-1.5">
                        {b.top_paths.length === 0 && <li className="text-xs text-slate-400">Keine Daten.</li>}
                        {b.top_paths.map((p) => (
                          <li key={p.path} className="flex items-center justify-between gap-3 text-xs">
                            <a href={p.path} target="_blank" rel="noreferrer" className="flex-1 truncate text-slate-700 hover:text-sky-700 hover:underline">
                              {p.path}
                              <ExternalLink className="ml-1 inline h-3 w-3 opacity-50" />
                            </a>
                            <span className="whitespace-nowrap font-medium text-slate-600">{p.hits.toLocaleString('de-DE')} Hits</span>
                          </li>
                        ))}
                      </ul>
                      {b.hourly?.length > 0 && (
                        <>
                          <h4 className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Stunden-Verlauf (24h)</h4>
                          <div className="mt-2 flex items-end gap-0.5" style={{ height: '40px' }}>
                            {b.hourly.map((h, i) => {
                              const maxLocal = Math.max(...b.hourly.map((x) => x.hits));
                              const height = Math.max(2, (h.hits / maxLocal) * 40);
                              return <div key={i} className="flex-1" style={{ height: `${height}px`, background: meta.color, opacity: 0.75, borderRadius: '2px' }} title={`${h.bucket.slice(11, 16)}: ${h.hits}`} />;
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500">Kein Bot-Traffic im gewählten Zeitraum.</p>
            <p className="mt-2 text-xs text-slate-400">Hinweis: Nur Bots, die JavaScript ausführen (moderne Suchmaschinen, AI-Crawler), erscheinen hier.</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-slate-400">
        Datenquelle: <code className="rounded bg-slate-100 px-1 py-0.5">page_views</code>-Collection · Bot-Erkennung via User-Agent-Regex ·
        Bots ohne JavaScript-Rendering werden nicht erfasst (fehlt Server-Side-Log).
      </p>
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {typeof value === 'number' ? value.toLocaleString('de-DE') : value}
      </div>
      {sub && <div className="mt-1 text-[11px] text-slate-500">{sub}</div>}
    </div>
  );
}
