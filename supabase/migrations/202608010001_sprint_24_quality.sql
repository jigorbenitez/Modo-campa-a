create table if not exists public.territorial_quality_decisions (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  issue_id text not null,
  entity_external_id text not null,
  action text not null check (action in ('approved', 'rejected')),
  proposed_category text,
  decided_by uuid references auth.users(id),
  decided_at timestamptz not null default now(),
  unique (municipality_id, issue_id)
);
alter table public.territorial_quality_decisions enable row level security;
create policy territorial_quality_read on public.territorial_quality_decisions for select using (public.is_municipality_member(municipality_id));
create policy territorial_quality_write on public.territorial_quality_decisions for all using (public.has_permission(municipality_id, 'territory:write')) with check (public.has_permission(municipality_id, 'territory:write'));
create index if not exists territorial_quality_entity_idx on public.territorial_quality_decisions (municipality_id, entity_external_id, decided_at desc);
