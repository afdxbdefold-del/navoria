import './globals.css';
import { Toaster } from 'sonner';
import ConsentBanner, { ConsentResetLink } from '@/components/ConsentBanner';

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
  sameAs: [],
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
        <Header />
        <main>{children}</main>
        <Footer />
        <ConsentBanner />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/90 backdrop-blur">
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
        </nav>
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
            <p className="mt-2 text-xs text-slate-400">Betrieben von AF Consulting seit 2025.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Suchen</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><a className="hover:text-sky-600" href="/suche?q=Hausarzt">Hausarzt</a></li>
              <li><a className="hover:text-sky-600" href="/suche?q=Zahnarzt">Zahnarzt</a></li>
              <li><a className="hover:text-sky-600" href="/suche?q=Kardiologe">Kardiologe</a></li>
              <li><a className="hover:text-sky-600" href="/suche?q=Orthop%C3%A4de">Orthopäde</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Städte</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><a className="hover:text-sky-600" href="/suche?ort=Berlin">Berlin</a></li>
              <li><a className="hover:text-sky-600" href="/suche?ort=Hamburg">Hamburg</a></li>
              <li><a className="hover:text-sky-600" href="/suche?ort=M%C3%BCnchen">München</a></li>
              <li><a className="hover:text-sky-600" href="/suche?ort=K%C3%B6ln">Köln</a></li>
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
              <li><ConsentResetLink className="hover:text-sky-600" /></li>
            </ul>
            <p className="mt-4 text-xs text-slate-400">Betreiber: AF Consulting, 26789 Leer. Datenquelle: öffentliche Karten- und Verzeichnisdienste.</p>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          Kein Ersatz für ärztliche Beratung. Bei akutem Notfall 112, bei dringenden Beschwerden 116 117. © {new Date().getFullYear()} Navoria · AF Consulting
        </div>
      </div>
    </footer>
  );
}
