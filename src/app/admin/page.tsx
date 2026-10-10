import { redirect } from 'next/navigation';
import { PageHeader, QueryError, ShortcutGrid, StatCard, StatGrid } from '@/components/PanelContent';
import { formatRupiah } from '@/data/catalog';
import { getActiveProfile } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

interface AdminStats {
  total_users: number;
  active_users: number;
  total_admins: number;
  total_orders: number;
  paid_orders: number;
  pending_orders: number;
  revenue_idr: number;
  total_assets: number;
  published_assets: number;
  total_posts: number;
  published_posts: number;
  total_views: number;
  views_today: number;
  unique_visitors: number;
}

const number = new Intl.NumberFormat('id-ID');

export default async function AdminPage() {
  const profile = await getActiveProfile();
  if (!profile) redirect('/');
  if (profile.role !== 'admin') redirect('/dashboard');

  const svc = createServiceClient();
  const { data, error } = await svc.rpc('admin_stats');
  const stats = (Array.isArray(data) ? data[0] : data) as AdminStats | undefined;

  return (
    <>
      <PageHeader
        crumb="Admin"
        title="Beranda admin"
        lede={`Masuk sebagai ${profile.email ?? 'admin'}. Ringkasan aktivitas toko.`}
      />

      {error || !stats ? (
        <QueryError />
      ) : (
        <StatGrid>
          <StatCard
            label="Total Pengguna"
            value={number.format(stats.total_users)}
            hint={`${number.format(stats.active_users)} aktif · ${number.format(stats.total_admins)} admin`}
          />
          <StatCard
            label="Total Pesanan"
            value={number.format(stats.total_orders)}
            hint={`${number.format(stats.pending_orders)} menunggu pembayaran`}
          />
          <StatCard
            label="Pembelian Berhasil"
            value={number.format(stats.paid_orders)}
            tone="positive"
          />
          <StatCard
            label="Total Pendapatan"
            value={formatRupiah(stats.revenue_idr)}
            tone="positive"
          />
          <StatCard
            label="Total Kunjungan"
            value={number.format(stats.total_views)}
            hint={`${number.format(stats.views_today)} hari ini`}
          />
          <StatCard label="Pengunjung Unik" value={number.format(stats.unique_visitors)} />
          <StatCard
            label="Aset Materi"
            value={number.format(stats.total_assets)}
            hint={`${number.format(stats.published_assets)} terbit`}
          />
          <StatCard
            label="Posting"
            value={number.format(stats.total_posts)}
            hint={`${number.format(stats.published_posts)} terbit`}
          />
        </StatGrid>
      )}

      <ShortcutGrid
        items={[
          { href: '/admin/products', label: 'Produk & Harga', text: 'Judul, deskripsi, harga, dan status aktif' },
          { href: '/admin/posts', label: 'Posting', text: 'Lomba, booklet, dan course YouTube' },
          { href: '/admin/assets', label: 'Aset', text: 'Unggah dan hapus PDF atau PPTX' },
          { href: '/admin/users', label: 'Pengguna', text: 'Status akun dan entitlement' },
        ]}
      />
    </>
  );
}
