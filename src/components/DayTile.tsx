import { countdownLabel, isDayUnlocked } from '../lib/dateLock';
import type { DayContent } from '../lib/types';

interface DayTileProps {
  day: DayContent;
  year: number;
  unlockedOverride?: boolean;
  onOpen: (day: DayContent) => void;
  onLockedClick: (day: DayContent) => void;
}

export function DayTile({ day, year, unlockedOverride, onOpen, onLockedClick }: DayTileProps) {
  const unlocked = isDayUnlocked(day.dayNumber, new Date(), year) || Boolean(unlockedOverride);
  const hasContent = Boolean(day.message.trim());

  const handleClick = () => {
    if (unlocked) {
      onOpen(day);
    } else {
      onLockedClick(day);
    }
  };

  return (
    <button
      type="button"
      className={`day-tile ${unlocked ? 'unlocked' : 'locked'} ${hasContent ? 'filled' : 'empty'}`}
      onClick={handleClick}
      aria-label={`Day ${day.dayNumber}${unlocked ? '' : ', locked'}`}
    >
      <span className="day-tile-icon" aria-hidden="true">
        {unlocked ? '⭐' : '🔒'}
      </span>
      <span className="day-number">{day.dayNumber}</span>
      {!unlocked && <span className="day-hint">{countdownLabel(day.dayNumber, new Date(), year)}</span>}
      {unlocked && day.title && <span className="day-title">{day.title}</span>}
    </button>
  );
}
