'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './CartDrawer.module.css';
import { Book } from '@/data/booksData';

export interface CartItem {
  book: Book;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (bookId: string) => void;
  onCheckoutSuccess: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onCheckoutSuccess,
}: CartDrawerProps) {
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [voucherMsg, setVoucherMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const rawSubtotal = items.reduce(
    (sum, item) => sum + item.book.price * item.quantity,
    0
  );

  const discountAmount = (rawSubtotal * appliedDiscount) / 100;
  const grandTotal = Math.max(0, rawSubtotal - discountAmount);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleApplyVoucher = () => {
    if (voucherCode.trim().toUpperCase() === 'EDUCARE20') {
      setAppliedDiscount(20);
      setVoucherMsg({ text: 'Kupon diskon 20% berhasil diterapkan!', success: true });
    } else if (voucherCode.trim().toUpperCase() === 'HEMAT50') {
      setAppliedDiscount(50);
      setVoucherMsg({ text: 'Kupon Super Hemat 50% aktif!', success: true });
    } else {
      setVoucherMsg({ text: 'Kupon tidak valid. Coba: EDUCARE20', success: false });
    }
  };

  const handleCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onCheckoutSuccess();
      onClose();
    }, 1200);
  };

  return (
    <div className={styles.drawerOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.drawerHeader}>
          <div className={styles.drawerTitle}>
            <span>Keranjang Belanja</span>
            <span className={styles.itemCountBadge}>
              {items.length} Buku
            </span>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Tutup keranjang"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.drawerBody}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#7e7ca8" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-2z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '1.05rem' }}>
                Keranjang Masih Kosong
              </div>
              <p style={{ fontSize: '0.88rem' }}>
                Pilih panduan dari katalog untuk mulai memperdalam keahlian Anda hari ini.
              </p>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.book.id} className={styles.cartItem}>
                  <div className={styles.itemThumb}>
                    <Image
                      src={item.book.coverImage}
                      alt={item.book.title}
                      width={60}
                      height={80}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div className={styles.itemInfo}>
                    <div>
                      <div className={styles.itemTitle}>{item.book.title}</div>
                      <div style={{ fontSize: '0.76rem', color: '#a78bfa', marginTop: '2px' }}>
                        {item.book.categoryLabel}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={styles.itemPrice}>
                        {formatRupiah(item.book.price)}
                      </span>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => onRemoveItem(item.book.id)}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Voucher */}
              <div className={styles.voucherBox}>
                <input
                  type="text"
                  placeholder="Kode Kupon (contoh: EDUCARE20)"
                  className={styles.voucherInput}
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                />
                <button
                  type="button"
                  className={styles.voucherBtn}
                  onClick={handleApplyVoucher}
                >
                  Terapkan
                </button>
              </div>

              {voucherMsg && (
                <div style={{
                  fontSize: '0.8rem',
                  color: voucherMsg.success ? '#4ade80' : '#f87171',
                  fontWeight: 500,
                  marginTop: '-8px'
                }}>
                  {voucherMsg.text}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className={styles.drawerFooter}>
            <div className={styles.summaryRow}>
              <span>Subtotal ({items.length} items)</span>
              <span>{formatRupiah(rawSubtotal)}</span>
            </div>

            {appliedDiscount > 0 && (
              <div className={styles.summaryRow} style={{ color: '#4ade80' }}>
                <span>Diskon Kupon ({appliedDiscount}%)</span>
                <span>-{formatRupiah(discountAmount)}</span>
              </div>
            )}

            <div className={styles.totalRow}>
              <span>Total Pembayaran</span>
              <span style={{ color: '#ffffff', fontFamily: 'Outfit' }}>
                {formatRupiah(grandTotal)}
              </span>
            </div>

            <button
              type="button"
              className={styles.checkoutBtn}
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? 'Memproses Pesanan...' : 'Lanjutkan Pembayaran Instan'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.74rem', color: '#9794bf' }}>
              🔒 Transaksi Aman • Akses Link Unduh Langsung Dikirim ke Email
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
