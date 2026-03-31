'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin/photographers', label: 'Photographers' },
  { href: '/admin/photos', label: 'Photos' },
  { href: '/admin/catalogs', label: 'Catalogues' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: '#1a1a1a',
      color: 'white',
      padding: '0 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      height: '52px',
    }}>
      <Link
        href="/admin/photographers"
        style={{ color: 'white', textDecoration: 'none', fontWeight: 600, marginRight: '1rem' }}
      >
        Admin
      </Link>

      {links.map(({ href, label }) => {
        const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            style={{
              color: active ? 'white' : '#ccc',
              textDecoration: 'none',
              fontSize: '0.9rem',
              borderBottom: active ? '2px solid #F0B23C' : '2px solid transparent',
              paddingBottom: '2px',
            }}
          >
            {label}
          </Link>
        );
      })}

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
  );
}
