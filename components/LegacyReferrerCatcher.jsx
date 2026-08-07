'use client';

// Legacy Referrer Catcher — Client-Side Fallback für das Rescue-System.
//
// Warum? Die HTTP-Referer-Header werden von modernen Browsern häufig gestripped,
// weshalb die Middleware alleine oft nichts matchen kann. document.referrer
// unterliegt zwar derselben Referrer-Policy, ABER wenn die Alt-Domain die Policy
// auf strict-origin-when-cross-origin oder origin belässt, kommt zumindest die
// Origin oder ganze URL im JS-Kontext an — auch wenn der HTTP-Header leer ist.
//
// Zusätzlich verarbeitet dieser Catcher ?legacy=<pfad> und ?ref=<pfad> Params.
//
// Kein Rendering — reine Side-Effect-Komponente.

import { useEffect, useRef } from 'react';

const LEGACY_REGEX = /(xn--rzte-online-k8a|rzte-online\.vercel|%C3%A4rzte-online|ärzte-online)/i;

export default function LegacyReferrerCatcher() {
  const firedRef = useRef(false);

  useEffect(() => {
    // Guard: nur 1× pro Session ausführen (sessionStorage-Flag)
    if (firedRef.current) return;
    firedRef.current = true;

    try {
      const flag = 'navoria_legacy_catcher_done';
      if (sessionStorage.getItem(flag) === '1') return;
      sessionStorage.setItem(flag, '1');
    } catch { /* Safari private mode etc. — weitermachen */ }

    // Nicht ausführen wenn wir bereits auf einer Nicht-Root-Seite sind
    if (window.location.pathname !== '/' && window.location.pathname !== '') return;

    const params = new URLSearchParams(window.location.search);
    const paramPath = params.get('legacy') || params.get('ref') || null;
    const referrer = document.referrer || '';

    // Bedingung: entweder ein Legacy-Referer im document.referrer
    // ODER ein expliziter ?legacy/?ref-Parameter.
    const referrerLooksLegacy = referrer && LEGACY_REGEX.test(referrer);
    const hasPathParam = paramPath && paramPath.startsWith('/') && paramPath.length >= 3;

    if (!referrerLooksLegacy && !hasPathParam) return;

    // Debug-Log für den User (nur in DEV sichtbar wenn console geöffnet)
    if (typeof console !== 'undefined') {
      console.debug('[Navoria] Legacy-Referrer-Catcher aktiv', {
        referrer_hint: referrerLooksLegacy ? referrer : null,
        param_path: paramPath,
      });
    }

    // GA4-Event – hilft im Analytics zu sehen wie oft der Catcher greift
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'legacy_catcher_fired', {
          source: hasPathParam ? 'param' : 'referrer',
          has_referrer: Boolean(referrer),
        });
      }
    } catch { /* ignore */ }

    // POST an /api/legacy-rescue. Kein sendBeacon, weil wir die Response brauchen.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    fetch('/api/legacy-rescue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referrer,
        legacyPath: hasPathParam ? paramPath : null,
      }),
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        clearTimeout(timeoutId);
        if (data && data.ok && data.redirect_to && data.redirect_to !== '/') {
          // GA4-Event für Success
          try {
            if (typeof window.gtag === 'function') {
              window.gtag('event', 'legacy_catcher_redirect', {
                result: data.result,
                target: data.redirect_to,
              });
            }
          } catch { /* ignore */ }
          // Client-side Redirect — replace() um Back-Button-History sauber zu halten
          window.location.replace(data.redirect_to);
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
        /* silent fail */
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  return null;
}
