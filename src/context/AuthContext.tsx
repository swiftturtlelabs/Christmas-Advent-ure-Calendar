import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth, firebaseConfigError, googleProvider } from '../lib/firebase';
import { ensureUserProfile } from '../lib/calendarService';
import { getAuthErrorMessage } from '../lib/authErrors';
import type { UserProfile } from '../lib/types';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signingIn: boolean;
  authError: string | null;
  configError: string | null;
  signIn: () => Promise<boolean>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function isPopupFallbackError(error: unknown): boolean {
  const code = typeof error === 'object' && error && 'code' in error
    ? String((error as { code: string }).code)
    : '';
  return code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const finishRedirect = getRedirectResult(auth)
      .catch((error) => {
        if (active) setAuthError(getAuthErrorMessage(error));
      })
      .finally(() => {
        if (active) setSigningIn(false);
      });

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      await finishRedirect;
      if (!active) return;

      setUser(nextUser);
      if (nextUser) {
        try {
          const p = await ensureUserProfile(nextUser);
          if (active) setProfile(p);
        } catch (error) {
          if (active) setAuthError(getAuthErrorMessage(error));
        }
      } else {
        setProfile(null);
      }
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      signingIn,
      authError,
      configError: firebaseConfigError,
      clearAuthError: () => setAuthError(null),
      signIn: async () => {
        if (firebaseConfigError) {
          setAuthError(firebaseConfigError);
          return false;
        }

        setAuthError(null);
        setSigningIn(true);
        try {
          await signInWithPopup(auth, googleProvider);
          setSigningIn(false);
          return true;
        } catch (error) {
          if (isPopupFallbackError(error)) {
            try {
              await signInWithRedirect(auth, googleProvider);
              return false;
            } catch (redirectError) {
              setSigningIn(false);
              setAuthError(getAuthErrorMessage(redirectError));
              return false;
            }
          }
          setSigningIn(false);
          setAuthError(getAuthErrorMessage(error));
          return false;
        }
      },
      signOut: async () => {
        await firebaseSignOut(auth);
      },
    }),
    [user, profile, loading, signingIn, authError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
