'use client';

import { usePathname } from 'next/navigation';
import MobileMenu from '@/components/MobileMenu';
import { ConsentResetLink } from '@/components/ConsentBanner';

// Routen, auf denen das Navoria-Chrome (Announcement + Header + Footer) NICHT gerendert wird.
// Praxis-eigene One-Page-Websites sollen eigenständig wirken.
const STANDALONE_ROUTES = ['/drmed-thomas-gerhard'];

function isStandaloneRoute(pathname) {
  if (!pathname) return false;
  return STANDALONE_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function NavShellTop() {
  const pathname = usePathname();
  if (isStandaloneRoute(pathname)) return null;
  return (
    <>
      <AnnouncementBar />
      <Header />
    </>
  );
}

export function NavShellBottom() {
  const pathname = usePathname();
  if (isStandaloneRoute(pathname)) return null;
  return <Footer />;
}

/** Prüft clientseitig, ob auf Standalone-Route – z.B. um ConsentBanner zu verstecken */
export function useIsStandaloneRoute() {
  const pathname = usePathname();
  return isStandaloneRoute(pathname);
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
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              <path d="M12 9v5M9.5 11.5h5" strokeWidth="2.2" />
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
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  <path d="M12 9v5M9.5 11.5h5" strokeWidth="2.2" />
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
