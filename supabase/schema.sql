create extension if not exists vector;

create table public.brands (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, location text, business_type text, target_audience text, language text default 'English',
  questionnaire jsonb not null default '{}'::jsonb, brand_dna jsonb, embedding vector(768), created_at timestamptz not null default now()
);
create table public.assets (
  id uuid primary key default gen_random_uuid(), brand_id uuid not null references public.brands(id) on delete cascade,
  storage_path text not null, analysis jsonb, created_at timestamptz not null default now()
);
create table public.generations (
  id uuid primary key default gen_random_uuid(), brand_id uuid not null references public.brands(id) on delete cascade,
  type text not null check (type in ('brand_kit','calendar')), content jsonb not null, created_at timestamptz not null default now()
);
create table public.performance_feedback (
  id uuid primary key default gen_random_uuid(), brand_id uuid not null references public.brands(id) on delete cascade,
  platform text not null, campaign_name text, impressions integer, clicks integer, conversions integer,
  engagement_rate numeric, notes text, created_at timestamptz not null default now()
);
alter table public.brands enable row level security; alter table public.assets enable row level security; alter table public.generations enable row level security;
alter table public.performance_feedback enable row level security;
create policy "owners manage brands" on public.brands for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owners manage assets" on public.assets for all using (exists (select 1 from public.brands b where b.id = brand_id and b.user_id = auth.uid())) with check (exists (select 1 from public.brands b where b.id = brand_id and b.user_id = auth.uid()));
create policy "owners manage generations" on public.generations for all using (exists (select 1 from public.brands b where b.id = brand_id and b.user_id = auth.uid())) with check (exists (select 1 from public.brands b where b.id = brand_id and b.user_id = auth.uid()));
create policy "owners manage feedback" on public.performance_feedback for all using (exists (select 1 from public.brands b where b.id = brand_id and b.user_id = auth.uid())) with check (exists (select 1 from public.brands b where b.id = brand_id and b.user_id = auth.uid()));
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('brand-assets','brand-assets',false,6291456,array['image/jpeg','image/png','image/webp']) on conflict (id) do nothing;
create policy "users upload brand assets" on storage.objects for insert to authenticated with check (bucket_id = 'brand-assets' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users read brand assets" on storage.objects for select to authenticated using (bucket_id = 'brand-assets' and (storage.foldername(name))[1] = auth.uid()::text);
