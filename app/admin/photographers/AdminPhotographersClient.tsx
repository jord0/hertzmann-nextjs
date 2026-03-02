'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

export interface PhotographerRow {
  id: number;
  firstName: string;
  lastName: string;
  enabled: number;
  photoCount: number;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function AdminPhotographersClient({ photographers }: { photographers: PhotographerRow[] }) {
  const [search, setSearch] = useState('');
  const q = search.trim().toLowerCase();

  const filtered = useMemo(() =>
    q
      ? photographers.filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(q))
      : photographers,
    [photographers, q]
  );

  const groups = useMemo(() => {
    const map: Record<string, PhotographerRow[]> = {};
    for (const p of filtered) {
      const letter = (p.lastName?.[0] || '#').toUpperCase();
      if (!map[letter]) map[letter] = [];
      map[letter].push(p);
    }
    return map;
  }, [filtered]);

  const activeLetters = useMemo(
    () => new Set(photographers.map(p => (p.lastName?.[0] || '#').toUpperCase())),
    [photographers]
  );

  const letters = Object.keys(groups).sort();

  return (
    <div>
      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search photographers..."
          style={{
            flex: 1,
            maxWidth: '400px',
            padding: '0.5rem 0.75rem',
            fontSize: '0.9rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '0.85rem' }}
          >
            ✕ Clear
          </button>
        )}
        {q && (
          <span style={{ fontSize: '0.85rem', color: '#888' }}>
            {filtered.length} of {photographers.length} photographers
          </span>
        )}
      </div>

      {/* Alphabet jump nav */}
      {!q && (
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {ALPHABET.map(letter => {
            const active = activeLetters.has(letter);
            return active ? (
              <a
                key={letter}
                href={`#letter-${letter}`}
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#0066cc',
                  textDecoration: 'none',
                  padding: '0.2rem 0.3rem',
                  lineHeight: 1,
                }}
              >
                {letter}
              </a>
            ) : (
              <span
                key={letter}
                style={{ fontSize: '0.8rem', color: '#ccc', padding: '0.2rem 0.3rem', lineHeight: 1 }}
              >
                {letter}
              </span>
            );
          })}
        </div>
      )}

      {/* Results */}
      {letters.length === 0 ? (
        <p style={{ color: '#888', fontSize: '0.9rem' }}>No results for &ldquo;{search}&rdquo;.</p>
      ) : (
        letters.map(letter => (
          <div key={letter} id={!q ? `letter-${letter}` : undefined} style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
              {letter}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '6px', overflow: 'hidden', border: '1px solid #ddd' }}>
              <tbody>
                {groups[letter].map((p, i) => (
                  <tr key={p.id} style={{ borderTop: i > 0 ? '1px solid #eee' : 'none' }}>
                    <td style={{ padding: '0.65rem 1rem' }}>{p.firstName} {p.lastName}</td>
                    <td style={{ padding: '0.65rem 1rem', color: '#666', width: '80px' }}>{p.photoCount} photos</td>
                    <td style={{ padding: '0.65rem 1rem', width: '100px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '3px',
                        fontSize: '0.8rem',
                        backgroundColor: p.enabled ? '#dcfce7' : '#f3f4f6',
                        color: p.enabled ? '#15803d' : '#6b7280',
                      }}>
                        {p.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'right', width: '60px' }}>
                      <Link
                        href={`/admin/photographers/${p.id}`}
                        style={{ color: '#0066cc', textDecoration: 'none', fontSize: '0.9rem' }}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
