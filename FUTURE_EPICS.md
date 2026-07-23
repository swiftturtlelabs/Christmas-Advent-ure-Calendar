# Christmas Advent-ure Calendar - Future Epics

Post-MVP backlog. The MVP itself (creator auth, calendar editor, stock adventures,
public main page with date+riddle soft-lock, per-day + main QR export, Firebase
hosting) is tracked separately in the implementation plan. Everything below is
intentionally out of scope for the first release.

Rough priority order is top-to-bottom within each section, but nothing here is committed.

---

## Seeded epics (requested)

### 1. Scavenger Hunt Creation
Let a creator turn a calendar (or a standalone experience) into a physical/location
scavenger hunt, echoing the original `Hunt*.html` pages.

- New calendar `mode: "hunt"` alongside the default advent mode.
- Each "day"/step becomes a **clue** that points to where the next QR code is hidden.
- Ordered steps with optional branching; each step has a clue, an optional image,
  and a "you found it" reveal.
- QR export produces a labeled, printable set of clue cards (step number + optional cut lines).
- Optional per-step gate (riddle/passphrase) reusing the MVP unlock logic.
- Optional "final reward" screen after the last clue.
- Consideration: hunts may not be 24 steps - support a variable step count (2-30).

### 2. Christmas Day (Day 25)
A special 25th page that closes out the calendar.

- Default page: a giant stylized `#25` with "Merry Christmas!" and festive theming,
  no editing required.
- Creator can optionally customize the title/message/image like any other day.
- A link at the bottom returns to the original 24-day main page (`/c/{slug}`).
- Gets its own stable public token so it can be QR-exported like the other days.
- Unlock: defaults to Dec 25; obeys the calendar's lock mode.
- Decision to make: is Day 25 always present, or an opt-in toggle per calendar?

### 3. Local Event Search (by ZIP)
Help creators find real-world Christmas activities to turn into adventures.

- Creator enters a ZIP code; app returns nearby seasonal events (tree lightings,
  markets, light displays, concerts).
- Requires a third-party events/places API (e.g. Ticketmaster Discovery, Eventbrite,
  Google Places) - evaluate cost, rate limits, and licensing before committing.
- "Add to day" turns a found event into a pre-filled adventure (title, date, location,
  link) applied to a chosen day.
- Likely needs a Cloud Function proxy to keep the API key server-side.
- Privacy: don't store the creator's ZIP beyond the session unless they opt in.

---

## Additional suggestions (beyond MVP)

### Content & creator experience
- **Image uploads via Firebase Storage** - MVP starts with pasted image URLs; add
  first-class uploads, cropping, and a small curated Christmas image/sticker library.
- **Rich day content** - support multiple content blocks per day (text, image,
  video/GIF link, an audio message, a checklist/activity).
- **Calendar duplication / "reuse last year"** - clone a previous calendar and bump the
  year, keeping or regenerating tokens.
- **Templates** - full starter calendars (e.g. "Cozy Nights", "Kids Activities",
  "Couples Date Nights") that populate all 24 days at once, building on stock adventures.
- **Collaborative editing** - invite a co-creator (spouse) to edit the same calendar.
- **Draft vs published states** with a creator preview ("view as recipient").

### Recipient experience
- **Daily reveal animation** - door/snow-scratch/unwrap animation when a day unlocks.
- **Reactions & notes back** - recipients can leave an emoji/thank-you the creator sees.
- **Push/email reminders** - "Day 12 is unlocked!" notifications (needs recipient opt-in
  and likely light-touch identity, e.g. email only).
- **Progress tracking** - visual streak/progress bar across the 24 days.
- **Accessibility pass** - screen-reader labels, reduced-motion mode for snowfall,
  high-contrast theme.
- **Internationalization** - translated UI + non-December / other-holiday variants.

### Distribution & sharing
- **Printable keepsake** - export the whole calendar as a PDF booklet.
- **Custom QR styling** - branded/colored QR codes, logos, festive frames on the
  print sheet.
- **Short links / custom slugs** - vanity URLs (e.g. `/c/smith-family-2026`) with
  collision handling.
- **Social share cards** - Open Graph images so shared links preview nicely.

### Platform & hardening
- **Server-enforced locking (Cloud Functions)** - move riddle/date validation
  server-side so early content can't be read from the client before its unlock time
  (MVP soft-lock is intentionally client-side).
- **PWA / installable** - finish the manifest + offline shell so recipients can
  "install" the calendar.
- **Analytics** - per-day open counts and funnels for creators (privacy-respecting).
- **Rate limiting / abuse protection** on public reads and any API proxies.
- **Automated backups / export-import** of a creator's calendars as JSON.
- **Multi-holiday theming engine** - swap palettes/assets for other occasions.
