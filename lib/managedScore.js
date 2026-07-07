// Managed-Score: Heuristik, um zu schätzen, ob eine Google-Places-Praxis
// aktiv von der Praxis verwaltet wird (Google Business Profile beansprucht) oder
// nur automatisch von Google gelistet.
//
// Website ist bewusst KEIN Faktor – die Heuristik wird auf Praxen ohne Website
// angewendet, dort ist Website irrelevant.
//
// Signale (max 100 Punkte):
//   30  Öffnungszeiten mit >=5 Wochentagen UND mindestens 1 Tag mit >=2 Slots
//   25  user_rating_count >= 100 (bzw. 15 pts ab 20)
//   20  Business-Attribute gepflegt (accessibility / parking / payment)
//   15  primary_type spezifisch (doctor, dentist etc. – nicht point_of_interest)
//   10  types-Array enthält >=2 gesundheitsspezifische Kategorien
//
// Ergebnis-Bucket:
//    0–24  unmanaged     (nur Google-Listing, kein Owner-Signal)
//   25–54  unclear       (Handprüfung sinnvoll)
//   55–100 likely_managed (starkes Owner-Signal)

const HEALTH_TYPES = new Set([
  'doctor', 'dentist', 'hospital', 'physiotherapist', 'pharmacy',
  'medical_lab', 'health', 'chiropractor', 'psychologist', 'veterinary_care',
]);

const GENERIC_TYPES = new Set([
  'point_of_interest', 'establishment',
]);

/**
 * Berechnet den Managed-Score für eine Praxis.
 * @param {object} doc doctor_places Dokument
 * @returns {{score:number, likelihood:string, signals:string[]}}
 */
export function computeManagedScore(doc) {
  if (!doc) return { score: 0, likelihood: 'unmanaged', signals: [] };
  let score = 0;
  const signals = [];

  // 1) Öffnungszeiten – detailliert = starkes Signal
  const hours = doc.regular_opening_hours || doc.opening_hours_json || doc.current_opening_hours || doc.opening_hours;
  const periods = Array.isArray(hours?.periods) ? hours.periods : [];
  if (periods.length > 0) {
    const dayGroups = new Map();
    for (const p of periods) {
      const day = p?.open?.day;
      if (day === undefined || day === null) continue;
      dayGroups.set(day, (dayGroups.get(day) || 0) + 1);
    }
    const uniqueDays = dayGroups.size;
    const hasMultiSlotDay = Array.from(dayGroups.values()).some((n) => n >= 2);
    if (uniqueDays >= 5 && hasMultiSlotDay) {
      score += 30;
      signals.push('detaillierte_oeffnungszeiten');
    } else if (uniqueDays >= 5) {
      score += 15;
      signals.push('vollstaendige_oeffnungszeiten');
    } else if (uniqueDays > 0) {
      score += 5;
      signals.push('teil_oeffnungszeiten');
    }
  }

  // 2) Bewertungsanzahl
  const reviewCount = Number(doc.user_rating_count || 0);
  if (reviewCount >= 100) {
    score += 25;
    signals.push('viele_bewertungen_100plus');
  } else if (reviewCount >= 20) {
    score += 15;
    signals.push('viele_bewertungen_20plus');
  }

  // 3) Business-Attribute
  let attributeCount = 0;
  if (doc.accessibility_options && typeof doc.accessibility_options === 'object' && Object.keys(doc.accessibility_options).length > 0) attributeCount++;
  if (doc.parking_options && typeof doc.parking_options === 'object' && Object.keys(doc.parking_options).length > 0) attributeCount++;
  if (doc.payment_options && typeof doc.payment_options === 'object' && Object.keys(doc.payment_options).length > 0) attributeCount++;
  if (attributeCount >= 2) {
    score += 20;
    signals.push('business_attribute_gepflegt');
  } else if (attributeCount === 1) {
    score += 10;
    signals.push('business_attribute_teil');
  }

  // 4) primary_type spezifisch
  const primaryType = String(doc.primary_type || doc.external_primary_type || '').toLowerCase();
  if (primaryType && HEALTH_TYPES.has(primaryType)) {
    score += 15;
    signals.push('primary_type_gesundheit');
  } else if (primaryType && !GENERIC_TYPES.has(primaryType)) {
    score += 8;
    signals.push('primary_type_spezifisch');
  }

  // 5) types-Array
  const types = Array.isArray(doc.types) ? doc.types : (Array.isArray(doc.external_types) ? doc.external_types : []);
  const healthTypeCount = types.filter((t) => HEALTH_TYPES.has(String(t).toLowerCase())).length;
  if (healthTypeCount >= 2) {
    score += 10;
    signals.push('mehrere_gesundheits_kategorien');
  }

  score = Math.min(100, score);
  const likelihood = score >= 55 ? 'likely_managed' : score >= 25 ? 'unclear' : 'unmanaged';
  return { score, likelihood, signals };
}

/** Kurzes Label fürs UI */
export function likelihoodLabel(likelihood) {
  return {
    unmanaged: 'Unmanaged',
    unclear: 'Unklar',
    likely_managed: 'Verwaltet',
  }[likelihood] || 'Unbekannt';
}

/** Farb-Klassen fürs UI (Tailwind) */
export function likelihoodColorClasses(likelihood) {
  return {
    unmanaged: 'border-slate-300 bg-slate-100 text-slate-700',
    unclear: 'border-amber-200 bg-amber-50 text-amber-800',
    likely_managed: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  }[likelihood] || 'border-slate-200 bg-slate-50 text-slate-600';
}
