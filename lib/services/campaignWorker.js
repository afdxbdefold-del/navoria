import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/mongodb';
import { importOneQuery } from './placesImport';
import { SPECIALTIES } from '@/lib/specialties';

const CONCURRENCY = 5;
const HEARTBEAT_STUCK_MS = 5 * 60 * 1000; // 5 Min ohne Progress = tot

/**
 * Kampagne erstellen und im Hintergrund starten.
 * queries[] wird in der DB gespeichert, damit Resume möglich ist.
 */
export async function createCampaign({ cities, specialtySlugs, maxPerQuery = 60 }) {
  const specialties = specialtySlugs.map((slug) => SPECIALTIES.find((s) => s.slug === slug)).filter(Boolean);

  const queries = [];
  for (const city of cities) {
    for (const spec of specialties) {
      queries.push({
        id: uuidv4(),
        city,
        query: spec.query,
        placeType: spec.placeType,
        specialty_slug: spec.slug,
        done: false,
      });
    }
  }

  const id = uuidv4();
  const campaign = {
    id,
    name: `Kampagne ${cities.length} Städte × ${specialties.length} Fachrichtungen`,
    cities,
    specialty_slugs: specialtySlugs,
    max_per_query: maxPerQuery,
    queries,
    total_queries: queries.length,
    done_queries: 0,
    found: 0, inserted: 0, updated: 0, skipped: 0, errors: 0,
    current_query: null,
    status: 'running',
    abort_requested: false,
    created_at: new Date(),
    started_at: new Date(),
    finished_at: null,
    last_heartbeat_at: new Date(),
    error_samples: [],
  };

  const col = await getCollection('campaigns');
  await col.insertOne(campaign);

  runCampaignWorker(id, maxPerQuery).catch(async (err) => {
    console.error('Campaign worker crashed:', err);
    await col.updateOne({ id }, { $set: { status: 'failed', finished_at: new Date(), error_samples: [String(err.message || err)] } });
  });

  const { _id, ...rest } = campaign;
  return rest;
}

/**
 * Fortsetzen: startet den Worker erneut, alle nicht-done Queries werden abgearbeitet.
 */
export async function resumeCampaign(id) {
  const col = await getCollection('campaigns');
  const c = await col.findOne({ id });
  if (!c) throw new Error('Kampagne nicht gefunden');
  if (c.status === 'running') throw new Error('Kampagne läuft bereits');

  await col.updateOne({ id }, {
    $set: {
      status: 'running',
      abort_requested: false,
      finished_at: null,
      last_heartbeat_at: new Date(),
      current_query: null,
    },
  });

  runCampaignWorker(id, c.max_per_query || 60).catch(async (err) => {
    console.error('Campaign resume crashed:', err);
    await col.updateOne({ id }, { $set: { status: 'failed', finished_at: new Date() } });
  });

  return { ok: true };
}

/**
 * Abbruch anfordern. Worker prüft dieses Flag zwischen den Queries und stoppt.
 */
export async function abortCampaign(id) {
  const col = await getCollection('campaigns');
  const c = await col.findOne({ id });
  if (!c) throw new Error('Kampagne nicht gefunden');
  await col.updateOne({ id }, { $set: { abort_requested: true } });
  // Falls die Kampagne "tot" ist (kein aktiver Worker mehr), direkt als aborted markieren
  if (c.status === 'running' && c.last_heartbeat_at && (Date.now() - new Date(c.last_heartbeat_at).getTime()) > HEARTBEAT_STUCK_MS) {
    await col.updateOne({ id }, { $set: { status: 'aborted', finished_at: new Date() } });
  }
  return { ok: true };
}

/**
 * Self-heal: markiert hängende Kampagnen als aborted, wenn Heartbeat zu alt.
 * Wird beim GET /campaigns aufgerufen.
 */
export async function healStuckCampaigns() {
  const col = await getCollection('campaigns');
  const cutoff = new Date(Date.now() - HEARTBEAT_STUCK_MS);
  await col.updateMany(
    { status: 'running', last_heartbeat_at: { $lt: cutoff } },
    { $set: { status: 'aborted', finished_at: new Date() } }
  );
}

async function runCampaignWorker(campaignId, maxPerQuery) {
  const col = await getCollection('campaigns');

  const stats = {
    done_queries: 0,
    found: 0, inserted: 0, updated: 0, skipped: 0, errors: 0,
    error_samples: [],
  };

  // Nur die noch offenen Queries holen
  const campaign = await col.findOne({ id: campaignId });
  if (!campaign) return;
  const pending = (campaign.queries || []).filter((q) => !q.done);

  // Bereits erledigte in Stats übernehmen
  stats.done_queries = (campaign.queries || []).filter((q) => q.done).length;
  stats.found = campaign.found || 0;
  stats.inserted = campaign.inserted || 0;
  stats.updated = campaign.updated || 0;
  stats.skipped = campaign.skipped || 0;
  stats.errors = campaign.errors || 0;

  const saveProgress = async (extra = {}) => {
    await col.updateOne({ id: campaignId }, {
      $set: {
        done_queries: stats.done_queries,
        found: stats.found, inserted: stats.inserted, updated: stats.updated,
        skipped: stats.skipped, errors: stats.errors,
        error_samples: stats.error_samples.slice(0, 10),
        last_heartbeat_at: new Date(),
        ...extra,
      },
    });
  };

  const shouldAbort = async () => {
    const c = await col.findOne({ id: campaignId }, { projection: { abort_requested: 1 } });
    return c?.abort_requested === true;
  };

  const runOne = async (q) => {
    if (await shouldAbort()) return false;

    await col.updateOne({ id: campaignId }, { $set: { current_query: `${q.query} in ${q.city}`, last_heartbeat_at: new Date() } });

    try {
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

    // Query als done markieren + Progress speichern in einem Update
    await col.updateOne(
      { id: campaignId, 'queries.id': q.id },
      {
        $set: {
          'queries.$.done': true,
          done_queries: stats.done_queries,
          found: stats.found, inserted: stats.inserted, updated: stats.updated,
          skipped: stats.skipped, errors: stats.errors,
          error_samples: stats.error_samples.slice(0, 10),
          last_heartbeat_at: new Date(),
        },
      }
    );
    return true;
  };

  // Parallel-Pool
  const pool = new Set();
  let aborted = false;
  for (const q of pending) {
    if (await shouldAbort()) { aborted = true; break; }
    const p = runOne(q).finally(() => pool.delete(p));
    pool.add(p);
    if (pool.size >= CONCURRENCY) await Promise.race(pool);
  }
  await Promise.all(pool);

  if (aborted || (await shouldAbort())) {
    await saveProgress({ status: 'aborted', finished_at: new Date(), current_query: null });
  } else {
    await saveProgress({ status: 'succeeded', finished_at: new Date(), current_query: null });
  }
}
