import { ImageResponse } from 'next/og';
import { getCollection } from '@/lib/mongodb';

export const alt = 'Navoria – Praxis-Profil';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Runtime nodejs damit wir MongoDB nutzen können
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Emoji/Symbol pro Fachrichtung (unicode - kein externes Asset nötig)
const ICONS = {
  'Hausarzt': '🩺',
  'Zahnarzt': '🦷',
  'Kardiologe': '❤️',
  'Orthopäde': '🦴',
  'Hautarzt': '✨',
  'Frauenarzt': '🌸',
  'Kinderarzt': '👶',
  'Augenarzt': '👁️',
  'HNO-Arzt': '👂',
  'Urologe': '💧',
  'Neurologe': '🧠',
  'Psychiater': '🧠',
  'Psychotherapeut': '💬',
  'Radiologe': '🩻',
  'Internist': '⚕️',
  'Chirurg': '🔬',
  'Physiotherapeut': '🏃',
  'Apotheke': '💊',
  'Krankenhaus': '🏥',
  'Arzt': '⚕️',
};

export default async function Image({ params }) {
  const { slug } = await params;
  let doctor = null;
  try {
    const col = await getCollection('doctor_places');
    doctor = await col.findOne({ slug });
  } catch {}

  const name = doctor?.name || 'Praxis';
  const specialty = doctor?.specialty_guess || 'Praxis';
  const city = doctor?.city || '';
  const address = doctor?.formatted_address || '';
  const icon = ICONS[specialty] || '⚕️';

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
        {/* Dekorative Kreise im Hintergrund */}
        <div style={{ position: 'absolute', top: -160, right: -160, width: 480, height: 480, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: -120, left: -120, width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex' }} />

        {/* Logo-Zeile oben */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, background: 'rgba(255,255,255,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40,
          }}>🧭</div>
          <div style={{ display: 'flex', flexDirection: 'column', color: 'white' }}>
            <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>Navoria</div>
            <div style={{ fontSize: 18, opacity: 0.8, marginTop: 4 }}>Der klare Weg zum Arzt.</div>
          </div>
        </div>

        {/* Hauptinhalt: Fachrichtungs-Icon + Name + Adresse */}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', gap: '24px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '20px',
            background: 'rgba(255,255,255,0.16)',
            borderRadius: 999, padding: '12px 28px 12px 20px',
            alignSelf: 'flex-start', color: 'white',
          }}>
            <span style={{ fontSize: 42, lineHeight: 1 }}>{icon}</span>
            <span style={{ fontSize: 28, fontWeight: 600 }}>{specialty}</span>
          </div>

          <div style={{
            fontSize: 66, fontWeight: 700, color: 'white',
            lineHeight: 1.05, letterSpacing: '-0.02em',
            maxWidth: '95%',
            display: 'flex',
          }}>
            {name.length > 60 ? name.slice(0, 57) + '…' : name}
          </div>

          {address && (
            <div style={{
              fontSize: 30, color: 'rgba(255,255,255,0.9)',
              display: 'flex', alignItems: 'center', gap: '12px',
              maxWidth: '95%',
            }}>
              <span style={{ fontSize: 26 }}>📍</span>
              <span>{address.length > 80 ? address.slice(0, 77) + '…' : address}</span>
            </div>
          )}
        </div>

        {/* Untere Signatur-Zeile */}
        <div style={{
          position: 'absolute', bottom: 40, right: 60,
          display: 'flex', alignItems: 'center', gap: '10px',
          fontSize: 20, color: 'rgba(255,255,255,0.75)',
        }}>
          <span>navoria.de{city ? ` · ${city}` : ''}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
