import { writeFileSync } from 'fs';
import mysql from 'mysql2/promise';

async function generateData() {
  const connection = await mysql.createConnection({
    host: 'yamanote.proxy.rlwy.net',
    port: 54621,
    user: 'root',
    password: 'mxaVjtngYNIRqgnkgstCGvMUOBmIcETx',
    database: 'railway'
  });

  // Get photographers
  const [photographers] = await connection.execute(
    'SELECT id, firstName, lastName FROM photographers WHERE enabled = 1 ORDER BY lastName, firstName'
  ) as any;

  const photographersWithSlugs = photographers.map((p: any) => ({
    ...p,
    slug: `${p.firstName || ''}-${p.lastName}`
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/^-+|-+$/g, '')
  }));

  // Get keywords
  const [keywords] = await connection.execute(`
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
  `) as any;

  const keywordsList = keywords.map((k: any) => k.keyword);

  await connection.end();

  // Write to public directory
  writeFileSync(
    'public/data.json',
    JSON.stringify({ photographers: photographersWithSlugs, keywords: keywordsList }, null, 2)
  );

  console.log('✅ Generated data.json');
}

generateData().catch(console.error);