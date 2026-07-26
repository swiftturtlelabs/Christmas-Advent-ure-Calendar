import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const { user, signIn, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    await signIn();
    navigate('/app');
  };

  return (
    <div className="layout">
      <header className="site-header">
        <Link to="/" className="brand">
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
            <button type="button" className="btn linkish" onClick={handleSignIn}>
              Sign in
            </button>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
