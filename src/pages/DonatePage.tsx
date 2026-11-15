import { Link } from 'react-router-dom';
import {
  DONATE_BLURB,
  DONATE_HEADLINE,
  DONATE_METHODS,
} from '../lib/donate';

export function DonatePage() {
  return (
    <div className="page donate-page">
      <div className="card donate-hero">
        <h1>{DONATE_HEADLINE}</h1>
        <p className="donate-intro">{DONATE_BLURB}</p>
        <p className="muted donate-note">
          These are public payment profiles—only use them if you genuinely want to chip in. No pressure,
          ever.
        </p>
      </div>

      <ul className="donate-methods">
        {DONATE_METHODS.map((method) => (
          <li key={method.id} className="card donate-method-card">
            <h2>{method.name}</h2>
            <p className="muted">{method.description}</p>
            <p className="donate-method-handle">{method.cta}</p>
            <a
              className="btn primary"
              href={method.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open {method.name}
            </a>
          </li>
        ))}
      </ul>

      <p className="donate-back muted">
        <Link to="/">← Back home</Link>
      </p>
    </div>
  );
}