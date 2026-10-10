import { redirect } from 'next/navigation';
import { AssetList, Empty, PageHeader, QueryError } from '@/components/PanelContent';
import { createClient, getActiveProfile } from '@/lib/supabase/server';
import type { Asset } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function FreeDecksPage() {
  const profile = await getActiveProfile();
  if (!profile) redirect('/');
  if (profile.role === 'admin') redirect('/admin');

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('assets')
    .select('id, kind, title, is_sample')
    .eq('published', true)
    .eq('kind', 'free_deck')
    .order('title');
  const assets = (data as Pick<Asset, 'id' | 'kind' | 'title' | 'is_sample'>[] | null) ?? [];

  return (
    <>
      <PageHeader crumb="Dashboard / Deck Gratis" title="Free Deck (untuk semua akun)" />
      {error ? (
        <QueryError />
      ) : assets.length === 0 ? (
        <Empty text="Belum ada deck gratis. Admin belum mengunggah konten." />
      ) : (
        <AssetList assets={assets} />
      )}
    </>
  );
}
