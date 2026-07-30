import './globals.css';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import { Toaster } from 'sonner';
// ConsentBanner bleibt als Backup im Repository erhalten (nicht mehr gerendert),
// da Ezoic seinen eigenen Gatekeeper-Consent-CMP mitbringt. Bei Bedarf reaktivierbar.
// import ConsentBanner from '@/components/ConsentBanner';
import PageTracker from '@/components/PageTracker';
import WebMCPRegistrar from '@/components/WebMCPRegistrar';
import { NavShellTop, NavShellBottom } from '@/components/NavShell';
import EzoicAd from '@/components/EzoicAd';
import { getBaseUrl, getBaseUrlSync } from '@/lib/baseUrl';
import { logServerHit } from '@/lib/serverTracker';

// Statischer Fallback für Metadata (die läuft zum Build-Zeitpunkt).
// Die JSON-LD-Schemas werden im Layout selbst mit der Runtime-URL berechnet.
const BASE_URL_STATIC = getBaseUrlSync();
// Ezoic Account-ID (siehe Ezoic-Dashboard → Setup)
const EZOIC_ACCOUNT_ID = '84335';

export const metadata = {
  metadataBase: new URL(BASE_URL_STATIC),
  title: {
    default: 'Navoria – Ihr nächster Arzt. Ohne Umwege.',
    template: '%s | Navoria',
  },
  description: 'Ärzte und Praxen in Deutschland finden. Adresse, Telefon, Öffnungszeiten und Bewertungen kompakt auf einer Seite.',
  keywords: ['Arztsuche', 'Arzt finden', 'Praxis', 'Zahnarzt', 'Facharzt', 'Hausarzt', 'Deutschland', 'Navoria', 'Praxis finden', 'Ärzteverzeichnis'],
  authors: [{ name: 'Navoria' }],
  applicationName: 'Navoria',
  creator: 'Navoria',
  publisher: 'Navoria',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: BASE_URL_STATIC,
    siteName: 'Navoria',
    title: 'Navoria – Ihr nächster Arzt. Ohne Umwege.',
    description: 'Ärzte und Praxen in Deutschland finden. Adresse, Telefon, Öffnungszeiten und Bewertungen kompakt auf einer Seite.',
  },
  twitter: {
    card: 'summary',
    title: 'Navoria – Ihr nächster Arzt. Ohne Umwege.',
    description: 'Ärzte und Praxen in Deutschland finden.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  formatDetection: {
    telephone: true,
    address: true,
    email: false,
  },
};

export const viewport = {
  themeColor: '#0EA5E9',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

const websiteSchemaBuilder = (BASE_URL) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Navoria',
  url: BASE_URL,
  inLanguage: 'de-DE',
  description: 'Ärzte und Praxen in Deutschland finden. Navoria ist ein öffentliches Verzeichnis für Arzt-, Zahnarzt- und Facharztpraxen.',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/suche?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
});

const organizationSchemaBuilder = (BASE_URL) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE_URL}#organization`,
  name: 'Navoria',
  legalName: 'HYPERAI ADVERTISING LLC',
  url: BASE_URL,
  logo: `${BASE_URL}/icon.svg`,
  slogan: 'Ihr nächster Arzt. Ohne Umwege.',
  foundingDate: '2025',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '3500 South DuPont Hwy',
    postalCode: '19901',
    addressLocality: 'Dover',
    addressRegion: 'DE',
    addressCountry: 'US',
  },
  contactPoint: [{
    '@type': 'ContactPoint',
    email: 'mail@navoria.de',
    contactType: 'customer support',
    availableLanguage: ['de'],
  }],
  publishingPrinciples: `${BASE_URL}/redaktionelle-standards`,
  correctionsPolicy: `${BASE_URL}/korrekturen`,
  areaServed: { '@type': 'Country', name: 'Deutschland' },
});

