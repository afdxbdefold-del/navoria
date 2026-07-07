'use client';

import { useEffect } from 'react';

/**
 * WebMCP-Registrar: Registriert Navoria-Tools via navigator.modelContext,
 * sofern der Browser das unterstützt (Chrome 146+ Canary hinter Flag,
 * ab H2/2026 nativ). Feature-Detect blockiert stumm auf unsupported Browsern.
 *
 * Implementiert wird die *Client-Side*-Variante der Tools. Die Tools rufen
 * intern unseren eigenen Server-MCP-Endpoint /api/mcp per JSON-RPC auf –
 * so bleibt die Business-Logik an einer Stelle und Browser-Agent + Server-Agent
 * sehen exakt identische Ergebnisse.
 *
 * Spec: https://webmachinelearning.github.io/webmcp/
 */
export default function WebMCPRegistrar() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.modelContext?.registerTool) return;

    async function callServerTool(name, args) {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Math.random().toString(36).slice(2),
          method: 'tools/call',
          params: { name, arguments: args },
        }),
      });
      if (!res.ok) throw new Error(`Tool ${name} failed: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || `Tool ${name} error`);
      // structuredContent enthält das strukturierte Ergebnis
      return data.result?.structuredContent ?? data.result;
    }

    const TOOLS = [
      {
        name: 'search_doctors',
        description: 'Sucht Ärzt:innen und Praxen in Deutschland nach Fachrichtung, Stadt oder Postleitzahl. Gibt Kontaktdaten, Bewertungen und Profil-URLs zurück.',
        inputSchema: {
          type: 'object',
          properties: {
            specialty: { type: 'string', description: 'Fachrichtung (z. B. "Hausarzt", "Kardiologe")' },
            city: { type: 'string', description: 'Stadt (z. B. "Berlin")' },
            postal_code: { type: 'string', description: 'PLZ (5-stellig)' },
            limit: { type: 'integer', minimum: 1, maximum: 20 },
          },
        },
      },
      {
        name: 'get_doctor',
        description: 'Vollständige Details zu einer Praxis anhand ID oder Slug.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            city_slug: { type: 'string' },
            slug: { type: 'string' },
          },
        },
      },
      {
        name: 'find_specialty_for_symptom',
        description: 'Empfiehlt passende Fachrichtung(en) für ein Symptom oder eine Beschwerde.',
        inputSchema: {
          type: 'object',
          properties: { symptom: { type: 'string' } },
          required: ['symptom'],
        },
      },
      {
        name: 'list_specialties',
        description: 'Liste aller Fachrichtungen auf Navoria.',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'list_bundeslaender',
        description: 'Alle 16 deutschen Bundesländer mit Anzahl gelisteter Praxen.',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'get_ratgeber',
        description: 'Patienten-Ratgeber (Facharzt-Termin, Zweitmeinung, Krankenkasse etc.). Ohne slug: Liste, mit slug: Volltext.',
        inputSchema: {
          type: 'object',
          properties: { slug: { type: 'string' } },
        },
      },
      {
        name: 'get_emergency_info',
        description: 'Deutsche Notfall-Nummern (112, 116 117) und FAST-Regel für Schlaganfall-Verdacht.',
        inputSchema: { type: 'object', properties: {} },
      },
    ];

    // Vorherige Registrierungen leeren (Spec-konform bei jedem SPA-Route-Change).
    try { navigator.modelContext.clearTools?.(); } catch { /* not implemented in all versions */ }

    const registrations = [];
    for (const t of TOOLS) {
      try {
        const reg = navigator.modelContext.registerTool({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
          async execute(args) {
            const value = await callServerTool(t.name, args || {});
            // WebMCP erwartet return-Struktur: { content: [...], structuredContent?: {...} }
            return {
              content: [{ type: 'text', text: JSON.stringify(value) }],
              structuredContent: value,
            };
          },
        });
        registrations.push(reg);
      } catch (err) {
        // Silent – Browser-Impl kann noch instabil sein
        console.warn('[WebMCP] Tool-Registrierung fehlgeschlagen:', t.name, err);
      }
    }

    return () => {
      // Cleanup: registrierte Tools deregistrieren, falls die API dies unterstützt
      registrations.forEach((r) => {
        try { r?.unregister?.(); } catch { /* noop */ }
      });
    };
  }, []);

  return null;
}
