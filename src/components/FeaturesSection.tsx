'use client';

import React from 'react';
import styles from './FeaturesSection.module.css';

export default function FeaturesSection() {
  const features = [
    {
      title: 'Fokus Business Case Competition',
      desc: 'Materi disusun khusus untuk lomba business case: kerangka analisis, struktur argumen, dan cara menyampaikan rekomendasi.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      title: 'Guide Book + 11 Template Deck',
      desc: 'Dua produk terpisah atau satu bundel hemat: e-book panduan dan 11 template deck PowerPoint siap edit.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
    },
    {
      title: 'Akses Terkontrol per Pembelian',
      desc: 'Deck gratis tersedia untuk semua akun aktif. Materi berbayar terbuka hanya setelah pembayaran terkonfirmasi.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
    {
      title: 'Checkout QRIS',
      desc: 'Pembayaran melalui QRIS. Setelah pembayaran terkonfirmasi, akses materi langsung terbuka di dashboard Anda.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
  ];

  return (
    <section id="about" className={styles.featuresSection}>
      <div className="container">
        <div className={styles.header}>
          <p className="eyebrow">Tentang BCC Guide</p>
          <h2 className={styles.title}>
            Belajar &amp; Siapkan <span className={styles.brandAccent}>Lomba BCC</span>
          </h2>
          <p className={styles.subtitle}>
            Materi dan template yang membantu Anda menyusun business case competition dengan
            lebih terstruktur.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {features.map((item, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div className={styles.iconBox}>{item.icon}</div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
