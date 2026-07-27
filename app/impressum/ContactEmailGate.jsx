'use client';

import { useState } from 'react';
import { Mail, CheckCircle2, ShieldAlert, Copy, Check } from 'lucide-react';

// Email in Teilen — verhindert einfaches Auslesen durch Spam-Bots + wird erst nach Bestätigung angezeigt.
const EMAIL_LOCAL = 'mail';
const EMAIL_DOMAIN = 'navoria.de';

export default function ContactEmailGate() {
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  const email = `${EMAIL_LOCAL}@${EMAIL_DOMAIN}`;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* ignore */ }
  };

  if (!confirmed) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" style={{ color: 'var(--color-primary, #0F7ACA)' }} aria-hidden="true" />
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-slate-900">
              Bevor Sie uns eine E-Mail schreiben, bitte kurz bestätigen:
            </p>
            <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-slate-700">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 select-none" aria-hidden="true">✓</span>
                <span>Ich verstehe, dass <strong>Navoria ein Verzeichnis</strong> ist und <strong>nicht meine Arztpraxis</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 select-none" aria-hidden="true">✓</span>
                <span>Ich werde <strong>keine medizinischen Fragen, Symptome, Diagnosen, Befunde oder Rezept­wünsche</strong> senden.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 select-none" aria-hidden="true">✓</span>
                <span>Ich möchte Navoria wegen einer <strong>Verzeichnis-Frage</strong> kontaktieren (z.&nbsp;B. Korrektur zu Praxisdaten, Datenschutz, Löschantrag, Presse).</span>
              </li>
            </ul>
            <button
              type="button"
              onClick={() => setConfirmed(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition"
              style={{ background: 'var(--color-primary, #0F7ACA)' }}
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Ich habe verstanden — E-Mail-Adresse anzeigen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
      <div className="flex items-start gap-3">
        <Mail className="mt-0.5 h-5 w-5 shrink-0" style={{ color: '#047857' }} aria-hidden="true" />
        <div className="flex-1">
          <p className="text-[13px] font-medium text-emerald-800">Kontakt für Verzeichnis-Anfragen</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${email}?subject=${encodeURIComponent('Anfrage zum Navoria-Verzeichnis')}`}
              className="text-base font-semibold text-slate-900 hover:underline"
            >
              {email}
            </a>
            <button
              type="button"
              onClick={copyEmail}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              aria-label="E-Mail-Adresse kopieren"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" style={{ color: '#047857' }} aria-hidden="true" />
                  Kopiert
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  Kopieren
                </>
              )}
            </button>
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-emerald-700">
            Nachrichten mit Gesundheitsdaten löschen wir zum Schutz Ihrer Daten ungelesen (Art. 9 DSGVO).
            Bitte wenden Sie sich mit medizinischen Fragen ausschließlich an Ihre Praxis oder — außerhalb
            der Sprechzeiten — an <strong>116 117</strong> bzw. bei Notfällen an <strong>112</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
