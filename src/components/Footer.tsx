'use client';

import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer id="contact" className={styles.footer}>
      <div className="container">
        <div className={styles.footerGrid}>
          {/* Brand info */}
          <div className={styles.brandCol}>
            <div className={styles.brandRow}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C12 7.52285 16.4772 12 22 12C16.4772 12 12 16.4772 12 22C12 16.4772 7.52285 12 2 12C7.52285 12 12 7.52285 12 2Z"
                  fill="var(--color-electric)"
                />
              </svg>
              <span className={styles.brandName}>Educare</span>
            </div>
            <p className={styles.brandBio}>
              Penerbit independen buku panduan teknis digital berkualitas tinggi. Membekali talenta teknologi dengan materi praktis berstandar industri.
            </p>
            <div className={styles.contactInfo}>
              📧 halo@educare.id • 📍 Jakarta, Indonesia
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <div className={styles.colHeading}>3 Guidebook Pilihan</div>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}><a href="#catalog">AI Engineering Handbook</a></li>
              <li className={styles.linkItem}><a href="#catalog">UI/UX Design Systems Mastery</a></li>
              <li className={styles.linkItem}><a href="#catalog">Distributed Systems Architecture</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <div className={styles.colHeading}>Program & Layanan</div>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}><a href="#mentors">Daftar Mentor Penulis</a></li>
              <li className={styles.linkItem}><a href="#about">Lisensi Perusahaan (Team)</a></li>
              <li className={styles.linkItem}><a href="#about">Jaminan Pembaruan Gratis</a></li>
              <li className={styles.linkItem}><a href="#contact">Kemitraan Penulisan Buku</a></li>
            </ul>
          </div>

          {/* Links 3 */}
          <div>
            <div className={styles.colHeading}>Bantuan & Legalitas</div>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}><a href="#about">Kebijakan Pengembalian Dana</a></li>
              <li className={styles.linkItem}><a href="#about">Syarat & Ketentuan Lisensi</a></li>
              <li className={styles.linkItem}><a href="#about">Kebijakan Privasi</a></li>
              <li className={styles.linkItem}><a href="#contact">Hubungi Tim Dukungan</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={styles.bottomBar}>
          <div>
            &copy; {new Date().getFullYear()} Educare Publishing. Seluruh hak cipta dilindungi undang-undang.
          </div>

          <div className={styles.paymentBadges}>
            <span className={styles.payBadge}>QRIS</span>
            <span className={styles.payBadge}>BCA Virtual Account</span>
            <span className={styles.payBadge}>Mandiri</span>
            <span className={styles.payBadge}>GoPay</span>
            <span className={styles.payBadge}>Visa / Master</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
