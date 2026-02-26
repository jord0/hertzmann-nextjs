import Link from 'next/link';
import { Metadata } from 'next';
import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import { decodeHtmlEntities } from '@/lib/htmlDecode';
import styles from './page.module.css';

interface Photo {
  id: number;
  title: string;
  medium: string | null;
  date: string | null;
  width: string | null;
  height: string | null;
}

interface Photographer {
  id: number;
  firstName: string;
  lastName: string;
  years: string | null;
  country: string | null;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPhotographer(slug: string) {
    const cleanSlug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/^-+|-+$/g, '');

    console.log('Looking for slug:', cleanSlug);

    // First get all enabled photographers
    const sql = `SELECT * FROM photographers WHERE enabled = 1`;
    const allPhotographers = await query(sql) as Photographer[];

    // Generate slugs and find match
    const photographer = allPhotographers.find((p: any) => {
      const generatedSlug = `${p.firstName || ''}-${p.lastName}`
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')
        .replace(/^-+|-+$/g, '');
      return generatedSlug === cleanSlug;
    });

    console.log('Found photographer:', photographer);

    if (!photographer) {
      return null;
    }

    return photographer;
  }

  async function getPhotos(photographerId: number): Promise<Photo[]> {
    const sql = 'SELECT * FROM photos WHERE photographer = ? AND enabled = 1';
    const results = await query(sql, [photographerId]) as Photo[];

    // Return all photos - we can't check HE filesystem from Vercel
    // Images that don't exist will just fail to load (handled by onError in img tag)
    return results;
  }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const photographer = await getPhotographer(slug);

    if (!photographer) {
      return {
        title: 'Photographer Not Found'
      };
    }

    const photos = await getPhotos(photographer.id);
    const fullName = `${photographer.firstName || ''} ${photographer.lastName}`.trim();
    const years = decodeHtmlEntities(photographer.years);

    return {
      title: fullName,
      description: `Explore ${photos.length} photograph${photos.length !== 1 ? 's' : ''} by ${fullName}${years ? ` (${years})` : ''}. Vintage photography from the Hertzmann collection.`,
      openGraph: {
        title: fullName,
        description: `${photos.length} photograph${photos.length !== 1 ? 's' : ''} by ${fullName}`,
        type: 'profile',
      }
    };
  }

export default async function PhotographerPage({ params }: PageProps) {
  const { slug } = await params;
  const photographer = await getPhotographer(slug);

  if (!photographer) {
    notFound();
  }

  const photos = await getPhotos(photographer.id);

  return (
    <div className={styles.container}>
      <Link href="/photographs" className={styles.backLink}>
        ← Back to Browse
      </Link>

      <header className={styles.header}>
        <h1 className={styles.name}>{photographer.firstName} {photographer.lastName}</h1>
        {photographer.years && <p className={styles.years}>{decodeHtmlEntities(photographer.years)}</p>}
        {photographer.country && <p className={styles.country}>{photographer.country}</p>}
      </header>

      <main>
        <h2 className={styles.sectionHeading}>Photographs ({photos.length})</h2>
        <div className={styles.photoGrid}>
          {photos.map(photo => (
            <Link
              key={photo.id}
              href={`/photographs/photo/${photo.id}?from=${encodeURIComponent(`photographer/${slug}`)}`}
              className={styles.photoCard}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://hertzmann.net/pages/photos/${photographer.id}_${photo.id}.jpg`}
                alt={photo.title}
                className={styles.photoImage}
              />
              <h3 className={styles.photoTitle}>{photo.title}</h3>
              {photo.medium && <p className={styles.photoMeta}>{photo.medium}</p>}
              {photo.date && <p className={styles.photoMeta}>{photo.date}</p>}
              {photo.width && photo.height && (
                <p className={styles.photoMeta}>{photo.width}&quot; × {photo.height}&quot;</p>
              )}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

// Generate static paths for all photographers at build time
export async function generateStaticParams() {
    const sql = 'SELECT firstName, lastName FROM photographers WHERE enabled = 1';
    const results = await query(sql) as Photographer[];

    return results.map((p: any) => ({
      slug: `${p.firstName || ''}-${p.lastName}`.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/^-+|-+$/g, '')
    }));
  }
