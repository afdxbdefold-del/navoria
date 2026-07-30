#!/usr/bin/env node
/**
 * Einmaliges Migrations-Skript: alte "rzte-online.vercel.app"-Pfade den
 * kanonischen Navoria-Praxis-Profilen zuordnen.
 *
 * Verwendet die aktuelle Navoria-Datenbank READ-ONLY.
 * Erzeugt: redirect-review.csv, needs-review.csv, unmatched.csv
 *
 * Ausführung:
 *   node scripts/one-off/build-rzte-online-redirects.js
 *
 * Erwartet ENV:  MONGO_URL, DB_NAME (default: navoria_db)
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// ---------------- Konfiguration ----------------
const SCRIPT_DIR = __dirname;
const INPUT_PATH = path.join(SCRIPT_DIR, 'rzte-online-paths.txt');
const OUT_REVIEW = path.join(SCRIPT_DIR, 'redirect-review.csv');
const OUT_NEEDS = path.join(SCRIPT_DIR, 'needs-review.csv');
const OUT_UNMATCH = path.join(SCRIPT_DIR, 'unmatched.csv');
const OUT_VERCEL = path.join(SCRIPT_DIR, 'vercel.json');

const OLD_HOST = 'https://rzte-online.vercel.app';
const NAV_HOST = 'https://navoria.de';

const SAFE_THRESHOLD = 0.85;
const SECOND_MARGIN = 0.08;
const REVIEW_THRESHOLD = 0.50;

// Fachrichtungs-Aliases (URL-Pfad → normalisiert)
const SPECIALTY_MAP = {
  'hausarzt': 'hausarzt', 'arzt': 'hausarzt',
  'hautarzt': 'hautarzt', 'dermatologe': 'hautarzt',
  'augenarzt': 'augenarzt',
  'orthopaede': 'orthopaede', 'orthopede': 'orthopaede', 'orthopde': 'orthopaede',
  'frauenarzt': 'frauenarzt', 'gynkologe': 'frauenarzt', 'gynaekologe': 'frauenarzt',
  'kinderarzt': 'kinderarzt', 'pdiater': 'kinderarzt', 'paediater': 'kinderarzt',
  'zahnarzt': 'zahnarzt',
  'hno-arzt': 'hno', 'hnoarzt': 'hno', 'hno': 'hno',
  'urologe': 'urologe',
  'internist': 'internist',
};

// Generische Termini (ignoriert im Name-Match)
const STOP_WORDS = new Set([
  'herr', 'frau', 'dr', 'drs', 'drmed', 'drsmed', 'dr-med', 'med', 'prof', 'dipl',
  'diplmed', 'dipl-med', 'univ', 'hc', 'mudr', 'imf', 'md',
  'praxis', 'arztpraxis', 'hausarztpraxis', 'zahnarztpraxis', 'kinderarztpraxis',
  'augenarztpraxis', 'orthopdiepraxis', 'frauenarztpraxis', 'hautarztpraxis',
  'hnopraxis', 'urologiepraxis', 'gemeinschaftspraxis', 'praxisgemeinschaft',
  'facharzt', 'fachaerztin', 'fachrztin', 'fachaerzt', 'fachrzten', 'fachaerzten',
  'medizinisches', 'versorgungszentrum', 'zentrum',
  'fr', 'fuer', 'und', 'am', 'im', 'in', 'der', 'die', 'das', 'von', 'zur',
  'ehemals', 'nachf', 'nachfolger',
  'doctor', 'internistische', 'allgemeinpraxis', 'allgemeinmedizin', 'innere',
  'geburtshilfe', 'frauenheilkunde', 'dent', 'medic', 'medicina', 'notfallmedizin',
  'orthopdie', 'orthopaedie', 'praktischer',
  'geschlechtskrankheiten', 'haut', 'inner', 'hausrztin', 'hausrztinnen',
  'allgemeinmediziner', 'rheumatologie',
]);

// Bekannte Umlaut-Rekonstruktionen (fuer City + Namen)
// Reihenfolge wichtig: längere Muster zuerst.
const UMLAUT_REPLACEMENTS = [
  // Städte
  ['dsseldorf', 'duesseldorf'], ['duesseldorf', 'duesseldorf'],
  ['mnchen', 'muenchen'], ['muenchen', 'muenchen'],
  ['mnster', 'muenster'], ['muenster', 'muenster'],
  ['grlitz', 'goerlitz'], ['goerlitz', 'goerlitz'],
  ['gieen', 'giessen'], ['giessen', 'giessen'],
  ['lbau', 'loebau'], ['loebau', 'loebau'],
  ['lningen', 'loeningen'], ['loeningen', 'loeningen'],
  ['lnen', 'luenen'], ['luenen', 'luenen'],
  ['brhl', 'bruehl'], ['bruehl', 'bruehl'],
  ['bblingen', 'boeblingen'], ['boeblingen', 'boeblingen'],
  ['ldenscheid', 'luedenscheid'], ['luedenscheid', 'luedenscheid'],
  ['bren', 'bueren'], ['bueren', 'bueren'],
  ['dren', 'dueren'], ['dueren', 'dueren'],
  ['jterbog', 'jueterbog'], ['jueterbog', 'jueterbog'],
  ['tterbog', 'jueterbog'],
  ['weiwasseroberlausitz', 'weisswasseroberlausitz'],
  ['weisswasseroberlausitz', 'weisswasseroberlausitz'],
  ['hckelhoven', 'hueckelhoven'], ['hueckelhoven', 'hueckelhoven'],
  ['angermnde', 'angermuende'], ['angermuende', 'angermuende'],
  ['grnberg', 'gruenberg'], ['gruenberg', 'gruenberg'],
  ['grnstadt', 'gruenstadt'], ['gruenstadt', 'gruenstadt'],
  ['haselnne', 'haseluenne'], ['haseluenne', 'haseluenne'],
  ['froendenbergruhr', 'froendenbergruhr'],
  ['frndenbergruhr', 'froendenbergruhr'],
  ['mnsingen', 'muensingen'], ['muensingen', 'muensingen'],
  ['schwedtoder', 'schwedt-oder'], ['schwedt-oder', 'schwedt-oder'],
  ['eichsttt', 'eichstaett'], ['eichstaett', 'eichstaett'],
  ['erndtebrck', 'erndtebrueck'], ['erndtebrueck', 'erndtebrueck'],
  ['fuerstenwaldespree', 'fuerstenwalde-spree'], ['frstenwaldespree', 'fuerstenwalde-spree'],
  ['lrrach', 'loerrach'], ['loerrach', 'loerrach'],
  ['oehringen', 'oehringen'], ['hringen', 'oehringen'],
  ['quakenbrck', 'quakenbrueck'], ['quakenbrueck', 'quakenbrueck'],
  ['wanzleben-brde', 'wanzleben-boerde'], ['wanzleben-boerde', 'wanzleben-boerde'],
];

// ---------------- Utilities ----------------

function normalizeUmlauts(str) {
  if (!str) return '';
  let s = String(str).toLowerCase();
  s = s.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
  // Bekannte Muster ersetzen (mehrfach durchlaufen — deterministisch)
  for (const [from, to] of UMLAUT_REPLACEMENTS) {
    // globale Ersetzung
    s = s.split(from).join(to);
  }
  return s;
}

function normalizeCity(citySlug) {
  return normalizeUmlauts(citySlug).replace(/^-+|-+$/g, '');
}

/** Trailing numeric suffix entfernen: "-6982" → weg */
function stripTrailingNumber(slug) {
  return slug.replace(/-\d{2,6}$/, '');
}

