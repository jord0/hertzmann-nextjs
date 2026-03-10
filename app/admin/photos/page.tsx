import Link from 'next/link';
import adminStyles from '@/app/admin/admin.module.css';

export const dynamic = 'force-dynamic';
import { query } from '@/lib/db';
import AdminPhotosClient, { type PhotoRow } from './AdminPhotosClient';

export default async function AdminPhotosPage() {
  const rows = await query(`
    SELECT ph.id, ph.title, ph.enabled, ph.photographer AS photographerId,
           p.firstName, p.lastName, ph.updatedAt
    FROM photos ph
    JOIN photographers p ON p.id = ph.photographer
    ORDER BY p.lastName, p.firstName, ph.title
  `) as (Omit<PhotoRow, 'updatedAt'> & { updatedAt: Date | null })[];

  const photos: PhotoRow[] = rows.map(r => ({
    ...r,
    updatedAt: r.updatedAt?.toISOString() ?? null,
  }));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Photos</h1>
        <Link href="/admin/photos/new" className={adminStyles.btnPrimarySmall}>
          + Add Photo
        </Link>
      </div>

      <AdminPhotosClient photos={photos} />
    </div>
  );
}
