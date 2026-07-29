-- Circuitos electorales como dimensión territorial complementaria.
-- La geometría se conserva como GeoJSON hasta habilitar PostGIS.

create table public.electoral_circuits (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  external_code text not null check (external_code ~ '^[0-9]{4}[A-Z]?$'),
  name text not null check (char_length(name) between 1 and 160),
  geometry jsonb not null,
  source text not null,
  source_url text not null,
  license text not null,
  source_updated_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (municipality_id, external_code)
);

create table public.entity_circuits (
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  circuit_id uuid not null references public.electoral_circuits(id) on delete cascade,
  entity_type text not null check (
    entity_type in (
      'activity',
      'person',
      'institution',
      'proposal',
      'commitment',
      'problem',
      'opportunity',
      'document'
    )
  ),
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  primary key (municipality_id, circuit_id, entity_type, entity_id)
);

create index electoral_circuits_municipality_idx
  on public.electoral_circuits (municipality_id, external_code);

create index entity_circuits_entity_idx
  on public.entity_circuits (municipality_id, entity_type, entity_id);

alter table public.electoral_circuits enable row level security;
alter table public.entity_circuits enable row level security;

create policy electoral_circuits_select on public.electoral_circuits
  for select to authenticated
  using (public.has_membership(municipality_id));

create policy electoral_circuits_write on public.electoral_circuits
  for all to authenticated
  using (public.has_permission(municipality_id, 'territory:write'))
  with check (public.has_permission(municipality_id, 'territory:write'));

create policy entity_circuits_select on public.entity_circuits
  for select to authenticated
  using (public.has_membership(municipality_id));

create policy entity_circuits_write on public.entity_circuits
  for all to authenticated
  using (public.has_permission(municipality_id, 'territory:write'))
  with check (public.has_permission(municipality_id, 'territory:write'));
