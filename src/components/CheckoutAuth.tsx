'use client';

import React, { useState } from 'react';
import styles from './CheckoutAuth.module.css';
import { createClient } from '@/lib/supabase/browser';

type Mode = 'login' | 'register';

/**
 * Compact sign-in / sign-up form rendered inside the cart drawer so the
 * checkout flow stays in one place. Mirrors LoginModal's auth behaviour
 * (password minimum, email-verification notice) but reports success through
 * `onAuthenticated` instead of navigating away.
 */
export default function CheckoutAuth({
  onAuthenticated,
  onCancel,
}: {
  onAuthenticated: () => void;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isLogin = mode === 'login';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError('Email atau kata sandi salah.');
          return;
        }
        onAuthenticated();
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (!data.session) {
        setNotice('Akun dibuat. Cek email untuk verifikasi, lalu masuk kembali di sini.');
        return;
      }
      onAuthenticated();
    } catch (err) {
      setError(
        err instanceof Error && /json|network|fetch/i.test(err.message)
          ? 'Koneksi ke server login terputus. Coba lagi.'
          : err instanceof Error
            ? err.message
            : 'Login gagal. Coba lagi.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.auth}>
      <div className={styles.head}>
        <p className={styles.title}>
          {isLogin ? 'Masuk untuk menyelesaikan pembelian' : 'Buat akun untuk melanjutkan'}
        </p>
        <p className={styles.subtitle}>
          Materi tersimpan di akun Anda, jadi pembelian ini perlu akun.
        </p>
      </div>

      <div className={styles.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={isLogin}
          className={isLogin ? styles.tabActive : styles.tab}
          onClick={() => {
            setMode('login');
            setError(null);
            setNotice(null);
          }}
        >
          Masuk
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isLogin}
          className={!isLogin ? styles.tabActive : styles.tab}
          onClick={() => {
            setMode('register');
            setError(null);
            setNotice(null);
          }}
        >
          Daftar
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <input
            className={styles.input}
            type="email"
            value={email}
            autoComplete="email"
            required
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Kata sandi</span>
          <input
            className={styles.input}
            type="password"
            value={password}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            minLength={isLogin ? undefined : 8}
            required
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        ) : null}

        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? 'Memproses...' : isLogin ? 'Masuk & Lanjut Bayar' : 'Daftar & Lanjut Bayar'}
        </button>
        <button type="button" className={styles.cancel} onClick={onCancel}>
          Kembali
        </button>
      </form>
    </div>
  );
}
