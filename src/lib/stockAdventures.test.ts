import { describe, expect, it } from 'vitest';
import {
  applyStockAdventure,
  collectUsedStockIds,
  getDayPhase,
  getStockAdventure,
  rankSuggestions,
  scoreStockForDay,
  STOCK_ADVENTURES,
} from './stockAdventures';
import type { DayContent } from './types';

function day(partial: Partial<DayContent> & { dayNumber: number }): DayContent {
  return {
    title: '',
    message: '',
    token: 't',
    updatedAt: '',
    ...partial,
  };
}

describe('stockAdventures', () => {
  it('applies stock adventure to day draft with source id', () => {
    const stock = getStockAdventure('hot-cocoa');
    expect(stock).toBeDefined();
    const draft = applyStockAdventure(stock!);
    expect(draft.title).toBe('Hot Cocoa Night');
    expect(draft.message).toContain('hot cocoa');
    expect(draft.sourceStockId).toBe('hot-cocoa');
  });

  it('maps advent days to phases', () => {
    expect(getDayPhase(1)).toBe('early');
    expect(getDayPhase(8)).toBe('early');
    expect(getDayPhase(9)).toBe('mid');
    expect(getDayPhase(16)).toBe('mid');
    expect(getDayPhase(17)).toBe('late');
    expect(getDayPhase(23)).toBe('late');
    expect(getDayPhase(24)).toBe('eve');
  });

  it('scores day-tagged adventures higher for matching days', () => {
    const stockings = getStockAdventure('hang-stockings')!;
    const pajamas = getStockAdventure('pajamas-and-cocoa')!;
    expect(scoreStockForDay(stockings, 1)).toBeGreaterThan(scoreStockForDay(pajamas, 1));
    expect(scoreStockForDay(pajamas, 24)).toBeGreaterThan(scoreStockForDay(stockings, 24));
  });

  it('ranks unused high-affinity suggestions above used ones', () => {
    const used = new Set(['hang-stockings', 'tree-decorating']);
    const ranked = rankSuggestions(STOCK_ADVENTURES, 1, used);
    const firstUnused = ranked.findIndex((s) => !used.has(s.id));
    const firstUsed = ranked.findIndex((s) => used.has(s.id));
    expect(firstUnused).toBeGreaterThanOrEqual(0);
    expect(firstUsed).toBeGreaterThan(firstUnused);
    expect(used.has(ranked[0].id)).toBe(false);
    expect(scoreStockForDay(ranked[0], 1)).toBeGreaterThanOrEqual(30);
  });

  it('collects used stock ids from sourceStockId and title match', () => {
    const days = [
      day({ dayNumber: 1, title: 'Hot Cocoa Night', message: 'yum', sourceStockId: 'hot-cocoa' }),
      day({ dayNumber: 2, title: 'Decorate the Tree', message: 'sparkle' }),
      day({ dayNumber: 3, title: '', message: '' }),
    ];
    const used = collectUsedStockIds(days);
    expect(used.has('hot-cocoa')).toBe(true);
    expect(used.has('tree-decorating')).toBe(true);
    expect(used.size).toBe(2);
  });
});
