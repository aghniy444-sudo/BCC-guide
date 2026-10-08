'use client';

import React from 'react';
import styles from './FeaturesSection.module.css';

export default function FeaturesSection() {
  const features = [
    {
      title: 'Bebas Basa-Basi, 100% Praktis',
      desc: 'Setiap bab difokuskan pada problem nyata industri, arsitektur teruji, serta solusi langsung tanpa teori bertele-tele yang membuang waktu Anda.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      title: 'Repositori Kode & Template Riil',
      desc: 'Bukan sekadar buku bacaan. Anda mendapatkan repositori GitHub dengan kode production-ready, template Figma, dan Notion PRD siap pakai.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
    },
    {
      title: 'Pembaruan Seumur Hidup Gratis',
      desc: 'Dunia teknologi berkembang cepat. Setiap kali ada pembaruan teknologi atau edisi baru, Anda menerima versi revisi secara cuma-cuma.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
        </svg>
      ),
    },
    {
      title: 'Komunitas & Mentoring Eksklusif',
      desc: 'Dapatkan akses ke grup privat Educare untuk berdiskusi langsung dengan para mentor penulis dan sesama profesional teknologi di industri.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];

  return (
    <section id="about" className={styles.featuresSection}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.sectionBadge}>
            KEUNGGULAN KAMI
          </div>
          <h2 className={styles.title}>
            Mengapa Harus dengan <span className={styles.brandAccent}>Educare</span>?
          </h2>
          <p className={styles.subtitle}>
            Bimbingan langsung dari para praktisi, materi teruji, dan panduan taktis yang dirancang untuk membuat kamu unggul.
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
