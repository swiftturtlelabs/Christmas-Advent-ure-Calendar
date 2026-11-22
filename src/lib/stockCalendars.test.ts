import { describe, expect, it } from 'vitest';
import { isStockCalendarSlug, STOCK_CALENDARS, STOCK_CALENDARS_LABEL } from './stockCalendars';

describe('stockCalendars', () => {
  it('lists sample calendars with unique slugs', () => {
    expect(STOCK_CALENDARS.length).toBeGreaterThanOrEqual(6);
    const slugs = STOCK_CALENDARS.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(STOCK_CALENDARS.length);
    slugs.forEach((slug) => expect(slug).toMatch(/^[a-z0-9]+$/));
    expect(STOCK_CALENDARS.some((c) => c.title === 'Chattanooga Christmas')).toBe(true);
  });

  it('exposes the Swift Turtle catalog label', () => {
    expect(STOCK_CALENDARS_LABEL).toContain('Swift Turtle');
  });

  it('recognizes stock calendar slugs for public QR export', () => {
    expect(isStockCalendarSlug(STOCK_CALENDARS[0].slug)).toBe(true);
    expect(isStockCalendarSlug('not-a-stock-slug')).toBe(false);
  });
});