// Interne Logo-Vorschläge-Seite. Nicht indexiert, nicht in der Navigation verlinkt.
// Nach der Entscheidung wieder löschen und ausgewähltes SVG in NavShell.jsx übernehmen.

export const metadata = {
  title: 'Logo-Vorschläge (intern)',
  robots: { index: false, follow: false, nocache: true },
};

/* ---------- 6 Logo-Konzepte als reine SVGs
   Konvention: color = Hauptfläche/Silhouette · bg = Detail-/Ausschnittsfarbe
   Für „Weiß auf Navy" wird color=#fff und bg=navy übergeben, damit Details lesbar bleiben.
--------------------------------------------------------------------------- */

// A: Heart + Plus
function LogoA({ size = 40, color = '#0875C9', bg = '#ffffff' }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <path
        d="M20 34.5C10 27 4.5 21 4.5 14.8 4.5 10 8 6.5 12.5 6.5c2.6 0 5.1 1.4 6.6 3.5l.9 1.3.9-1.3c1.5-2.1 4-3.5 6.6-3.5C31.9 6.5 35.5 10 35.5 14.8c0 6.2-5.5 12.2-15.5 19.7z"
        fill={color}
      />
      <rect x="17.6" y="13.5" width="4.8" height="10" rx="1" fill={bg} />
      <rect x="15" y="16.1" width="10" height="4.8" rx="1" fill={bg} />
    </svg>
  );
}

// B: N-Kompass
function LogoB({ size = 40, color = '#0875C9', bg = '#ffffff' }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <circle cx="20" cy="20" r="16.5" fill={color} />
      <path d="M20 6 L23.5 20 L20 34 L16.5 20 Z" fill={bg} />
      <path d="M6 20 L20 16.5 L34 20 L20 23.5 Z" fill={bg} opacity="0.55" />
      <circle cx="20" cy="20" r="2" fill={color} />
    </svg>
  );
}

