import type { Metadata } from 'next';
import { query } from '@/lib/db';
import CatalogCard from './CatalogCard';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Catalogues',
  description: 'Browse publications and exhibition catalogues from Herzig & Hertzmann vintage photography.',
};

interface Catalog {
  id: number;
  title: string;
  date: string;
  price: number;
  description: string;
  level: number;
}

export default async function CatalogsPage() {
  const catalogs = await query(
    'SELECT id, title, date, price, description, level FROM catalogs WHERE enabled = 1 ORDER BY level ASC'
  ) as Catalog[];

  return (
    <div>
      <div className={styles.goldHeader}>
        <div className={styles.headerInner}>
          <h1 className={styles.headerTitle}>Catalogues</h1>
          <p className={styles.headerSub}>Publications and exhibition catalogues</p>
        </div>
      </div>

      <div className={styles.content}>
        {catalogs.length === 0 ? (
          <p className={styles.empty}>No catalogues available.</p>
        ) : (
          <div className={styles.grid}>
            {catalogs.map(catalog => (
              <CatalogCard key={catalog.id} catalog={catalog} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