/** Tokenisiere Name-Slug für Match: entfernt Stopwords, minimum length. */
function tokenizeName(nameSlug) {
  const raw = stripTrailingNumber(String(nameSlug).toLowerCase());
  // 1. Sonderfälle vor Umlaut-Ersetzung: "mnchen" etc → normalisiere
  const normalized = normalizeUmlauts(raw);
  // Tokens auf '-' splitten
  const tokens = normalized.split(/[-_\s]+/).map((t) => t.trim()).filter(Boolean);
  // Stopwords entfernen + Ein-Zeichen-Tokens raus + Sehr kurze Titel-Tokens
  const meaningful = tokens.filter((t) => {
    if (STOP_WORDS.has(t)) return false;
    if (t.length < 2) return false;
    return true;
  });
  return { rawNormalized: normalized, allTokens: tokens, tokens: meaningful };
}

/** Levenshtein-Distanz (bounded) */
function lev(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const c = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + c);
    }
  }
  return dp[a.length][b.length];
}

/** Ähnlichkeit 0..1 basierend auf Levenshtein */
function similarity(a, b) {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const d = lev(a, b);
  const maxLen = Math.max(a.length, b.length);
  return 1 - d / maxLen;
}

/** Token-Set-Ratio (à la FuzzyWuzzy) */
function tokenSetRatio(tokensA, tokensB) {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersect = [...setA].filter((t) => setB.has(t)).sort();
  const diffA = [...setA].filter((t) => !setB.has(t)).sort();
  const diffB = [...setB].filter((t) => !setA.has(t)).sort();
  const t0 = intersect.join(' ');
  const t1 = (intersect.concat(diffA)).join(' ');
  const t2 = (intersect.concat(diffB)).join(' ');
  // Wenn Schnittmenge vorhanden: bevorzuge sie
  const s1 = similarity(t0, t1);
  const s2 = similarity(t0, t2);
  const s3 = similarity(t1, t2);
  return Math.max(s1, s2, s3);
}

