import { Star } from 'lucide-react';

/**
 * Zeigt einen Bewertungs-Badge basierend auf den in der DB gespeicherten Werten.
 * Datenquelle: öffentliche Google-Rezensionen (Google Places API).
 * Attribution wird per default angezeigt (Google-ToS-Compliance).
 */
export default function RatingBadge({
  rating,
  count,
  size = 'md',       // 'sm' | 'md' | 'lg'
  showAttribution = false, // nur an einer Stelle pro Seite anzeigen (z.B. Hero)
  className = '',
}) {
  if (rating == null || Number.isNaN(Number(rating))) return null;
  const value = Number(rating);
  const c = count ? Number(count) : 0;

  const sizes = {
    sm: { star: 'h-3 w-3', text: 'text-xs', pad: 'px-2 py-0.5', gap: 'gap-1' },
    md: { star: 'h-3.5 w-3.5', text: 'text-sm', pad: 'px-2.5 py-1', gap: 'gap-1.5' },
    lg: { star: 'h-4 w-4', text: 'text-base', pad: 'px-3 py-1.5', gap: 'gap-1.5' },
  }[size] || sizes?.md;

  return (
    <span className={`inline-flex flex-col ${className}`}>
      <span
        role="img"
        aria-label={`Bewertung: ${value.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} von 5 Sternen${c > 0 ? ` bei ${c} Rezensionen` : ''}`}
        className={`inline-flex items-center ${sizes.gap} rounded-full border border-amber-200 bg-amber-50 ${sizes.pad} ${sizes.text} font-semibold text-amber-900`}
        title={`${value.toFixed(1)} von 5${c ? ` – ${c} Bewertungen` : ''}`}
      >
        <Star aria-hidden="true" className={`${sizes.star} fill-amber-500 text-amber-500`} />
        <span aria-hidden="true">{value.toFixed(1)}</span>
        {c > 0 && <span aria-hidden="true" className="font-normal text-amber-800/80">({c})</span>}
      </span>
      {showAttribution && (
        <span className="mt-1 text-[10px] leading-tight text-slate-400">Bewertungen von Google</span>
      )}
    </span>
  );
}
