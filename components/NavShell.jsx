'use client';

import { usePathname } from 'next/navigation';
import MobileMenu from '@/components/MobileMenu';
import { ConsentResetLink } from '@/components/ConsentBanner';
import { Check, ArrowRight, Phone } from 'lucide-react';

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

/** Prüft clientseitig, ob auf Standalone-Route */
export function useIsStandaloneRoute() {
  const pathname = usePathname();
  return isStandaloneRoute(pathname);
}

/* ---------- Announcement Bar: solid Primary-Blue ---------- */
function AnnouncementBar() {
  return (
    <a
      href="/praxis-beanspruchen"
      className="navoria-chrome-announce group block w-full transition-colors"
      style={{ background: 'var(--color-primary)', color: '#ffffff' }}
      aria-label="Kostenloses Profil für Ihre Arztpraxis auf Navoria beanspruchen"
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-center gap-2 px-4 py-2 text-center text-xs font-medium sm:gap-3 sm:text-sm">
        <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          <strong className="font-semibold">Sie sind Arzt oder Praxis-Team?</strong>{' '}
          <span className="hidden sm:inline">Kostenloses Profil auf Navoria beanspruchen ·</span>{' '}
          <span className="inline-flex items-center gap-1 underline-offset-2 group-hover:underline">
            Jetzt beanspruchen
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </span>
      </div>
    </a>
  );
}

/* ---------- Logo (weiß-kompatibel) — „Nur N" ---------- */
function LogoMark({ variant = 'dark' }) {
  // variant='dark' → weiße Kachel mit primary-blauem N (auf navy Header)
  // variant='light' → primary-blaue Kachel mit weißem N
  const bg = variant === 'dark' ? '#ffffff' : 'var(--color-primary)';
  const fg = variant === 'dark' ? 'var(--color-primary)' : '#ffffff';
  return (
    <span
      className="inline-flex h-9 w-9 items-center justify-center rounded-[10px]"
      style={{ background: bg }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 40 40" className="h-6 w-6" aria-hidden="true">
        <path
          d="M12 29 V11 L28 29 V11"
          stroke={fg}
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </span>
  );
}

/* ---------- Header: solid Navy ---------- */
function Header() {
  return (
    <header
      className="navoria-chrome sticky top-0 z-30 w-full"
      style={{ background: 'var(--color-primary)' }}
    >
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo + Wordmark */}
        <a href="/" className="flex items-center gap-3 text-white" aria-label="Navoria Startseite">
          <LogoMark variant="dark" />
          <span className="text-[19px] font-semibold tracking-tight leading-none">Navoria</span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Hauptnavigation">
          <NavLink href="/">Start</NavLink>
          <NavLink href="/magazin">Magazin</NavLink>
          <NavLink href="/ratgeber">Ratgeber</NavLink>
          <NavLink href="/symptome">Symptome</NavLink>
          <NavLink href="/aerzte/fachrichtung">Fachrichtungen</NavLink>
        </nav>

        {/* Rechte Aktionen */}
        <div className="flex items-center gap-2">
          <a
            href="/finden"
            className="hidden items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition md:inline-flex"
            style={{ background: '#ffffff', color: 'var(--color-primary)' }}
          >
            Praxis finden
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }) {
  return (
    <a
      href={href}
      className="rounded-lg px-3 py-2 text-[14.5px] font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </a>
  );
}

/* ---------- Footer: solid Navy ---------- */
function Footer() {
  return (
    <footer
      className="navoria-chrome mt-20"
      style={{ background: 'var(--color-primary)', color: '#ffffff' }}
    >
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3 lg:grid-cols-5">
          {/* Brand-Column */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-3">
              <LogoMark variant="dark" />
              <span className="text-lg font-semibold text-white">Navoria</span>
            </a>
            <p className="mt-4 max-w-sm text-[15px]" style={{ color: 'var(--color-primary-light)' }}>
              Verzeichnis für Arztpraxen in Deutschland. Verständliche
              Gesundheitsinformationen. Unabhängig, transparent, redaktionell geprüft.
            </p>
            <p className="mt-4 text-xs" style={{ color: 'rgba(221,240,252,0.6)' }}>
              Betrieben von AF Consulting seit 2025.
            </p>
          </div>

          <FooterCol title="Suchen">
            <FooterLink href="/aerzte/fachrichtung/hausarzt">Hausarzt</FooterLink>
            <FooterLink href="/aerzte/fachrichtung/zahnarzt">Zahnarzt</FooterLink>
            <FooterLink href="/aerzte/fachrichtung/kardiologe">Kardiologe</FooterLink>
            <FooterLink href="/aerzte/fachrichtung/orthopaede">Orthopäde</FooterLink>
          </FooterCol>

          <FooterCol title="Städte">
            <FooterLink href="/aerzte/berlin">Berlin</FooterLink>
            <FooterLink href="/aerzte/hamburg">Hamburg</FooterLink>
            <FooterLink href="/aerzte/muenchen">München</FooterLink>
            <FooterLink href="/aerzte/koeln">Köln</FooterLink>
          </FooterCol>

          <FooterCol title="Über Navoria">
            <FooterLink href="/ueber-uns">Über uns</FooterLink>
            <FooterLink href="/redaktionelle-standards">Redaktionelle Standards</FooterLink>
            <FooterLink href="/korrekturen">Korrekturen melden</FooterLink>
            <FooterLink href="mailto:mail@navoria.de">Kontakt</FooterLink>
          </FooterCol>
        </div>

        {/* Rechtliche Zeile */}
        <div
          className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-8 text-sm"
          style={{ borderColor: 'rgba(255,255,255,0.14)', color: 'var(--color-primary-light)' }}
        >
          <a href="/impressum" className="hover:text-white">Impressum</a>
          <a href="/datenschutz" className="hover:text-white">Datenschutz</a>
          <a href="/barrierefreiheit" className="hover:text-white">Barrierefreiheit</a>
          <ConsentResetLink className="hover:text-white" />
          <span className="ml-auto text-xs" style={{ color: 'rgba(221,240,252,0.7)' }}>
            © {new Date().getFullYear()} Navoria · AF Consulting
          </span>
        </div>

        {/* Notfallzeile */}
        <div
          className="mt-6 flex flex-wrap items-center gap-2 rounded-xl px-4 py-3 text-xs"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(221,240,252,0.85)' }}
        >
          <Phone className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Kein Ersatz für ärztliche Beratung. Bei akutem Notfall <strong className="text-white">112</strong>, bei dringenden Beschwerden ärztlicher Bereitschaftsdienst <strong className="text-white">116 117</strong>.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }) {
  return (
    <div>
      <h4 className="text-sm font-semibold uppercase tracking-wide text-white">{title}</h4>
      <ul className="mt-4 space-y-2.5 text-[15px]" style={{ color: 'var(--color-primary-light)' }}>
        {children}
      </ul>
    </div>
  );
}

function FooterLink({ href, children }) {
  return (
    <li>
      <a href={href} className="transition hover:text-white">
        {children}
      </a>
    </li>
  );
}
