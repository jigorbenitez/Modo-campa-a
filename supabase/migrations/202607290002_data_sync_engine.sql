-- Sprint 21: infraestructura persistente del motor territorial.
-- El dominio no depende de estas tablas; son una implementación de sus puertos.

create type public.territorial_sync_frequency as enum ('manual', 'daily', 'weekly', 'monthly');
create type public.territorial_sync_status as enum ('running', 'completed', 'partial', 'failed');

create table public.territorial_data_sources (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  external_id text not null,
  connector_id text not null,
  name text not null,
  category text not null,
  publisher text not null,
  source_url text not null,
  download_url text not null,
  license text not null,
  format text not null check (format in ('geojson', 'csv', 'shapefile', 'geopackage', 'kml', 'osmjson')),
  confidence text not null check (confidence in ('verified', 'high', 'medium', 'low')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (municipality_id, external_id)
);

create table public.territorial_dataset_versions (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  source_id uuid not null references public.territorial_data_sources(id) on delete cascade,
  version text not null,
  checksum text not null,
  published_at timestamptz,
  downloaded_at timestamptz not null default now(),
  record_count integer not null default 0 check (record_count >= 0),
  discarded_count integer not null default 0 check (discarded_count >= 0),
  metadata jsonb not null default '{}'::jsonb,
  unique (municipality_id, source_id, checksum)
);

create table public.territorial_public_features (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  source_id uuid not null references public.territorial_data_sources(id) on delete restrict,
  version_id uuid not null references public.territorial_dataset_versions(id) on delete restrict,
  external_id text not null,
  category text not null,
  name text not null,
  geometry jsonb,
  properties jsonb not null default '{}'::jsonb,
  fingerprint text not null,
  status text not null default 'active' check (status in ('active', 'removed', 'pending_review', 'rejected')),
  source_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (municipality_id, source_id, external_id)
);

create table public.territorial_sync_runs (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  status public.territorial_sync_status not null default 'running',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  triggered_by uuid references auth.users(id) on delete set null default auth.uid(),
  datasets_used integer not null default 0,
  imported_count integer not null default 0,
  discarded_count integer not null default 0,
  summary jsonb not null default '{}'::jsonb,
  errors jsonb not null default '[]'::jsonb
);

create table public.territorial_sync_schedules (
  municipality_id uuid primary key references public.municipalities(id) on delete cascade,
  frequency public.territorial_sync_frequency not null default 'manual',
  next_run_at timestamptz,
  last_run_at timestamptz,
  enabled boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null default auth.uid(),
  updated_at timestamptz not null default now()
);

create index territorial_features_map_idx on public.territorial_public_features (municipality_id, category, status);
create index territorial_versions_history_idx on public.territorial_dataset_versions (municipality_id, source_id, downloaded_at desc);
create index territorial_runs_history_idx on public.territorial_sync_runs (municipality_id, started_at desc);
create index territorial_schedules_due_idx on public.territorial_sync_schedules (next_run_at) where enabled;

alter table public.territorial_data_sources enable row level security;
alter table public.territorial_dataset_versions enable row level security;
alter table public.territorial_public_features enable row level security;
alter table public.territorial_sync_runs enable row level security;
alter table public.territorial_sync_schedules enable row level security;

create policy territorial_data_sources_select on public.territorial_data_sources for select to authenticated
  using (public.has_membership(municipality_id));
create policy territorial_data_sources_write on public.territorial_data_sources for all to authenticated
  using (public.has_permission(municipality_id, 'territory:write'))
  with check (public.has_permission(municipality_id, 'territory:write'));

create policy territorial_dataset_versions_select on public.territorial_dataset_versions for select to authenticated
  using (public.has_membership(municipality_id));
create policy territorial_dataset_versions_write on public.territorial_dataset_versions for all to authenticated
  using (public.has_permission(municipality_id, 'territory:write'))
  with check (public.has_permission(municipality_id, 'territory:write'));

create policy territorial_public_features_select on public.territorial_public_features for select to authenticated
  using (public.has_membership(municipality_id));
create policy territorial_public_features_write on public.territorial_public_features for all to authenticated
  using (public.has_permission(municipality_id, 'territory:write'))
  with check (public.has_permission(municipality_id, 'territory:write'));

create policy territorial_sync_runs_select on public.territorial_sync_runs for select to authenticated
  using (public.has_membership(municipality_id));
create policy territorial_sync_runs_write on public.territorial_sync_runs for all to authenticated
  using (public.has_permission(municipality_id, 'territory:write'))
  with check (public.has_permission(municipality_id, 'territory:write'));

create policy territorial_sync_schedules_select on public.territorial_sync_schedules for select to authenticated
  using (public.has_membership(municipality_id));
create policy territorial_sync_schedules_write on public.territorial_sync_schedules for all to authenticated
  using (public.has_permission(municipality_id, 'territory:write'))
  with check (public.has_permission(municipality_id, 'territory:write'));
