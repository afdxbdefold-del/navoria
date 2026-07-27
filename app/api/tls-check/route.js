// Navoria TLS-Check-Endpoint für Caddy On-Demand-TLS.
//
// Caddy fragt bei jedem neuen Cert-Request diesen Endpoint mit ?domain=<host>.
// Wir antworten HTTP 200 wenn der Host zu uns gehört (navoria.de oder Subdomain),
// oder HTTP 403 wenn nicht. Verhindert Cert-Spam bei Angriffen auf zufällige Subdomains.
//
// Rate-Limits von Let's Encrypt: 50 Certs pro Domain pro Woche.
// Bei Missbrauch (jemand ruft aaaa.navoria.de, aaab.navoria.de …): Rate-Limit erreicht.
// Deshalb: Wir erlauben nur bekannte / reservierte Muster.

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MAIN_DOMAIN = 'navoria.de';

// Reservierte Subdomains — exakt spiegeln mit lib/subdomains.js
const RESERVED = new Set([
  'www', 'mail', 'api', 'admin', 'cdn', 'static', 'assets',
  'blog', 'shop', 'app', 'dev', 'staging', 'preview', 'test',
  'mx', 'smtp', 'imap', 'pop', 'pop3', 'ftp', 'sftp',
  'ns1', 'ns2', 'dns', 'dns1', 'dns2',
  'autodiscover', 'autoconfig',
  'help', 'support', 'docs', 'status',
]);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const domain = String(searchParams.get('domain') || '').trim().toLowerCase();

  if (!domain) return new Response('missing domain', { status: 400 });

  // 1. Root-Domain oder www — immer erlauben
  if (domain === MAIN_DOMAIN || domain === `www.${MAIN_DOMAIN}`) {
    return new Response('ok', { status: 200 });
  }

  // 2. Muss auf .navoria.de enden
  if (!domain.endsWith(`.${MAIN_DOMAIN}`)) {
    return new Response('domain not allowed', { status: 403 });
  }

  // 3. Subdomain extrahieren (letzte Ebene vor .navoria.de)
  const prefix = domain.slice(0, -(`.${MAIN_DOMAIN}`.length));
  if (!prefix) return new Response('empty subdomain', { status: 403 });

  const parts = prefix.split('.');
  const sub = parts[parts.length - 1];

  // 4. Slug-Format prüfen: nur a-z, 0-9, Bindestrich, 3–80 Zeichen
  if (!/^[a-z0-9][a-z0-9-]{2,79}$/.test(sub)) {
    return new Response('invalid slug format', { status: 403 });
  }

  // 5. Reservierte Namen ausschließen
  if (RESERVED.has(sub)) {
    return new Response('reserved subdomain', { status: 403 });
  }

  // 6. Optional: Nur Slugs erlauben, die tatsächlich in der DB als homepage_slug existieren.
  //    Verhindert Cert-Spam für nicht-existente Praxen komplett.
  //    Ausgeschaltet für Flexibilität — wenn du das strenger willst, kommentiere ein.
  //
  // try {
  //   const { getCollection } = await import('@/lib/mongodb');
  //   const col = await getCollection('doctor_places');
  //   const exists = await col.findOne({ homepage_slug: sub, homepage_mode: true }, { projection: { _id: 1 } });
  //   if (!exists) return new Response('unknown practice', { status: 403 });
  // } catch { /* DB-Fehler: fallback = erlauben */ }

  return new Response('ok', { status: 200 });
}
