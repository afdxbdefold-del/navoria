#!/usr/bin/env node
/**
 * Phase 5 – finaler Migrationsreport + Vercel-Redirect-Datei.
 *
 * Erzeugt:
 *   final-vercel.json               (nur permanent Redirects zu real existierenden Slugs)
 *   redirect-review-final.csv       (alle Redirects, sortiert, mit Quelle)
 *   places-imported.csv             (nur PLACES_IMPORTED_NEW)
 *   migration-created-review.csv    (nur REVIEW_CREATED)
 *   still-unresolved.csv            (nur STILL_UNRESOLVED)
 *
 * Verifiziert jeden Zielslug per DB-Lookup. Slugs ohne DB-Match kommen NICHT
 * in final-vercel.json, sondern in still-unresolved.csv.
 */
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const DIR = __dirname;
const PHASE2 = path.join(DIR, 'phase2-matches.json');
const PHASE3 = path.join(DIR, 'phase3-4-results.json');
const NAV_HOST = 'https://navoria.de';

const OUT_JSON = path.join(DIR, 'final-vercel.json');
const OUT_ALL = path.join(DIR, 'redirect-review-final.csv');
const OUT_PLACES = path.join(DIR, 'places-imported.csv');
const OUT_REVIEW = path.join(DIR, 'migration-created-review.csv');
const OUT_UNRESOLVED = path.join(DIR, 'still-unresolved.csv');

const csvEsc = (v) => { if (v==null) return ''; const s=String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; };

