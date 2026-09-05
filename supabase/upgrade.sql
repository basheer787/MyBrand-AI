create table if not exists public.performance_feedback (
  id uuid primary key default gen_random_uuid(), brand_id uuid not null references public.brands(id) on delete cascade,
  platform text not null, campaign_name text, impressions integer, clicks integer, conversions integer,
  engagement_rate numeric, notes text, created_at timestamptz not null default now()
);
alter table public.performance_feedback enable row level security;
create policy "owners manage feedback" on public.performance_feedback for all using (exists (select 1 from public.brands b where b.id = brand_id and b.user_id = auth.uid())) with check (exists (select 1 from public.brands b where b.id = brand_id and b.user_id = auth.uid()));
