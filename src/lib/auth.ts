// src/lib/auth.ts
export interface SessionData {
  token?: string; // signed JWT — set on login, cleared on logout
}

export const sessionOptions = {
  cookieName: 'admin_session',
  password: process.env.IRON_SESSION_PASSWORD!,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 24 hours (86400 seconds)
  },
};
