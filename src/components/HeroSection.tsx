'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './HeroSection.module.css';
import { BOOKS_DATA, Book } from '@/data/booksData';

interface HeroSectionProps {
  onOpenPreview: (bookId: string) => void;
  onAddToCart?: (book: Book) => void;
  onExploreCatalog: () => void;
}

export default function HeroSection({
  onOpenPreview,
  onAddToCart,
  onExploreCatalog,
}: HeroSectionProps) {
  // 3 products, active index defaults to 1 (center card: UI/UX or AI)
  const [activeIndex, setActiveIndex] = useState(1);

  const books = BOOKS_DATA.slice(0, 3);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? books.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === books.length - 1 ? 0 : prev + 1));
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Helper to determine relative position for 3 items
  const getCardPositionClass = (idx: number) => {
    const diff = (idx - activeIndex + 3) % 3;
    if (diff === 0) return styles.cardCenter;
    if (diff === 1) return styles.cardRight;
    return styles.cardLeft;
  };

  return (
    <section id="hero" className={styles.heroSection}>
      <div className="container">
        {/* Top Header & Tagline */}
        <div className={styles.heroHeader}>
          <div className={styles.pillBadge}>
            <span className={styles.badgePulse} />
            <span>Koleksi Resmi 2026 • 3 Guidebook Praktis Pilihan Juara</span>
          </div>

          <h1 className={styles.heroTitle}>
            Kuasai Skill Digital Masa Depan dengan{' '}
            <span className={styles.titleHighlight}>Guidebook Teruji</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Panduan digital komprehensif berstandar industri dengan studi kasus riil, 
            template kode siap pakai, dan pembaruan seumur hidup gratis.
          </p>
        </div>

        {/* 3D Fan Deck Carousel Showcase */}
        <div className={styles.fanDeckContainer}>
          {/* Left Arrow Button */}
          <button
            type="button"
            className={`${styles.navArrow} ${styles.navArrowLeft}`}
            onClick={handlePrev}
            aria-label="Panduan Sebelumnya"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Cards Track / Stage */}
          <div className={styles.cardsTrack}>
            {books.map((book, idx) => {
              const posClass = getCardPositionClass(idx);
              const isCenter = (idx - activeIndex + 3) % 3 === 0;

              return (
                <div
                  key={book.id}
                  className={`${styles.bookCard} ${posClass}`}
                  onClick={() => {
                    if (!isCenter) {
                      setActiveIndex(idx);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Pilih buku ${book.title}`}
                >
                  {/* Top Badges (like in reference photo) */}
                  <div className={styles.cardHeaderBadges}>
                    <span className={styles.bundlingBadge}>
                      <span className={styles.badgeIcon}>📦</span>
                      <span>{book.bundleTag || 'Bundling'}</span>
                    </span>
                    <span className={styles.discountBadge}>
                      {book.discountBadge || '30% OFF'}
                    </span>
                  </div>

                  {/* Book Cover Visual with 3D reflection gloss */}
                  <div className={styles.coverWrapper}>
                    <Image
                      src={book.coverImage}
                      alt={book.title}
                      width={310}
                      height={400}
                      className={styles.coverImg}
                      priority={idx === 1}
                    />
                    <div className={styles.coverSheen} />
                  </div>

                  {/* Card Bottom Details Panel */}
                  <div className={styles.cardMetaPanel}>
                    <div className={styles.cardCategory}>{book.categoryLabel}</div>
                    <h3 className={styles.cardTitle}>{book.title}</h3>
                    <p className={styles.cardSubtitleSnippet}>{book.subtitle}</p>

                    <div className={styles.priceContainer}>
                      <span className={styles.originalPrice}>
                        {formatRupiah(book.originalPrice)}
                      </span>
                      <span className={styles.activePrice}>
                        {formatRupiah(book.price)}
                      </span>
                    </div>

                    {/* Quick interactive actions on center card */}
                    {isCenter && (
                      <div className={styles.cardActions}>
                        <button
                          type="button"
                          className={styles.btnCardPreview}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenPreview(book.id);
                          }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          <span>Baca Bab 1</span>
                        </button>

                        <button
                          type="button"
                          className={styles.btnCardBuy}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onAddToCart) onAddToCart(book);
                          }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-2z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                          </svg>
                          <span>Beli Sekarang</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            className={`${styles.navArrow} ${styles.navArrowRight}`}
            onClick={handleNext}
            aria-label="Panduan Selanjutnya"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Fan Deck Bottom Indicators */}
        <div className={styles.deckIndicators}>
          {books.map((book, idx) => (
            <button
              key={book.id}
              type="button"
              className={`${styles.indicatorDot} ${
                idx === activeIndex ? styles.indicatorDotActive : ''
              }`}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Pilih buku ${idx + 1}`}
            >
              <span className={styles.dotNumber}>0{idx + 1}</span>
              <span className={styles.dotTitle}>{book.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Global CTA Row */}
        <div className={styles.heroCtaRow}>
          <button
            type="button"
            className={styles.btnExploreAll}
            onClick={onExploreCatalog}
          >
            <span>Lihat Rincian & Silabus Lengkap</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>

      {/* Decorative Arch Divider - Directly inspired by image 2 */}
      <div className={styles.archDividerWrapper}>
        <div className={styles.archCurveLine} />
      </div>
    </section>
  );
}
