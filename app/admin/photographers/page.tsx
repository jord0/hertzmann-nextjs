import Link from 'next/link';
import { query } from '@/lib/db';

interface PhotographerRow {
  id: number;
  firstName: string;
  lastName: string;
  enabled: number;
  photoCount: number;
}

export default async function PhotographersPage() {
  const rows = (await query(`
    SELECT p.id, p.firstName, p.lastName, p.enabled,
           COUNT(ph.id) AS photoCount
    FROM photographers p
    LEFT JOIN photos ph ON ph.photographer = p.id
    GROUP BY p.id
    ORDER BY p.lastName, p.firstName
  `)) as PhotographerRow[];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Photographers</h1>
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

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '6px', overflow: 'hidden', border: '1px solid #ddd' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0', textAlign: 'left' }}>
            <th style={{ padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.85rem', color: '#555' }}>Name</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.85rem', color: '#555' }}>Photos</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.85rem', color: '#555' }}>Status</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.85rem', color: '#555' }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p, i) => (
            <tr key={p.id} style={{ borderTop: i > 0 ? '1px solid #eee' : 'none' }}>
              <td style={{ padding: '0.75rem 1rem' }}>
                {p.firstName} {p.lastName}
              </td>
              <td style={{ padding: '0.75rem 1rem', color: '#666' }}>{p.photoCount}</td>
              <td style={{ padding: '0.75rem 1rem' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '3px',
                  fontSize: '0.8rem',
                  backgroundColor: p.enabled ? '#dcfce7' : '#f3f4f6',
                  color: p.enabled ? '#15803d' : '#6b7280',
                }}>
                  {p.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                <Link
                  href={`/admin/photographers/${p.id}`}
                  style={{ color: '#0066cc', textDecoration: 'none', fontSize: '0.9rem' }}
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
