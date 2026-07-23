/**
 * Use the Firebase project's canonical authDomain (firebaseapp.com).
 * Do NOT override to web.app unless OAuth redirect URIs are registered for it —
 * otherwise Identity Toolkit returns auth/configuration-not-found.
 */
export function resolveAuthDomain(): string {
  return import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
}
