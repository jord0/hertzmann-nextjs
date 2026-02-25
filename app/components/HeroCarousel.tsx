'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { CarouselPhoto } from '@/lib/carousel-data';
import { tokens } from '@/lib/design-tokens';

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
        style={{ position: 'relative', width: '100%', height: '420px', overflow: 'hidden', backgroundColor: '#111' }}
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
              style={{
                position: 'absolute',
                inset: 0,
                opacity: i === currentIndex ? 1 : 0,
                transition: 'opacity 0.8s ease',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={photo.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          );
        })}

        {/* Left chevron */}
        <button
          onClick={() => goTo(currentIndex - 1)}
          aria-label="Previous"
          style={{
            position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.45)', border: 'none', color: 'white',
            width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer',
            fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10, lineHeight: 1,
          }}
        >
          ‹
        </button>

        {/* Right chevron */}
        <button
          onClick={() => goTo(currentIndex + 1)}
          aria-label="Next"
          style={{
            position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.45)', border: 'none', color: 'white',
            width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer',
            fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10, lineHeight: 1,
          }}
        >
          ›
        </button>

        {/* Dot indicators */}
        <div style={{
          position: 'absolute', bottom: '0.75rem', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '6px', zIndex: 10,
        }}>
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: '8px', height: '8px', borderRadius: '50%', border: 'none',
                backgroundColor: i === currentIndex ? tokens.color.gold : 'rgba(255,255,255,0.5)',
                cursor: 'pointer', padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Caption bar */}
      <div style={{
        backgroundColor: tokens.color.bgWarm,
        padding: '0.6rem 1.5rem',
        fontSize: '0.82rem',
        color: tokens.color.muted,
        letterSpacing: '0.03em',
        textAlign: 'center',
        borderBottom: `1px solid ${tokens.color.borderWarm}`,
        fontFamily: tokens.font.sans,
        fontWeight: tokens.fontWeight.light,
      }}>
        <span style={{ color: tokens.color.foreground, fontWeight: tokens.fontWeight.medium }}>
          {current.firstName} {current.lastName}
        </span>
        {current.title && <> &middot; <em>{current.title}</em></>}
        {current.medium && <> &middot; {current.medium}</>}
        {current.date && <> &middot; {current.date}</>}
      </div>
    </div>
  );
}
