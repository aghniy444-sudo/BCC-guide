'use client';

import React, { useState, useMemo } from 'react';
import styles from './BooksCatalog.module.css';
import { BOOKS_DATA, Book } from '@/data/booksData';
import BookCard from './BookCard';

interface BooksCatalogProps {
  onPreview: (bookId: string) => void;
  onAddToCart: (book: Book) => void;
}

export default function BooksCatalog({ onPreview, onAddToCart }: BooksCatalogProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'Semua Guidebook (3)' },
    { id: 'ai', label: 'AI & Engineering' },
    { id: 'design', label: 'UI/UX Design Systems' },
    { id: 'architecture', label: 'Cloud Architecture' },
  ];

  const filteredBooks = useMemo(() => {
    return BOOKS_DATA.filter((book) => {
      const matchesCategory =
        activeCategory === 'all' || book.category === activeCategory;
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <section id="catalog" className={styles.catalogSection}>
      <div className="container">
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className="badge-pill">
            Katalog Lengkap Resmi
          </div>
          <h2 className={styles.sectionTitle}>
            3 Panduan Praktis untuk <span className="text-gradient-electric">Karier Masa Depan</span>
          </h2>
          <p className={styles.sectionDesc}>
            Dapatkan akses seumur hidup ke seluruh modul, file template siap deploy, repositori GitHub, dan update versi berkelanjutan.
          </p>
        </div>

        {/* Controls: Categories & Search */}
        <div className={styles.controlsBar}>
          <div className={styles.categoryPills}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`${styles.categoryBtn} ${
                  activeCategory === cat.id ? styles.categoryBtnActive : ''
                }`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className={styles.filterRight}>
            <div className={styles.searchBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Cari judul buku..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.clearSearchBtn}
                  onClick={() => setSearchQuery('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <div className={styles.booksGrid}>
          {filteredBooks.length > 0 ? (
            filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onPreview={onPreview}
                onAddToCart={onAddToCart}
              />
            ))
          ) : (
            <div className={styles.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-sky)" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p className={styles.emptyText}>
                Tidak ada guidebook yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
