import './globals.css';
import { Suspense } from 'react';
import { Toaster } from 'sonner';
import ConsentBanner, { ConsentResetLink } from '@/components/ConsentBanner';
import MobileMenu from '@/components/MobileMenu';
import PageTracker from '@/components/PageTracker';
import WebMCPRegistrar from '@/components/WebMCPRegistrar';

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

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <head>
        <meta name="google-adsense-account" content={ADSENSE_CLIENT} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      </head>
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        {/* Skip-Link: Nur bei Fokus sichtbar, für Screenreader- und Tastatur-Nutzer:innen */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-sky-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sky-300"
        >
          Zum Hauptinhalt springen
        </a>
        <AnnouncementBar />
        <Header />
        <main id="main-content" tabIndex={-1}>{children}</main>
        <Footer />
        <ConsentBanner />
        <Toaster position="top-center" richColors />
        <Suspense fallback={null}>
          <PageTracker />
        </Suspense>
        <WebMCPRegistrar />
      </body>
    </html>
  );
}

function AnnouncementBar() {
  return (
    <a
      href="/praxis-beanspruchen"
      className="group block w-full border-b border-teal-200 bg-gradient-to-r from-teal-600 via-sky-700 to-sky-800 text-white transition hover:from-teal-700 hover:via-sky-800 hover:to-sky-900"
      aria-label="Kostenloses Profil für Ihre Arztpraxis auf Navoria beanspruchen"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-xs font-medium sm:gap-3 sm:text-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
          <path d="M20 7 9 18l-5-5" />
        </svg>
        <span>
          <strong className="font-semibold">Sie sind Arzt oder Praxis-Team?</strong>{' '}
          <span className="hidden sm:inline">Kostenloses Profil für Ihre Arztpraxis auf Navoria&nbsp;·</span>{' '}
          <span className="sm:hidden">Kostenloses Profil beanspruchen</span>{' '}
          <span className="inline-flex items-center gap-0.5 underline underline-offset-2 group-hover:no-underline">
            <span className="hidden sm:inline">Jetzt Profil beanspruchen</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </span>
        </span>
      </div>
    </a>
  );
}

function Header() {
  return (
    <header className="w-full border-b border-slate-100 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 text-white">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              <path d="M12 9v5M9.5 11.5h5" strokeWidth="2.2"/>
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-semibold tracking-tight text-slate-900">Navoria</span>
            <span className="text-[10px] font-medium text-slate-500">Der klare Weg zum Arzt.</span>
          </div>
        </a>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <a href="/" className="hover:text-sky-600">Start</a>
          <a href="/suche" className="hover:text-sky-600">Suche</a>
          <a href="/aerzte" className="hover:text-sky-600">Ärzte-Verzeichnis</a>
          <a href="/symptome" className="hover:text-sky-600">Symptome</a>
          <a href="/ratgeber" className="hover:text-sky-600">Ratgeber</a>
        </nav>
        <MobileMenu />
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-100 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-5">
          <div className="lg:col-span-1 md:col-span-3 lg:row-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 text-white">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  <path d="M12 9v5M9.5 11.5h5" strokeWidth="2.2"/>
                </svg>
              </div>
              <span className="font-semibold text-slate-900">Navoria</span>
            </div>
            <p className="mt-3 text-sm text-slate-500">Verzeichnis für Arztpraxen in Deutschland.</p>
            <p className="mt-2 text-xs text-slate-500">Betrieben von AF Consulting seit 2025.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Suchen</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><a className="hover:text-sky-600" href="/aerzte/fachrichtung/hausarzt">Hausarzt</a></li>
              <li><a className="hover:text-sky-600" href="/aerzte/fachrichtung/zahnarzt">Zahnarzt</a></li>
              <li><a className="hover:text-sky-600" href="/aerzte/fachrichtung/kardiologe">Kardiologe</a></li>
              <li><a className="hover:text-sky-600" href="/aerzte/fachrichtung/orthopaede">Orthopäde</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Städte</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><a className="hover:text-sky-600" href="/aerzte/berlin">Berlin</a></li>
              <li><a className="hover:text-sky-600" href="/aerzte/hamburg">Hamburg</a></li>
              <li><a className="hover:text-sky-600" href="/aerzte/muenchen">München</a></li>
              <li><a className="hover:text-sky-600" href="/aerzte/koeln">Köln</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Über Navoria</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><a className="hover:text-sky-600" href="/ueber-uns">Über uns</a></li>
              <li><a className="hover:text-sky-600" href="/redaktionelle-standards">Redaktionelle Standards</a></li>
              <li><a className="hover:text-sky-600" href="/korrekturen">Korrekturen melden</a></li>
              <li><a className="hover:text-sky-600" href="mailto:mail@navoria.de">Kontakt</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Rechtliches</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><a className="hover:text-sky-600" href="/impressum">Impressum</a></li>
              <li><a className="hover:text-sky-600" href="/datenschutz">Datenschutz</a></li>
              <li><a className="hover:text-sky-600" href="/barrierefreiheit">Barrierefreiheit</a></li>
              <li><ConsentResetLink className="hover:text-sky-600" /></li>
            </ul>
            <p className="mt-4 text-xs text-slate-500">Betreiber: AF Consulting, 26789 Leer. Datenquelle: öffentliche Karten- und Verzeichnisdienste.</p>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
          Kein Ersatz für ärztliche Beratung. Bei akutem Notfall 112, bei dringenden Beschwerden 116 117. © {new Date().getFullYear()} Navoria · AF Consulting
        </div>
      </div>
    </footer>
  );
}
