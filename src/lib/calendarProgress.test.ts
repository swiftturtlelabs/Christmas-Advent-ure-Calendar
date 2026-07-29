import { describe, expect, it } from 'vitest';
import { getSetupProgress, getSetupStatus, isDaySetup } from './calendarProgress';
import type { DayContent } from './types';

function day(dayNumber: number, title: string, message: string): DayContent {
  return {
    dayNumber,
    title,
    message,
    token: `token-${dayNumber}`,
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('isDaySetup', () => {
  it('requires both title and message', () => {
    expect(isDaySetup({ title: 'Day 1', message: '' })).toBe(false);
    expect(isDaySetup({ title: '', message: 'Hello' })).toBe(false);
    expect(isDaySetup({ title: 'Day 1', message: 'Hello' })).toBe(true);
  });
});

describe('getSetupProgress', () => {
  it('counts filled days out of 24', () => {
    const days = [day(1, 'One', 'Msg'), day(2, 'Two', 'Msg')];
    expect(getSetupProgress(days)).toEqual({ setupCount: 2, total: 24, percent: 8 });
  });

  it('returns 100% when all days are set up', () => {
    const days = Array.from({ length: 24 }, (_, i) => day(i + 1, `Day ${i + 1}`, 'Msg'));
    expect(getSetupProgress(days)).toEqual({ setupCount: 24, total: 24, percent: 100 });
  });
});

describe('getSetupStatus', () => {
  it('maps percent to status', () => {
    expect(getSetupStatus(0)).toBe('not-started');
    expect(getSetupStatus(50)).toBe('in-progress');
    expect(getSetupStatus(100)).toBe('complete');
  });
});
