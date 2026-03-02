'use client';

import { usePathname } from 'next/navigation';
import NavBar from './NavBar';

export default function SiteNav() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;
  return <NavBar />;
}
