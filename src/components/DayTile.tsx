import { Lock } from 'lucide-react';
import { getAppNow } from '../lib/appDate';
import { hasDayRiddle } from '../lib/dayRiddle';
import { isDayUnlocked } from '../lib/dateLock';
import { getLegacyDayImageUrl } from '../lib/legacyDayImages';
import type { DayContent } from '../lib/types';

interface DayTileProps {
  day: DayContent;
  previewDate?: string | null;
  year: number;
  riddlesEnabled?: boolean;
  onOpen: (day: DayContent) => void;
  onLockedClick: (day: DayContent) => void;
}

export function DayTile({
  day,
  previewDate,
  year,
  riddlesEnabled = true,
  onOpen,
  onLockedClick,
}: DayTileProps) {
  const dateUnlocked = isDayUnlocked(day.dayNumber, getAppNow(previewDate), year);
  const hasRiddle = riddlesEnabled && hasDayRiddle(day);
  const showOverlay = !dateUnlocked;
  const showLock = !dateUnlocked && hasRiddle;

  const handleClick = () => {
    if (dateUnlocked || !hasRiddle) {
      onOpen(day);
    } else {
      onLockedClick(day);
    }
  };

  const tileState = dateUnlocked ? 'accessible' : hasRiddle ? 'locked' : 'future';

  return (
    <button
      type="button"
      className={`day-tile ${tileState}`}
      onClick={handleClick}
      aria-label={`Day ${day.dayNumber}${showLock ? ', locked — solve the riddle to unlock early' : showOverlay ? ', upcoming' : ''}`}
    >
      <span className="day-tile-image-wrap">
        <img
          className="day-tile-image"
          src={getLegacyDayImageUrl(day.dayNumber)}
          alt=""
          loading="lazy"
          decoding="async"
        />
        {showOverlay && <span className="day-tile-lock-overlay" aria-hidden="true" />}
        {showLock && (
          <span className="day-tile-icon" aria-hidden="true">
            <Lock strokeWidth={2} />
          </span>
        )}
      </span>
    </button>
  );
}
