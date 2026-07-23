import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createCalendar, deleteCalendar, listCalendars } from '../lib/calendarService';
import { useAuth } from '../context/AuthContext';
import type { Calendar } from '../lib/types';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [title, setTitle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const items = await listCalendars(user.uid);
    setCalendars(items);
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

  return (
    <div className="page dashboard">
      <h1>🎁 My Calendars</h1>

      <form className="card create-form" onSubmit={handleCreate}>
        <h2>✨ Create a new calendar</h2>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Smith Family 2026" required />
        </label>
        <label>
          Year
          <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} min={2020} max={2100} />
        </label>
        <button type="submit" className="btn primary" disabled={creating}>
          {creating ? 'Creating…' : 'Create calendar'}
        </button>
      </form>

      {loading ? (
        <p>Loading calendars…</p>
      ) : calendars.length === 0 ? (
        <p className="muted">No calendars yet. Create your first one above!</p>
      ) : (
        <ul className="calendar-list">
          {calendars.map((cal) => (
            <li key={cal.slug} className="card calendar-item">
              <div>
                <h3>{cal.title}</h3>
                <p className="muted">{cal.year}</p>
              </div>
              <div className="calendar-actions">
                <Link className="btn secondary" to={`/app/c/${cal.slug}/edit`}>
                  ✏️ Edit
                </Link>
                <Link className="btn secondary" to={`/app/c/${cal.slug}/qr`}>
                  📱 QR codes
                </Link>
                <Link className="btn secondary" to={`/c/${cal.slug}`} target="_blank">
                  👀 Preview
                </Link>
                <button type="button" className="btn danger" onClick={() => handleDelete(cal.slug)}>
                  🗑️ Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
