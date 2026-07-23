export function getAuthErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error
    ? String((error as { code: string }).code)
    : '';

  switch (code) {
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for sign-in. In Firebase Console → Authentication → Settings, add this site to Authorized domains.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled. In Firebase Console → Authentication → Sign-in method, enable Google.';
    case 'auth/configuration-not-found':
      return 'Firebase Authentication is not fully set up. Open Firebase Console → Authentication, click Get started, and enable Google as a sign-in provider.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by the browser. Trying redirect instead…';
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled.';
    case 'auth/network-request-failed':
      return 'Network error during sign-in. Check your connection and try again.';
    default:
      break;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Sign-in failed. Please try again.';
}

export function validateFirebaseConfig(config: Record<string, string | undefined>): string | null {
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    return `Missing Firebase config: ${missing.join(', ')}. Copy .env.example to .env and rebuild.`;
  }

  return null;
}
