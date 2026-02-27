import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { query } from '@/lib/db';
import { PhotoDetail } from '@/app/photographs/_components/PhotoDetail';
import type { PhotoData } from '@/app/photographs/_components/PhotoDetail';
import { photoImageUrl } from '@/lib/photo-url';

interface PageProps {
  params: Promise<{ id: string }>;
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
      images: [photoImageUrl(photo.photographer, photo.id)],
    },
  };
}

export default async function PhotoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const photoId = Number(id);
  if (isNaN(photoId)) notFound();

  const photo = await getPhoto(photoId);
  if (!photo) notFound();

  const nav = {
    backHref: '/photographs',
    backLabel: 'All Photographs',
    prevHref: null,
    nextHref: null,
  };

  return <PhotoDetail photo={photo} nav={nav} />;
}
