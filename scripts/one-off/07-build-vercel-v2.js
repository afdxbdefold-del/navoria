#!/usr/bin/env node
/**
 * Phase 5b – erweiterte final-vercel.json
 *   1) alle 231 exakten 301-Redirects (aus final-vercel.json)
 *   2) danach Pattern-Fallback-Redirects für die 9 bekannten Fachrichtungs-Prefixe.
 *      Bisher fielen alle nicht-exakten alten URLs in den Catch-All zur Startseite.
 *      Mit den Patterns landen sie auf der passenden Kategorie-Seite auf Navoria.
 *
 *   Reihenfolge: Vercel wertet redirects top-down aus. Exakte Regeln haben Vorrang,
 *   danach Patterns. Der bestehende Catch-All des alten Betreibers greift dann nur
 *   noch für alles was auch dem Pattern nicht entspricht (z. B. /impressum, /agb).
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'final-vercel.json');
const OUT = path.join(__dirname, 'final-vercel-v2.json');

const patternFallbacks = [
  // Konkrete Fachrichtungen mit City+Slug → passende /aerzte/[stadt]/[fachrichtung] Seite
  { source: '/hausarzt/:city/:slug*', destination: '/aerzte/:city/hausarzt', permanent: true },
  { source: '/hausarzt/:city',        destination: '/aerzte/:city/hausarzt', permanent: true },
  { source: '/hausarzt',              destination: '/aerzte/fachrichtung/hausarzt', permanent: true },

  { source: '/zahnarzt/:city/:slug*', destination: '/aerzte/:city/zahnarzt', permanent: true },
  { source: '/zahnarzt/:city',        destination: '/aerzte/:city/zahnarzt', permanent: true },
  { source: '/zahnarzt',              destination: '/aerzte/fachrichtung/zahnarzt', permanent: true },

  { source: '/augenarzt/:city/:slug*', destination: '/aerzte/:city/augenarzt', permanent: true },
  { source: '/augenarzt/:city',        destination: '/aerzte/:city/augenarzt', permanent: true },
  { source: '/augenarzt',              destination: '/aerzte/fachrichtung/augenarzt', permanent: true },

  { source: '/hautarzt/:city/:slug*', destination: '/aerzte/:city/hautarzt', permanent: true },
  { source: '/hautarzt/:city',        destination: '/aerzte/:city/hautarzt', permanent: true },
  { source: '/hautarzt',              destination: '/aerzte/fachrichtung/hautarzt', permanent: true },

  { source: '/orthopaede/:city/:slug*', destination: '/aerzte/:city/orthopaede', permanent: true },
  { source: '/orthopaede/:city',        destination: '/aerzte/:city/orthopaede', permanent: true },
  { source: '/orthopaede',              destination: '/aerzte/fachrichtung/orthopaede', permanent: true },

  { source: '/frauenarzt/:city/:slug*', destination: '/aerzte/:city/frauenarzt', permanent: true },
  { source: '/frauenarzt/:city',        destination: '/aerzte/:city/frauenarzt', permanent: true },
  { source: '/frauenarzt',              destination: '/aerzte/fachrichtung/frauenarzt', permanent: true },

  { source: '/kinderarzt/:city/:slug*', destination: '/aerzte/:city/kinderarzt', permanent: true },
  { source: '/kinderarzt/:city',        destination: '/aerzte/:city/kinderarzt', permanent: true },
  { source: '/kinderarzt',              destination: '/aerzte/fachrichtung/kinderarzt', permanent: true },

  { source: '/hno-arzt/:city/:slug*', destination: '/aerzte/:city/hno-arzt', permanent: true },
  { source: '/hno-arzt/:city',        destination: '/aerzte/:city/hno-arzt', permanent: true },
  { source: '/hno-arzt',              destination: '/aerzte/fachrichtung/hno-arzt', permanent: true },

  // /arzt/... ist generisch – redirect nur nach Stadt
  { source: '/arzt/:city/:slug*', destination: '/aerzte/:city', permanent: true },
  { source: '/arzt/:city',        destination: '/aerzte/:city', permanent: true },
  { source: '/arzt',              destination: '/aerzte', permanent: true },
];

const src = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const merged = { redirects: [...src.redirects, ...patternFallbacks] };
fs.writeFileSync(OUT, JSON.stringify(merged, null, 2));

console.log(`Exakte Redirects:   ${src.redirects.length}`);
console.log(`Pattern-Fallbacks:  ${patternFallbacks.length}`);
console.log(`Gesamt:             ${merged.redirects.length}`);
console.log(`Datei:              ${OUT}`);
