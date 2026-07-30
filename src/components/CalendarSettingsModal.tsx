import { useState } from 'react';
import { InfoTooltip } from './InfoTooltip';
import { calendarLocksFutureDates } from '../lib/calendarLock';
import type { CalendarSettingsPatch } from '../lib/types';
import type { Calendar } from '../lib/types';

interface CalendarSettingsModalProps {
  calendar: Calendar;
  onSave: (settings: CalendarSettingsPatch) => Promise<void>;
  onClose: () => void;
}

export function CalendarSettingsModal({ calendar, onSave, onClose }: CalendarSettingsModalProps) {
  const [lockFutureDates, setLockFutureDates] = useState(calendarLocksFutureDates(calendar));
  const [unlockPrompt, setUnlockPrompt] = useState(calendar.unlockPrompt ?? '');
  const [unlockAnswer, setUnlockAnswer] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const hasExistingCode = Boolean(calendar.unlockAnswerHash);

  const handleSave = async () => {
    if (lockFutureDates && !unlockAnswer.trim() && !hasExistingCode) {
      setError('Enter a code to lock future dates.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onSave({
        lockMode: lockFutureDates ? 'date_locked' : 'open',
        unlockPrompt,
        unlockAnswer: unlockAnswer.trim() || undefined,
      });
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
              <InfoTooltip text="By default all days are open. Turn on locking to keep future days hidden until their December date. You can optionally let visitors unlock early with a shared code." />
            </span>
          </h3>

          <label className="calendar-settings-toggle">
            <input
              type="checkbox"
              checked={lockFutureDates}
              onChange={(e) => setLockFutureDates(e.target.checked)}
            />
            <span>
              <strong>Lock future dates</strong>
              <span className="muted">
                Days stay closed until their calendar date in December.
              </span>
            </span>
          </label>

          {lockFutureDates && (
            <div className="calendar-settings-lock-fields">
              <label>
                Question or hint (optional)
                <input
                  value={unlockPrompt}
                  onChange={(e) => setUnlockPrompt(e.target.value)}
                  placeholder="What is the family codeword?"
                />
              </label>
              <label>
                Code
                <input
                  value={unlockAnswer}
                  onChange={(e) => setUnlockAnswer(e.target.value)}
                  placeholder={
                    hasExistingCode ? 'Leave blank to keep current code' : 'Required to lock future dates'
                  }
                  autoComplete="off"
                />
              </label>
              <p className="muted calendar-settings-hint">
                Visitors who know the code can open locked days early. The question is optional — leave it blank to
                show a generic unlock prompt.
              </p>
            </div>
          )}
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
