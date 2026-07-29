export const PREVIEW_DATE_PARAM = 'previewDate';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parsePreviewDate(search: string): string | null {
  const value = new URLSearchParams(search).get(PREVIEW_DATE_PARAM);
  return value && DATE_PATTERN.test(value) ? value : null;
}

export function withPreviewDate(path: string, previewDate: string | null): string {
  if (!previewDate) return path;
  const [pathname, search = ''] = path.split('?');
  const params = new URLSearchParams(search);
  params.set(PREVIEW_DATE_PARAM, previewDate);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function withoutPreviewDate(path: string): string {
  const [pathname, search = ''] = path.split('?');
  const params = new URLSearchParams(search);
  params.delete(PREVIEW_DATE_PARAM);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function decemberPreviewDate(year: number, day: number): string {
  return `${year}-12-${String(day).padStart(2, '0')}`;
}

export function formatPreviewDateLabel(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function previewDayFromDate(date: string | null): number | null {
  if (!date) return null;
  const [, month, day] = date.split('-').map(Number);
  return month === 12 ? day : null;
}
