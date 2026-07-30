import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { DayScene } from '../components/DayScene';
import { PhoneFrame } from '../components/PhoneFrame';
import { Snowfall } from '../components/Snowfall';
import { getAppNow } from '../lib/appDate';
import { getDayByToken } from '../lib/calendarService';
import { calendarHasEarlyUnlock, calendarLocksFutureDates } from '../lib/calendarLock';
import { isDayUnlocked } from '../lib/dateLock';
import { parsePreviewDate, withPreviewDate } from '../lib/previewDate';
import type { Calendar, DayContent } from '../lib/types';

function framed(children: ReactNode) {
  return <PhoneFrame>{children}</PhoneFrame>;
}

export function PublicDayPage() {
  const { token } = useParams<{ token: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const previewDate = parsePreviewDate(`?${searchParams.toString()}`);
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
    return framed(<div className="page loading public">Loading adventure…</div>);
  }

  if (!calendar || !day) {
    return framed(<div className="page public">Adventure not found.</div>);
  }

  const lockFutureDates = calendarLocksFutureDates(calendar);
  const unlocked = isDayUnlocked(day.dayNumber, getAppNow(previewDate), calendar.year);
  const earlyUnlocked = (location.state as { riddleUnlocked?: boolean } | null)?.riddleUnlocked === true;
  const canView =
    !lockFutureDates ||
    unlocked ||
    (calendarHasEarlyUnlock(calendar) && earlyUnlocked);
  const calendarPath = withPreviewDate(`/c/${calendar.slug}`, previewDate);

  if (!canView) {
    return framed(
      <div className="page public-day locked-view">
        <Snowfall />
        <div className="card day-card">
          <h1>Day {day.dayNumber}</h1>
          <p>Not yet! This adventure opens on December {day.dayNumber}.</p>
          <Link to={calendarPath}>← Back to calendar</Link>
        </div>
      </div>,
    );
  }

  return framed(
    <div className="page public-day">
      <Snowfall />
      <DayScene>
        <h1>{day.title || `Day ${day.dayNumber}`}</h1>
        <div className="day-overlay__body">
          <p className="day-message">{day.message || 'Your adventure awaits!'}</p>
          {day.imageUrl && <img className="day-custom-image" src={day.imageUrl} alt="" />}
        </div>
      </DayScene>
      <p className="back-link">
        <Link to={calendarPath}>← Back to all days</Link>
      </p>
    </div>,
  );
}
