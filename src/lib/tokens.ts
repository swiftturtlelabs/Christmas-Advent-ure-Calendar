const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function generateSlug(length = 12): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

export function generateToken(length = 16): string {
  return generateSlug(length);
}

export function buildCalendarUrl(slug: string, origin = window.location.origin): string {
  return `${origin}/c/${slug}`;
}

export function buildDayUrl(token: string, origin = window.location.origin): string {
  return `${origin}/d/${token}`;
}
