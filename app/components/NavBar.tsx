'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../layout.module.css';

const links = [
  { href: '/', label: 'Home', external: false },
  { href: '/photographs', label: 'Photographs', external: false },
  { href: '/catalogs', label: 'Catalogs', external: false },
  { href: 'https://edwardwestonbibliography.blog/', label: 'Edward Weston Blog', external: true },
  { href: '/contact', label: 'Contact', external: false },
  { href: '/about', label: 'About Us', external: false },
];

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>Hertzmann</Link>

        <div className={styles.links}>
          {links.map(({ href, label, external }) =>
            external ? (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" className={styles.navLink}>
                {label}
              </a>
            ) : (
              <Link key={href} href={href} className={styles.navLink}>{label}</Link>
            )
          )}
        </div>

        <button
          className={styles.hamburger}
          onClick={() => setIsOpen(o => !o)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {isOpen && (
        <div className={styles.mobileMenu}>
          {links.map(({ href, label, external }) =>
            external ? (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" className={styles.mobileLink}>
                {label}
              </a>
            ) : (
              <Link key={href} href={href} className={styles.mobileLink}>{label}</Link>
            )
          )}
        </div>
      )}
    </nav>
  );
}
