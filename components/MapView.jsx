'use client';

import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export default function MapView({ doctors }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  const pts = useMemo(() => doctors.filter((d) => d.latitude != null && d.longitude != null), [doctors]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const center = pts.length > 0 ? [pts[0].latitude, pts[0].longitude] : [51.1657, 10.4515];
    const map = L.map(containerRef.current, { scrollWheelZoom: true }).setView(center, pts.length > 0 ? 12 : 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const iconSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 42' width='32' height='42'><path d='M16 0C7.16 0 0 7.16 0 16c0 11 16 26 16 26s16-15 16-26C32 7.16 24.84 0 16 0z' fill='#0284c7'/><circle cx='16' cy='16' r='6' fill='white'/></svg>`)}`;
    const icon = L.icon({ iconUrl: iconSvg, iconSize: [30, 40], iconAnchor: [15, 40], popupAnchor: [0, -34] });

    pts.forEach((d) => {
      const popupHtml = `
        <div style="min-width:220px">
          <a href="/praxis/${escapeHtml(d.city_slug || '')}/${escapeHtml(d.slug || '')}" style="font-weight:600;color:#0284c7;text-decoration:none">${escapeHtml(d.name)}</a>
          ${d.specialty_guess ? `<div style="font-size:11px;color:#475569;margin-top:4px">${escapeHtml(d.specialty_guess)}</div>` : ''}
          <div style="font-size:11px;color:#475569;margin-top:4px">${escapeHtml(d.formatted_address || '')}</div>
          ${d.rating != null ? `<div style="font-size:11px;color:#d97706;margin-top:4px">★ ${d.rating.toFixed(1)} (${d.user_rating_count || 0})</div>` : ''}
          <a href="/praxis/${escapeHtml(d.city_slug || '')}/${escapeHtml(d.slug || '')}" style="display:inline-block;margin-top:8px;font-size:11px;font-weight:600;color:#0284c7;text-decoration:none">Profil ansehen →</a>
        </div>`;
      L.marker([d.latitude, d.longitude], { icon }).addTo(map).bindPopup(popupHtml);
    });

    if (pts.length > 0) {
      const bounds = L.latLngBounds(pts.map((p) => [p.latitude, p.longitude]));
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
    }

    mapRef.current = map;
    // Invalidate size shortly after mount, in case container size changed
    setTimeout(() => { try { map.invalidateSize(); } catch {} }, 100);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [pts]);

  return (
    <div className="card-soft overflow-hidden">
      <div ref={containerRef} style={{ height: '600px', width: '100%' }} />
      {pts.length === 0 && (
        <div className="border-t border-slate-100 bg-slate-50 p-3 text-center text-xs text-slate-500">Keine Praxen mit Koordinaten in dieser Suche.</div>
      )}
    </div>
  );
}
