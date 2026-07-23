// Server-Side Request Logger
// Fügt jeden Server-seitig gerenderten Page-Request in die `server_hits` Collection ein.
// Läuft in Node.js Runtime (nicht Edge), sodass MongoDB verfügbar ist.
// Wird von app/layout.js fire-and-forget aufgerufen.

import { getCollection } from './mongodb';
import { v4 as uuidv4 } from 'uuid';

// Bot-Erkennung — deutlich umfangreicher als die Client-Regex, damit auch
// Non-JS-Bots namentlich erfasst werden.
const BOT_PATTERNS = [
  { name: 'googlebot', re: /googlebot|google-inspectiontool|google-safety|adsbot-google/i },
  { name: 'bingbot', re: /bingbot|adidxbot|bingpreview/i },
  { name: 'applebot', re: /applebot/i },
  { name: 'amazonbot', re: /amazonbot|amazon-adsystem/i },
  { name: 'gptbot', re: /gptbot/i },
  { name: 'chatgpt-user', re: /chatgpt-user/i },
  { name: 'oai-searchbot', re: /oai-searchbot/i },
  { name: 'claudebot', re: /claudebot|anthropic-ai/i },
  { name: 'claude-web', re: /claude-web/i },
  { name: 'perplexitybot', re: /perplexitybot|perplexity-user/i },
  { name: 'ccbot', re: /ccbot/i },
  { name: 'bytespider', re: /bytespider/i },
  { name: 'meta-externalagent', re: /meta-externalagent|facebookexternalhit|facebookbot|facebookcatalog/i },
  { name: 'twitterbot', re: /twitterbot|twitterrbot/i },
  { name: 'linkedinbot', re: /linkedinbot/i },
  { name: 'whatsapp', re: /whatsapp/i },
  { name: 'telegrambot', re: /telegrambot/i },
  { name: 'semrushbot', re: /semrushbot/i },
  { name: 'ahrefsbot', re: /ahrefsbot|ahrefssitemap/i },
  { name: 'mj12bot', re: /mj12bot/i },
  { name: 'dotbot', re: /dotbot/i },
  { name: 'yandexbot', re: /yandex/i },
  { name: 'duckduckbot', re: /duckduckbot/i },
  { name: 'baiduspider', re: /baiduspider/i },
  { name: 'seznambot', re: /seznambot/i },
  { name: 'petalbot', re: /petalbot/i },
  { name: 'screamingfrog', re: /screaming\s?frog|frog\/seo/i },
  { name: 'sitebulb', re: /sitebulb/i },
  { name: 'uptime-robot', re: /uptimerobot|pingdom|statuscake|betteruptime/i },
  { name: 'vercel-bot', re: /vercel-screenshot|vercel-og|vercel-cron/i },
  { name: 'archive-org', re: /archive\.org_bot|ia_archiver/i },
];

const GENERIC_BOT_RE = /bot|crawler|spider|scanner|checker|scraper|preview|monitor|http-client|python-requests|curl\/|wget|node-fetch|axios|okhttp/i;

export function detectBot(ua) {
  if (!ua) return { isBot: false, botName: null };
  for (const p of BOT_PATTERNS) {
    if (p.re.test(ua)) return { isBot: true, botName: p.name };
  }
  if (GENERIC_BOT_RE.test(ua)) return { isBot: true, botName: 'other' };
  return { isBot: false, botName: null };
}

function hashIp(ip) {
  if (!ip) return null;
  // Einfacher stabiler Hash — DSGVO-freundlich, keine Klartext-IP.
  let h = 0;
  for (let i = 0; i < ip.length; i++) {
    h = (h << 5) - h + ip.charCodeAt(i);
    h |= 0;
  }
  return `h${Math.abs(h).toString(36)}`;
}

// Pfade, die NICHT geloggt werden sollen
const SKIP_PATH_REGEX = /^\/(api|admin|_next|_vercel)(\/|$)|\.(ico|png|jpg|jpeg|webp|gif|svg|css|js|map|txt|xml|json|woff|woff2|ttf|otf)$/i;

export function shouldLogPath(path) {
  if (!path || typeof path !== 'string') return false;
  if (SKIP_PATH_REGEX.test(path)) return false;
  return true;
}

/**
 * Fire-and-forget Server-Hit-Logger.
 * NICHT awaiten in Server-Components — sonst blockiert es das Rendering.
 */
export function logServerHit({ path, userAgent, ip, referer, host, mode }) {
  if (!shouldLogPath(path)) return Promise.resolve();

  const { isBot, botName } = detectBot(userAgent || '');

  const doc = {
    id: uuidv4(),
    path: String(path).slice(0, 300),
    user_agent: String(userAgent || '').slice(0, 400),
    ua_hash: null, // wird gleich befüllt
    is_bot: isBot,
    bot_name: botName,
    ip_hash: hashIp(ip),
    referer: referer ? String(referer).slice(0, 300) : null,
    host: host ? String(host).slice(0, 100) : null,
    mode: mode || 'directory',
    timestamp: new Date(),
  };
  // ua_hash separat für schnelle group-by aggregations
  if (doc.user_agent) doc.ua_hash = hashIp(doc.user_agent);

  // Fire-and-forget insert
  return (async () => {
    try {
      const col = await getCollection('server_hits');
      // Best-effort Indizes (idempotent — createIndex wirft nicht wenn schon existiert)
      try {
        await col.createIndex({ timestamp: -1 });
        await col.createIndex({ is_bot: 1, timestamp: -1 });
        await col.createIndex({ bot_name: 1, timestamp: -1 });
        await col.createIndex({ path: 1, timestamp: -1 });
        // TTL: automatische Löschung nach 90 Tagen
        await col.createIndex({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
      } catch { /* ignore */ }
      await col.insertOne(doc);
    } catch (e) {
      // Nie werfen — Logging darf niemals das Rendering beeinträchtigen
      // eslint-disable-next-line no-console
      console.warn('[serverTracker] insert failed:', e?.message);
    }
  })();
}
