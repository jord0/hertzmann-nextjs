import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { query } from '@/lib/db';
import { decodeHtmlEntities } from '@/lib/htmlDecode';

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
    <>
      <style>{`
        .photo-detail-layout {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
          gap: 3rem;
          align-items: start;
        }
        @media (max-width: 768px) {
          .photo-detail-layout {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
        .photo-detail-back:hover { opacity: 0.7; }
        .photo-detail-photographer:hover { text-decoration: underline; }
        .keyword-tag:hover { background: #333; color: white; }
        .photo-nav-link:hover { opacity: 0.7; }
        .inquire-btn:hover { background: #333 !important; }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

        {/* Back navigation */}
        <Link
          href={nav.backHref}
          className="photo-detail-back"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#555', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.95rem' }}
        >
          ← {nav.backLabel}
        </Link>

        {/* Two-column layout */}
        <div className="photo-detail-layout">

          {/* Left: Photo */}
          <div>
            <img
              src={`https://hertzmann.net/pages/photos/${photo.photographer}_${photo.id}.jpg`}
              alt={photo.title}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>

          {/* Right: Metadata */}
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '600', margin: '0 0 0.4rem', lineHeight: 1.3 }}>
              {photo.title}
            </h1>

            <Link
              href={`/photographs/photographer/${photographerSlug}`}
              className="photo-detail-photographer"
              style={{ display: 'block', color: '#0066cc', textDecoration: 'none', fontSize: '1.05rem', marginBottom: '0.2rem' }}
            >
              {fullName}
            </Link>

            {photo.years && (
              <p style={{ color: '#666', fontStyle: 'italic', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>
                {decodeHtmlEntities(photo.years)}
              </p>
            )}

            {/* Core metadata */}
            <dl style={{ margin: '0 0 1.5rem', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 1.25rem', alignItems: 'baseline' }}>
              {photo.medium && (
                <>
                  <dt style={dtStyle}>Medium</dt>
                  <dd style={{ margin: 0, fontSize: '0.95rem' }}>{photo.medium}</dd>
                </>
              )}
              {photo.date && (
                <>
                  <dt style={dtStyle}>Date</dt>
                  <dd style={{ margin: 0, fontSize: '0.95rem' }}>{photo.date}</dd>
                </>
              )}
              {photo.width && photo.height && (
                <>
                  <dt style={dtStyle}>Size</dt>
                  <dd style={{ margin: 0, fontSize: '0.95rem' }}>{photo.width}" × {photo.height}"</dd>
                </>
              )}
              {photo.inventoryNumber && (
                <>
                  <dt style={dtStyle}>Inventory</dt>
                  <dd style={{ margin: 0, fontSize: '0.95rem' }}>{photo.inventoryNumber}</dd>
                </>
              )}
              {formattedPrice && (
                <>
                  <dt style={dtStyle}>Price</dt>
                  <dd style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>{formattedPrice}</dd>
                </>
              )}
            </dl>

            {/* Description */}
            {photo.description && (
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ color: '#888', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 0.4rem' }}>Description</p>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, color: '#333' }}>{photo.description}</p>
              </div>
            )}

            {/* Provenance */}
            {photo.provenance && (
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ color: '#888', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 0.4rem' }}>Provenance</p>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6, color: '#555' }}>{photo.provenance}</p>
              </div>
            )}

            {/* Keywords */}
            {keywordList.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ color: '#888', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 0.5rem' }}>Subjects</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {keywordList.map(kw => (
                    <Link
                      key={kw}
                      href={`/photographs/subject/${encodeURIComponent(kw)}`}
                      className="keyword-tag"
                      style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.65rem',
                        border: '1px solid #ccc',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                        color: '#444',
                        textDecoration: 'none',
                        transition: 'background 0.15s, color 0.15s',
                      }}
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
              className="inquire-btn"
              style={{
                display: 'inline-block',
                marginTop: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#1a1a1a',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '0.9rem',
                transition: 'background 0.15s',
              }}
            >
              Inquire About This Photo
            </Link>
          </div>
        </div>

        {/* Prev / Next navigation */}
        {(nav.prev !== null || nav.next !== null) && (
          <nav style={{
            marginTop: '3rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            {nav.prev !== null ? (
              <Link
                href={`/photographs/photo/${nav.prev}${fromParam}`}
                className="photo-nav-link"
                style={{ color: '#333', textDecoration: 'none', fontSize: '0.95rem' }}
              >
                ← Previous
              </Link>
            ) : <span />}
            {nav.next !== null ? (
              <Link
                href={`/photographs/photo/${nav.next}${fromParam}`}
                className="photo-nav-link"
                style={{ color: '#333', textDecoration: 'none', fontSize: '0.95rem' }}
              >
                Next →
              </Link>
            ) : <span />}
          </nav>
        )}
      </div>
    </>
  );
}

const dtStyle: React.CSSProperties = {
  color: '#888',
  fontSize: '0.75rem',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  whiteSpace: 'nowrap',
};
