// Navoria Health-Check-Endpoint für Docker + Load-Balancer.
// Antwortet mit HTTP 200 sobald die App läuft und die DB erreichbar ist.

import { getCollection } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const started = Date.now();
  try {
    const col = await getCollection('doctor_places');
    // Ein sehr günstiger Ping — nutzt vorhandenen Index
    await col.estimatedDocumentCount();
    return new Response(
      JSON.stringify({
        ok: true,
        db: 'up',
        latency_ms: Date.now() - started,
        ts: new Date().toISOString(),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        ok: false,
        db: 'down',
        error: String(err?.message || err),
        latency_ms: Date.now() - started,
      }),
      { status: 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } },
    );
  }
}
