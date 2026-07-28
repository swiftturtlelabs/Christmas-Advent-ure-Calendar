import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getCalendar,
  getDays,
  saveDay,
  updateCalendarTitle,
} from '../lib/calendarService';
import {
  applyStockAdventure,
  collectUsedStockIds,
  rankSuggestions,
  STOCK_ADVENTURES,
} from '../lib/stockAdventures';
import { InfoTooltip } from '../components/InfoTooltip';
import { SuggestionsModal } from '../components/SuggestionsModal';
import { useAuth } from '../context/AuthContext';
import type { Calendar, DayContent, DayDraft, StockAdventure } from '../lib/types';

function draftFromDay(day: DayContent): DayDraft {
  return {
    title: day.title,
    message: day.message,
    imageUrl: day.imageUrl,
    riddlePrompt: day.riddlePrompt,
    sourceStockId: day.sourceStockId,
  };
}

function isDaySetup(day: { title?: string; message?: string }): boolean {
  return Boolean(day.title?.trim() && day.message?.trim());
}

function isDraftDirty(draft: DayDraft, saved: DayContent | undefined): boolean {
  if (!saved) {
    return Boolean(
      draft.title.trim() ||
        draft.message.trim() ||
        draft.imageUrl?.trim() ||
        draft.riddlePrompt?.trim() ||
        draft.answer?.trim() ||
        draft.sourceStockId,
    );
  }

  return (
    draft.title !== saved.title ||
    draft.message !== saved.message ||
    (draft.imageUrl ?? '').trim() !== (saved.imageUrl ?? '').trim() ||
    (draft.riddlePrompt ?? '').trim() !== (saved.riddlePrompt ?? '').trim() ||
    (draft.sourceStockId ?? '') !== (saved.sourceStockId ?? '') ||
    Boolean(draft.answer?.trim())
  );
}

