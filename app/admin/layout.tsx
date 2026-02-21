import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <nav style={{
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        height: '52px',
      }}>
        <Link
          href="/admin"
          style={{ color: 'white', textDecoration: 'none', fontWeight: 600, marginRight: '1rem' }}
        >
          Admin
        </Link>
        <Link href="/admin/photographers" style={{ color: '#ccc', textDecoration: 'none', fontSize: '0.9rem' }}>
          Photographers
        </Link>
        <Link href="/admin/photos/new" style={{ color: '#ccc', textDecoration: 'none', fontSize: '0.9rem' }}>
          Add Photo
        </Link>
        <div style={{ marginLeft: 'auto' }}>
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              style={{
                background: 'none',
                border: '1px solid #555',
                color: '#ccc',
                padding: '0.3rem 0.75rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Logout
            </button>
          </form>
        </div>
      </nav>
      <main style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}
