// Server-only order lifecycle helpers. Used by API routes and server actions.

import { createServiceClient } from '@/lib/supabase/service';
import { createQris } from '@/lib/klikqris';
import type { Order } from '@/lib/types';

export type PaymentMode = 'klikqris';

export interface ModeResolution {
  mode: PaymentMode | null;
  reason?: string;
}

/**
 * Resolve the effective payment mode, failing closed: checkout only works when
 * live KlikQRIS credentials are present. There is no demo/simulation fallback.
 */
export function resolvePaymentMode(): ModeResolution {
  if (!process.env.KLIKQRIS_API_KEY || !process.env.KLIKQRIS_MERCHANT_ID) {
    return { mode: null, reason: 'klikqris_credentials_missing' };
  }
  return { mode: 'klikqris' };
}

export interface CreateOrderResult {
  order?: Order;
  error?: string;
}

export async function createOrderForUser(
  userId: string,
  productIds: string[],
): Promise<CreateOrderResult> {
  const resolution = resolvePaymentMode();
  if (!resolution.mode) {
    return { error: resolution.reason };
  }

  const svc = createServiceClient();
  const gatewayOrderId = `BCC-${crypto.randomUUID()}`;

  const { data: orderId, error } = await svc.rpc('create_order', {
    p_user_id: userId,
    p_provider: 'klikqris',
    p_gateway_order_id: gatewayOrderId,
    p_product_ids: productIds,
    p_expires_at: null,
  });

  if (error) {
    return { error: error.message };
  }

  const { data: order } = await svc
    .from('orders')
    .select('*')
    .eq('id', orderId as string)
    .single();

  if (!order) {
    return { error: 'order_creation_failed' };
  }

  try {
    const created = await createQris({
      orderId: gatewayOrderId,
      amount: order.total_idr,
      keterangan: 'BCC Guide order',
    });

    // The gateway adds a unique code to the requested amount; the buyer pays
    // total_amount, so it must be >= the subtotal we validated server-side.
    if (!Number.isFinite(created.totalAmount) || created.totalAmount < order.total_idr) {
      await svc.from('orders').update({ status: 'failed' }).eq('id', order.id);
      return { error: 'klikqris_amount_mismatch' };
    }

    await svc
      .from('orders')
      .update({
        total_idr: created.totalAmount,
        qris_url: created.qrisUrl,
        payment_url: created.paymentUrl,
        expires_at: created.expiresAt,
      })
      .eq('id', order.id);

    if (created.signature) {
      await svc.rpc('set_gateway_signature', {
        p_order_id: order.id,
        p_signature: created.signature,
      });
    }

    order.total_idr = created.totalAmount;
    order.qris_url = created.qrisUrl;
    order.payment_url = created.paymentUrl;
    order.expires_at = created.expiresAt;
  } catch {
    // Create failed/timed out: no entitlement. Mark failed so reconciliation
    // can be done against the gateway before allowing a retry.
    await svc.from('orders').update({ status: 'failed' }).eq('id', order.id);
    return { error: 'klikqris_create_failed' };
  }

  return { order: order as Order };
}

/** Marks a pending order expired when its deadline has passed. */
export async function expireIfStale(order: Order): Promise<Order> {
  if (order.status !== 'pending' || !order.expires_at) return order;
  if (new Date(order.expires_at).getTime() >= Date.now()) return order;

  const svc = createServiceClient();
  await svc.from('orders').update({ status: 'expired' }).eq('id', order.id).eq('status', 'pending');
  return { ...order, status: 'expired' };
}

/** Settles an order (single transition, idempotent). Returns the final status. */
export async function settleOrder(
  orderId: string,
  allowExpired: boolean,
): Promise<string> {
  const svc = createServiceClient();
  const { data, error } = await svc.rpc('settle_order', {
    p_order_id: orderId,
    p_allow_expired: allowExpired,
  });
  if (error) return 'error';
  return (data as string) ?? 'error';
}

/** Strips fields that must never reach the client. */
export function publicOrder(order: Order) {
  return {
    id: order.id,
    status: order.status,
    provider: order.provider,
    subtotal_idr: order.subtotal_idr,
    total_idr: order.total_idr,
    gateway_order_id: order.gateway_order_id,
    qris_url: order.qris_url,
    payment_url: order.payment_url,
    expires_at: order.expires_at,
    paid_at: order.paid_at,
    created_at: order.created_at,
  };
}
