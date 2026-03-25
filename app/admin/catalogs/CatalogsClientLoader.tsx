'use client';

import dynamic from 'next/dynamic';
import type { CatalogRow } from './AdminCatalogsClient';

const AdminCatalogsClient = dynamic(() => import('./AdminCatalogsClient'), { ssr: false });

export default function CatalogsClientLoader({ initialRows }: { initialRows: CatalogRow[] }) {
  return <AdminCatalogsClient initialRows={initialRows} />;
}
