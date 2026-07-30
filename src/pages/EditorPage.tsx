import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import {
  getCalendar,
  getCalendarAdminConfig,
  getDays,
  saveDay,
  updateCalendarSettings,
  updateCalendarTitle,
} from '../lib/calendarService';
import {
  applyStockAdventure,
  collectUsedStockIds,
  rankSuggestions,
  STOCK_ADVENTURES,
} from '../lib/stockAdventures';
import { CalendarSettingsModal } from '../components/CalendarSettingsModal';
import { PreviewDateModal } from '../components/PreviewDateModal';
import { SuggestionsModal } from '../components/SuggestionsModal';
import { isDaySetup } from '../lib/calendarProgress';
import { CALENDAR_TITLE_LONG_WARNING, isCalendarTitleLong } from '../lib/calendarTitle';
import { useAuth } from '../context/AuthContext';
import type { Calendar, CalendarSettingsPatch, DayContent, DayDraft, StockAdventure } from '../lib/types';

type LeaveAction =
  | { type: 'day'; dayNumber: number }
  | { type: 'navigate'; to: string; actionLabel: string };

function draftFromDay(day: DayContent): DayDraft {
  return {
    title: day.title,
    message: day.message,
    sourceStockId: day.sourceStockId,
  };
}

function isDraftDirty(draft: DayDraft, saved: DayContent | undefined): boolean {
  if (!saved) {
    return Boolean(draft.title.trim() || draft.message.trim() || draft.sourceStockId);
  }

  return (
    draft.title !== saved.title ||
    draft.message !== saved.message ||
    (draft.sourceStockId ?? '') !== (saved.sourceStockId ?? '')
  );
}

function leaveActionLabel(action: LeaveAction): string {
  return action.type === 'day' ? `go to day ${action.dayNumber}` : action.actionLabel;
}

