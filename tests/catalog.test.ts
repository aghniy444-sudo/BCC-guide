import { describe, it, expect } from 'vitest';
import { toCatalogItem, formatRupiah } from '@/data/catalog';
import type { Product } from '@/lib/types';

const product: Product = {
  id: 'guide',
  title: 'Guide Book BCC',
  description: 'E-book',
  price_idr: 30000,
  active: true,
};

describe('catalog view model', () => {
  it('merges presentation metadata without overriding DB fields', () => {
    const item = toCatalogItem(product);
    expect(item.id).toBe('guide');
    expect(item.price_idr).toBe(30000);
    expect(item.title).toBe('Guide Book BCC');
    expect(item.categoryLabel).toBe('E-Book Guide');
    expect(item.includes.length).toBeGreaterThan(0);
  });

  it('formats rupiah as IDR without decimals', () => {
    expect(formatRupiah(30000)).toContain('30.000');
  });
});
