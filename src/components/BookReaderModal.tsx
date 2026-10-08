'use client';

import React from 'react';
import Image from 'next/image';
import styles from './BookReaderModal.module.css';
import { Book } from '@/data/booksData';

interface BookReaderModalProps {
  book: Book | null;
  onClose: () => void;
  onAddToCart: (book: Book) => void;
}

export default function BookReaderModal({ book, onClose, onAddToCart }: BookReaderModalProps) {
  if (!book) return null;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderTitle}>
            <span className={styles.badgePreview}>Sample Reader</span>
            <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '1rem' }}>
              {book.title}
            </span>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Tutup preview"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          {/* Left Sidebar */}
          <div className={styles.readerSidebar}>
            <div className={styles.bookCoverPreview}>
              <Image
                src={book.coverImage}
                alt={book.title}
                width={280}
                height={370}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>

            <div className={styles.authorCard}>
              <Image
                src={book.author.avatar}
                alt={book.author.name}
                width={44}
                height={44}
                className={styles.authorAvatar}
              />
              <div>
                <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}>
                  {book.author.name}
                </div>
                <div style={{ color: '#9d9abf', fontSize: '0.78rem' }}>
                  {book.author.role}
                </div>
              </div>
            </div>

            <div className={styles.tocSection}>
              <div className={styles.tocHeading}>Daftar Isi Buku</div>
              <ul className={styles.tocList}>
                {book.tableOfContents.map((item, idx) => (
                  <li
                    key={idx}
                    className={`${styles.tocItem} ${idx === 0 ? styles.tocActive : ''}`}
                  >
                    <span>{item.chapter}: {item.title}</span>
                    <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>{item.duration}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Reading Area */}
          <div className={styles.readingArea}>
            <div className={styles.chapterTitleBar}>
              <div className={styles.chapterLabel}>
                {book.sampleExcerpt.chapterNumber} • Eksklusif Cuplikan
              </div>
              <h2 className={styles.chapterHeading}>
                {book.sampleExcerpt.chapterTitle}
              </h2>
            </div>

            <div className={styles.readingContent}>
              {book.sampleExcerpt.content.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}

              <div className={styles.takeawaysBox}>
                <div className={styles.takeawaysTitle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Materi Inti Yang Akan Anda Kuasai:</span>
                </div>
                <ul className={styles.takeawaysList}>
                  {book.keyTakeaways.map((item, idx) => (
                    <li key={idx} className={styles.takeawayItem}>
                      <span style={{ color: '#a855f7', fontWeight: 700 }}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p style={{ fontStyle: 'italic', color: '#9794be', fontSize: '0.9rem', marginTop: '12px' }}>
                * Beli buku lengkap untuk mendapatkan 500+ halaman, template repositori, dan pembaruan seumur hidup.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>
              {formatRupiah(book.price)}
            </span>
            <span style={{ fontSize: '0.9rem', textDecoration: 'line-through', color: '#7b78a0' }}>
              {formatRupiah(book.originalPrice)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
            >
              Tutup Preview
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                onAddToCart(book);
                onClose();
              }}
              style={{ padding: '10px 24px', fontSize: '0.9rem' }}
            >
              Dapatkan Buku Lengkap Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
