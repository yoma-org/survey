import { describe, it, expect } from 'vitest';
import { sessionOptions } from '@/lib/auth';

describe('sessionOptions', () => {
  it('uses admin_session as cookie name', () => {
    expect(sessionOptions.cookieName).toBe('admin_session');
  });

  it('sets maxAge to 24 hours (86400 seconds)', () => {
    expect(sessionOptions.cookieOptions.maxAge).toBe(86400);
  });
});
