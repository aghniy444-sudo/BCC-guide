'use client';

import React, { useState } from 'react';
import styles from './LoginModal.module.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(email);
      onClose();
    }, 800);
  };

  return (
    <div className={styles.loginOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.loginCard} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Tutup"
        >
          ✕
        </button>

        <div className={styles.avatarHeader}>
          <div className={styles.avatarCircleBig}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div>
            <h3 className={styles.loginTitle}>
              {isLoginTab ? 'Masuk ke Educare' : 'Daftar Akun Baru'}
            </h3>
            <p className={styles.loginSubtitle}>
              {isLoginTab
                ? 'Akses perpustakaan panduan digital dan link download Anda'
                : 'Mulai perjalanan belajar dengan akses materi terdepan'}
            </p>
          </div>
        </div>

        <div className={styles.tabToggle}>
          <div
            className={`${styles.tabBtn} ${isLoginTab ? styles.tabBtnActive : ''}`}
            onClick={() => setIsLoginTab(true)}
          >
            Masuk
          </div>
          <div
            className={`${styles.tabBtn} ${!isLoginTab ? styles.tabBtnActive : ''}`}
            onClick={() => setIsLoginTab(false)}
          >
            Daftar
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Alamat Email</label>
            <input
              type="email"
              required
              placeholder="nama@email.com"
              className={styles.textInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Kata Sandi</label>
            <input
              type="password"
              required
              placeholder="Minimal 8 karakter"
              className={styles.textInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Memproses...' : isLoginTab ? 'Masuk Sekarang' : 'Buat Akun Gratis'}
          </button>
        </form>

        <div className={styles.oauthDivider}>
          <div className={styles.dividerLine} />
          <span>atau lanjutkan dengan</span>
          <div className={styles.dividerLine} />
        </div>

        <button
          type="button"
          className={styles.oauthBtn}
          onClick={() => {
            onLoginSuccess('user.google@gmail.com');
            onClose();
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9c-.3-.7-.5-1.5-.5-2.4z"
            />
            <path
              fill="#34A853"
              d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 17C3.7 20.7 7.5 23.5 12 23.5z"
            />
          </svg>
          <span>Lanjutkan dengan Google</span>
        </button>
      </div>
    </div>
  );
}
