'use client';
import { useState } from 'react';
import { AlertTriangle, X, Send, CheckCircle2, Loader2 } from 'lucide-react';

const FIELD_OPTIONS = [
  { v: 'phone', l: 'Telefonnummer' },
  { v: 'address', l: 'Adresse / Anschrift' },
  { v: 'opening_hours', l: 'Öffnungszeiten' },
  { v: 'website', l: 'Website' },
  { v: 'specialty', l: 'Fachrichtung' },
  { v: 'name', l: 'Praxisname' },
  { v: 'closed', l: 'Praxis existiert nicht mehr / ist umgezogen' },
  { v: 'duplicate', l: 'Doppelter Eintrag' },
  { v: 'other', l: 'Sonstiges' },
];

export default function CorrectionButton({ doctorId, doctorName }) {
  const [open, setOpen] = useState(false);
  const [field, setField] = useState('phone');
  const [correctValue, setCorrectValue] = useState('');
  const [note, setNote] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!correctValue.trim() && field !== 'closed' && field !== 'duplicate') {
      setError('Bitte tragen Sie den korrekten Wert oder eine kurze Beschreibung ein.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const r = await fetch('/api/correction-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_id: doctorId, field, correct_value: correctValue, note, email }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || 'Fehler beim Senden');
      setDone(true);
    } catch (err) {
      setError(String(err.message || err));
    }
    setBusy(false);
  };

  const close = () => {
    setOpen(false);
    setTimeout(() => {
      setField('phone'); setCorrectValue(''); setNote(''); setEmail(''); setDone(false); setError(null);
    }, 200);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-800 transition"
      >
        <AlertTriangle className="h-3.5 w-3.5" /> Fehler melden
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center" onClick={close}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-7" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Fehler in diesem Eintrag melden</h3>
                <p className="mt-0.5 text-sm text-slate-500 line-clamp-1">Betrifft: {doctorName}</p>
              </div>
              <button type="button" onClick={close} className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>

            {done ? (
              <div className="mt-6 flex flex-col items-center py-6 text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                <p className="mt-3 text-base font-semibold text-slate-900">Danke für Ihre Meldung.</p>
                <p className="mt-1 max-w-xs text-sm text-slate-500">
                  Die Meldung wird werktags in der Regel innerhalb von zwei Arbeitstagen geprüft.
                  {email ? ' Sie erhält eine Rückmeldung an die angegebene E-Mail-Adresse.' : ''}
                </p>
                <button onClick={close} className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Schließen</button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Worum geht es?</label>
                  <select value={field} onChange={(e) => setField(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100">
                    {FIELD_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                </div>

                {field !== 'closed' && field !== 'duplicate' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700">Korrekter Wert</label>
                    <input
                      type="text"
                      value={correctValue}
                      onChange={(e) => setCorrectValue(e.target.value)}
                      placeholder={field === 'phone' ? 'z.B. 030 1234567' : field === 'opening_hours' ? 'z.B. Mo–Fr 08–17 Uhr' : 'Bitte korrekten Wert eintragen'}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                      autoFocus
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700">Anmerkung <span className="text-slate-500">(optional)</span></label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    maxLength={500}
                    placeholder="Woher wissen Sie das? (Praxis-Website, eigener Besuch, ...)"
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">Ihre E-Mail <span className="text-slate-500">(optional, nur für Rückmeldung)</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@beispiel.de"
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}

                <p className="text-xs leading-relaxed text-slate-500">
                  Mit dem Absenden erklären Sie sich einverstanden, dass Ihre Angaben zur Prüfung gespeichert werden. Weitere Informationen unter <a href="/korrekturen" className="text-sky-700 hover:underline">Korrekturen</a> und <a href="/datenschutz" className="text-sky-700 hover:underline">Datenschutz</a>.
                </p>

                <div className="flex justify-end gap-2">
                  <button type="button" onClick={close} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Abbrechen</button>
                  <button disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-60">
                    {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Wird gesendet...</> : <><Send className="h-4 w-4" /> Meldung senden</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
