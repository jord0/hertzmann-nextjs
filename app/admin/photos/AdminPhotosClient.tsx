'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

export interface PhotoRow {
  id: number;
  title: string;
  enabled: number;
  photographerId: number;
  firstName: string;
  lastName: string;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function AdminPhotosClient({ photos }: { photos: PhotoRow[] }) {
  const [search, setSearch] = useState('');
  const q = search.trim().toLowerCase();

  const groups = useMemo(() => {
    const map = new Map<number, { firstName: string; lastName: string; photos: PhotoRow[] }>();

    for (const photo of photos) {
      const nameMatch = `${photo.firstName} ${photo.lastName}`.toLowerCase().includes(q);
      const titleMatch = photo.title.toLowerCase().includes(q);
      if (q && !nameMatch && !titleMatch) continue;

      if (!map.has(photo.photographerId)) {
        map.set(photo.photographerId, {
          firstName: photo.firstName,
          lastName: photo.lastName,
          photos: [],
        });
      }

      const group = map.get(photo.photographerId)!;
      // If searching by title only (not matching name), filter photos within group
      if (q && !nameMatch) {
        if (titleMatch) group.photos.push(photo);
      } else {
        group.photos.push(photo);
      }
    }

    // Remove empty groups
    for (const [id, group] of map.entries()) {
      if (group.photos.length === 0) map.delete(id);
    }

    return map;
  }, [photos, q]);

  const activeLetters = useMemo(
    () => new Set(photos.map(p => (p.lastName?.[0] || '#').toUpperCase())),
    [photos]
  );

  const sortedGroups = Array.from(groups.entries()).sort(([, a], [, b]) =>
    a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName)
  );

  const totalPhotos = photos.length;
  const filteredPhotos = sortedGroups.reduce((n, [, g]) => n + g.photos.length, 0);

  return (
    <div>
      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search photographer or photo title..."
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
            {filteredPhotos} of {totalPhotos} photos
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

      {/* Groups */}
      {sortedGroups.length === 0 ? (
        <p style={{ color: '#888', fontSize: '0.9rem' }}>No results for &ldquo;{search}&rdquo;.</p>
      ) : (
        sortedGroups.map(([photographerId, group]) => {
          const letter = (group.lastName?.[0] || '#').toUpperCase();
          return (
            <div key={photographerId} id={!q ? `letter-${letter}` : undefined} style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.5rem', color: '#333' }}>
                {group.firstName} {group.lastName}
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '6px', overflow: 'hidden', border: '1px solid #ddd' }}>
                <tbody>
                  {group.photos.map((photo, i) => (
                    <tr key={photo.id} style={{ borderTop: i > 0 ? '1px solid #eee' : 'none' }}>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        {photo.title || <em style={{ color: '#aaa' }}>Untitled</em>}
                      </td>
                      <td style={{ padding: '0.65rem 1rem', width: '100px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '3px',
                          fontSize: '0.8rem',
                          backgroundColor: photo.enabled ? '#dcfce7' : '#f3f4f6',
                          color: photo.enabled ? '#15803d' : '#6b7280',
                        }}>
                          {photo.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'right', width: '60px' }}>
                        <Link
                          href={`/admin/photos/${photo.id}`}
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
          );
        })
      )}
    </div>
  );
}
