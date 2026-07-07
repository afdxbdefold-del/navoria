import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/mongodb';
import { detectSpecialty, slugify } from './specialtyDetection';
import { parseDisplayName } from '@/lib/doctorFormatter';

const PLACES_URL = 'https://places.googleapis.com/v1/places:searchText';
const FIELD_MASK = [
  'places.id', 'places.displayName', 'places.formattedAddress', 'places.addressComponents',
  'places.location', 'places.types', 'places.primaryType', 'places.nationalPhoneNumber',
  'places.internationalPhoneNumber', 'places.websiteUri', 'places.googleMapsUri',
  'places.rating', 'places.userRatingCount', 'places.businessStatus',
  'places.regularOpeningHours', 'places.currentOpeningHours',
  'places.accessibilityOptions', 'places.paymentOptions', 'places.parkingOptions',
  'nextPageToken',
].join(',');

// Felder, die durch manuelle Admin-Overrides gesetzt werden können.
// Bei Re-Sync werden diese NICHT durch externe Daten überschrieben, wenn override existiert.
const OVERRIDABLE_FIELDS = [
  'name', 'specialty_guess', 'title_prefix', 'doctor_name_normalized', 'practice_name',
  'phone_national', 'phone_international', 'website_url',
  'street', 'postal_code', 'city', 'district',
  'services_manual', 'languages_manual', 'appointment_url_manual',
];

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
export async function importOneQuery({ city, query, placeType, maxResults = 60, filterNoWebsiteOnly = false }) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY nicht gesetzt');
  const doctorsCol = await getCollection('doctor_places');
  const citiesCol = await getCollection('cities');

  const textQuery = [query, city].filter(Boolean).join(' ').trim();
  if (!textQuery) return { found: 0, inserted: 0, updated: 0, skipped: 0, errors: 1, errorMessages: ['Kein Suchtext'] };

  let pageToken = null;
  let totalFound = 0, inserted = 0, updated = 0, skipped = 0, skippedDiscarded = 0, skippedHasWebsite = 0, errors = 0;
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

          // Filter: Nur Praxen OHNE Website – überspringe alles mit websiteUri.
          // Wichtig: Auch bereits existierende Einträge NICHT updaten, wenn sie mittlerweile
          // eine Website haben – der Sinn dieses Modus ist die gezielte Erfassung von
          // Praxen ohne Web-Präsenz.
          if (filterNoWebsiteOnly && p.websiteUri) {
            skippedHasWebsite += 1;
            continue;
          }

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
          const parsedName = parseDisplayName(name);
          const district = extractAddressComponent(addressComponents, ['sublocality_level_1', 'sublocality', 'neighborhood']);

          const citySlug = slugify(cityName || 'stadt');
          const nameSlug = slugify(name);
          const slug = `${nameSlug}-${gid.slice(-6)}`.slice(0, 100);

          const doc = {
            google_place_id: gid, external_place_id: gid,
            name, display_name: name, slug, city_slug: citySlug,
            title_prefix: parsedName.title_prefix,
            doctor_name_normalized: parsedName.doctor_name_normalized,
            practice_name: parsedName.practice_name,
            primary_type: p.primaryType || null, types: p.types || [],
            external_primary_type: p.primaryType || null, external_types: p.types || [],
            category_label: p.primaryType || null,
            specialty_guess: specialtyResult.guess, specialty_confidence: specialtyResult.confidence,
            primary_specialty: specialtyResult.guess,
            formatted_address: p.formattedAddress || null, street: street || null,
            postal_code: postalCode || null, city: cityName || null, district: district || null,
            state: state || null, country,
            latitude: p.location?.latitude ?? null, longitude: p.location?.longitude ?? null,
            phone_national: p.nationalPhoneNumber || null, phone_international: p.internationalPhoneNumber || null,
            national_phone_number: p.nationalPhoneNumber || null,
            international_phone_number: p.internationalPhoneNumber || null,
            website_url: p.websiteUri || null, google_maps_url: p.googleMapsUri || null,
            rating: p.rating ?? null, user_rating_count: p.userRatingCount ?? null,
            business_status: p.businessStatus || null,
            opening_hours_json: p.regularOpeningHours || null,
            regular_opening_hours: p.regularOpeningHours || null,
            current_opening_hours: p.currentOpeningHours || null,
            accessibility_options: p.accessibilityOptions || null,
            payment_options: p.paymentOptions || null,
            parking_options: p.parkingOptions || null,
            source: 'google_places', is_verified: false,
            last_synced_at: new Date(), last_external_sync_at: new Date(), updated_at: new Date(),
          };

          const existing = await doctorsCol.findOne({ google_place_id: gid });
          if (existing) {
            // SCHUTZ: Verworfene Praxen (is_active === false, meist mit discarded_at)
            // dürfen NIE durch einen erneuten Import reaktiviert werden. Nur den
            // Sync-Zeitstempel aktualisieren, um zu wissen dass die Praxis noch bei Google
            // ist, und einen Zähler hochzählen für Auditing.
            if (existing.is_active === false) {
              await doctorsCol.updateOne(
                { google_place_id: gid },
                {
                  $set: {
                    last_synced_at: new Date(),
                    last_external_sync_at: new Date(),
                    last_resurrection_attempt_at: new Date(),
                  },
                  $inc: { resurrection_attempts: 1 },
                }
              );
              skippedDiscarded += 1;
              continue;
            }

            // Nur überschreiben, wenn nicht manuell verifiziert / kein manual_override gesetzt
            const setFields = { ...doc };
            // is_active bei Updates NIE verändern (nur bei Insert unten setzen)
            delete setFields.is_active;
            const overrides = existing.manual_overrides || {};
            const conflicts = [];
            // Manuelle Overrides schützen
            for (const field of OVERRIDABLE_FIELDS) {
              if (overrides[field] !== undefined && overrides[field] !== null) {
                // Konflikt erkennen: externer Wert weicht vom Override ab
                if (setFields[field] != null && setFields[field] !== overrides[field]) {
                  conflicts.push({ field, external_value: setFields[field], override_value: overrides[field], detected_at: new Date() });
                }
                delete setFields[field];
              }
            }
            // Legacy is_verified respektieren
            if (existing.is_verified && existing.specialty_guess) {
              delete setFields.specialty_guess;
              delete setFields.specialty_confidence;
              delete setFields.primary_specialty;
            }
            if (conflicts.length) {
              setFields.data_conflicts = [...(existing.data_conflicts || []), ...conflicts].slice(-20);
            }
            await doctorsCol.updateOne({ google_place_id: gid }, { $set: setFields });
            updated += 1;
          } else {
            doc.id = uuidv4();
            doc.created_at = new Date();
            doc.is_active = true; // erste Ankunft: aktiv
            doc.manual_overrides = {};
            doc.data_conflicts = [];
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

  return { found: totalFound, inserted, updated, skipped, skipped_discarded: skippedDiscarded, skipped_has_website: skippedHasWebsite, errors, errorMessages };
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
    found: 0, inserted: 0, updated: 0, skipped: 0, skipped_discarded: 0, errors: 0, error_message: null,
  });

  const result = await importOneQuery({ city, query, placeType, maxResults });
  const finishedAt = new Date();
  const status = result.errors > 0 && result.inserted === 0 && result.updated === 0 ? 'failed' : 'succeeded';

  await jobsCol.updateOne({ id: jobId }, {
    $set: {
      finished_at: finishedAt, status,
      found: result.found, inserted: result.inserted, updated: result.updated,
      skipped: result.skipped, skipped_discarded: result.skipped_discarded || 0, errors: result.errors,
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
    message: `Fertig: ${result.inserted} neu, ${result.updated} aktualisiert, ${result.skipped_discarded || 0} verworfene übersprungen, ${result.errors} Fehler`,
    created_at: new Date(),
  });

  return { id: jobId, started_at: startedAt, finished_at: finishedAt, status, ...result, params: { city, query, placeType, maxResults } };
}


