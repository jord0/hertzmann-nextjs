'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './PhotoDetail.module.css';

interface Props {
  src: string;
  alt: string;
}

export function PhotoLightbox({ src, alt }: Props) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`${styles.photoImg} ${styles.photoImgClickable}`}
        onClick={() => setOpen(true)}
      />

      {open && (
        <div className={styles.lightboxOverlay} onClick={close}>
          <button className={styles.lightboxClose} onClick={close} aria-label="Close">✕</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className={styles.lightboxImg}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