export default async function RootLayout({ children }) {
  // Homepage-Modus-Seiten (via Middleware markiert) sollen KEINE Navoria-Schemas erhalten,
  // damit sie für Google als eigenständige Praxis-Websites wirken.
  const hdr = await headers();
  const isHomepageMode = hdr.get('x-navoria-mode') === 'homepage';

  // Server-Side Request-Logging (fire-and-forget, blockiert Rendering nicht).
  // Erfasst ALLE eingehenden Seiten-Requests inkl. Non-JS-Bots (Yandex, MJ12Bot, Bytespider etc.),
  // die vom Client-Tracker (/api/track) nicht gesehen werden.
  const path = hdr.get('x-navoria-path') || '/';
  const ua = hdr.get('user-agent') || '';
  const ip = hdr.get('x-forwarded-for')?.split(',')[0]?.trim() || hdr.get('x-real-ip') || null;
  const referer = hdr.get('referer') || null;
  const host = hdr.get('x-forwarded-host') || hdr.get('host') || null;
  logServerHit({ path, userAgent: ua, ip, referer, host, mode: isHomepageMode ? 'homepage' : 'directory' })
    .catch(() => {});

  // Base-URL zur Laufzeit ermitteln (mit Host-Header-Detection → auch wenn Env-Var
  // fälschlicherweise auf Preview-URL zeigt, wird auf navoria.de gemappt wenn der
  // Request tatsächlich auf navoria.de gestellt wurde).
  const BASE_URL = await getBaseUrl();
  const websiteSchema = websiteSchemaBuilder(BASE_URL);
  const organizationSchema = organizationSchemaBuilder(BASE_URL);

  // Billboard (970x250) auf allen Content-Seiten anzeigen, aber NICHT auf rechtlichen
  // Seiten, Admin, MCP, Claim-Formular und ähnlichen "Non-Content"-Bereichen.
  const noBillboardPrefixes = [
    '/impressum',
    '/datenschutz',
    '/barrierefreiheit',
    '/redaktionelle-standards',
    '/korrekturen',
    '/admin',
    '/mcp',
    '/praxis-beanspruchen',
    '/api',
  ];
  const showBillboard = !isHomepageMode && !noBillboardPrefixes.some((p) => path === p || path.startsWith(`${p}/`));

  return (
    <html lang="de">
      <head>
        {/* Ezoic Gatekeeper Consent CMP + Ezoic Standalone Ads.
            Nur außerhalb des Homepage-Modus laden – die eigenständigen
            Praxis-Websites (/[slug]) sind noindex und sollen keine Ezoic-Ads oder
            Navoria-Consent-Popups zeigen. */}
        {!isHomepageMode && (
          <>
            {/* Gatekeeper Consent CMP (muss VOR Ezoic laden) */}
            <script
              data-cfasync="false"
              src="https://cmp.gatekeeperconsent.com/min.js"
              async
            />
            <script
              data-cfasync="false"
              src="https://the.gatekeeperconsent.com/cmp.min.js"
              async
            />
            {/* Ezoic Standalone Ads */}
            <script async src="//www.ezojs.com/ezoic/sa.min.js" />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.ezstandalone = window.ezstandalone || {};ezstandalone.cmd = ezstandalone.cmd || [];`,
              }}
            />
          </>
        )}
        {!isHomepageMode && (
          <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
          </>
        )}
      </head>
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        {/* Skip-Link: Nur bei Fokus sichtbar, für Screenreader- und Tastatur-Nutzer:innen */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-sky-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sky-300"
        >
          Zum Hauptinhalt springen
        </a>
        {/* NavShell (Header/Footer) und ConsentBanner nur außerhalb des Homepage-Modus –
            damit Homepage-Modus-Seiten für Google als eigenständige Praxis-Sites wirken
            (keine Navoria-Chrome im DOM, auch nicht versteckt). */}
        {!isHomepageMode && <NavShellTop />}
        {showBillboard && (
          <div className="hidden bg-white lg:block">
            <div className="mx-auto w-[970px] py-4">
              <div className="min-h-[250px] w-[970px] overflow-hidden rounded-lg bg-slate-50 flex items-center justify-center">
                <EzoicAd id={102} className="w-full" label="Anzeige" />
              </div>
            </div>
          </div>
        )}
        {!isHomepageMode ? (
          <div className="mx-auto w-full max-w-[970px] px-4 lg:px-0">
            <div className="lg:flex lg:gap-[30px]">
              <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 lg:w-[640px]">{children}</main>
              <aside className="hidden w-[300px] shrink-0 pt-6 lg:block" aria-label="Sidebar">
                <div className="space-y-4">
                  <EzoicAd id={101} />
                </div>
              </aside>
            </div>
          </div>
        ) : (
          <main id="main-content" tabIndex={-1}>{children}</main>
        )}
        {!isHomepageMode && <NavShellBottom />}
        {/* ConsentBanner deaktiviert – Ezoic Gatekeeper CMP übernimmt die Consent-Steuerung.
            Datei bleibt als Backup unter /components/ConsentBanner.jsx. */}
        <Toaster position="top-center" richColors />
        <Suspense fallback={null}>
          <PageTracker />
        </Suspense>
        <WebMCPRegistrar />
      </body>
    </html>
  );
}

