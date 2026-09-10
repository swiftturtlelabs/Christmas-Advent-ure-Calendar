/** Warn in the editor/dashboard when titles are long enough to shrink on the public calendar. */
export const CALENDAR_TITLE_LONG_WARNING_AT = 22;

export const CALENDAR_TITLE_LONG_WARNING =
  'Long titles get smaller on the calendar and may be harder to read. Shorter titles usually look best.';

export function isCalendarTitleLong(title: string): boolean {
  return title.trim().length >= CALENDAR_TITLE_LONG_WARNING_AT;
}

export function calendarShowsYear(calendar: { showYear?: boolean }): boolean {
  return calendar.showYear === true;
}

/** Public banner title size: short titles stay large; longer ones scale down to fit. */
export function publicCalendarTitleFontSize(title: string, showYear = false): string {
  const length = Math.max(title.trim().length, 1);
  const maxRem = showYear ? 2.45 : 3.35;
  const minRem = showYear ? 1.12 : 1.35;
  const scale = showYear ? 36 : 48;
  const offset = showYear ? 6 : 5;
  const rem = Math.min(maxRem, Math.max(minRem, scale / (length + offset)));
  return `${rem.toFixed(3)}rem`;
}
