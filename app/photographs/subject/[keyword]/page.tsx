import Link from 'next/link';
import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Metadata } from "next";

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <Link href="/photographs" style={{ display: 'inline-block', marginBottom: '2rem', color: '#333', textDecoration: 'none' }}>
        ← Back to Browse
      </Link>
      
      <header style={{ textAlign: 'center', marginBottom: '3rem', borderBottom: '2px solid #333', paddingBottom: '1.5rem' }}>
        <h1>{decodedKeyword}</h1>
        <p style={{ color: '#666', fontSize: '1.1rem', margin: '0.5rem 0' }}>
          {photos.length} photograph{photos.length !== 1 ? 's' : ''}
        </p>
      </header>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '2rem',
        marginTop: '2rem'
      }}>
        {photos.map((photo) => {
          const photographerSlug = `${photo.firstName || ''}-${photo.lastName}`
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '')
            .replace(/^-+|-+$/g, '');
            
          const detailHref = `/photographs/photo/${photo.id}?from=${encodeURIComponent(`subject/${decodedKeyword}`)}`;

          return (
            <div key={photo.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', backgroundColor: 'white' }}>
              <Link href={detailHref} style={{ display: 'block', marginBottom: '1rem' }}>
                <img
                  src={`https://hertzmann.net/pages/photos/${photo.photographer}_${photo.id}.jpg`}
                  alt={photo.title}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </Link>
              <div>
                <Link href={detailHref} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: '0.5rem 0' }}>{photo.title}</h3>
                </Link>
                <Link
                  href={`/photographs/photographer/${photographerSlug}`}
                  style={{ display: 'block', color: '#0066cc', textDecoration: 'none', fontSize: '0.95rem', marginBottom: '0.5rem' }}
                >
                  {photo.firstName} {photo.lastName}
                </Link>
                {photo.medium && <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.9rem' }}>{photo.medium}</p>}
                {photo.date && <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.9rem' }}>{photo.date}</p>}
                {photo.width && photo.height && (
                  <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.9rem' }}>{photo.width}" × {photo.height}"</p>
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