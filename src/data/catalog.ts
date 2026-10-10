import type { Product } from '@/lib/types';

/**
 * View model consumed by the catalog UI: a product plus its presentation-only
 * fields (labels, contents list, badge). Prices/titles always come from the DB.
 */
export interface CatalogItem extends Product {
  categoryLabel: string;
  includes: string[];
  badge?: string;
}

interface Presentation {
  categoryLabel: string;
  includes: string[];
  badge?: string;
}

const PRESENTATION: Record<string, Presentation> = {
  guide: {
    categoryLabel: 'E-Book Guide',
    includes: [
      'Kerangka analisis business case competition',
      'Struktur slide & alur narasi presentasi',
      'Contoh studi kasus pembahasan',
    ],
    badge: 'Produk A',
  },
  decks: {
    categoryLabel: 'Template Deck (11 PPTX)',
    includes: [
      '11 template deck lomba siap edit',
      'Layout judul, analisis, dan rekomendasi',
      'Semua slide siap edit dan presentasi',
    ],
    badge: 'Produk B',
  },
  bundle: {
    categoryLabel: 'Bundel Guide + Template Deck',
    includes: [
      'Guide Book business case lengkap',
      'Seluruh 11 template deck',
      'Harga lebih hemat dari beli terpisah',
    ],
    badge: 'Paling Hemat',
  },
};

export function toCatalogItem(product: Product): CatalogItem {
  const presentation = PRESENTATION[product.id];
  if (presentation) {
    return { ...product, ...presentation };
  }
  // Admin-created products carry their own copy; nothing is invented for them.
  return {
    ...product,
    categoryLabel: product.title,
    includes: [],
  };
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}
