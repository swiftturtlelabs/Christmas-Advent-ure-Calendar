import type { Request } from 'express';
import type { Firestore } from 'firebase-admin/firestore';
import { hashApiKey } from './apiKey';

const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 120;
const hits = new Map<string, { count: number; windowStart: number }>();

export function rateLimitKey(uid: string): boolean {
  const now = Date.now();
  const entry = hits.get(uid);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    hits.set(uid, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

export function extractApiKey(req: Request): string | null {
  const header = req.header('x-api-key');
  if (header?.trim()) return header.trim();
  const auth = req.header('authorization');
  if (auth?.match(/^Bearer\s+/i)) {
    return auth.replace(/^Bearer\s+/i, '').trim();
  }
  return null;
}

export async function authenticateRequest(db: Firestore, req: Request): Promise<string | null> {
  const raw = extractApiKey(req);
  if (!raw) return null;
  const apiKeyHash = hashApiKey(raw);
  const snap = await db.collection('users').where('apiKeyHash', '==', apiKeyHash).limit(1).get();
  if (snap.empty) return null;
  return snap.docs[0].id;
}