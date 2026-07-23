import { useAuth } from '../context/AuthContext';
import { Snowfall } from '../components/Snowfall';

export function LandingPage() {
  const { user, signIn, loading, signingIn, authError, configError, clearAuthError } = useAuth();

  const handleSignIn = async () => {
    clearAuthError();
    await signIn();
  };

  return (
    <div className="page landing">
      <Snowfall />
      <div className="hero card">
        <span className="hero-badge">🎁 24 days of magic</span>
        <h1>Christmas Advent-ure Calendar</h1>
        <p>
          Create a personalized 24-day Christmas adventure for your family and friends.
          Fill in daily surprises, export QR codes, and share the magic.
        </p>
        <div className="feature-grid">
          <div className="feature-chip">
            <span className="feature-icon">🗓️</span>
            Daily surprises
          </div>
          <div className="feature-chip">
            <span className="feature-icon">🧩</span>
            Secret riddles
          </div>
          <div className="feature-chip">
            <span className="feature-icon">📱</span>
            Shareable QR codes
          </div>
        </div>
        {(configError || authError) && (
          <p className="error auth-error" role="alert">
            {configError ?? authError}
          </p>
        )}
        {loading || signingIn ? (
          <p>{signingIn ? 'Signing in…' : 'Loading…'}</p>
        ) : user ? (
          <a className="btn primary" href="/app">
            Go to my calendars
          </a>
        ) : (
          <button type="button" className="btn primary" onClick={handleSignIn}>
            Sign in with Google
          </button>
        )}
      </div>
    </div>
  );
}
