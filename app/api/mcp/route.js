// Server-side MCP-Endpoint: JSON-RPC 2.0 über HTTP nach Model Context Protocol
// (Spec: modelcontextprotocol.io, Version 2025-06-18 / 2025-11-25).
//
// Unterstützte Methoden:
//   initialize             – Handshake, gibt Capabilities zurück
//   tools/list             – Liste aller verfügbaren Tools
//   tools/call             – Ruft ein Tool auf
//   ping                   – Heartbeat
//   notifications/initialized – Client bereit (no-op)
//
// Content-Type: application/json (Standard HTTP + JSON-RPC).
// Kein Streaming/SSE-Support in dieser Implementierung – reicht für alle
// aktuellen MCP-Clients (Claude Desktop, Cursor, Continue etc.).

import { NextResponse } from 'next/server';
import { TOOLS, toolsPublicShape, findTool } from '@/lib/mcp/tools';
import { getBaseUrl } from '@/lib/baseUrl';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PROTOCOL_VERSION = '2025-06-18';
const SERVER_INFO = {
  name: 'navoria-mcp',
  title: 'Navoria – Deutsches Arztverzeichnis',
  version: '1.0.0',
};

function rpcOk(id, result) {
  return NextResponse.json({ jsonrpc: '2.0', id, result });
}

function rpcErr(id, code, message, data) {
  return NextResponse.json({ jsonrpc: '2.0', id, error: { code, message, ...(data ? { data } : {}) } });
}

// Content-block Formatter für MCP `tools/call`
function contentFromResult(value) {
  // MCP erwartet eine Content-Array mit type "text" oder "json".
  // Wir liefern strukturiert JSON UND eine text-Repräsentation, damit
  // Clients ohne JSON-Support (Claude Desktop UI) etwas Lesbares sehen.
  const text = JSON.stringify(value, null, 2);
  return { content: [{ type: 'text', text }], structuredContent: value };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Mcp-Session-Id',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET() {
  // GET liefert ein minimales Server-Manifest, damit `curl` und Discovery-Clients
  // schnell prüfen können, ob der Endpoint MCP-fähig ist.
  return NextResponse.json({
    protocol: 'model-context-protocol',
    protocolVersion: PROTOCOL_VERSION,
    server: SERVER_INFO,
    transport: 'http-json-rpc',
    endpoint: '/api/mcp',
    capabilities: { tools: { listChanged: false } },
    tools_count: TOOLS.length,
    documentation: `${await getBaseUrl()}/mcp`,
    tools: toolsPublicShape().map((t) => ({ name: t.name, title: t.title, description: t.description })),
  }, {
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
}

export async function POST(request) {
  let body;
  try { body = await request.json(); }
  catch { return rpcErr(null, -32700, 'Parse error'); }

  // Batch-Requests (Array) unterstützt
  const isBatch = Array.isArray(body);
  const requests = isBatch ? body : [body];
  const responses = [];

  for (const req of requests) {
    const { jsonrpc, id, method, params } = req || {};
    if (jsonrpc !== '2.0' || !method) {
      responses.push({ jsonrpc: '2.0', id: id ?? null, error: { code: -32600, message: 'Invalid Request' } });
      continue;
    }

    try {
      // ────────── initialize ──────────
      if (method === 'initialize') {
        responses.push({
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: PROTOCOL_VERSION,
            serverInfo: SERVER_INFO,
            capabilities: {
              tools: { listChanged: false },
              logging: {},
            },
            instructions: 'Navoria ist ein deutschsprachiges Arztverzeichnis. Nutze search_doctors zur Praxissuche, find_specialty_for_symptom zur Fachrichtungs-Empfehlung, und get_emergency_info für Notfall-Informationen.',
          },
        });
        continue;
      }

      // ────────── notifications ──────────
      if (method.startsWith('notifications/')) {
        // No-op – keine Response gemäß JSON-RPC (id fehlt bei Notifications)
        if (id !== undefined) {
          responses.push({ jsonrpc: '2.0', id, result: null });
        }
        continue;
      }

      // ────────── ping ──────────
      if (method === 'ping') {
        responses.push({ jsonrpc: '2.0', id, result: {} });
        continue;
      }

      // ────────── tools/list ──────────
      if (method === 'tools/list') {
        responses.push({ jsonrpc: '2.0', id, result: { tools: toolsPublicShape() } });
        continue;
      }

      // ────────── tools/call ──────────
      if (method === 'tools/call') {
        const toolName = params?.name;
        const args = params?.arguments || {};
        const tool = findTool(toolName);
        if (!tool) {
          responses.push({ jsonrpc: '2.0', id, error: { code: -32602, message: `Unknown tool: ${toolName}` } });
          continue;
        }
        const value = await tool.execute(args);
        responses.push({ jsonrpc: '2.0', id, result: contentFromResult(value) });
        continue;
      }

      // ────────── unsupported method ──────────
      responses.push({ jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } });
    } catch (err) {
      responses.push({ jsonrpc: '2.0', id, error: { code: -32603, message: 'Internal error', data: String(err.message || err) } });
    }
  }

  // Notifications haben keine Response → Array kann leer werden
  const finalResponses = responses.filter(Boolean);

  if (isBatch) {
    return NextResponse.json(finalResponses, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
  return NextResponse.json(finalResponses[0] || null, {
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
}
