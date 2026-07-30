#!/usr/bin/env node
/**
 * Phase 6 – Sync-Payload für Produktion erzeugen.
 *
 * Sammelt aus der Preview-DB alle 188 neu erzeugten Profile
 * (source in ['google_places_new','legacy_migration'] mit
 * migration_source='rzte-online') und schreibt sie in eine JSON-Datei,
 * die per POST /api/admin/import an die Produktion gesendet wird.
 *
 * Nichts wird in der Produktion angefasst. Nur Preview-Export.
 */
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const OUT = path.join(__dirname, 'phase6-sync-payload.json');

async function main() {
  const client = await MongoClient.connect(process.env.MONGO_URL);
  const col = client.db(process.env.DB_NAME || 'navoria_db').collection('doctor_places');

  const cursor = col.find(
    { migration_source: 'rzte-online' },
    { projection: { _id: 0 } },
  );
  const docs = await cursor.toArray();

  // Kleinere Aufteilung nach Kategorie für Übersicht
  const places = docs.filter((d) => d.source === 'google_places_new');
  const review = docs.filter((d) => d.source === 'legacy_migration');

  fs.writeFileSync(OUT, JSON.stringify({ doctors: docs, mode: 'merge' }, null, 2));

  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  Phase 6 – Sync-Payload erzeugt                ║');
  console.log('╠════════════════════════════════════════════════╣');
  console.log(`║  Places-Imports (mit google_place_id): ${String(places.length).padStart(4)}    ║`);
  console.log(`║  Review-Profile (mit id):              ${String(review.length).padStart(4)}    ║`);
  console.log(`║  Gesamt zu synchronisieren:            ${String(docs.length).padStart(4)}    ║`);
  console.log('╚════════════════════════════════════════════════╝');
  console.log(`Datei: ${OUT}`);
  console.log('');
  console.log('Import auf Produktion:');
  console.log('  1) Cookie einer eingeloggten Admin-Session holen (Header: Cookie: admin_session=…)');
  console.log('  2) curl -X POST https://navoria.de/api/admin/import \\');
  console.log('       -H "Content-Type: application/json" \\');
  console.log('       -H "Cookie: admin_session=<TOKEN>" \\');
  console.log(`       --data-binary @${OUT}`);
  await client.close();
}

main().catch((e) => { console.error('FEHLER:', e); process.exit(1); });
