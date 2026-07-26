import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Snowfall } from '../components/Snowfall';

export function LandingPage() {
  const { user, signIn, loading, signingIn, authError, configError, clearAuthError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/app', { replace: true });
    }
  }, [loading, user, navigate]);

  const handleSignIn = async () => {
    clearAuthError();
    const ok = await signIn();
    if (ok) navigate('/app');
  };

  return (
    <div className="page landing">
      <Snowfall />
      <div className="hero card">
        <span className="hero-badge">24 days of magic</span>
        <h1>Christmas Advent-ure Calendar</h1>
        <p>
          Create a personalized 24-day Christmas adventure for your family and friends.
          Fill in daily surprises, export QR codes, and share the magic.
        </p>
        <div className="feature-grid">
          <div className="feature-chip">Daily surprises</div>
          <div className="feature-chip">Secret riddles</div>
          <div className="feature-chip">Shareable QR codes</div>
        </div>
        {(configError || authError) && (
          <p className="error auth-error" role="alert">
            {configError ?? authError}
          </p>
        )}
        {loading || signingIn || user ? (
          <p>{signingIn ? 'Signing in…' : user ? 'Taking you to your calendars…' : 'Loading…'}</p>
        ) : (
          <button type="button" className="btn primary" onClick={handleSignIn}>
            Sign in with Google
          </button>
        )}
      </div>
    </div>
  );
}
