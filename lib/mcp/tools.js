// Zentrale Tool-Definitionen für Model Context Protocol (Server-MCP + WebMCP).
// Beide Implementierungen konsumieren dieselben Definitionen, damit Server-Agents
// und Browser-Agents identische Contracts sehen.
//
// Konventionen:
//   - Nur idempotente Lese-Operationen ohne Auth. Schreibende Aktionen
//     (Korrektur einreichen, Profil beanspruchen) bewusst NICHT als Tool exponiert,
//     um versehentliche Agent-Missbräuche zu vermeiden.
//   - Tool-Descriptions in DEUTSCH, weil unsere Zielgruppe deutschsprachige Agenten sind.
//   - inputSchema = JSON-Schema Draft-07 subset (kompatibel mit MCP + WebMCP).

import { getCollection } from '@/lib/mongodb';
import { SPECIALTIES } from '@/lib/specialties';
import { BUNDESLAENDER } from '@/lib/bundeslaender';
import { SYMPTOMS } from '@/lib/symptomContent';
import { RATGEBER } from '@/lib/ratgeberContent';
import { suggestSpecialtiesForSymptom } from '@/lib/services/symptomMapping';

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://navoria.de';

/**
 * Wandelt ein Praxis-Dokument in ein AI-freundliches, kompaktes JSON.
 */
function projectDoctor(d) {
  if (!d) return null;
  return {
    id: d.id,
    name: d.name,
    slug: d.slug,
    city: d.city,
    city_slug: d.city_slug,
    address: d.formatted_address,
    postal_code: d.postal_code || null,
    state: d.state || null,
    district: d.district || null,
    specialty: d.specialty_guess || null,
    phone: d.phone_number || d.phone || null,
    website: d.website_url || null,
    rating: d.rating != null ? d.rating : null,
    rating_count: d.user_rating_count || 0,
    is_verified: d.is_verified === true,
    profile_url: d.city_slug && d.slug ? `${BASE}/praxis/${d.city_slug}/${d.slug}` : null,
    google_maps_url: d.google_maps_uri || null,
  };
}

