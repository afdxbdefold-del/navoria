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
import { extractPraxisSubdomain, isRootDomain, isPreviewHost, MAIN_DOMAIN } from '@/lib/subdomains';

// -- Legacy Referrer Rescue: reicht Alt-Pfad an /api/legacy-rescue durch --
const LEGACY_REFERER_RE = /(xn--rzte-online-k8a|rzte-online\.vercel|%C3%A4rzte-online)/i;
function extractLegacyPath(refererStr) {
  if (!refererStr) return null;
  if (!LEGACY_REFERER_RE.test(refererStr)) return null;
  let u;
  try { u = new URL(refererStr); } catch { return null; }
  const path = u.pathname || '';
  // Uninteressante Pfade ignorieren (Startseite, Impressum, robots.txt, Bilder)
  if (!path || path === '/' || path.length < 3) return null;
  if (/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|txt|xml|pdf)$/i.test(path)) return null;
  if (/^\/(impressum|datenschutz|agb|kontakt|robots\.txt|favicon)/i.test(path)) return null;
  return path;
}

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
  const hostHeader = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const clientHost = String(hostHeader).split(',')[0].trim().toLowerCase().split(':')[0];

  // ===== Legacy-Referrer-Rescue =====
  // Wenn User auf navoria.de/ landen und der Referer eine URL von der alten Domain
  // "ärzte-online.org" (xn--rzte-online-k8a.org) oder rzte-online.vercel.app ist,
  // reichen wir den Alt-Pfad an /api/legacy-rescue durch. Dort wird per DB-Lookup
  // die konkrete Praxis gefunden (Deep-Match), sonst Fallback auf Kategorie.
  //
  // Zusätzlich unterstützen wir einen ?legacy=<path>-Parameter als Fallback,
  // falls die alte Domain diesen bei der Weiterleitung mitgibt. Das umgeht das
  // Problem, dass moderne Browser mit strict Referrer-Policy den Referer strippen.
  if (pathname === '/' || pathname === '') {
    // 1) Bevorzugt: expliziter ?legacy=<path>-Parameter aus der Alt-Domain
    const legacyParam = request.nextUrl.searchParams.get('legacy')
      || request.nextUrl.searchParams.get('ref');
    if (legacyParam && legacyParam.length >= 3 && legacyParam.startsWith('/')) {
      const rescueUrl = new URL('/api/legacy-rescue', request.url);
      rescueUrl.searchParams.set('path', legacyParam);
      rescueUrl.searchParams.set('src', 'param');
      return NextResponse.redirect(rescueUrl, {
        status: 302,
        headers: { 'X-Navoria-Legacy-Rescue': 'lookup-param' },
      });
    }

    // 2) Fallback: Referer-Header prüfen (funktioniert nur wenn Browser ihn sendet)
    const referer = request.headers.get('referer') || '';
    const legacyPath = extractLegacyPath(referer);
    if (legacyPath) {
      const rescueUrl = new URL('/api/legacy-rescue', request.url);
      rescueUrl.searchParams.set('path', legacyPath);
      rescueUrl.searchParams.set('src', 'referer');
      return NextResponse.redirect(rescueUrl, {
        status: 302,
        headers: { 'X-Navoria-Legacy-Rescue': 'lookup-referer' },
      });
    }
  }

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

  // ===== Wildcard-Subdomain-Routing =====
  // Wenn Request auf <slug>.navoria.de eingeht: interner Rewrite auf /[slug]/page.js.
  // Die Page prüft dann homepage_mode und rendert entweder PracticeHomepage oder
  // redirected auf /praxis/[stadt]/[slug] (Verzeichnis).
  // Deaktiviert für Preview-/Emergent-Hosts — dort läuft weiter das alte /[praxisSlug]-Verhalten.
  const subdomain = extractPraxisSubdomain(clientHost);
  if (subdomain) {
    // Non-Root-Paths auf einer Praxis-Subdomain → 301 auf Root-Domain
    // (bewahrt SEO, falls versehentlich <slug>.navoria.de/aerzte etc. verlinkt wurde).
    if (pathname !== '/' && pathname !== '') {
      const target = `https://${MAIN_DOMAIN}${pathname}${request.nextUrl.search || ''}`;
      return NextResponse.redirect(target, 301);
    }

    // Root-Path auf Praxis-Subdomain → intern rewrite auf /[praxisSlug]
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${subdomain}`;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-navoria-mode', 'homepage');
    requestHeaders.set('x-navoria-subdomain', subdomain);
    requestHeaders.set('x-navoria-path', `/${subdomain}`);

    const response = NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
    // Praxis-Subdomains sind produktive, indexierbare Seiten – kein noindex mehr.
    return response;
  }

  // Match: Root-Level Praxis-Homepage /[slug] (nur wenn kein reservierter Slug)
  // Beispiel: /jaroslaw-raczynski, /herr-dr-med-r-fecadu-shencoru
  const rootSlugMatch = pathname.match(/^\/([a-z0-9][a-z0-9-]{2,79})\/?$/);
  const isRootPraxisHomepage = rootSlugMatch && !RESERVED.has(rootSlugMatch[1].toLowerCase());

  // Match: Legacy-Praxis-URL /praxis/[stadt]/[slug] – wir wissen hier nicht ob homepage_mode,
  // deshalb setzen wir den Header NICHT pauschal (das wäre für Standard-Profile falsch).
  // Der noindex kommt dann via HTML-Meta-Tag aus der Page-Route.

  if (isRootPraxisHomepage) {
    // Wenn wir auf der Root-Domain (navoria.de) sind, könnte die Praxis-Homepage
    // via Subdomain besser platziert sein — die Page-Route entscheidet und leitet
    // ggf. um. Wir setzen nur die Mode-Header, damit Layout weiß, dass es Homepage-Modus ist.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-navoria-mode', 'homepage');
    requestHeaders.set('x-navoria-path', pathname);
    requestHeaders.set('x-navoria-client-host', clientHost);
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    // Praxis-Homepages sind produktive Seiten – kein noindex.
    return response;
  }

  // Alle anderen Routen: Standard-Modus (mit globalen Navoria-Schemas)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-navoria-mode', 'directory');
  requestHeaders.set('x-navoria-path', pathname);
  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // Consent-Signal für KI-Training: kein Meta-AI, keine Bild-KI-Trainings.
  // Wichtig: `noai` und `noimageai` sind sog. Consent-Signals — nicht alle Crawler
  // respektieren sie, aber Meta, Google-Extended, Bytespider u. a. reagieren darauf.
  // Klassische Suchmaschinen-Indexierung bleibt via HTML-Meta-Tags gesteuert.
  response.headers.set('X-Robots-Tag', 'noai, noimageai');
  return response;
}

export const config = {
  // Nur relevante Pfade matchen – nicht API, _next, statische Assets etc.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|sitemap-praxen|assets|images).*)',
  ],
};
