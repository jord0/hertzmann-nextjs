'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { CarouselPhoto } from '@/lib/carousel-data';
import { decodeHtmlEntities } from '@/lib/htmlDecode';
import { photoImageUrl } from '@/lib/photo-url';
import styles from './HeroCarousel.module.css';

function buildSlug(firstName: string, lastName: string) {
  return `${firstName || ''}-${lastName}`
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/^-+|-+$/g, '');
}

interface Props {
  photos: CarouselPhoto[];
}

export default function HeroCarousel({ photos }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isPaused = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!isPaused.current) {
        setCurrentIndex(i => (i + 1) % photos.length);
      }
    }, 6000);
  }, [photos.length]);

  useEffect(() => {
    startInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startInterval]);

  const goTo = (index: number) => {
    setCurrentIndex((index + photos.length) % photos.length);
    startInterval();
  };

  if (photos.length === 0) return null;

  const current = photos[currentIndex];

  return (
    <div>
      <div
        className={styles.wrapper}
        onMouseEnter={() => { isPaused.current = true; }}
        onMouseLeave={() => { isPaused.current = false; }}
        onTouchStart={e => { isPaused.current = true; touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          isPaused.current = false;
          if (touchStartX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(dx) > 50) goTo(currentIndex + (dx < 0 ? 1 : -1));
          touchStartX.current = null;
        }}
      >
        {photos.map((photo, i) => {
          const src = photoImageUrl(photo.photographer, photo.id);
          return (
            <div
              key={photo.id}
              className={i === currentIndex ? `${styles.slide} ${styles.slideActive}` : styles.slide}
            >
              <Link href={`/photographs/photographer/${buildSlug(photo.firstName, photo.lastName)}/${photo.id}`} className={styles.slideLink}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={photo.title}
                  className={styles.slideImg}
                />
              </Link>
            </div>
          );
        })}

        {/* Left chevron */}
        <button
          onClick={() => goTo(currentIndex - 1)}
          aria-label="Previous"
          className={`${styles.chevron} ${styles.chevronLeft}`}
        >
          ‹
        </button>

        {/* Right chevron */}
        <button
          onClick={() => goTo(currentIndex + 1)}
          aria-label="Next"
          className={`${styles.chevron} ${styles.chevronRight}`}
        >
          ›
        </button>

        {/* Dot indicators */}
        <div className={styles.dotsBar}>
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={i === currentIndex ? `${styles.dot} ${styles.dotActive}` : styles.dot}
            />
          ))}
        </div>
      </div>

      {/* Caption bar */}
      <div className={styles.caption}>
        <h4 className={styles.captionName}>
          <Link href={`/photographs/photographer/${buildSlug(current.firstName, current.lastName)}`} className={styles.captionLink}>
            {current.firstName} {current.lastName}
          </Link>
        </h4>
        {current.title && <> &middot; <em>{decodeHtmlEntities(current.title)}</em></>}
        {current.medium && <> &middot; {decodeHtmlEntities(current.medium)}</>}
        {current.date && <> &middot; {current.date}</>}
      </div>
    </div>
  );
}
