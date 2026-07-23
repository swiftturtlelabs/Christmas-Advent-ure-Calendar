import { describe, expect, it } from 'vitest';
import { applyStockAdventure, getStockAdventure } from './stockAdventures';

describe('stockAdventures', () => {
  it('applies stock adventure to day draft', () => {
    const stock = getStockAdventure('hot-cocoa');
    expect(stock).toBeDefined();
    const draft = applyStockAdventure(stock!);
    expect(draft.title).toBe('Hot Cocoa Night');
    expect(draft.message).toContain('hot cocoa');
  });
});
