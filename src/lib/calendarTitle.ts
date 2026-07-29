/** Warn in the editor/dashboard when titles are long enough to shrink on the public calendar. */
export const CALENDAR_TITLE_LONG_WARNING_AT = 22;

export const CALENDAR_TITLE_LONG_WARNING =
  'Long titles get smaller on the calendar and may be harder to read. Shorter titles usually look best.';

export function isCalendarTitleLong(title: string): boolean {
  return title.trim().length >= CALENDAR_TITLE_LONG_WARNING_AT;
}

/** Public banner title size: short titles stay large; longer ones scale down to fit. */
export function publicCalendarTitleFontSize(title: string): string {
  const length = Math.max(title.trim().length, 1);
  const rem = Math.min(2.45, Math.max(1.12, 36 / (length + 6)));
  return `${rem.toFixed(3)}rem`;
}
