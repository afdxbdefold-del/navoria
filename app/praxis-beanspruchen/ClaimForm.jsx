'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export default function ClaimForm({ doctor }) {
  const [state, setState] = useState('idle'); // idle | submitting | success | error
  const [errMsg, setErrMsg] = useState('');
  const [form, setForm] = useState({
    doctor_name: doctor?.name || '',
    doctor_city: doctor?.city || '',
    role: 'inhaber',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: '',
    website: '',
    message: '',
    agree: false,
  });

  function upd(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setErrMsg('');
    if (!form.agree) {
      setErrMsg('Bitte bestätigen Sie die Verarbeitung Ihrer Daten.');
      return;
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrMsg('Bitte geben Sie eine gültige E-Mail-Adresse an.');
      return;
    }
    if (!form.first_name || !form.last_name) {
      setErrMsg('Bitte geben Sie Ihren Vor- und Nachnamen an.');
      return;
    }
    if (!form.doctor_name && !doctor?.id) {
      setErrMsg('Bitte geben Sie den Praxisnamen an.');
      return;
    }

    setState('submitting');
    try {
      const res = await fetch('/api/claim-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, doctor_id: doctor?.id || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState('error');
        setErrMsg(data?.error || 'Fehler beim Absenden. Bitte später erneut versuchen.');
        return;
      }
      setState('success');
    } catch (err) {
      setState('error');
      setErrMsg(String(err.message || err));
    }
  }

  if (state === 'success') {
    return (
      <section className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
          <div>
            <h2 className="text-lg font-semibold text-emerald-900">Vielen Dank – Ihre Anfrage ist bei uns eingegangen.</h2>
            <p className="mt-2 text-sm leading-relaxed text-emerald-900/90">
              Wir prüfen Ihre Angaben und melden uns innerhalb von 5 Werktagen unter <strong>{form.email}</strong>.
              Bei Fragen erreichen Sie uns unter <a href="mailto:mail@navoria.de" className="underline">mail@navoria.de</a>.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const label = 'block text-sm font-medium text-slate-800';
  const input = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100';
  const req = <span className="text-red-500" aria-hidden="true"> *</span>;

  return (
    <form onSubmit={submit} className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-semibold text-slate-900">Kontaktformular</h2>
      <p className="mt-1 text-sm text-slate-600">Alle mit <span className="text-red-500">*</span> markierten Felder sind erforderlich.</p>

      <fieldset className="mt-6 grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">Praxis</legend>
        <div>
          <label htmlFor="doctor_name" className={label}>Praxisname{req}</label>
          <input id="doctor_name" type="text" value={form.doctor_name} onChange={(e) => upd('doctor_name', e.target.value)} className={input} required maxLength={200} />
        </div>
        <div>
          <label htmlFor="doctor_city" className={label}>Stadt</label>
          <input id="doctor_city" type="text" value={form.doctor_city} onChange={(e) => upd('doctor_city', e.target.value)} className={input} maxLength={100} />
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className={label}>Ihre Rolle in der Praxis{req}</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {[
            { v: 'inhaber', l: 'Inhaber:in / Arzt / Ärztin' },
            { v: 'praxismanager', l: 'Praxis-Management' },
            { v: 'sonstige', l: 'Andere autorisierte Person' },
          ].map((o) => (
            <label key={o.v} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm ${form.role === o.v ? 'border-sky-500 bg-sky-50 text-sky-900' : 'border-slate-200 bg-white text-slate-700'}`}>
              <input type="radio" name="role" value={o.v} checked={form.role === o.v} onChange={(e) => upd('role', e.target.value)} className="text-sky-600 focus:ring-sky-500" />
              <span>{o.l}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6 grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">Kontaktdaten</legend>
        <div>
          <label htmlFor="first_name" className={label}>Vorname{req}</label>
          <input id="first_name" type="text" value={form.first_name} onChange={(e) => upd('first_name', e.target.value)} className={input} required maxLength={80} autoComplete="given-name" />
        </div>
        <div>
          <label htmlFor="last_name" className={label}>Nachname{req}</label>
          <input id="last_name" type="text" value={form.last_name} onChange={(e) => upd('last_name', e.target.value)} className={input} required maxLength={80} autoComplete="family-name" />
        </div>
        <div>
          <label htmlFor="email" className={label}>E-Mail{req}</label>
          <input id="email" type="email" value={form.email} onChange={(e) => upd('email', e.target.value)} className={input} required maxLength={160} autoComplete="email" />
          <p className="mt-1 text-[11px] text-slate-500">Bevorzugt eine E-Mail-Adresse Ihrer Praxis-Domain – erleichtert die Verifizierung.</p>
        </div>
        <div>
          <label htmlFor="phone" className={label}>Telefon (optional)</label>
          <input id="phone" type="tel" value={form.phone} onChange={(e) => upd('phone', e.target.value)} className={input} maxLength={40} autoComplete="tel" />
        </div>
        <div>
          <label htmlFor="website" className={label}>Website der Praxis (optional)</label>
          <input id="website" type="url" value={form.website} onChange={(e) => upd('website', e.target.value)} className={input} maxLength={200} autoComplete="url" placeholder="https://" />
        </div>
        <div>
          <label htmlFor="company_name" className={label}>Rechtsträger (optional)</label>
          <input id="company_name" type="text" value={form.company_name} onChange={(e) => upd('company_name', e.target.value)} className={input} maxLength={160} autoComplete="organization" placeholder="z.B. Dr. Müller MVZ GmbH" />
        </div>
      </fieldset>

      <div className="mt-6">
        <label htmlFor="message" className={label}>Nachricht (optional)</label>
        <textarea
          id="message"
          value={form.message}
          onChange={(e) => upd('message', e.target.value)}
          rows={5}
          maxLength={1500}
          className={input}
          placeholder="Angaben zu Korrekturen, Zusatzinfos (Sprachen, Kassen/Privat, Schwerpunkte) oder Fragen zur Verifizierung."
        />
        <p className="mt-1 text-[11px] text-slate-500">{form.message.length}/1500 Zeichen</p>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input type="checkbox" checked={form.agree} onChange={(e) => upd('agree', e.target.checked)} className="mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
          <span>
            Ich bin autorisiert, dieses Praxisprofil zu beanspruchen. Ich willige ein, dass meine Angaben zur Verifizierung
            gespeichert und verarbeitet werden (Art. 6 Abs. 1 lit. b DSGVO). Details in der{' '}
            <a href="/datenschutz" className="text-sky-700 underline underline-offset-2 hover:text-sky-800">Datenschutzerklärung</a>.
          </span>
        </label>
      </div>

      {errMsg && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
          <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errMsg}</span>
        </div>
      )}

      <div className="mt-6">
        <button
          type="submit"
          disabled={state === 'submitting'}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-60"
        >
          {state === 'submitting' && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
          {state === 'submitting' ? 'Wird gesendet…' : 'Anfrage absenden'}
        </button>
      </div>
    </form>
  );
}
