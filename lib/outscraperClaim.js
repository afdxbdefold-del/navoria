// Outscraper Google Maps API Wrapper zur Erkennung des Claim-Status
// (verified/owner_id) für Praxis-Einträge.
//
// Docs: https://outscraper.com/places-api-verified-owner/
// Endpoint: GET https://api.app.outscraper.com/maps/search-v3
// Header:   X-API-KEY: <key>
//
// Kosten: ca. $0.001 pro Query (Google Maps Data API). Der API-Key wird aus
// process.env.OUTSCRAPER_API_KEY gelesen.

const BASE_URL = 'https://api.app.outscraper.com/maps/search-v3';

/**
 * Prüft den Claim-Status für ein oder mehrere place_ids in einem Batch-Request.
 * Outscraper unterstützt bis zu ~25 Queries pro Request.
 *
 * @param {string[]} placeIds Google Place IDs
 * @param {object} [options] { language?: 'de'|'en', timeout?: number }
 * @returns {Promise<Array<{place_id, verified, owner_id, owner_title, name}>>} Ergebnisse in gleicher Reihenfolge
 *          Bei Fehler pro Item: { place_id, error: string }
 */
export async function checkClaimStatusBatch(placeIds, options = {}) {
  if (!Array.isArray(placeIds) || placeIds.length === 0) return [];
  const apiKey = process.env.OUTSCRAPER_API_KEY;
  if (!apiKey) throw new Error('OUTSCRAPER_API_KEY nicht gesetzt');

  const language = options.language || 'de';
  // 20s pro Batch — Vercel Serverless-Function-Limit ist 60s. Bei Batch-Größe 5 & 20s Timeout
  // können wir mehrere Batches nacheinander schaffen, ohne die Function-Grenze zu überschreiten.
  const timeout = options.timeout || 20000;

  // URL bauen: query=A&query=B&query=C&...
  const url = new URL(BASE_URL);
  placeIds.forEach((pid) => url.searchParams.append('query', pid));
  url.searchParams.set('async', 'false');
  url.searchParams.set('limit', '1'); // pro Query: nur 1 Ergebnis (das direkte Match)
  url.searchParams.set('language', language);

  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'X-API-KEY': apiKey },
      signal: controller.signal,
    });
    clearTimeout(timeoutHandle);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Outscraper HTTP ${res.status}: ${text.substring(0, 200)}`);
    }
    const body = await res.json();
    if (body?.error) {
      throw new Error(`Outscraper Error: ${body.errorMessage || 'unknown'}`);
    }

    // body.data ist ein Array von Arrays (pro Query eine Ergebnisliste).
    // Wir mappen 1:1 auf die Reihenfolge der placeIds.
    const results = [];
    const data = body?.data || [];
    for (let i = 0; i < placeIds.length; i++) {
      const queryResults = data[i] || [];
      const first = Array.isArray(queryResults) ? queryResults[0] : null;
      if (!first) {
        results.push({
          place_id: placeIds[i],
          verified: null,
          owner_id: null,
          owner_title: null,
          name: null,
          error: 'not_found',
        });
        continue;
      }
      results.push({
        place_id: placeIds[i],
        // Outscraper liefert `verified` als Bool. owner_id "none" ODER null = unclaimed.
        verified: typeof first.verified === 'boolean' ? first.verified : null,
        owner_id: first.owner_id && first.owner_id !== 'none' ? String(first.owner_id) : null,
        owner_title: first.owner_title || null,
        name: first.name || null,
      });
    }
    return results;
  } catch (err) {
    clearTimeout(timeoutHandle);
    // Klarere Fehlermeldung bei Abort/Timeout
    const isAbort = err?.name === 'AbortError';
    const errorMsg = isAbort
      ? `timeout_${Math.round(timeout / 1000)}s`
      : String(err.message || err).slice(0, 180);
    // Ganzer Batch failed → jeder place_id kriegt error
    return placeIds.map((pid) => ({
      place_id: pid,
      verified: null,
      owner_id: null,
      owner_title: null,
      name: null,
      error: errorMsg,
    }));
  }
}

/**
 * Wartet `ms` Millisekunden.
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
