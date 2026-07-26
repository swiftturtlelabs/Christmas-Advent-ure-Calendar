import type { StockAdventure } from '../lib/types';

interface SuggestionsModalProps {
  dayNumber: number;
  suggestions: StockAdventure[];
  usedIds: Set<string>;
  onSelect: (item: StockAdventure) => void;
  onClose: () => void;
}

export function SuggestionsModal({
  dayNumber,
  suggestions,
  usedIds,
  onSelect,
  onClose,
}: SuggestionsModalProps) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="suggestions-title">
      <div className="modal card suggestions-modal">
        <div className="suggestions-modal-header">
          <div>
            <h2 id="suggestions-title">Adventure suggestions</h2>
            <p className="muted">Ideas ranked for Day {dayNumber}. Tap one to fill the form.</p>
          </div>
          <button type="button" className="btn secondary" onClick={onClose}>
            Close
          </button>
        </div>
        <ul className="stock-list suggestions-list">
          {suggestions.map((item) => {
            const used = usedIds.has(item.id);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`stock-item ${used ? 'used' : ''}`}
                  onClick={() => onSelect(item)}
                >
                  <span className="stock-item-top">
                    <strong>{item.title}</strong>
                    {used && <span className="stock-used-badge">Already used</span>}
                  </span>
                  <span>{item.description}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
