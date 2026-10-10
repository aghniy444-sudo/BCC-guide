'use client';

import React from 'react';
import styles from './BooksCatalog.module.css';
import ProductCarousel from './ProductCarousel';
import type { CatalogItem } from '@/data/catalog';

interface BooksCatalogProps {
  products: CatalogItem[];
  onPreview: (productId: string) => void;
  onAddToCart: (item: CatalogItem) => void;
}

export default function BooksCatalog({ products, onPreview, onAddToCart }: BooksCatalogProps) {
  return (
    <section id="catalog" className={styles.catalogSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <p className="eyebrow">Katalog Produk</p>
          <h2 className={styles.sectionTitle}>
            Guide Book &amp; Template Deck <span className="text-gradient-electric">BCC</span>
          </h2>
          <p className={styles.sectionDesc}>
            Tiga penawaran: guide book e-book, 11 template deck, dan bundel hemat keduanya.
            Harga di bawah ini dibaca langsung dari database.
          </p>
        </div>

        <ProductCarousel products={products} onPreview={onPreview} onAddToCart={onAddToCart} />
      </div>
    </section>
  );
}
