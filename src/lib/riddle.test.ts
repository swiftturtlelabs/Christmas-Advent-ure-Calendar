import { describe, expect, it } from 'vitest';
import { generateSalt, hashAnswer, verifyAnswer } from './riddle';

describe('riddle', () => {
  it('hashes and verifies answers case-insensitively', async () => {
    const salt = generateSalt();
    const hash = await hashAnswer('Snowflake', salt);
    expect(await verifyAnswer('snowflake', salt, hash)).toBe(true);
    expect(await verifyAnswer('wrong', salt, hash)).toBe(false);
  });
});
