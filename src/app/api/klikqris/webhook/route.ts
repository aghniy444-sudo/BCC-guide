import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { createServiceClient } from '@/lib/supabase/service';
import { settleOrder } from '@/lib/checkout';
import { getQrisStatus } from '@/lib/klikqris';

function signaturesMatch(provided: string, stored: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(stored);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  // KlikQRIS sends the transaction fields nested under `data`; accept a flat
  // payload too so the handler is not coupled to one shape.
  const data = (payload.data ?? payload) as Record<string, unknown>;
  const gatewayOrderId = String(data.order_id ?? payload.order_id ?? '');
  const providedSignature = String(data.signature ?? payload.signature ?? '');
  if (!gatewayOrderId || !providedSignature) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const svc = createServiceClient();
  const { data: order } = await svc
    .from('orders')
    .select('*')
    .eq('gateway_order_id', gatewayOrderId)
    .maybeSingle();

  if (!order) {
    // Unknown order: acknowledge to stop retries, but take no action.
    return NextResponse.json({ ok: true });
  }

  // Compare the callback signature against the private stored signature.
  const { data: storedSignature } = await svc.rpc('get_gateway_signature', {
    p_order_id: order.id,
  });
  if (!storedSignature || !signaturesMatch(providedSignature, storedSignature as string)) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  }

  // The callback's own status is NOT authoritative. Confirm via the status API.
  let status: string;
  try {
    const result = await getQrisStatus(order.gateway_order_id);
    status = result.status;
  } catch {
    // Upstream error: respond non-2xx so the provider retries.
    return NextResponse.json({ error: 'upstream_unavailable' }, { status: 502 });
  }

  if (status === 'SUCCESS') {
    // Allowed to settle even if the local expiry has passed, because the
    // gateway authoritatively confirms success.
    await settleOrder(order.id, true);
  } else if (status === 'EXPIRED') {
    await svc
      .from('orders')
      .update({ status: 'expired' })
      .eq('id', order.id)
      .eq('status', 'pending');
  }
  // PENDING / other: remain pending, no grant.

  return NextResponse.json({ ok: true });
}
