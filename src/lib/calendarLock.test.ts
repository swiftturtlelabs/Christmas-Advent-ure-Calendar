import { describe, expect, it } from 'vitest';
import { calendarAllowsRiddles } from './calendarLock';

describe('calendarAllowsRiddles', () => {
  it('allows riddles when lockMode is date_riddle', () => {
    expect(calendarAllowsRiddles({ lockMode: 'date_riddle' })).toBe(true);
  });

  it('disallows riddles when lockMode is date_only', () => {
    expect(calendarAllowsRiddles({ lockMode: 'date_only' })).toBe(false);
  });

  it('defaults to allowing riddles when lockMode is missing', () => {
    expect(calendarAllowsRiddles({})).toBe(true);
  });
});
