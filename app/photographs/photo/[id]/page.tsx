import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { query } from '@/lib/db';
import { decodeHtmlEntities } from '@/lib/htmlDecode';
import styles from './page.module.css';

interface PhotoDetail {
  id: number;
  photographer: number;
  firstName: string;
  lastName: string;
  years: string | null;
  country: string | null;
  title: string;
  medium: string | null;
  date: string | null;
  height: string | null;
  width: string | null;
  price: number;
  description: string | null;
  provenance: string | null;
  inventoryNumber: string | null;
  keywords: string | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}

async function getPhoto(id: number): Promise<PhotoDetail | null> {
  const results = await query(
    `SELECT p.id, p.photographer, p.title, p.medium, p.date, p.height, p.width,
            p.price, p.description, p.provenance, p.inventoryNumber, p.keywords,
            ph.firstName, ph.lastName, ph.years, ph.country
     FROM photos p
     JOIN photographers ph ON p.photographer = ph.id
     WHERE p.id = ? AND p.enabled = 1`,
    [id]
  ) as PhotoDetail[];
  return results[0] ?? null;
}

function buildSlug(firstName: string, lastName: string) {
  return `${firstName || ''}-${lastName}`
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/^-+|-+$/g, '');
}

async function getContextNavigation(from: string | undefined, currentId: number) {
  const fallback = { prev: null, next: null, backHref: '/photographs', backLabel: 'All Photographs' };

  if (!from) return fallback;

  if (from.startsWith('photographer/')) {
    const slug = from.slice('photographer/'.length);
    const allPhotographers = await query(
      'SELECT id, firstName, lastName FROM photographers WHERE enabled = 1'
    ) as any[];
    const photographer = allPhotographers.find(
      (p: any) => buildSlug(p.firstName, p.lastName) === slug
    );
    if (!photographer) return fallback;

    const photos = await query(
      'SELECT id FROM photos WHERE photographer = ? AND enabled = 1 ORDER BY title',
      [photographer.id]
    ) as { id: number }[];

    const idx = photos.findIndex(p => p.id === currentId);
    return {
      prev: idx > 0 ? photos[idx - 1].id : null,
      next: idx < photos.length - 1 ? photos[idx + 1].id : null,
      backHref: `/photographs/photographer/${slug}`,
      backLabel: `${photographer.firstName} ${photographer.lastName}`,
    };
  }

  if (from.startsWith('subject/')) {
    const keyword = decodeURIComponent(from.slice('subject/'.length));
    const photos = await query(
      `SELECT p.id FROM photos p
       JOIN photographers ph ON p.photographer = ph.id
       WHERE p.enabled = 1 AND p.keywords LIKE ?
       ORDER BY ph.lastName, ph.firstName, p.title`,
      [`%|${keyword}|%`]
    ) as { id: number }[];

    const idx = photos.findIndex(p => p.id === currentId);
    return {
      prev: idx > 0 ? photos[idx - 1].id : null,
      next: idx < photos.length - 1 ? photos[idx + 1].id : null,
      backHref: `/photographs/subject/${encodeURIComponent(keyword)}`,
      backLabel: keyword,
    };
  }

  return fallback;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const photo = await getPhoto(Number(id));
  if (!photo) return { title: 'Photo Not Found' };

  const fullName = `${photo.firstName} ${photo.lastName}`.trim();
  return {
    title: photo.title,
    description: `${photo.title} by ${fullName}${photo.date ? `, ${photo.date}` : ''}. Vintage photography from the Hertzmann collection.`,
    openGraph: {
      title: photo.title,
      description: `${photo.title} by ${fullName}`,
      images: [`https://hertzmann.net/pages/photos/${photo.photographer}_${photo.id}.jpg`],
    },
  };
}

