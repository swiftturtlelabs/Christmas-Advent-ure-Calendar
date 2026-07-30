import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
  type DocumentData,
  type UpdateData,
} from 'firebase/firestore';
import { db } from './firebase';
import { generateSalt, hashAnswer } from './riddle';
import { generateSlug, generateToken } from './tokens';
import { STOCK_ADVENTURES } from './stockAdventures';
import type { Calendar, DayContent, DayDraft, UserProfile } from './types';

export async function ensureUserProfile(user: {
  uid: string;
  displayName: string | null;
  email: string | null;
}): Promise<UserProfile> {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as UserProfile;

  const profile: UserProfile = {
    uid: user.uid,
    displayName: user.displayName ?? 'Creator',
    email: user.email ?? '',
    createdAt: new Date().toISOString(),
  };
  await setDoc(ref, profile);
  return profile;
}

export async function listCalendars(ownerUid: string): Promise<Calendar[]> {
  const q = query(collection(db, 'calendars'), where('ownerUid', '==', ownerUid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Calendar);
}

export async function createCalendar(ownerUid: string, title: string, year: number): Promise<Calendar> {
  const slug = generateSlug();
  const now = new Date().toISOString();
  const calendar: Calendar = {
    slug,
    ownerUid,
    title,
    year,
    lockMode: 'date_riddle',
    createdAt: now,
    updatedAt: now,
  };

  // The calendar document must be committed before its days/dayLinks so the
  // Firestore ownership rules (which look up the parent calendar's ownerUid)
  // can validate the child writes.
  await setDoc(doc(db, 'calendars', slug), calendar);

  const batch = writeBatch(db);
  for (let dayNumber = 1; dayNumber <= 24; dayNumber += 1) {
    const token = generateToken();
    const day: DayContent = {
      dayNumber,
      title: `Day ${dayNumber}`,
      message: '',
      token,
      updatedAt: now,
    };
    batch.set(doc(db, 'calendars', slug, 'days', String(dayNumber)), day);
    batch.set(doc(db, 'dayLinks', token), { slug, dayNumber });
  }

  await batch.commit();
  return calendar;
}

export async function deleteCalendar(slug: string, ownerUid: string): Promise<void> {
  const calRef = doc(db, 'calendars', slug);
  const calSnap = await getDoc(calRef);
  if (!calSnap.exists()) return;
  const cal = calSnap.data() as Calendar;
  if (cal.ownerUid !== ownerUid) throw new Error('Not authorized');

  const daysSnap = await getDocs(collection(db, 'calendars', slug, 'days'));
  const batch = writeBatch(db);
  daysSnap.docs.forEach((d) => {
    const day = d.data() as DayContent;
    batch.delete(doc(db, 'dayLinks', day.token));
    batch.delete(d.ref);
  });
  batch.delete(calRef);
  await batch.commit();
}

export async function getCalendar(slug: string): Promise<Calendar | null> {
  const snap = await getDoc(doc(db, 'calendars', slug));
  return snap.exists() ? (snap.data() as Calendar) : null;
}

export async function getDays(slug: string): Promise<DayContent[]> {
  const snap = await getDocs(collection(db, 'calendars', slug, 'days'));
  return snap.docs
    .map((d) => d.data() as DayContent)
    .sort((a, b) => a.dayNumber - b.dayNumber);
}

export async function getDayByToken(token: string): Promise<{ calendar: Calendar; day: DayContent } | null> {
  const linkSnap = await getDoc(doc(db, 'dayLinks', token));
  if (!linkSnap.exists()) return null;
  const { slug, dayNumber } = linkSnap.data() as { slug: string; dayNumber: number };
  const [calendar, daySnap] = await Promise.all([
    getCalendar(slug),
    getDoc(doc(db, 'calendars', slug, 'days', String(dayNumber))),
  ]);
  if (!calendar || !daySnap.exists()) return null;
  return { calendar, day: daySnap.data() as DayContent };
}

export async function saveDay(
  slug: string,
  ownerUid: string,
  dayNumber: number,
  draft: DayDraft,
): Promise<void> {
  const cal = await getCalendar(slug);
  if (!cal || cal.ownerUid !== ownerUid) throw new Error('Not authorized');

  const dayRef = doc(db, 'calendars', slug, 'days', String(dayNumber));
  const existing = (await getDoc(dayRef)).data() as DayContent | undefined;
  const token = existing?.token ?? generateToken();

  // Firestore rejects `undefined` field values, so optional fields are either
  // set to a real value or removed with deleteField() — never undefined.
  const updated: UpdateData<DayContent> = {
    dayNumber,
    title: draft.title,
    message: draft.message,
    token,
    updatedAt: new Date().toISOString(),
  };

  const imageUrl = draft.imageUrl?.trim();
  if (imageUrl) {
    updated.imageUrl = imageUrl;
  } else if (existing?.imageUrl) {
    updated.imageUrl = deleteField();
  }

  const riddlePrompt = draft.riddlePrompt?.trim();
  if (riddlePrompt) {
    updated.riddlePrompt = riddlePrompt;
  } else if (existing?.riddlePrompt) {
    updated.riddlePrompt = deleteField();
  }

  if (draft.answer?.trim()) {
    const answerSalt = generateSalt();
    updated.answerSalt = answerSalt;
    updated.answerHash = await hashAnswer(draft.answer, answerSalt);
  } else if (draft.answer === '') {
    updated.answerHash = deleteField();
    updated.answerSalt = deleteField();
  }

  const sourceStockId = draft.sourceStockId?.trim();
  if (sourceStockId) {
    updated.sourceStockId = sourceStockId;
  } else if (existing?.sourceStockId) {
    updated.sourceStockId = deleteField();
  }

  await setDoc(dayRef, updated, { merge: true });

  // Days created outside createCalendar still need a QR lookup entry.
  if (!existing?.token) {
    await setDoc(doc(db, 'dayLinks', token), { slug, dayNumber });
  }
}

export async function seedStockAdventuresIfEmpty(): Promise<void> {
  const col = collection(db, 'stockAdventures');
  const snap = await getDocs(col);
  if (!snap.empty) return;

  const batch = writeBatch(db);
  STOCK_ADVENTURES.forEach((s) => {
    batch.set(doc(db, 'stockAdventures', s.id), s);
  });
  await batch.commit();
}

export async function listStockAdventures() {
  const snap = await getDocs(collection(db, 'stockAdventures'));
  if (snap.empty) return STOCK_ADVENTURES;
  return snap.docs.map((d) => d.data() as DocumentData) as typeof STOCK_ADVENTURES;
}

export async function updateCalendarTitle(slug: string, ownerUid: string, title: string): Promise<void> {
  const cal = await getCalendar(slug);
  if (!cal || cal.ownerUid !== ownerUid) throw new Error('Not authorized');
  await setDoc(doc(db, 'calendars', slug), { title, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function updateCalendarSettings(
  slug: string,
  ownerUid: string,
  settings: Pick<Calendar, 'lockMode'>,
): Promise<void> {
  const cal = await getCalendar(slug);
  if (!cal || cal.ownerUid !== ownerUid) throw new Error('Not authorized');
  await setDoc(
    doc(db, 'calendars', slug),
    { ...settings, updatedAt: new Date().toISOString() },
    { merge: true },
  );
}
