import { describe, expect, it } from 'vitest';
import { buildCsvImportPreview, parseDaysCsv } from './csvImport';
import type { DayContent } from './types';

describe('parseDaysCsv', () => {
  it('parses headered CSV with quoted commas', () => {
    const csv = `day,title,message
1,Cocoa,"Make cocoa, sit by the fire."
2,Lights,Drive around.`;
    const { rows, errors } = parseDaysCsv(csv);
    expect(errors).toEqual([]);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ dayNumber: 1, title: 'Cocoa', message: 'Make cocoa, sit by the fire.' });
  });

  it('rejects invalid days', () => {
    const { errors } = parseDaysCsv('day,title,message\n25,Oops,Bad');
    expect(errors.some((e) => e.includes('1 to 24'))).toBe(true);
  });
});

describe('buildCsvImportPreview', () => {
  it('flags rows that change content', () => {
    const days: DayContent[] = [
      {
        dayNumber: 1,
        title: 'Old',
        message: 'Old msg',
        token: 't',
        updatedAt: '2026-01-01',
      },
    ];
    const preview = buildCsvImportPreview([{ dayNumber: 1, title: 'New', message: 'New msg' }], days);
    expect(preview[0].willChange).toBe(true);
  });
});