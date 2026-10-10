/**
 * Public URL for a product display image stored in the public
 * `product-images` bucket. Safe to call from client components.
 */
export function productImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/product-images/${path}`;
}
