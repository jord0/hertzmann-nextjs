'use client';

import { useState } from 'react';
import Link from 'next/link';

// We'll embed the data directly in the client component for now
// Later we can optimize this

export default function PhotographsPage() {
  const [view, setView] = useState('photographers');

  // This data will be fetched on the client side
  // For static export, we need a different approach than server-side data fetching
  
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
          <h2>Photographers</h2>
          <p>Coming soon - photographer list will load here</p>
        </div>
      )}

      {view === 'subjects' && (
        <div>
          <h2>Subjects</h2>
          <p>Coming soon - subject list will load here</p>
        </div>
      )}
    </div>
  );
}