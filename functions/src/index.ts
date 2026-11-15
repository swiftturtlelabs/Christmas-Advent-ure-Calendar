import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import express, { type Request, type Response, type NextFunction } from 'express';
import { authenticateRequest, rateLimitKey } from './auth';
import {
  ApiError,
  assertCalendarOwner,
  createCalendarRecord,
  getDays,
  listCalendarsForUser,
  patchDay,
  putDays,
} from './calendarOps';

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(express.json({ limit: '256kb' }));

type AsyncRoute = (req: Request, res: Response) => Promise<void>;

function asyncRoute(handler: AsyncRoute) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res).catch(next);
  };
}

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = await authenticateRequest(db, req);
    if (!uid) {
      res.status(401).json({ error: 'Missing or invalid API key.' });
      return;
    }
    if (!rateLimitKey(uid)) {
      res.status(429).json({ error: 'Rate limit exceeded. Try again in a minute.' });
      return;
    }
    res.locals.uid = uid;
    next();
  } catch (err) {
    next(err);
  }
});

app.get(
  '/v1/calendars',
  asyncRoute(async (_req, res) => {
  const uid = res.locals.uid as string;
    const calendars = await listCalendarsForUser(db, uid);
    res.json({ calendars });
  }),
);

app.post(
  '/v1/calendars',
  asyncRoute(async (req, res) => {
  const uid = res.locals.uid as string;
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  const year = Number(req.body?.year);
  if (!title) {
    res.status(400).json({ error: 'title is required' });
    return;
  }
  if (!Number.isFinite(year) || year < 2020 || year > 2100) {
    res.status(400).json({ error: 'year must be between 2020 and 2100' });
    return;
  }
    const calendar = await createCalendarRecord(db, uid, title, year);
    res.status(201).json({ calendar });
  }),
);

app.get(
  '/v1/calendars/:slug',
  asyncRoute(async (req, res) => {
    const uid = res.locals.uid as string;
    const slug = routeParam(req.params.slug);
    const calendar = await assertCalendarOwner(db, slug, uid);
    const days = await getDays(db, slug);
    res.json({ calendar, days });
  }),
);

app.patch(
  '/v1/calendars/:slug/days/:day',
  asyncRoute(async (req, res) => {
    const uid = res.locals.uid as string;
    const slug = routeParam(req.params.slug);
    const dayNumber = Number.parseInt(routeParam(req.params.day), 10);
  const title = typeof req.body?.title === 'string' ? req.body.title : '';
  const message = typeof req.body?.message === 'string' ? req.body.message : '';
    const updated = await patchDay(db, uid, slug, dayNumber, title, message);
    res.json({ day: updated });
  }),
);

app.put(
  '/v1/calendars/:slug/days',
  asyncRoute(async (req, res) => {
    const uid = res.locals.uid as string;
    const slug = routeParam(req.params.slug);
    const rawDays = req.body?.days;
  if (!Array.isArray(rawDays)) {
    res.status(400).json({ error: 'days must be an array' });
    return;
  }
  const days: { dayNumber: number; title: string; message: string }[] = [];
  for (const item of rawDays) {
    const dayNumber = Number(item?.dayNumber);
    const title = typeof item?.title === 'string' ? item.title : '';
    const message = typeof item?.message === 'string' ? item.message : '';
    if (!Number.isFinite(dayNumber) || dayNumber < 1 || dayNumber > 24) {
      res.status(400).json({ error: 'each dayNumber must be 1–24' });
      return;
    }
    days.push({ dayNumber, title, message });
  }
    const updated = await putDays(db, uid, slug, days);
    res.json({ days: updated });
  }),
);

app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  console.error(err);
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(500).json({ error: message });
  next();
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export const api = onRequest(
  {
    region: 'us-central1',
    cors: true,
    invoker: 'public',
    serviceAccount: 'firebase-adminsdk-fbsvc@christmas-advent-ure-calendar.iam.gserviceaccount.com',
  },
  app,
);