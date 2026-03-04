'use client';

import { useState } from 'react';

export default function PhotoUploadControls() {
  const [filename, setFilename] = useState<string | null>(null);

  return (
    <>
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
          Image (JPEG) <span style={{ color: 'red' }}>*</span>
        </p>
        <label
          htmlFor="photo-image"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            backgroundColor: '#333',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          <span>↑</span> Select Photo
        </label>
        <input
          id="photo-image"
          name="image"
          type="file"
          accept="image/jpeg"
          required
          style={{ display: 'none' }}
          onChange={e => setFilename(e.target.files?.[0]?.name ?? null)}
        />
        <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: filename ? '#333' : '#888' }}>
          {filename ?? 'No file chosen.'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button
          type="submit"
          disabled={!filename}
          style={{
            padding: '0.85rem 2rem',
            backgroundColor: filename ? '#F0B23C' : '#aaa',
            color: filename ? '#1a1a1a' : 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: filename ? 'pointer' : 'not-allowed',
            fontSize: '1.1rem',
            fontWeight: 600,
          }}
        >
          Add Photo
        </button>
      </div>
    </>
  );
}
