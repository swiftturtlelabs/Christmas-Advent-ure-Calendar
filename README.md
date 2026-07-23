# Christmas Advent-ure Calendar

A Firebase-hosted web app for creating and sharing personalized 24-day Christmas advent calendars.

## Features (MVP)

- Google sign-in for creators
- Create and edit 24-day calendars with titles, messages, images, and optional early-unlock riddles
- Stock adventure suggestions to inspire each day
- Public calendar page with date-based soft-lock + riddle bypass
- Stable per-day and main-calendar URLs for QR code export
- Responsive Christmas-themed UI with snowfall

## Stack

- React + Vite + TypeScript
- Firebase Auth, Firestore, Hosting
- Vitest + React Testing Library

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

Fill in Firebase web app config from the [Firebase console](https://console.firebase.google.com/u/0/project/christmas-advent-ure-calendar/settings/general).

3. Enable **Google sign-in** in Firebase Authentication.

4. Deploy Firestore rules (first time):

```bash
npx firebase deploy --only firestore:rules
```

## Development

```bash
npm run dev
npm test
npm run build
```

## Deploy

```bash
npm run build
npx firebase deploy --only hosting,firestore:rules
```

## Project structure

- `src/lib/` — core logic (tokens, date lock, riddles, calendar service)
- `src/pages/` — landing, dashboard, editor, QR export, public views
- `legacy/` — original static HTML advent calendar (reference only)
- `FUTURE_EPICS.md` — post-MVP feature backlog

## Firebase project

- Project ID: `christmas-advent-ure-calendar`
- Hosting site: `christmas-advent-ure-calendar`

## License

Private — Swift Turtle Labs