/** Consonant-Skeleton: entfernt Vokale und macht "jrg" identisch zu "juerg". */
function skeleton(s) {
  return String(s).toLowerCase().replace(/[aeiouäöü]/g, '');
}

/** Kombinierter Name-Score: 60% token-set + 40% partial substring (mit Skeleton-Fallback) */
function nameScore(parsedTokens, candidateName) {
  const candNorm = normalizeUmlauts(candidateName || '');
  const candTokens = candNorm.split(/[^a-z0-9]+/).map((t) => t.trim()).filter(Boolean)
    .filter((t) => !STOP_WORDS.has(t) && t.length >= 2);
  if (!parsedTokens.length || !candTokens.length) return 0;

  const tsr = tokenSetRatio(parsedTokens, candTokens);
  // Partial: prüft wie viele der parsedTokens irgendwo im Candidate vorkommen.
  // Fallback via Consonant-Skeleton: "jrg" ↔ "juerg" (beide "jrg"), "sren" ↔ "soeren".
  const candJoined = candTokens.join(' ');
  const candSkeletons = candTokens.map(skeleton);
  let matched = 0;
  for (const t of parsedTokens) {
    if (candJoined.includes(t)) { matched += 1; continue; }
    // Levenshtein-toleranter Match
    let hit = false;
    for (const ct of candTokens) {
      if (lev(t, ct) <= Math.max(1, Math.floor(t.length * 0.15))) { hit = true; break; }
    }
    if (hit) { matched += 1; continue; }
    // Skeleton-Match (fehlende Vokale rekonstruieren)
    const tSkel = skeleton(t);
    if (tSkel.length >= 2) {
      for (const cs of candSkeletons) {
        if (cs === tSkel || (cs.length >= 3 && tSkel.length >= 3 && lev(cs, tSkel) <= 1)) { hit = true; break; }
      }
    }
    if (hit) matched += 1;
  }
  const partial = matched / parsedTokens.length;
  return 0.6 * tsr + 0.4 * partial;
}

function cityScore(parsedCity, candidateCitySlug, candidateCity) {
  const p = normalizeCity(parsedCity);
  const csA = normalizeCity(candidateCitySlug || '');
  const csB = normalizeUmlauts(candidateCity || '').replace(/[^a-z0-9]+/g, '-');
  // Exakter Match: 1.0
  if (p === csA || p === csB) return 1.0;
  // Prefix-Match ("offenbach" ⊂ "offenbach-am-main"): 1.0
  if (csA.startsWith(p + '-') || csB.startsWith(p + '-')) return 1.0;
  // Suffix-Match ("bad-mnstereifel" ⊂ "bad-muenstereifel"): 0.95
  if (csA.endsWith('-' + p) || csB.endsWith('-' + p)) return 0.95;
  // Substring: leicht schwächer
  if (csA.includes(p) || csB.includes(p)) return 0.9;
  return Math.max(similarity(p, csA), similarity(p, csB));
}

