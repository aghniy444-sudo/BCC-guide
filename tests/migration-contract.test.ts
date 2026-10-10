import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// Cheap contract guard: the security-critical statements must remain present in
// the migration. A missing one is a silent regression, so fail loudly here.
const sql = readFileSync(
  path.resolve('supabase/migrations/20261009000000_bcc.sql'),
  'utf8',
);

describe('migration security contract', () => {
  it('enables RLS on every public table', () => {
    for (const table of ['profiles', 'products', 'assets', 'posts', 'orders', 'order_items', 'entitlements']) {
      expect(sql).toMatch(new RegExp(`alter table public\\.${table}\\s+enable row level security`));
    }
  });

  it('revokes default grants before granting narrow access', () => {
    expect(sql).toMatch(/revoke all on all tables in schema public from anon, authenticated/);
  });

  it('keeps the gateway signature in a non-exposed private schema', () => {
    expect(sql).toMatch(/create table private\.gateway_orders/);
    expect(sql).toMatch(/revoke all on schema private from anon, authenticated/);
  });

  it('uses a security-definer is_admin with a fixed search_path', () => {
    expect(sql).toMatch(/function public\.is_admin\(\)[\s\S]*security definer[\s\S]*set search_path = public/);
  });

  it('restricts order RPCs to the service role', () => {
    expect(sql).toMatch(/grant execute on function public\.create_order[\s\S]*to service_role/);
    expect(sql).toMatch(/grant execute on function public\.settle_order[\s\S]*to service_role/);
    expect(sql).toMatch(/revoke all on function public\.create_order[\s\S]*from public, anon, authenticated/);
  });

  it('never grants client write access to orders/entitlements', () => {
    expect(sql).not.toMatch(/grant\s+(insert|update|delete|all)[^;]*on public\.orders to authenticated/);
    expect(sql).not.toMatch(/grant\s+(insert|update|delete|all)[^;]*on public\.entitlements to authenticated/);
  });
});
