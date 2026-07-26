import { CalendarDays, Lightbulb, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  getCalendar,
  getDays,
  saveDay,
  updateCalendarTitle,
} from '../lib/calendarService';
import { applyStockAdventure, STOCK_ADVENTURES } from '../lib/stockAdventures';
import { InfoTooltip } from '../components/InfoTooltip';
import { useAuth } from '../context/AuthContext';
import type { Calendar, DayContent, DayDraft, StockAdventure } from '../lib/types';

export function EditorPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [days, setDays] = useState<DayContent[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [draft, setDraft] = useState<DayDraft>({ title: '', message: '' });
  const [stock, setStock] = useState<StockAdventure[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const [cal, dayList] = await Promise.all([getCalendar(slug), getDays(slug)]);
      setCalendar(cal);
      setDays(dayList);
      setStock(STOCK_ADVENTURES);
      const first = dayList.find((d) => d.dayNumber === 1) ?? dayList[0];
      if (first) {
        setSelectedDay(first.dayNumber);
        setDraft({ title: first.title, message: first.message, imageUrl: first.imageUrl, riddlePrompt: first.riddlePrompt });
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
      });
    }
  }, [selectedDay, days]);

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
    await saveDay(slug, user.uid, selectedDay, draft);
    const refreshed = await getDays(slug);
    setDays(refreshed);
    setSaving(false);
    setMessage('Saved!');
  };

  const handleApplyStock = (item: StockAdventure) => {
    const applied = applyStockAdventure(item);
    setDraft((d) => ({ ...d, ...applied }));
  };

  const handleTitleSave = async () => {
    if (!user) return;
    await updateCalendarTitle(slug, user.uid, calendar.title);
    setMessage('Calendar title saved.');
  };

  return (
    <div className="page editor">
      <div className="editor-header">
        <Link to="/app">← Back</Link>
        <h1>
          <Wrench className="heading-icon" strokeWidth={1.75} aria-hidden="true" />
          Edit calendar
        </h1>
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
          <h2>
            <CalendarDays className="heading-icon" strokeWidth={1.75} aria-hidden="true" />
            Days
          </h2>
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
          {message && <p className="success">{message}</p>}
        </form>

        <div className="card stock-panel">
          <h2>
            <Lightbulb className="heading-icon" strokeWidth={1.75} aria-hidden="true" />
            Stock adventures
          </h2>
          <p className="muted">Tap to apply inspiration to Day {selectedDay}.</p>
          <ul className="stock-list">
            {stock.map((item) => (
              <li key={item.id}>
                <button type="button" className="stock-item" onClick={() => handleApplyStock(item)}>
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
