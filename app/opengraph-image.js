import { ImageResponse } from 'next/og';

export const alt = 'Navoria – Ärzte in Deutschland finden';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const runtime = 'edge';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)',
          padding: '80px',
          position: 'relative',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Dekorative Kreise */}
        <div style={{ position: 'absolute', top: -160, right: -160, width: 480, height: 480, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: -120, left: -120, width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44,
          }}>🧭</div>
          <div style={{ display: 'flex', flexDirection: 'column', color: 'white' }}>
            <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>Navoria</div>
            <div style={{ fontSize: 20, opacity: 0.85, marginTop: 4 }}>Der klare Weg zum Arzt.</div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', gap: '20px' }}>
          <div style={{
            fontSize: 84, fontWeight: 700, color: 'white',
            lineHeight: 1.02, letterSpacing: '-0.03em',
            display: 'flex', flexDirection: 'column',
          }}>
            <span>Ihr nächster Arzt.</span>
            <span style={{ opacity: 0.9 }}>Ohne Umwege.</span>
          </div>

          <div style={{
            fontSize: 28, color: 'rgba(255,255,255,0.9)',
            display: 'flex', alignItems: 'center', gap: '14px',
            maxWidth: '95%',
          }}>
            <span>Adresse · Telefon · Öffnungszeiten · Bewertungen</span>
          </div>
        </div>

        {/* Signatur */}
        <div style={{
          position: 'absolute', bottom: 40, right: 60,
          display: 'flex', alignItems: 'center', gap: '10px',
          fontSize: 22, color: 'rgba(255,255,255,0.8)',
        }}>
          <span>navoria.de</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
