import { redirect } from 'next/navigation';
import PanelShell from '@/components/PanelShell';
import type { NavIcon, NavItem } from '@/components/PanelMenu';
import { getActiveProfile } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { materialLabel } from '@/lib/materials';

export const dynamic = 'force-dynamic';

/** Icons for the well-known products; admin-created ones fall back to a book. */
const MATERIAL_ICON: Record<string, NavIcon> = {
  guide: 'book',
  decks: 'layers',
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getActiveProfile();
  if (!profile) redirect('/');
  if (profile.role === 'admin') redirect('/admin');

  // Products drive the materials menu, so new products appear automatically.
  const svc = createServiceClient();
  const { data } = await svc
    .from('products')
    .select('id, title, active, sort_order')
    .eq('active', true)
    .order('sort_order')
    .order('price_idr');

  const products = (data as { id: string; title: string }[] | null) ?? [];
  const materials: NavItem[] = products
    .filter((product) => product.id !== 'bundle')
    .map((product) => ({
      href: `/dashboard/materials/${product.id}`,
      label: materialLabel(product.id),
      icon: MATERIAL_ICON[product.id] ?? 'book',
      group: 'Materi',
    }));

  const NAV: NavItem[] = [
    { href: '/dashboard', label: 'Beranda', icon: 'home', group: 'Menu' },
    { href: '/dashboard/orders', label: 'Pesanan', icon: 'orders', group: 'Menu' },
    { href: '/dashboard/free-decks', label: 'Deck Gratis', icon: 'gift', group: 'Materi' },
    ...materials,
    { href: '/dashboard/competitions', label: 'Info Lomba', icon: 'trophy', group: 'Informasi' },
    { href: '/dashboard/booklets', label: 'Booklet', icon: 'file', group: 'Informasi' },
    { href: '/dashboard/courses', label: 'Course', icon: 'play', group: 'Informasi' },
  ];

  return (
    <PanelShell profile={profile} nav={NAV} homeHref="/dashboard">
      {children}
    </PanelShell>
  );
}
