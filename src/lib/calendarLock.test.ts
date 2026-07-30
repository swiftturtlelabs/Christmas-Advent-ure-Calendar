import { describe, expect, it } from 'vitest';
import {
  calendarHasEarlyUnlock,
  calendarLocksFutureDates,
  normalizeLockMode,
} from './calendarLock';

describe('normalizeLockMode', () => {
  it('maps new modes directly', () => {
    expect(normalizeLockMode('open')).toBe('open');
    expect(normalizeLockMode('date_locked')).toBe('date_locked');
  });

  it('maps legacy modes to date_locked', () => {
    expect(normalizeLockMode('date_riddle')).toBe('date_locked');
    expect(normalizeLockMode('date_only')).toBe('date_locked');
  });

  it('defaults to open when missing', () => {
    expect(normalizeLockMode(undefined)).toBe('open');
  });
});

describe('calendarLocksFutureDates', () => {
  it('is false when open', () => {
    expect(calendarLocksFutureDates({ lockMode: 'open' })).toBe(false);
  });

  it('is true when date_locked or legacy', () => {
    expect(calendarLocksFutureDates({ lockMode: 'date_locked' })).toBe(true);
    expect(calendarLocksFutureDates({ lockMode: 'date_riddle' })).toBe(true);
  });
});

describe('calendarHasEarlyUnlock', () => {
  it('requires locking and a stored answer hash', () => {
    expect(calendarHasEarlyUnlock({ lockMode: 'open', unlockAnswerHash: 'abc' })).toBe(false);
    expect(calendarHasEarlyUnlock({ lockMode: 'date_locked' })).toBe(false);
    expect(calendarHasEarlyUnlock({ lockMode: 'date_locked', unlockAnswerHash: 'abc' })).toBe(true);
  });
});
