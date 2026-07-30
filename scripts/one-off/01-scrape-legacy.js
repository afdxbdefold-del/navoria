#!/usr/bin/env node
/**
 * Phase 1: 231 alte Profil-URLs von rzte-online.vercel.app scrapen und
 * strukturierte Daten (Name, Adresse, Telefon, PLZ, Stadt, Geo) extrahieren.
 *
 * Speichert Cache in scraped-data.json — idempotent, kann mehrfach laufen.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

const SCRIPT_DIR = __dirname;
const INPUT = path.join(SCRIPT_DIR, 'rzte-online-paths.txt');
const CACHE = path.join(SCRIPT_DIR, 'scraped-data.json');
const CSV_OUT = path.join(SCRIPT_DIR, 'scraped-data.csv');

const BASE = 'https://rzte-online.vercel.app';

function fetchWithRedirect(url, maxHops = 5) {
  return new Promise((resolve, reject) => {
    const doFetch = (u, hops) => {
      if (hops <= 0) return reject(new Error('Too many redirects'));
      const parsed = new URL(u);
      const req = https.request({
        hostname: parsed.hostname, port: 443, path: parsed.pathname + parsed.search,
        method: 'GET', headers: {
          'User-Agent': 'Mozilla/5.0 (Navoria-Migration/1.0)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Encoding': 'identity',
        }, timeout: 15000,
      }, (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
          const loc = res.headers.location;
          res.resume();
          if (loc) return doFetch(new URL(loc, u).href, hops - 1);
          return reject(new Error('Redirect ohne Location'));
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error('HTTP ' + res.statusCode + ' bei ' + u));
        }
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => resolve({ url: u, html: data }));
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(new Error('Timeout')); });
      req.end();
    };
    doFetch(url, maxHops);
  });
}

function extractFromHtml(html) {
  const out = {};

  // 1) JSON-LD (bevorzugte Quelle)
  const ldMatches = html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of ldMatches) {
    try {
      const raw = m[1].trim();
      const jsonl = JSON.parse(raw);
      const items = Array.isArray(jsonl) ? jsonl : (jsonl['@graph'] || [jsonl]);
      for (const item of items) {
        if (!item || typeof item !== 'object') continue;
        const type = String(item['@type'] || '').toLowerCase();
        if (type.includes('physician') || type.includes('medicalbusiness') ||
            type.includes('medicalorganization') || type.includes('person') ||
            type.includes('localbusiness') || type.includes('dentist')) {
          out.name = out.name || item.name;
          out.telephone = out.telephone || item.telephone;
          out.email = out.email || item.email;
          out.website = out.website || item.url;
          const addr = item.address;
          if (addr && typeof addr === 'object') {
            out.street = out.street || addr.streetAddress;
            out.postal_code = out.postal_code || addr.postalCode;
            out.city = out.city || addr.addressLocality;
            out.region = out.region || addr.addressRegion;
          }
          const geo = item.geo;
          if (geo && typeof geo === 'object') {
            out.lat = out.lat || geo.latitude;
            out.lng = out.lng || geo.longitude;
          }
          out.specialty = out.specialty || item.medicalSpecialty || item.speciality;
        }
      }
    } catch (_) { /* ignoriere JSON-LD Parse-Fehler */ }
  }

  // 2) Fallback: OpenGraph & Meta
  const og = (prop) => {
    const re = new RegExp('<meta[^>]*(?:property|name)=[\"\']' + prop + '[\"\'][^>]*content=[\"\'](.*?)[\"\']', 'i');
    const m = html.match(re); return m ? m[1] : null;
  };
  out.name = out.name || og('og:title') || og('title');
  const desc = og('og:description') || og('description') || '';

  // 3) Regex-Fallback aus dem HTML-Text
  const telMatch = html.match(/href="tel:([^"]+)"/);
  if (!out.telephone && telMatch) out.telephone = telMatch[1];

  // Adresse aus Text: PLZ + Stadt Suche
  const plzMatch = html.match(/\b(\d{5})\s+([A-ZÄÖÜ][A-Za-zäöüÄÖÜß\- ]{2,40})/);
  if (plzMatch) {
    out.postal_code = out.postal_code || plzMatch[1];
    out.city = out.city || plzMatch[2].trim();
  }

  // Straße-Regex (Straßenname mit "straße" oder "str.")
  const stMatch = html.match(/([A-ZÄÖÜ][A-Za-zäöüÄÖÜß\-\.]{2,40}(?:straße|str\.|weg|platz|allee|ring|damm|gasse)\s*\d+[a-z\-\/]*)/);
  if (!out.street && stMatch) out.street = stMatch[1].trim();

  // Description als "meta_description" mitgeben
  out.meta_description = desc || null;
  return out;
}

async function main() {
  const paths = fs.readFileSync(INPUT, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && l.startsWith('/'));
  const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};
  console.log(`→ ${paths.length} Pfade / ${Object.keys(cache).length} bereits gescraped`);

  let done = 0, errors = 0;
  for (const p of paths) {
    if (cache[p] && cache[p].name) { done += 1; continue; }
    const url = BASE + p;
    try {
      const { url: finalUrl, html } = await fetchWithRedirect(url);
      const data = extractFromHtml(html);
      data.legacy_url = url;
      data.final_url = finalUrl;
      cache[p] = data;
      done += 1;
      if (done % 10 === 0) {
        console.log(`  ${done}/${paths.length}  (letzter: ${data.name || '?'})`);
        fs.writeFileSync(CACHE, JSON.stringify(cache, null, 2));
      }
      await new Promise((r) => setTimeout(r, 120));  // rate-limit
    } catch (e) {
      cache[p] = { error: String(e.message || e), legacy_url: url };
      errors += 1;
      console.log(`  ✗ ${p}: ${e.message}`);
    }
  }
  fs.writeFileSync(CACHE, JSON.stringify(cache, null, 2));

  // CSV-Übersicht
  const csvRows = ['path,name,street,postal_code,city,telephone'];
  const csvEsc = (v) => { if (v==null) return ''; const s=String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  for (const p of paths) {
    const d = cache[p] || {};
    csvRows.push([p, d.name, d.street, d.postal_code, d.city, d.telephone].map(csvEsc).join(','));
  }
  fs.writeFileSync(CSV_OUT, csvRows.join('\n') + '\n');

  const withName = paths.filter((p) => cache[p] && cache[p].name).length;
  const withPhone = paths.filter((p) => cache[p] && cache[p].telephone).length;
  const withStreet = paths.filter((p) => cache[p] && cache[p].street).length;
  console.log('');
  console.log(`✅ Fertig. ${done} scraped, ${errors} Fehler.`);
  console.log(`   → mit Name:  ${withName}/${paths.length}`);
  console.log(`   → mit Tel.:  ${withPhone}/${paths.length}`);
  console.log(`   → mit Str.:  ${withStreet}/${paths.length}`);
}

main().catch((e) => { console.error('FEHLER:', e); process.exit(1); });
