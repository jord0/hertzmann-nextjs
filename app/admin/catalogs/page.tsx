import Link from 'next/link';
import { query } from '@/lib/db';

interface CatalogRow {
  id: number;
  title: string;
  date: string;
  price: number;
  level: number;
  enabled: number;
}

export default async function AdminCatalogsPage() {
  const rows = await query(
    'SELECT id, title, date, price, level, enabled FROM catalogs ORDER BY level ASC'
  ) as CatalogRow[];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Catalogs</h1>
        <Link
          href="/admin/catalogs/new"
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
          + Add Catalog
        </Link>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '6px', overflow: 'hidden', border: '1px solid #ddd' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0', textAlign: 'left' }}>
            <th style={thStyle}>Title</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Price</th>
            <th style={thStyle}>Level</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c, i) => (
            <tr key={c.id} style={{ borderTop: i > 0 ? '1px solid #eee' : 'none' }}>
              <td style={tdStyle}>{c.title}</td>
              <td style={{ ...tdStyle, color: '#666' }}>{c.date}</td>
              <td style={{ ...tdStyle, color: '#666' }}>{c.price > 0 ? `$${c.price}` : '—'}</td>
              <td style={{ ...tdStyle, color: '#666' }}>{c.level}</td>
              <td style={tdStyle}>
                <span style={{
                  display: 'inline-block',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '3px',
                  fontSize: '0.8rem',
                  backgroundColor: c.enabled ? '#dcfce7' : '#f3f4f6',
                  color: c.enabled ? '#15803d' : '#6b7280',
                }}>
                  {c.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </td>
              <td style={{ ...tdStyle, textAlign: 'right' }}>
                <Link
                  href={`/admin/catalogs/${c.id}`}
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

const thStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  fontWeight: 600,
  fontSize: '0.85rem',
  color: '#555',
};

const tdStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
};
