'use client';

import React, { useState } from 'react';
import styles from './FAQSection.module.css';
import { FAQS } from '@/data/booksData';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className={styles.faqSection}>
      <div className="container">
        <div className={styles.header}>
          <div className="badge-pill" style={{ alignSelf: 'center' }}>
            Pertanyaan Umum
          </div>
          <h2 className={styles.title}>
            Kerap Ditanyakan Seputar <span className="text-gradient">Pembelian</span>
          </h2>
          <p className={styles.subtitle}>
            Jawaban lengkap seputar lisensi, akses file, update materi seumur hidup, dan garansi.
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
                  onClick={() => toggleItem(idx)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <span className={`${styles.iconToggle} ${isOpen ? styles.iconRotated : ''}`}>
                    +
                  </span>
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
