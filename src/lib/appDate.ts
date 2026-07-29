/** Returns the effective "today" — preview date if provided, otherwise real date. */
export function getAppNow(previewDate?: string | null): Date {
  if (previewDate) {
    const [year, month, day] = previewDate.split('-').map(Number);
    if (year && month && day) {
      return new Date(year, month - 1, day);
    }
  }
  return new Date();
}
