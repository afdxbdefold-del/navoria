'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { Cookie, X } from 'lucide-react';
import { useIsStandaloneRoute } from '@/components/NavShell';

const STORAGE_KEY = 'navoria_consent_v1';
const ADSENSE_CLIENT = 'ca-pub-8583619451045805';

/**
 * Cookie-Consent Banner + AdSense Loader.
 * AdSense wird NUR geladen, wenn Nutzer aktiv 'ads' zugestimmt hat.
 * Zustimmung wird in localStorage gespeichert. Widerruf jederzeit via Footer-Link
 * (custom event 'navoria:consent:reset') möglich.
 * Auf Standalone-Routen (eigenständige Praxis-Websites) wird kein Banner gezeigt.
 */
export default function ConsentBanner() {
  const isStandalone = useIsStandaloneRoute();
  const [consent, setConsent] = useState(null); // null=nicht entschieden, 'all'|'necessary'
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'all' || stored === 'necessary') {
      setConsent(stored);
    } else {
      setVisible(true);
    }

    const onReset = () => {
      localStorage.removeItem(STORAGE_KEY);
      setConsent(null);
      setVisible(true);
    };
    window.addEventListener('navoria:consent:reset', onReset);
    return () => window.removeEventListener('navoria:consent:reset', onReset);
  }, [isStandalone]);

  if (isStandalone) return null;

  const acceptAll = () => {
    localStorage.setItem(STORAGE_KEY, 'all');
    setConsent('all');
    setVisible(false);
  };
  const acceptNecessary = () => {
    localStorage.setItem(STORAGE_KEY, 'necessary');
    setConsent('necessary');
    setVisible(false);
  };

  return (
    <>
      {/* AdSense-Script wird NUR bei Consent geladen */}
      {consent === 'all' && (
        <Script
          id="adsense-script"
          async
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
        />
      )}

      {visible && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.15)]">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:gap-6">
            <div className="flex items-start gap-3 flex-1">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Cookie className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">Cookies & Anzeigen</p>
                <p className="mt-1 text-sm text-slate-600">
                  Navoria selbst setzt nur technisch notwendige Cookies. Zusätzlich können wir mit Ihrer Zustimmung
                  personalisierte Werbeanzeigen von Google AdSense einbinden. Details in unserer{' '}
                  <a href="/datenschutz" className="font-medium text-sky-700 underline hover:text-sky-800">Datenschutzerklärung</a>.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row md:shrink-0">
              <button onClick={acceptNecessary} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                Nur notwendige
              </button>
              <button onClick={acceptAll} className="inline-flex items-center justify-center rounded-xl bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800">
                Alle akzeptieren
              </button>
            </div>
            <button onClick={acceptNecessary} className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 md:hidden" aria-label="Schließen">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Kleiner Footer-Button, mit dem Nutzer die Consent-Entscheidung zurücksetzen können.
 */
export function ConsentResetLink({ className = '' }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('navoria:consent:reset'))}
      className={className}
    >
      Cookie-Einstellungen ändern
    </button>
  );
}
