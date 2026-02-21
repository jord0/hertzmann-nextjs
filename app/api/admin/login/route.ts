import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getIronSession } from 'iron-session';
import type { SessionData } from '@/lib/session';
import { sessionOptions } from '@/lib/session';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = formData.get('password') as string;

  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const valid = await bcrypt.compare(password, hash);
  if (!valid) {
    const loginUrl = new URL('/admin/login?error=1', request.url);
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const response = NextResponse.redirect(new URL('/admin', request.url), { status: 303 });
  const session = await getIronSession<SessionData>(request, response, sessionOptions);
  session.isLoggedIn = true;
  await session.save();

  return response;
}
