import { deleteField, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { apiKeyPrefixForDisplay, generateApiKey, hashApiKey } from './apiKey';
import type { UserProfile } from './types';

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export function hasApiKey(profile: UserProfile | null | undefined): boolean {
  return Boolean(profile?.apiKeyHash && profile?.apiKeyPrefix);
}

export async function createOrResetApiKey(uid: string): Promise<string> {
  const key = generateApiKey();
  const apiKeyHash = await hashApiKey(key);
  const apiKeyPrefix = apiKeyPrefixForDisplay(key);
  const ref = doc(db, 'users', uid);
  await setDoc(
    ref,
    {
      apiKeyHash,
      apiKeyPrefix,
      apiKeyCreatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
  return key;
}

export async function revokeApiKey(uid: string): Promise<void> {
  const ref = doc(db, 'users', uid);
  await setDoc(
    ref,
    {
      apiKeyHash: deleteField(),
      apiKeyPrefix: deleteField(),
      apiKeyCreatedAt: deleteField(),
    },
    { merge: true },
  );
}