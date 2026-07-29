import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PreviewDateModal } from '../components/PreviewDateModal';
import { createCalendar, deleteCalendar, getDays, listCalendars } from '../lib/calendarService';
import {
  getSetupProgress,
  getSetupStatus,
  getSetupStatusLabel,
} from '../lib/calendarProgress';
import { CALENDAR_TITLE_LONG_WARNING, isCalendarTitleLong } from '../lib/calendarTitle';
import { useAuth } from '../context/AuthContext';
import type { Calendar } from '../lib/types';

type CalendarProgress = {
  setupCount: number;
  total: number;
  percent: number;
  status: ReturnType<typeof getSetupStatus>;
};

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [progressBySlug, setProgressBySlug] = useState<Record<string, CalendarProgress>>({});
  const [title, setTitle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [previewCalendar, setPreviewCalendar] = useState<Calendar | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const items = await listCalendars(user.uid);
    const progressEntries = await Promise.all(
      items.map(async (cal) => {
        const days = await getDays(cal.slug);
        const { setupCount, total, percent } = getSetupProgress(days);
        const status = getSetupStatus(percent);
        return [cal.slug, { setupCount, total, percent, status }] as const;
      }),
    );
    setCalendars(items);
    setProgressBySlug(Object.fromEntries(progressEntries));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;
    setCreating(true);
    const calendar = await createCalendar(user.uid, title.trim(), year);
    setTitle('');
    setCreating(false);
    navigate(`/app/c/${calendar.slug}/edit`);
  };

  const handleDelete = async (slug: string) => {
    if (!user || !confirm('Delete this calendar? This cannot be undone.')) return;
    await deleteCalendar(slug, user.uid);
    await load();
  };

  const createExpanded = !loading && (calendars.length === 0 || showCreate);

  return (
    <div className="page dashboard">
      <div className="dashboard-header">
        <h1>My Calendars</h1>
        {!loading && calendars.length > 0 && (
          <button
            type="button"
            className="btn secondary"
            onClick={() => setShowCreate((open) => !open)}
            aria-expanded={showCreate}
          >
            <Plus className="btn-icon" strokeWidth={2} aria-hidden="true" />
            Add calendar
          </button>
        )}
      </div>

      {createExpanded && (
        <form className="card create-form" onSubmit={handleCreate}>
          <h2>Create a new calendar</h2>
          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Smith Family 2026" required />
            {isCalendarTitleLong(title) && (
              <p className="field-warning" role="status">
                {CALENDAR_TITLE_LONG_WARNING}
              </p>
            )}
          </label>
          <label>
            Year
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} min={2020} max={2100} />
          </label>
          <button type="submit" className="btn primary" disabled={creating}>
            {creating ? 'Creating…' : 'Create calendar'}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading calendars…</p>
      ) : calendars.length === 0 ? (
        <p className="muted">No calendars yet. Create your first one above!</p>
      ) : (
        <ul className="calendar-list">
          {calendars.map((cal) => {
            const progress = progressBySlug[cal.slug];
            return (
            <li
              key={cal.slug}
              className={`card calendar-item${progress?.status === 'complete' ? ' calendar-item-complete' : ''}`}
            >
              <div className="calendar-item-main">
                <h3>{cal.title}</h3>
                <p className="muted">{cal.year}</p>
                {progress && (
                  <div className="calendar-progress">
                    <div className="calendar-progress-header">
                      <span className={`calendar-status calendar-status-${progress.status}`}>
                        {getSetupStatusLabel(progress.status)}
                      </span>
                      <span className="calendar-progress-label">
                        {progress.setupCount} of {progress.total} days · {progress.percent}%
                      </span>
                    </div>
                    <div
                      className="calendar-progress-bar"
                      role="progressbar"
                      aria-valuenow={progress.percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${cal.title} setup progress`}
                    >
                      <span
                        className="calendar-progress-fill"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="calendar-actions">
                <Link className="btn secondary" to={`/app/c/${cal.slug}/edit`}>
                  Edit
                </Link>
                <Link className="btn secondary" to={`/app/c/${cal.slug}/qr`}>
                  QR codes
                </Link>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setPreviewCalendar(cal)}
                >
                  Preview
                </button>
                <button type="button" className="btn danger" onClick={() => handleDelete(cal.slug)}>
                  Delete
                </button>
              </div>
            </li>
            );
          })}
        </ul>
      )}

      {previewCalendar && (
        <PreviewDateModal
          slug={previewCalendar.slug}
          title={previewCalendar.title}
          year={previewCalendar.year}
          onClose={() => setPreviewCalendar(null)}
        />
      )}
    </div>
  );
}