function specialtyScore(parsedSpec, candidateSpec) {
  if (!parsedSpec || !candidateSpec) return 0.5; // neutral
  const p = SPECIALTY_MAP[parsedSpec] || parsedSpec;
  const c = normalizeUmlauts(candidateSpec).toLowerCase();
  // "hno" matches "hals-nasen-ohren" o.ä.
  if (p === 'hno' && (c.includes('hno') || c.includes('hals'))) return 1;
  if (p === 'hausarzt' && (c.includes('hausarzt') || c.includes('allgemein'))) return 1;
  if (p === 'hautarzt' && (c.includes('haut') || c.includes('dermat'))) return 1;
  if (c.includes(p)) return 1;
  return 0.3;
}

/** Composite Score: 70% name + 25% city + 5% specialty */
function composite(name, city, spec) {
  return 0.70 * name + 0.25 * city + 0.05 * spec;
}

// ---------------- Path-Parsing ----------------

function parsePath(rawPath) {
  const p = rawPath.trim().replace(/^\/+/, '');
  const parts = p.split('/').filter(Boolean);
  if (parts.length < 3) return null;
  const specialtyRaw = parts[0].toLowerCase();
  const cityRaw = parts[1].toLowerCase();
  const nameSlug = parts.slice(2).join('/');
  const { tokens, rawNormalized } = tokenizeName(nameSlug);

  // Manche Namen enthalten die Stadt (z. B. "-koblenz" am Ende) – wir belassen sie
  // aber, da sie zusätzliche Signal-Kraft haben.
  return {
    sourcePath: '/' + parts.join('/'),
    specialty: specialtyRaw,
    city: normalizeCity(cityRaw),
    nameSlug,
    nameTokens: tokens,
    rawNameNormalized: rawNormalized,
  };
}

// ---------------- Matching ----------------

