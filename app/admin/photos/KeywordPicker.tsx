'use client';

import { useState, useRef } from 'react';

interface Props {
  allKeywords: string[];
  selected?: string[];
}

export default function KeywordPicker({ allKeywords, selected = [] }: Props) {
  const [active, setActive] = useState<Set<string>>(new Set(selected));
  const [extra, setExtra] = useState<string[]>([]);
  const [filter, setFilter] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const allKnown = [...allKeywords, ...extra];

  const toggle = (kw: string) => {
    setActive(prev => {
      const next = new Set(prev);
      next.has(kw) ? next.delete(kw) : next.add(kw);
      return next;
    });
    setFilter('');
    inputRef.current?.focus();
  };

  const trimmed = filter.trim();
  const filtered = trimmed
    ? allKnown.filter(kw => kw.toLowerCase().includes(trimmed.toLowerCase()))
    : allKnown;

  const canAdd = trimmed.length > 0 && !allKnown.some(kw => kw.toLowerCase() === trimmed.toLowerCase());

  function addNew() {
    if (!canAdd) return;
    setExtra(prev => [...prev, trimmed]);
    setActive(prev => new Set(prev).add(trimmed));
    setFilter('');
    inputRef.current?.focus();
  }

  const selectedSorted = Array.from(active).sort();

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 500 }}>
        Subject Keywords
      </label>

      <input type="hidden" name="keywords" value={selectedSorted.join(',')} />

      {/* Combined tag + filter input */}
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.4rem 0.6rem',
          border: '1px solid #ccc',
          borderRadius: '4px 4px 0 0',
          backgroundColor: 'white',
          cursor: 'text',
          minHeight: '2.5rem',
        }}
      >
        {selectedSorted.map(kw => (
          <button
            key={kw}
            type="button"
            onClick={e => { e.stopPropagation(); toggle(kw); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.15rem 0.45rem',
              fontSize: '0.8rem',
              borderRadius: '3px',
              border: '1px solid #333',
              backgroundColor: '#333',
              color: 'white',
              cursor: 'pointer',
              lineHeight: 1.5,
              flexShrink: 0,
            }}
          >
            {kw}
            <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>✕</span>
          </button>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addNew(); } }}
          placeholder={active.size === 0 ? 'Filter or add keywords...' : ''}
          style={{
            flex: '1 1 120px',
            minWidth: '120px',
            border: 'none',
            outline: 'none',
            fontSize: '0.9rem',
            padding: '0.1rem 0',
            backgroundColor: 'transparent',
          }}
        />
      </div>

      {/* Tag cloud */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.4rem',
        padding: '0.65rem',
        border: '1px solid #ccc',
        borderTop: 'none',
        borderRadius: '0 0 4px 4px',
        maxHeight: '200px',
        overflowY: 'auto',
        backgroundColor: '#fafafa',
      }}>
        {canAdd && (
          <button
            type="button"
            onClick={addNew}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.2rem 0.5rem',
              fontSize: '0.8rem',
              borderRadius: '3px',
              border: '1px dashed #0066cc',
              cursor: 'pointer',
              lineHeight: 1.4,
              backgroundColor: 'white',
              color: '#0066cc',
            }}
          >
            + Add &ldquo;{trimmed}&rdquo;
          </button>
        )}
        {filtered.length === 0 && !canAdd ? (
          <span style={{ fontSize: '0.85rem', color: '#aaa' }}>No keywords match.</span>
        ) : (
          filtered.map(kw => {
            const isActive = active.has(kw);
            return (
              <button
                key={kw}
                type="button"
                onClick={() => toggle(kw)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.8rem',
                  borderRadius: '3px',
                  border: '1px solid',
                  cursor: 'pointer',
                  lineHeight: 1.4,
                  backgroundColor: isActive ? '#333' : 'white',
                  color: isActive ? 'white' : '#555',
                  borderColor: isActive ? '#333' : '#ccc',
                  transition: 'all 0.1s',
                }}
              >
                {kw}
                {isActive && <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>✕</span>}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
