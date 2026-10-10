'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LoginModal.module.css';
import { createClient } from '@/lib/supabase/browser';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'login' | 'register';

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const isLogin = mode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!isLogin && password.length < 8) {
      setError('Kata sandi minimal 8 karakter.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setError(signInError.message);
          return;
        }
        onClose();
        router.refresh();
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) {
          setError(signUpError.message);
          return;
        }
        if (!data.session) {
          setNotice('Akun dibuat. Silakan cek email untuk verifikasi sebelum masuk.');
          return;
        }
        onClose();
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.loginCard} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Tutup">
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
              {isLogin ? 'Masuk ke BCC Guide' : 'Daftar Akun Baru'}
            </h3>
            <p className={styles.loginSubtitle}>
              {isLogin
                ? 'Akses guide book, template deck, dan dashboard Anda'
                : 'Buat akun untuk mengakses deck gratis dan materi BCC'}
            </p>
          </div>
        </div>

        <div className={styles.tabToggle}>
          <div
            className={`${styles.tabBtn} ${isLogin ? styles.tabBtnActive : ''}`}
            onClick={() => {
              setMode('login');
              setError(null);
              setNotice(null);
            }}
          >
            Masuk
          </div>
          <div
            className={`${styles.tabBtn} ${!isLogin ? styles.tabBtnActive : ''}`}
            onClick={() => {
              setMode('register');
              setError(null);
              setNotice(null);
            }}
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
              minLength={isLogin ? undefined : 8}
              placeholder={isLogin ? 'Kata sandi Anda' : 'Minimal 8 karakter'}
              className={styles.textInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div style={{ color: '#f87171', fontSize: '0.82rem', fontWeight: 500 }}>
              {error}
            </div>
          )}
          {notice && (
            <div style={{ color: '#4ade80', fontSize: '0.82rem', fontWeight: 500 }}>
              {notice}
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Memproses...' : isLogin ? 'Masuk Sekarang' : 'Buat Akun'}
          </button>
        </form>

        <p style={{ fontSize: '0.74rem', color: '#9794bf', textAlign: 'center', marginTop: '14px' }}>
          Autentikasi aman via Supabase.
        </p>
      </div>
    </div>
  );
}
