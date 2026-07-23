import { describe, expect, it, vi, afterEach } from 'vitest';
import { resolveAuthDomain } from './authDomain';

describe('resolveAuthDomain', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('always uses the configured firebaseapp.com auth domain', () => {
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'christmas-advent-ure-calendar.firebaseapp.com');
    vi.stubGlobal('window', {
      location: { hostname: 'christmas-advent-ure-calendar.web.app' },
    } as Window);

    expect(resolveAuthDomain()).toBe('christmas-advent-ure-calendar.firebaseapp.com');
  });
});