export function EditorPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [days, setDays] = useState<DayContent[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [draft, setDraft] = useState<DayDraft>({ title: '', message: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [saveFailed, setSaveFailed] = useState(false);
  const [savePopup, setSavePopup] = useState<{ text: string; nextDay: number | null } | null>(null);
  const [leavePrompt, setLeavePrompt] = useState<LeaveAction | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDayPickerModal, setShowDayPickerModal] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showCalendarSettings, setShowCalendarSettings] = useState(false);
  const [adminUnlockCode, setAdminUnlockCode] = useState('');

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

  const performLeave = (action: LeaveAction) => {
    setLeavePrompt(null);
    if (action.type === 'day') {
      setSelectedDay(action.dayNumber);
      setMessage('');
      setSaveFailed(false);
      setShowDayPickerModal(false);
      return;
    }
    navigate(action.to);
  };

  const requestLeave = (action: LeaveAction) => {
    if (!isDirty) {
      performLeave(action);
      return;
    }
    setLeavePrompt(action);
  };

  const selectDay = (dayNumber: number) => {
    if (dayNumber === selectedDay) {
      setShowDayPickerModal(false);
      return;
    }
    requestLeave({ type: 'day', dayNumber });
  };

  const goToAdjacentDay = (delta: number) => {
    if (days.length === 0) return;
    const sorted = [...days].sort((a, b) => a.dayNumber - b.dayNumber);
    const idx = sorted.findIndex((d) => d.dayNumber === selectedDay);
    const next = sorted[(idx + delta + sorted.length) % sorted.length];
    if (next) selectDay(next.dayNumber);
  };

  const handleNavAway = (
    event: React.MouseEvent<HTMLAnchorElement>,
    to: string,
    actionLabel: string,
  ) => {
    if (!isDirty) return;
    event.preventDefault();
    setLeavePrompt({ type: 'navigate', to, actionLabel });
  };

  const persistCurrentDay = async (): Promise<DayContent[] | null> => {
    if (!user) return null;

    const title = draft.title.trim();
    const adventureMessage = draft.message.trim();
    if (!title || !adventureMessage) {
      setSaveFailed(true);
      setMessage('Title and adventure message are required.');
      setLeavePrompt(null);
      return null;
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
      return refreshed;
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Unknown error';
      setSaveFailed(true);
      setMessage(`Could not save day: ${detail}`);
      setLeavePrompt(null);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || savePopup || leavePrompt) return;

    const refreshed = await persistCurrentDay();
    if (!refreshed) return;

    const nextUnset =
      refreshed.find((d) => d.dayNumber > selectedDay && !isDaySetup(d)) ??
      refreshed.find((d) => d.dayNumber !== selectedDay && !isDaySetup(d));
    const nextDay = nextUnset?.dayNumber ?? null;
    setSavePopup({
      text: nextDay != null ? `Saved! Going to day ${nextDay}.` : 'Saved!',
      nextDay,
    });
  };

  const handleSaveAndLeave = async () => {
    if (!leavePrompt) return;
    const action = leavePrompt;
    const refreshed = await persistCurrentDay();
    if (!refreshed) return;
    performLeave(action);
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

  const handleCalendarSettingsSave = async (settings: CalendarSettingsPatch) => {
    if (!user) return;
    await updateCalendarSettings(slug, user.uid, settings);
    const refreshed = await getCalendar(slug);
    if (refreshed) setCalendar(refreshed);
    if (settings.unlockAnswer) setAdminUnlockCode(settings.unlockAnswer);
    setSaveFailed(false);
    setMessage('Calendar settings saved.');
  };

  const openCalendarSettings = async () => {
    if (!user) return;
    try {
      const adminConfig = await getCalendarAdminConfig(slug, user.uid);
      setAdminUnlockCode(adminConfig?.unlockCode ?? '');
      setShowCalendarSettings(true);
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Unknown error';
      setSaveFailed(true);
      setMessage(`Could not load calendar settings: ${detail}`);
    }
  };

  return (
    <div className="page editor">
      <div className="editor-header">
        <Link to="/app" onClick={(e) => handleNavAway(e, '/app', 'go back')}>
          ← Back
        </Link>
        <h1>Edit calendar</h1>
        <div className="editor-header-actions">
          <button
            type="button"
            className="btn secondary"
            onClick={() => openCalendarSettings()}
          >
            <Settings size={16} strokeWidth={2.2} aria-hidden="true" />
            Settings
          </button>
          <Link
            className="btn secondary"
            to={`/app/c/${slug}/qr`}
            onClick={(e) => handleNavAway(e, `/app/c/${slug}/qr`, 'open QR codes')}
          >
            QR codes
          </Link>
          <button type="button" className="btn secondary" onClick={() => setShowPreviewModal(true)}>
            Preview
          </button>
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
            {isCalendarTitleLong(calendar.title) && (
              <p className="field-warning" role="status">
                {CALENDAR_TITLE_LONG_WARNING}
              </p>
            )}
          </label>
        ) : (
          <div className="inline-field calendar-title-display">
            <h2 className="calendar-title-text">{calendar.title}</h2>
            <button type="button" className="btn secondary" onClick={() => setEditingTitle(true)}>
              Edit Title
            </button>
          </div>
        )}
        {!editingTitle && isCalendarTitleLong(calendar.title) && (
          <p className="field-warning" role="status">
            {CALENDAR_TITLE_LONG_WARNING}
          </p>
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
                  onClick={() => selectDay(day.dayNumber)}
                >
                  {day.dayNumber}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {leavePrompt && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-prompt-title"
        >
          <div className="modal card leave-prompt">
            <h2 id="leave-prompt-title">Unsaved changes</h2>
            <p className="muted">
              You have unsaved changes on this day. What would you like to do before you{' '}
              {leaveActionLabel(leavePrompt)}?
            </p>
            <div className="leave-prompt-actions">
              <button
                type="button"
                className="btn primary"
                disabled={saving || !canSave}
                onClick={handleSaveAndLeave}
              >
                {saving ? 'Saving…' : `Save and ${leaveActionLabel(leavePrompt)}`}
              </button>
              <button
                type="button"
                className="btn secondary"
                disabled={saving}
                onClick={() => performLeave(leavePrompt)}
              >
                Leave without saving
              </button>
              <button
                type="button"
                className="btn secondary"
                disabled={saving}
                onClick={() => setLeavePrompt(null)}
              >
                Stay
              </button>
            </div>
            {!canSave && (
              <p className="error leave-prompt-hint">
                Add a title and adventure message to use Save and {leaveActionLabel(leavePrompt)}.
              </p>
            )}
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

      {showPreviewModal && (
        <PreviewDateModal
          slug={slug}
          title={calendar.title}
          year={calendar.year}
          onClose={() => setShowPreviewModal(false)}
        />
      )}

      {showCalendarSettings && (
        <CalendarSettingsModal
          calendar={calendar}
          initialUnlockCode={adminUnlockCode}
          onSave={handleCalendarSettingsSave}
          onClose={() => setShowCalendarSettings(false)}
        />
      )}
    </div>
  );
}
