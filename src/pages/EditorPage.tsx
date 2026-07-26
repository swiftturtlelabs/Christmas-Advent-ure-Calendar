import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const [cal, dayList] = await Promise.all([getCalendar(slug), getDays(slug)]);
      setCalendar(cal);
      setDays(dayList);
      const first = dayList.find((d) => d.dayNumber === 1) ?? dayList[0];
      if (first) {
        setSelectedDay(first.dayNumber);
        setDraft({
          title: first.title,
          message: first.message,
          imageUrl: first.imageUrl,
          riddlePrompt: first.riddlePrompt,
          sourceStockId: first.sourceStockId,
        });
      }
    })();
  }, [slug]);

  useEffect(() => {
    const day = days.find((d) => d.dayNumber === selectedDay);
    if (day) {
      setDraft({
        title: day.title,
        message: day.message,
        imageUrl: day.imageUrl,
        riddlePrompt: day.riddlePrompt,
        sourceStockId: day.sourceStockId,
      });
    }
  }, [selectedDay, days]);

  const usedStockIds = useMemo(() => collectUsedStockIds(days), [days]);
  const rankedSuggestions = useMemo(
    () => rankSuggestions(STOCK_ADVENTURES, selectedDay, usedStockIds),
    [selectedDay, usedStockIds],
  );

  if (!slug || !calendar) {
    return <div className="page loading">Loading editor…</div>;
  }

  if (user && calendar.ownerUid !== user.uid) {
    return <div className="page">You do not have access to edit this calendar.</div>;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage('');
    setSaveFailed(false);
    try {
      await saveDay(slug, user.uid, selectedDay, draft);
      const refreshed = await getDays(slug);
      setDays(refreshed);
      setMessage('Saved!');
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
        <Link to="/app">← Back</Link>
        <h1>Edit calendar</h1>
        <div className="editor-header-actions">
          <Link className="btn secondary" to={`/app/c/${slug}/qr`}>
            QR codes
          </Link>
          <Link className="btn secondary" to={`/c/${slug}`} target="_blank">
            Preview
          </Link>
        </div>
      </div>

      <div className="card">
        <label>
          Calendar title
          <div className="inline-field">
            <input
              value={calendar.title}
              onChange={(e) => setCalendar({ ...calendar, title: e.target.value })}
            />
            <button type="button" className="btn secondary" onClick={handleTitleSave}>
              Save title
            </button>
          </div>
        </label>
      </div>

      <div className="editor-grid">
        <div className="day-picker card">
          <h2>Days</h2>
          <div className="day-picker-grid">
            {days.map((day) => (
              <button
                key={day.dayNumber}
                type="button"
                className={`day-pick ${selectedDay === day.dayNumber ? 'active' : ''} ${day.message ? 'filled' : ''}`}
                onClick={() => setSelectedDay(day.dayNumber)}
              >
                {day.dayNumber}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn primary get-suggestions-btn"
            onClick={() => setShowSuggestions(true)}
          >
            Get suggestions
          </button>
        </div>

        <form className="card day-form" onSubmit={handleSave}>
          <h2>Day {selectedDay}</h2>
          <label>
            Title
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} required />
          </label>
          <label>
            Adventure message
            <textarea
              value={draft.message}
              onChange={(e) => setDraft({ ...draft, message: e.target.value })}
              rows={5}
              placeholder="Describe today's Christmas adventure…"
            />
          </label>
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
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save day'}
          </button>
          {message && <p className={saveFailed ? 'error' : 'success'}>{message}</p>}
        </form>
      </div>

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
