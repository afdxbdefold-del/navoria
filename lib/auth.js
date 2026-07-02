import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/mongodb';

const SESSION_HOURS = 12;

export async function createSession() {
  const col = await getCollection('admin_sessions');
  const token = uuidv4() + '.' + uuidv4();
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600 * 1000);
  await col.insertOne({ token, created_at: new Date(), expires_at: expiresAt });
  return { token, expiresAt };
}

export async function verifySession(token) {
  if (!token) return false;
  const col = await getCollection('admin_sessions');
  const sess = await col.findOne({ token });
  if (!sess) return false;
  if (new Date(sess.expires_at) < new Date()) return false;
  return true;
}

export function getTokenFromRequest(request) {
  const auth = request.headers.get('authorization') || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

export async function requireAdmin(request) {
  const token = getTokenFromRequest(request);
  const ok = await verifySession(token);
  return ok;
}
