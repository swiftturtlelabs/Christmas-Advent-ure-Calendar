import { describe, expect, it } from 'vitest';
import { hasDayRiddle } from './dayRiddle';

describe('hasDayRiddle', () => {
  it('requires both prompt and answer hash', () => {
    expect(hasDayRiddle({ riddlePrompt: 'What am I?', answerHash: 'abc' })).toBe(true);
    expect(hasDayRiddle({ riddlePrompt: 'What am I?' })).toBe(false);
    expect(hasDayRiddle({ answerHash: 'abc' })).toBe(false);
    expect(hasDayRiddle({ riddlePrompt: '  ', answerHash: 'abc' })).toBe(false);
  });
});
