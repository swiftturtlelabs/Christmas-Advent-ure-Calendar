import { useState } from 'react';
import { verifyAnswer } from '../lib/riddle';

interface RiddleModalProps {
  prompt: string;
  answerSalt?: string;
  answerHash?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function RiddleModal({ prompt, answerSalt, answerHash, onSuccess, onClose }: RiddleModalProps) {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError('');
    const ok = await verifyAnswer(answer, answerSalt, answerHash);
    setChecking(false);
    if (ok) {
      onSuccess();
    } else {
      setError('Not quite — try again!');
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal card">
        <h2>🎁 Early unlock</h2>
        <p>{prompt || 'Answer the secret question to open this day early.'}</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer"
            autoFocus
          />
          {error && <p className="error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={checking || !answer.trim()}>
              {checking ? 'Checking…' : 'Unlock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
