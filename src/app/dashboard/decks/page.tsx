import { redirect } from 'next/navigation';
import { AssetList, Empty, Locked, PageHeader, QueryError } from '@/components/PanelContent';
import { createClient, getActiveProfile } from '@/lib/supabase/server';
import type { Asset } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function DecksPage() {
  const profile = await getActiveProfile();
  if (!profile) redirect('/');
  if (profile.role === 'admin') redirect('/admin');

  const supabase = await createClient();
  const { data: entitlement, error: entitlementError } = await supabase
    .from('entitlements')
    .select('kind')
    .eq('kind', 'decks')
    .maybeSingle();

  let assets: Pick<Asset, 'id' | 'kind' | 'title' | 'is_sample'>[] = [];
  let assetError = false;
  if (entitlement) {
    const { data, error } = await supabase
      .from('assets')
      .select('id, kind, title, is_sample')
      .eq('published', true)
      .eq('kind', 'decks')
      .order('title');
    assets = (data as Pick<Asset, 'id' | 'kind' | 'title' | 'is_sample'>[] | null) ?? [];
    assetError = Boolean(error);
  }

  return (
    <>
      <PageHeader crumb="Dashboard / Template Deck" title="Template Deck (11 PPTX)" />
      {entitlementError || assetError ? (
        <QueryError />
      ) : !entitlement ? (
        <Locked text="Beli paket Template Deck atau Bundel untuk membuka akses." />
      ) : assets.length === 0 ? (
        <Empty text="Entitlement aktif, namun file belum diunggah admin." />
      ) : (
        <AssetList assets={assets} />
      )}
    </>
  );
}
