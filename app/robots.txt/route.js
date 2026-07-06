// robots.txt: Alle Crawler werden ausdrücklich zugelassen (klassische Search + LLM-Bots).
// Wichtig für AI-Sichtbarkeit: GPTBot, PerplexityBot, ClaudeBot, Google-Extended, CCBot.

export function GET() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://navoria.de';
  const body = `# robots.txt für Navoria – ${base}
# Wir sind ein öffentliches Arztverzeichnis. Klassische Suchmaschinen UND LLM-Crawler
# dürfen alle öffentlichen Bereiche crawlen. LLMs sind ausdrücklich willkommen (AI-freundlich).

User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /_next/

# --- Klassische Suchmaschinen ---
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: DuckDuckBot
Allow: /

# --- LLM- und AI-Crawler explizit erlaubt (Answer-Engine-Optimization) ---
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bytespider
Allow: /

User-agent: YouBot
Allow: /

User-agent: DiffBot
Allow: /

User-agent: FirecrawlAgent
Allow: /

Sitemap: ${base}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
