import type { Firestore } from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import { generateSlug, generateToken } from './tokens';

export interface CalendarRecord {
  slug: string;
  ownerUid: string;
  title: string;
  year: number;
  lockMode: 'open' | 'date_locked';
  createdAt: string;
  updatedAt: string;
  showYear?: boolean;
}

export interface DayRecord {
  dayNumber: number;
  title: string;
  message: string;
  token: string;
  updatedAt: string;
  imageUrl?: string;
  sourceStockId?: string;
}

export async function assertCalendarOwner(db: Firestore, slug: string, uid: string): Promise<CalendarRecord> {
  const snap = await db.doc(`calendars/${slug}`).get();
  if (!snap.exists) throw new ApiError(404, 'Calendar not found');
  const cal = snap.data() as CalendarRecord;
  if (cal.ownerUid !== uid) throw new ApiError(403, 'Not authorized');
  return cal;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function listCalendarsForUser(db: Firestore, uid: string): Promise<CalendarRecord[]> {
  const snap = await db.collection('calendars').where('ownerUid', '==', uid).get();
  return snap.docs.map((d) => d.data() as CalendarRecord);
}

export async function createCalendarRecord(
  db: Firestore,
  uid: string,
  title: string,
  year: number,
): Promise<CalendarRecord> {
  const slug = generateSlug();
  const now = new Date().toISOString();
  const calendar: CalendarRecord = {
    slug,
    ownerUid: uid,
    title,
    year,
    lockMode: 'open',
    createdAt: now,
    updatedAt: now,
  };

  await db.doc(`calendars/${slug}`).set(calendar);

  const batch = db.batch();
  for (let dayNumber = 1; dayNumber <= 24; dayNumber += 1) {
    const token = generateToken();
    const day: DayRecord = {
      dayNumber,
      title: `Day ${dayNumber}`,
      message: '',
      token,
      updatedAt: now,
    };
    batch.set(db.doc(`calendars/${slug}/days/${dayNumber}`), day);
    batch.set(db.doc(`dayLinks/${token}`), { slug, dayNumber });
  }
  await batch.commit();
  return calendar;
}

export async function getDays(db: Firestore, slug: string): Promise<DayRecord[]> {
  const snap = await db.collection(`calendars/${slug}/days`).get();
  return snap.docs
    .map((d) => d.data() as DayRecord)
    .sort((a, b) => a.dayNumber - b.dayNumber);
}

export async function patchDay(
  db: Firestore,
  uid: string,
  slug: string,
  dayNumber: number,
  title: string,
  message: string,
): Promise<DayRecord> {
  await assertCalendarOwner(db, slug, uid);
  if (dayNumber < 1 || dayNumber > 24) throw new ApiError(400, 'day must be 1–24');

  const dayRef = db.doc(`calendars/${slug}/days/${dayNumber}`);
  const existingSnap = await dayRef.get();
  const existing = existingSnap.exists ? (existingSnap.data() as DayRecord) : undefined;
  const token = existing?.token ?? generateToken();
  const updated: DayRecord = {
    dayNumber,
    title,
    message,
    token,
    updatedAt: new Date().toISOString(),
  };

  await dayRef.set(
    {
      ...updated,
      sourceStockId: FieldValue.delete(),
    },
    { merge: true },
  );
  if (!existing?.token) {
    await db.doc(`dayLinks/${token}`).set({ slug, dayNumber });
  }
  return updated;
}

export async function putDays(
  db: Firestore,
  uid: string,
  slug: string,
  days: { dayNumber: number; title: string; message: string }[],
): Promise<DayRecord[]> {
  await assertCalendarOwner(db, slug, uid);
  const results: DayRecord[] = [];
  for (const day of days) {
    results.push(await patchDay(db, uid, slug, day.dayNumber, day.title, day.message));
  }
  return results;
}