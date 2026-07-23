export function isDayUnlocked(dayNumber: number, now = new Date(), year?: number): boolean {
  const targetYear = year ?? now.getFullYear();
  const unlockDate = new Date(targetYear, 11, dayNumber);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return today >= unlockDate;
}

export function daysUntilUnlock(dayNumber: number, now = new Date(), year?: number): number {
  const targetYear = year ?? now.getFullYear();
  const unlockDate = new Date(targetYear, 11, dayNumber);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = unlockDate.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function countdownLabel(dayNumber: number, now = new Date(), year?: number): string {
  const remaining = daysUntilUnlock(dayNumber, now, year);
  if (remaining === 0) return 'Unlocked today!';
  if (remaining === 1) return 'Opens tomorrow';
  return `Opens in ${remaining} days`;
}
