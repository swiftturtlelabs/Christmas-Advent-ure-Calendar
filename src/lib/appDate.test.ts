import { describe, expect, it } from 'vitest';
import { getAppNow } from './appDate';
import {
  decemberPreviewDate,
  parsePreviewDate,
  previewDayFromDate,
  withPreviewDate,
  withoutPreviewDate,
} from './previewDate';

describe('getAppNow', () => {
  it('returns real date when no preview date is set', () => {
    const before = Date.now();
    const now = getAppNow().getTime();
    const after = Date.now();
    expect(now).toBeGreaterThanOrEqual(before);
    expect(now).toBeLessThanOrEqual(after);
  });

  it('returns preview date when provided', () => {
    const now = getAppNow('2026-12-10');
    expect(now.getFullYear()).toBe(2026);
    expect(now.getMonth()).toBe(11);
    expect(now.getDate()).toBe(10);
  });
});

describe('previewDate URL helpers', () => {
  it('parses preview date from search string', () => {
    expect(parsePreviewDate('?previewDate=2026-12-10')).toBe('2026-12-10');
    expect(parsePreviewDate('?foo=bar')).toBeNull();
    expect(parsePreviewDate('?previewDate=invalid')).toBeNull();
  });

  it('adds preview date to paths', () => {
    expect(withPreviewDate('/c/abc', '2026-12-10')).toBe('/c/abc?previewDate=2026-12-10');
    expect(withPreviewDate('/c/abc?foo=bar', '2026-12-10')).toBe('/c/abc?foo=bar&previewDate=2026-12-10');
    expect(withPreviewDate('/c/abc', null)).toBe('/c/abc');
  });

  it('removes preview date from paths', () => {
    expect(withoutPreviewDate('/c/abc?previewDate=2026-12-10')).toBe('/c/abc');
    expect(withoutPreviewDate('/c/abc?previewDate=2026-12-10&foo=bar')).toBe('/c/abc?foo=bar');
  });

  it('builds december preview dates', () => {
    expect(decemberPreviewDate(2026, 5)).toBe('2026-12-05');
    expect(previewDayFromDate('2026-12-05')).toBe(5);
  });
});
