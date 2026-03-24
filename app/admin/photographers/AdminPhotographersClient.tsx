'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import adminStyles from '@/app/admin/admin.module.css';

export interface PhotographerRow {
  id: number;
  firstName: string;
  lastName: string;
  enabled: number;
  photoCount: number;
  updatedAt: string | null;
}

function formatTs(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Height of AdminNav — sticky header sits flush below it
const NAV_HEIGHT = 52;

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
      {/* Sticky header — pulls to main edges via negative margin, restores padding inside */}
      <div style={{
        position: 'sticky',
        top: NAV_HEIGHT,
        zIndex: 10,
        background: '#f9f9f9',
        marginLeft: '-2rem',
        marginRight: '-2rem',
        marginTop: '-2rem',
        paddingLeft: '2rem',
        paddingRight: '2rem',
        paddingTop: '1.5rem',
      }}>
        {/* Title + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Photographers</h1>
          <Link href="/admin/photographers/new" className={adminStyles.btnPrimarySmall}>
            + Add Photographer
          </Link>
        </div>

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

        {/* Alphabet nav */}
        {!q && (
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {ALPHABET.map(letter => {
              const active = activeLetters.has(letter);
              return active ? (
                <a
                  key={letter}
                  href={`#letter-${letter}`}
                  style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0066cc', textDecoration: 'none', padding: '0.2rem 0.3rem', lineHeight: 1 }}
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

        {/* Column headers — grid widths match colgroup below */}
        {letters.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 95px 170px 110px 60px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ddd',
            borderBottom: 'none',
            borderRadius: '6px 6px 0 0',
          }}>
            <span style={thStyle}>Name</span>
            <span style={thStyle}>Photos</span>
            <span style={thStyle}>Last Edited</span>
            <span style={thStyle}>Status</span>
            <span style={thStyle}></span>
          </div>
        )}
      </div>

      {/* Table */}
      {letters.length === 0 ? (
        <p style={{ color: '#888', fontSize: '0.9rem' }}>No results for &ldquo;{search}&rdquo;.</p>
      ) : (
        <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '0 0 6px 6px', border: '1px solid #ddd' }}>
          <colgroup>
            <col />
            <col style={{ width: '95px' }} />
            <col style={{ width: '170px' }} />
            <col style={{ width: '110px' }} />
            <col style={{ width: '60px' }} />
          </colgroup>
          <tbody>
            {letters.map(letter => (
              <React.Fragment key={letter}>
                {!q && <tr id={`letter-${letter}`}><td colSpan={5} style={{ padding: 0, height: 0, border: 'none' }} /></tr>}
                {groups[letter].map(p => (
                  <tr key={p.id} style={{ borderTop: '1px solid #eee' }}>
                    <td style={{ padding: '0.45rem 1rem' }}>{p.firstName} {p.lastName}</td>
                    <td style={{ padding: '0.45rem 1rem', color: '#666' }}>{p.photoCount}</td>
                    <td style={{ padding: '0.45rem 1rem', color: '#888', fontSize: '0.8rem' }}>{formatTs(p.updatedAt)}</td>
                    <td style={{ padding: '0.45rem 1rem' }}>
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
                    <td style={{ padding: '0.45rem 1rem', textAlign: 'right' }}>
                      <Link
                        href={`/admin/photographers/${p.id}`}
                        style={{ color: '#0066cc', textDecoration: 'none', fontSize: '0.9rem' }}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  fontWeight: 600,
  fontSize: '0.85rem',
  color: '#555',
};
