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
  'magazin', 'finden',
  'impressum', 'datenschutz', 'agb', 'barrierefreiheit', 'korrekturen',
  'redaktionelle-standards', 'ueber-uns', 'kontakt', 'praxis-beanspruchen',
  'beanspruchen', 'beanspruchungen', 'api', '_next', '_vercel',
  'sitemap.xml', 'sitemap', 'sitemap-praxen', 'sitemap-cities.xml',
  'sitemap-city-specs', 'sitemap-pages.xml', 'robots.txt', 'robots',
  'favicon.ico', 'favicon', 'manifest.json', 'manifest', 'icon.svg', 'icon',
  'ads.txt', 'llms.txt', 'opengraph-image',
  'webmcp', 'mcp', '404', '500', 'not-found', 'error',
  'blog', 'news', 'events', 'karriere', 'jobs', 'presse', 'partner',
  'login', 'register', 'signup', 'signin', 'logout', 'account', 'profil', 'profile',
  'settings', 'dashboard', 'help', 'hilfe', 'faq', 'support',
]);

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // 410 GONE für offensichtlich kaputte Praxis-URLs mit null/undefined/leerem Slug.
  // Diese entstehen oft aus alten OG-Cache-Einträgen von Facebook/Threads oder alten Sitemaps.
  // Statt 404 senden wir 410, damit Suchmaschinen/Meta die URLs schnell aus ihrem Index entfernen.
  const brokenPraxisRe = /^\/praxis\/[^/]+\/(null|undefined|nan|none|)\/?$/i;
  if (brokenPraxisRe.test(pathname)) {
    return new NextResponse(
      '<!doctype html><html><head><meta name="robots" content="noindex,nofollow"><title>410 Gone</title></head><body><h1>410 Gone</h1><p>Diese URL existiert nicht mehr.</p></body></html>',
      {
        status: 410,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Robots-Tag': 'noindex, nofollow',
          'Cache-Control': 'public, max-age=86400',
        },
      }
    );
  }

  // Match: Root-Level Praxis-Homepage /[slug] (nur wenn kein reservierter Slug)
  // Beispiel: /jaroslaw-raczynski, /herr-dr-med-r-fecadu-shencoru
  const rootSlugMatch = pathname.match(/^\/([a-z0-9][a-z0-9-]{2,79})\/?$/);
  const isRootPraxisHomepage = rootSlugMatch && !RESERVED.has(rootSlugMatch[1].toLowerCase());

  // Match: Legacy-Praxis-URL /praxis/[stadt]/[slug] – wir wissen hier nicht ob homepage_mode,
  // deshalb setzen wir den Header NICHT pauschal (das wäre für Standard-Profile falsch).
  // Der noindex kommt dann via HTML-Meta-Tag aus der Page-Route.

  if (isRootPraxisHomepage) {
    // Request-Header setzen, damit die Root-Layout via next/headers erkennen kann,
    // dass wir auf einer Homepage-Modus-Seite sind → keine globalen Navoria-Schemas emittieren.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-navoria-mode', 'homepage');
    requestHeaders.set('x-navoria-path', pathname);
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    // Response-Header (an Browser + Crawler):
    // noindex/nofollow/noarchive/noimageindex – nur crawlbar für GMB-Verifizierung, nicht indexierbar.
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, noimageindex');
    return response;
  }

  // Alle anderen Routen: Standard-Modus (mit globalen Navoria-Schemas)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-navoria-mode', 'directory');
  requestHeaders.set('x-navoria-path', pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Nur relevante Pfade matchen – nicht API, _next, statische Assets etc.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|sitemap-praxen|assets|images).*)',
  ],
};
