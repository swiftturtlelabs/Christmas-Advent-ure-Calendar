import { useMemo, useState } from 'react';
import {
  CSV_IMPORT_HELP,
  buildCsvImportPreview,
  parseDaysCsv,
  type CsvDayRow,
} from '../lib/csvImport';
import type { DayContent } from '../lib/types';

interface CsvImportModalProps {
  days: DayContent[];
  applying: boolean;
  onApply: (rows: CsvDayRow[]) => Promise<void>;
  onClose: () => void;
}

export function CsvImportModal({ days, applying, onApply, onClose }: CsvImportModalProps) {
  const [text, setText] = useState('');
  const [fileError, setFileError] = useState('');

  const parsed = useMemo(() => parseDaysCsv(text), [text]);
  const preview = useMemo(
    () => buildCsvImportPreview(parsed.rows, days),
    [parsed.rows, days],
  );
  const changingCount = preview.filter((row) => row.willChange).length;
  const canApply = parsed.rows.length > 0 && parsed.errors.length === 0 && changingCount > 0;

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setFileError('');
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setText(result);
    };
    reader.onerror = () => setFileError('Could not read that file.');
    reader.readAsText(file);
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="csv-import-title"
      onClick={onClose}
    >
      <div className="modal card csv-import-modal" onClick={(e) => e.stopPropagation()}>
        <h2 id="csv-import-title">Import days from CSV</h2>
        <p className="muted csv-import-intro">{CSV_IMPORT_HELP}</p>

        <label className="csv-import-file">
          Choose file
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
        {fileError && <p className="error">{fileError}</p>}

        <label>
          Or paste CSV
          <textarea
            className="csv-import-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder={`day,title,message\n1,Hot cocoa night,Make cocoa together.`}
          />
        </label>

        {parsed.errors.length > 0 && (
          <ul className="csv-import-errors">
            {parsed.errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        )}

        {preview.length > 0 && parsed.errors.length === 0 && (
          <div className="csv-import-preview">
            <p className="muted">
              {changingCount} of {preview.length} listed {preview.length === 1 ? 'day' : 'days'} will change.
              Other days are left as-is.
            </p>
            <ul className="csv-import-preview-list">
              {preview.map((row) => (
                <li key={row.dayNumber} className={row.willChange ? 'will-change' : 'no-change'}>
                  <div className="csv-import-preview-day">
                    <strong>Day {row.dayNumber}</strong>
                    {!row.willChange && <span className="muted csv-import-preview-badge">No change</span>}
                  </div>
                  <p className="csv-import-preview-field">
                    <span className="csv-import-preview-label">Title</span>
                    {row.title.trim() || <span className="muted">(empty)</span>}
                  </p>
                  <p className="csv-import-preview-field csv-import-preview-message">
                    <span className="csv-import-preview-label">Message</span>
                    {row.message.trim() ? (
                      row.message.trim()
                    ) : (
                      <span className="muted">(empty)</span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn secondary" onClick={onClose} disabled={applying}>
            Cancel
          </button>
          <button
            type="button"
            className="btn primary"
            disabled={!canApply || applying}
            onClick={() => onApply(parsed.rows)}
          >
            {applying ? 'Importing…' : `Import ${changingCount} ${changingCount === 1 ? 'day' : 'days'}`}
          </button>
        </div>
      </div>
    </div>
  );
}