async function main() {
  const p2 = JSON.parse(fs.readFileSync(PHASE2,'utf8'));
  const p3 = JSON.parse(fs.readFileSync(PHASE3,'utf8'));
  const client = await MongoClient.connect(process.env.MONGO_URL);
  const col = client.db(process.env.DB_NAME || 'navoria_db').collection('doctor_places');

  // Master-Liste: alle Pfade aus Phase 2 (231)
  const paths = Object.keys(p2);
  const rows = [];   // [{source, target, source_status, verified}]
  const places = [];
  const reviews = [];
  const unresolved = [];

  for (const src of paths) {
    const p3r = p3[src] || null;
    const p2r = p2[src];
    let status = null;
    let target = null;
    let name = null;
    let extra = {};

    if (p3r && p3r.status === 'ALREADY_MATCHED') {
      status = 'MATCHED_PHASE2';
      target = p3r.target?.canonical || `${NAV_HOST}/praxis/${p3r.target?.canonical}`;
      name = p3r.target?.name;
      extra.reason = p3r.reason;
    } else if (p3r && p3r.status === 'PLACES_FOUND_EXISTING') {
      status = 'PLACES_FOUND_EXISTING';
      target = p3r.target?.canonical;
      name = p3r.target?.name;
      extra.dedupe_by = p3r.dedupe_by;
      extra.match_score = p3r.match_score;
    } else if (p3r && p3r.status === 'PLACES_IMPORTED_NEW') {
      status = 'PLACES_IMPORTED_NEW';
      target = p3r.target?.canonical;
      name = p3r.target?.name;
      extra.navoria_id = p3r.target?.navoria_id;
      extra.match_score = p3r.match_score;
    } else if (p3r && p3r.status === 'REVIEW_CREATED') {
      status = 'REVIEW_CREATED';
      target = p3r.target?.canonical;
      name = p3r.target?.name;
      extra.navoria_id = p3r.target?.navoria_id;
    } else {
      status = p3r?.status || 'UNKNOWN';
    }

    // Verifiziere Ziel-Slug in DB
    let verified = false;
    let slug = null;
    let citySlug = null;
    if (target && target.startsWith(NAV_HOST + '/praxis/')) {
      const tail = target.slice((NAV_HOST + '/praxis/').length);
      const [cs, s] = tail.split('/');
      citySlug = cs; slug = s;
      const doc = await col.findOne({ slug }, { projection: { slug:1, city_slug:1, is_active:1, verification_status:1, _id:0 } });
      if (doc && doc.is_active !== false) verified = true;
    }

    rows.push({ source: src, target, name, status, verified, ...extra });

    if (!verified) {
      unresolved.push({ source: src, name, target: target || '', status, reason: extra.reason || '' });
    } else {
      if (status === 'PLACES_IMPORTED_NEW') {
        places.push({ source: src, name, target, place_id: extra.match_score ? '' : '', match_score: extra.match_score });
      }
      if (status === 'REVIEW_CREATED') {
        reviews.push({ source: src, name, target, navoria_id: extra.navoria_id });
      }
    }
  }
  await client.close();

  // final-vercel.json
  const validRedirects = rows.filter((r) => r.verified && r.target && r.target.startsWith(NAV_HOST + '/praxis/'));
  const sortedRedirects = validRedirects.map((r) => ({ source: r.source, destination: r.target, permanent: true }))
    .sort((a, b) => a.source.localeCompare(b.source));
  const dedupSources = new Set();
  const finalRedirects = [];
  for (const r of sortedRedirects) {
    if (dedupSources.has(r.source)) continue;
    dedupSources.add(r.source);
    finalRedirects.push(r);
  }
  fs.writeFileSync(OUT_JSON, JSON.stringify({ redirects: finalRedirects }, null, 2));

  // redirect-review-final.csv (alle inkl. unresolved für Audit)
  const allHead = 'source,target,name,status,verified,dedupe_by,match_score,reason';
  const allRows = rows.map((r) => [r.source, r.target||'', r.name||'', r.status, r.verified?'yes':'no', r.dedupe_by||'', r.match_score||'', r.reason||''].map(csvEsc).join(','));
  allRows.sort();
  fs.writeFileSync(OUT_ALL, [allHead, ...allRows].join('\n') + '\n');

  // places-imported.csv
  const placesHead = 'source,name,target,match_score';
  const placesRows = places.map((r) => [r.source, r.name||'', r.target, r.match_score||''].map(csvEsc).join(','));
  placesRows.sort();
  fs.writeFileSync(OUT_PLACES, [placesHead, ...placesRows].join('\n') + '\n');

  // migration-created-review.csv
  const reviewHead = 'source,name,target,navoria_id';
  const reviewRows = reviews.map((r) => [r.source, r.name||'', r.target, r.navoria_id||''].map(csvEsc).join(','));
  reviewRows.sort();
  fs.writeFileSync(OUT_REVIEW, [reviewHead, ...reviewRows].join('\n') + '\n');

  // still-unresolved.csv
  const unrHead = 'source,name,target,status,reason';
  const unrRows = unresolved.map((r) => [r.source, r.name||'', r.target||'', r.status, r.reason||''].map(csvEsc).join(','));
  unrRows.sort();
  fs.writeFileSync(OUT_UNRESOLVED, [unrHead, ...unrRows].join('\n') + '\n');

  const counts = rows.reduce((a, r) => { a[r.status] = (a[r.status]||0)+1; return a; }, {});
  const verifiedCnt = rows.filter((r) => r.verified).length;
  console.log('');
  console.log('╔═════════════════════════════════════════════════╗');
  console.log('║  Phase 5 – Finaler Report                       ║');
  console.log('╠═════════════════════════════════════════════════╣');
  console.log(`║  Pfade gesamt                        : ${String(rows.length).padStart(4)}     ║`);
  console.log(`║  ✅ Ziel im DB verifiziert (200-fähig): ${String(verifiedCnt).padStart(4)}     ║`);
  console.log(`║  ❌ Weiterhin ungelöst                : ${String(unresolved.length).padStart(4)}     ║`);
  console.log('║  ---- Aufteilung nach Status --------           ║');
  for (const [k, v] of Object.entries(counts)) console.log(`║    ${k.padEnd(28)}: ${String(v).padStart(4)}    ║`);
  console.log('╚═════════════════════════════════════════════════╝');
  console.log(`Vercel-Datei:            ${OUT_JSON} (${finalRedirects.length} Redirects)`);
  console.log(`Redirect-Review-Report:  ${OUT_ALL}`);
  console.log(`Places-Imported CSV:     ${OUT_PLACES} (${places.length})`);
  console.log(`Review-Created CSV:      ${OUT_REVIEW} (${reviews.length})`);
  console.log(`Still-Unresolved CSV:    ${OUT_UNRESOLVED} (${unresolved.length})`);

  // Validierung: final-vercel.json parsebar
  const back = JSON.parse(fs.readFileSync(OUT_JSON,'utf8'));
  console.log(`\nfinal-vercel.json parsebar: ${Array.isArray(back.redirects)} (${back.redirects.length} Einträge)`);
}

main().catch((e) => { console.error('FEHLER:', e); process.exit(1); });
