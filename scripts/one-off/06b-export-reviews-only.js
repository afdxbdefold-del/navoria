#!/usr/bin/env node
/**
 * Phase 6b – Nur die 5 Review-Profile extrahieren als NDJSON
 * für mongoimport in den Produktions-Container.
 */
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const OUT_ND = path.join(__dirname, 'phase6b-review-only.ndjson');
const OUT_JSON = path.join(__dirname, 'phase6b-review-only.json');

async function main() {
  const client = await MongoClient.connect(process.env.MONGO_URL);
  const col = client.db(process.env.DB_NAME || 'navoria_db').collection('doctor_places');
  const docs = await col.find(
    { migration_source: 'rzte-online', source: 'legacy_migration' },
    { projection: { _id: 0 } },
  ).toArray();

  // NDJSON (mongoimport-kompatibel)
  fs.writeFileSync(OUT_ND, docs.map((d) => JSON.stringify(d)).join('\n') + '\n');
  // JSON-Array (Backup / manuelle Prüfung)
  fs.writeFileSync(OUT_JSON, JSON.stringify(docs, null, 2));

  console.log(`Review-Profile: ${docs.length}`);
  console.log(`NDJSON: ${OUT_ND} (${fs.statSync(OUT_ND).size} bytes)`);
  console.log(`JSON:   ${OUT_JSON}`);
  for (const d of docs) console.log(`  - ${d.city_slug}/${d.slug}  «${d.name}»`);
  await client.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