export default async function PhotoDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { from } = await searchParams;
  const photoId = Number(id);
  if (isNaN(photoId)) notFound();

  const [photo, nav] = await Promise.all([
    getPhoto(photoId),
    getContextNavigation(from, photoId),
  ]);

  if (!photo) notFound();

  const photographerSlug = buildSlug(photo.firstName, photo.lastName);
  const fullName = `${photo.firstName} ${photo.lastName}`.trim();
  const fromParam = from ? `?from=${encodeURIComponent(from)}` : '';

  const keywordList = photo.keywords
    ? photo.keywords.split('|').map(k => k.trim()).filter(Boolean)
    : [];

  const hasPrice = photo.price && photo.price > 0;
  const formattedPrice = hasPrice
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(photo.price)
    : null;

  return (
    <div className={styles.container}>

      {/* Back navigation */}
      <Link href={nav.backHref} className={styles.backLink}>
        ← {nav.backLabel}
      </Link>

      {/* Two-column layout */}
      <div className={styles.layout}>

        {/* Left: Photo */}
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://hertzmann.net/pages/photos/${photo.photographer}_${photo.id}.jpg`}
            alt={photo.title}
            className={styles.photoImg}
          />
        </div>

        {/* Right: Metadata */}
        <div>
          <h1 className={styles.title}>
            {photo.title}
          </h1>

          <Link
            href={`/photographs/photographer/${photographerSlug}`}
            className={styles.photographerLink}
          >
            {fullName}
          </Link>

          {photo.years && (
            <p className={styles.years}>
              {decodeHtmlEntities(photo.years)}
            </p>
          )}

          {/* Core metadata */}
          <dl className={styles.dl}>
            {photo.medium && (
              <>
                <dt className={styles.dt}>Medium</dt>
                <dd className={styles.dd}>{photo.medium}</dd>
              </>
            )}
            {photo.date && (
              <>
                <dt className={styles.dt}>Date</dt>
                <dd className={styles.dd}>{photo.date}</dd>
              </>
            )}
            {photo.width && photo.height && (
              <>
                <dt className={styles.dt}>Size</dt>
                <dd className={styles.dd}>{photo.width}&quot; × {photo.height}&quot;</dd>
              </>
            )}
            {photo.inventoryNumber && (
              <>
                <dt className={styles.dt}>Inventory</dt>
                <dd className={styles.dd}>{photo.inventoryNumber}</dd>
              </>
            )}
            {formattedPrice && (
              <>
                <dt className={styles.dt}>Price</dt>
                <dd className={styles.ddPrice}>{formattedPrice}</dd>
              </>
            )}
          </dl>

          {/* Description */}
          {photo.description && (
            <div className={styles.descBlock}>
              <p className={styles.sectionLabel}>Description</p>
              <p className={styles.descText}>{photo.description}</p>
            </div>
          )}

          {/* Provenance */}
          {photo.provenance && (
            <div className={styles.descBlock}>
              <p className={styles.sectionLabel}>Provenance</p>
              <p className={styles.provText}>{photo.provenance}</p>
            </div>
          )}

          {/* Keywords */}
          {keywordList.length > 0 && (
            <div className={styles.keywordsWrap}>
              <p className={styles.sectionLabel}>Subjects</p>
              <div className={styles.keywordTags}>
                {keywordList.map(kw => (
                  <Link
                    key={kw}
                    href={`/photographs/subject/${encodeURIComponent(kw)}`}
                    className={styles.keywordTag}
                  >
                    {kw}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Inquire CTA */}
          <Link
            href={`/contact?photo=${photo.id}&title=${encodeURIComponent(photo.title)}`}
            className={styles.inquireBtn}
          >
            Inquire About This Photo
          </Link>
        </div>
      </div>

      {/* Prev / Next navigation */}
      {(nav.prev !== null || nav.next !== null) && (
        <nav className={styles.navBar}>
          {nav.prev !== null ? (
            <Link
              href={`/photographs/photo/${nav.prev}${fromParam}`}
              className={styles.navLink}
            >
              ← Previous
            </Link>
          ) : <span />}
          {nav.next !== null ? (
            <Link
              href={`/photographs/photo/${nav.next}${fromParam}`}
              className={styles.navLink}
            >
              Next →
            </Link>
          ) : <span />}
        </nav>
      )}
    </div>
  );
}
