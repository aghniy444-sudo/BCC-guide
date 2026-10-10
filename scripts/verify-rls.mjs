// End-to-end verification against a running local Supabase:
//   - RLS: anon reads active products only; role change denied; cross-user denied
//   - RPC: create_order validation, bundle override, settle idempotency, entitlements
//   - asset authorization is exercised via the app in the browser (see README plan)
//
// Usage: node scripts/verify-rls.mjs
// Requires .env.local with NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
// SUPABASE_SECRET_KEY.

import { existsSync, readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
}

async function main() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !anon || !secret) {
    console.error('Missing Supabase env (NEXT_PUBLIC_SUPABASE_URL / _PUBLISHABLE_KEY / SUPABASE_SECRET_KEY).');
    process.exit(1);
  }

  const service = createClient(url, secret, { auth: { persistSession: false } });
  const anonClient = createClient(url, anon, { auth: { persistSession: false } });

  // ---- anon: can read active products, cannot write
  const { data: prods } = await anonClient.from('products').select('id, price_idr, active');
  check('anon reads active products', (prods ?? []).length === 3, JSON.stringify(prods));

  const { error: anonWrite } = await anonClient
    .from('products')
    .update({ price_idr: 1 })
    .eq('id', 'guide');
  check('anon cannot update products', Boolean(anonWrite));

  const { data: anonOrders } = await anonClient.from('orders').select('id');
  check('anon sees no orders', (anonOrders ?? []).length === 0);

  // ---- create two confirmed users
  const stamp = Date.now();
  const emailA = `free_${stamp}@example.com`;
  const emailB = `other_${stamp}@example.com`;
  const password = 'password123';

  const { data: uA } = await service.auth.admin.createUser({
    email: emailA,
    password,
    email_confirm: true,
  });
  const { data: uB } = await service.auth.admin.createUser({
    email: emailB,
    password,
    email_confirm: true,
  });

  const clientA = createClient(url, anon, { auth: { persistSession: false } });
  await clientA.auth.signInWithPassword({ email: emailA, password });

  // ---- RLS: user cannot escalate their own role
  const { error: roleErr } = await clientA
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', uA.user.id);
  const { data: profileA } = await service
    .from('profiles')
    .select('role')
    .eq('id', uA.user.id)
    .single();
  check('user cannot self-promote to admin', profileA.role === 'user', `err=${roleErr?.message ?? 'none'}`);

  // ---- RPC: invalid product rejected
  const { error: badProd } = await service.rpc('create_order', {
    p_user_id: uA.user.id,
    p_provider: 'mock',
    p_gateway_order_id: `DEMO-bad-${stamp}`,
    p_product_ids: ['nope'],
  });
  check('create_order rejects unknown product', Boolean(badProd));

  // ---- RPC: bundle overrides guide+decks, total = 50000
  const { data: orderId } = await service.rpc('create_order', {
    p_user_id: uA.user.id,
    p_provider: 'mock',
    p_gateway_order_id: `DEMO-${stamp}`,
    p_product_ids: ['guide', 'decks', 'bundle'],
  });
  const { data: order } = await service.from('orders').select('*').eq('id', orderId).single();
  check('bundle total is 50000 (not summed)', order.total_idr === 50000, `total=${order.total_idr}`);

  // ---- settle twice: idempotent, grants guide+decks
  await service.rpc('settle_order', { p_order_id: orderId, p_allow_expired: false });
  const second = await service.rpc('settle_order', { p_order_id: orderId, p_allow_expired: false });
  check('settle is idempotent', second.data === 'already_paid', `status=${second.data}`);

  const { data: ents } = await service.from('entitlements').select('kind').eq('user_id', uA.user.id);
  const kinds = (ents ?? []).map((e) => e.kind).sort();
  check('bundle grants guide+decks', kinds.join(',') === 'decks,guide', kinds.join(','));

  // ---- cross-user: B cannot read A's order
  const clientB = createClient(url, anon, { auth: { persistSession: false } });
  await clientB.auth.signInWithPassword({ email: emailB, password });
  const { data: bOrders } = await clientB.from('orders').select('id').eq('id', orderId);
  check('other user cannot read A order', (bOrders ?? []).length === 0);

  const { data: bEnts } = await clientB.from('entitlements').select('kind');
  check('other user has no entitlements', (bEnts ?? []).length === 0);

  // ---- cleanup
  await service.auth.admin.deleteUser(uA.user.id);
  await service.auth.admin.deleteUser(uB.user.id);

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
