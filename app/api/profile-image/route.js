// Dynamisches Profilbild für Arzt-/Praxisseiten.
// URL: /api/profile-image  (auf jeder Praxis-Subdomain)
//
// Verhalten:
//   - Bestimmt die Praxis anhand des Hosts (Subdomain) ODER des ?slug= Query-Params.
//   - Rendert ein neutrales, gebrandetes 1200×900-PNG mit Name, Fachrichtung, Stadt.
//   - KEIN erfundenes Porträt. Nur medizinisches Symbol + Branding.
//   - Öffentlich, indexierbar, 200, cache-freundlich.

import { ImageResponse } from 'next/og';
import { headers } from 'next/headers';
import { getCollection } from '@/lib/mongodb';
import { extractPraxisSubdomain } from '@/lib/subdomains';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function findDoctor(req) {
  const url = new URL(req.url);
  const querySlug = url.searchParams.get('slug');
  const hdrs = await headers();
  const host = (hdrs.get('x-forwarded-host') || hdrs.get('host') || '').split(',')[0].trim().toLowerCase().split(':')[0];
  const sub = extractPraxisSubdomain(host);
  const col = await getCollection('doctor_places');

  // 1) Explizites ?slug=… hat Vorrang (funktioniert auch von navoria.de aus).
  if (querySlug) {
    const bySlug = await col.findOne(
      { $or: [{ slug: querySlug }, { homepage_slug: querySlug.toLowerCase() }] },
      { projection: { name: 1, specialty_guess: 1, city: 1, primary_type: 1, _id: 0 } },
    );
    if (bySlug) return bySlug;
  }
  // 2) Subdomain-basiert.
  if (sub) {
    return col.findOne(
      { homepage_slug: sub.toLowerCase(), is_active: { $ne: false } },
      { projection: { name: 1, specialty_guess: 1, city: 1, primary_type: 1, _id: 0 } },
    );
  }
  return null;
}

function initials(name) {
  return String(name || '')
    .replace(/\b(dr\.?|prof\.?|dipl\.?|med|herr|frau|priv|doz|hc)\b\.?/gi, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('') || 'NA';
}

export async function GET(req) {
  const doctor = await findDoctor(req).catch(() => null);
  const name = doctor?.name || 'Navoria';
  const specialty = doctor?.specialty_guess || 'Ärztliche Praxis';
  const city = doctor?.city || '';
  const inits = initials(name);

  // Farbwelt: Navoria Emerald/Teal.
  const bg = 'linear-gradient(135deg,#065f46 0%,#0f766e 45%,#0891b2 100%)';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          background: bg, color: '#fff', padding: '80px', position: 'relative',
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        }}
      >
        {/* Deko-Kreise */}
        <div style={{ position: 'absolute', top: -180, right: -160, width: 520, height: 520, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: -220, left: -180, width: 600, height: 600, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex' }} />

        {/* Top row: Brand + Symbol */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 84, height: 84, borderRadius: '50%',
              background: 'rgba(255,255,255,0.18)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 40, fontWeight: 700, letterSpacing: -1,
            }}>{inits}</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>Navoria</span>
              <span style={{ fontSize: 18, opacity: 0.75 }}>Ärzteverzeichnis</span>
            </div>
          </div>
          {/* Medizinisches Symbol – neutrales weisses Kreuz */}
          <div style={{
            width: 120, height: 120, borderRadius: 28,
            background: 'rgba(255,255,255,0.14)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ position: 'relative', width: 60, height: 60, display: 'flex' }}>
              <div style={{ position: 'absolute', left: 24, top: 0, width: 12, height: 60, background: '#fff', borderRadius: 4, display: 'flex' }} />
              <div style={{ position: 'absolute', left: 0, top: 24, width: 60, height: 12, background: '#fff', borderRadius: 4, display: 'flex' }} />
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, display: 'flex' }} />

        {/* Name + Fachrichtung + Ort */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{
            fontSize: 76, fontWeight: 700, letterSpacing: -2,
            lineHeight: 1.05, maxWidth: 1000, display: 'flex',
          }}>{name}</div>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{
              fontSize: 32, padding: '8px 22px', borderRadius: 999,
              background: 'rgba(255,255,255,0.16)', display: 'flex',
            }}>{specialty}</div>
            {city && (
              <div style={{ fontSize: 32, opacity: 0.9, display: 'flex' }}>
                {city}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 900,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    },
  );
}
