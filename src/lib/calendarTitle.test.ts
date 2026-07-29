import { describe, expect, it } from 'vitest';
import {
  CALENDAR_TITLE_LONG_WARNING_AT,
  isCalendarTitleLong,
  publicCalendarTitleFontSize,
} from './calendarTitle';

describe('calendarTitle', () => {
  it('flags long titles at the warning threshold', () => {
    expect(isCalendarTitleLong('a'.repeat(CALENDAR_TITLE_LONG_WARNING_AT - 1))).toBe(false);
    expect(isCalendarTitleLong('a'.repeat(CALENDAR_TITLE_LONG_WARNING_AT))).toBe(true);
  });

  it('sizes short titles larger than long titles', () => {
    const short = Number.parseFloat(publicCalendarTitleFontSize('Ada'));
    const medium = Number.parseFloat(publicCalendarTitleFontSize('Smith Family'));
    const long = Number.parseFloat(publicCalendarTitleFontSize('The Very Long Family Adventure Calendar'));
    expect(short).toBeGreaterThan(medium);
    expect(medium).toBeGreaterThan(long);
  });

  it('keeps sizes within a readable range', () => {
    const tiny = Number.parseFloat(publicCalendarTitleFontSize('Hi'));
    const huge = Number.parseFloat(publicCalendarTitleFontSize('x'.repeat(80)));
    expect(tiny).toBeLessThanOrEqual(2.45);
    expect(huge).toBeGreaterThanOrEqual(1.12);
  });
});
