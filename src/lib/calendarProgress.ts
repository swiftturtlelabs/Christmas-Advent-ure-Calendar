import type { DayContent } from './types';

const TOTAL_DAYS = 24;

export function isDaySetup(day: { title?: string; message?: string }): boolean {
  return Boolean(day.title?.trim() && day.message?.trim());
}

export function getSetupProgress(days: DayContent[]) {
  const setupCount = days.filter(isDaySetup).length;
  const percent = Math.round((setupCount / TOTAL_DAYS) * 100);
  return { setupCount, total: TOTAL_DAYS, percent };
}

export function getSetupStatus(percent: number): 'not-started' | 'in-progress' | 'complete' {
  if (percent >= 100) return 'complete';
  if (percent > 0) return 'in-progress';
  return 'not-started';
}

export function getSetupStatusLabel(status: ReturnType<typeof getSetupStatus>): string {
  switch (status) {
    case 'complete':
      return 'Complete';
    case 'in-progress':
      return 'In progress';
    default:
      return 'Not started';
  }
}
