import Link from 'next/link';
import { decodeHtmlEntities } from '@/lib/htmlDecode';
import styles from './PhotoDetail.module.css';

export interface PhotoData {
  id: number;
  photographer: number;
  firstName: string;
  lastName: string;
  years: string | null;
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

export interface NavContext {
  backHref: string;
  backLabel: string;
  prevHref: string | null;
  nextHref: string | null;
}

function buildSlug(firstName: string, lastName: string) {
  return `${firstName || ''}-${lastName}`
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/^-+|-+$/g, '');
}

export function PhotoDetail({ photo, nav }: { photo: PhotoData; nav: NavContext }) {
  const photographerSlug = buildSlug(photo.firstName, photo.lastName);
  const fullName = `${photo.firstName} ${photo.lastName}`.trim();

  const keywordList = photo.keywords
    ? photo.keywords.split('|').map(k => k.trim()).filter(Boolean)
    : [];

  const hasPrice = photo.price && photo.price > 0;
  const formattedPrice = hasPrice
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(photo.price)
    : null;

  return (
    <div className={styles.container}>

      <Link href={nav.backHref} className={styles.backLink}>
        ← {nav.backLabel}
      </Link>

      <div className={styles.layout}>

        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://hertzmann.net/pages/photos/${photo.photographer}_${photo.id}.jpg`}
            alt={photo.title}
            className={styles.photoImg}
          />
        </div>

        <div>
          <h1 className={styles.title}>
            {decodeHtmlEntities(photo.title)}
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

          {photo.description && (
            <div className={styles.descBlock}>
              <p className={styles.sectionLabel}>Description</p>
              <p className={styles.descText}>{photo.description}</p>
            </div>
          )}

          {photo.provenance && (
            <div className={styles.descBlock}>
              <p className={styles.sectionLabel}>Provenance</p>
              <p className={styles.provText}>{photo.provenance}</p>
            </div>
          )}

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

          <Link
            href={`/contact?photo=${photo.id}&title=${encodeURIComponent(photo.title)}`}
            className={styles.inquireBtn}
          >
            Inquire About This Photo
          </Link>
        </div>
      </div>

      {(nav.prevHref || nav.nextHref) && (
        <nav className={styles.navBar}>
          {nav.prevHref ? (
            <Link href={nav.prevHref} className={styles.navLink}>← Previous</Link>
          ) : <span />}
          {nav.nextHref ? (
            <Link href={nav.nextHref} className={styles.navLink}>Next →</Link>
          ) : <span />}
        </nav>
      )}
    </div>
  );
}
