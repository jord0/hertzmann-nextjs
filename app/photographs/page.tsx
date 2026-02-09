'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Photographer {
  id: number;
  firstName: string;
  lastName: string;
  slug: string;
}

export default function PhotographsPage() {
  const [view, setView] = useState('photographers');
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(data => {
        setPhotographers(data.photographers);
        setKeywords(data.keywords);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1>Browse Photographs</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setView('photographers')}
          style={{
            padding: '0.75rem 1.5rem',
            border: '2px solid #333',
            backgroundColor: view === 'photographers' ? '#333' : 'white',
            color: view === 'photographers' ? 'white' : '#333',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          By Photographer
        </button>
        <button
          onClick={() => setView('subjects')}
          style={{
            padding: '0.75rem 1.5rem',
            border: '2px solid #333',
            backgroundColor: view === 'subjects' ? '#333' : 'white',
            color: view === 'subjects' ? 'white' : '#333',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          By Subject
        </button>
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