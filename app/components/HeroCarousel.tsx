'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { CarouselPhoto } from '@/lib/carousel-data';
import styles from './HeroCarousel.module.css';

interface Props {
  photos: CarouselPhoto[];
}

export default function HeroCarousel({ photos }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isPaused = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
        onTouchStart={() => { isPaused.current = true; }}
        onTouchEnd={() => { isPaused.current = false; }}
      >
        {photos.map((photo, i) => {
          const src = `https://hertzmann.net/pages/photos/${photo.photographer}_${photo.id}.jpg`;
          return (
            <div
              key={photo.id}
              className={i === currentIndex ? `${styles.slide} ${styles.slideActive}` : styles.slide}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={photo.title}
                className={styles.slideImg}
              />
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
          {current.firstName} {current.lastName}
        </h4>
        {current.title && <> &middot; <em>{current.title}</em></>}
        {current.medium && <> &middot; {current.medium}</>}
        {current.date && <> &middot; {current.date}</>}
      </div>
    </div>
  );
}
