// MCP Discovery Manifest – wird von /.well-known/mcp.json und /mcp.json ausgeliefert.
// Hilft MCP-Clients (Claude Desktop, Cursor, ChatGPT-Browser etc.), den Endpoint zu finden.

import { NextResponse } from 'next/server';
import { toolsPublicShape } from '@/lib/mcp/tools';
import { getBaseUrl } from '@/lib/baseUrl';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const base = await getBaseUrl();
  return NextResponse.json({
    // OpenAPI-artige Discovery
    schema_version: 'v1',
    protocol: 'model-context-protocol',
    protocolVersion: '2025-06-18',
    name: 'navoria-mcp',
    title: 'Navoria – Deutsches Arztverzeichnis',
    description: 'MCP-Server für Navoria.de: Suche und Detail-Abfrage deutscher Arztpraxen, Fachrichtungs-Empfehlung nach Symptom, deutsche Notfall-Informationen und Patienten-Ratgeber.',
    version: '1.0.0',
    languages: ['de-DE'],
    servers: [
      {
        url: `${base}/api/mcp`,
        transport: 'http-json-rpc',
        preferred: true,
      },
    ],
    contact: {
      name: 'Navoria Redaktion',
      email: 'mail@navoria.de',
      url: base,
    },
    capabilities: {
      tools: { listChanged: false },
    },
    tools: toolsPublicShape().map((t) => ({
      name: t.name,
      title: t.title,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
    documentation_url: `${base}/mcp`,
    terms_of_service: `${base}/impressum`,
    privacy_policy: `${base}/datenschutz`,
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
