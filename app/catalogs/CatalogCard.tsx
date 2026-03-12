'use client';

import { useState, useEffect } from 'react';
import { catalogPdfUrl, catalogImageUrl } from '@/lib/catalog-url';
import { decodeHtmlEntities } from '@/lib/htmlDecode';
import styles from './CatalogCard.module.css';

interface Catalog {
  id: number;
  title: string;
  date: string;
  price: number;
  description: string;
  level: number;
}

const PREVIEW_LENGTH = 180;

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function CatalogCard({ catalog }: { catalog: Catalog }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const pdfUrl = catalogPdfUrl(catalog.id);
  const imgUrl = catalogImageUrl(catalog.id);

  const plainText = decodeHtmlEntities(stripHtml(catalog.description));
  const isTruncated = plainText.length > PREVIEW_LENGTH;
  const previewText = isTruncated ? plainText.slice(0, PREVIEW_LENGTH).trimEnd() + '…' : plainText;

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
      <div className={styles.row}>
        {!imgError && (
          <div className={styles.rowImage}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgUrl}
              alt={catalog.title}
              onError={() => setImgError(true)}
            />
          </div>
        )}

        <div className={styles.rowBody}>
          <div className={styles.meta}>
            <span className={styles.date}>{catalog.date}</span>
            {catalog.price > 0 && (
              <span className={styles.price}>${catalog.price}</span>
            )}
          </div>
          <h2 className={styles.title}>{catalog.title}</h2>
          <p className={styles.descriptionText}>
            {previewText}
            {isTruncated && (
              <button className={styles.readMore} onClick={() => setModalOpen(true)}> Read more</button>
            )}
          </p>
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
            <div className={styles.modalDescription} dangerouslySetInnerHTML={{ __html: catalog.description }} />

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
