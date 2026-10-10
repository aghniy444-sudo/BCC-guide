import { NextResponse } from 'next/server';
import { getActiveProfile } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { expireIfStale, publicOrder, settleOrder } from '@/lib/checkout';
import { getQrisStatus } from '@/lib/klikqris';
import type { Order } from '@/lib/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const profile = await getActiveProfile();
  if (!profile) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const svc = createServiceClient();
  const { data: order } = await svc.from('orders').select('*').eq('id', id).single();

  if (!order) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  if (order.user_id !== profile.id && profile.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  let current = await expireIfStale(order as Order);

  // Reconcile against the authoritative gateway status while pending.
  if (current.status === 'pending') {
    try {
      const status = await getQrisStatus(current.gateway_order_id);
      if (status.status === 'SUCCESS') {
        await settleOrder(current.id, true);
        current = { ...current, status: 'paid' };
      } else if (status.status === 'EXPIRED') {
        await svc
          .from('orders')
          .update({ status: 'expired' })
          .eq('id', current.id)
          .eq('status', 'pending');
        current = { ...current, status: 'expired' };
      }
    } catch {
      // Upstream unavailable — leave the order pending.
    }
  }

  return NextResponse.json(
    { order: publicOrder(current) },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
