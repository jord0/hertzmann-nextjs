import Link from 'next/link';
import { query } from '@/lib/db';
import AdminPhotographersClient, { type PhotographerRow } from './AdminPhotographersClient';

export default async function PhotographersPage() {
  const rows = await query(`
    SELECT p.id, p.firstName, p.lastName, p.enabled,
           COUNT(ph.id) AS photoCount
    FROM photographers p
    LEFT JOIN photos ph ON ph.photographer = p.id
    GROUP BY p.id
    ORDER BY p.lastName, p.firstName
  `) as PhotographerRow[];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Photographers</h1>
        <Link
          href="/admin/photographers/new"
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
          + Add Photographer
        </Link>
      </div>

      <AdminPhotographersClient photographers={rows} />
    </div>
  );
}
