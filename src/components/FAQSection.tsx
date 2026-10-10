'use client';

import React, { useState } from 'react';
import styles from './FAQSection.module.css';

interface Faq {
  question: string;
  answer: string;
}

const FAQS: Faq[] = [
  {
    question: 'Apa isi Guide Book Business Case Competition?',
    answer:
      'E-book berisi kerangka analisis business case, struktur slide presentasi, alur narasi, dan contoh studi kasus. Harga dan isi akhir dapat diperbarui oleh admin.',
  },
  {
    question: 'Apa isi paket Template Deck?',
    answer:
      'Paket berisi 11 template deck PowerPoint untuk lomba business case competition, mulai dari slide judul hingga rencana implementasi.',
  },
  {
    question: 'Apakah ada paket bundel?',
    answer:
      'Ya. Paket bundel berisi Guide Book dan seluruh 11 template deck dengan harga lebih hemat dibanding membeli terpisah.',
  },
  {
    question: 'Bagaimana cara mengakses materi setelah pembelian?',
    answer:
      'Setelah pembayaran terkonfirmasi, materi terbuka di dashboard Anda dan dapat diunduh melalui tautan aman (signed URL berumur pendek).',
  },
  {
    question: 'Metode pembayaran apa yang dipakai?',
    answer:
      'Pembayaran dilakukan melalui QRIS. Setelah pembayaran terkonfirmasi, akses materi terbuka otomatis di dashboard akun Anda.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className={styles.faqSection}>
      <div className="container">
        <div className={styles.header}>
          <p className="eyebrow">Pertanyaan Umum</p>
          <h2 className={styles.title}>
            Kerap Ditanyakan Seputar <span className="text-gradient">Produk &amp; Akses</span>
          </h2>
          <p className={styles.subtitle}>
            Informasi seputar isi produk, akses materi, dan metode pembayaran.
          </p>
        </div>

        <div className={styles.accordionList}>
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className={styles.accordionItem}>
                <button
                  type="button"
                  className={styles.questionBtn}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <span className={`${styles.iconToggle} ${isOpen ? styles.iconRotated : ''}`}>+</span>
                </button>

                {isOpen && (
                  <div className={styles.answerBody}>
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
