create table if not exists public.territorial_identity_decisions (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  match_id text not null,
  left_external_id text not null,
  right_external_id text not null,
  score numeric(5,4) not null check (score between 0 and 1),
  decision text not null check (decision in ('merged', 'ignored', 'later')),
  evidence jsonb not null default '{}'::jsonb,
  decided_by uuid references auth.users(id),
  decided_at timestamptz not null default now(),
  unique (municipality_id, match_id)
);

create table if not exists public.territorial_identity_clusters (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  canonical_external_id text not null,
  external_ids text[] not null,
  alternate_names text[] not null default '{}',
  sources jsonb not null default '[]'::jsonb,
  history jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  unique (municipality_id, canonical_external_id)
);

alter table public.territorial_identity_decisions enable row level security;
alter table public.territorial_identity_clusters enable row level security;

create policy identity_decisions_read on public.territorial_identity_decisions
for select using (public.is_municipality_member(municipality_id));
create policy identity_decisions_write on public.territorial_identity_decisions
for all using (public.has_permission(municipality_id, 'territory:write'))
with check (public.has_permission(municipality_id, 'territory:write'));
create policy identity_clusters_read on public.territorial_identity_clusters
for select using (public.is_municipality_member(municipality_id));
create policy identity_clusters_write on public.territorial_identity_clusters
for all using (public.has_permission(municipality_id, 'territory:write'))
with check (public.has_permission(municipality_id, 'territory:write'));

create index if not exists identity_decisions_pending_idx
  on public.territorial_identity_decisions (municipality_id, decision, decided_at desc);
create index if not exists identity_clusters_external_ids_gin
  on public.territorial_identity_clusters using gin (external_ids);

