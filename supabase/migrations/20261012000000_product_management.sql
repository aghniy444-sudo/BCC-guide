-- Free-form product management + public product images.
--
-- Products are no longer limited to the three seeded ids: admins can create
-- any product, give it a display image, and buyers receive an entitlement named
-- after that product (bundle still grants guide + decks).

-- products: arbitrary ids, display image, manual ordering.
alter table public.products drop constraint if exists products_id_check;
alter table public.products add column if not exists image_path text;
alter table public.products add column if not exists sort_order integer not null default 0;
alter table public.products add column if not exists created_at timestamptz not null default now();

-- assets: materials may belong to any product id (kind = product id).
alter table public.assets drop constraint if exists assets_kind_check;

-- entitlements: kind is now the product id.
alter table public.entitlements drop constraint if exists entitlements_kind_check;

-- settle_order: derive entitlement kinds from the purchased items without
-- discarding unknown product ids.
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
  ) s;

  insert into public.entitlements (user_id, kind, order_id)
  select v_order.user_id, k, p_order_id
  from unnest(coalesce(v_kinds, array[]::text[])) as k
  on conflict (user_id, kind) do update
    set order_id = coalesce(public.entitlements.order_id, excluded.order_id);

  return 'paid';
end;
$$;

revoke all on function public.settle_order(uuid, boolean) from public, anon, authenticated;
grant execute on function public.settle_order(uuid, boolean) to service_role;

-- Public bucket for product display images. Uploads happen through the service
-- role (admin server action), so no client write policy is needed; the public
-- read path is served by the storage API for public buckets.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;
