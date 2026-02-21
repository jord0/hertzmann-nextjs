import { unstable_cache } from 'next/cache';
import { query } from './db';

export interface BrowsePhotographer {
  id: number;
  firstName: string;
  lastName: string;
  slug: string;
}

function makeSlug(firstName: string, lastName: string): string {
  return `${firstName || ''}-${lastName}`
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/^-+|-+$/g, '');
}

async function fetchBrowseData(): Promise<{ photographers: BrowsePhotographer[]; keywords: string[] }> {
  const photographers = (await query(
    'SELECT id, firstName, lastName FROM photographers WHERE enabled = 1 ORDER BY lastName, firstName'
  )) as { id: number; firstName: string; lastName: string }[];

  const photographersWithSlugs: BrowsePhotographer[] = photographers.map(p => ({
    ...p,
    slug: makeSlug(p.firstName, p.lastName),
  }));

  const keywordRows = (await query(`
    SELECT DISTINCT TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(keywords, '|', n), '|', -1)) as keyword
    FROM photos
    CROSS JOIN (
      SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
      UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
    ) numbers
    WHERE CHAR_LENGTH(keywords) - CHAR_LENGTH(REPLACE(keywords, '|', '')) >= n - 1
    AND keywords IS NOT NULL
    AND keywords != ''
    AND TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(keywords, '|', n), '|', -1)) != ''
    ORDER BY keyword
  `)) as { keyword: string }[];

  const keywords = keywordRows.map(k => k.keyword);

  return { photographers: photographersWithSlugs, keywords };
}

export const getBrowseData = unstable_cache(fetchBrowseData, ['browse-data'], {
  tags: ['browse-data'],
});
