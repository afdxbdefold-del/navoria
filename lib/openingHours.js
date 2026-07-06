// Öffnungszeiten-Utilities für Google Places (v1) regularOpeningHours / currentOpeningHours
// Struktur: { periods: [{ open: {day, hour, minute}, close: {day, hour, minute} }], weekdayDescriptions: [...] }
// day: 0=Sonntag, 1=Montag, ..., 6=Samstag (Google Places v1)

const DAY_LABELS_DE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const SCHEMA_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function pad(n) { return String(n ?? 0).padStart(2, '0'); }
function hhmm(h, m) { return `${pad(h)}:${pad(m)}`; }

// Berlin timezone offset (heuristisch, ohne DST-Bibliothek): Sommer +2h, Winter +1h
// Für Anzeige ("heute geöffnet") reicht das – bei DST-Wechsel ist das MAX 1h Ungenauigkeit.
function berlinNow() {
  const now = new Date();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();
  // Grobe DST-Regel Deutschland: letzter So im März bis letzter So im Oktober
  const isDst = (month > 2 && month < 9) || (month === 2 && day >= 25) || (month === 9 && day < 25);
  const offsetH = isDst ? 2 : 1;
  const berlin = new Date(now.getTime() + offsetH * 3600 * 1000);
  return {
    dow: berlin.getUTCDay(),      // 0=So..6=Sa
    hour: berlin.getUTCHours(),
    minute: berlin.getUTCMinutes(),
  };
}

export function isOpenNow(openingHours) {
  if (!openingHours?.periods || !Array.isArray(openingHours.periods)) return null;
  const { dow, hour, minute } = berlinNow();
  const nowMin = hour * 60 + minute;

  for (const p of openingHours.periods) {
    if (!p?.open) continue;
    // 24/7 Fall
    if (!p.close) return true;
    const oDay = p.open.day, cDay = p.close.day;
    const oMin = (p.open.hour ?? 0) * 60 + (p.open.minute ?? 0);
    const cMin = (p.close.hour ?? 0) * 60 + (p.close.minute ?? 0);

    if (oDay === cDay) {
      if (dow === oDay && nowMin >= oMin && nowMin < cMin) return true;
    } else {
      // Überschneidet Mitternacht (z.B. Fr 22:00 - Sa 02:00)
      if (dow === oDay && nowMin >= oMin) return true;
      if (dow === cDay && nowMin < cMin) return true;
    }
  }
  return false;
}

// Gibt die nächste Öffnungsangabe zurück, sofern erkennbar
export function nextOpening(openingHours) {
  if (!openingHours?.periods || !Array.isArray(openingHours.periods)) return null;
  const { dow, hour, minute } = berlinNow();
  const nowMin = hour * 60 + minute;
  let best = null;
  let bestDelta = Infinity;
  for (const p of openingHours.periods) {
    if (!p?.open) continue;
    const oDay = p.open.day;
    const oMin = (p.open.hour ?? 0) * 60 + (p.open.minute ?? 0);
    let delta = (oDay - dow) * 24 * 60 + (oMin - nowMin);
    if (delta < 0) delta += 7 * 24 * 60;
    if (delta < bestDelta && delta > 0) {
      bestDelta = delta;
      best = { day: oDay, dayLabel: DAY_LABELS_DE[oDay], hour: p.open.hour ?? 0, minute: p.open.minute ?? 0 };
    }
  }
  return best;
}

// Wandelt periods in eine Wochenübersicht um: [{ day, dayLabel, ranges: [{ open, close }] }]
export function buildWeekTable(openingHours) {
  if (!openingHours?.periods) return null;
  const week = [1, 2, 3, 4, 5, 6, 0].map((d) => ({ day: d, dayLabel: DAY_LABELS_DE[d], ranges: [] }));
  for (const p of openingHours.periods) {
    if (!p?.open) continue;
    const oDay = p.open.day;
    const open = hhmm(p.open.hour, p.open.minute);
    const close = p.close ? hhmm(p.close.hour, p.close.minute) : '24:00';
    const bucket = week.find((w) => w.day === oDay);
    if (bucket) bucket.ranges.push({ open, close });
  }
  return week;
}

// Schema.org OpeningHoursSpecification
export function toSchemaOpeningHours(openingHours) {
  if (!openingHours?.periods) return undefined;
  return openingHours.periods
    .filter((p) => p?.open && p?.close)
    .map((p) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${SCHEMA_DAYS[p.open.day] || 'Monday'}`,
      opens: hhmm(p.open.hour, p.open.minute),
      closes: hhmm(p.close.hour, p.close.minute),
    }));
}

export function todayLabel() {
  const { dow } = berlinNow();
  return DAY_LABELS_DE[dow];
}
