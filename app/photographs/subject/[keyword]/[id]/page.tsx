import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { query } from '@/lib/db';
import { PhotoDetail } from '@/app/photographs/_components/PhotoDetail';
import type { PhotoData } from '@/app/photographs/_components/PhotoDetail';

interface PageProps {
  params: Promise<{ keyword: string; id: string }>;
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
      images: [`https://hertzmann.net/pages/photos/${photo.photographer}_${photo.id}.jpg`],
    },
  };
}

export default async function SubjectPhotoPage({ params }: PageProps) {
  const { keyword, id } = await params;
  const photoId = Number(id);
  const decodedKeyword = decodeURIComponent(keyword);
  if (isNaN(photoId)) notFound();

  const [photo, photos] = await Promise.all([
    getPhoto(photoId),
    query(
      `SELECT p.id FROM photos p
       JOIN photographers ph ON p.photographer = ph.id
       WHERE p.enabled = 1 AND p.keywords LIKE ?
       ORDER BY ph.lastName, ph.firstName, p.title`,
      [`%|${decodedKeyword}|%`]
    ) as Promise<{ id: number }[]>,
  ]);

  if (!photo) notFound();

  const idx = (photos as { id: number }[]).findIndex(p => p.id === photoId);
  const photoList = photos as { id: number }[];
  const encodedKeyword = encodeURIComponent(decodedKeyword);
  const nav = {
    backHref: `/photographs/subject/${encodedKeyword}`,
    backLabel: decodedKeyword,
    prevHref: idx > 0 ? `/photographs/subject/${encodedKeyword}/${photoList[idx - 1].id}` : null,
    nextHref: idx < photoList.length - 1 ? `/photographs/subject/${encodedKeyword}/${photoList[idx + 1].id}` : null,
  };

  return <PhotoDetail photo={photo} nav={nav} />;
}
