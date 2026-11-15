import { describe, expect, it } from 'vitest';
import { DONATE_METHODS, DONATE_PAGE_PATH } from './donate';

describe('donate', () => {
  it('lists three payment methods with https links', () => {
    expect(DONATE_METHODS).toHaveLength(3);
    DONATE_METHODS.forEach((m) => {
      expect(m.url).toMatch(/^https:\/\//);
    });
  });

  it('uses a donate page path', () => {
    expect(DONATE_PAGE_PATH).toBe('/donate');
  });
});