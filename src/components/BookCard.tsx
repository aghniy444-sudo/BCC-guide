'use client';

import React from 'react';
import Image from 'next/image';
import styles from './BookCard.module.css';
import { Book } from '@/data/booksData';

interface BookCardProps {
  book: Book;
  onPreview: (bookId: string) => void;
  onAddToCart: (book: Book) => void;
}

export default function BookCard({ book, onPreview, onAddToCart }: BookCardProps) {
  const discountPercent = Math.round(
    ((book.originalPrice - book.price) / book.originalPrice) * 100
  );

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className={styles.card}>
      <div 
        className={styles.coverContainer}
        onClick={() => onPreview(book.id)}
        role="button"
        tabIndex={0}
      >
        <Image
          src={book.coverImage}
          alt={book.title}
          width={340}
          height={430}
          className={styles.coverImage}
          loading="lazy"
        />

        {/* Top Badges */}
        <div className={styles.topBadgesRow}>
          {book.bundleTag && (
            <div className={styles.badgeTopLeft}>{book.bundleTag}</div>
          )}
          <div className={styles.discountBadge}>
            {book.discountBadge || `Hemat ${discountPercent}%`}
          </div>
        </div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.categoryTag}>{book.categoryLabel}</div>

        <h3 
          className={styles.bookTitle}
          onClick={() => onPreview(book.id)}
        >
          {book.title}
        </h3>

        <p className={styles.bookSubtitle}>{book.subtitle}</p>

        <div className={styles.ratingRow}>
          <div className={styles.stars}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>★</span>
            ))}
          </div>
          <span className={styles.ratingNum}>{book.rating}</span>
          <span className={styles.reviewCount}>({book.reviewCount} ulasan)</span>
        </div>

        <div className={styles.formatTags}>
          {book.formats.slice(0, 3).map((fmt, idx) => (
            <span key={idx} className={styles.formatPill}>
              {fmt}
            </span>
          ))}
        </div>

        <div className={styles.priceRow}>
          <span className={styles.currentPrice}>{formatRupiah(book.price)}</span>
          <span className={styles.originalPrice}>{formatRupiah(book.originalPrice)}</span>
        </div>

        <div className={styles.cardActions}>
          <button
            type="button"
            className={styles.previewBtn}
            onClick={() => onPreview(book.id)}
            title="Lihat isi bab 1 gratis"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Preview</span>
          </button>

          <button
            type="button"
            className={styles.buyBtn}
            onClick={() => onAddToCart(book)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-2z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span>Beli Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
}
