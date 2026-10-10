'use client';

import React from 'react';
import styles from './HeroSection.module.css';
import type { CatalogItem } from '@/data/catalog';

interface HeroSectionProps {
  products: CatalogItem[];
}

/**
 * Landing hero: headline and supporting copy only. The featured product
 * carousel now lives in the catalog section.
 */
export default function HeroSection({ products }: HeroSectionProps) {
  if (products.length === 0) {
    return (
      <section id="hero" className={styles.heroSection}>
        <div className="container">
          <div className={styles.heroHeader}>
            <p className="eyebrow">BCC Guide</p>
            <h1 className={styles.heroTitle}>
              Guide Book &amp; Template Deck{' '}
              <span className={styles.titleHighlight}>Business Case Competition</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Belum ada produk aktif. Silakan hubungi admin atau coba lagi nanti.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="hero" className={styles.heroSection}>
      <div className="container">
        <div className={styles.heroHeader}>
          <p className="eyebrow">BCC Guide</p>

          <h1 className={styles.heroTitle}>
            Siapkan Business Case Competition dengan{' '}
            <span className={styles.titleHighlight}>Guide Book &amp; Template Deck</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Guide book e-book dan 11 template deck presentasi untuk lomba business case
            competition. Materi disusun siap pakai untuk membantu menyusun business case.
          </p>
        </div>
      </div>

      <div className={styles.archDividerWrapper}>
        <div className={styles.archCurveLine} />
      </div>
    </section>
  );
}
