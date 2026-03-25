'use server';

import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import type { SessionData } from '@/lib/session';
import { sessionOptions } from '@/lib/session';
import { query } from '@/lib/db';

export async function togglePhotoEnabled(id: number, newEnabled: number) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.isLoggedIn) redirect('/admin/login');

  await query('UPDATE photos SET enabled = ? WHERE id = ?', [newEnabled, id]);
  revalidateTag('browse-data', 'default');
  revalidateTag('carousel-photos', 'default');
}
