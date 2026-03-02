'use client';

import { useState, useEffect } from 'react';
import { catalogPdfUrl } from '@/lib/catalog-url';
import styles from './CatalogCard.module.css';

interface Catalog {
  id: number;
  title: string;
  date: string;
  price: number;
  description: string;
  level: number;
}

export default function CatalogCard({ catalog }: { catalog: Catalog }) {
  const [modalOpen, setModalOpen] = useState(false);
  const pdfUrl = catalogPdfUrl(catalog.id);

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.meta}>
            <span className={styles.date}>{catalog.date}</span>
            {catalog.price > 0 && (
              <span className={styles.price}>${catalog.price}</span>
            )}
          </div>

          <h2 className={styles.title}>{catalog.title}</h2>

          <p className={styles.description}>{catalog.description}</p>

          <button className={styles.readMore} onClick={() => setModalOpen(true)}>
            Read more
          </button>
        </div>

        <div className={styles.cardFooter}>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.downloadLink}
          >
            Download PDF
          </a>
        </div>
      </div>

      {modalOpen && (
        <div
          className={styles.overlay}
          onClick={() => setModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={catalog.title}
        >
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button
              className={styles.closeBtn}
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>

            <div className={styles.modalMeta}>
              <span className={styles.date}>{catalog.date}</span>
              {catalog.price > 0 && (
                <span className={styles.price}>${catalog.price}</span>
              )}
            </div>

            <h2 className={styles.modalTitle}>{catalog.title}</h2>
            <p className={styles.modalDescription}>{catalog.description}</p>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.modalDownload}
            >
              Download PDF
            </a>
          </div>
        </div>
      )}
    </>
  );
}
