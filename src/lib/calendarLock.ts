import type { Calendar } from './types';

export type CalendarLockMode = Calendar['lockMode'];

/** Treat missing lockMode as riddles enabled for calendars created before the setting existed. */
export function calendarAllowsRiddles(calendar: { lockMode?: CalendarLockMode }): boolean {
  return calendar.lockMode !== 'date_only';
}
