'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft, Copy, ExternalLink, Loader2, MapPin, RefreshCw, Star, Trash2,
  CheckCircle2, AlertTriangle, Phone, Globe, Sparkles, Layers,
} from 'lucide-react';

export default function AdminDuplikatePage() {
  const [token, setToken] = useState(null);
  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('navoria_admin_token') : null;
    if (!t) window.location.href = '/admin';
    setToken(t);
  }, []);
  if (!token) return null;
  return <DuplicatesView token={token} />;
}

function DuplicatesView({ token }) {
  const [type, setType] = useState('safe'); // 'safe' | 'similar_name' | 'address'
  const [cityFilter, setCityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState({
    groups: [],
    total_groups: 0,
    total_duplicate_docs: 0,
    redundant_count: 0,
    all_cities: [],
  });
  const [selectedIds, setSelectedIds] = useState(new Set()); // ids to be discarded

  const PAGE_SIZE = 100;
  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const load = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ type, limit: String(PAGE_SIZE), offset: String((page - 1) * PAGE_SIZE) });
      if (cityFilter) q.set('city', cityFilter);
      const r = await fetch(`/api/admin/duplicates?${q}`, { headers: authHeaders });
      if (r.status === 401) { toast.error('Sitzung abgelaufen'); window.location.href = '/admin'; return; }
      const d = await r.json();
      setData({
        groups: Array.isArray(d.groups) ? d.groups : [],
        total_groups: d.total_groups || 0,
        total_duplicate_docs: d.total_duplicate_docs || 0,
        redundant_count: d.redundant_count || 0,
        all_cities: Array.isArray(d.all_cities) ? d.all_cities : [],
      });
      // Auto-Vorselektion: alle „vorgeschlagen zum Verwerfen" ankreuzen
      const preselect = new Set();
      (d.groups || []).forEach((g) => (g.docs || []).forEach((doc) => {
        if (doc.is_suggested_discard) preselect.add(doc.id);
      }));
      setSelectedIds(preselect);
    } catch (err) {
      toast.error('Fehler beim Laden: ' + (err?.message || err));
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [type, cityFilter, page]);
  useEffect(() => { setPage(1); }, [type, cityFilter]);

  const totalPages = Math.max(1, Math.ceil(data.total_groups / PAGE_SIZE));

  const toggleOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const applyGroupSuggestion = (group) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      (group.docs || []).forEach((doc) => {
        if (doc.is_suggested_discard) next.add(doc.id);
        else next.delete(doc.id);
      });
      return next;
    });
  };

  const clearGroup = (group) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      (group.docs || []).forEach((doc) => next.delete(doc.id));
      return next;
    });
  };

  const selectAllSuggested = () => {
    const next = new Set();
    data.groups.forEach((g) => (g.docs || []).forEach((doc) => {
      if (doc.is_suggested_discard) next.add(doc.id);
    }));
    setSelectedIds(next);
  };

  const clearAll = () => setSelectedIds(new Set());

  const selectedOnThisPage = useMemo(() => {
    let c = 0;
    data.groups.forEach((g) => (g.docs || []).forEach((doc) => { if (selectedIds.has(doc.id)) c += 1; }));
    return c;
  }, [selectedIds, data.groups]);

  const bulkDiscard = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`${ids.length} Praxen wirklich verwerfen?\n\nSie werden aus Suche, Hubs und Sitemap entfernt. Wiederherstellbar über /admin/ohne-website oder DB-Filter.`)) return;
    setBusy(true);
    try {
      const r = await fetch('/api/admin/doctors/bulk-discard', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ ids, reason: `admin_duplicate_${type}` }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Fehler');
      toast.success(`${d.modified || 0} Praxen verworfen.`);
      setSelectedIds(new Set());
      await load();
    } catch (err) {
      toast.error(String(err.message || err));
    }
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-sky-700">
            <ArrowLeft className="h-3 w-3" /> Zurück zum Dashboard
          </Link>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
            <Layers className="h-6 w-6 text-sky-500" /> Duplikate finden & bereinigen
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Findet Praxen an derselben Adresse oder mit identischem Namen in derselben Stadt.
            Der beste Eintrag wird automatisch als „behalten“ markiert, alle anderen zum Verwerfen vorgeschlagen.
          </p>
        </div>
        <button onClick={load} disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Aktualisieren
        </button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={Layers}
          label="Duplikat-Gruppen"
          value={data.total_groups}
          hint={
            type === 'safe' ? 'Sichere Duplikate: selbes Google-Place-ID, Adresse+Telefon oder Adresse+Website'
            : type === 'similar_name' ? 'Selbe Adresse UND ähnlicher Name (>60% Überlappung)'
            : 'Selbe Adresse – ⚠️ Ärztehäuser können hier auftauchen!'
          }
        />
        <StatCard
          icon={AlertTriangle}
          label="Betroffene Praxen"
          value={data.total_duplicate_docs}
          hint="Summe aller Einträge in Duplikat-Gruppen"
          tone="amber"
        />
        <StatCard
          icon={Trash2}
          label="Kann verworfen werden"
          value={data.redundant_count}
          hint="Behält 1 pro Gruppe, verwirft alle anderen"
          tone="rose"
        />
      </div>

      {/* Modus-Beschreibung */}
      {type === 'safe' && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <b>Hohe Konfidenz — sicher zu verwerfen.</b> Diese Gruppen basieren auf mindestens einem starken Signal:
            <span className="ml-1 inline-flex flex-wrap gap-1">
              <span className="rounded bg-white px-1.5 py-0.5 text-[11px] font-mono">selbes Google-Place-ID</span>
              <span className="rounded bg-white px-1.5 py-0.5 text-[11px] font-mono">Adresse + Telefon</span>
              <span className="rounded bg-white px-1.5 py-0.5 text-[11px] font-mono">Adresse + Website</span>
            </span>
            <span className="ml-1">Ärztehäuser werden korrekt getrennt behandelt.</span>
          </div>
        </div>
      )}
      {type === 'similar_name' && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <b>Mittlere Konfidenz — sorgfältig prüfen.</b> Selbe Adresse und ≥60% Wortüberlappung im Namen. Meist echte Duplikate (Import-Varianten wie „Dr. Meyer“ vs. „Praxis Dr. Meyer“), aber Restrisiko für Namens-Zufälle in Ärztehäusern.
          </div>
        </div>
      )}
      {type === 'address' && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/60 p-4 text-sm text-rose-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <b>⚠️ Niedrige Konfidenz — Ärztehaus-Falle!</b> Nur Adressen-Match, ohne weiteres Signal. In Ärztehäusern sitzen mehrere legitim unterschiedliche Praxen an derselben Adresse und werden hier fälschlich als Duplikate angezeigt. Nur mit manueller Prüfung verwerfen.
          </div>
        </div>
      )}

      {/* Tab-Umschalter + Filter */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
          <button
            onClick={() => setType('safe')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${type === 'safe' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" /> Sichere Duplikate
          </button>
          <button
            onClick={() => setType('similar_name')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${type === 'similar_name' ? 'bg-amber-100 text-amber-800' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Sparkles className="mr-1 inline h-3.5 w-3.5" /> Ähnlicher Name
          </button>
          <button
            onClick={() => setType('address')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${type === 'address' ? 'bg-rose-100 text-rose-800' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <MapPin className="mr-1 inline h-3.5 w-3.5" /> Nur Adresse
          </button>
        </div>

        {data.all_cities.length > 1 && (
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Alle Städte ({data.all_cities.length})</option>
            {data.all_cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={selectAllSuggested}
            disabled={loading || data.groups.length === 0}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Alle Vorschläge markieren
          </button>
          <button
            onClick={clearAll}
            disabled={selectedIds.size === 0}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Auswahl leeren
          </button>
        </div>
      </div>

      {/* Aktion-Leiste */}
      {selectedIds.size > 0 && (
        <div className="sticky top-2 z-20 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-3 shadow-sm backdrop-blur">
          <p className="text-sm font-medium text-rose-900">
            <b>{selectedIds.size}</b> Praxen ausgewählt zum Verwerfen
            {selectedOnThisPage !== selectedIds.size && (
              <span className="ml-2 text-xs font-normal text-rose-700">
                ({selectedOnThisPage} auf dieser Seite, {selectedIds.size - selectedOnThisPage} auf anderen)
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <button
              onClick={clearAll}
              className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-50"
            >
              Abbrechen
            </button>
            <button
              onClick={bulkDiscard}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {selectedIds.size} verwerfen
            </button>
          </div>
        </div>
      )}

      {/* Gruppen-Liste */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            Wird geladen …
          </div>
        ) : data.groups.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            🎉 Keine Duplikate gefunden.
          </div>
        ) : (
          data.groups.map((g, idx) => (
            <GroupCard
              key={`${type}-${page}-${idx}`}
              group={g}
              type={type}
              selectedIds={selectedIds}
              onToggle={toggleOne}
              onApplySuggestion={() => applyGroupSuggestion(g)}
              onClearGroup={() => clearGroup(g)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">
            Seite <b>{page}</b> von <b>{totalPages}</b>
            <span className="ml-2 text-xs text-slate-400">({data.total_groups} Gruppen gesamt)</span>
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(1)} disabled={page === 1 || loading} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40">« Erste</button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40">‹ Zurück</button>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={page}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!Number.isNaN(v) && v >= 1 && v <= totalPages) setPage(v);
              }}
              className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40">Weiter ›</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages || loading} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40">Letzte »</button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint, tone }) {
  const toneCls = tone === 'amber' ? 'text-amber-700 bg-amber-50 border-amber-200'
    : tone === 'rose' ? 'text-rose-700 bg-rose-50 border-rose-200'
    : 'text-sky-700 bg-sky-50 border-sky-200';
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${toneCls}`}>
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">{value ?? '…'}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function reasonLabels(reasons) {
  const map = {
    'place_id': { label: 'Google-Place-ID', tone: 'emerald' },
    'address+phone': { label: 'Adresse + Telefon', tone: 'emerald' },
    'address+website': { label: 'Adresse + Website', tone: 'emerald' },
    'address+similar_name': { label: 'Adresse + ähnlicher Name', tone: 'amber' },
    'address_only': { label: 'Nur Adresse', tone: 'rose' },
  };
  return (reasons || []).map((r) => map[r] || { label: r, tone: 'slate' });
}

function GroupCard({ group, type, selectedIds, onToggle, onApplySuggestion, onClearGroup }) {
  const selectedInGroup = (group.docs || []).filter((d) => selectedIds.has(d.id)).length;
  const suggestionApplied = (group.docs || []).every((d) =>
    d.is_suggested_discard ? selectedIds.has(d.id) : !selectedIds.has(d.id)
  );
  const labels = reasonLabels(group.reasons);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700">
              {group.count}× dupliziert
            </span>
            {labels.map((r, i) => (
              <span
                key={i}
                className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                  r.tone === 'emerald' ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : r.tone === 'amber' ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : r.tone === 'rose' ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                {r.label}
              </span>
            ))}
            {selectedInGroup > 0 && (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                {selectedInGroup} markiert
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-sm font-medium text-slate-800" title={group.label}>
            <MapPin className="mr-1 inline h-3.5 w-3.5 text-slate-400" />
            {group.label || '(keine Adresse)'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onApplySuggestion}
            disabled={suggestionApplied}
            className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-white px-2.5 py-1 text-xs font-medium text-sky-700 hover:bg-sky-50 disabled:opacity-40"
            title="Behält den besten Eintrag und wählt alle anderen zum Verwerfen aus"
          >
            <Sparkles className="h-3 w-3" /> Vorschlag übernehmen
          </button>
          <button
            onClick={onClearGroup}
            disabled={selectedInGroup === 0}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            Gruppe leeren
          </button>
        </div>
      </div>

      {/* Docs */}
      <div className="divide-y divide-slate-100">
        {(group.docs || []).map((doc) => {
          const isSelected = selectedIds.has(doc.id);
          const isKeep = doc.is_suggested_keep;
          return (
            <div
              key={doc.id}
              className={`flex flex-wrap items-start gap-3 px-4 py-3 transition ${isSelected ? 'bg-rose-50/60' : isKeep ? 'bg-emerald-50/40' : 'bg-white'}`}
            >
              {/* Checkbox */}
              <button
                onClick={() => onToggle(doc.id)}
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${isSelected ? 'border-rose-500 bg-rose-500 text-white' : 'border-slate-300 bg-white hover:border-rose-400'}`}
                aria-label={isSelected ? 'Auswahl entfernen' : 'Zum Verwerfen markieren'}
                title={isSelected ? 'Auswahl entfernen' : 'Zum Verwerfen markieren'}
              >
                {isSelected ? <Trash2 className="h-3.5 w-3.5" /> : null}
              </button>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/praxis/${doc.city_slug}/${doc.slug}`}
                    target="_blank"
                    className={`font-semibold hover:text-sky-700 ${isSelected ? 'text-slate-500 line-through' : 'text-slate-900'}`}
                  >
                    {doc.name}
                  </Link>
                  {isKeep && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" /> Vorschlag: behalten
                    </span>
                  )}
                  {doc.is_verified && (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      verifiziert
                    </span>
                  )}
                  {doc.website_url && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">
                      <Globe className="h-3 w-3" /> Website
                    </span>
                  )}
                  {doc.rating != null && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {Number(doc.rating).toFixed(1)}
                      {doc.user_rating_count != null && (
                        <span className="text-amber-700/70">({doc.user_rating_count})</span>
                      )}
                    </span>
                  )}
                  {doc.specialty_guess && (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {doc.specialty_guess}
                    </span>
                  )}
                </div>

                <p className="mt-1 flex items-start gap-1 text-xs text-slate-500">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0" /> {doc.formatted_address || '(keine Adresse)'}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  {doc.phone_national && (
                    <a href={`tel:${doc.phone_national}`} className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-600 hover:bg-slate-50">
                      <Phone className="h-3 w-3" /> {doc.phone_national}
                    </a>
                  )}
                  {doc.website_url && (
                    <a href={doc.website_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800 max-w-[280px] truncate">
                      <ExternalLink className="h-3 w-3 shrink-0" /> <span className="truncate">{doc.website_url.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                  {doc.google_maps_url && (
                    <a href={doc.google_maps_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800">
                      <ExternalLink className="h-3 w-3" /> Google Maps
                    </a>
                  )}
                  <button
                    onClick={() => { navigator.clipboard.writeText(doc.google_place_id || ''); toast.success('Place-ID kopiert'); }}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-500 hover:bg-slate-50"
                    title={doc.google_place_id}
                  >
                    <Copy className="h-3 w-3" /> ID
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
