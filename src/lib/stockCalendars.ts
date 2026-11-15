export interface StockCalendar {
  slug: string;
  title: string;
  year: number;
  tagline: string;
  tone: string;
}

export const STOCK_CALENDARS_LABEL = "Swift Turtle's Christmas Advent-ure Calendars";

/** Pre-made sample calendars anyone can preview for inspiration. */
export const STOCK_CALENDARS: StockCalendar[] = [
  {
    slug: 'omxbisf37c',
    title: 'Cozy December Classics',
    year: 2026,
    tagline: 'Warm evenings, simple traditions, and unrushed together time.',
    tone: 'Cozy',
  },
  {
    slug: 'm8fkelk328',
    title: 'Maximum Holiday Chaos',
    year: 2026,
    tagline: 'Games, silly stakes, and high-energy December fun.',
    tone: 'Playful',
  },
  {
    slug: 'c7eyqh3his',
    title: 'Kindness Countdown',
    year: 2026,
    tagline: 'Small acts of generosity and gratitude all month long.',
    tone: 'Kindness',
  },
  {
    slug: 'ow8svtkeqb',
    title: 'Budget-Friendly December',
    year: 2026,
    tagline: 'Free and low-cost ideas that still feel special.',
    tone: 'Budget',
  },
  {
    slug: '5fuzmk9w28',
    title: 'Winter Adventure Squad',
    year: 2026,
    tagline: 'Active missions, backyard exploring, and squad energy.',
    tone: 'Adventure',
  },
];

export function isStockCalendarSlug(slug: string): boolean {
  return STOCK_CALENDARS.some((cal) => cal.slug === slug);
}