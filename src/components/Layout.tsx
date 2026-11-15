import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DONATE_LABEL, DONATE_PAGE_PATH } from '../lib/donate';

export function Layout() {
  const { user, signIn, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    const ok = await signIn();
    if (ok) navigate('/app');
  };

  return (
    <div className="layout">
      <header className="site-header">
        <Link to="/" className="brand">
          Christmas Advent-ure Calendar
        </Link>
        <nav>
          <Link to="/samples">Sample calendars</Link>
          {user ? (
            <>
              <Link to="/app">My Calendars</Link>
              <Link to="/app/account">Account</Link>
              <button type="button" className="btn linkish" onClick={() => signOut()}>
                Sign out
              </button>
            </>
          ) : (
            <button type="button" className="btn linkish" onClick={handleSignIn}>
              Sign in
            </button>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <Link to={DONATE_PAGE_PATH}>{DONATE_LABEL}</Link>
      </footer>
    </div>
  );
}