import { Link } from 'react-router-dom';

const API_BASE = 'https://us-central1-christmas-advent-ure-calendar.cloudfunctions.net/api';

export function ApiDocsPage() {
  return (
    <div className="page account-settings-page">
      <p>
        <Link to="/app/account">← Account settings</Link>
      </p>
      <h1>API documentation</h1>
      <p className="muted">
        Authenticate with <code>Authorization: Bearer YOUR_KEY</code> or <code>X-Api-Key: YOUR_KEY</code>.
        Generate a key from <Link to="/app/account">Account</Link>.
      </p>

      <section className="card account-section">
        <h2>Base URL</h2>
        <p>
          <code>{API_BASE}</code>
        </p>
      </section>

      <section className="card account-section">
        <h2>Endpoints</h2>
        <ul>
          <li>
            <code>GET /v1/calendars</code> — list your calendars
          </li>
          <li>
            <code>POST /v1/calendars</code> — create (`title`, `year`)
          </li>
          <li>
            <code>GET /v1/calendars/:slug</code> — calendar metadata and all days
          </li>
          <li>
            <code>PATCH /v1/calendars/:slug/days/:day</code> — update one day (`title`, `message`)
          </li>
          <li>
            <code>PUT /v1/calendars/:slug/days</code> — bulk upsert days (`days`: array of
            &#123; dayNumber, title, message &#125;)
          </li>
        </ul>
      </section>

      <section className="card account-section">
        <h2>Example: create and fill a calendar</h2>
        <pre className="api-docs-pre">
{`POST ${API_BASE}/v1/calendars
{"title":"Smith Family 2026","year":2026}

PUT ${API_BASE}/v1/calendars/{slug}/days
{
  "days": [
    {"dayNumber": 1, "title": "Cocoa night", "message": "Make cocoa and read a story."},
    {"dayNumber": 2, "title": "Lights drive", "message": "Tour neighborhood lights."}
  ]
}`}
        </pre>
      </section>

      <section className="card account-section">
        <h2>Example AI prompt</h2>
        <p className="muted">Paste into ChatGPT, Claude, or Cursor with your API key:</p>
        <pre className="api-docs-pre">
{`You can manage my Christmas Advent-ure Calendar using this API.
Base URL: ${API_BASE}
API key: <paste your key from Account settings>

Create a calendar titled "Our Family 2026" for year 2026, then fill all 24 days
with cozy family activities (indoor and outdoor). Use PUT /v1/calendars/{slug}/days
to upload all days in one request. Keep titles short and messages 1–3 sentences.`}
        </pre>
      </section>
    </div>
  );
}