export const TOOLS = [
  {
    name: 'search_doctors',
    title: 'Ärzte in Deutschland suchen',
    description: 'Sucht Ärzt:innen und Praxen in Deutschland nach Fachrichtung, Stadt und/oder Postleitzahl. Gibt bis zu 20 Ergebnisse mit Name, Adresse, Fachrichtung, Bewertung und Profil-URL zurück. Nutze dieses Tool, wenn ein Nutzer nach einem Arzt sucht.',
    inputSchema: {
      type: 'object',
      properties: {
        specialty: {
          type: 'string',
          description: 'Fachrichtung, z. B. "Hausarzt", "Kardiologe", "Zahnarzt", "Frauenarzt". Optional, wenn city gesetzt ist.',
        },
        city: {
          type: 'string',
          description: 'Stadt oder Ort, z. B. "Berlin", "München", "Hamburg". Optional.',
        },
        postal_code: {
          type: 'string',
          description: 'Deutsche Postleitzahl, 5-stellig, z. B. "10115". Optional.',
        },
        limit: {
          type: 'integer',
          description: 'Maximale Anzahl Treffer (Default 10, max 20).',
          minimum: 1,
          maximum: 20,
        },
      },
    },
    async execute({ specialty, city, postal_code, limit = 10 }) {
      const col = await getCollection('doctor_places');
      const filter = { is_active: { $ne: false } };
      if (specialty) {
        const s = SPECIALTIES.find((x) => x.slug === specialty.toLowerCase() || x.label.toLowerCase() === specialty.toLowerCase());
        if (s) filter.specialty_guess = s.label;
        else filter.$or = [
          { specialty_guess: { $regex: specialty, $options: 'i' } },
          { name: { $regex: specialty, $options: 'i' } },
        ];
      }
      if (city) filter.$or = [
        ...(filter.$or || []),
        { city: { $regex: `^${city}`, $options: 'i' } },
        { city_slug: city.toLowerCase().replace(/[^a-z0-9]/g, '-') },
      ];
      if (postal_code) filter.postal_code = postal_code;

      const cap = Math.min(Math.max(1, parseInt(limit, 10) || 10), 20);
      const results = await col.find(filter, {
        projection: { name: 1, slug: 1, id: 1, city: 1, city_slug: 1, formatted_address: 1, postal_code: 1, state: 1, district: 1, specialty_guess: 1, phone_number: 1, phone: 1, website_url: 1, rating: 1, user_rating_count: 1, is_verified: 1, google_maps_uri: 1 },
      })
        .sort({ is_verified: -1, rating: -1, user_rating_count: -1 })
        .limit(cap)
        .toArray();
      return {
        count: results.length,
        query: { specialty: specialty || null, city: city || null, postal_code: postal_code || null },
        doctors: results.map(projectDoctor),
      };
    },
  },

  {
    name: 'get_doctor',
    title: 'Details zu einer Praxis',
    description: 'Liefert vollständige Details zu einer einzelnen Praxis anhand ihrer ID oder ihres Slugs. Enthält Öffnungszeiten, Telefon, Adresse, Fachrichtung und Bewertungen.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Praxis-ID (UUID). Alternativ zu city_slug + slug.' },
        city_slug: { type: 'string', description: 'City-Slug wie "berlin". Nur zusammen mit slug.' },
        slug: { type: 'string', description: 'Praxis-Slug. Nur zusammen mit city_slug.' },
      },
    },
    async execute({ id, city_slug, slug }) {
      const col = await getCollection('doctor_places');
      let filter = null;
      if (id) filter = { id, is_active: { $ne: false } };
      else if (city_slug && slug) filter = { city_slug, slug, is_active: { $ne: false } };
      if (!filter) return { error: 'Entweder id ODER city_slug+slug erforderlich.' };
      const doc = await col.findOne(filter);
      if (!doc) return { error: 'Praxis nicht gefunden.' };
      return {
        ...projectDoctor(doc),
        opening_hours: doc.opening_hours_text || null,
        opening_hours_weekly: safeParseHours(doc.opening_hours_json),
        specialty_slug: SPECIALTIES.find((s) => s.label === doc.specialty_guess)?.slug || null,
      };
    },
  },

  {
    name: 'find_specialty_for_symptom',
    title: 'Passende Fachrichtung für Symptom',
    description: 'Schlägt eine oder mehrere passende Fachrichtungen für ein Symptom oder eine Beschwerde vor (z. B. "Rückenschmerzen" → Orthopäde, Hausarzt). Nutze dies vor search_doctors, wenn der Nutzer nur ein Symptom nennt.',
    inputSchema: {
      type: 'object',
      properties: {
        symptom: {
          type: 'string',
          description: 'Freitext-Beschwerde, z. B. "Rückenschmerzen", "Kopfschmerzen", "Hautausschlag", "Herzrasen".',
        },
      },
      required: ['symptom'],
    },
    async execute({ symptom }) {
      const labels = suggestSpecialtiesForSymptom(symptom) || [];
      const suggestions = labels.map((label) => SPECIALTIES.find((s) => s.label === label)).filter(Boolean);
      const matched = SYMPTOMS.find((s) => symptom.toLowerCase().includes(s.slug.replace(/-/g, '')) || s.label.toLowerCase().includes(symptom.toLowerCase()));
      return {
        symptom,
        recommended_specialties: suggestions.map((sp) => ({
          slug: sp.slug,
          label: sp.label,
          overview_url: `${BASE}/aerzte/fachrichtung/${sp.slug}`,
        })),
        symptom_guide: matched ? {
          slug: matched.slug,
          label: matched.label,
          url: `${BASE}/symptome/${matched.slug}`,
          direct_answer: matched.directAnswer,
        } : null,
        disclaimer: 'Keine medizinische Diagnose. Bei akuten Notfällen 112 wählen.',
      };
    },
  },

  {
    name: 'list_specialties',
    title: 'Alle Fachrichtungen auflisten',
    description: 'Gibt eine Liste aller auf Navoria unterstützten Fachrichtungen zurück mit Slug, Anzeigename und Übersichts-URL.',
    inputSchema: { type: 'object', properties: {} },
    async execute() {
      return {
        count: SPECIALTIES.length,
        specialties: SPECIALTIES.map((s) => ({
          slug: s.slug,
          label: s.label,
          plural: s.plural,
          overview_url: `${BASE}/aerzte/fachrichtung/${s.slug}`,
        })),
      };
    },
  },

  {
    name: 'list_bundeslaender',
    title: 'Deutsche Bundesländer',
    description: 'Liefert die 16 deutschen Bundesländer mit Hauptstadt und Anzahl gelisteter Praxen.',
    inputSchema: { type: 'object', properties: {} },
    async execute() {
      const col = await getCollection('doctor_places');
      const counts = await col.aggregate([
        { $match: { is_active: { $ne: false }, state: { $nin: [null, ''] } } },
        { $group: { _id: '$state', count: { $sum: 1 } } },
      ]).toArray();
      const map = {};
      for (const c of counts) map[c._id] = c.count;
      return {
        count: BUNDESLAENDER.length,
        bundeslaender: BUNDESLAENDER.map((b) => ({
          slug: b.slug,
          label: b.label,
          capital: b.capital,
          doctors_listed: b.stateNames.reduce((s, n) => s + (map[n] || 0), 0),
          overview_url: `${BASE}/aerzte/bundesland/${b.slug}`,
        })),
      };
    },
  },

  {
    name: 'get_ratgeber',
    title: 'Patienten-Ratgeber-Artikel',
    description: 'Gibt Ratgeber-Artikel zurück (z. B. zu Facharzt-Terminen, Zweitmeinung, Krankenkasse). Ohne Parameter: Liste aller Ratgeber. Mit slug: kompletter Artikel.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Ratgeber-Slug wie "zweitmeinung-einholen". Optional.' },
      },
    },
    async execute({ slug }) {
      if (slug) {
        const r = RATGEBER.find((x) => x.slug === slug);
        if (!r) return { error: 'Ratgeber nicht gefunden' };
        return {
          slug: r.slug,
          label: r.label,
          category: r.category,
          last_updated: r.lastUpdated,
          direct_answer: r.directAnswer,
          intro: r.intro,
          sections: r.sections,
          faqs: r.faqs,
          url: `${BASE}/ratgeber/${r.slug}`,
        };
      }
      return {
        count: RATGEBER.length,
        ratgeber: RATGEBER.map((r) => ({
          slug: r.slug,
          label: r.label,
          category: r.category,
          direct_answer: r.directAnswer,
          url: `${BASE}/ratgeber/${r.slug}`,
        })),
      };
    },
  },

  {
    name: 'get_emergency_info',
    title: 'Notfall-Informationen Deutschland',
    description: 'Gibt strukturierte Informationen zu 112 (Notruf), 116 117 (ärztlicher Bereitschaftsdienst) und wann welche Nummer zu wählen ist.',
    inputSchema: { type: 'object', properties: {} },
    async execute() {
      return {
        country: 'Deutschland',
        numbers: [
          {
            number: '112',
            label: 'Notruf (Feuerwehr, Rettungsdienst)',
            when: 'Lebensbedrohliche Notfälle: Verdacht auf Herzinfarkt, Schlaganfall (FAST-Regel), Bewusstlosigkeit, schwere Atemnot, starke Blutungen, Unfall mit Verletzten, Vergiftung, Anaphylaxie.',
            cost: 'kostenlos',
          },
          {
            number: '116 117',
            label: 'Ärztlicher Bereitschaftsdienst',
            when: 'Akute aber nicht lebensbedrohliche Beschwerden außerhalb der Praxis-Öffnungszeiten (nachts, Wochenende, Feiertage). Auch: Facharzt-Termin-Vermittlung bei ärztlicher Überweisung.',
            cost: 'kostenlos',
            website: 'https://www.116117.de',
          },
        ],
        fast_rule: {
          name: 'FAST-Regel (Schlaganfall-Verdacht)',
          steps: [
            { letter: 'F', label: 'Face', check: 'Hängt eine Gesichtshälfte herab?' },
            { letter: 'A', label: 'Arm', check: 'Kann der/die Betroffene beide Arme gleich hoch heben?' },
            { letter: 'S', label: 'Speech', check: 'Kann ein einfacher Satz nachgesprochen werden?' },
            { letter: 'T', label: 'Time', check: 'Bei einem positiven Zeichen: sofort 112 wählen — jede Minute zählt.' },
          ],
        },
        guide_url: `${BASE}/ratgeber/notfall-vs-bereitschaftsdienst`,
      };
    },
  },
];

function safeParseHours(json) {
  if (!json) return null;
  try {
    const arr = typeof json === 'string' ? JSON.parse(json) : json;
    if (Array.isArray(arr)) return arr;
    return null;
  } catch { return null; }
}

/**
 * Reduzierte Schema-Descriptions für WebMCP (Browser-side).
 * WebMCP-Agent-UIs kürzen lange Beschreibungen; wir liefern eine
 * schlanke Variante ohne Execute-Function (kommt clientseitig dazu).
 */
export function toolsPublicShape() {
  return TOOLS.map((t) => ({
    name: t.name,
    title: t.title,
    description: t.description,
    inputSchema: t.inputSchema,
  }));
}

export function findTool(name) {
  return TOOLS.find((t) => t.name === name) || null;
}
