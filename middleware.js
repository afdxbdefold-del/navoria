// Next.js Middleware: setzt X-Robots-Tag Header für Praxis-Homepage-URLs.
//
// Warum? Homepage-Modus-Seiten (z.B. /jaroslaw-raczynski, /praxis/[stadt]/[slug] mit
// homepage_mode:true) sind TEMPORÄR und dienen nur der Google-Business-Profile-
// Verifizierung. Google soll sie crawlen können (für Namen/Adresse-Match), aber
// NICHT in den Suchindex aufnehmen. Der HTTP-Header X-Robots-Tag ist eine zusätzliche
// Sicherheitsschicht gegen Indexierung, unabhängig vom Meta-Tag in der HTML-Antwort.
//
// Der eigentliche Content-Check (homepage_mode true/false) findet in den Page-Routen
// statt – die Middleware setzt den Header pauschal für die betroffenen URL-Muster.
// Falls die URL kein Homepage-Modus zeigt (weil deaktiviert), leitet die Page ohnehin
// via 301-Redirect um – der Header schadet dann nicht.

import { NextResponse } from 'next/server';

// Reservierte Root-Slugs, die statische Routen sind (kein Homepage-Modus)
const RESERVED = new Set([
  'admin', 'aerzte', 'praxis', 'suche', 'symptome', 'symptom', 'ratgeber',
  'impressum', 'datenschutz', 'agb', 'barrierefreiheit', 'korrekturen',
  'redaktionelle-standards', 'ueber-uns', 'kontakt', 'praxis-beanspruchen',
  'beanspruchen', 'beanspruchungen', 'api', '_next', '_vercel',
  'sitemap.xml', 'sitemap', 'sitemap-praxen', 'robots.txt', 'robots',
  'favicon.ico', 'favicon', 'manifest.json', 'manifest', 'icon.svg', 'icon',
  'webmcp', '404', '500', 'not-found', 'error',
  'blog', 'news', 'events', 'karriere', 'jobs', 'presse', 'partner',
  'login', 'register', 'signup', 'signin', 'logout', 'account', 'profil', 'profile',
  'settings', 'dashboard', 'help', 'hilfe', 'faq', 'support',
]);

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Match: Root-Level Praxis-Homepage /[slug] (nur wenn kein reservierter Slug)
  // Beispiel: /jaroslaw-raczynski, /herr-dr-med-r-fecadu-shencoru
  const rootSlugMatch = pathname.match(/^\/([a-z0-9][a-z0-9-]{2,79})\/?$/);
  const isRootPraxisHomepage = rootSlugMatch && !RESERVED.has(rootSlugMatch[1].toLowerCase());

  // Match: Legacy-Praxis-URL /praxis/[stadt]/[slug] – wir wissen hier nicht ob homepage_mode,
  // deshalb setzen wir den Header NICHT pauschal (das wäre für Standard-Profile falsch).
  // Der noindex kommt dann via HTML-Meta-Tag aus der Page-Route.

  if (isRootPraxisHomepage) {
    const response = NextResponse.next();
    // noindex: nicht in Index aufnehmen
    // nofollow: keinen Links auf dieser Seite folgen (interne Links zum Verzeichnis-Eintrag pflegen wir per JSON-LD)
    // noarchive: kein "Im Cache"-Link in Google-Ergebnissen
    // noimageindex: Bilder nicht separat indexieren
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, noimageindex');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Nur relevante Pfade matchen – nicht API, _next, statische Assets etc.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|sitemap-praxen|assets|images).*)',
  ],
};
