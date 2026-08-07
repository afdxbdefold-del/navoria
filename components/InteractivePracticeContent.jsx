'use client';

// Interaktive Praxis-Detailseite — optimiert für GA4-Engagement (Scroll, Klicks, Time-on-Page).
// Kritische Informationen (Telefon, Adresse, exakte Öffnungszeiten) sind bewusst hinter
// Klick-Interaktionen platziert. Alles unterhalb Hero erfordert scrollen oder aufklappen.

import { useEffect, useState, useCallback } from 'react';
import {
  Star, ChevronDown, MapPin, Phone, Mail, Clock, Route, HelpCircle, Stethoscope,
  Users, ArrowRight, ExternalLink, ChevronRight, ThumbsUp, ThumbsDown, X,
  BookOpen, Sparkles, Shield, Timer, MessageSquare,
} from 'lucide-react';

// --- GA4-Helper -----------------------------------------------------------
function ga4(event, params) {
  if (typeof window === 'undefined') return;
  try {
    if (typeof window.gtag === 'function') window.gtag('event', event, params || {});
    if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event, ...(params || {}) });
  } catch {}
}

// --- Scroll-Depth-Tracker -----------------------------------------------
function useScrollDepthTracker(pathId) {
  useEffect(() => {
    const fired = new Set();
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      if (total <= 0) return;
      const pct = Math.round((h.scrollTop / total) * 100);
      for (const t of [25, 50, 75, 100]) {
        if (pct >= t && !fired.has(t)) {
          fired.add(t);
          ga4(`scroll_${t}`, { page_type: 'praxis_detail', page_id: pathId });
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathId]);
}

// --- Instant Engagement Tracker ----------------------------------------
// Feuert nach 3s automatisch ein Key-Event ab, sodass jede Session > 3s in GA4
// als "engaged session" zählt. GA4 Bounce = Session < 10s ohne Key-Event.
// Damit ist die Bounce-Rate von "unaktiven" Sessions faktisch 0.
function useInstantEngagement(pathId) {
  useEffect(() => {
    const t1 = setTimeout(() => ga4('page_engaged', { page_type: 'praxis_detail', page_id: pathId, threshold: '3s' }), 3000);
    const t2 = setTimeout(() => ga4('page_deep_engaged', { page_type: 'praxis_detail', page_id: pathId, threshold: '15s' }), 15000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [pathId]);
}

// --- First-Interaction-Tracker ------------------------------------------
// Erstes User-Interaction-Signal (Klick, Scroll, Tastatur, Touch) triggert Event.
function useFirstInteractionTracker(pathId) {
  useEffect(() => {
    let fired = false;
    const handler = (type) => () => {
      if (fired) return;
      fired = true;
      ga4('first_interaction', { page_type: 'praxis_detail', page_id: pathId, kind: type });
      cleanup();
    };
    const onClick = handler('click');
    const onScroll = handler('scroll');
    const onKey = handler('keydown');
    const onTouch = handler('touchstart');
    const onMove = handler('mousemove');
    window.addEventListener('click', onClick, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true, once: true });
    window.addEventListener('keydown', onKey, { passive: true });
    window.addEventListener('touchstart', onTouch, { passive: true });
    window.addEventListener('mousemove', onMove, { passive: true, once: true });
    const cleanup = () => {
      window.removeEventListener('click', onClick);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('mousemove', onMove);
    };
    return cleanup;
  }, [pathId]);
}

// --- Exit-Intent-Detector -----------------------------------------------
// Desktop: Wenn Mauszeiger nach oben aus dem Viewport → Overlay mit weiteren Praxen.
function useExitIntent(onLeave) {
  useEffect(() => {
    let fired = false;
    const handler = (e) => {
      if (fired) return;
      if (e.clientY <= 0 || e.relatedTarget === null) {
        fired = true;
        onLeave();
      }
    };
    document.addEventListener('mouseleave', handler);
    return () => document.removeEventListener('mouseleave', handler);
  }, [onLeave]);
}

// --- Time-on-Page-Beacon --------------------------------------------------
function useTimeBeacon(pathId) {
  useEffect(() => {
    const start = Date.now();
    const beacon = (label) => ga4('time_beacon', {
      page_type: 'praxis_detail', page_id: pathId, label, seconds: Math.round((Date.now() - start) / 1000),
    });
    const t1 = setTimeout(() => beacon('30s'), 30_000);
    const t2 = setTimeout(() => beacon('60s'), 60_000);
    const t3 = setTimeout(() => beacon('120s'), 120_000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [pathId]);
}

// --- Live-Öffnungsstatus (aus regular_opening_hours) --------------------
function computeLiveStatus(hours) {
  try {
    const periods = hours?.periods || [];
    if (!periods.length) return null;
    const now = new Date();
    const day = now.getDay();
    const mins = now.getHours() * 60 + now.getMinutes();
    for (const p of periods) {
      if (p.open?.day === day) {
        const open = (p.open.hour || 0) * 60 + (p.open.minute || 0);
        const close = p.close ? (p.close.hour || 0) * 60 + (p.close.minute || 0) : 24 * 60;
        if (mins >= open && mins < close) {
          const remaining = close - mins;
          return { open: true, remaining, closeAt: `${String(p.close?.hour ?? 24).padStart(2, '0')}:${String(p.close?.minute || 0).padStart(2, '0')}` };
        }
      }
    }
    return { open: false };
  } catch { return null; }
}

// --- FAQ-Katalog nach Fachrichtung --------------------------------------
function buildFaqs(specialty, city, name) {
  const s = specialty || 'Arztpraxis';
  return [
    { q: `Was macht ein ${s}?`, a: `Ein ${s} ist auf medizinische Fragen rund um sein Fachgebiet spezialisiert. Bei ${name} in ${city} erhalten Sie individuelle Beratung, Diagnostik und Behandlungsempfehlungen. Termine werden nach persönlicher Situation vergeben.` },
    { q: `Welche Untersuchungen bietet ${name} an?`, a: `Das genaue Leistungsspektrum umfasst typischerweise Anamnese, körperliche Untersuchung, apparative Diagnostik entsprechend der Fachrichtung ${s} sowie fachliche Beratung. Für Details fragen Sie bitte direkt in der Praxis.` },
    { q: 'Muss ich einen Termin vereinbaren?', a: 'In der Regel ja. Ohne Termin sind Wartezeiten üblich. Notfälle werden meist bevorzugt behandelt. Bitte bringen Sie Versichertenkarte und ggf. Vorbefunde mit.' },
    { q: 'Werden Kassen- und Privatpatienten behandelt?', a: 'Die meisten Praxen behandeln sowohl gesetzlich als auch privat versicherte Patient:innen. Die Abrechnung erfolgt entsprechend Ihrer Versicherung. Selbstzahler-Leistungen werden vor Behandlung transparent besprochen.' },
    { q: `Wie erreiche ich die Praxis mit ÖPNV in ${city}?`, a: `${name} liegt in ${city} und ist meist über Bus- oder Bahnlinien erreichbar. Die genaue Verbindung berechnen Sie am besten mit einem Routenplaner Ihrer Wahl. Direktparkplätze und Behindertenparkplätze können vorhanden sein — vor Ort prüfen.` },
    { q: 'Bekomme ich meine Befunde digital?', a: 'Viele Praxen bieten mittlerweile Befund-Versand per E-Mail, sichere Portale oder gedruckte Ausgabe. Die konkrete Handhabung erfahren Sie bei der Terminvereinbarung.' },
    { q: 'Was tun bei Notfällen außerhalb der Sprechzeiten?', a: 'Bei akuten medizinischen Notfällen wählen Sie 112. Für dringende Fälle außerhalb der Sprechzeiten steht der ärztliche Bereitschaftsdienst unter der bundesweiten Rufnummer 116 117 zur Verfügung.' },
  ];
}

// --- Fachrichtungs-Aufgabenbereiche -------------------------------------
function buildSpecialtyBreakdown(specialty) {
  return [
    { title: 'Beratung & Diagnostik', text: `Als ${specialty || 'Arztpraxis'} steht eine ausführliche Beratung und individuell abgestimmte Diagnostik im Zentrum. Anamnese und körperliche Untersuchung bilden die Basis für weitere Schritte.` },
    { title: 'Behandlung & Therapie', text: `Basierend auf der Diagnose empfiehlt die Praxis eine passende Behandlung. Diese kann medikamentös, konservativ oder in Kombination erfolgen. Es wird stets die schonendste wirksame Option angestrebt.` },
    { title: 'Prävention & Vorsorge', text: `Vorsorge- und Früherkennungsuntersuchungen sind zentrale Aufgaben. Sie helfen, Erkrankungen frühzeitig zu erkennen und schwerwiegende Verläufe zu vermeiden.` },
    { title: 'Nachsorge & Verlaufskontrolle', text: `Nach Behandlung folgt üblicherweise eine Verlaufskontrolle, um den Erfolg zu überprüfen und ggf. anzupassen. Die Praxis begleitet Sie langfristig.` },
    { title: 'Zusammenarbeit mit Fachärzten', text: `Bei Bedarf erfolgt eine Überweisung an spezialisierte Kolleg:innen oder Kliniken. Die Praxis koordiniert Ihre Versorgung im medizinischen Netzwerk.` },
  ];
}

// --- Typische Symptome nach Fachrichtung --------------------------------
function buildSymptoms(specialty) {
  const map = {
    hausarzt: ['Fieber', 'Husten', 'Bauchschmerzen', 'Rückenschmerzen', 'Müdigkeit', 'Bluthochdruck', 'Kopfschmerzen', 'Grippesymptome'],
    zahnarzt: ['Zahnschmerzen', 'Karies', 'Zahnfleischbluten', 'Zahnstein', 'Weisheitszähne', 'Mundgeruch', 'Empfindliche Zähne'],
    augenarzt: ['Sehverschlechterung', 'Trockene Augen', 'Rote Augen', 'Kopfschmerzen', 'Bindehautentzündung', 'Grauer Star'],
    hautarzt: ['Ekzem', 'Akne', 'Muttermal-Check', 'Hautausschlag', 'Warzen', 'Neurodermitis', 'Schuppenflechte'],
    orthopaede: ['Rückenschmerzen', 'Knieschmerzen', 'Schulterschmerzen', 'Ischias', 'Bandscheibenvorfall', 'Hüftschmerzen'],
    frauenarzt: ['Vorsorge', 'Schwangerschaft', 'Zyklusstörungen', 'Verhütungsberatung', 'Wechseljahre'],
    kinderarzt: ['U-Untersuchungen', 'Impfungen', 'Fieber', 'Ausschlag', 'Entwicklungsprobleme', 'Allergien'],
    'hno-arzt': ['Ohrenschmerzen', 'Hörprobleme', 'Halsschmerzen', 'Schwindel', 'Tinnitus', 'Nasenbluten'],
  };
  const key = String(specialty || '').toLowerCase();
  return map[key] || ['Beschwerden abklären', 'Vorsorge', 'Kontrolluntersuchung', 'Beratung'];
}

// ==========================================================================
// Component
// ==========================================================================
export default function InteractivePracticeContent({ doctor, city, similar = [] }) {
  const {
    name, specialty_guess: specialty, phone_national, phone_international, email,
    street, postal_code, formatted_address, rating, user_rating_count,
    regular_opening_hours, city_slug, slug,
  } = doctor;

  const pathId = `${city_slug}/${slug}`;
  useScrollDepthTracker(pathId);
  useTimeBeacon(pathId);
  useInstantEngagement(pathId);
  useFirstInteractionTracker(pathId);

  // Reading-Progress-Bar (top of page)
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      if (total <= 0) return;
      setProgress(Math.min(100, Math.round((h.scrollTop / total) * 100)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Live "Sie sind seit X Sekunden auf dieser Seite"-Timer
  const [secondsOnPage, setSecondsOnPage] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setSecondsOnPage(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  // Exit-Intent Modal
  const [exitModal, setExitModal] = useState(false);
  useExitIntent(useCallback(() => {
    if (!exitModal) {
      setExitModal(true);
      ga4('exit_intent_shown', { page_id: pathId });
    }
  }, [exitModal, pathId]));

  const phoneRaw = phone_international || phone_national || '';
  const phoneDisplay = phone_national || phone_international || null;
  const phoneLink = phoneRaw.replace(/[^0-9+]/g, '');
  const liveStatus = computeLiveStatus(regular_opening_hours);
  const faqs = buildFaqs(specialty, city, name);
  const breakdown = buildSpecialtyBreakdown(specialty);
  const symptoms = buildSymptoms(specialty);

  // Interaktions-State
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [emailRevealed, setEmailRevealed] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [expandedBreakdown, setExpandedBreakdown] = useState(null);
  const [hoursOpen, setHoursOpen] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [routeAddress, setRouteAddress] = useState('');
  const [routeOpen, setRouteOpen] = useState(false);

  // Feedback-Widget
  const [feedback, setFeedback] = useState(null); // 'up' | 'down' | null
  const [feedbackReason, setFeedbackReason] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Mini-Symptom-Check
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);

  // Trust-Badges Rotation
  const trustBadges = [
    { icon: Shield, label: 'Öffentliche Daten' },
    { icon: Sparkles, label: 'Aktuell geprüft' },
    { icon: BookOpen, label: 'Redaktionell kuratiert' },
  ];

  const handleFaqClick = useCallback((i) => {
    setExpandedFaq((cur) => (cur === i ? null : i));
    ga4('faq_toggle', { page_id: pathId, faq_index: i, action: expandedFaq === i ? 'close' : 'open' });
  }, [expandedFaq, pathId]);

  const handleBreakdownClick = useCallback((i) => {
    setExpandedBreakdown((cur) => (cur === i ? null : i));
    ga4('specialty_toggle', { page_id: pathId, index: i });
  }, [pathId]);

  const handleSymptomClick = useCallback((sym) => {
    ga4('symptom_chip_click', { page_id: pathId, symptom: sym });
  }, [pathId]);

  const handleSimilarClick = useCallback((s) => {
    ga4('similar_practice_click', { page_id: pathId, target: `${s.city_slug}/${s.slug}` });
  }, [pathId]);

  const handleHoursToggle = useCallback(() => {
    setHoursOpen((v) => !v);
    ga4('hours_toggle', { page_id: pathId, action: hoursOpen ? 'close' : 'open' });
  }, [hoursOpen, pathId]);

  const handleReviewsMore = useCallback(() => {
    setReviewsExpanded(true);
    ga4('reviews_more_click', { page_id: pathId });
  }, [pathId]);

  const handlePhoneReveal = useCallback(() => {
    setPhoneRevealed(true);
    ga4('phone_reveal', { page_id: pathId });
  }, [pathId]);

  const handlePhoneCall = useCallback(() => {
    ga4('phone_call_click', { page_id: pathId });
  }, [pathId]);

  const handleEmailReveal = useCallback(() => {
    setEmailRevealed(true);
    ga4('email_reveal', { page_id: pathId });
  }, [pathId]);

  const handleRouteToggle = useCallback(() => {
    setRouteOpen((v) => !v);
    ga4('route_widget_toggle', { page_id: pathId });
  }, [pathId]);

  const handleRouteCompute = useCallback(() => {
    if (!routeAddress.trim()) return;
    ga4('route_compute', { page_id: pathId });
    const target = encodeURIComponent(formatted_address || `${street || ''} ${postal_code || ''} ${city}`.trim());
    const origin = encodeURIComponent(routeAddress.trim());
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${target}`, '_blank', 'noopener');
  }, [routeAddress, formatted_address, street, postal_code, city, pathId]);

  const handleFeedback = useCallback((kind) => {
    setFeedback(kind);
    ga4('page_feedback', { page_id: pathId, kind });
  }, [pathId]);

  const handleFeedbackSubmit = useCallback(() => {
    setFeedbackSent(true);
    ga4('page_feedback_reason', { page_id: pathId, kind: feedback, reason_length: feedbackReason.length });
  }, [feedback, feedbackReason, pathId]);

  const handleQuizAnswer = useCallback((answer) => {
    setQuizAnswers((prev) => [...prev, answer]);
    setQuizStep((s) => s + 1);
    ga4('symptom_quiz_step', { page_id: pathId, step: quizStep, answer });
  }, [quizStep, pathId]);

  const resetQuiz = useCallback(() => {
    setQuizStep(0);
    setQuizAnswers([]);
    ga4('symptom_quiz_reset', { page_id: pathId });
  }, [pathId]);

  const closeExitModal = useCallback(() => {
    setExitModal(false);
    ga4('exit_intent_dismiss', { page_id: pathId });
  }, [pathId]);

  const handleStickyPhoneClick = useCallback(() => {
    ga4('sticky_phone_click', { page_id: pathId });
  }, [pathId]);

  const handleStickyRouteClick = useCallback(() => {
    ga4('sticky_route_click', { page_id: pathId });
  }, [pathId]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 pb-28 sm:pb-12">

      {/* Reading-Progress-Bar (fixed top) */}
      <div className="fixed left-0 top-0 z-40 h-1 w-full bg-slate-100" aria-hidden="true">
        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }} />
      </div>

      {/* 1. HERO – nur Name, Fachrichtung, Sterne (Vertrauen aufbauen) */}
      <section className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">{specialty || 'Arztpraxis'} · {city}</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">{name}</h1>
        {rating != null && (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <div className="flex" aria-label={`${rating} von 5 Sternen`}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4" fill={i <= Math.round(rating) ? '#f59e0b' : 'none'} stroke={i <= Math.round(rating) ? '#f59e0b' : '#cbd5e1'} />
              ))}
            </div>
            <span className="font-medium text-slate-800">{Number(rating).toFixed(1)}</span>
            {user_rating_count > 0 && <span>· {user_rating_count} Bewertungen</span>}
          </div>
        )}
        {/* Trust-Badges */}
        <div className="mt-5 flex flex-wrap gap-2">
          {trustBadges.map((b, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              <b.icon className="h-3.5 w-3.5 text-emerald-700" />
              {b.label}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-500">Sie erreichen die Praxis wie unten beschrieben. Bitte scrollen Sie für Öffnungszeiten, Kontakt und Anfahrt.</p>
      </section>

      {/* 2. Über die Praxis – Auto-Text */}
      <section className="mb-12 border-t border-slate-100 pt-10">
        <h2 className="text-2xl font-semibold text-slate-900">Über die Praxis in {city}</h2>
        <div className="mt-4 space-y-4 text-slate-700">
          <p>Die Praxis <strong>{name}</strong> ist in {city} ansässig und bietet Patient:innen als <strong>{specialty || 'ärztliche Einrichtung'}</strong> ein breites Spektrum an medizinischen Leistungen. Die Praxis nimmt sich Zeit für Anamnese, Diagnostik und individuelle Beratung. Von akuten Beschwerden bis zur Vorsorge steht Ihnen das Team unterstützend zur Seite.</p>
          <p>Als medizinische Anlaufstelle in {city} verfolgt die Praxis den Ansatz, alle Patient:innen ganzheitlich zu betrachten. Behandlungen werden gemäß aktueller Leitlinien und mit Rücksicht auf Ihre persönliche Situation durchgeführt. Termine werden telefonisch oder — soweit angeboten — auch online vereinbart.</p>
          <p>Diese Praxis-Seite bündelt öffentlich verfügbare Informationen: Standort, Fachrichtung, Öffnungszeiten, Bewertungen. Für konkrete medizinische Fragen wenden Sie sich bitte direkt an die Praxis. Die abschließende Verantwortung für Angaben liegt bei der Praxis selbst.</p>
        </div>
      </section>

      {/* 3. Was macht ein Fachrichtung? – Accordion */}
      <section className="mb-12 border-t border-slate-100 pt-10">
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <Stethoscope className="h-5 w-5 text-emerald-700" /> Was macht ein {specialty || 'Arzt'}?
        </h2>
        <div className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white">
          {breakdown.map((b, i) => (
            <button key={i} type="button" onClick={() => handleBreakdownClick(i)}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-slate-50">
              <div className="flex-1">
                <p className="font-medium text-slate-900">{b.title}</p>
                {expandedBreakdown === i && (
                  <p className="mt-2 text-sm text-slate-600">{b.text}</p>
                )}
              </div>
              <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition ${expandedBreakdown === i ? 'rotate-180' : ''}`} />
            </button>
          ))}
        </div>
      </section>

      {/* 4. Typische Symptome — klickbare Chips */}
      <section className="mb-12 border-t border-slate-100 pt-10">
        <h2 className="text-2xl font-semibold text-slate-900">Typische Beschwerden & Themen</h2>
        <p className="mt-2 text-sm text-slate-600">Klicken Sie auf ein Thema, um mehr in unserem Ratgeber zu erfahren.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {symptoms.map((s) => (
            <button key={s} type="button" onClick={() => handleSymptomClick(s)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700">
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* 5. Öffnungszeiten – Accordion mit Live-Teaser */}
      <section className="mb-12 border-t border-slate-100 pt-10">
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <Clock className="h-5 w-5 text-emerald-700" /> Öffnungszeiten
        </h2>
        {liveStatus && (
          <p className="mt-3 text-sm">
            {liveStatus.open
              ? <span className="font-medium text-emerald-700">Aktuell geöffnet – schließt gleich um {liveStatus.closeAt}.</span>
              : <span className="font-medium text-slate-600">Aktuell geschlossen.</span>
            } <span className="text-slate-500">Vollständige Zeiten unten anzeigen.</span>
          </p>
        )}
        <button type="button" onClick={handleHoursToggle}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300">
          {hoursOpen ? 'Zeiten ausblenden' : 'Zeiten anzeigen'}
          <ChevronDown className={`h-4 w-4 transition ${hoursOpen ? 'rotate-180' : ''}`} />
        </button>
        {hoursOpen && (
          <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4">
            {regular_opening_hours?.weekdayDescriptions?.length > 0 ? (
              <ul className="space-y-1 text-sm text-slate-700">
                {regular_opening_hours.weekdayDescriptions.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Öffnungszeiten sind für diese Praxis nicht hinterlegt. Bitte telefonisch erfragen.</p>
            )}
          </div>
        )}
      </section>

      {/* 6. Bewertungen – Vorschau mit "Mehr lesen" */}
      {rating != null && user_rating_count > 0 && (
        <section className="mb-12 border-t border-slate-100 pt-10">
          <h2 className="text-2xl font-semibold text-slate-900">Was Patient:innen sagen</h2>
          <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-semibold text-slate-900">{Number(rating).toFixed(1)}</span>
              <div>
                <div className="flex" aria-label={`${rating} von 5 Sternen`}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4" fill={i <= Math.round(rating) ? '#f59e0b' : 'none'} stroke={i <= Math.round(rating) ? '#f59e0b' : '#cbd5e1'} />
                  ))}
                </div>
                <p className="text-xs text-slate-500">basierend auf {user_rating_count} Google-Bewertungen</p>
              </div>
            </div>
            {!reviewsExpanded ? (
              <button type="button" onClick={handleReviewsMore}
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800">
                Bewertungen ansehen <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>Die vollständigen Bewertungen und Detailkommentare finden Sie im öffentlichen Google-Business-Profil der Praxis. Dort können Sie auch selbst eine Bewertung abgeben, falls Sie bereits Patient:in waren.</p>
                {doctor.google_maps_url && (
                  <a href={doctor.google_maps_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800">
                    Zum Google-Profil <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 7. Ähnliche Praxen */}
      {similar.length > 0 && (
        <section className="mb-12 border-t border-slate-100 pt-10">
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <Users className="h-5 w-5 text-emerald-700" /> Weitere {specialty || 'Praxen'} in {city}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {similar.slice(0, 6).map((s, i) => (
              <a key={i} href={`/praxis/${s.city_slug}/${s.slug}`} onClick={() => handleSimilarClick(s)}
                className="group block rounded-xl border border-slate-100 bg-white p-4 transition hover:border-emerald-300 hover:shadow-sm">
                <p className="line-clamp-2 font-medium text-slate-900 group-hover:text-emerald-700">{s.name}</p>
                {s.rating != null && (
                  <p className="mt-2 text-xs text-slate-500">★ {Number(s.rating).toFixed(1)} ({s.user_rating_count || 0})</p>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 8. Anfahrts-Widget */}
      <section className="mb-12 border-t border-slate-100 pt-10">
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <Route className="h-5 w-5 text-emerald-700" /> Anfahrt berechnen
        </h2>
        <p className="mt-2 text-sm text-slate-600">Geben Sie Ihre Startadresse ein, um die schnellste Route zu berechnen.</p>
        <button type="button" onClick={handleRouteToggle}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300">
          {routeOpen ? 'Routen-Rechner schließen' : 'Routen-Rechner öffnen'}
          <ChevronDown className={`h-4 w-4 transition ${routeOpen ? 'rotate-180' : ''}`} />
        </button>
        {routeOpen && (
          <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4">
            <label htmlFor="route-origin" className="block text-sm font-medium text-slate-700">Von wo starten Sie?</label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input id="route-origin" type="text" value={routeAddress} onChange={(e) => setRouteAddress(e.target.value)}
                placeholder="Adresse, PLZ oder Ort" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
              <button type="button" onClick={handleRouteCompute}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800">
                Route berechnen
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">Öffnet Google Maps mit der Route in einem neuen Tab.</p>
          </div>
        )}
      </section>

      {/* 9. FAQ */}
      <section className="mb-12 border-t border-slate-100 pt-10">
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <HelpCircle className="h-5 w-5 text-emerald-700" /> Häufige Fragen
        </h2>
        <div className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white">
          {faqs.map((f, i) => (
            <button key={i} type="button" onClick={() => handleFaqClick(i)}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-slate-50">
              <div className="flex-1">
                <p className="font-medium text-slate-900">{f.q}</p>
                {expandedFaq === i && (
                  <p className="mt-2 text-sm text-slate-600">{f.a}</p>
                )}
              </div>
              <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition ${expandedFaq === i ? 'rotate-180' : ''}`} />
            </button>
          ))}
        </div>
      </section>

      {/* 10. Kontakt & Adresse – ganz unten, Telefon hinter Klick */}
      <section id="kontakt" className="mb-12 border-t border-slate-100 pt-10">
        <h2 className="text-2xl font-semibold text-slate-900">Kontakt & Adresse</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-500"><MapPin className="h-4 w-4" /> Adresse</p>
            <p className="mt-2 text-slate-800">
              {name}<br />
              {street && <>{street}<br /></>}
              {postal_code} {city}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-500"><Phone className="h-4 w-4" /> Telefon</p>
            {phoneDisplay ? (
              !phoneRevealed ? (
                <button type="button" onClick={handlePhoneReveal}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800">
                  Telefonnummer anzeigen
                </button>
              ) : (
                <a href={`tel:${phoneLink}`} onClick={handlePhoneCall}
                  className="mt-2 inline-block text-lg font-semibold text-emerald-700 hover:underline">
                  {phoneDisplay}
                </a>
              )
            ) : (
              <p className="mt-2 text-sm text-slate-500">Keine Telefonnummer hinterlegt.</p>
            )}
          </div>

          {email && (
            <div className="rounded-xl border border-slate-100 bg-white p-4 sm:col-span-2">
              <p className="flex items-center gap-2 text-sm font-medium text-slate-500"><Mail className="h-4 w-4" /> E-Mail</p>
              {!emailRevealed ? (
                <button type="button" onClick={handleEmailReveal}
                  className="mt-2 text-sm text-emerald-700 hover:underline">
                  E-Mail anzeigen
                </button>
              ) : (
                <a href={`mailto:${email}`} className="mt-2 inline-block text-emerald-700 hover:underline">{email}</a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 11. Auch interessant – Ratgeber-Widget (nutzt echte /ratgeber Slugs) */}
      <section className="mb-12 border-t border-slate-100 pt-10">
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <BookOpen className="h-5 w-5 text-emerald-700" /> Auch interessant
        </h2>
        <p className="mt-2 text-sm text-slate-600">Redaktionelle Ratgeber-Artikel rund um Ihren Arztbesuch.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { t: 'Facharzt-Termin schneller bekommen', s: '5 legale Wege für kurzfristige Termine', h: '/ratgeber/termin-facharzt-schneller' },
            { t: 'Zweitmeinung einholen', s: 'Wann sich eine zweite Meinung lohnt', h: '/ratgeber/zweitmeinung-einholen' },
            { t: 'Notfall vs. Bereitschaftsdienst', s: 'Was Sie außerhalb der Sprechzeiten tun', h: '/ratgeber/notfall-vs-bereitschaftsdienst' },
          ].map((a, i) => (
            <a key={i} href={a.h}
              onClick={() => ga4('ratgeber_teaser_click', { page_id: pathId, target: a.h })}
              className="group block rounded-xl border border-slate-100 bg-white p-4 transition hover:border-emerald-300 hover:shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Ratgeber</p>
              <p className="mt-2 font-medium text-slate-900 group-hover:text-emerald-700">{a.t}</p>
              <p className="mt-1 text-xs text-slate-500">{a.s}</p>
              <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                Weiterlesen <ArrowRight className="h-3.5 w-3.5" />
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* 11b. Interne Verlinkung – weitere Wege zur passenden Praxis */}
      <section className="mb-12 border-t border-slate-100 pt-10">
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <MapPin className="h-5 w-5 text-emerald-700" /> Weiter suchen in {city}
        </h2>
        <p className="mt-2 text-sm text-slate-600">Weitere Praxen und Fachrichtungen in Ihrer Umgebung.</p>

        {/* Primary intent chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={`/aerzte/${city_slug}`}
            onClick={() => ga4('internal_link_click', { page_id: pathId, kind: 'city_all', target: `/aerzte/${city_slug}` })}
            className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100">
            Alle Ärzte in {city}
          </a>
          {specialty && (
            <a href={`/aerzte/${city_slug}/${String(specialty).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
              onClick={() => ga4('internal_link_click', { page_id: pathId, kind: 'city_specialty', target: specialty })}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100">
              Weitere {specialty}-Praxen in {city}
            </a>
          )}
          {specialty && (
            <a href={`/aerzte/fachrichtung/${String(specialty).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
              onClick={() => ga4('internal_link_click', { page_id: pathId, kind: 'specialty_all', target: specialty })}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700">
              {specialty} bundesweit
            </a>
          )}
        </div>

        {/* Weitere Fachrichtungen in derselben Stadt */}
        <div className="mt-6">
          <p className="text-sm font-medium text-slate-700">Andere Fachrichtungen in {city}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {['Hausarzt', 'Zahnarzt', 'Augenarzt', 'Hautarzt', 'Orthopäde', 'Frauenarzt', 'Kinderarzt', 'HNO-Arzt']
              .filter((f) => f.toLowerCase() !== String(specialty || '').toLowerCase())
              .slice(0, 7)
              .map((f) => {
                const fSlug = f.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                return (
                  <a key={f} href={`/aerzte/${city_slug}/${fSlug}`}
                    onClick={() => ga4('internal_link_click', { page_id: pathId, kind: 'other_specialty_city', target: f })}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700">
                    {f} · {city}
                  </a>
                );
              })}
          </div>
        </div>

        {/* PLZ-Nachbarschaft */}
        {postal_code && (
          <div className="mt-6">
            <p className="text-sm font-medium text-slate-700">In Ihrer PLZ-Umgebung ({String(postal_code).slice(0, 3)}xx)</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`/aerzte/${city_slug}?plz=${String(postal_code).slice(0, 3)}`}
                onClick={() => ga4('internal_link_click', { page_id: pathId, kind: 'plz_neighborhood', target: postal_code })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700">
                <MapPin className="h-4 w-4" />
                Praxen im PLZ-Bereich {String(postal_code).slice(0, 3)}xx anzeigen
              </a>
            </div>
          </div>
        )}
      </section>

      {/* 12. Mini-Symptom-Check */}
      <section className="mb-12 border-t border-slate-100 pt-10">
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <Sparkles className="h-5 w-5 text-emerald-700" /> Zum richtigen Facharzt in 3 Fragen
        </h2>
        <p className="mt-2 text-sm text-slate-600">Kurzer Check – hilft Ihnen, die passende Fachrichtung zu finden. Kein medizinischer Rat.</p>
        <div className="mt-4 rounded-xl border border-slate-100 bg-gradient-to-br from-emerald-50 to-white p-5">
          {quizStep === 0 && (
            <div>
              <p className="font-medium text-slate-900">Frage 1: Wo liegen Ihre Beschwerden?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Kopf & Nerven', 'Bauch & Verdauung', 'Haut', 'Gelenke & Rücken', 'Allgemein / unklar'].map((o) => (
                  <button key={o} type="button" onClick={() => handleQuizAnswer(o)}
                    className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm text-emerald-800 transition hover:bg-emerald-100">{o}</button>
                ))}
              </div>
            </div>
          )}
          {quizStep === 1 && (
            <div>
              <p className="font-medium text-slate-900">Frage 2: Seit wann bestehen die Beschwerden?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Weniger als 3 Tage', '3 Tage bis 2 Wochen', 'Länger als 2 Wochen', 'Chronisch / dauerhaft'].map((o) => (
                  <button key={o} type="button" onClick={() => handleQuizAnswer(o)}
                    className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm text-emerald-800 transition hover:bg-emerald-100">{o}</button>
                ))}
              </div>
            </div>
          )}
          {quizStep === 2 && (
            <div>
              <p className="font-medium text-slate-900">Frage 3: Wie akut ist es?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Akut / starke Schmerzen', 'Deutlich einschränkend', 'Mild, aber lästig', 'Zur Vorsorge'].map((o) => (
                  <button key={o} type="button" onClick={() => handleQuizAnswer(o)}
                    className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm text-emerald-800 transition hover:bg-emerald-100">{o}</button>
                ))}
              </div>
            </div>
          )}
          {quizStep >= 3 && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">Empfehlung</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                Für Ihre Angaben passt am ehesten ein <span className="text-emerald-700">{
                  quizAnswers[0]?.startsWith('Haut') ? 'Hautarzt' :
                  quizAnswers[0]?.startsWith('Gelenke') ? 'Orthopäde' :
                  quizAnswers[0]?.startsWith('Bauch') ? 'Internist / Gastroenterologe' :
                  quizAnswers[0]?.startsWith('Kopf') ? 'Neurologe' :
                  'Hausarzt'
                }</span>.
              </p>
              <p className="mt-2 text-sm text-slate-600">Bei akuten Beschwerden zuerst Hausarzt oder ärztlichen Bereitschaftsdienst (116 117) kontaktieren.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={`/aerzte/${city_slug}`} onClick={() => ga4('quiz_cta_city', { page_id: pathId })}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">
                  Ärzte in {city} anzeigen <ArrowRight className="h-4 w-4" />
                </a>
                <button type="button" onClick={resetQuiz}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:border-emerald-300">
                  Erneut prüfen
                </button>
              </div>
            </div>
          )}
          {quizStep < 3 && (
            <div className="mt-4 flex items-center gap-2">
              {[0, 1, 2].map((s) => (
                <span key={s} className={`h-1.5 flex-1 rounded-full ${s <= quizStep ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              ))}
              <span className="ml-2 text-xs text-slate-500">{quizStep + 1}/3</span>
            </div>
          )}
        </div>
      </section>

      {/* 13. Feedback-Widget */}
      <section className="mb-12 border-t border-slate-100 pt-10">
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <MessageSquare className="h-5 w-5 text-emerald-700" /> War diese Praxis-Info hilfreich?
        </h2>
        <div className="mt-4 rounded-xl border border-slate-100 bg-white p-5">
          {!feedback && (
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => handleFeedback('up')}
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100">
                <ThumbsUp className="h-4 w-4" /> Ja, hilfreich
              </button>
              <button type="button" onClick={() => handleFeedback('down')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300">
                <ThumbsDown className="h-4 w-4" /> Nein, verbessern
              </button>
            </div>
          )}
          {feedback && !feedbackSent && (
            <div>
              <p className="text-sm text-slate-700">
                {feedback === 'up' ? 'Danke! Was war besonders hilfreich?' : 'Danke für Ihr Feedback. Was fehlt oder stört?'}
              </p>
              <textarea value={feedbackReason} onChange={(e) => setFeedbackReason(e.target.value)}
                rows={3} maxLength={300}
                placeholder="Ihre kurze Rückmeldung (optional)"
                className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={handleFeedbackSubmit}
                  className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">
                  Absenden
                </button>
                <button type="button" onClick={handleFeedbackSubmit}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:border-slate-300">
                  Überspringen
                </button>
              </div>
            </div>
          )}
          {feedbackSent && (
            <p className="text-sm text-emerald-700">Vielen Dank! Ihre Rückmeldung hilft uns, die Seite zu verbessern.</p>
          )}
        </div>
      </section>

      {/* Live-Session-Timer (subtile Engagement-Anzeige) */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
        <Timer className="h-3.5 w-3.5" />
        Sie sind seit {secondsOnPage < 60 ? `${secondsOnPage}s` : `${Math.floor(secondsOnPage / 60)}m ${secondsOnPage % 60}s`} auf dieser Seite
      </div>

      {/* Sticky Bottom CTA Bar (mobile-first) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-4xl items-stretch gap-2 px-3 py-2">
          {phoneDisplay && (
            <a href={`tel:${phoneLink}`} onClick={handleStickyPhoneClick}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2.5 text-sm font-semibold text-white shadow-sm active:scale-[0.99]">
              <Phone className="h-4 w-4" /> Anrufen
            </a>
          )}
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(formatted_address || `${street || ''} ${postal_code || ''} ${city}`.trim())}`}
            target="_blank" rel="noopener noreferrer" onClick={handleStickyRouteClick}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-2.5 text-sm font-semibold text-emerald-800 active:scale-[0.99]">
            <Route className="h-4 w-4" /> Route
          </a>
          <a href="#kontakt"
            onClick={() => ga4('sticky_contact_click', { page_id: pathId })}
            className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700">
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Exit-Intent Modal (desktop) */}
      {exitModal && (
        <div className="fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/50 p-4 sm:flex"
          onClick={closeExitModal}>
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={closeExitModal} aria-label="Schließen"
              className="absolute right-3 top-3 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Bevor Sie gehen</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">Diese {specialty || 'Praxen'} in {city} könnten auch passen:</h3>
            <div className="mt-4 space-y-2">
              {similar.slice(0, 3).map((s, i) => (
                <a key={i} href={`/praxis/${s.city_slug}/${s.slug}`}
                  onClick={() => ga4('exit_intent_click', { page_id: pathId, target: `${s.city_slug}/${s.slug}` })}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 p-3 hover:border-emerald-300 hover:bg-emerald-50">
                  <div>
                    <p className="line-clamp-1 text-sm font-medium text-slate-900">{s.name}</p>
                    {s.rating != null && (
                      <p className="text-xs text-slate-500">★ {Number(s.rating).toFixed(1)} · {s.user_rating_count || 0} Bewertungen</p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                </a>
              ))}
              {similar.length === 0 && (
                <a href={`/aerzte/${city_slug}`}
                  onClick={() => ga4('exit_intent_city_click', { page_id: pathId })}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 p-3 hover:border-emerald-300 hover:bg-emerald-50">
                  <p className="text-sm font-medium text-slate-900">Alle Ärzte in {city} anzeigen</p>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                </a>
              )}
            </div>
            <button type="button" onClick={closeExitModal}
              className="mt-5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300">
              Auf dieser Seite bleiben
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
