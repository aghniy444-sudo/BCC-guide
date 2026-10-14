'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getActiveProfile } from '@/lib/supabase/server';
import { createServiceClient, type ServiceClient } from '@/lib/supabase/service';
import { ASSET_MAX_BYTES, ASSET_MAX_LABEL, PRODUCT_IMAGE_MAX_BYTES, PRODUCT_IMAGE_MAX_LABEL } from '@/lib/upload';
import type { AssetKind, PostType } from '@/lib/types';

async function requireAdmin() {
  const profile = await getActiveProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('forbidden');
  }
  return profile;
}

function revalidateDashboard() {
  revalidatePath('/dashboard', 'layout');
}

function revalidateAdmin() {
  revalidatePath('/admin', 'layout');
}

/**
 * Runs an admin mutation, re-throwing Next's internal redirect and turning any
 * validation error into a `?err=` banner on the action's own page.
 * `q` is only preserved when it is a plain search string, never a URL.
 */
async function run(errorPath: string, fn: () => Promise<void>, formData?: FormData) {
  try {
    await fn();
  } catch (err) {
    if (err && typeof err === 'object' && 'digest' in err && String(err.digest).startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    const q = String(formData?.get('q') ?? '').trim();
    const params = new URLSearchParams();
    if (q && !q.includes('/') && !q.includes('\\') && q.length <= 200) params.set('q', q);
    params.set('err', (err as Error).message);
    redirect(`${errorPath}?${params.toString()}`);
  }
}

// ---------------------------------------------------------------- users
export async function setUserDisabled(formData: FormData) {
  await run('/admin/users', async () => {
    const admin = await requireAdmin();
    const userId = String(formData.get('userId') ?? '');
    const disabled = String(formData.get('disabled') ?? '') === 'true';
    if (userId === admin.id) throw new Error('Tidak dapat menonaktifkan akun sendiri.');

    const svc = createServiceClient();
    await svc.from('profiles').update({ disabled }).eq('id', userId);
    revalidateAdmin();
  }, formData);
}

export async function grantEntitlement(formData: FormData) {
  await run('/admin/users', async () => {
    await requireAdmin();
    const userId = String(formData.get('userId') ?? '');
    const kind = String(formData.get('kind') ?? '');
    const svc = createServiceClient();
    if (kind !== 'guide' && kind !== 'decks') {
      const { data: product } = await svc.from('products').select('id').eq('id', kind).maybeSingle();
      if (!product) throw new Error('Jenis entitlement tidak valid.');
    }

    // Manual grant: order_id is null.
    await svc
      .from('entitlements')
      .upsert({ user_id: userId, kind, order_id: null }, { onConflict: 'user_id,kind' });
    revalidateDashboard();
    revalidateAdmin();
  }, formData);
}

export async function revokeEntitlement(formData: FormData) {
  await run('/admin/users', async () => {
    await requireAdmin();
    const userId = String(formData.get('userId') ?? '');
    const kind = String(formData.get('kind') ?? '');
    const svc = createServiceClient();
    await svc.from('entitlements').delete().eq('user_id', userId).eq('kind', kind);
    revalidateDashboard();
    revalidateAdmin();
  }, formData);
}

// ---------------------------------------------------------------- products
const PRODUCT_IMAGE_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};
const PRODUCT_ID = /^[a-z0-9][a-z0-9-]{1,30}$/;

