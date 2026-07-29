import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  decemberPreviewDate,
  parsePreviewDate,
  previewDayFromDate,
} from '../lib/previewDate';
import { buildCalendarUrl } from '../lib/tokens';

interface PreviewDateModalProps {
  slug: string;
  title: string;
  year: number;
  onClose: () => void;
}

export function PreviewDateModal({ slug, title, year, onClose }: PreviewDateModalProps) {
  const [searchParams] = useSearchParams();
  const currentPreview = parsePreviewDate(`?${searchParams.toString()}`);
  const currentDay = previewDayFromDate(currentPreview);
  const [mode, setMode] = useState<'today' | 'simulate'>(currentDay ? 'simulate' : 'today');
  const [day, setDay] = useState(currentDay ?? 10);

  const handleOpen = () => {
    const previewDate = mode === 'simulate' ? decemberPreviewDate(year, day) : null;
    window.open(buildCalendarUrl(slug, window.location.origin, previewDate), '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="preview-date-title">
      <div className="modal card preview-date-modal">
        <h2 id="preview-date-title">Preview calendar</h2>
        <p className="muted preview-date-intro">
          Choose how <strong>{title}</strong> should behave when you preview it — simulate a December date or use
          today&apos;s real date.
        </p>

        <fieldset className="preview-date-options">
          <legend className="sr-only">Preview date mode</legend>
          <label className="preview-date-option">
            <input
              type="radio"
              name="preview-mode"
              value="today"
              checked={mode === 'today'}
              onChange={() => setMode('today')}
            />
            <span>
              <strong>Use today&apos;s date</strong>
              <span className="muted">See the calendar as recipients see it right now.</span>
            </span>
          </label>
          <label className="preview-date-option">
            <input
              type="radio"
              name="preview-mode"
              value="simulate"
              checked={mode === 'simulate'}
              onChange={() => setMode('simulate')}
            />
            <span>
              <strong>Simulate a date</strong>
              <span className="muted">Pretend it&apos;s a specific day in December.</span>
            </span>
          </label>
        </fieldset>

        {mode === 'simulate' && (
          <label className="preview-date-day-picker">
            Simulate December
            <select value={day} onChange={(e) => setDay(Number(e.target.value))}>
              {Array.from({ length: 24 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            , {year}
          </label>
        )}

        <div className="modal-actions">
          <button type="button" className="btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn primary" onClick={handleOpen}>
            Open preview
          </button>
        </div>
      </div>
    </div>
  );
}
