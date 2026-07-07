// DSGVO-freundliches First-Party-Analytics
// Kernprinzipien:
//   - Keine IP-Speicherung. Nur SHA-256-Hash mit täglich rotierendem Salt.
//   - Kein Cross-Site-Tracking, keine Cookies außer session_id (1st-party, strictly-necessary).
//   - Klare Bot-Erkennung (Googlebot, GPTBot, ClaudeBot, PerplexityBot etc.).
//   - TTL: 90 Tage Retention über MongoDB TTL-Index.

import crypto from 'crypto';

/**
 * Täglich rotierender Salt – so ist ein IP-Hash pro Tag stabil (für unique-session-Berechnung
 * innerhalb eines Tages), aber morgen ein anderer Hash. Damit sind keine langfristigen IP-Profile
 * möglich.
 */
function dailySalt() {
  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `${process.env.ANALYTICS_SALT || 'navoria-default-salt-change-me'}-${day}`;
}

export function hashIp(ip) {
  if (!ip) return null;
  return crypto.createHash('sha256').update(String(ip) + dailySalt()).digest('hex').slice(0, 16);
}

/**
 * Extrahiert die Client-IP aus dem Request. Priorisiert Standard-Proxy-Header,
 * damit Vercel/Emergent-Reverse-Proxy funktionieren.
 */
export function getClientIp(request) {
  const h = request.headers;
  const xff = h.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return h.get('x-real-ip') || h.get('cf-connecting-ip') || h.get('true-client-ip') || null;
}

/**
 * Liefert Geo-Info aus Vercel-Edge-Headern.
 * Wenn nicht auf Vercel deployed: leere Werte, dann Fallback auf accept-language für Country.
 */
export function getGeo(request) {
  const h = request.headers;
  const city = h.get('x-vercel-ip-city') ? decodeURIComponent(h.get('x-vercel-ip-city')) : null;
  const country = h.get('x-vercel-ip-country') || null;
  const region = h.get('x-vercel-ip-country-region') || null;

  // Fallback: Accept-Language → Country-Guess
  let fallbackCountry = null;
  if (!country) {
    const lang = h.get('accept-language');
    if (lang) {
      const m = lang.match(/-([A-Z]{2})/);
      if (m) fallbackCountry = m[1];
    }
  }

  return {
    city: city || null,
    country: country || fallbackCountry || null,
    region: region || null,
  };
}

// Bot-Fingerprint via UA. Nur populärste + AI-Crawler.
const BOT_UA_PATTERNS = [
  /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i, /baiduspider/i, /yandexbot/i,
  /gptbot/i, /oai-searchbot/i, /chatgpt-user/i, /claudebot/i, /anthropic/i,
  /perplexitybot/i, /perplexity-user/i, /applebot/i, /amazonbot/i, /ccbot/i,
  /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i, /whatsapp/i, /telegrambot/i,
  /pinterestbot/i, /discordbot/i, /skypeuripreview/i, /slackbot/i,
  /semrushbot/i, /ahrefsbot/i, /mj12bot/i, /petalbot/i, /seznambot/i,
  /uptimerobot/i, /pingdom/i, /statuscake/i, /site24x7/i,
  /crawler/i, /spider/i, /scraperbot/i, /python-requests/i, /curl\//i, /wget\//i, /node-fetch/i,
];

export function isBot(ua) {
  if (!ua) return true;
  return BOT_UA_PATTERNS.some((r) => r.test(ua));
}

/**
 * Ermittelt Device-Type via UA (grob).
 */
export function getDeviceType(ua) {
  if (!ua) return 'unknown';
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini/i.test(ua)) return 'mobile';
  return 'desktop';
}

/**
 * Ermittelt Browser-Familie (grob, nur für Aggregation).
 */
export function getBrowserFamily(ua) {
  if (!ua) return 'unknown';
  if (/edg\//i.test(ua)) return 'Edge';
  if (/chrome/i.test(ua) && !/edg\//i.test(ua)) return 'Chrome';
  if (/firefox/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
  if (/opera|opr\//i.test(ua)) return 'Opera';
  return 'Other';
}
