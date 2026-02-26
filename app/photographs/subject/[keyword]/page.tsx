import Link from 'next/link';
import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Metadata } from "next";
import styles from './page.module.css';

interface Photo {
  id: number;
  photographer: number;
  firstName: string;
  lastName: string;
  title: string;
  medium: string | null;
  date: string | null;
  width: string | null;
  height: string | null;
}

interface PageProps {
  params: Promise<{ keyword: string }>;
}

async function getPhotosByKeyword(keyword: string): Promise<Photo[]> {
  const sql = `
    SELECT p.*, ph.firstName, ph.lastName
    FROM photos p
    JOIN photographers ph ON p.photographer = ph.id
    WHERE p.enabled = 1
    AND p.keywords LIKE ?
    ORDER BY ph.lastName, ph.firstName, p.title
  `;

  return await query(sql, [`%|${keyword}|%`]) as Photo[];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { keyword } = await params;
  const decodedKeyword = decodeURIComponent(keyword);
  const photos = await getPhotosByKeyword(decodedKeyword);

  return {
    title: decodedKeyword,
    description: `Browse ${photos.length} vintage photograph${photos.length !== 1 ? 's' : ''} tagged with ${decodedKeyword} from the Hertzmann photography collection.`,
    openGraph: {
      title: `${decodedKeyword} Photography`,
      description: `${photos.length} photograph${photos.length !== 1 ? 's' : ''}`,
    }
  };
}

export default async function SubjectPage({ params }: PageProps) {
  const { keyword } = await params;
  const decodedKeyword = decodeURIComponent(keyword);
  const photos = await getPhotosByKeyword(decodedKeyword);

  return (
    <div className={styles.container}>
      <Link href="/photographs" className={styles.backLink}>
        ← Back to Browse
      </Link>

      <header className={styles.header}>
        <h1 className={styles.keyword}>{decodedKeyword}</h1>
        <p className={styles.photoCount}>
          {photos.length} photograph{photos.length !== 1 ? 's' : ''}
        </p>
      </header>

      <div className={styles.photoGrid}>
        {photos.map((photo) => {
          const photographerSlug = `${photo.firstName || ''}-${photo.lastName}`
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '')
            .replace(/^-+|-+$/g, '');

          const detailHref = `/photographs/photo/${photo.id}?from=${encodeURIComponent(`subject/${decodedKeyword}`)}`;

          return (
            <div key={photo.id} className={styles.photoCard}>
              <Link href={detailHref} className={styles.photoImageLink}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://hertzmann.net/pages/photos/${photo.photographer}_${photo.id}.jpg`}
                  alt={photo.title}
                  className={styles.photoImage}
                />
              </Link>
              <div>
                <Link href={detailHref} className={styles.photoTitleLink}>
                  <h3 className={styles.photoTitle}>{photo.title}</h3>
                </Link>
                <Link
                  href={`/photographs/photographer/${photographerSlug}`}
                  className={styles.photographerLink}
                >
                  {photo.firstName} {photo.lastName}
                </Link>
                {photo.medium && <p className={styles.photoMeta}>{photo.medium}</p>}
                {photo.date && <p className={styles.photoMeta}>{photo.date}</p>}
                {photo.width && photo.height && (
                  <p className={styles.photoMeta}>{photo.width}&quot; × {photo.height}&quot;</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Generate static paths for all keywords at build time
export async function generateStaticParams() {
  const sql = `
    SELECT DISTINCT TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(keywords, '|', n), '|', -1)) as keyword
    FROM photos
    CROSS JOIN (
      SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
      UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
    ) numbers
    WHERE CHAR_LENGTH(keywords) - CHAR_LENGTH(REPLACE(keywords, '|', '')) >= n - 1
    AND keywords IS NOT NULL
    AND keywords != ''
    AND TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(keywords, '|', n), '|', -1)) != ''
  `;

  const results = await query(sql) as any[];

  return results.map(r => ({
    keyword: r.keyword
  }));
}
