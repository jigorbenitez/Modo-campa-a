create table if not exists public.territorial_enrichment_runs (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  started_at timestamptz not null,
  finished_at timestamptz not null,
  entities_reviewed integer not null default 0,
  entities_enriched integer not null default 0,
  applied_count integer not null default 0,
  conflict_count integer not null default 0,
  rejected_count integer not null default 0,
  sources jsonb not null default '[]'::jsonb,
  executed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.territorial_enrichment_candidates (
  id text not null,
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  entity_external_id text not null,
  field text not null,
  previous_value jsonb,
  proposed_value jsonb not null,
  status text not null check (status in ('applied', 'conflict', 'rejected')),
  source jsonb not null,
  reason text not null,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (municipality_id, id)
);

create table if not exists public.territorial_enrichment_history (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  entity_external_id text not null,
  field text not null,
  previous_value jsonb,
  new_value jsonb,
  action text not null,
  source jsonb not null,
  actor_id uuid references auth.users(id),
  actor_type text not null check (actor_type in ('user', 'process')),
  occurred_at timestamptz not null default now()
);

alter table public.territorial_enrichment_runs enable row level security;
alter table public.territorial_enrichment_candidates enable row level security;
alter table public.territorial_enrichment_history enable row level security;
create policy enrichment_runs_read on public.territorial_enrichment_runs for select using (public.is_municipality_member(municipality_id));
create policy enrichment_runs_write on public.territorial_enrichment_runs for all using (public.has_permission(municipality_id, 'territory:write')) with check (public.has_permission(municipality_id, 'territory:write'));
create policy enrichment_candidates_read on public.territorial_enrichment_candidates for select using (public.is_municipality_member(municipality_id));
create policy enrichment_candidates_write on public.territorial_enrichment_candidates for all using (public.has_permission(municipality_id, 'territory:write')) with check (public.has_permission(municipality_id, 'territory:write'));
create policy enrichment_history_read on public.territorial_enrichment_history for select using (public.is_municipality_member(municipality_id));
create policy enrichment_history_write on public.territorial_enrichment_history for insert with check (public.has_permission(municipality_id, 'territory:write'));
create index if not exists enrichment_entity_idx on public.territorial_enrichment_candidates (municipality_id, entity_external_id, status);
create index if not exists enrichment_history_entity_idx on public.territorial_enrichment_history (municipality_id, entity_external_id, occurred_at desc);
