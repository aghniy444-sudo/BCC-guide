import { redirect } from 'next/navigation';
import { PageHeader, QueryError, ShortcutGrid } from '@/components/PanelContent';
import { createClient, getActiveProfile } from '@/lib/supabase/server';
import styles from '@/components/PanelContent.module.css';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const profile = await getActiveProfile();
  if (!profile) redirect('/');
  if (profile.role === 'admin') redirect('/admin');

  const supabase = await createClient();
  const { data: entitlements, error } = await supabase.from('entitlements').select('kind');
  const owned = new Set((entitlements as { kind: string }[] | null)?.map((item) => item.kind) ?? []);

  return (
    <>
      <PageHeader
        crumb="Dashboard"
        title={`Halo, ${profile.email ?? 'pengguna'}`}
        lede="Kelola pesanan dan materi Anda. Pilih area di samping."
      />
      {error ? <QueryError /> : null}
      <div className={styles.statusRow}>
        <span className={owned.has('guide') ? styles.chipOn : styles.chipOff}>
          Guide Book: {owned.has('guide') ? 'aktif' : 'belum dimiliki'}
        </span>
        <span className={owned.has('decks') ? styles.chipOn : styles.chipOff}>
          Template Deck: {owned.has('decks') ? 'aktif' : 'belum dimiliki'}
        </span>
      </div>
      <ShortcutGrid
        items={[
          { href: '/dashboard/orders', label: 'Pesanan', text: 'Riwayat pembelian dan status pembayaran' },
          { href: '/dashboard/free-decks', label: 'Deck Gratis', text: 'Deck gratis untuk semua akun' },
          { href: '/dashboard/guide', label: 'Guide Book', text: 'Akses e-book yang sudah dibeli' },
          { href: '/dashboard/decks', label: 'Template Deck', text: '11 template PPTX berbayar' },
          { href: '/dashboard/competitions', label: 'Info Lomba', text: 'Pengumuman lomba yang terbit' },
          { href: '/dashboard/booklets', label: 'Booklet', text: 'Booklet yang terbit' },
          { href: '/dashboard/courses', label: 'Course', text: 'Materi dasar BCC di YouTube' },
        ]}
      />
    </>
  );
}
