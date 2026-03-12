const base = process.env.NEXT_PUBLIC_CATALOGS_BASE_URL ?? '/catalogs';

export function catalogPdfUrl(catalogId: number | string): string {
  return `${base}/${catalogId}.pdf`;
}

export function catalogImageUrl(catalogId: number | string): string {
  return `${base}/${catalogId}.jpg`;
}
