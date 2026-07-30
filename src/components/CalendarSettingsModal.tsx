import { useState } from 'react';
import { InfoTooltip } from './InfoTooltip';
import type { CalendarLockMode } from '../lib/calendarLock';
import type { Calendar } from '../lib/types';

export interface CalendarSettingsDraft {
  lockMode: CalendarLockMode;
}

interface CalendarSettingsModalProps {
  calendar: Calendar;
  onSave: (settings: CalendarSettingsDraft) => Promise<void>;
  onClose: () => void;
}

export function CalendarSettingsModal({ calendar, onSave, onClose }: CalendarSettingsModalProps) {
  const [lockMode, setLockMode] = useState<CalendarLockMode>(calendar.lockMode ?? 'date_riddle');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await onSave({ lockMode });
      onClose();
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Unknown error';
      setError(`Could not save settings: ${detail}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-settings-title"
      onClick={onClose}
    >
      <div className="modal card calendar-settings-modal" onClick={(e) => e.stopPropagation()}>
        <h2 id="calendar-settings-title">Calendar settings</h2>
        <p className="muted calendar-settings-intro">
          These settings apply to <strong>{calendar.title}</strong> and every day in the calendar.
        </p>

        <section className="calendar-settings-section" aria-labelledby="calendar-settings-lock-heading">
          <h3 id="calendar-settings-lock-heading" className="calendar-settings-section-title">
            <span className="label-row">
              Day locking
              <InfoTooltip text="Visitors see days unlock on their calendar date in December. When early-unlock riddles are enabled, you can add a riddle to any individual day so visitors can open it early." />
            </span>
          </h3>

          <fieldset className="calendar-settings-options">
            <legend className="sr-only">Early-unlock riddles</legend>
            <label className="calendar-settings-option">
              <input
                type="radio"
                name="lock-mode"
                value="date_riddle"
                checked={lockMode === 'date_riddle'}
                onChange={() => setLockMode('date_riddle')}
              />
              <span>
                <strong>Date lock with optional riddles</strong>
                <span className="muted">
                  Days stay locked until their date. Per-day riddles can unlock them early.
                </span>
              </span>
            </label>
            <label className="calendar-settings-option">
              <input
                type="radio"
                name="lock-mode"
                value="date_only"
                checked={lockMode === 'date_only'}
                onChange={() => setLockMode('date_only')}
              />
              <span>
                <strong>Date lock only</strong>
                <span className="muted">
                  Days unlock only on their calendar date. Riddles are not offered to visitors.
                </span>
              </span>
            </label>
          </fieldset>
        </section>

        {error && <p className="error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="btn primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
