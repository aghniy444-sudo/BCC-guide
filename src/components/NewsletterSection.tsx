'use client';

import React from 'react';
import styles from './NewsletterSection.module.css';

export default function NewsletterSection() {
  return (
    <section className="container">
      <div className={styles.newsletterCard}>
        <div className={styles.leftContent}>
          <p className="eyebrow">Mulai Gratis</p>
          <h2 className={styles.cardTitle}>
            Daftar Akun dan Akses <span className="text-gradient">Deck Gratis</span>
          </h2>
          <p className={styles.cardDesc}>
            Buat akun untuk membuka tiga deck gratis, melihat info lomba, dan mengakses course
            dasar business case competition di dashboard Anda.
          </p>
        </div>

        <div className={styles.formBox}>
          <a href="#catalog" className="btn-primary" style={{ padding: '12px 28px', textDecoration: 'none' }}>
            Lihat Produk
          </a>
          <span className={styles.guaranteeNote}>
            Materi berbayar terbuka hanya setelah pembayaran terkonfirmasi.
          </span>
        </div>
      </div>
    </section>
  );
}
