# Christmas Advent-ure Calendar API

REST API for creating calendars and updating daily activities (for scripts, automations, and AI tools).

## Authentication

Generate an API key from **Account** in the web app. Send it on every request:

- `Authorization: Bearer cac_live_…`, or
- `X-Api-Key: cac_live_…`

Keys are stored hashed in Firestore. Resetting a key invalidates the previous one immediately.

## Base URL

```
https://us-central1-christmas-advent-ure-calendar.cloudfunctions.net/api
```

## Endpoints

### `GET /v1/calendars`

List calendars you own.

### `POST /v1/calendars`

Create a calendar with 24 empty days.

Body:

```json
{ "title": "Smith Family 2026", "year": 2026 }
```

### `GET /v1/calendars/:slug`

Return calendar metadata and all days (`dayNumber`, `title`, `message`, `token`, etc.).

### `PATCH /v1/calendars/:slug/days/:day`

Update one day (`day` is 1–24).

Body:

```json
{ "title": "Cocoa night", "message": "Make cocoa together." }
```

### `PUT /v1/calendars/:slug/days`

Bulk upsert multiple days.

Body:

```json
{
  "days": [
    { "dayNumber": 1, "title": "Cocoa night", "message": "Make cocoa together." },
    { "dayNumber": 2, "title": "Lights drive", "message": "Tour the neighborhood." }
  ]
}
```

## CSV alternative

In the web editor, use **Import CSV** with columns `day`, `title`, `message`. Export from Google Sheets as CSV.

## Example AI prompt

```
You can manage my Christmas Advent-ure Calendar using this API.
Base URL: https://us-central1-christmas-advent-ure-calendar.cloudfunctions.net/api
API key: <paste from Account settings>

Create a calendar titled "Our Family 2026" for year 2026, then fill all 24 days
with cozy family activities (indoor and outdoor). Use PUT /v1/calendars/{slug}/days
to upload all days in one request. Keep titles short and messages 1–3 sentences.
```

## Deploy

```bash
cd functions && npm install && npm run build
cd .. && npx firebase deploy --only functions
```