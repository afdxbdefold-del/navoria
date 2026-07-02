import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/mongodb';
import { detectSpecialty, slugify } from './specialtyDetection';

const PLACES_URL = 'https://places.googleapis.com/v1/places:searchText';
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.addressComponents',
  'places.location',
  'places.types',
  'places.primaryType',
  'places.nationalPhoneNumber',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.googleMapsUri',
  'places.rating',
  'places.userRatingCount',
  'places.businessStatus',
  'places.regularOpeningHours',
  'nextPageToken',
].join(',');

function extractAddressComponent(components, types) {
  if (!components) return null;
  const comp = components.find((c) => c.types?.some((t) => types.includes(t)));
  return comp ? comp.longText || comp.shortText || null : null;
}

async function callTextSearch({ textQuery, includedType, pageSize = 20, pageToken, apiKey }) {
  const body = {
    textQuery,
    languageCode: 'de',
    regionCode: 'DE',
    pageSize: Math.min(pageSize, 20),
  };
  if (includedType && includedType !== 'any') body.includedType = includedType;
  if (pageToken) body.pageToken = pageToken;

  const res = await fetch(PLACES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || `HTTP ${res.status}`;
    throw new Error(`Google Places API Error: ${msg}`);
  }
  return data;
}

export async function runImport({
  city,
  query,
  placeType,
  maxResults = 20,
}) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY nicht gesetzt');

  const jobId = uuidv4();
  const jobsCol = await getCollection('sync_jobs');
  const logsCol = await getCollection('sync_job_logs');
  const doctorsCol = await getCollection('doctor_places');
  const citiesCol = await getCollection('cities');

  const startedAt = new Date();
  const job = {
    id: jobId,
    started_at: startedAt,
    finished_at: null,
    status: 'running',
    params: { city, query, placeType, maxResults },
    found: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    error_message: null,
  };
  await jobsCol.insertOne(job);

  const textQuery = [query, city].filter(Boolean).join(' ').trim();
  if (!textQuery) {
    await jobsCol.updateOne(
      { id: jobId },
      { $set: { status: 'failed', error_message: 'Kein Suchtext (query oder city erforderlich)', finished_at: new Date() } }
    );
    return { ...job, status: 'failed', error_message: 'Kein Suchtext (query oder city erforderlich)' };
  }

  let pageToken = null;
  let totalFound = 0;
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  const errorDetails = [];

  try {
    while (totalFound < maxResults) {
      const remaining = maxResults - totalFound;
      const pageSize = Math.min(20, remaining);
      const data = await callTextSearch({ textQuery, includedType: placeType, pageSize, pageToken, apiKey });
      const places = data.places || [];
      if (places.length === 0) break;

      for (const p of places) {
        totalFound += 1;
        try {
          const gid = p.id;
          if (!gid) { skipped += 1; continue; }

          const name = p.displayName?.text || 'Unbekannt';
          const addressComponents = p.addressComponents || [];
          const street = [
            extractAddressComponent(addressComponents, ['route']),
            extractAddressComponent(addressComponents, ['street_number']),
          ].filter(Boolean).join(' ');
          const postalCode = extractAddressComponent(addressComponents, ['postal_code']);
          const cityName = extractAddressComponent(addressComponents, ['locality', 'postal_town']) || city;
          const state = extractAddressComponent(addressComponents, ['administrative_area_level_1']);
          const country = extractAddressComponent(addressComponents, ['country']) || 'Deutschland';

          const specialtyResult = detectSpecialty(
            `${name} ${query || ''}`,
            p.primaryType,
            p.types || [],
            p.websiteUri || null
          );

          const citySlug = slugify(cityName || 'stadt');
          const nameSlug = slugify(name);
          const slug = `${nameSlug}-${gid.slice(-6)}`.slice(0, 100);

          const doc = {
            google_place_id: gid,
            name,
            slug,
            city_slug: citySlug,
            primary_type: p.primaryType || null,
            types: p.types || [],
            category_label: p.primaryType || null,
            specialty_guess: specialtyResult.guess,
            specialty_confidence: specialtyResult.confidence,
            formatted_address: p.formattedAddress || null,
            street: street || null,
            postal_code: postalCode || null,
            city: cityName || null,
            state: state || null,
            country,
            latitude: p.location?.latitude ?? null,
            longitude: p.location?.longitude ?? null,
            phone_national: p.nationalPhoneNumber || null,
            phone_international: p.internationalPhoneNumber || null,
            website_url: p.websiteUri || null,
            google_maps_url: p.googleMapsUri || null,
            rating: p.rating ?? null,
            user_rating_count: p.userRatingCount ?? null,
            business_status: p.businessStatus || null,
            opening_hours_json: p.regularOpeningHours || null,
            source: 'google_places',
            is_active: true,
            is_verified: false,
            last_synced_at: new Date(),
            updated_at: new Date(),
          };

          const existing = await doctorsCol.findOne({ google_place_id: gid });
          if (existing) {
            await doctorsCol.updateOne({ google_place_id: gid }, { $set: doc });
            updated += 1;
          } else {
            doc.id = uuidv4();
            doc.created_at = new Date();
            await doctorsCol.insertOne(doc);
            inserted += 1;
          }

          // City-Aggregation
          if (cityName) {
            await citiesCol.updateOne(
              { slug: citySlug },
              { $set: { name: cityName, slug: citySlug, updated_at: new Date() }, $inc: { doctor_count: 0 } },
              { upsert: true }
            );
          }

          await logsCol.insertOne({
            id: uuidv4(),
            job_id: jobId,
            level: 'info',
            message: `${existing ? 'aktualisiert' : 'neu'}: ${name}`,
            place_id: gid,
            created_at: new Date(),
          });
        } catch (err) {
          errors += 1;
          errorDetails.push(String(err.message || err));
          await logsCol.insertOne({
            id: uuidv4(),
            job_id: jobId,
            level: 'error',
            message: String(err.message || err),
            created_at: new Date(),
          });
        }
      }

      pageToken = data.nextPageToken;
      if (!pageToken) break;
      await new Promise((r) => setTimeout(r, 2000)); // Google verlangt kurze Wartezeit
    }
  } catch (err) {
    errors += 1;
    errorDetails.push(String(err.message || err));
    await logsCol.insertOne({
      id: uuidv4(),
      job_id: jobId,
      level: 'error',
      message: `Import-Abbruch: ${err.message}`,
      created_at: new Date(),
    });
  }

  const finishedAt = new Date();
  const status = errors > 0 && inserted === 0 && updated === 0 ? 'failed' : 'succeeded';
  await jobsCol.updateOne(
    { id: jobId },
    {
      $set: {
        finished_at: finishedAt,
        status,
        found: totalFound,
        inserted,
        updated,
        skipped,
        errors,
        error_message: errorDetails.slice(0, 5).join(' | ') || null,
      },
    }
  );

  // City-Counts neu berechnen für die betroffene Stadt
  if (city) {
    const citySlug = slugify(city);
    const count = await doctorsCol.countDocuments({ city_slug: citySlug });
    await citiesCol.updateOne({ slug: citySlug }, { $set: { doctor_count: count } });
  }

  return {
    id: jobId,
    started_at: startedAt,
    finished_at: finishedAt,
    status,
    found: totalFound,
    inserted,
    updated,
    skipped,
    errors,
    params: job.params,
  };
}
