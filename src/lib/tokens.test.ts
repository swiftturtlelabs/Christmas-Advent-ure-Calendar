import { describe, expect, it } from 'vitest';
import { buildCalendarUrl, buildDayUrl, generateSlug, generateToken } from './tokens';

describe('tokens', () => {
  it('generates url-safe slugs and tokens', () => {
    expect(generateSlug()).toMatch(/^[a-z0-9]+$/);
    expect(generateToken()).toHaveLength(16);
  });

  it('builds stable URLs', () => {
    expect(buildCalendarUrl('abc123', 'https://example.com')).toBe('https://example.com/c/abc123');
    expect(buildDayUrl('tok456', 'https://example.com')).toBe('https://example.com/d/tok456');
  });
});