/** Uploads a product image and returns its storage path. */
async function uploadProductImage(svc: ServiceClient, file: File) {
  const ext = PRODUCT_IMAGE_MIME[file.type];
  if (!ext) throw new Error('Gambar harus PNG, JPG, atau WEBP.');
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    throw new Error(`Ukuran gambar melebihi ${PRODUCT_IMAGE_MAX_LABEL}.`);
  }
  const path = `${crypto.randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error } = await svc.storage
    .from('product-images')
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (error) throw new Error(`Upload gambar gagal: ${error.message}`);
  return path;
}

export async function createProduct(formData: FormData) {
  await run('/admin/products', async () => {
    await requireAdmin();
    const id = String(formData.get('id') ?? '').trim().toLowerCase();
    const title = String(formData.get('title') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const price = Number(formData.get('price_idr'));
    const active = String(formData.get('active') ?? '') === 'true';
    const file = formData.get('image');

    if (!PRODUCT_ID.test(id)) {
      throw new Error('ID produk hanya huruf kecil, angka, dan tanda hubung (2-31 karakter).');
    }
    if (id === 'bundle') throw new Error('ID "bundle" dipakai untuk paket khusus.');
    if (!title) throw new Error('Judul produk wajib diisi.');
    if (!Number.isInteger(price) || price <= 0) {
      throw new Error('Harga harus bilangan bulat rupiah positif.');
    }

    const svc = createServiceClient();
    const { data: existing } = await svc.from('products').select('id').eq('id', id).maybeSingle();
    if (existing) throw new Error(`ID produk "${id}" sudah dipakai.`);

    let imagePath: string | null = null;
    if (file instanceof File && file.size > 0) {
      imagePath = await uploadProductImage(svc, file);
    }

    const { data: last } = await svc
      .from('products')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    const sortOrder = Number(last?.sort_order ?? 0) + 1;

    const { error } = await svc.from('products').insert({
      id,
      title,
      description,
      price_idr: price,
      active,
      image_path: imagePath,
      sort_order: sortOrder,
    });
    if (error) {
      if (imagePath) await svc.storage.from('product-images').remove([imagePath]);
      throw new Error('Gagal menyimpan produk.');
    }

    revalidateAdmin();
    revalidatePath('/');
  }, formData);
}

export async function deleteProduct(formData: FormData) {
  await run('/admin/products', async () => {
    await requireAdmin();
    const id = String(formData.get('id') ?? '');
    const svc = createServiceClient();

    // Products that were already purchased must stay for order history.
    const { count } = await svc
      .from('order_items')
      .select('order_id', { count: 'exact', head: true })
      .eq('product_id', id);
    if ((count ?? 0) > 0) {
      throw new Error('Produk sudah pernah dibeli. Nonaktifkan saja agar tidak hilang dari riwayat.');
    }

    const { data: existing } = await svc
      .from('products')
      .select('image_path')
      .eq('id', id)
      .maybeSingle();

    await svc.from('products').delete().eq('id', id);
    if (existing?.image_path) {
      await svc.storage.from('product-images').remove([existing.image_path]);
    }

    revalidateAdmin();
    revalidatePath('/');
  }, formData);
}

export async function updateProduct(formData: FormData) {
  await run('/admin/products', async () => {
    await requireAdmin();
    const id = String(formData.get('id') ?? '');
    const title = String(formData.get('title') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const price = Number(formData.get('price_idr'));
    const active = String(formData.get('active') ?? '') === 'true';
    const removeImage = String(formData.get('remove_image') ?? '') === 'true';
    const file = formData.get('image');

    if (!title) throw new Error('Judul produk wajib diisi.');
    if (!Number.isInteger(price) || price <= 0) {
      throw new Error('Harga harus bilangan bulat rupiah positif.');
    }

    const svc = createServiceClient();
    const { data: current } = await svc
      .from('products')
      .select('image_path')
      .eq('id', id)
      .maybeSingle();
    const previousImage = current?.image_path ?? null;

    let nextImage = previousImage;
    if (file instanceof File && file.size > 0) {
      nextImage = await uploadProductImage(svc, file);
    } else if (removeImage) {
      nextImage = null;
    }

    const { error } = await svc
      .from('products')
      .update({ title, description, price_idr: price, active, image_path: nextImage })
      .eq('id', id);
    if (error) {
      if (nextImage && nextImage !== previousImage) {
        await svc.storage.from('product-images').remove([nextImage]);
      }
      throw new Error('Gagal memperbarui produk.');
    }

    if (previousImage && previousImage !== nextImage) {
      await svc.storage.from('product-images').remove([previousImage]);
    }

    revalidateAdmin();
    revalidatePath('/');
  }, formData);
}

// ---------------------------------------------------------------- assets
const ALLOWED_MIME: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
};

export async function saveAsset(formData: FormData) {
  await run('/admin/assets', async () => {
    await requireAdmin();
    const kind = String(formData.get('kind') ?? '') as AssetKind;
    const title = String(formData.get('title') ?? '').trim();
    const published = String(formData.get('published') ?? '') === 'true';
    const isSample = String(formData.get('is_sample') ?? '') === 'true';
    const assetId = String(formData.get('assetId') ?? '').trim();
    const file = formData.get('file');

    const svc = createServiceClient();

    if (kind !== 'free_deck') {
      const { data: product } = await svc.from('products').select('id').eq('id', kind).maybeSingle();
      if (!product) throw new Error('Jenis aset tidak valid.');
    }
    if (!title) throw new Error('Judul aset wajib diisi.');

    if (file instanceof File && file.size > 0) {
      if (file.size > ASSET_MAX_BYTES) throw new Error(`Ukuran file melebihi ${ASSET_MAX_LABEL}.`);
      const ext = ALLOWED_MIME[file.type];
      if (!ext || !file.name.toLowerCase().endsWith(`.${ext}`)) {
        throw new Error('Tipe file harus PDF atau PPTX.');
      }

      const storagePath = `${kind}/${crypto.randomUUID()}-${file.name}`;
      const bytes = Buffer.from(await file.arrayBuffer());
      const { error: upErr } = await svc.storage
        .from('content')
        .upload(storagePath, bytes, { contentType: file.type, upsert: false });
      if (upErr) throw new Error(`Upload file gagal: ${upErr.message}`);

      if (assetId) {
        const { data: existing } = await svc
          .from('assets')
          .select('storage_path')
          .eq('id', assetId)
          .maybeSingle();
        const { error: updErr } = await svc
          .from('assets')
          .update({ kind, title, storage_path: storagePath, published, is_sample: isSample })
          .eq('id', assetId);
        if (updErr) {
          await svc.storage.from('content').remove([storagePath]);
          throw new Error('Gagal memperbarui data aset.');
        }
        if (existing?.storage_path) {
          await svc.storage.from('content').remove([existing.storage_path]);
        }
      } else {
        const { error: insErr } = await svc
          .from('assets')
          .insert({ kind, title, storage_path: storagePath, published, is_sample: isSample });
        if (insErr) {
          await svc.storage.from('content').remove([storagePath]);
          throw new Error('Gagal menyimpan data aset.');
        }
      }
    } else if (assetId) {
      await svc
        .from('assets')
        .update({ kind, title, published, is_sample: isSample })
        .eq('id', assetId);
    } else {
      throw new Error('File aset wajib diunggah.');
    }

    revalidateDashboard();
    revalidateAdmin();
  });
}

export async function deleteAsset(formData: FormData) {
  await run('/admin/assets', async () => {
    await requireAdmin();
    const id = String(formData.get('assetId') ?? '');
    const svc = createServiceClient();
    const { data: existing } = await svc
      .from('assets')
      .select('storage_path')
      .eq('id', id)
      .maybeSingle();
    await svc.from('assets').delete().eq('id', id);
    if (existing?.storage_path) {
      await svc.storage.from('content').remove([existing.storage_path]);
    }
    revalidateDashboard();
    revalidateAdmin();
  });
}

// ---------------------------------------------------------------- posts
const YOUTUBE_RE =
  /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[\w-]+/;

function validatePostUrl(type: PostType, url: string): void {
  if (!url) return;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('URL tidak valid.');
  }
  if (parsed.protocol !== 'https:') throw new Error('URL harus memakai https.');
  if (type === 'course' && !YOUTUBE_RE.test(url)) {
    throw new Error('URL course harus berupa tautan YouTube yang valid.');
  }
}

export async function savePost(formData: FormData) {
  await run('/admin/posts', async () => {
    await requireAdmin();
    const id = String(formData.get('postId') ?? '').trim();
    const type = String(formData.get('type') ?? '') as PostType;
    const title = String(formData.get('title') ?? '').trim();
    const body = String(formData.get('body') ?? '').trim();
    const url = String(formData.get('url') ?? '').trim();
    const published = String(formData.get('published') ?? '') === 'true';

    if (!['competition', 'booklet', 'course'].includes(type)) throw new Error('Jenis posting tidak valid.');
    if (!title) throw new Error('Judul posting wajib diisi.');
    validatePostUrl(type, url);

    const svc = createServiceClient();
    if (id) {
      await svc
        .from('posts')
        .update({ type, title, body, url: url || null, published })
        .eq('id', id);
    } else {
      await svc.from('posts').insert({ type, title, body, url: url || null, published });
    }
    revalidateDashboard();
    revalidateAdmin();
  });
}

export async function setPostPublished(formData: FormData) {
  await run('/admin/posts', async () => {
    await requireAdmin();
    const id = String(formData.get('postId') ?? '');
    const published = String(formData.get('published') ?? '') === 'true';
    const svc = createServiceClient();
    await svc.from('posts').update({ published }).eq('id', id);
    revalidateDashboard();
    revalidateAdmin();
  });
}

export async function deletePost(formData: FormData) {
  await run('/admin/posts', async () => {
    await requireAdmin();
    const id = String(formData.get('postId') ?? '');
    const svc = createServiceClient();
    await svc.from('posts').delete().eq('id', id);
    revalidateDashboard();
    revalidateAdmin();
  });
}
