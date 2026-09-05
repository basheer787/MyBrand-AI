-- Run this in the Supabase SQL editor after schema.sql and upgrade.sql.
create table if not exists public.social_connections (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  provider text not null default 'meta' check (provider in ('meta')),
  page_id text not null,
  page_name text,
  page_access_token text not null,
  ig_business_id text,
  ig_username text,
  connected_at timestamptz not null default now(),
  unique (brand_id, provider)
);

create table if not exists public.publications (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  platform text not null check (platform in ('instagram', 'facebook')),
  caption text,
  asset_path text,
  external_post_id text,
  status text not null default 'published',
  created_at timestamptz not null default now()
);

alter table public.social_connections enable row level security;
alter table public.publications enable row level security;

create policy "owners manage social connections" on public.social_connections
  for all
  using (exists (select 1 from public.brands b where b.id = brand_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.brands b where b.id = brand_id and b.user_id = auth.uid()));

create policy "owners manage publications" on public.publications
  for all
  using (exists (select 1 from public.brands b where b.id = brand_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.brands b where b.id = brand_id and b.user_id = auth.uid()));
