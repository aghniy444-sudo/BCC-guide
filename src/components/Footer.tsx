'use client';

import Image from 'next/image';
import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer id="contact" className={styles.footer}>
      <div className="container">
        <div className={styles.footerGrid}>
          <div className={styles.brandCol}>
            <div className={styles.brandRow}>
              <Image
                src="/bg-logo.png"
                alt="BCC Guide"
                width={526}
                height={379}
                className={styles.brandLogo}
              />
              <span className={styles.brandName}>BCC Guide</span>
            </div>
            <p className={styles.brandBio}>
              Platform materi business case competition: guide book e-book dan template deck
              presentasi untuk lomba.
            </p>
            <div className={styles.contactInfo}>Pembayaran QRIS • Akses materi langsung di dashboard</div>
          </div>

          <div>
            <div className={styles.colHeading}>Produk</div>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}><a href="#catalog">Guide Book BCC</a></li>
              <li className={styles.linkItem}><a href="#catalog">Template Deck (11 PPTX)</a></li>
              <li className={styles.linkItem}><a href="#catalog">Bundel Hemat</a></li>
            </ul>
          </div>

          <div>
            <div className={styles.colHeading}>Akun</div>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}><a href="#hero">Masuk / Daftar</a></li>
              <li className={styles.linkItem}><a href="#catalog">Deck Gratis</a></li>
              <li className={styles.linkItem}><a href="#contact">Dashboard</a></li>
            </ul>
          </div>

          <div>
            <div className={styles.colHeading}>Bantuan</div>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}><a href="#about">Tentang</a></li>
              <li className={styles.linkItem}><a href="#catalog">Cara Akses Materi</a></li>
              <li className={styles.linkItem}><a href="#contact">Kontak</a></li>
            </ul>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <div>&copy; {new Date().getFullYear()} BCC Guide.</div>
        </div>
      </div>
    </footer>
  );
}
