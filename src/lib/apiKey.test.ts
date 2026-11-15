import { describe, expect, it } from 'vitest';
import { API_KEY_PREFIX, generateApiKey, hashApiKey } from './apiKey';

describe('apiKey', () => {
  it('generates prefixed keys and stable hashes', async () => {
    const key = generateApiKey();
    expect(key.startsWith(API_KEY_PREFIX)).toBe(true);
    const h1 = await hashApiKey(key);
    const h2 = await hashApiKey(key);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(64);
  });
});