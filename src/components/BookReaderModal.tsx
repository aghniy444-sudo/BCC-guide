'use client';

import React from 'react';
import styles from './BookReaderModal.module.css';
import { formatRupiah, type CatalogItem } from '@/data/catalog';

interface BookReaderModalProps {
  item: CatalogItem;
  onClose: () => void;
  onAddToCart: (item: CatalogItem) => void;
}

export default function BookReaderModal({ item, onClose, onAddToCart }: BookReaderModalProps) {
  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderTitle}>
            <span className={styles.badgePreview}>Detail Produk</span>
            <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '1rem' }}>
              {item.title}
            </span>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Tutup detail">
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.readingArea}>
            <div className={styles.chapterTitleBar}>
              <div className={styles.chapterLabel}>{item.categoryLabel}</div>
              <h2 className={styles.chapterHeading}>{item.title}</h2>
            </div>

            <div className={styles.readingContent}>
              <p>{item.description}</p>

              <div className={styles.takeawaysBox}>
                <div className={styles.takeawaysTitle}>
                  <span>Isi paket ini:</span>
                </div>
                <ul className={styles.takeawaysList}>
                  {item.includes.map((inc, idx) => (
                    <li key={idx} className={styles.takeawayItem}>
                      <span style={{ color: 'var(--color-bright)', fontWeight: 700 }}>•</span>
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p style={{ fontStyle: 'italic', color: '#9794be', fontSize: '0.9rem', marginTop: '12px' }}>
                * Materi lengkap terbuka di dashboard setelah pembayaran terkonfirmasi.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>
            {formatRupiah(item.price_idr)}
          </span>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
            >
              Tutup
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                onAddToCart(item);
                onClose();
              }}
              style={{ padding: '10px 24px', fontSize: '0.9rem' }}
            >
              Tambah ke Keranjang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
