'use client';
import { Phone, MapPin } from 'lucide-react';

export default function MobileStickyCta({ phone, mapsUrl }) {
  if (!phone && !mapsUrl) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md p-2 shadow-[0_-4px_18px_-4px_rgba(15,23,42,0.12)] md:hidden">
      <div className="mx-auto flex max-w-md items-center gap-2">
        {phone && (
          <a href={`tel:${phone}`} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-sky-700 py-2.5 text-sm font-semibold text-white active:bg-sky-800">
            <Phone className="h-4 w-4" /> Anrufen
          </a>
        )}
        {mapsUrl && (
          <a href={mapsUrl} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white active:bg-slate-800">
            <MapPin className="h-4 w-4" /> Route
          </a>
        )}
      </div>
    </div>
  );
}
