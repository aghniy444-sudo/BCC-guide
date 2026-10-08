'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import styles from './SearchModal.module.css';
import { BOOKS_DATA } from '@/data/booksData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBook: (bookId: string) => void;
}

export default function SearchModal({ isOpen, onClose, onSelectBook }: SearchModalProps) {
  const [query, setQuery] = useState('');

  const quickKeywords = ['AI & LLM', 'Design Systems', 'Microservices', 'Product Strategy', 'Figma', 'Kubernetes'];

  const results = useMemo(() => {
    if (!query.trim()) return BOOKS_DATA;
    return BOOKS_DATA.filter((b) =>
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      b.categoryLabel.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className={styles.searchOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.searchBoxModal} onClick={(e) => e.stopPropagation()}>
        {/* Input bar */}
        <div className={styles.inputRow}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className={styles.inputField}
            placeholder="Ketik judul buku, topik, atau penulis..."
            value={query}
            autoFocus
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" className={styles.closeKey} onClick={onClose}>
            ESC
          </button>
        </div>

        {/* Results */}
        <div className={styles.resultsList}>
          {results.length > 0 ? (
            results.map((book) => (
              <div
                key={book.id}
                className={styles.resultItem}
                onClick={() => {
                  onSelectBook(book.id);
                  onClose();
                }}
              >
                <div className={styles.resultThumb}>
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    width={44}
                    height={58}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.resultInfo}>
                  <div className={styles.resultTitle}>{book.title}</div>
                  <div className={styles.resultMeta}>
                    {book.categoryLabel} • {book.rating} ★ ({book.reviewCount} ulasan)
                  </div>
                </div>
                <div style={{ color: '#c4b5fd', fontSize: '0.85rem', fontWeight: 600 }}>
                  Lihat Preview →
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: '#9794bf' }}>
              Tidak ditemukan hasil untuk &quot;{query}&quot;.
            </div>
          )}
        </div>

        {/* Quick tags */}
        <div className={styles.quickTagsRow}>
          <span className={styles.quickTagLabel}>Topik Populer:</span>
          {quickKeywords.map((tag) => (
            <button
              key={tag}
              type="button"
              className={styles.quickTagBtn}
              onClick={() => setQuery(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
