'use client';

import React, { useState } from 'react';
import styles from './NewsletterSection.module.css';

interface NewsletterSectionProps {
  onShowToast: (message: string) => void;
}

export default function NewsletterSection({ onShowToast }: NewsletterSectionProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
    onShowToast(`Sample gratis 45 halaman telah dikirim ke ${email}! Silakan cek inbox Anda.`);
    setEmail('');
  };

  return (
    <section className="container">
      <div className={styles.newsletterCard}>
        <div className={styles.leftContent}>
          <div className="badge-pill" style={{ alignSelf: 'flex-start' }}>
            🎁 Sample Kit Gratis
          </div>
          <h2 className={styles.cardTitle}>
            Ingin Mencoba Dulu? Dapatkan <span className="text-gradient">45 Halaman Pertama</span> Gratis!
          </h2>
          <p className={styles.cardDesc}>
            Daftarkan email Anda dan kami akan mengirimkan PDF kompilasi bab awal panduan AI & Microservices lengkap dengan diagram arsitektur ke inbox Anda dalam 1 menit.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.formBox}>
          <div className={styles.inputGroup}>
            <input
              type="email"
              required
              placeholder="Masukkan email Anda..."
              className={styles.emailInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className={styles.subscribeBtn}>
              {isSubmitted ? 'Terkirim ✓' : 'Kirim Sample PDF'}
            </button>
          </div>
          <span className={styles.guaranteeNote}>
            🔒 Bebas spam. Kami hanya mengirim materi panduan berkualitas tinggi.
          </span>
        </form>
      </div>
    </section>
  );
}
