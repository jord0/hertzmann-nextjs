import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { query } from '@/lib/db';
import { PhotoDetail } from '@/app/photographs/_components/PhotoDetail';
import type { PhotoData } from '@/app/photographs/_components/PhotoDetail';

interface PageProps {
  params: Promise<{ slug: string; id: string }>;
}

function buildSlug(firstName: string, lastName: string) {
  return `${firstName || ''}-${lastName}`
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/^-+|-+$/g, '');
}

async function getPhoto(id: number): Promise<PhotoData | null> {
  const results = await query(
    `SELECT p.id, p.photographer, p.title, p.medium, p.date, p.height, p.width,
            p.price, p.description, p.provenance, p.inventoryNumber, p.keywords,
            ph.firstName, ph.lastName, ph.years, ph.country
     FROM photos p
     JOIN photographers ph ON p.photographer = ph.id
     WHERE p.id = ? AND p.enabled = 1`,
    [id]
  ) as PhotoData[];
  return results[0] ?? null;
}

async function getPhotographer(slug: string) {
  const all = await query('SELECT id, firstName, lastName FROM photographers WHERE enabled = 1') as any[];
  return all.find((p: any) => buildSlug(p.firstName, p.lastName) === slug) ?? null;
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

export default async function PhotographerPhotoPage({ params }: PageProps) {
  const { slug, id } = await params;
  const photoId = Number(id);
  if (isNaN(photoId)) notFound();

  const [photo, photographer] = await Promise.all([
    getPhoto(photoId),
    getPhotographer(slug),
  ]);

  if (!photo || !photographer) notFound();

  const photos = await query(
    'SELECT id FROM photos WHERE photographer = ? AND enabled = 1 ORDER BY title',
    [photographer.id]
  ) as { id: number }[];

  const idx = photos.findIndex(p => p.id === photoId);
  const nav = {
    backHref: `/photographs/photographer/${slug}`,
    backLabel: `${photographer.firstName} ${photographer.lastName}`,
    prevHref: idx > 0 ? `/photographs/photographer/${slug}/${photos[idx - 1].id}` : null,
    nextHref: idx < photos.length - 1 ? `/photographs/photographer/${slug}/${photos[idx + 1].id}` : null,
  };

  return <PhotoDetail photo={photo} nav={nav} />;
}
