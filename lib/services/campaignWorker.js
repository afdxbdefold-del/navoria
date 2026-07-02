import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/mongodb';
import { importOneQuery } from './placesImport';
import { SPECIALTIES } from '@/lib/specialties';

const CONCURRENCY = 5;
const BATCH_SAVE_EVERY = 3; // DB-Update-Frequenz

/**
 * Kampagne erstellen. Aufruf legt Kampagne an und startet den Worker
 * asynchron (fire-and-forget). Response kehrt sofort zurück.
 */
export async function createCampaign({ cities, specialtySlugs, maxPerQuery = 60 }) {
  const specialties = specialtySlugs
    .map((slug) => SPECIALTIES.find((s) => s.slug === slug))
    .filter(Boolean);

  const queries = [];
  for (const city of cities) {
    for (const spec of specialties) {
      queries.push({ city, query: spec.query, placeType: spec.placeType, specialty_slug: spec.slug });
    }
  }

  const id = uuidv4();
  const campaign = {
    id,
    name: `Kampagne ${cities.length} Städte × ${specialties.length} Fachrichtungen`,
    cities, specialty_slugs: specialtySlugs,
    max_per_query: maxPerQuery,
    total_queries: queries.length,
    done_queries: 0,
    found: 0, inserted: 0, updated: 0, skipped: 0, errors: 0,
    current_query: null,
    status: 'running',
    created_at: new Date(),
    started_at: new Date(),
    finished_at: null,
    error_samples: [],
  };

  const col = await getCollection('campaigns');
  await col.insertOne(campaign);

  // Fire and forget - Worker im Hintergrund starten
  runCampaignWorker(id, queries, maxPerQuery).catch(async (err) => {
    console.error('Campaign worker crashed:', err);
    await col.updateOne({ id }, { $set: { status: 'failed', finished_at: new Date(), error_samples: [String(err.message || err)] } });
  });

  return campaign;
}

async function runCampaignWorker(campaignId, queries, maxPerQuery) {
  const col = await getCollection('campaigns');

  const stats = { done_queries: 0, found: 0, inserted: 0, updated: 0, skipped: 0, errors: 0, error_samples: [] };
  let saveCounter = 0;

  const saveProgress = async (extra = {}) => {
    await col.updateOne({ id: campaignId }, {
      $set: {
        done_queries: stats.done_queries,
        found: stats.found, inserted: stats.inserted, updated: stats.updated,
        skipped: stats.skipped, errors: stats.errors,
        error_samples: stats.error_samples.slice(0, 10),
        ...extra,
      },
    });
  };

  const runOne = async (q) => {
    try {
      await col.updateOne({ id: campaignId }, { $set: { current_query: `${q.query} in ${q.city}` } });
      const r = await importOneQuery({ city: q.city, query: q.query, placeType: q.placeType, maxResults: maxPerQuery });
      stats.found += r.found;
      stats.inserted += r.inserted;
      stats.updated += r.updated;
      stats.skipped += r.skipped;
      stats.errors += r.errors;
      if (r.errorMessages.length) stats.error_samples.push(...r.errorMessages.slice(0, 2));
    } catch (err) {
      stats.errors += 1;
      stats.error_samples.push(String(err.message || err));
    }
    stats.done_queries += 1;
    saveCounter += 1;
    if (saveCounter % BATCH_SAVE_EVERY === 0) await saveProgress();
  };

  // Parallelverarbeitung mit einfacher Pool-Implementierung
  const pool = new Set();
  for (const q of queries) {
    const p = runOne(q).finally(() => pool.delete(p));
    pool.add(p);
    if (pool.size >= CONCURRENCY) {
      await Promise.race(pool);
    }
  }
  await Promise.all(pool);

  await saveProgress({ status: 'succeeded', finished_at: new Date(), current_query: null });
}
