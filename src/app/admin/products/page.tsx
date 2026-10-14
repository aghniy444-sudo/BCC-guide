import { redirect } from 'next/navigation';
import { CardGrid, Empty, ErrorBanner, PageHeader, QueryError } from '@/components/PanelContent';
import { formatRupiah } from '@/data/catalog';
import { getActiveProfile } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { productImageUrl } from '@/lib/storage';
import { PRODUCT_IMAGE_MAX_BYTES, PRODUCT_IMAGE_MAX_LABEL } from '@/lib/upload';
import type { Product } from '@/lib/types';
import LimitedFileInput from '@/components/LimitedFileInput';
import { createProduct, deleteProduct, updateProduct } from '../actions';
import styles from '@/components/PanelContent.module.css';

export const dynamic = 'force-dynamic';

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ err?: string }> }) {
  const profile = await getActiveProfile();
  if (!profile) redirect('/');
  if (profile.role !== 'admin') redirect('/dashboard');

  const { err } = await searchParams;
  const svc = createServiceClient();
  const { data, error } = await svc
    .from('products')
    .select('*')
    .order('sort_order')
    .order('price_idr');
  const products = (data as Product[] | null) ?? [];

  return (
    <>
      <PageHeader crumb="Admin / Produk & Harga" title="Produk & Harga" />
      {err ? <ErrorBanner message={err} /> : null}

      <form action={createProduct} className={styles.form}>
        <div className={styles.cardTitle}>Tambah produk</div>
        <label className={styles.field}>
          ID produk <span className={styles.note}>huruf kecil, angka, tanda hubung</span>
          <input name="id" placeholder="mis. mentoring" className={styles.input} required />
        </label>
        <label className={styles.field}>
          Judul
          <input name="title" className={styles.input} required />
        </label>
        <label className={styles.field}>
          Deskripsi
          <textarea name="description" className={styles.textarea} />
        </label>
        <label className={styles.field}>
          Harga (Rp)
          <input name="price_idr" type="number" min="1" className={styles.input} required />
        </label>
        <LimitedFileInput
          name="image"
          accept="image/png,image/jpeg,image/webp"
          maxBytes={PRODUCT_IMAGE_MAX_BYTES}
          maxLabel={PRODUCT_IMAGE_MAX_LABEL}
          fieldClassName={styles.field}
          inputClassName={styles.input}
          errorClassName={styles.fieldError}
        >
          Gambar display{' '}
          <span className={styles.note}>
            PNG, JPG, atau WEBP · maks {PRODUCT_IMAGE_MAX_LABEL}
          </span>
        </LimitedFileInput>
        <label className={styles.field}>
          Status
          <select name="active" defaultValue="true" className={styles.select}>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </label>
        <button type="submit" className={styles.button}>
          Tambah produk
        </button>
      </form>

      {error ? (
        <QueryError />
      ) : products.length === 0 ? (
        <Empty text="Belum ada produk." />
      ) : (
        <CardGrid>
          {products.map((product) => {
            const image = productImageUrl(product.image_path);
            return (
              <form key={product.id} action={updateProduct} className={styles.form}>
                <input type="hidden" name="id" value={product.id} />
                <div className={styles.cardId}>{product.id}</div>

                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt={product.title} className={styles.productImage} />
                ) : (
                  <div className={styles.productImageEmpty}>Tanpa gambar</div>
                )}

                <label className={styles.field}>
                  Judul
                  <input name="title" defaultValue={product.title} className={styles.input} />
                </label>
                <label className={styles.field}>
                  Deskripsi
                  <textarea name="description" defaultValue={product.description} className={styles.textarea} />
                </label>
                <label className={styles.field}>
                  Harga (Rp) <span className={styles.note}>saat ini {formatRupiah(product.price_idr)}</span>
                  <input name="price_idr" type="number" defaultValue={product.price_idr} className={styles.input} />
                </label>
                <LimitedFileInput
                  name="image"
                  accept="image/png,image/jpeg,image/webp"
                  maxBytes={PRODUCT_IMAGE_MAX_BYTES}
                  maxLabel={PRODUCT_IMAGE_MAX_LABEL}
                  fieldClassName={styles.field}
                  inputClassName={styles.input}
                  errorClassName={styles.fieldError}
                >
                  Ganti gambar{' '}
                  <span className={styles.note}>biarkan kosong bila tidak diubah</span>
                </LimitedFileInput>
                {image ? (
                  <label className={styles.checkRow}>
                    <input type="checkbox" name="remove_image" value="true" /> Hapus gambar
                  </label>
                ) : null}
                <label className={styles.field}>
                  Aktif
                  <select name="active" defaultValue={String(product.active)} className={styles.select}>
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
                  </select>
                </label>
                <div className={styles.inlineActions}>
                  <button type="submit" className={styles.button}>
                    Simpan
                  </button>
                  <button
                    type="submit"
                    className={styles.buttonDanger}
                    formAction={deleteProduct}
                    formNoValidate
                  >
                    Hapus
                  </button>
                </div>
              </form>
            );
          })}
        </CardGrid>
      )}
    </>
  );
}
