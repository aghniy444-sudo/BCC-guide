import { NextResponse } from 'next/server';
import { getActiveProfile } from '@/lib/supabase/server';
import { createOrderForUser, publicOrder } from '@/lib/checkout';

export async function POST(request: Request) {
  const profile = await getActiveProfile();
  if (!profile) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const productIds = (body as { productIds?: unknown })?.productIds;
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return NextResponse.json({ error: 'product_ids_required' }, { status: 400 });
  }
  if (!productIds.every((id) => typeof id === 'string')) {
    return NextResponse.json({ error: 'invalid_product_ids' }, { status: 400 });
  }
  if (new Set(productIds).size !== productIds.length) {
    return NextResponse.json({ error: 'duplicate_product_ids' }, { status: 400 });
  }

  const result = await createOrderForUser(profile.id, productIds as string[]);
  if (result.error || !result.order) {
    const clientError = /unknown|inactive|duplicate|empty|zero_total/.test(result.error ?? '');
    return NextResponse.json(
      { error: result.error ?? 'order_failed' },
      { status: clientError ? 400 : 500 },
    );
  }

  return NextResponse.json({ order: publicOrder(result.order) });
}
