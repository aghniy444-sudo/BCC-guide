'use client';

import React, { useState } from 'react';
import styles from './ProductCarousel.module.css';
import { productImageUrl } from '@/lib/storage';
import { formatRupiah, type CatalogItem } from '@/data/catalog';

interface ProductCarouselProps {
  products: CatalogItem[];
  onPreview: (productId: string) => void;
  onAddToCart: (item: CatalogItem) => void;
}

/**
 * Featured product carousel (3D fan deck). Shows the three catalog offers with
 * arrows, position indicators, and quick actions on the centred card.
 */
export default function ProductCarousel({ products, onPreview, onAddToCart }: ProductCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  // Every active product is reachable; the deck only positions the three
  // nearest cards and hides the rest behind the centre.
  const items = products;

  if (items.length === 0) return null;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const getCardPositionClass = (idx: number) => {
    const diff = (idx - activeIndex + items.length) % items.length;
    if (diff === 0) return styles.cardCenter;
    if (diff === 1) return styles.cardRight;
    if (diff === items.length - 1) return styles.cardLeft;
    // Cards outside the visible fan stay in the deck but out of sight.
    return styles.cardHidden;
  };

  return (
    <>
      <div className={styles.fanDeckContainer}>
        <button
          type="button"
          className={`${styles.navArrow} ${styles.navArrowLeft}`}
          onClick={handlePrev}
          aria-label="Produk sebelumnya"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className={styles.cardsTrack}>
          {items.map((item, idx) => {
            const posClass = getCardPositionClass(idx);
            const isCenter = (idx - activeIndex + items.length) % items.length === 0;

            return (
              <div
                key={item.id}
                className={`${styles.bookCard} ${posClass}`}
                onClick={() => {
                  if (!isCenter) setActiveIndex(idx);
                }}
                role="button"
                tabIndex={0}
                aria-label={`Pilih ${item.title}`}
              >
                <div className={styles.coverWrapper}>
                  {productImageUrl(item.image_path) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={productImageUrl(item.image_path) as string} alt={item.title} className={styles.coverImage} />
                  ) : (
                    <div className={styles.coverImg}>{item.title}</div>
                  )}
                  <div className={styles.coverSheen} />
                </div>

                <div className={styles.cardMetaPanel}>
                  <div className={styles.cardCategory}>{item.categoryLabel}</div>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardSubtitleSnippet}>{item.description}</p>

                  <div className={styles.priceContainer}>
                    <span className={styles.activePrice}>{formatRupiah(item.price_idr)}</span>
                  </div>

                  {isCenter && (
                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={styles.btnCardPreview}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreview(item.id);
                        }}
                      >
                        <span>Detail</span>
                      </button>

                      <button
                        type="button"
                        className={styles.btnCardBuy}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(item);
                        }}
                      >
                        <span>Tambah ke Keranjang</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className={`${styles.navArrow} ${styles.navArrowRight}`}
          onClick={handleNext}
          aria-label="Produk selanjutnya"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className={styles.deckIndicators}>
        {items.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            className={`${styles.indicatorDot} ${idx === activeIndex ? styles.indicatorDotActive : ''}`}
            onClick={() => setActiveIndex(idx)}
            aria-label={`Pilih produk ${idx + 1}`}
          >
            <span className={styles.dotNumber}>0{idx + 1}</span>
            <span className={styles.dotTitle}>{item.categoryLabel.split(' ')[0]}</span>
          </button>
        ))}
      </div>
    </>
  );
}
