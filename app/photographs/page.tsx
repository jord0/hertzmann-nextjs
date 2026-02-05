import Link from 'next/link';
import { query } from '@/lib/db';

interface Photographer {
  id: number;
  firstName: string;
  lastName: string;
  slug: string;
}

interface Props {
  searchParams: Promise<{ view?: string }>;
}

async function getPhotographers(): Promise<Photographer[]> {
  const sql = `
    SELECT p.id, p.firstName, p.lastName
    FROM photographers p
    WHERE p.enabled = 1
    ORDER BY p.lastName, p.firstName
  `;
  
  const results = await query(sql) as any[];
  
  return results.map((p: any) => ({
    ...p,
    slug: `${p.firstName || ''}-${p.lastName}`.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/^-+|-+$/g, '')
  }));
}
async function getKeywords(): Promise<string[]> {
  const sql = `
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
  `;
  
  const results = await query(sql) as any[];
  return results.map(r => r.keyword);
}

export default async function PhotographsPage({ searchParams }: Props) {
  const params = await searchParams;
  const view = params.view || 'photographers';
  
  const [photographers, keywords] = await Promise.all([
    getPhotographers(),
    getKeywords()
  ]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1>Browse Photographs</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <Link 
          href="/photographs?view=photographers"
          style={{
            padding: '0.75rem 1.5rem',
            border: '2px solid #333',
            backgroundColor: view === 'photographers' ? '#333' : 'white',
            color: view === 'photographers' ? 'white' : '#333',
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          By Photographer
        </Link>
        <Link 
          href="/photographs?view=subjects"
          style={{
            padding: '0.75rem 1.5rem',
            border: '2px solid #333',
            backgroundColor: view === 'subjects' ? '#333' : 'white',
            color: view === 'subjects' ? 'white' : '#333',
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          By Subject
        </Link>
      </div>

      {view === 'photographers' && (
        <div>
          <h2>Photographers ({photographers.length})</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginTop: '1rem'
          }}>
            {photographers.map(p => (
              <Link 
                key={p.id}
                href={`/photographs/photographer/${p.slug}`}
                style={{
                  padding: '1.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: '#333'
                }}
              >
                <h3>{p.firstName} {p.lastName}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}

      {view === 'subjects' && (
        <div>
          <h2>Subjects ({keywords.length})</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginTop: '1rem'
          }}>
            {keywords.map(keyword => (
              <Link 
                key={keyword}
                href={`/photographs/subject/${encodeURIComponent(keyword)}`}
                style={{
                  padding: '1.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: '#333'
                }}
              >
                <h3>{keyword}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}