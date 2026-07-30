import { Lock } from 'lucide-react';
import { getAppNow } from '../lib/appDate';
import { isDayUnlocked } from '../lib/dateLock';
import { getLegacyDayImageUrl } from '../lib/legacyDayImages';
import type { DayContent } from '../lib/types';

interface DayTileProps {
  day: DayContent;
  previewDate?: string | null;
  year: number;
  lockFutureDates?: boolean;
  earlyUnlockEnabled?: boolean;
  onOpen: (day: DayContent) => void;
  onLockedClick: (day: DayContent) => void;
}

export function DayTile({
  day,
  previewDate,
  year,
  lockFutureDates = false,
  earlyUnlockEnabled = false,
  onOpen,
  onLockedClick,
}: DayTileProps) {
  const dateUnlocked = isDayUnlocked(day.dayNumber, getAppNow(previewDate), year);
  const showOverlay = !dateUnlocked;
  const isDateLocked = lockFutureDates && !dateUnlocked;
  const showLock = isDateLocked && earlyUnlockEnabled;

  const handleClick = () => {
    if (dateUnlocked) {
      onOpen(day);
    } else if (isDateLocked && earlyUnlockEnabled) {
      onLockedClick(day);
    } else {
      onOpen(day);
    }
  };

  const tileState = dateUnlocked ? 'accessible' : showLock ? 'locked' : 'future';

  return (
    <button
      type="button"
      className={`day-tile ${tileState}`}
      onClick={handleClick}
      aria-label={`Day ${day.dayNumber}${showLock ? ', locked — enter the code to unlock early' : showOverlay ? ', upcoming' : ''}`}
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
