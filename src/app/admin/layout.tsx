import { redirect } from 'next/navigation';
import PanelShell from '@/components/PanelShell';
import type { NavItem } from '@/components/PanelMenu';
import { getActiveProfile } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const NAV: NavItem[] = [
  { href: '/admin', label: 'Beranda', icon: 'home', group: 'Menu' },
  { href: '/admin/products', label: 'Produk & Harga', icon: 'tag', group: 'Kelola' },
  { href: '/admin/posts', label: 'Posting', icon: 'megaphone', group: 'Kelola' },
  { href: '/admin/assets', label: 'Aset', icon: 'upload', group: 'Kelola' },
  { href: '/admin/users', label: 'Pengguna', icon: 'users', group: 'Kelola' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getActiveProfile();
  if (!profile) redirect('/');
  if (profile.role !== 'admin') redirect('/dashboard');

  return (
    <PanelShell profile={profile} nav={NAV} homeHref="/admin">
      {children}
    </PanelShell>
  );
}
