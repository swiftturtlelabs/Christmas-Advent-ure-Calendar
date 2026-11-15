import { Link } from 'react-router-dom';
import { Snowfall } from '../components/Snowfall';
import { STOCK_CALENDARS, STOCK_CALENDARS_LABEL } from '../lib/stockCalendars';
import { useAuth } from '../context/AuthContext';

export function StockCalendarsPage() {
  const { user } = useAuth();

  return (
    <div className="page stock-calendars">
      <Snowfall />
      <div className="stock-calendars-hero card">
        <span className="hero-badge">Examples &amp; inspiration</span>
        <h1>{STOCK_CALENDARS_LABEL}</h1>
        <p className="muted stock-calendars-intro">
          Five ready-made 24-day calendars from{' '}
          <a href="https://swiftturtlelabs.com/" target="_blank" rel="noopener noreferrer">
            Swift Turtle Labs
          </a>
          . Open one to see how a full month looks, or use the ideas when you build your own.
        </p>
        {user ? (
          <p className="stock-calendars-cta">
            <Link className="btn primary" to="/app">
              Create your own calendar
            </Link>
          </p>
        ) : (
          <p className="stock-calendars-cta">
            <Link className="btn primary" to="/">
              Sign in to create yours
            </Link>
          </p>
        )}
      </div>

      <ul className="stock-calendar-list">
        {STOCK_CALENDARS.map((cal) => (
          <li key={cal.slug} className="card stock-calendar-card">
            <div className="stock-calendar-card-main">
              <span className="stock-calendar-tone">{cal.tone}</span>
              <h2>{cal.title}</h2>
              <p className="muted">{cal.tagline}</p>
              <p className="stock-calendar-meta muted">
                {cal.year} · 24 days
              </p>
            </div>
            <div className="stock-calendar-actions">
              <Link className="btn primary" to={`/c/${cal.slug}`}>
                Open calendar
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <p className="muted stock-calendars-footer-note">
        These calendars are shared as examples. Sign in to create a private calendar with your own title,
        days, and lock settings
        {user ? (
          <>
            —or start from scratch on <Link to="/app">My Calendars</Link>.
          </>
        ) : (
          <>.</>
        )}
      </p>
    </div>
  );
}