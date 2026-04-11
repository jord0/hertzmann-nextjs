import type { MetadataRoute } from 'next';
import { getBrowseData } from '@/lib/browse-data';

const BASE_URL = 'https://www.hertzmann.net';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { photographers, keywords } = await getBrowseData();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE_URL}/photographs`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/catalogs`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/about`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE_URL}/sell-to-us`, changeFrequency: 'yearly', priority: 0.5 },
  ];

  const photographerRoutes: MetadataRoute.Sitemap = photographers
    .filter(p => p.hasEnabledPhotos)
    .map(p => ({
      url: `${BASE_URL}/photographs/photographer/${p.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));

  const subjectRoutes: MetadataRoute.Sitemap = keywords.map(keyword => ({
    url: `${BASE_URL}/photographs/subject/${encodeURIComponent(keyword)}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...photographerRoutes, ...subjectRoutes];
}
