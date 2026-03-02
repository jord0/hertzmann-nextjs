import Link from 'next/link';
import { query } from '@/lib/db';
import AdminPhotosClient, { type PhotoRow } from './AdminPhotosClient';

export default async function AdminPhotosPage() {
  const photos = await query(`
    SELECT ph.id, ph.title, ph.enabled, ph.photographer AS photographerId,
           p.firstName, p.lastName
    FROM photos ph
    JOIN photographers p ON p.id = ph.photographer
    ORDER BY p.lastName, p.firstName, ph.title
  `) as PhotoRow[];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Photos</h1>
        <Link
          href="/admin/photos/new"
          style={{
            marginLeft: 'auto',
            padding: '0.5rem 1rem',
            backgroundColor: '#333',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '0.9rem',
          }}
        >
          + Add Photo
        </Link>
      </div>

      <AdminPhotosClient photos={photos} />
    </div>
  );
}
