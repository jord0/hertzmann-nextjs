import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import type { SessionData } from '@/lib/session';
import { sessionOptions } from '@/lib/session';

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/admin/login', request.url), { status: 303 });
  const session = await getIronSession<SessionData>(request, response, sessionOptions);
  session.destroy();
  return response;
}