// C: N-Pulse
function LogoC({ size = 40, color = '#0875C9', bg = '#ffffff' }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <rect x="2" y="2" width="36" height="36" rx="9" fill={color} />
      <path
        d="M9 25 L9 15 M9 25 L9 21 L14 21 L16 15 L20 27 L23 19 L26 21 L31 21 L31 15 M31 25 L31 21"
        stroke={bg}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// D: N-Schild
function LogoD({ size = 40, color = '#0875C9', bg = '#ffffff' }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <path
        d="M20 3 L34 8 V21 C34 28.5 27.5 34 20 37 C12.5 34 6 28.5 6 21 V8 Z"
        fill={color}
      />
      <path
        d="M13 26 V14 L20 24 V14 M20 14 V26 M27 14 V26"
        stroke={bg}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// E: N — vollständiges N in abgerundeter Kachel (ohne Punkt)
function LogoE({ size = 40, color = '#0875C9', bg = '#ffffff' }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <rect x="2" y="2" width="36" height="36" rx="12" fill={color} />
      {/* Vollständiges N: linke Säule aufwärts, Diagonale abwärts, rechte Säule aufwärts */}
      <path
        d="M12 29 V11 L28 29 V11"
        stroke={bg}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// F: N-Cross
function LogoF({ size = 40, color = '#0875C9', bg = '#ffffff' }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <rect x="2" y="2" width="36" height="36" rx="9" fill={color} />
      <rect x="9" y="10" width="4" height="20" rx="1.5" fill={bg} />
      <rect x="27" y="10" width="4" height="20" rx="1.5" fill={bg} />
      <path d="M11 12 L29 28" stroke={bg} strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      <rect x="18" y="14" width="4" height="12" rx="1" fill={bg} />
      <rect x="14" y="18" width="12" height="4" rx="1" fill={bg} />
    </svg>
  );
}

const NAVY = '#073B5C';
const PRIMARY = '#0875C9';

const CONCEPTS = [
  { key: 'A', Comp: LogoA, name: 'Heart + Plus', tag: 'Klassisch, medizinisch, warm',        note: 'Verfeinerte Version des aktuellen Icons. Vertraut, herzlich, unmittelbar als „Gesundheit" lesbar.' },
  { key: 'B', Comp: LogoB, name: 'N-Kompass',    tag: 'Navigation, Orientierung',             note: 'Spielt auf den „Nav"-Wortstamm in Navoria. Wir helfen Menschen, sich im Gesundheitssystem zu orientieren.' },
  { key: 'C', Comp: LogoC, name: 'N-Pulse',      tag: 'Editorial, EKG, modern',               note: 'Das N wird durch eine EKG-Kurve gezeichnet. Passt zur Magazin-Positionierung.' },
  { key: 'D', Comp: LogoD, name: 'N-Schild',     tag: 'Vertrauen, Schutz, Autorität',         note: 'Schildform signalisiert Verlässlichkeit. N-Buchstabe im Inneren.' },
  { key: 'E', Comp: LogoE, name: 'Nur N',        tag: 'Minimal, geometrisch, ruhig',           note: 'Klares, vollständiges N in einer abgerundeten Kachel. Reduzierte, moderne Marken-Anmutung ohne Zusatzdekoration.' },
  { key: 'F', Comp: LogoF, name: 'N-Cross',      tag: 'Medizinisch + geometrisch',            note: 'N-Säulen umrahmen ein klassisches medizinisches Plus. Klar als Gesundheits-Marke erkennbar.' },
];

/* ---------- Bausteine ---------- */

function ConceptCard({ item }) {
  const { key, Comp, name, tag, note } = item;
  return (
    <section className="rounded-2xl bg-white p-6 sm:p-8" style={{ border: '1px solid var(--color-border)' }}>
      <div className="flex flex-wrap items-baseline gap-3">
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
          style={{ background: 'var(--color-primary-light)', color: 'var(--color-navy)' }}
        >
          {key}
        </span>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-navy)' }}>{name}</h2>
        <span className="text-sm nv-text-muted">— {tag}</span>
      </div>
      <p className="mt-3 max-w-2xl text-[15px] nv-text-muted">{note}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Primary auf Soft-Blue Kontext */}
        <div className="flex flex-col items-center gap-3 rounded-xl p-6" style={{ background: 'var(--color-primary-soft)' }}>
          <Comp size={72} color={PRIMARY} bg="#EFF8FE" />
          <span className="text-xs font-medium nv-text-muted">Primary auf Soft</span>
        </div>
        {/* Weiß auf Navy — Details in Navy sichtbar */}
        <div className="flex flex-col items-center gap-3 rounded-xl p-6" style={{ background: NAVY }}>
          <Comp size={72} color="#ffffff" bg={NAVY} />
          <span className="text-xs font-medium" style={{ color: 'var(--color-primary-light)' }}>Weiß auf Navy</span>
        </div>
        {/* Wordmark hell */}
        <div className="flex items-center gap-3 rounded-xl p-6" style={{ background: '#ffffff', border: '1px solid var(--color-border)' }}>
          <Comp size={40} color={PRIMARY} bg="#ffffff" />
          <div className="leading-tight">
            <div className="text-xl font-semibold tracking-tight" style={{ color: NAVY }}>Navoria</div>
            <div className="text-[11px] font-medium nv-text-muted">Gesundheit verständlich.</div>
          </div>
        </div>
        {/* Wordmark auf Navy (wie Live-Header) */}
        <div className="flex items-center gap-3 rounded-xl p-6" style={{ background: NAVY }}>
          <Comp size={40} color="#ffffff" bg={NAVY} />
          <div className="leading-tight">
            <div className="text-xl font-semibold tracking-tight text-white">Navoria</div>
            <div className="text-[11px] font-medium" style={{ color: 'var(--color-primary-light)' }}>Gesundheit verständlich.</div>
          </div>
        </div>
      </div>

      {/* Größen-Skala */}
      <div className="mt-6 flex flex-wrap items-end gap-6 rounded-xl p-5" style={{ background: '#ffffff', border: '1px solid var(--color-border)' }}>
        {[16, 24, 32, 48, 96].map((s) => (
          <div key={s} className="flex flex-col items-center gap-1">
            <Comp size={s} color={NAVY} bg="#ffffff" />
            <span className="text-[10px] nv-text-muted">{s}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Seite ---------- */

export default function LogoVorschlaegePage() {
  return (
    <div className="nv-page-bg">
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>Intern · nicht indexiert</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight" style={{ color: 'var(--color-navy)' }}>
          Logo-Vorschläge für Navoria
        </h1>
        <p className="mt-3 max-w-2xl nv-text-muted">
          Sechs Konzepte in fünf Größen (16–96&nbsp;px) und vier Kontexten (Primary/Soft, Weiß/Navy, Wordmark hell, Wordmark auf Navy — wie im Live-Header).
          Alle Vorschläge sind reine SVGs, funktionieren also verlustfrei bei jeder Auflösung.
        </p>
        <p className="mt-2 max-w-2xl nv-text-muted">
          Sag mir <strong>&bdquo;nimm A&ldquo;</strong> (oder B, C, D, E, F), dann übertrage ich das Icon in{' '}
          <code className="rounded px-1" style={{ background: 'var(--color-primary-soft)' }}>NavShell.jsx</code>{' '}
          und ersetze das aktuelle Header/Footer/Announcement-Logo überall.
        </p>

        <div className="mt-12 space-y-8">
          {CONCEPTS.map((c) => (
            <ConceptCard key={c.key} item={c} />
          ))}
        </div>

        <div className="mt-12 rounded-2xl p-6 sm:p-8" style={{ background: 'var(--color-primary-light)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-navy)' }}>Welches Konzept passt zu welcher Positionierung?</h2>
          <ul className="mt-4 space-y-2 text-[15px]" style={{ color: 'var(--color-navy)' }}>
            <li><strong>A · Heart + Plus:</strong> wenn das Praxisverzeichnis der stärkere Anker sein soll.</li>
            <li><strong>B · N-Kompass:</strong> wenn die Positionierung &bdquo;wir helfen navigieren&ldquo; priorisiert wird.</li>
            <li><strong>C · N-Pulse:</strong> wenn die redaktionelle Magazin-Identität dominieren soll.</li>
            <li><strong>D · N-Schild:</strong> wenn Vertrauen und Autorität im Vordergrund stehen.</li>
            <li><strong>E · Nur N:</strong> minimal, ruhig, ohne Dekoration — funktioniert von Favicon bis Print.</li>
            <li><strong>F · N-Cross:</strong> wenn das medizinische Signal (Kreuz) sofort erkennbar sein muss.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
