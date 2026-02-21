import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import type { SessionData } from './lib/session';
import { sessionOptions } from './lib/session';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the login page and its API route through without auth check
  if (pathname === '/admin/login' || pathname === '/api/admin/login') {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  if (!session.isLoggedIn) {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: '/admin/:path*',
};
