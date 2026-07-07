'use client';

import { useState } from 'react';
import { MapPin, Play } from 'lucide-react';

/**
 * Facade-Pattern für Karten-Embeds:
 *   - Rendert initial nur ein leichtgewichtiges statisches Placeholder mit Marker.
 *   - iframe wird erst bei Klick geladen → keine render-blockenden Third-Party-Assets.
 *   - Spart auf mobilen Praxisseiten typischerweise 200–400 kB Third-Party-JS/CSS.
 *
 *   src: die iframe-URL (z. B. OpenStreetMap Embed)
 *   title: Screenreader-Text (Pflicht)
 *   label: kurzer Ortstext für den Placeholder
 */
export default function MapEmbed({ src, title, label }) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <iframe
          src={src}
          title={title}
          width="100%"
          height="320"
          loading="lazy"
          referrerPolicy="no-referrer"
          className="block"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      className="group relative block h-[320px] w-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-sky-50 via-slate-50 to-emerald-50 text-left transition hover:border-sky-300"
      aria-label={`Karte laden: ${title}`}
    >
      {/* Dezente Grid-Optik als Karten-Andeutung */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(148,163,184,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.15) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Marker in der Mitte */}
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg ring-4 ring-white">
          <MapPin aria-hidden="true" className="h-5 w-5" />
        </div>
        {label && (
          <div className="mt-2 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
            {label}
          </div>
        )}
      </div>
      {/* Call-to-Action */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm transition group-hover:border-sky-300 group-hover:text-sky-700">
        <Play aria-hidden="true" className="mr-1 inline h-3 w-3 -translate-y-0.5 fill-current" />
        Karte laden
      </div>
      {/* Hinweis unten */}
      <div className="absolute bottom-2 right-2 text-[10px] text-slate-400">
        Klick lädt OpenStreetMap
      </div>
    </button>
  );
}
