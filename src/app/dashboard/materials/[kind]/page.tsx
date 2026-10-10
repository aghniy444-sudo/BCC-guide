import { redirect } from 'next/navigation';
import { AssetList, Empty, Locked, PageHeader, QueryError } from '@/components/PanelContent';
import { createClient, getActiveProfile } from '@/lib/supabase/server';
import { materialLabel } from '@/lib/materials';
import type { Asset } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * Materials for any product id. `/dashboard/materials/guide` and
 * `/dashboard/materials/<new-product>` share this page, so products created in
 * the admin panel get a dashboard area automatically.
 */
export default async function MaterialPage({ params }: { params: Promise<{ kind: string }> }) {
  const profile = await getActiveProfile();
  if (!profile) redirect('/');
  if (profile.role === 'admin') redirect('/admin');

  const { kind } = await params;
  const label = materialLabel(kind);

  const supabase = await createClient();
  const { data: entitlement, error: entitlementError } = await supabase
    .from('entitlements')
    .select('kind')
    .eq('kind', kind)
    .maybeSingle();

  let assets: Pick<Asset, 'id' | 'kind' | 'title' | 'is_sample'>[] = [];
  let assetError = false;
  if (entitlement) {
    const { data, error } = await supabase
      .from('assets')
      .select('id, kind, title, is_sample')
      .eq('published', true)
      .eq('kind', kind)
      .order('title');
    assets = (data as Pick<Asset, 'id' | 'kind' | 'title' | 'is_sample'>[] | null) ?? [];
    assetError = Boolean(error);
  }

  return (
    <>
      <PageHeader crumb={`Dashboard / ${label}`} title={label} />
      {entitlementError || assetError ? (
        <QueryError />
      ) : !entitlement ? (
        <Locked text={`Beli ${label} untuk membuka akses.`} />
      ) : assets.length === 0 ? (
        <Empty text="Akses aktif, namun file belum diunggah admin." />
      ) : (
        <AssetList assets={assets} />
      )}
    </>
  );
}
