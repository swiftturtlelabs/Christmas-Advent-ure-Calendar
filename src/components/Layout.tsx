import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const { user, signOut } = useAuth();

  return (
    <div className="layout">
      <header className="site-header">
        <Link to="/" className="brand">
          <span className="brand-icon" aria-hidden="true">
            🎄
          </span>
          Christmas Advent-ure Calendar
        </Link>
        <nav>
          {user ? (
            <>
              <Link to="/app">My Calendars</Link>
              <button type="button" className="btn linkish" onClick={() => signOut()}>
                Sign out
              </button>
            </>
          ) : (
            <Link to="/">Home</Link>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
