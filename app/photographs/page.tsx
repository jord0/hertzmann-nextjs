'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface Photographer {
  id: number;
  firstName: string;
  lastName: string;
  slug: string;
}

// Renders text with the matched portion wrapped in a <mark>
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} style={{ backgroundColor: '#fef08a', padding: 0, borderRadius: '2px' }}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  resultCount: number;
  totalCount: number;
  noun: string;
}

function SearchInput({ value, onChange, placeholder, resultCount, totalCount, noun }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const clear = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  // Escape key clears the field
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && value) {
      e.preventDefault();
      clear();
    }
  };

  const countLabel = value.trim()
    ? `${resultCount} of ${totalCount} ${noun}`
    : `${totalCount} ${noun}`;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ position: 'relative' }}>
        {/* Search icon */}
        <span style={{
          position: 'absolute',
          left: '0.85rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#aaa',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={placeholder}
          style={{
            width: '100%',
            padding: '0.75rem 2.5rem 0.75rem 2.5rem',
            fontSize: '1rem', // 16px — prevents iOS auto-zoom
            border: '1px solid #ccc',
            borderRadius: '6px',
            outline: 'none',
            boxSizing: 'border-box',
            backgroundColor: 'white',
          }}
        />

        {/* Clear button — only visible when there's input */}
        {value && (
          <button
            onClick={clear}
            aria-label="Clear search"
            style={{
              position: 'absolute',
              right: '0.6rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#e5e5e5',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              color: '#555',
              fontSize: '0.85rem',
              width: '1.4rem',
              height: '1.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Live result count */}
      <p
        aria-live="polite"
        aria-atomic="true"
        style={{ margin: '0.4rem 0 0', color: '#888', fontSize: '0.85rem' }}
      >
        {countLabel}
      </p>
    </div>
  );
}

export default function PhotographsPage() {
  const [view, setView] = useState<'photographers' | 'subjects'>('photographers');
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [photographerSearch, setPhotographerSearch] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');

  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(data => {
        setPhotographers(data.photographers);
        setKeywords(data.keywords);
        setLoading(false);
      });
  }, []);

  const filteredPhotographers = photographerSearch.trim()
    ? photographers.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(photographerSearch.toLowerCase())
      )
    : photographers;

  const filteredKeywords = subjectSearch.trim()
    ? keywords.filter(k => k.toLowerCase().includes(subjectSearch.toLowerCase()))
    : keywords;

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1>Browse Photographs</h1>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setView('photographers')}
          style={{
            padding: '0.75rem 1.5rem',
            border: '2px solid #333',
            backgroundColor: view === 'photographers' ? '#333' : 'white',
            color: view === 'photographers' ? 'white' : '#333',
            cursor: 'pointer',
            borderRadius: '4px',
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
            borderRadius: '4px',
          }}
        >
          By Subject
        </button>
      </div>

      {/* Photographers */}
      {view === 'photographers' && (
        <div>
          <SearchInput
            value={photographerSearch}
            onChange={setPhotographerSearch}
            placeholder="Search photographers…"
            resultCount={filteredPhotographers.length}
            totalCount={photographers.length}
            noun="photographers"
          />

          {filteredPhotographers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#666' }}>
              <p style={{ marginBottom: '0.75rem' }}>No photographers match &ldquo;{photographerSearch}&rdquo;</p>
              <button
                onClick={() => setPhotographerSearch('')}
                style={{ color: '#0066cc', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem', textDecoration: 'underline', padding: 0 }}
              >
                Clear search
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1.5rem',
            }}>
              {filteredPhotographers.map(p => (
                <Link
                  key={p.id}
                  href={`/photographs/photographer/${p.slug}`}
                  style={{
                    padding: '1.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#333',
                    display: 'block',
                  }}
                >
                  <h3 style={{ margin: 0 }}>
                    <Highlight text={`${p.firstName} ${p.lastName}`} query={photographerSearch} />
                  </h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subjects */}
      {view === 'subjects' && (
        <div>
          <SearchInput
            value={subjectSearch}
            onChange={setSubjectSearch}
            placeholder="Search subjects…"
            resultCount={filteredKeywords.length}
            totalCount={keywords.length}
            noun="subjects"
          />

          {filteredKeywords.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#666' }}>
              <p style={{ marginBottom: '0.75rem' }}>No subjects match &ldquo;{subjectSearch}&rdquo;</p>
              <button
                onClick={() => setSubjectSearch('')}
                style={{ color: '#0066cc', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem', textDecoration: 'underline', padding: 0 }}
              >
                Clear search
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1.5rem',
            }}>
              {filteredKeywords.map(keyword => (
                <Link
                  key={keyword}
                  href={`/photographs/subject/${encodeURIComponent(keyword)}`}
                  style={{
                    padding: '1.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#333',
                    display: 'block',
                  }}
                >
                  <h3 style={{ margin: 0 }}>
                    <Highlight text={keyword} query={subjectSearch} />
                  </h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
