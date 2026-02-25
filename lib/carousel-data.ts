import { unstable_cache } from 'next/cache';
import { query } from './db';

export interface CarouselPhoto {
  id: number;
  photographer: number;
  title: string;
  medium: string;
  date: string;
  firstName: string;
  lastName: string;
}

async function fetchCarouselPhotos(): Promise<CarouselPhoto[]> {
  const rows = (await query(
    `SELECT p.id, p.photographer, p.title, p.medium, p.date, ph.firstName, ph.lastName
     FROM photos p
     JOIN photographers ph ON ph.id = p.photographer
     WHERE p.enabled = 1 AND ph.enabled = 1
     ORDER BY RAND()
     LIMIT 8`
  )) as CarouselPhoto[];
  return rows;
}

export const getCarouselPhotos = unstable_cache(fetchCarouselPhotos, ['carousel-photos'], {
  tags: ['carousel-photos'],
  revalidate: 3600,
});
