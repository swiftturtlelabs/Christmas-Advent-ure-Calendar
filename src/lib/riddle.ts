export async function hashAnswer(answer: string, salt: string): Promise<string> {
  const normalized = answer.trim().toLowerCase();
  const data = new TextEncoder().encode(`${salt}:${normalized}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyAnswer(
  answer: string,
  salt: string | undefined,
  answerHash: string | undefined,
): Promise<boolean> {
  if (!salt || !answerHash) return false;
  const hash = await hashAnswer(answer, salt);
  return hash === answerHash;
}
