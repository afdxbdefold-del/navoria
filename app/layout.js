import './globals.css';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import { Toaster } from 'sonner';
import ConsentBanner from '@/components/ConsentBanner';
import PageTracker from '@/components/PageTracker';
import WebMCPRegistrar from '@/components/WebMCPRegistrar';
import { NavShellTop, NavShellBottom } from '@/components/NavShell';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://navoria.de';
const ADSENSE_CLIENT = 'ca-pub-8583619451045805';

export const metadata = {
  metadataBase: new URL(BASE_URL),
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
    url: BASE_URL,
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

const websiteSchema = {
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
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE_URL}#organization`,
  name: 'Navoria',
  legalName: 'AF Consulting',
  url: BASE_URL,
  logo: `${BASE_URL}/icon.svg`,
  slogan: 'Ihr nächster Arzt. Ohne Umwege.',
  foundingDate: '2025',
  founder: { '@type': 'Person', name: 'Andreas Frey' },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Am Nesseufer 1',
    postalCode: '26789',
    addressLocality: 'Leer',
    addressCountry: 'DE',
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
};

export default async function RootLayout({ children }) {
  // Homepage-Modus-Seiten (via Middleware markiert) sollen KEINE Navoria-Schemas erhalten,
  // damit sie für Google als eigenständige Praxis-Websites wirken.
  const hdr = await headers();
  const isHomepageMode = hdr.get('x-navoria-mode') === 'homepage';

  return (
    <html lang="de">
      <head>
        <meta name="google-adsense-account" content={ADSENSE_CLIENT} />
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
        <main id="main-content" tabIndex={-1}>{children}</main>
        {!isHomepageMode && <NavShellBottom />}
        {!isHomepageMode && <ConsentBanner />}
        <Toaster position="top-center" richColors />
        <Suspense fallback={null}>
          <PageTracker />
        </Suspense>
        <WebMCPRegistrar />
      </body>
    </html>
  );
}

