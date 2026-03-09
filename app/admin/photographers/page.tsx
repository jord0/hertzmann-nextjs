import { query } from '@/lib/db';
import AdminPhotographersClient, { type PhotographerRow } from './AdminPhotographersClient';

export default async function PhotographersPage() {
  const rows = await query(`
    SELECT p.id, p.firstName, p.lastName, p.enabled,
           COUNT(ph.id) AS photoCount,
           p.updatedAt
    FROM photographers p
    LEFT JOIN photos ph ON ph.photographer = p.id
    GROUP BY p.id
    ORDER BY p.lastName, p.firstName
  `) as (Omit<PhotographerRow, 'updatedAt'> & { updatedAt: Date | null })[];

  const photographers: PhotographerRow[] = rows.map(r => ({
    ...r,
    updatedAt: r.updatedAt?.toISOString() ?? null,
  }));

  return <AdminPhotographersClient photographers={photographers} />;
}
