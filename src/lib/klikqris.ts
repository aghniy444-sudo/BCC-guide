// Server-only module: imported exclusively by route handlers / server actions.
// Never import from a client component.

/**
 * KlikQRIS client — production (MY PG Integration v2.0).
 *
 * Fail-closed: without credentials every call throws, so checkout can never
 * silently fall back to a fake payment path.
 */

const BASE = 'https://klikqris.com/api/qrisv2';

export interface CreateQrisResult {
  gatewayOrderId: string;
  /** Amount the buyer must actually pay (includes the gateway's unique code). */
  totalAmount: number;
  qrisUrl: string | null;
  paymentUrl: string | null;
  expiresAt: string | null;
  signature: string | null;
}

export interface QrisStatusResult {
  /** Authoritative status from the gateway: SUCCESS | PENDING | EXPIRED | other */
  status: string;
  totalAmount: number | null;
}

function credentials() {
  const apiKey = process.env.KLIKQRIS_API_KEY;
  const merchantId = process.env.KLIKQRIS_MERCHANT_ID;
  if (!apiKey || !merchantId) {
    throw new Error('klikqris_credentials_missing');
  }
  return { apiKey, merchantId };
}

export async function createQris(params: {
  orderId: string;
  amount: number;
  keterangan: string;
}): Promise<CreateQrisResult> {
  const { apiKey, merchantId } = credentials();
  const res = await fetch(`${BASE}/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      id_merchant: merchantId,
    },
    body: JSON.stringify({
      order_id: params.orderId,
      id_merchant: merchantId,
      amount: params.amount,
      keterangan: params.keterangan,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`klikqris_create_failed:${res.status}`);
  }

  const json = (await res.json()) as Record<string, unknown>;
  if (json.status === false) {
    throw new Error(`klikqris_create_rejected:${String(json.message ?? '')}`);
  }
  const data = (json.data ?? json) as Record<string, unknown>;

  const gatewayOrderId = String(data.order_id ?? params.orderId);
  const totalAmount = Number(data.total_amount ?? params.amount);
  if (!Number.isFinite(totalAmount)) {
    throw new Error('klikqris_create_bad_amount');
  }

  return {
    gatewayOrderId,
    totalAmount,
    qrisUrl: (data.qris_url as string) ?? (data.qr_url as string) ?? null,
    // direct_url is the hosted payment page; fall back to any payment_url.
    paymentUrl: (data.direct_url as string) ?? (data.payment_url as string) ?? null,
    expiresAt: (data.expired_at as string) ?? (data.expires_at as string) ?? null,
    signature: (data.signature as string) ?? null,
  };
}

export async function getQrisStatus(orderId: string): Promise<QrisStatusResult> {
  const { apiKey, merchantId } = credentials();
  const res = await fetch(`${BASE}/status/${encodeURIComponent(merchantId)}/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
      id_merchant: merchantId,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`klikqris_status_failed:${res.status}`);
  }

  const json = (await res.json()) as Record<string, unknown>;
  const data = (json.data ?? json) as Record<string, unknown>;
  const total = data.total_amount;
  return {
    status: String(data.status ?? '').toUpperCase(),
    totalAmount: total === undefined || total === null ? null : Number(total),
  };
}