async function matchAll(paths, col) {
  const results = [];

  // Vorlade: alle City-Slugs kennen
  const citySlugsInDb = new Set(
    (await col.distinct('city_slug', { is_active: { $ne: false } })).filter(Boolean).map((s) => String(s).toLowerCase()),
  );

  // Cache: pro city_slug alle Kandidaten (nur wenn genutzt)
  const cacheByCity = new Map();

  const getCandidates = async (cityNormalized) => {
    if (cacheByCity.has(cityNormalized)) return cacheByCity.get(cityNormalized);
    // 1) Exakte Slug-Varianten
    const variations = new Set([cityNormalized]);
    variations.add(cityNormalized.replace(/ue/g, 'u'));
    variations.add(cityNormalized.replace(/oe/g, 'o'));
    variations.add(cityNormalized.replace(/ae/g, 'a'));

    let candidates = [];
    for (const v of variations) {
      if (citySlugsInDb.has(v)) {
        const found = await col.find(
          { city_slug: v, is_active: { $ne: false } },
          { projection: { name: 1, city: 1, city_slug: 1, slug: 1, specialty_guess: 1, formatted_address: 1, street: 1, postal_code: 1, id: 1, _id: 0 } },
        ).limit(2000).toArray();
        candidates = candidates.concat(found);
      }
    }
    // 2) Prefix-Match: "frankfurt" ↔ "frankfurt-am-main"
    if (candidates.length === 0) {
      const prefixSlugs = Array.from(citySlugsInDb).filter((s) => s.startsWith(cityNormalized + '-'));
      if (prefixSlugs.length) {
        const found = await col.find(
          { city_slug: { $in: prefixSlugs }, is_active: { $ne: false } },
          { projection: { name: 1, city: 1, city_slug: 1, slug: 1, specialty_guess: 1, formatted_address: 1, street: 1, postal_code: 1, id: 1, _id: 0 } },
        ).limit(2000).toArray();
        candidates = candidates.concat(found);
      }
    }
    // 3) Suffix-Match als weiterer Fallback: "-{city}" (z.B. "bad-{X}")
    if (candidates.length === 0) {
      const suffixSlugs = Array.from(citySlugsInDb).filter((s) => s.endsWith('-' + cityNormalized) || s === cityNormalized);
      if (suffixSlugs.length) {
        const found = await col.find(
          { city_slug: { $in: suffixSlugs }, is_active: { $ne: false } },
          { projection: { name: 1, city: 1, city_slug: 1, slug: 1, specialty_guess: 1, formatted_address: 1, street: 1, postal_code: 1, id: 1, _id: 0 } },
        ).limit(2000).toArray();
        candidates = candidates.concat(found);
      }
    }
    // Dedup by slug
    const seen = new Set();
    candidates = candidates.filter((d) => {
      if (seen.has(d.slug)) return false;
      seen.add(d.slug);
      return true;
    });
    cacheByCity.set(cityNormalized, candidates);
    return candidates;
  };

  for (const parsed of paths) {
    const candidates = await getCandidates(parsed.city);
    const scored = [];
    for (const c of candidates) {
      const nameS = nameScore(parsed.nameTokens, c.name);
      const cityS = cityScore(parsed.city, c.city_slug, c.city);
      const specS = specialtyScore(parsed.specialty, c.specialty_guess);
      const total = composite(nameS, cityS, specS);
      scored.push({ candidate: c, nameS, cityS, specS, total });
    }
    scored.sort((a, b) => b.total - a.total);
    const best = scored[0] || null;
    const second = scored[1] || null;

    let status = 'UNMATCHED';
    if (best) {
      const gap = (second ? best.total - second.total : 1);
      if (best.total >= SAFE_THRESHOLD && gap >= SECOND_MARGIN) status = 'SAFE';
      else if (best.total >= REVIEW_THRESHOLD) status = 'REVIEW';
    }
    results.push({ parsed, best, second, top5: scored.slice(0, 5), status });
  }
  return results;
}

// ---------------- CSV/JSON Output ----------------