/**
 * Einzel-Praxis via Place Details API neu synchronisieren.
 * Nutzt die vorhandene google_place_id, um alle neuen Felder (accessibilityOptions, paymentOptions,
 * parkingOptions, currentOpeningHours, addressComponents) nachzuladen.
 * Respektiert manual_overrides.
 */
const DETAILS_FIELD_MASK = [
  'id', 'displayName', 'formattedAddress', 'addressComponents',
  'location', 'types', 'primaryType', 'nationalPhoneNumber',
  'internationalPhoneNumber', 'websiteUri', 'googleMapsUri',
  'businessStatus', 'regularOpeningHours', 'currentOpeningHours',
  'accessibilityOptions', 'paymentOptions', 'parkingOptions',
].join(',');

export async function resyncOneDoctor(placeId) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY nicht gesetzt');
  if (!placeId) throw new Error('placeId erforderlich');

  const doctorsCol = await getCollection('doctor_places');
  const existing = await doctorsCol.findOne({ google_place_id: placeId });
  if (!existing) throw new Error('Praxis nicht gefunden');

  // Verworfene Praxen NICHT über resyncOneDoctor reaktivieren. Wenn Admin die verworfene
  // Praxis absichtlich neu einlesen will, muss er sie erst über /admin/ohne-website oder
  // /admin/duplikate wiederherstellen (is_active: true setzen).
  if (existing.is_active === false) {
    throw new Error('Praxis ist verworfen (is_active: false). Erst wiederherstellen, dann synchronisieren.');
  }

  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=de&regionCode=DE`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': DETAILS_FIELD_MASK },
  });
  const p = await res.json();
  if (!res.ok) throw new Error(`Place Details: ${p?.error?.message || res.status}`);

  const addressComponents = p.addressComponents || [];
  const street = [
    extractAddressComponent(addressComponents, ['route']),
    extractAddressComponent(addressComponents, ['street_number']),
  ].filter(Boolean).join(' ');
  const postalCode = extractAddressComponent(addressComponents, ['postal_code']);
  const cityName = extractAddressComponent(addressComponents, ['locality', 'postal_town']) || existing.city;
  const district = extractAddressComponent(addressComponents, ['sublocality_level_1', 'sublocality', 'neighborhood']);
  const country = extractAddressComponent(addressComponents, ['country']) || 'Deutschland';

  const name = p.displayName?.text || existing.name;
  const parsedName = parseDisplayName(name);

  const setFields = {
    external_place_id: p.id,
    display_name: name, name,
    title_prefix: parsedName.title_prefix,
    doctor_name_normalized: parsedName.doctor_name_normalized,
    practice_name: parsedName.practice_name,
    formatted_address: p.formattedAddress || existing.formatted_address,
    street: street || existing.street,
    postal_code: postalCode || existing.postal_code,
    city: cityName || existing.city,
    district: district || existing.district,
    country,
    latitude: p.location?.latitude ?? existing.latitude,
    longitude: p.location?.longitude ?? existing.longitude,
    primary_type: p.primaryType || existing.primary_type,
    external_primary_type: p.primaryType || existing.primary_type,
    types: p.types || existing.types || [],
    external_types: p.types || existing.types || [],
    phone_national: p.nationalPhoneNumber || existing.phone_national,
    phone_international: p.internationalPhoneNumber || existing.phone_international,
    national_phone_number: p.nationalPhoneNumber || existing.phone_national,
    international_phone_number: p.internationalPhoneNumber || existing.phone_international,
    website_url: p.websiteUri || existing.website_url,
    google_maps_url: p.googleMapsUri || existing.google_maps_url,
    business_status: p.businessStatus || existing.business_status,
    regular_opening_hours: p.regularOpeningHours || existing.regular_opening_hours || existing.opening_hours_json || null,
    current_opening_hours: p.currentOpeningHours || null,
    opening_hours_json: p.regularOpeningHours || existing.opening_hours_json || null,
    accessibility_options: p.accessibilityOptions || null,
    payment_options: p.paymentOptions || null,
    parking_options: p.parkingOptions || null,
    last_synced_at: new Date(),
    last_external_sync_at: new Date(),
    updated_at: new Date(),
  };

  // Manuelle Overrides schützen
  const overrides = existing.manual_overrides || {};
  const conflicts = [];
  for (const field of OVERRIDABLE_FIELDS) {
    if (overrides[field] !== undefined && overrides[field] !== null) {
      if (setFields[field] != null && setFields[field] !== overrides[field]) {
        conflicts.push({ field, external_value: setFields[field], override_value: overrides[field], detected_at: new Date() });
      }
      delete setFields[field];
    }
  }
  if (conflicts.length) {
    setFields.data_conflicts = [...(existing.data_conflicts || []), ...conflicts].slice(-20);
  }

  await doctorsCol.updateOne({ google_place_id: placeId }, { $set: setFields });
  return { ok: true, updated_fields: Object.keys(setFields), conflicts: conflicts.length };
}

/**
 * Backfill: alle Ärzte, deren letzter externer Sync älter als 24h ist oder die noch nie
 * eine Anreicherung mit den neuen Feldern hatten (accessibility_options fehlt/nie geschrieben).
 * Rate-limited (250 ms Delay zwischen Requests).
 */
export async function backfillMissingFields({ limit = 50, minAgeHours = 24, force = false } = {}) {
  const doctorsCol = await getCollection('doctor_places');
  // Verworfene Praxen (is_active: false) NIE nachziehen — die sind bewusst deaktiviert.
  const baseQuery = { google_place_id: { $exists: true, $ne: null }, is_active: { $ne: false } };
  const query = force
    ? baseQuery
    : {
        ...baseQuery,
        $or: [
          { last_external_sync_at: { $exists: false } },
          { last_external_sync_at: null },
          { last_external_sync_at: { $lt: new Date(Date.now() - minAgeHours * 3600 * 1000) } },
        ],
      };
  const targets = await doctorsCol.find(query).sort({ last_external_sync_at: 1 }).limit(limit).toArray();

  let ok = 0, failed = 0;
  const errors = [];
  for (const d of targets) {
    try {
      await resyncOneDoctor(d.google_place_id);
      ok += 1;
    } catch (err) {
      failed += 1;
      errors.push({ id: d.google_place_id, error: String(err.message || err) });
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return { processed: targets.length, ok, failed, errors: errors.slice(0, 20) };
}
