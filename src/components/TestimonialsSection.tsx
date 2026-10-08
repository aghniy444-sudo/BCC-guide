'use client';

import React from 'react';
import Image from 'next/image';
import styles from './TestimonialsSection.module.css';
import { TESTIMONIALS } from '@/data/booksData';

export default function TestimonialsSection() {
  return (
    <section className={styles.testimonialsSection}>
      <div className="container">
        <div className={styles.header}>
          <div className="badge-pill">
            Ulasan Terverifikasi
          </div>
          <h2 className={styles.title}>
            Apa Kata Mereka yang <span className="text-gradient-electric">Telah Belajar</span>?
          </h2>
          <p className={styles.subtitle}>
            Bergabunglah dengan ribuan insinyur, desainer, dan product lead yang telah mengakselerasi keterampilan praktis mereka.
          </p>
        </div>

        <div className={styles.grid}>
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className={styles.card}>
              <div className={styles.stars}>
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>

              <p className={styles.quoteText}>&ldquo;{t.content}&rdquo;</p>

              <div className={styles.userRow}>
                <Image
                  src={t.avatar}
                  alt={t.name}
                  width={48}
                  height={48}
                  className={styles.userAvatar}
                />
                <div>
                  <div className={styles.userName}>{t.name}</div>
                  <div className={styles.userRole}>{t.role}</div>
                  <div className={styles.bookTag}>
                    Pembaca: {t.bookTitle}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
