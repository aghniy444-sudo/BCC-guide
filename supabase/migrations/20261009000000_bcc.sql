-- BCC Guide: schema, RLS, private signature store, atomic order RPCs.
-- Security model:
--   * Client (anon/authenticated) may only SELECT a narrow, RLS-filtered slice.
--   * All order/entitlement writes happen through service-role-only RPCs.
--   * Gateway signatures never leave private.gateway_orders.

create extension if not exists pgcrypto;

create schema if not exists private;

-- ============================================================
-- profiles
-- ============================================================
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  role       text not null default 'user' check (role in ('admin','user')),
  disabled   boolean not null default false,
  created_at timestamptz not null default now()
);

-- Every new auth user becomes a plain, enabled profile. Role/disabled are only
-- ever changed by an admin server action (service role) — never by the client.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- products
-- ============================================================
create table public.products (
  id          text primary key check (id in ('guide','decks','bundle')),
  title       text not null,
  description text not null default '',
  price_idr   integer not null check (price_idr > 0),
  active      boolean not null default true
);

-- ============================================================
-- assets (metadata only; files live in the private 'content' bucket)
-- ============================================================
create table public.assets (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('free_deck','guide','decks')),
  title        text not null,
  storage_path text not null unique,
  is_sample    boolean not null default true,
  published    boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- posts (competition / booklet / course)
-- ============================================================
create table public.posts (
  id         uuid primary key default gen_random_uuid(),
  type       text not null check (type in ('competition','booklet','course')),
  title      text not null,
  body       text not null default '',
  url        text,
  published  boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- orders / order_items / entitlements
-- ============================================================
create table public.orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  status           text not null default 'pending' check (status in ('pending','paid','expired','failed')),
  provider         text not null check (provider in ('mock','klikqris_sandbox')),
  subtotal_idr     integer not null check (subtotal_idr >= 0),
  total_idr        integer not null check (total_idr >= 0),
  gateway_order_id text not null unique,
  qris_url         text,
  payment_url      text,
  expires_at       timestamptz,
  paid_at          timestamptz,
  created_at       timestamptz not null default now()
);
create index orders_user_id_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);

create table public.order_items (
  order_id       uuid not null references public.orders(id) on delete cascade,
  product_id     text not null references public.products(id),
  unit_price_idr integer not null check (unit_price_idr > 0),
  primary key (order_id, product_id)
);
create index order_items_order_id_idx on public.order_items(order_id);

create table public.entitlements (
  user_id    uuid not null references auth.users(id) on delete cascade,
  kind       text not null check (kind in ('guide','decks')),
  order_id   uuid references public.orders(id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (user_id, kind)
);
create index entitlements_user_id_idx on public.entitlements(user_id);

-- ============================================================
-- private.gateway_orders — holds KlikQRIS callback signatures.
-- Never exposed via PostgREST and never SELECTed into a client payload.
-- ============================================================
create table private.gateway_orders (
  order_id  uuid primary key references public.orders(id) on delete cascade,
  signature text
);

-- ============================================================
-- is_admin() — security definer with fixed search_path.
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.disabled = false
  );
$$;

-- ============================================================
-- RLS
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.products      enable row level security;
alter table public.assets        enable row level security;
alter table public.posts         enable row level security;
alter table public.orders        enable row level security;
alter table public.order_items   enable row level security;
alter table public.entitlements  enable row level security;

-- profiles: read own (or admin); admins may update. No self role change.
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy profiles_admin_update on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());
create policy profiles_admin_delete on public.profiles
  for delete using (public.is_admin());

-- products: public may read active only; admins full access.
create policy products_select_active on public.products
  for select using (active = true);
create policy products_admin_select on public.products
  for select using (public.is_admin());
create policy products_admin_insert on public.products
  for insert with check (public.is_admin());
create policy products_admin_update on public.products
  for update using (public.is_admin()) with check (public.is_admin());
create policy products_admin_delete on public.products
  for delete using (public.is_admin());

-- assets: authenticated may read published metadata; admins full access.
create policy assets_select_published on public.assets
  for select to authenticated using (published = true);
create policy assets_admin_all on public.assets
  for all using (public.is_admin()) with check (public.is_admin());

-- posts: public may read published; admins full access.
create policy posts_select_published on public.posts
  for select using (published = true);
create policy posts_admin_all on public.posts
  for all using (public.is_admin()) with check (public.is_admin());

-- orders: owner or admin may read; no client writes.
create policy orders_select_own on public.orders
  for select using (user_id = auth.uid() or public.is_admin());

-- order_items: readable when the parent order is visible.
create policy order_items_select_own on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );

-- entitlements: owner or admin may read; no client writes.
create policy entitlements_select_own on public.entitlements
  for select using (user_id = auth.uid() or public.is_admin());

-- ============================================================
-- Grants: start from zero and hand out only what RLS policies need.
-- ============================================================
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on schema private from anon, authenticated;
revoke all on all tables in schema private from anon, authenticated;
grant usage on schema public to anon, authenticated;

grant select on public.products to anon, authenticated;
grant select on public.posts    to anon, authenticated;

grant select on public.profiles     to authenticated;
grant select on public.assets       to authenticated;
grant select on public.orders       to authenticated;
grant select on public.order_items  to authenticated;
grant select on public.entitlements to authenticated;

