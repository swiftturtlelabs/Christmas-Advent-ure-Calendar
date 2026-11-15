const SLUG_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';
const TOKEN_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function generateSlug(length = 10): string {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += SLUG_CHARS[Math.floor(Math.random() * SLUG_CHARS.length)];
  }
  return out;
}

export function generateToken(length = 16): string {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += TOKEN_CHARS[Math.floor(Math.random() * TOKEN_CHARS.length)];
  }
  return out;
}