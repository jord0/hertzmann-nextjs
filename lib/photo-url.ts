const base = process.env.NEXT_PUBLIC_PHOTOS_BASE_URL ?? '/photos';

export function photoImageUrl(photographerId: number | string, photoId: number | string): string {
  return `${base}/${photographerId}_${photoId}.jpg`;
}