export function EditorPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [days, setDays] = useState<DayContent[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [draft, setDraft] = useState<DayDraft>({ title: '', message: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [saveFailed, setSaveFailed] = useState(false);
  const [savePopup, setSavePopup] = useState<{ text: string; nextDay: number | null } | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDayPickerModal, setShowDayPickerModal] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [showMoreFields, setShowMoreFields] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const [cal, dayList] = await Promise.all([getCalendar(slug), getDays(slug)]);
      setCalendar(cal);
      setDays(dayList);
      const earliestUnset = dayList.find((d) => !isDaySetup(d));
      const initial = earliestUnset ?? dayList.find((d) => d.dayNumber === 1) ?? dayList[0];
      if (initial) {
        setSelectedDay(initial.dayNumber);
        setDraft(draftFromDay(initial));
      }
    })();
  }, [slug]);

  useEffect(() => {
    const day = days.find((d) => d.dayNumber === selectedDay);
    if (day) {
      setDraft(draftFromDay(day));
    }
    setShowMoreFields(false);
  }, [selectedDay, days]);

  useEffect(() => {
    if (!savePopup) return;
    const timer = window.setTimeout(() => {
      const nextDay = savePopup.nextDay;
      setSavePopup(null);
      if (nextDay != null) {
        setSelectedDay(nextDay);
      }
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [savePopup]);

  const savedDay = useMemo(
    () => days.find((d) => d.dayNumber === selectedDay),
    [days, selectedDay],
  );
  const isDirty = useMemo(() => isDraftDirty(draft, savedDay), [draft, savedDay]);

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const usedStockIds = useMemo(() => collectUsedStockIds(days), [days]);
  const rankedSuggestions = useMemo(
    () => rankSuggestions(STOCK_ADVENTURES, selectedDay, usedStockIds),
    [selectedDay, usedStockIds],
  );
  const selectedIsSetup = isDaySetup(savedDay ?? { title: '', message: '' });
  const canSave = Boolean(draft.title.trim() && draft.message.trim());

  if (!slug || !calendar) {
    return <div className="page loading">Loading editor…</div>;
  }

  if (user && calendar.ownerUid !== user.uid) {
    return <div className="page">You do not have access to edit this calendar.</div>;
  }

  const confirmLeaveDay = () => {
    if (!isDirty) return true;
    return window.confirm('You have unsaved changes on this day. Leave without saving?');
  };

  const selectDay = (dayNumber: number): boolean => {
    if (dayNumber === selectedDay) return true;
    if (!confirmLeaveDay()) return false;
    setSelectedDay(dayNumber);
    setMessage('');
    setSaveFailed(false);
    return true;
  };

  const goToAdjacentDay = (delta: number) => {
    if (days.length === 0) return;
    const sorted = [...days].sort((a, b) => a.dayNumber - b.dayNumber);
    const idx = sorted.findIndex((d) => d.dayNumber === selectedDay);
    const next = sorted[(idx + delta + sorted.length) % sorted.length];
    if (next) selectDay(next.dayNumber);
  };

  const handleNavAway = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!confirmLeaveDay()) {
      event.preventDefault();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || savePopup) return;

    const title = draft.title.trim();
    const adventureMessage = draft.message.trim();
    if (!title || !adventureMessage) {
      setSaveFailed(true);
      setMessage('Title and adventure message are required.');
      return;
    }

    setSaving(true);
    setMessage('');
    setSaveFailed(false);
    try {
      await saveDay(slug, user.uid, selectedDay, {
        ...draft,
        title,
        message: adventureMessage,
      });
      const refreshed = await getDays(slug);
      setDays(refreshed);
      const nextUnset =
        refreshed.find((d) => d.dayNumber > selectedDay && !isDaySetup(d)) ??
        refreshed.find((d) => d.dayNumber !== selectedDay && !isDaySetup(d));
      const nextDay = nextUnset?.dayNumber ?? null;
      setSavePopup({
        text: nextDay != null ? `Saved! Going to day ${nextDay}.` : 'Saved!',
        nextDay,
      });
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Unknown error';
      setSaveFailed(true);
      setMessage(`Could not save day: ${detail}`);
    } finally {
      setSaving(false);
    }
  };

  const handleApplyStock = (item: StockAdventure) => {
    const applied = applyStockAdventure(item);
    setDraft((d) => ({ ...d, ...applied }));
    setShowSuggestions(false);
  };

  const handleTitleSave = async () => {
    if (!user) return;
    try {
      await updateCalendarTitle(slug, user.uid, calendar.title);
      setEditingTitle(false);
      setSaveFailed(false);
      setMessage('Calendar title saved.');
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Unknown error';
      setSaveFailed(true);
      setMessage(`Could not save title: ${detail}`);
    }
  };

  return (
    <div className="page editor">
      <div className="editor-header">
        <Link to="/app" onClick={handleNavAway}>
          ← Back
        </Link>
        <h1>Edit calendar</h1>
        <div className="editor-header-actions">
          <Link className="btn secondary" to={`/app/c/${slug}/qr`} onClick={handleNavAway}>
            QR codes
          </Link>
          <Link className="btn secondary" to={`/c/${slug}`} target="_blank">
            Preview
          </Link>
        </div>
      </div>

      <div className="card calendar-title-card">
        {editingTitle ? (
          <label>
            Calendar title
            <div className="inline-field">
              <input
                value={calendar.title}
                onChange={(e) => setCalendar({ ...calendar, title: e.target.value })}
                autoFocus
              />
              <button type="button" className="btn secondary" onClick={handleTitleSave}>
                Save
              </button>
            </div>
          </label>
        ) : (
          <div className="inline-field calendar-title-display">
            <h2 className="calendar-title-text">{calendar.title}</h2>
            <button type="button" className="btn secondary" onClick={() => setEditingTitle(true)}>
              Edit Title
            </button>
          </div>
        )}
      </div>

      <div className="editor-grid">
        <div className="day-picker card">
          <h2>Days</h2>
          <div className="day-picker-grid">
            {days.map((day) => (
              <button
                key={day.dayNumber}
                type="button"
                className={`day-pick ${selectedDay === day.dayNumber ? 'active' : ''} ${isDaySetup(day) ? 'filled' : ''}`}
                onClick={() => selectDay(day.dayNumber)}
              >
                {day.dayNumber}
              </button>
            ))}
          </div>
        </div>

        <form className="card day-form" onSubmit={handleSave}>
          <div className="day-form-header">
            <div className="day-nav-row">
              <div className="day-stepper">
                <button
                  type="button"
                  className="day-stepper-btn"
                  aria-label="Previous day"
                  onClick={() => goToAdjacentDay(-1)}
                >
                  <ChevronLeft size={22} strokeWidth={2.4} />
                </button>
                <h2 className={`day-form-heading ${selectedIsSetup ? 'filled' : 'unset'}`}>
                  Day {selectedDay}
                </h2>
                <button
                  type="button"
                  className="day-stepper-btn"
                  aria-label="Next day"
                  onClick={() => goToAdjacentDay(1)}
                >
                  <ChevronRight size={22} strokeWidth={2.4} />
                </button>
              </div>
              <button
                type="button"
                className="day-calendar-btn"
                aria-label="Open day picker"
                onClick={() => setShowDayPickerModal(true)}
              >
                <CalendarDays size={22} strokeWidth={2.2} />
              </button>
            </div>
            <button
              type="button"
              className="btn secondary get-suggestions-btn"
              onClick={() => setShowSuggestions(true)}
            >
              Get suggestions
            </button>
          </div>

          <label>
            Title
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              required
            />
          </label>
          <label>
            Adventure message
            <textarea
              value={draft.message}
              onChange={(e) => setDraft({ ...draft, message: e.target.value })}
              rows={5}
              placeholder="Describe today's Christmas adventure…"
              required
            />
          </label>
          <div className="more-fields">
            <button
              type="button"
              className="more-fields-toggle"
              aria-expanded={showMoreFields}
              onClick={() => setShowMoreFields((open) => !open)}
            >
              <ChevronDown
                size={18}
                strokeWidth={2.4}
                className={`more-fields-chevron ${showMoreFields ? 'open' : ''}`}
              />
              {showMoreFields ? 'Less' : 'More'}
            </button>
            {showMoreFields && (
              <div className="more-fields-body">
                <label>
                  Image URL (optional)
                  <input
                    value={draft.imageUrl ?? ''}
                    onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })}
                    placeholder="https://…"
                  />
                </label>
                <label>
                  <span className="label-row">
                    Early-unlock riddle prompt (optional)
                    <InfoTooltip text="If you set a prompt and answer, visitors can solve this riddle to unlock the day early, before its calendar date arrives. Leave both blank to keep the day locked until its date." />
                  </span>
                  <input
                    value={draft.riddlePrompt ?? ''}
                    onChange={(e) => setDraft({ ...draft, riddlePrompt: e.target.value })}
                    placeholder="What do reindeer say?"
                  />
                </label>
                <label>
                  Riddle answer (optional — leave blank to keep current)
                  <input
                    value={draft.answer ?? ''}
                    onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
                    placeholder="Set a new answer to change it"
                  />
                </label>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="btn primary"
            disabled={saving || Boolean(savePopup) || !canSave}
          >
            {saving ? 'Saving…' : 'Save day'}
          </button>
          {message && <p className={saveFailed ? 'error' : 'success'}>{message}</p>}
        </form>
      </div>

      {savePopup && (
        <div className="modal-backdrop" role="status" aria-live="polite" aria-busy="true">
          <div className="modal card save-popup">
            <p className="save-popup-text">{savePopup.text}</p>
            <div className="save-popup-forward" aria-hidden="true">
              <span className="save-popup-chevrons">
                <ChevronRight className="save-popup-chevron" size={28} strokeWidth={2.6} />
                <ChevronRight className="save-popup-chevron" size={28} strokeWidth={2.6} />
                <ChevronRight className="save-popup-chevron" size={28} strokeWidth={2.6} />
              </span>
            </div>
          </div>
        </div>
      )}

      {showDayPickerModal && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="day-picker-modal-title"
          onClick={() => setShowDayPickerModal(false)}
        >
          <div className="modal card day-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="day-picker-modal-header">
              <h2 id="day-picker-modal-title">Days</h2>
              <button type="button" className="btn secondary" onClick={() => setShowDayPickerModal(false)}>
                Close
              </button>
            </div>
            <div className="day-picker-grid">
              {days.map((day) => (
                <button
                  key={day.dayNumber}
                  type="button"
                  className={`day-pick ${selectedDay === day.dayNumber ? 'active' : ''} ${isDaySetup(day) ? 'filled' : ''}`}
                  onClick={() => {
                    if (selectDay(day.dayNumber)) {
                      setShowDayPickerModal(false);
                    }
                  }}
                >
                  {day.dayNumber}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showSuggestions && (
        <SuggestionsModal
          dayNumber={selectedDay}
          suggestions={rankedSuggestions}
          usedIds={usedStockIds}
          onSelect={handleApplyStock}
          onClose={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}
