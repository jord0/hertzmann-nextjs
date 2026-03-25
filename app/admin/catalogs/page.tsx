import Link from 'next/link';
import dynamic from 'next/dynamic';
import adminStyles from '@/app/admin/admin.module.css';
import { query } from '@/lib/db';
import type { CatalogRow } from './AdminCatalogsClient';

const AdminCatalogsClient = dynamic(() => import('./AdminCatalogsClient'), { ssr: false });

export const dynamic = 'force-dynamic';

export default async function AdminCatalogsPage() {
  const rows = await query(
    'SELECT id, title, date, price, level, enabled, updatedAt FROM catalogs ORDER BY level ASC'
  ) as (Omit<CatalogRow, 'updatedAt'> & { updatedAt: Date | null })[];

  // Serialize dates before passing to client component
  const serialized: CatalogRow[] = rows.map(r => ({
    ...r,
    updatedAt: r.updatedAt ? r.updatedAt.toISOString() : null,
  }));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Catalogs</h1>
        <Link href="/admin/catalogs/new" className={adminStyles.btnPrimarySmall}>
          + Add Catalog
        </Link>
      </div>

      <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#666' }}>
        Click and drag dots to reorder.
      </p>
      <AdminCatalogsClient initialRows={serialized} />
    </div>
  );
}
