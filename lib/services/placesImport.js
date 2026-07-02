import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/mongodb';
import { detectSpecialty, slugify } from './specialtyDetection';

const PLACES_URL = 'https://places.googleapis.com/v1/places:searchText';
const FIELD_MASK = [
  'places.id', 'places.displayName', 'places.formattedAddress', 'places.addressComponents',
  'places.location', 'places.types', 'places.primaryType', 'places.nationalPhoneNumber',
  'places.internationalPhoneNumber', 'places.websiteUri', 'places.googleMapsUri',
  'places.rating', 'places.userRatingCount', 'places.businessStatus', 'places.regularOpeningHours',
  'nextPageToken',
].join(',');

function extractAddressComponent(components, types) {
  if (!components) return null;
  const comp = components.find((c) => c.types?.some((t) => types.includes(t)));
  return comp ? comp.longText || comp.shortText || null : null;
}

async function callTextSearch({ textQuery, includedType, pageSize = 20, pageToken, apiKey }) {
  const body = { textQuery, languageCode: 'de', regionCode: 'DE', pageSize: Math.min(pageSize, 20) };
  if (includedType && includedType !== 'any') body.includedType = includedType;
  if (pageToken) body.pageToken = pageToken;
  const res = await fetch(PLACES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': FIELD_MASK },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Google Places API: ${data?.error?.message || res.status}`);
  return data;
}

/**
 * Kernfunktion: Eine Google-Places-Suche ausführen und in DB importieren.
 * Wird sowohl von runImport (Admin-UI) als auch vom Kampagnen-Worker verwendet.
 */
export async function importOneQuery({ city, query, placeType, maxResults = 60 }) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY nicht gesetzt');
  const doctorsCol = await getCollection('doctor_places');
  const citiesCol = await getCollection('cities');

  const textQuery = [query, city].filter(Boolean).join(' ').trim();
  if (!textQuery) return { found: 0, inserted: 0, updated: 0, skipped: 0, errors: 1, errorMessages: ['Kein Suchtext'] };

  let pageToken = null;
  let totalFound = 0, inserted = 0, updated = 0, skipped = 0, errors = 0;
  const errorMessages = [];

  try {
    while (totalFound < maxResults) {
      const remaining = maxResults - totalFound;
      const data = await callTextSearch({ textQuery, includedType: placeType, pageSize: Math.min(20, remaining), pageToken, apiKey });
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

          const specialtyResult = detectSpecialty(`${name} ${query || ''}`, p.primaryType, p.types || [], p.websiteUri || null);

          const citySlug = slugify(cityName || 'stadt');
          const nameSlug = slugify(name);
          const slug = `${nameSlug}-${gid.slice(-6)}`.slice(0, 100);

          const doc = {
            google_place_id: gid, name, slug, city_slug: citySlug,
            primary_type: p.primaryType || null, types: p.types || [],
            category_label: p.primaryType || null,
            specialty_guess: specialtyResult.guess, specialty_confidence: specialtyResult.confidence,
            formatted_address: p.formattedAddress || null, street: street || null,
            postal_code: postalCode || null, city: cityName || null, state: state || null, country,
            latitude: p.location?.latitude ?? null, longitude: p.location?.longitude ?? null,
            phone_national: p.nationalPhoneNumber || null, phone_international: p.internationalPhoneNumber || null,
            website_url: p.websiteUri || null, google_maps_url: p.googleMapsUri || null,
            rating: p.rating ?? null, user_rating_count: p.userRatingCount ?? null,
            business_status: p.businessStatus || null, opening_hours_json: p.regularOpeningHours || null,
            source: 'google_places', is_active: true, is_verified: false,
            last_synced_at: new Date(), updated_at: new Date(),
          };

          const existing = await doctorsCol.findOne({ google_place_id: gid });
          if (existing) {
            // Nur überschreiben, wenn nicht manuell verifiziert (specialty_guess bleibt bei is_verified erhalten)
            const setFields = { ...doc };
            if (existing.is_verified && existing.specialty_guess) {
              delete setFields.specialty_guess;
              delete setFields.specialty_confidence;
            }
            await doctorsCol.updateOne({ google_place_id: gid }, { $set: setFields });
            updated += 1;
          } else {
            doc.id = uuidv4();
            doc.created_at = new Date();
            await doctorsCol.insertOne(doc);
            inserted += 1;
          }

          if (cityName) {
            await citiesCol.updateOne(
              { slug: citySlug },
              { $set: { name: cityName, slug: citySlug, updated_at: new Date() }, $inc: { doctor_count: 0 } },
              { upsert: true }
            );
          }
        } catch (err) {
          errors += 1;
          errorMessages.push(String(err.message || err));
        }
      }

      pageToken = data.nextPageToken;
      if (!pageToken) break;
      await new Promise((r) => setTimeout(r, 2000));
    }
  } catch (err) {
    errors += 1;
    errorMessages.push(String(err.message || err));
  }

  // City-Count aktualisieren
  if (city) {
    const citySlug = slugify(city);
    const count = await doctorsCol.countDocuments({ city_slug: citySlug });
    await citiesCol.updateOne({ slug: citySlug }, { $set: { doctor_count: count } });
  }

  return { found: totalFound, inserted, updated, skipped, errors, errorMessages };
}

/**
 * Wrapper für Admin-UI: legt sync_job an, loggt und aktualisiert Status.
 */
export async function runImport({ city, query, placeType, maxResults = 20 }) {
  const jobId = uuidv4();
  const jobsCol = await getCollection('sync_jobs');
  const logsCol = await getCollection('sync_job_logs');
  const startedAt = new Date();
  await jobsCol.insertOne({
    id: jobId, started_at: startedAt, finished_at: null, status: 'running',
    params: { city, query, placeType, maxResults },
    found: 0, inserted: 0, updated: 0, skipped: 0, errors: 0, error_message: null,
  });

  const result = await importOneQuery({ city, query, placeType, maxResults });
  const finishedAt = new Date();
  const status = result.errors > 0 && result.inserted === 0 && result.updated === 0 ? 'failed' : 'succeeded';

  await jobsCol.updateOne({ id: jobId }, {
    $set: {
      finished_at: finishedAt, status,
      found: result.found, inserted: result.inserted, updated: result.updated,
      skipped: result.skipped, errors: result.errors,
      error_message: result.errorMessages.slice(0, 5).join(' | ') || null,
    },
  });

  if (result.errorMessages.length) {
    await logsCol.insertMany(result.errorMessages.slice(0, 20).map((m) => ({
      id: uuidv4(), job_id: jobId, level: 'error', message: m, created_at: new Date(),
    })));
  }
  await logsCol.insertOne({
    id: uuidv4(), job_id: jobId, level: 'info',
    message: `Fertig: ${result.inserted} neu, ${result.updated} aktualisiert, ${result.errors} Fehler`,
    created_at: new Date(),
  });

  return { id: jobId, started_at: startedAt, finished_at: finishedAt, status, ...result, params: { city, query, placeType, maxResults } };
}
