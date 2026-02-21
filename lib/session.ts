import type { SessionOptions } from 'iron-session';

export interface SessionData {
  isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.ADMIN_SESSION_SECRET as string,
  cookieName: 'pmhi-admin-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
};
