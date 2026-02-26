'use client';

import { useState, useRef, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { BrowsePhotographer } from '@/lib/browse-data';
import { tokens } from '@/lib/design-tokens';
import styles from './PhotographsPageInner.module.css';

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} style={{ backgroundColor: '#fef08a', padding: 0 }}>{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface Props {
  photographers: BrowsePhotographer[];
  keywords: string[];
}

function PhotographsPageInnerContent({ photographers, keywords }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPhotographers = searchParams.get('view') !== 'subjects';

  const [photographerSearch, setPhotographerSearch] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const search = isPhotographers ? photographerSearch : subjectSearch;

  const clearSearch = useCallback(() => {
    setPhotographerSearch('');
    setSubjectSearch('');
    inputRef.current?.focus();
  }, []);

  // Group photographers by first letter of lastName (already sorted by DB)
  const photographerGroups = useMemo(() => {
    const q = photographerSearch.trim().toLowerCase();
    const filtered = q
      ? photographers.filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(q))
      : photographers;
    const groups: Record<string, BrowsePhotographer[]> = {};
    for (const p of filtered) {
      const letter = (p.lastName?.[0] || '#').toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(p);
    }
    return groups;
  }, [photographers, photographerSearch]);

  // Group keywords by first letter
  const keywordGroups = useMemo(() => {
    const q = subjectSearch.trim().toLowerCase();
    const filtered = q
      ? keywords.filter(k => k.toLowerCase().includes(q))
      : keywords;
    const groups: Record<string, string[]> = {};
    for (const k of filtered) {
      const letter = (k[0] || '#').toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(k);
    }
    return groups;
  }, [keywords, subjectSearch]);

  const activePhotographerLetters = useMemo(
    () => new Set(photographers.map(p => (p.lastName?.[0] || '#').toUpperCase())),
    [photographers]
  );
  const activeKeywordLetters = useMemo(
    () => new Set(keywords.map(k => (k[0] || '#').toUpperCase())),
    [keywords]
  );

  const groups = isPhotographers ? photographerGroups : keywordGroups;
  const activeLetters = isPhotographers ? activePhotographerLetters : activeKeywordLetters;
  const letters = Object.keys(groups).sort();
  const totalCount = isPhotographers ? photographers.length : keywords.length;
  const filteredCount = Object.values(groups).reduce((n, g) => n + g.length, 0);
  const noun = isPhotographers ? 'artists' : 'subjects';

  return (
    <>
      {/* Gold header band */}
      <div className={styles.goldHeader}>
        <div className={styles.headerInner}>
          <h1 className={styles.headerTitle}>
            Photographs
          </h1>
        </div>
      </div>

      {/* Main content */}
      <div className={styles.content}>

        {/* Toggle tabs */}
        <div className={styles.tabs}>
          <button
            onClick={() => { router.replace('/photographs'); setPhotographerSearch(''); }}
            className={isPhotographers ? `${styles.tab} ${styles.tabActive}` : styles.tab}
          >
            By Artist
          </button>
          <button
            onClick={() => { router.replace('/photographs?view=subjects'); setSubjectSearch(''); }}
            className={!isPhotographers ? `${styles.tab} ${styles.tabActive}` : styles.tab}
          >
            By Subject
          </button>
        </div>

        {/* Search */}
        <div className={styles.searchWrap}>
          <div className={styles.searchInner}>
            <span className={styles.searchIcon}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => isPhotographers ? setPhotographerSearch(e.target.value) : setSubjectSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Escape' && search) { e.preventDefault(); clearSearch(); } }}
              placeholder={isPhotographers ? 'Search artists...' : 'Search subjects...'}
              className={styles.searchInput}
            />
            {search && (
              <button
                onClick={clearSearch}
                aria-label="Clear search"
                className={styles.searchClear}
              >
                ✕
              </button>
            )}
          </div>
          {search.trim() && (
            <p aria-live="polite" className={styles.searchCount}>
              {filteredCount} of {totalCount} {noun}
            </p>
          )}
        </div>

        {/* Alphabet jump nav */}
        {!search.trim() && (
          <div className={styles.alphabetNav}>
            <span className={styles.alphabetLabel}>Jump to</span>
            <div className={styles.alphabetLetters}>
              {ALPHABET.map(letter => {
                const active = activeLetters.has(letter);
                return active ? (
                  <a
                    key={letter}
                    href={`#letter-${letter}`}
                    className={styles.alphabetLink}
                  >
                    {letter}
                  </a>
                ) : (
                  <span
                    key={letter}
                    className={styles.alphabetInactive}
                  >
                    {letter}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Name list */}
        {letters.length === 0 ? (
          <div className={styles.emptyState}>
            No {noun} match &ldquo;{search}&rdquo;.{' '}
            <button onClick={clearSearch} className={styles.clearBtn}>
              Clear search
            </button>
          </div>
        ) : (
          <div>
            {letters.map(letter => (
              <div key={letter} id={`letter-${letter}`} className={styles.letterSection}>
                <div className={styles.letterHeading}>
                  {letter}
                </div>

                <div className={styles.nameGrid}>
                  {isPhotographers
                    ? (photographerGroups[letter] ?? []).map(p => (
                        <Link
                          key={p.id}
                          href={`/photographs/photographer/${p.slug}`}
                          className={styles.nameLink}
                        >
                          {/* Dynamic: dot color depends on hasEnabledPhotos */}
                          <span className={styles.bullet} style={{ color: p.hasEnabledPhotos ? tokens.color.muted : tokens.color.gold }}>●</span>
                          <span><Highlight text={`${p.firstName} ${p.lastName}`} query={photographerSearch} /></span>
                        </Link>
                      ))
                    : (keywordGroups[letter] ?? []).map(k => (
                        <Link
                          key={k}
                          href={`/photographs/subject/${encodeURIComponent(k)}`}
                          className={styles.nameLink}
                        >
                          <span className={styles.bullet} style={{ color: tokens.color.gold }}>●</span>
                          <span><Highlight text={k} query={subjectSearch} /></span>
                        </Link>
                      ))
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function PhotographsPageInner(props: Props) {
  return (
    <Suspense>
      <PhotographsPageInnerContent {...props} />
    </Suspense>
  );
}
