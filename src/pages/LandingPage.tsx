import { useAuth } from '../context/AuthContext';
import { Snowfall } from '../components/Snowfall';

export function LandingPage() {
  const { user, signIn, loading } = useAuth();

  return (
    <div className="page landing">
      <Snowfall />
      <div className="hero card">
        <h1>Christmas Advent-ure Calendar</h1>
        <p>
          Create a personalized 24-day Christmas adventure for your family and friends.
          Fill in daily surprises, export QR codes, and share the magic.
        </p>
        {loading ? (
          <p>Loading…</p>
        ) : user ? (
          <a className="btn primary" href="/app">
            Go to my calendars
          </a>
        ) : (
          <button type="button" className="btn primary" onClick={() => signIn()}>
            Sign in with Google
          </button>
        )}
      </div>
    </div>
  );
}
