import { describe, expect, it } from 'vitest';
import { STOCK_CALENDARS, STOCK_CALENDARS_LABEL } from './stockCalendars';

describe('stockCalendars', () => {
  it('lists five sample calendars with unique slugs', () => {
    expect(STOCK_CALENDARS).toHaveLength(5);
    const slugs = STOCK_CALENDARS.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(5);
    slugs.forEach((slug) => expect(slug).toMatch(/^[a-z0-9]+$/));
  });

  it('exposes the Swift Turtle catalog label', () => {
    expect(STOCK_CALENDARS_LABEL).toContain('Swift Turtle');
  });
});