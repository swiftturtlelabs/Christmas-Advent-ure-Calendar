import type { DayContent } from './types';

export const CSV_IMPORT_HELP =
  'Use columns: day, title, message. Export from Google Sheets as CSV. Days must be 1–24.';

export interface CsvDayRow {
  dayNumber: number;
  title: string;
  message: string;
}

export interface CsvParseResult {
  rows: CsvDayRow[];
  errors: string[];
}

export interface CsvImportPreviewRow {
  dayNumber: number;
  title: string;
  message: string;
  previousTitle: string;
  previousMessage: string;
  willChange: boolean;
}

function parseCsvRow(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields.map((f) => f.trim());
}

function columnIndex(headers: string[], names: string[]): number {
  const normalized = headers.map((h) => h.trim().toLowerCase());
  for (const name of names) {
    const idx = normalized.indexOf(name);
    if (idx >= 0) return idx;
  }
  return -1;
}

export function parseDaysCsv(text: string): CsvParseResult {
  const errors: string[] = [];
  const lines = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { rows: [], errors: ['CSV is empty.'] };
  }

  const headerFields = parseCsvRow(lines[0]);
  const dayIdx = columnIndex(headerFields, ['day', 'daynumber', 'day_number', '#']);
  const titleIdx = columnIndex(headerFields, ['title', 'name', 'activity']);
  const messageIdx = columnIndex(headerFields, ['message', 'description', 'body', 'details']);

  let startLine = 0;
  let dIdx = dayIdx;
  let tIdx = titleIdx;
  let mIdx = messageIdx;

  if (dayIdx < 0) {
    dIdx = 0;
    tIdx = 1;
    mIdx = 2;
    startLine = 0;
  } else {
    startLine = 1;
  }

  const rows: CsvDayRow[] = [];
  const seen = new Set<number>();

  for (let lineNo = startLine; lineNo < lines.length; lineNo += 1) {
    const fields = parseCsvRow(lines[lineNo]);
    const dayRaw = fields[dIdx] ?? '';
    const dayNumber = Number.parseInt(dayRaw, 10);
    if (!Number.isFinite(dayNumber) || dayNumber < 1 || dayNumber > 24) {
      errors.push(`Row ${lineNo + 1}: day must be a number from 1 to 24 (got "${dayRaw}").`);
      continue;
    }
    if (seen.has(dayNumber)) {
      errors.push(`Row ${lineNo + 1}: duplicate day ${dayNumber}.`);
      continue;
    }
    seen.add(dayNumber);

    const title = (fields[tIdx] ?? '').trim();
    const message = (fields[mIdx] ?? '').trim();
    rows.push({ dayNumber, title, message });
  }

  rows.sort((a, b) => a.dayNumber - b.dayNumber);
  return { rows, errors };
}

export function buildCsvImportPreview(
  rows: CsvDayRow[],
  existingDays: DayContent[],
): CsvImportPreviewRow[] {
  return rows.map((row) => {
    const existing = existingDays.find((d) => d.dayNumber === row.dayNumber);
    const previousTitle = existing?.title ?? '';
    const previousMessage = existing?.message ?? '';
    const willChange = row.title !== previousTitle || row.message !== previousMessage;
    return {
      dayNumber: row.dayNumber,
      title: row.title,
      message: row.message,
      previousTitle,
      previousMessage,
      willChange,
    };
  });
}