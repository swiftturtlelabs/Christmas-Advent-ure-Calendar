import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DayTile } from '../components/DayTile';
import { RiddleModal } from '../components/RiddleModal';
import { Snowfall } from '../components/Snowfall';
import { getCalendar, getDays } from '../lib/calendarService';
import { buildDayUrl } from '../lib/tokens';
import type { Calendar, DayContent } from '../lib/types';

export function PublicCalendarPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [days, setDays] = useState<DayContent[]>([]);
  const [earlyUnlocked, setEarlyUnlocked] = useState<number[]>([]);
  const [riddleDay, setRiddleDay] = useState<DayContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const [cal, dayList] = await Promise.all([getCalendar(slug), getDays(slug)]);
      setCalendar(cal);
      setDays(dayList);
      setLoading(false);
    })();
  }, [slug]);

  const storageKey = useMemo(() => (slug ? `early-unlock:${slug}` : ''), [slug]);

  useEffect(() => {
    if (!storageKey) return;
    const raw = localStorage.getItem(storageKey);
    if (raw) setEarlyUnlocked(JSON.parse(raw) as number[]);
  }, [storageKey]);

  const markEarlyUnlocked = (dayNumber: number) => {
    const next = Array.from(new Set([...earlyUnlocked, dayNumber]));
    setEarlyUnlocked(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const openDay = (day: DayContent) => {
    navigate(`/d/${day.token}`);
  };

  if (loading) {
    return <div className="page loading public">Loading calendar…</div>;
  }

  if (!calendar) {
    return <div className="page public">Calendar not found.</div>;
  }

  return (
    <div className="page public-calendar">
      <Snowfall />
      <header className="public-header">
        <h1>🎄 {calendar.title}</h1>
        <p>Christmas Advent-ure Calendar {calendar.year}</p>
      </header>
      <div className="public-day-grid">
        {days.map((day) => (
          <DayTile
            key={day.dayNumber}
            day={day}
            year={calendar.year}
            unlockedOverride={earlyUnlocked.includes(day.dayNumber)}
            onOpen={openDay}
            onLockedClick={(d) => {
              if (d.riddlePrompt && d.answerHash) {
                setRiddleDay(d);
              }
            }}
          />
        ))}
      </div>
      {riddleDay && (
        <RiddleModal
          prompt={riddleDay.riddlePrompt ?? ''}
          answerSalt={riddleDay.answerSalt}
          answerHash={riddleDay.answerHash}
          onClose={() => setRiddleDay(null)}
          onSuccess={() => {
            markEarlyUnlocked(riddleDay.dayNumber);
            const url = buildDayUrl(riddleDay.token);
            setRiddleDay(null);
            navigate(url.replace(window.location.origin, ''));
          }}
        />
      )}
    </div>
  );
}
