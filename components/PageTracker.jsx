'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Kleiner First-Party-Beacon: feuert auf jeden Route-Change ein POST an /api/track.
 *
 *   - Nutzt sendBeacon, wenn verfügbar (überlebt Page-Unload).
 *   - Sendet KEINE personenbezogenen Daten – Server nimmt IP-Hash + Geo-Header.
 *   - session_id kommt als 1st-party Cookie, gesetzt vom Server beim ersten Track.
 *   - Admin-Routen und Track-Endpoint selbst werden nicht getrackt.
 */
export default function PageTracker() {
  const pathname = usePathname();
  const search = useSearchParams();
  const lastPath = useRef(null);

  useEffect(() => {
    if (!pathname) return;
    // Nicht tracken: Admin-Bereich und (falls jemand die Route direkt aufruft) den Track-Endpunkt
    if (pathname.startsWith('/admin')) return;
    if (pathname.startsWith('/api/')) return;

    // Doppelte Aufrufe (Strict-Mode, hydration) unterbinden
    const key = pathname + '?' + (search?.toString() || '');
    if (lastPath.current === key) return;
    lastPath.current = key;

    const payload = JSON.stringify({
      path: pathname,
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
      screen: typeof window !== 'undefined'
        ? `${window.screen?.width || 0}x${window.screen?.height || 0}`
        : null,
    });

    try {
      if (navigator?.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/track', blob);
      } else {
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch { /* silent – Tracking darf niemals die UX kaputt machen */ }
  }, [pathname, search]);

  return null;
}
