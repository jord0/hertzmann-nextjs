'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../layout.module.css';

const links = [
  { href: '/', label: 'Home', external: false },
  { href: '/photographs', label: 'Photographs', external: false },
  { href: '/catalogs', label: 'Catalogues', external: false },
  { href: 'https://edwardwestonbibliography.blog/', label: 'Edward Weston Blog', external: true },
  { href: '/sell-to-us', label: 'Sell to Us', external: false },
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
        <Link href="/" className={styles.logo}>Paul M. Hertzmann, Inc.</Link>

        <div className={styles.links}>
          {links.map(({ href, label, external }) => {
            const active = !external && (href === '/' ? pathname === '/' : pathname.startsWith(href));
            return external ? (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" className={styles.navLink}>
                {label}
              </a>
            ) : (
              <Link key={href} href={href} className={active ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
                {label}
              </Link>
            );
          })}
        </div>

        <button
          className={styles.hamburger}
          onClick={() => setIsOpen(o => !o)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          <span className={styles.hamburgerLabel}>Menu</span>
          <span className={styles.hamburgerIcon}>{isOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {isOpen && (
        <div className={styles.mobileMenu}>
          {links.map(({ href, label, external }) => {
            const active = !external && (href === '/' ? pathname === '/' : pathname.startsWith(href));
            return external ? (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" className={styles.mobileLink}>
                {label}
              </a>
            ) : (
              <Link key={href} href={href} className={active ? `${styles.mobileLink} ${styles.mobileLinkActive}` : styles.mobileLink}>{label}</Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
