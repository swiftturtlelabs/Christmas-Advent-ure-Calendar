import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Snowfall } from '../components/Snowfall';
import { getDayByToken } from '../lib/calendarService';
import { isDayUnlocked } from '../lib/dateLock';
import type { Calendar, DayContent } from '../lib/types';

export function PublicDayPage() {
  const { token } = useParams<{ token: string }>();
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [day, setDay] = useState<DayContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const result = await getDayByToken(token);
      if (result) {
        setCalendar(result.calendar);
        setDay(result.day);
      }
      setLoading(false);
    })();
  }, [token]);

  if (loading) {
    return <div className="page loading public">Loading adventure…</div>;
  }

  if (!calendar || !day) {
    return <div className="page public">Adventure not found.</div>;
  }

  const unlocked = isDayUnlocked(day.dayNumber, new Date(), calendar.year);
  const earlyKey = `early-unlock:${calendar.slug}`;
  const earlyUnlocked = (JSON.parse(localStorage.getItem(earlyKey) ?? '[]') as number[]).includes(day.dayNumber);

  if (!unlocked && !earlyUnlocked) {
    return (
      <div className="page public-day locked-view">
        <Snowfall />
        <div className="card day-card">
          <h1>Day {day.dayNumber}</h1>
          <p>Not yet! This adventure opens on December {day.dayNumber}.</p>
          <Link to={`/c/${calendar.slug}`}>Back to calendar</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page public-day">
      <Snowfall />
      <div className="day-scene card">
        <img
          className="tree-image"
          src="/tree.jpg"
          alt="Christmas tree"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="day-overlay">
          <h1>{day.title || `Day ${day.dayNumber}`}</h1>
          <p className="day-message">{day.message || 'Your adventure awaits!'}</p>
          {day.imageUrl && <img className="day-custom-image" src={day.imageUrl} alt="" />}
        </div>
      </div>
      <p className="back-link">
        <Link to={`/c/${calendar.slug}`}>← Back to all days</Link>
      </p>
    </div>
  );
}
