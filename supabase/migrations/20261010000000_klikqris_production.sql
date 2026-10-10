-- Production KlikQRIS provider.
--
-- The original schema only allowed 'mock' and 'klikqris_sandbox'. Production
-- checkout uses the live KlikQRIS API, so the allowed provider set gains
-- 'klikqris'. Existing rows are untouched.
--
-- create_order is redefined below as an exact copy of the original function
-- with only the provider allow-list widened (same validation, bundle override,
-- price snapshot, and grants).

alter table public.orders
  drop constraint if exists orders_provider_check;

alter table public.orders
  add constraint orders_provider_check
  check (provider in ('mock', 'klikqris_sandbox', 'klikqris'));

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
  if p_provider not in ('mock','klikqris_sandbox','klikqris') then
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

revoke all on function public.create_order(uuid, text, text, text[], timestamptz) from public, anon, authenticated;
grant execute on function public.create_order(uuid, text, text, text[], timestamptz) to service_role;
