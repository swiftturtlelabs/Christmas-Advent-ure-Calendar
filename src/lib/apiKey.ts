export const API_KEY_PREFIX = 'cac_live_';

export function generateApiKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const secret = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${API_KEY_PREFIX}${secret}`;
}

export function apiKeyPrefixForDisplay(key: string): string {
  const trimmed = key.trim();
  if (trimmed.length <= 16) return trimmed;
  return `${trimmed.slice(0, 16)}…`;
}

export async function hashApiKey(key: string): Promise<string> {
  const data = new TextEncoder().encode(key.trim());
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}