function csvEscape(v) {
  if (v == null) return '';
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function canonicalUrl(d) {
  return `${NAV_HOST}/praxis/${d.city_slug}/${d.slug}`;
}

async function main() {
  if (!fs.existsSync(INPUT_PATH)) {
    console.error(`Input file fehlt: ${INPUT_PATH}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(INPUT_PATH, 'utf8');
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && l.startsWith('/'));

  console.log(`✓ ${lines.length} Pfade eingelesen`);

  const parsed = lines.map(parsePath).filter(Boolean);
  console.log(`✓ ${parsed.length} Pfade erfolgreich geparst`);

  const mongoUrl = process.env.MONGO_URL;
  const dbName = process.env.DB_NAME || 'navoria_db';
  if (!mongoUrl) throw new Error('MONGO_URL nicht gesetzt');

  console.log(`→ Verbinde: ${mongoUrl.replace(/\/\/([^:]+):[^@]+@/, '//$1:***@')} / db=${dbName}`);
  const client = await MongoClient.connect(mongoUrl);
  const col = client.db(dbName).collection('doctor_places');
  const total = await col.countDocuments({ is_active: { $ne: false } });
  console.log(`→ Navoria-DB: ${total} aktive Praxen im Bestand`);

  const results = await matchAll(parsed, col);
  await client.close();

  // ---- redirect-review.csv ----
  const reviewHeader = ['source_path', 'source_full_url', 'parsed_name', 'parsed_city', 'parsed_specialty', 'best_candidate', 'candidate_address', 'navoria_target_url', 'match_score', 'second_best_score', 'status'];
  const reviewRows = [reviewHeader.join(',')];

  // ---- needs-review.csv ----
  const needsHeader = ['source_path', 'candidate_rank', 'name', 'city', 'address', 'specialty', 'profile_id', 'canonical_url', 'match_score'];
  const needsRows = [needsHeader.join(',')];

  // ---- unmatched.csv ----
  const unmatchHeader = ['source_path', 'source_full_url', 'parsed_name', 'parsed_city', 'parsed_specialty'];
  const unmatchRows = [unmatchHeader.join(',')];

  let safeCount = 0, reviewCount = 0, unmatchCount = 0;

  for (const r of results) {
    const p = r.parsed;
    const source = p.sourcePath;
    const url = `${OLD_HOST}${source}`;
    const nameJoined = p.nameTokens.join(' ');

    if (r.status === 'SAFE' && r.best) {
      safeCount += 1;
      const c = r.best.candidate;
      reviewRows.push([
        source, url, nameJoined, p.city, p.specialty,
        c.name, c.formatted_address || '',
        canonicalUrl(c),
        r.best.total.toFixed(3),
        r.second ? r.second.total.toFixed(3) : '',
        'SAFE',
      ].map(csvEscape).join(','));
    } else if (r.status === 'REVIEW') {
      reviewCount += 1;
      const c = r.best.candidate;
      reviewRows.push([
        source, url, nameJoined, p.city, p.specialty,
        c.name, c.formatted_address || '',
        canonicalUrl(c),
        r.best.total.toFixed(3),
        r.second ? r.second.total.toFixed(3) : '',
        'REVIEW',
      ].map(csvEscape).join(','));
      r.top5.forEach((s, i) => {
        needsRows.push([
          source, i + 1, s.candidate.name, s.candidate.city, s.candidate.formatted_address || '',
          s.candidate.specialty_guess || '', s.candidate.id || '',
          canonicalUrl(s.candidate),
          s.total.toFixed(3),
        ].map(csvEscape).join(','));
      });
    } else {
      unmatchCount += 1;
      reviewRows.push([source, url, nameJoined, p.city, p.specialty, '', '', '', '', '', 'UNMATCHED'].map(csvEscape).join(','));
      unmatchRows.push([source, url, nameJoined, p.city, p.specialty].map(csvEscape).join(','));
    }
  }

  fs.writeFileSync(OUT_REVIEW, reviewRows.join('\n') + '\n');
  fs.writeFileSync(OUT_NEEDS, needsRows.join('\n') + '\n');
  fs.writeFileSync(OUT_UNMATCH, unmatchRows.join('\n') + '\n');

  // vercel.json (nur SAFE, alphabetisch, deduped)
  const safeMap = new Map();
  for (const r of results) {
    if (r.status !== 'SAFE') continue;
    safeMap.set(r.parsed.sourcePath, canonicalUrl(r.best.candidate));
  }
  const sortedSources = Array.from(safeMap.keys()).sort();
  const vercelObj = {
    redirects: sortedSources.map((s) => ({
      source: s,
      destination: safeMap.get(s),
      permanent: true,
    })),
  };
  fs.writeFileSync(OUT_VERCEL, JSON.stringify(vercelObj, null, 2) + '\n');
  // Validierung
  try { JSON.parse(fs.readFileSync(OUT_VERCEL, 'utf8')); }
  catch (e) { throw new Error('vercel.json ist kein gültiges JSON: ' + e.message); }

  console.log('');
  console.log('╔═════════════════════════════════════════════╗');
  console.log('║  Zuordnungs-Report                          ║');
  console.log('╠═════════════════════════════════════════════╣');
  console.log(`║  Pfade gesamt          : ${String(results.length).padStart(4)}               ║`);
  console.log(`║  ✅ SAFE (Redirect)    : ${String(safeCount).padStart(4)}               ║`);
  console.log(`║  ⚠  REVIEW nötig       : ${String(reviewCount).padStart(4)}               ║`);
  console.log(`║  ❌ UNMATCHED          : ${String(unmatchCount).padStart(4)}               ║`);
  console.log('╚═════════════════════════════════════════════╝');
  console.log('');
  console.log('Erzeugte Dateien:');
  console.log(`  • ${OUT_REVIEW}`);
  console.log(`  • ${OUT_NEEDS}`);
  console.log(`  • ${OUT_UNMATCH}`);
  console.log(`  • ${OUT_VERCEL}  (nur ${safeCount} SAFE-Redirects)`);
}

main().catch((e) => { console.error('FEHLER:', e); process.exit(1); });
