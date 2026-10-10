// Shared domain types mirrored from the database schema.

export type ProductId = 'guide' | 'decks' | 'bundle';

export interface Product {
  id: string;
  title: string;
  description: string;
  price_idr: number;
  active: boolean;
  image_path?: string | null;
  sort_order?: number;
  created_at?: string;
}

/** Materials are keyed by product id, so any product can own assets. */
export type AssetKind = string;

export interface Asset {
  id: string;
  kind: AssetKind;
  title: string;
  storage_path: string;
  is_sample: boolean;
  published: boolean;
}

export type PostType = 'competition' | 'booklet' | 'course';

export interface Post {
  id: string;
  type: PostType;
  title: string;
  body: string;
  url: string | null;
  published: boolean;
  created_at: string;
}

export type OrderStatus = 'pending' | 'paid' | 'expired' | 'failed';
export type OrderProvider = 'mock' | 'klikqris_sandbox' | 'klikqris';

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  provider: OrderProvider;
  subtotal_idr: number;
  total_idr: number;
  gateway_order_id: string;
  qris_url: string | null;
  payment_url: string | null;
  expires_at: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  role: 'admin' | 'user';
  disabled: boolean;
}
