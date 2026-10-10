-- Admin dashboard metrics: page-view counters and a single-call stats function.
--
-- Visits are recorded server-side through `track_visit` (service role only), so
-- the tables stay invisible to anon/authenticated clients.

create table if not exists public.page_views (
  day   date primary key,
  views bigint not null default 0
);

create table if not exists public.visitors (
  visitor_id uuid not null,
  day        date not null,
  primary key (visitor_id, day)
);

alter table public.page_views enable row level security;
alter table public.visitors enable row level security;

revoke all on public.page_views from anon, authenticated;
revoke all on public.visitors from anon, authenticated;

-- Records one visit for today and remembers the visitor (idempotent per day).
create or replace function public.track_visit(p_visitor_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.page_views (day, views)
  values (current_date, 1)
  on conflict (day) do update set views = public.page_views.views + 1;

  insert into public.visitors (visitor_id, day)
  values (p_visitor_id, current_date)
  on conflict (visitor_id, day) do nothing;
end;
$$;

revoke all on function public.track_visit(uuid) from public, anon, authenticated;
grant execute on function public.track_visit(uuid) to service_role;

-- Every dashboard number in one round trip.
create or replace function public.admin_stats()
returns table (
  total_users      bigint,
  active_users     bigint,
  total_admins     bigint,
  total_orders     bigint,
  paid_orders      bigint,
  pending_orders   bigint,
  revenue_idr      bigint,
  total_assets     bigint,
  published_assets bigint,
  total_posts      bigint,
  published_posts  bigint,
  total_views      bigint,
  views_today      bigint,
  unique_visitors  bigint
)
language sql
security definer
set search_path = public
as $$
  select
    (select count(*) from public.profiles),
    (select count(*) from public.profiles where not disabled),
    (select count(*) from public.profiles where role = 'admin'),
    (select count(*) from public.orders),
    (select count(*) from public.orders where status = 'paid'),
    (select count(*) from public.orders where status = 'pending'),
    (select coalesce(sum(total_idr), 0) from public.orders where status = 'paid'),
    (select count(*) from public.assets),
    (select count(*) from public.assets where published),
    (select count(*) from public.posts),
    (select count(*) from public.posts where published),
    (select coalesce(sum(views), 0) from public.page_views),
    (select coalesce((select views from public.page_views where day = current_date), 0)),
    (select count(distinct visitor_id) from public.visitors);
$$;

revoke all on function public.admin_stats() from public, anon, authenticated;
grant execute on function public.admin_stats() to service_role;
