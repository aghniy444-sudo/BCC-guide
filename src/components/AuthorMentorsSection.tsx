'use client';

import React from 'react';
import styles from './AuthorMentorsSection.module.css';

export default function AuthorMentorsSection() {
  const materials = [
    {
      title: 'Guide Book Business Case Competition',
      role: 'E-book (PDF)',
      desc: 'Kerangka analisis, struktur slide, dan contoh studi kasus untuk lomba business case competition.',
    },
    {
      title: 'Template Deck (11 PPTX)',
      role: 'PowerPoint',
      desc: 'Sebelas template deck siap edit, dari slide judul hingga rencana implementasi.',
    },
    {
      title: 'Free Deck',
      role: 'Gratis',
      desc: 'Contoh deck gratis untuk semua akun aktif sebagai titik awal latihan.',
    },
  ];

  return (
    <section id="mentors" className={styles.mentorsSection}>
      <div className="container">
        <div className={styles.header}>
          <p className="eyebrow">Materi &amp; Konten</p>
          <h2 className={styles.title}>
            Apa Saja yang Anda <span className="text-gradient-electric">Dapatkan</span>
          </h2>
          <p className={styles.subtitle}>
            Materi disusun untuk membantu Anda menyiapkan business case competition
            secara terstruktur.
          </p>
        </div>

        <div className={styles.mentorsGrid}>
          {materials.map((m, idx) => (
            <div key={idx} className={styles.mentorCard}>
              <h3 className={styles.mentorName}>{m.title}</h3>
              <span className={styles.mentorRole}>{m.role}</span>
              <p className={styles.mentorBio}>{m.desc}</p>
              <div className={styles.mentorBookTag}>Akses di dashboard</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
