import { MongoClient } from 'mongodb';

// Verbindung wird LAZY hergestellt – erst beim ersten Aufruf, NICHT beim Modul-Import.
// Wichtig für Cloud-Build (kein DB-Zugriff während `next build`).

function getConnectionPromise() {
  if (!global._mongoClientPromise) {
    const uri = process.env.MONGO_URL;
    if (!uri) {
      throw new Error('MONGO_URL environment variable is not set');
    }
    global._mongoClientPromise = new MongoClient(uri).connect();
  }
  return global._mongoClientPromise;
}

export async function getDb() {
  const client = await getConnectionPromise();
  const dbName = process.env.DB_NAME || 'navoria_db';
  return client.db(dbName);
}

export async function getCollection(name) {
  const db = await getDb();
  return db.collection(name);
}
