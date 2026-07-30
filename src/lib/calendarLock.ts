import type { Calendar } from './types';

export type CalendarLockMode = Calendar['lockMode'];

export function normalizeLockMode(lockMode?: CalendarLockMode | string): 'open' | 'date_locked' {
  if (lockMode === 'open') return 'open';
  if (lockMode === 'date_locked') return 'date_locked';
  if (lockMode === 'date_only' || lockMode === 'date_riddle') return 'date_locked';
  return 'open';
}

export function calendarLocksFutureDates(calendar: { lockMode?: CalendarLockMode | string }): boolean {
  return normalizeLockMode(calendar.lockMode) === 'date_locked';
}

export function calendarHasEarlyUnlock(calendar: {
  lockMode?: CalendarLockMode | string;
  unlockAnswerHash?: string;
}): boolean {
  return calendarLocksFutureDates(calendar) && Boolean(calendar.unlockAnswerHash);
}
