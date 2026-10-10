import { redirect } from 'next/navigation';
import { Empty, ErrorBanner, PageHeader, QueryError } from '@/components/PanelContent';
import { getActiveProfile } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { Asset } from '@/lib/types';
import { deleteAsset, saveAsset } from '../actions';
import styles from '@/components/PanelContent.module.css';

export const dynamic = 'force-dynamic';

export default async function AssetsPage({ searchParams }: { searchParams: Promise<{ err?: string }> }) {
  const profile = await getActiveProfile();
  if (!profile) redirect('/');
  if (profile.role !== 'admin') redirect('/dashboard');

  const { err } = await searchParams;
  const svc = createServiceClient();
  const { data, error } = await svc.from('assets').select('*').order('created_at', { ascending: false });
  const assets = (data as Asset[] | null) ?? [];
  const { data: productRows } = await svc
    .from('products')
    .select('id, title')
    .order('sort_order')
    .order('price_idr');
  const products = (productRows as { id: string; title: string }[] | null) ?? [];

  return (
    <>
      <PageHeader crumb="Admin / Aset" title="Aset (PDF / PPTX)" />
      {err ? <ErrorBanner message={err} /> : null}
      <form action={saveAsset} className={styles.form} encType="multipart/form-data">
        <div className={styles.cardTitle}>Unggah aset baru</div>
        <select name="kind" defaultValue="free_deck" className={styles.select}>
          <option value="free_deck">Deck Gratis</option>
          {products
            .filter((product) => product.id !== 'bundle')
            .map((product) => (
              <option key={product.id} value={product.id}>
                {product.title}
              </option>
            ))}
        </select>
        <input name="title" placeholder="Judul aset" className={styles.input} />
        <input type="file" name="file" accept=".pdf,.pptx" className={styles.input} />
        <label className={styles.checkRow}>
          <input type="checkbox" name="published" value="true" defaultChecked /> Publish
        </label>
        <label className={styles.checkRow}>
          <input type="checkbox" name="is_sample" value="true" /> Tandai sebagai contoh
        </label>
        <button type="submit" className={styles.button}>
          Unggah
        </button>
        <div className={styles.note}>Maks 25 MB, PDF/PPTX saja.</div>
      </form>

      {error ? (
        <QueryError />
      ) : assets.length === 0 ? (
        <Empty text="Belum ada aset." />
      ) : (
        assets.map((asset) => (
          <div key={asset.id} className={styles.card}>
            <div className={styles.cardTitle}>
              {asset.title} <span className={styles.meta}>({asset.kind})</span>
            </div>
            <div className={styles.meta}>
              {asset.storage_path} • {asset.published ? 'published' : 'draft'} • {asset.is_sample ? 'contoh' : 'final'}
            </div>
            <form action={deleteAsset}>
              <input type="hidden" name="assetId" value={asset.id} />
              <button type="submit" className={styles.buttonDanger}>
                Hapus
              </button>
            </form>
          </div>
        ))
      )}
    </>
  );
}
