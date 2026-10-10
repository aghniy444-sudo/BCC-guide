import { redirect } from 'next/navigation';
import Storefront, { type SessionUser } from '@/components/Storefront';
import { createClient } from '@/lib/supabase/server';
import { toCatalogItem } from '@/data/catalog';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;

  let user: SessionUser | null = null;
  if (claims?.sub) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, role, disabled')
      .eq('id', claims.sub)
      .maybeSingle();

    if (profile && !profile.disabled) {
      if (profile.role === 'admin') redirect('/admin');
      user = { email: profile.email ?? '', role: profile.role as 'admin' | 'user' };
    }
  }

  const { data: products } = await supabase
    .from('products')
    .select('id, title, description, price_idr, active, image_path, sort_order')
    .eq('active', true)
    .order('sort_order')
    .order('price_idr', { ascending: true });

  const catalog = (products as Product[] | null)?.map(toCatalogItem) ?? [];

  return <Storefront products={catalog} user={user} />;
}
