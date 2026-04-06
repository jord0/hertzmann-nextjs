'use server';

import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { redirect } from 'next/navigation';
import { revalidateTag, revalidatePath } from 'next/cache';
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

export async function reorderPhotos(photographerSlug: string, orderedIds: number[]) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.isLoggedIn) redirect('/admin/login');

  await Promise.all(
    orderedIds.map((id, index) => query('UPDATE photos SET level = ? WHERE id = ?', [index, id]))
  );

  revalidatePath(`/photographs/photographer/${photographerSlug}`);
}
