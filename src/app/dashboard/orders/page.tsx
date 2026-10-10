import { redirect } from 'next/navigation';
import { Empty, PageHeader, QueryError, StatusBadge } from '@/components/PanelContent';
import { formatRupiah } from '@/data/catalog';
import { createClient, getActiveProfile } from '@/lib/supabase/server';
import type { Order } from '@/lib/types';
import styles from '@/components/PanelContent.module.css';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const profile = await getActiveProfile();
  if (!profile) redirect('/');
  if (profile.role === 'admin') redirect('/admin');

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('id, status, total_idr, gateway_order_id, created_at')
    .order('created_at', { ascending: false });
  const orders = (data as Pick<Order, 'id' | 'status' | 'total_idr' | 'gateway_order_id' | 'created_at'>[] | null) ?? [];

  return (
    <>
      <PageHeader crumb="Dashboard / Pesanan" title="Pesanan" lede="Status pending, paid, expired, dan failed." />
      {error ? (
        <QueryError />
      ) : orders.length === 0 ? (
        <Empty text="Belum ada pembelian." hint="Paket yang dibeli akan muncul di sini." href="/#catalog" action="Lihat katalog" />
      ) : (
        <ul className={styles.list}>
          {orders.map((order) => (
            <li key={order.id} className={styles.orderRow}>
              <span className={styles.orderId}>{order.gateway_order_id}</span>
              <span className={styles.orderPrice}>{formatRupiah(order.total_idr)}</span>
              <StatusBadge status={order.status} />
              <time className={styles.orderDate} dateTime={order.created_at}>
                {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </time>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