-- Admin write grants are meaningless without the is_admin() policies above.
grant insert, update, delete on public.products to authenticated;
grant insert, update, delete on public.assets   to authenticated;
grant insert, update, delete on public.posts    to authenticated;
grant update, delete on public.profiles         to authenticated;

-- ============================================================
-- RPCs (service-role only)
-- ============================================================

-- create_order: validate product ids server-side, apply bundle override,
-- snapshot prices, and insert order + items atomically.
create or replace function public.create_order(
  p_user_id         uuid,
  p_provider        text,
  p_gateway_order_id text,
  p_product_ids     text[],
  p_expires_at      timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ids       text[];
  v_subtotal  integer;
  v_order_id  uuid;
begin
  if p_user_id is null then
    raise exception 'user_required' using errcode = '22023';
  end if;
  if p_provider not in ('mock','klikqris_sandbox') then
    raise exception 'bad_provider' using errcode = '22023';
  end if;
  if p_product_ids is null or array_length(p_product_ids, 1) is null then
    raise exception 'empty_products' using errcode = '22023';
  end if;

  -- distinct, sorted set of requested ids
  select array(select distinct unnest(p_product_ids)) into v_ids;

  -- reject duplicates supplied by the caller
  if array_length(v_ids, 1) <> array_length(p_product_ids, 1) then
    raise exception 'duplicate_products' using errcode = '22023';
  end if;

  -- every requested id must exist and be active
  if exists (
    select 1 from unnest(v_ids) as rid
    where not exists (
      select 1 from public.products p where p.id = rid and p.active = true
    )
  ) then
    raise exception 'unknown_or_inactive_product' using errcode = '22023';
  end if;

  -- bundle supersedes guide/decks when mixed
  if 'bundle' = any(v_ids) then
    v_ids := array['bundle'];
  end if;

  select coalesce(sum(p.price_idr), 0) into v_subtotal
  from public.products p where p.id = any(v_ids);

  if v_subtotal <= 0 then
    raise exception 'zero_total' using errcode = '22023';
  end if;

  insert into public.orders
    (user_id, status, provider, subtotal_idr, total_idr, gateway_order_id, expires_at)
  values
    (p_user_id, 'pending', p_provider, v_subtotal, v_subtotal, p_gateway_order_id, p_expires_at)
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, unit_price_idr)
  select v_order_id, p.id, p.price_idr
  from public.products p where p.id = any(v_ids);

  return v_order_id;
end;
$$;

-- settle_order: lock the row, apply a single status transition, and upsert
-- entitlements (bundle grants both guide + decks). Idempotent.
create or replace function public.settle_order(
  p_order_id      uuid,
  p_allow_expired boolean default false
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order  public.orders%rowtype;
  v_kinds  text[];
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    return 'not_found';
  end if;

  if v_order.status = 'paid' then
    return 'already_paid';
  end if;

  if v_order.status in ('expired','failed') and not p_allow_expired then
    return 'not_settleable';
  end if;

  update public.orders
  set status = 'paid', paid_at = now()
  where id = p_order_id;

  -- derive entitlement kinds from the purchased items
  select array_agg(distinct k) into v_kinds
  from (
    select case
      when oi.product_id = 'bundle' then 'guide'
      else oi.product_id
    end as k
    from public.order_items oi
    where oi.order_id = p_order_id
    union
    select 'decks' where exists (
      select 1 from public.order_items oi
      where oi.order_id = p_order_id and oi.product_id in ('bundle','decks')
    )
  ) s
  where k in ('guide','decks');

  insert into public.entitlements (user_id, kind, order_id)
  select v_order.user_id, k, p_order_id
  from unnest(coalesce(v_kinds, array[]::text[])) as k
  on conflict (user_id, kind) do update
    set order_id = coalesce(public.entitlements.order_id, excluded.order_id);

  return 'paid';
end;
$$;

-- Only the service role may execute the write RPCs.
revoke all on function public.create_order(uuid, text, text, text[], timestamptz) from public, anon, authenticated;
revoke all on function public.settle_order(uuid, boolean) from public, anon, authenticated;
grant execute on function public.create_order(uuid, text, text, text[], timestamptz) to service_role;
grant execute on function public.settle_order(uuid, boolean) to service_role;

-- Gateway signature accessors (service-role only). The signature is never
-- returned to clients; only the webhook handler (server) reads it.
create or replace function public.set_gateway_signature(p_order_id uuid, p_signature text)
returns void
language sql
security definer
set search_path = public, private
as $$
  insert into private.gateway_orders (order_id, signature)
  values (p_order_id, p_signature)
  on conflict (order_id) do update set signature = excluded.signature;
$$;

create or replace function public.get_gateway_signature(p_order_id uuid)
returns text
language sql
stable
security definer
set search_path = public, private
as $$
  select signature from private.gateway_orders where order_id = p_order_id;
$$;

revoke all on function public.set_gateway_signature(uuid, text) from public, anon, authenticated;
revoke all on function public.get_gateway_signature(uuid) from public, anon, authenticated;
grant execute on function public.set_gateway_signature(uuid, text) to service_role;
grant execute on function public.get_gateway_signature(uuid) to service_role;

-- ============================================================
-- Private storage bucket for all downloadable content.
-- No policies for anon/authenticated => no direct reads/writes.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('content', 'content', false)
on conflict (id) do nothing;
