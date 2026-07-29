export function hasDayRiddle(day: { riddlePrompt?: string; answerHash?: string }): boolean {
  return Boolean(day.riddlePrompt?.trim() && day.answerHash);
}
