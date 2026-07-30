import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { DayTile } from '../components/DayTile';
import { PhoneFrame } from '../components/PhoneFrame';
import { PublicCalendarFooter } from '../components/PublicCalendarFooter';
import { RiddleModal } from '../components/RiddleModal';
import { Snowfall } from '../components/Snowfall';
import { getCalendar, getDays } from '../lib/calendarService';
import { calendarAllowsRiddles } from '../lib/calendarLock';
import { publicCalendarTitleFontSize } from '../lib/calendarTitle';
import { hasDayRiddle } from '../lib/dayRiddle';
import { parsePreviewDate, withPreviewDate } from '../lib/previewDate';
import type { Calendar, DayContent } from '../lib/types';

function framed(children: ReactNode) {
  return <PhoneFrame>{children}</PhoneFrame>;
}

export function PublicCalendarPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const previewDate = parsePreviewDate(`?${searchParams.toString()}`);
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [days, setDays] = useState<DayContent[]>([]);
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

  const openDay = (day: DayContent) => {
    navigate(withPreviewDate(`/d/${day.token}`, previewDate));
  };

  if (loading) {
    return framed(<div className="page loading public">Loading calendar…</div>);
  }

  if (!calendar) {
    return framed(<div className="page public">Calendar not found.</div>);
  }

  const riddlesEnabled = calendarAllowsRiddles(calendar);

  return framed(
    <div className="page public-calendar">
      <Snowfall />
      <header className="public-header">
        <h1 style={{ fontSize: publicCalendarTitleFontSize(calendar.title) }}>{calendar.title}</h1>
        <p className="public-header-year">{calendar.year}</p>
      </header>
      <div className="public-day-grid">
        {days.map((day) => (
          <DayTile
            key={day.dayNumber}
            day={day}
            previewDate={previewDate}
            year={calendar.year}
            riddlesEnabled={riddlesEnabled}
            onOpen={openDay}
            onLockedClick={(d) => {
              if (riddlesEnabled && hasDayRiddle(d)) {
                setRiddleDay(d);
              }
            }}
          />
        ))}
      </div>
      <PublicCalendarFooter />
      {riddlesEnabled && riddleDay && (
        <RiddleModal
          prompt={riddleDay.riddlePrompt ?? ''}
          answerSalt={riddleDay.answerSalt}
          answerHash={riddleDay.answerHash}
          onClose={() => setRiddleDay(null)}
          onSuccess={() => {
            setRiddleDay(null);
            navigate(withPreviewDate(`/d/${riddleDay.token}`, previewDate), {
              state: { riddleUnlocked: true },
            });
          }}
        />
      )}
    </div>,
  );
}
