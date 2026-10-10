'use client';

import React, { useMemo, useState } from 'react';
import styles from './SearchModal.module.css';
import { formatRupiah, type CatalogItem } from '@/data/catalog';

interface SearchModalProps {
  isOpen: boolean;
  products: CatalogItem[];
  onClose: () => void;
  onSelectProduct: (productId: string) => void;
}

export default function SearchModal({ isOpen, products, onClose, onSelectProduct }: SearchModalProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q),
    );
  }, [products, query]);

  if (!isOpen) return null;

  return (
    <div className={styles.searchOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.searchBoxModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.inputRow}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-electric)" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className={styles.inputField}
            placeholder="Cari produk..."
            value={query}
            autoFocus
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" className={styles.closeKey} onClick={onClose}>
            ESC
          </button>
        </div>

        <div className={styles.resultsList}>
          {results.length > 0 ? (
            results.map((item) => (
              <div
                key={item.id}
                className={styles.resultItem}
                onClick={() => {
                  onSelectProduct(item.id);
                  onClose();
                }}
              >
                <div className={styles.resultInfo}>
                  <div className={styles.resultTitle}>{item.title}</div>
                  <div className={styles.resultMeta}>
                    {item.categoryLabel} • {formatRupiah(item.price_idr)}
                  </div>
                </div>
                <div style={{ color: 'var(--color-electric)', fontSize: '0.85rem', fontWeight: 600 }}>
                  Lihat Detail →
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: '#9794bf' }}>
              Tidak ditemukan hasil untuk &quot;{query}&quot;.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
