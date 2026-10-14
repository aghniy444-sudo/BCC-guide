'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './CartDrawer.module.css';
import CheckoutAuth from './CheckoutAuth';
import { formatRupiah, type CatalogItem } from '@/data/catalog';
import { readJson } from '@/lib/http';

interface OrderView {
  id: string;
  status: 'pending' | 'paid' | 'expired' | 'failed';
  provider: 'klikqris';
  total_idr: number;
  gateway_order_id: string;
  qris_url: string | null;
  payment_url: string | null;
  expires_at: string | null;
}

const STATUS_LABEL: Record<OrderView['status'], string> = {
  pending: 'Menunggu pembayaran',
  paid: 'Pembayaran terkonfirmasi',
  expired: 'Kedaluwarsa',
  failed: 'Gagal',
};

const STATUS_CLASS: Record<OrderView['status'], string> = {
  pending: styles.statusPending,
  paid: styles.statusPaid,
  expired: styles.statusExpired,
  failed: styles.statusFailed,
};

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CatalogItem[];
  isLoggedIn: boolean;
  onRemoveItem: (productId: string) => void;
  onOrderPaid: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  isLoggedIn,
  onRemoveItem,
  onOrderPaid,
}: CartDrawerProps) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price_idr, 0);

  const refreshOrder = useCallback(async (orderId: string) => {
    const res = await fetch(`/api/orders/${orderId}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await readJson<{ order?: OrderView }>(res);
    if (!data?.order) return null;
    setOrder(data.order);
    return data.order;
  }, []);

  // Poll the order while it is still awaiting payment.
  useEffect(() => {
    if (!order || order.status !== 'pending') return;
    const id = setInterval(() => {
      refreshOrder(order.id);
    }, 5000);
    return () => clearInterval(id);
  }, [order, refreshOrder]);

  const settledOrderId = useRef<string | null>(null);

  // Clear the cart once, when an order first reports as paid. Guarding on the
  // order id keeps the callback from firing on every re-render.
  useEffect(() => {
    if (!order || order.status !== 'paid') return;
    if (settledOrderId.current === order.id) return;
    settledOrderId.current = order.id;
    onOrderPaid();
  }, [order, onOrderPaid]);

  if (!isOpen) return null;

  const createOrder = async () => {
    setError(null);
    setIsProcessing(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: items.map((i) => i.id) }),
      });
      if (res.status === 401) {
        setShowAuth(true);
        return;
      }
      const data = await readJson<{ order?: OrderView; error?: string }>(res);
      if (!res.ok || !data?.order) {
        setError(data?.error ?? `Checkout gagal (${res.status}).`);
        return;
      }
      setOrder(data.order);
    } catch {
      setError('Tidak dapat menghubungi server checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      setShowAuth(true);
      return;
    }
    createOrder();
  };

  const handleAuthenticated = () => {
    setShowAuth(false);
    router.refresh();
    // The session cookie is already set by the client, so the order can be
    // created immediately without waiting for the refresh.
    createOrder();
  };

  const expiresLabel = order?.expires_at
    ? new Date(order.expires_at).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className={styles.drawerOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <div className={styles.drawerTitle}>
            <span>Keranjang</span>
            <span className={styles.itemCountBadge}>{items.length} item</span>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Tutup keranjang">
            ✕
          </button>
        </div>

        <div className={styles.drawerBody}>
          {items.length === 0 && !order ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyTitle}>Keranjang masih kosong</p>
              <p className={styles.emptyHint}>Pilih produk dari katalog untuk memulai.</p>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTitle}>{item.title}</div>
                    <div className={styles.itemCategory}>{item.categoryLabel}</div>
                    <div className={styles.itemRow}>
                      <span className={styles.itemPrice}>{formatRupiah(item.price_idr)}</span>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => onRemoveItem(item.id)}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {showAuth && !isLoggedIn ? (
                <CheckoutAuth onAuthenticated={handleAuthenticated} onCancel={() => setShowAuth(false)} />
              ) : null}

              {order ? (
                <div className={styles.orderPanel}>
                  <div className={styles.orderHead}>
                    <span className={`${styles.status} ${STATUS_CLASS[order.status]}`}>
                      {STATUS_LABEL[order.status]}
                    </span>
                    <span className={styles.orderMode}>QRIS</span>
                  </div>

                  <dl className={styles.orderMeta}>
                    <div>
                      <dt>Kode order</dt>
                      <dd className={styles.orderCode}>{order.gateway_order_id}</dd>
                    </div>
                    <div>
                      <dt>Total</dt>
                      <dd>{formatRupiah(order.total_idr)}</dd>
                    </div>
                    {order.status === 'pending' && expiresLabel ? (
                      <div>
                        <dt>Bayar sebelum</dt>
                        <dd>{expiresLabel} WIB</dd>
                      </div>
                    ) : null}
                  </dl>

                  {order.status === 'pending' && order.payment_url ? (
                    <a
                      className={styles.qrisLink}
                      href={order.payment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Buka halaman pembayaran QRIS
                    </a>
                  ) : null}

                  {order.status === 'pending' && order.qris_url ? (
                    <a
                      className={styles.qrisLink}
                      href={order.qris_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Tampilkan gambar QRIS
                    </a>
                  ) : null}

                  {order.status === 'pending' ? (
                    <p className={styles.orderNote}>
                      Selesaikan pembayaran sesuai nominal di atas. Status akan diperbarui otomatis
                      setelah pembayaran diterima.
                    </p>
                  ) : null}

                  {order.status === 'paid' ? (
                    <p className={styles.orderNote}>
                      Materi sudah terbuka. Buka dashboard untuk mengunduh.
                    </p>
                  ) : null}

                  {order.status === 'expired' ? (
                    <p className={styles.orderNote}>
                      Batas waktu pembayaran habis. Buat pesanan baru untuk mencoba lagi.
                    </p>
                  ) : null}

                  {order.status === 'failed' ? (
                    <p className={styles.orderNote}>
                      Pesanan gagal dibuat. Silakan hubungi kami atau coba lagi.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {error ? (
                <p className={styles.errorText} role="alert">
                  {error}
                </p>
              ) : null}
            </>
          )}
        </div>

        {(items.length > 0 || order) && (
          <div className={styles.drawerFooter}>
            <div className={styles.totalRow}>
              <span>Total</span>
              <span className={styles.totalValue}>
                {formatRupiah(order ? order.total_idr : subtotal)}
              </span>
            </div>

            {!order && !showAuth ? (
              <button
                type="button"
                className={styles.checkoutBtn}
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing
                  ? 'Memproses...'
                  : isLoggedIn
                    ? 'Lanjutkan ke Pembayaran'
                    : 'Masuk untuk Checkout'}
              </button>
            ) : null}

            {order && order.status === 'pending' ? (
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => refreshOrder(order.id)}
                disabled={isProcessing}
              >
                Perbarui status
              </button>
            ) : null}

            {order && order.status === 'paid' ? (
              <div className={styles.paidNote}>Selesai — cek dashboard untuk mengunduh materi.</div>
            ) : null}

            <p className={styles.demoNote}>Pembayaran aman melalui KlikQRIS</p>
          </div>
        )}
      </div>
    </div>
  );
}
