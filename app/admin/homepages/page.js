'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Home, ExternalLink, MapPin, Phone, Loader2, RefreshCw, ShieldCheck, ShieldX, AlertTriangle, Trash2 } from 'lucide-react';

export default function AdminHomepagesPage() {
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
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/homepages', { headers: authHeaders });
      if (r.status === 401) { toast.error('Sitzung abgelaufen'); window.location.href = '/admin'; return; }
      const data = await r.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      setSelected(new Set());
    } catch { toast.error('Fehler beim Laden'); }
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const selectAll = () => setSelected(new Set(items.map((it) => it.id)));
  const selectNone = () => setSelected(new Set());

  const bulkDeactivate = async () => {
    const count = selected.size;
    if (count === 0) return toast.error('Keine Praxen ausgewählt');
    if (!confirm(`${count} Homepage(s) deaktivieren?\n\nDie Root-URLs (z.B. /jaroslaw-raczynski) leiten danach automatisch (301) auf den Verzeichnis-Eintrag um. Der homepage_slug bleibt erhalten – bei Reaktivierung wird dieselbe URL wieder aktiv.\n\nFortsetzen?`)) return;
    setBulkBusy(true);
    try {
      const r = await fetch('/api/admin/homepages/bulk-deactivate', {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      toast.success(`${data.modified} Homepage(s) deaktiviert – URLs leiten jetzt auf Verzeichnis-Einträge um`);
      await load();
    } catch (err) { toast.error(`Fehler: ${err.message}`); }
    setBulkBusy(false);
  };

  const singleDeactivate = async (doc) => {
    if (!confirm(`Homepage von "${doc.name}" deaktivieren?\n\nDie URL /${doc.homepage_slug} leitet danach automatisch auf den Verzeichnis-Eintrag um.`)) return;
    try {
      const r = await fetch(`/api/admin/doctors/${doc.id}/homepage`, {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ enabled: false, mode_only: true }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      toast.success('Deaktiviert – URL leitet jetzt auf Verzeichnis-Eintrag um');
      await load();
    } catch (err) { toast.error(`Fehler: ${err.message}`); }
  };

  const daysBadge = (days) => {
    if (days == null) return null;
    if (days < 14) return { label: `🕒 ${days} Tage aktiv`, cls: 'border-emerald-200 bg-emerald-50 text-emerald-800' };
    if (days < 30) return { label: `🕒 ${days} Tage aktiv`, cls: 'border-slate-200 bg-slate-50 text-slate-700' };
    if (days < 60) return { label: `⚠️ ${days} Tage – Claim erfolgt?`, cls: 'border-orange-200 bg-orange-50 text-orange-800' };
    return { label: `🔴 ${days} Tage – bitte prüfen`, cls: 'border-rose-200 bg-rose-50 text-rose-800' };
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <Link href="/admin" className="mb-4 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-sky-700">
        <ArrowLeft className="h-3.5 w-3.5" /> Zurück zum Dashboard
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
            <Home className="h-6 w-6 text-purple-700" /> Aktive Praxis-Homepages
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Temporäre Homepages im Homepage-Modus. Nach Google-Business-Freischaltung deaktivieren – die URL bleibt via 301-Redirect auf den Verzeichnis-Eintrag nutzbar.
          </p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Aktualisieren
        </button>
      </div>

      {/* Info-Box */}
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-purple-200 bg-purple-50/50 p-4 text-sm text-purple-900">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
        <div>
          <p className="font-semibold">Sinn dieser temporären Homepages</p>
          <p className="mt-1 leading-relaxed">
            Die Homepages werden generiert, damit Praxen ohne Website eine öffentliche URL für die
            <strong> Google-Business-Inhaberschafts-Verifizierung</strong> vorweisen können. Sobald die Praxis den
            Google-Business-Eintrag beansprucht hat, sollte die Homepage <strong>deaktiviert werden</strong>. Danach bleibt
            nur der Verzeichnis-Eintrag online, die Root-URL leitet automatisch dorthin um.
          </p>
        </div>
      </div>

      {/* Bulk-Aktionen */}
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3">
        <span className="text-sm text-slate-600">
          {items.length} aktive Homepage{items.length !== 1 ? 's' : ''}
          {selected.size > 0 && <span className="ml-2 font-semibold text-purple-800">· {selected.size} ausgewählt</span>}
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          <button onClick={selectAll} className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs hover:bg-slate-50" disabled={items.length === 0}>Alle auswählen</button>
          <button onClick={selectNone} className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs hover:bg-slate-50" disabled={selected.size === 0}>Keine</button>
          <button
            onClick={bulkDeactivate}
            disabled={bulkBusy || selected.size === 0}
            className="inline-flex items-center gap-1.5 rounded-md bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-800 disabled:opacity-50"
          >
            {bulkBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            {selected.size > 0 ? `${selected.size} Homepage(s) deaktivieren` : 'Deaktivieren'}
          </button>
        </div>
      </div>

      {/* Liste */}
      <div className="mt-6 space-y-2">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Wird geladen …</div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            🎉 Keine aktiven Praxis-Homepages vorhanden.
          </div>
        ) : items.map((doc) => {
          const days = doc.days_active;
          const badge = daysBadge(days);
          const isSelected = selected.has(doc.id);
          const homepageUrl = `/${doc.homepage_slug}`;
          const directoryUrl = `/praxis/${doc.city_slug}/${doc.slug}`;
          return (
            <div key={doc.id} className={`rounded-xl border p-4 transition ${isSelected ? 'border-purple-400 bg-purple-50/40' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              <div className="flex flex-wrap items-start gap-4">
                <input
                  type="checkbox" checked={isSelected}
                  onChange={() => toggleSelect(doc.id)}
                  className="mt-1 h-4 w-4 shrink-0 accent-purple-700"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-semibold text-slate-900">{doc.name}</span>
                    {doc.city && <span className="text-xs text-slate-500">{doc.city}</span>}
                    {badge && (
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badge.cls}`}>{badge.label}</span>
                    )}
                    {doc.gmb_verified === true && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-800" title="Google-Business bereits claimed – Homepage kann deaktiviert werden">
                        <ShieldCheck className="h-3 w-3" /> Claimed → deaktivierbar
                      </span>
                    )}
                    {doc.gmb_verified === false && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-orange-300 bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-800" title="Google-Business noch unclaimed – Homepage wird noch benötigt">
                        <ShieldX className="h-3 w-3" /> Noch unclaimed
                      </span>
                    )}
                  </div>
                  {doc.formatted_address && (
                    <p className="mt-1 flex items-start gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3 shrink-0 mt-0.5" /> {doc.formatted_address}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <a href={homepageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-purple-200 bg-purple-50 px-2 py-1 font-medium text-purple-800 hover:bg-purple-100">
                      <Home className="h-3 w-3" /> {homepageUrl}
                    </a>
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                    <Link href={directoryUrl} target="_blank" className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-600 hover:bg-slate-50">
                      <ExternalLink className="h-3 w-3" /> Verzeichnis-Eintrag
                    </Link>
                    {doc.phone_national && (
                      <a href={`tel:${doc.phone_national}`} className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-600 hover:bg-slate-50">
                        <Phone className="h-3 w-3" /> {doc.phone_national}
                      </a>
                    )}
                    <button
                      onClick={() => singleDeactivate(doc)}
                      className="ml-auto inline-flex items-center gap-1 rounded-md bg-rose-700 px-2 py-1 font-semibold text-white hover:bg-rose-800"
                    >
                      <Trash2 className="h-3 w-3" /> Deaktivieren
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
