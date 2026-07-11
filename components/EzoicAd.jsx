'use client';

import { useEffect, useRef } from 'react';

/**
 * Ezoic Standalone Ad Placeholder.
 *
 * Rendert einen Ezoic Ad-Slot mit der angegebenen Placeholder-ID. Die ID muss
 * VORHER im Ezoic-Dashboard unter "Monetization → Ad Tester / Placeholders"
 * angelegt und einem Ad-Format zugewiesen worden sein (z. B. 101 = MREC 300x250
 * Sidebar).
 *
 * Verhalten:
 *  - Ruft ezstandalone.showAds(id) einmalig beim Mount auf.
 *  - Beim Unmount (SPA-Navigation) wird der Placeholder aufgeräumt, damit ein
 *    erneutes Mount auf einer anderen Seite sauber neu initialisiert werden kann.
 *  - Rendert nichts sichtbar, wenn Ezoic (auf der lokalen/Preview-Domain oder wegen
 *    Adblocker) keinen Ad ausliefert – dann bleibt der Container einfach leer.
 *
 * @param {object} props
 * @param {number} props.id - Ezoic Placeholder-ID (numerisch, z. B. 101).
 * @param {string} [props.className] - Optionale Tailwind-Klassen für den Wrapper.
 * @param {string} [props.label] - Optionales, dezentes „Anzeige"-Label über dem Ad.
 */
export default function EzoicAd({ id, className = '', label = 'Anzeige' }) {
  const initedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (initedRef.current) return;
    initedRef.current = true;

    // ezstandalone-Command-Queue ist bereits im Layout initialisiert.
    // Falls das globale Script noch nicht geladen ist, sorgt die Queue-Pattern
    // dafür, dass showAds() später abgearbeitet wird.
    window.ezstandalone = window.ezstandalone || {};
    window.ezstandalone.cmd = window.ezstandalone.cmd || [];
    window.ezstandalone.cmd.push(function () {
      try {
        window.ezstandalone.showAds(id);
      } catch (e) {
        // Kein Ad verfügbar / Adblocker / Preview-Domain – still schlucken.
      }
    });

    return () => {
      // Bei SPA-Unmount versuchen wir den Placeholder freizugeben, damit ein
      // erneutes Anzeigen auf einer anderen Route sauber funktioniert.
      try {
        if (window.ezstandalone && typeof window.ezstandalone.destroyPlaceholders === 'function') {
          window.ezstandalone.cmd.push(function () {
            window.ezstandalone.destroyPlaceholders(id);
          });
        }
      } catch (e) {
        // ignore
      }
    };
  }, [id]);

  return (
    <div className={`ezoic-ad-slot ${className}`.trim()}>
      {label ? (
        <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </div>
      ) : null}
      {/* Ezoic Standalone Placeholder – Ezoic ersetzt den Div-Inhalt zur Laufzeit. */}
      <div id={`ezoic-pub-ad-placeholder-${id}`} />
    </div>
  );
}
