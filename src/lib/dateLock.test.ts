import { describe, expect, it } from 'vitest';
import {
  isDayUnlocked,
  daysUntilUnlock,
  countdownLabel,
  daysUntilChristmas,
  christmasCountdownLabel,
} from './dateLock';

describe('dateLock', () => {
  const dec1 = new Date(2026, 11, 1);
  const dec24 = new Date(2026, 11, 24);

  it('unlocks on December day number', () => {
    expect(isDayUnlocked(1, dec1, 2026)).toBe(true);
    expect(isDayUnlocked(24, dec1, 2026)).toBe(false);
    expect(isDayUnlocked(24, dec24, 2026)).toBe(true);
  });

  it('counts days until unlock', () => {
    expect(daysUntilUnlock(24, dec1, 2026)).toBe(23);
    expect(countdownLabel(24, dec1, 2026)).toBe('Opens in 23 days');
  });

  it('counts days until Christmas', () => {
    expect(daysUntilChristmas(dec1, 2026)).toBe(24);
    expect(christmasCountdownLabel(dec1, 2026)).toBe('24 days until Christmas!');
    expect(christmasCountdownLabel(dec24, 2026)).toBe('1 day until Christmas!');
    expect(christmasCountdownLabel(new Date(2026, 11, 25), 2026)).toBe('Christmas is today!');
  });
});
