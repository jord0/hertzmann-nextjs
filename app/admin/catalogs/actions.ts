'use server';

import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { SessionData } from '@/lib/session';
import { sessionOptions } from '@/lib/session';
import { query } from '@/lib/db';

export async function reorderCatalogs(orderedIds: number[]) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.isLoggedIn) redirect('/admin/login');

  await Promise.all(
    orderedIds.map((id, index) =>
      query('UPDATE catalogs SET level = ? WHERE id = ?', [index + 1, id])
    )
  );
  revalidatePath('/catalogs');
}

export async function toggleCatalogEnabled(id: number, newEnabled: number) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.isLoggedIn) redirect('/admin/login');

  await query('UPDATE catalogs SET enabled = ? WHERE id = ?', [newEnabled, id]);
  revalidatePath('/catalogs');
}
