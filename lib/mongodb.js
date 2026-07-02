import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URL;
const dbName = process.env.DB_NAME || 'navoria_db';

let cached = global._mongoClientPromise;
if (!cached) {
  const client = new MongoClient(uri);
  cached = client.connect();
  global._mongoClientPromise = cached;
}

export async function getDb() {
  const client = await cached;
  return client.db(dbName);
}

export async function getCollection(name) {
  const db = await getDb();
  return db.collection(name);
}
