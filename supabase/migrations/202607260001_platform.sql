-- Modo Campaña — Sprint 8
-- Esquema inicial multi-municipio, autenticación, permisos, auditoría y RLS.

create extension if not exists pgcrypto;

create type public.app_role as enum (
  'administrator',
  'coordinator',
  'territorial_manager',
  'institutional_manager',
  'volunteer',
  'consultant',
  'guest',
  'read_only'
);

create type public.membership_status as enum (
  'invited',
  'active',
  'suspended',
  'disabled'
);

create table public.municipalities (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  province text,
  country_code char(2) not null default 'AR',
  timezone text not null default 'America/Argentina/Buenos_Aires',
  locale text not null default 'es-AR',
  settings jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version > 0)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  avatar_url text,
  preferences jsonb not null default jsonb_build_object(
    'theme', 'system',
    'locale', 'es-AR',
    'timezone', 'America/Argentina/Buenos_Aires',
    'emailNotifications', true,
    'weeklyDigest', true,
    'reducedMotion', false
  ),
  last_access_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version > 0)
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  role public.app_role not null default 'guest',
  status public.membership_status not null default 'invited',
  joined_at timestamptz not null default now(),
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version > 0),
  unique (user_id, municipality_id)
);

create table public.role_permissions (
  role public.app_role not null,
  permission text not null check (permission ~ '^[a-z_]+:[a-z_]+$'),
  primary key (role, permission)
);

insert into public.role_permissions (role, permission) values
  ('administrator', 'municipality:manage'),
  ('administrator', 'users:read'),
  ('administrator', 'users:manage'),
  ('administrator', 'activities:read'),
  ('administrator', 'activities:write'),
  ('administrator', 'territory:read'),
  ('administrator', 'territory:write'),
  ('administrator', 'institutions:read'),
  ('administrator', 'institutions:write'),
  ('administrator', 'documents:read'),
  ('administrator', 'documents:write'),
  ('administrator', 'proposals:read'),
  ('administrator', 'proposals:write'),
  ('administrator', 'commitments:read'),
  ('administrator', 'commitments:write'),
  ('administrator', 'audit:read'),
  ('coordinator', 'users:read'),
  ('coordinator', 'activities:read'),
  ('coordinator', 'activities:write'),
  ('coordinator', 'territory:read'),
  ('coordinator', 'territory:write'),
  ('coordinator', 'institutions:read'),
  ('coordinator', 'institutions:write'),
  ('coordinator', 'documents:read'),
  ('coordinator', 'documents:write'),
  ('coordinator', 'proposals:read'),
  ('coordinator', 'proposals:write'),
  ('coordinator', 'commitments:read'),
  ('coordinator', 'commitments:write'),
  ('coordinator', 'audit:read'),
  ('territorial_manager', 'activities:read'),
  ('territorial_manager', 'activities:write'),
  ('territorial_manager', 'territory:read'),
  ('territorial_manager', 'territory:write'),
  ('territorial_manager', 'institutions:read'),
  ('territorial_manager', 'documents:read'),
  ('territorial_manager', 'proposals:read'),
  ('territorial_manager', 'commitments:read'),
  ('territorial_manager', 'commitments:write'),
  ('institutional_manager', 'activities:read'),
  ('institutional_manager', 'activities:write'),
  ('institutional_manager', 'territory:read'),
  ('institutional_manager', 'institutions:read'),
  ('institutional_manager', 'institutions:write'),
  ('institutional_manager', 'documents:read'),
  ('institutional_manager', 'documents:write'),
  ('institutional_manager', 'proposals:read'),
  ('institutional_manager', 'commitments:read'),
  ('institutional_manager', 'commitments:write'),
  ('volunteer', 'activities:read'),
  ('volunteer', 'activities:write'),
  ('volunteer', 'territory:read'),
  ('consultant', 'activities:read'),
  ('consultant', 'territory:read'),
  ('consultant', 'institutions:read'),
  ('consultant', 'documents:read'),
  ('consultant', 'documents:write'),
  ('consultant', 'proposals:read'),
  ('consultant', 'proposals:write'),
  ('consultant', 'commitments:read'),
  ('guest', 'activities:read'),
  ('guest', 'territory:read'),
  ('read_only', 'activities:read'),
  ('read_only', 'territory:read'),
  ('read_only', 'institutions:read'),
  ('read_only', 'documents:read'),
  ('read_only', 'proposals:read'),
  ('read_only', 'commitments:read');

-- Agregados persistidos progresivamente. `data` conserva el agregado tipado;
-- las columnas principales permiten índices, filtros e integridad.

create table public.neighborhoods (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  description text,
  status text not null default 'active',
  data jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version > 0),
  deleted_at timestamptz,
  unique (municipality_id, name)
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 240),
  activity_type text not null default 'other',
  status text not null default 'draft',
  activity_date date not null default current_date,
  starts_at time,
  ends_at time,
  data jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version > 0),
  deleted_at timestamptz,
  check (ends_at is null or starts_at is null or ends_at >= starts_at)
);

create table public.problems (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 240),
  neighborhood_id uuid references public.neighborhoods(id) on delete set null,
  category text not null default 'unclassified',
  severity text not null default 'medium',
  status text not null default 'reported',
  data jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version > 0),
  deleted_at timestamptz
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 240),
  source_activity_id uuid references public.activities(id) on delete set null,
  status text not null default 'detected',
  priority text not null default 'medium',
  data jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version > 0),
  deleted_at timestamptz
);

create table public.commitments (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 240),
  origin_activity_id uuid references public.activities(id) on delete set null,
  assigned_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'open',
  priority text not null default 'medium',
  due_date date,
  data jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version > 0),
  deleted_at timestamptz
);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 240),
  status text not null default 'idea',
  priority text not null default 'medium',
  data jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version > 0),
  deleted_at timestamptz
);

create table public.institutions (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 240),
  institution_type text not null default 'other',
  neighborhood_id uuid references public.neighborhoods(id) on delete set null,
  status text not null default 'active',
  data jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version > 0),
  deleted_at timestamptz,
  unique (municipality_id, name)
);

create table public.persons (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 200),
  role text not null default 'other',
  status text not null default 'active',
  data jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version > 0),
  deleted_at timestamptz
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 300),
  document_type text not null default 'other',
  status text not null default 'draft',
  issue_date date,
  storage_path text,
  checksum text,
  data jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version > 0),
  deleted_at timestamptz
);

create table public.activity_neighborhoods (
  activity_id uuid not null references public.activities(id) on delete cascade,
  neighborhood_id uuid not null references public.neighborhoods(id) on delete cascade,
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  primary key (activity_id, neighborhood_id)
);

create table public.entity_relationships (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  source_type text not null,
  source_id uuid not null,
  target_type text not null,
  target_id uuid not null,
  relationship_type text not null,
  evidence jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  unique (
    municipality_id,
    source_type,
    source_id,
    target_type,
    target_id,
    relationship_type
  ),
  check (source_id <> target_id or source_type <> target_type)
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  municipality_id uuid not null references public.municipalities(id) on delete restrict,
  user_id uuid references auth.users(id) on delete set null,
  occurred_at timestamptz not null default now(),
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE', 'RESTORE')),
  entity_table text not null,
  entity_id uuid not null,
  old_value jsonb,
  new_value jsonb,
  request_id text,
  ip_hash text
);

-- Índices de tenant y de consulta frecuente.
create index memberships_municipality_idx on public.memberships (municipality_id, status);
create index memberships_user_idx on public.memberships (user_id, status);
create index activities_tenant_date_idx on public.activities (municipality_id, activity_date desc) where deleted_at is null;
create index activities_tenant_status_idx on public.activities (municipality_id, status) where deleted_at is null;
create index neighborhoods_tenant_idx on public.neighborhoods (municipality_id) where deleted_at is null;
create index problems_tenant_status_idx on public.problems (municipality_id, status, severity) where deleted_at is null;
create index problems_neighborhood_idx on public.problems (neighborhood_id) where deleted_at is null;
create index opportunities_tenant_status_idx on public.opportunities (municipality_id, status) where deleted_at is null;
create index commitments_tenant_due_idx on public.commitments (municipality_id, status, due_date) where deleted_at is null;
create index proposals_tenant_status_idx on public.proposals (municipality_id, status) where deleted_at is null;
create index institutions_tenant_type_idx on public.institutions (municipality_id, institution_type) where deleted_at is null;
create index persons_tenant_role_idx on public.persons (municipality_id, role) where deleted_at is null;
create index documents_tenant_type_idx on public.documents (municipality_id, document_type, issue_date desc) where deleted_at is null;
create index relationships_source_idx on public.entity_relationships (municipality_id, source_type, source_id);
create index relationships_target_idx on public.entity_relationships (municipality_id, target_type, target_id);
create index audit_logs_entity_idx on public.audit_logs (municipality_id, entity_table, entity_id, occurred_at desc);
create index audit_logs_user_idx on public.audit_logs (municipality_id, user_id, occurred_at desc);

-- Funciones de autorización. SECURITY DEFINER evita recursión de RLS.
create or replace function public.has_membership(target_municipality uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    where m.user_id = auth.uid()
      and m.municipality_id = target_municipality
      and m.status = 'active'
  );
$$;

create or replace function public.has_permission(
  target_municipality uuid,
  requested_permission text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    join public.role_permissions rp on rp.role = m.role
    where m.user_id = auth.uid()
      and m.municipality_id = target_municipality
      and m.status = 'active'
      and rp.permission = requested_permission
  );
$$;

grant execute on function public.has_membership(uuid) to authenticated;
grant execute on function public.has_permission(uuid, text) to authenticated;

-- Perfil y municipio inicial para el registro por email.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_municipality_id uuid;
  requested_name text;
  requested_slug text;
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  );

  requested_name := nullif(trim(new.raw_user_meta_data ->> 'municipality_name'), '');
  if requested_name is not null then
    requested_slug := lower(regexp_replace(requested_name, '[^a-zA-Z0-9]+', '-', 'g'));
    requested_slug := trim(both '-' from requested_slug) || '-' || substr(new.id::text, 1, 8);

    insert into public.municipalities (name, slug)
    values (requested_name, requested_slug)
    returning id into new_municipality_id;

    insert into public.memberships (
      user_id,
      municipality_id,
      role,
      status
    )
    values (
      new.id,
      new_municipality_id,
      'administrator',
      'active'
    );
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

create or replace function public.bootstrap_municipality(municipality_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  municipality_id uuid;
  municipality_slug text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select m.municipality_id into municipality_id
  from public.memberships m
  where m.user_id = auth.uid()
    and m.status = 'active'
  order by m.joined_at
  limit 1;

  if municipality_id is not null then
    return municipality_id;
  end if;

  municipality_slug := lower(regexp_replace(trim(municipality_name), '[^a-zA-Z0-9]+', '-', 'g'));
  municipality_slug := trim(both '-' from municipality_slug) || '-' || substr(auth.uid()::text, 1, 8);

  insert into public.municipalities (name, slug)
  values (trim(municipality_name), municipality_slug)
  returning id into municipality_id;

  insert into public.memberships (user_id, municipality_id, role, status)
  values (auth.uid(), municipality_id, 'administrator', 'active');

  return municipality_id;
end;
$$;

grant execute on function public.bootstrap_municipality(text) to authenticated;

-- Actualización y auditoría.
create or replace function public.touch_record()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  new.version := old.version + 1;
  return new;
end;
$$;

create or replace function public.capture_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_municipality uuid;
  target_id uuid;
begin
  target_municipality := coalesce(new.municipality_id, old.municipality_id);
  target_id := coalesce(new.id, old.id);

  insert into public.audit_logs (
    municipality_id,
    user_id,
    action,
    entity_table,
    entity_id,
    old_value,
    new_value,
    request_id
  )
  values (
    target_municipality,
    auth.uid(),
    tg_op,
    tg_table_name,
    target_id,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end,
    current_setting('request.headers', true)::jsonb ->> 'x-request-id'
  );

  return coalesce(new, old);
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'neighborhoods',
    'activities',
    'problems',
    'opportunities',
    'commitments',
    'proposals',
    'institutions',
    'persons',
    'documents'
  ]
  loop
    execute format(
      'create trigger %I_touch before update on public.%I for each row execute procedure public.touch_record()',
      table_name,
      table_name
    );
    execute format(
      'create trigger %I_audit after insert or update or delete on public.%I for each row execute procedure public.capture_audit()',
      table_name,
      table_name
    );
  end loop;
end;
$$;

create trigger memberships_touch
  before update on public.memberships
  for each row execute procedure public.touch_record();

create trigger profiles_touch
  before update on public.profiles
  for each row execute procedure public.touch_record();

-- Row Level Security.
alter table public.municipalities enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.role_permissions enable row level security;
alter table public.activity_neighborhoods enable row level security;
alter table public.entity_relationships enable row level security;
alter table public.audit_logs enable row level security;

create policy municipalities_select on public.municipalities
  for select to authenticated
  using (public.has_membership(id));

create policy municipalities_update on public.municipalities
  for update to authenticated
  using (public.has_permission(id, 'municipality:manage'))
  with check (public.has_permission(id, 'municipality:manage'));

create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1
      from public.memberships mine
      join public.memberships theirs
        on theirs.municipality_id = mine.municipality_id
      where mine.user_id = auth.uid()
        and theirs.user_id = profiles.id
        and mine.status = 'active'
        and theirs.status = 'active'
        and public.has_permission(mine.municipality_id, 'users:read')
    )
  );

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy memberships_select on public.memberships
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.has_permission(municipality_id, 'users:read')
  );

create policy memberships_insert on public.memberships
  for insert to authenticated
  with check (public.has_permission(municipality_id, 'users:manage'));

create policy memberships_update on public.memberships
  for update to authenticated
  using (public.has_permission(municipality_id, 'users:manage'))
  with check (public.has_permission(municipality_id, 'users:manage'));

create policy memberships_delete on public.memberships
  for delete to authenticated
  using (public.has_permission(municipality_id, 'users:manage'));

create policy role_permissions_select on public.role_permissions
  for select to authenticated
  using (true);

create policy activity_neighborhoods_select on public.activity_neighborhoods
  for select to authenticated
  using (public.has_membership(municipality_id));

create policy activity_neighborhoods_write on public.activity_neighborhoods
  for all to authenticated
  using (public.has_permission(municipality_id, 'activities:write'))
  with check (public.has_permission(municipality_id, 'activities:write'));

create policy relationships_select on public.entity_relationships
  for select to authenticated
  using (public.has_membership(municipality_id));

create policy relationships_write on public.entity_relationships
  for all to authenticated
  using (public.has_permission(municipality_id, 'activities:write'))
  with check (public.has_permission(municipality_id, 'activities:write'));

create policy audit_logs_select on public.audit_logs
  for select to authenticated
  using (public.has_permission(municipality_id, 'audit:read'));

do $$
declare
  item record;
begin
  for item in
    select *
    from (values
      ('neighborhoods', 'territory:read', 'territory:write'),
      ('activities', 'activities:read', 'activities:write'),
      ('problems', 'territory:read', 'territory:write'),
      ('opportunities', 'territory:read', 'territory:write'),
      ('commitments', 'commitments:read', 'commitments:write'),
      ('proposals', 'proposals:read', 'proposals:write'),
      ('institutions', 'institutions:read', 'institutions:write'),
      ('persons', 'institutions:read', 'institutions:write'),
      ('documents', 'documents:read', 'documents:write')
    ) as policies(table_name, read_permission, write_permission)
  loop
    execute format('alter table public.%I enable row level security', item.table_name);
    execute format(
      'create policy %I_select on public.%I for select to authenticated using (deleted_at is null and public.has_permission(municipality_id, %L))',
      item.table_name,
      item.table_name,
      item.read_permission
    );
    execute format(
      'create policy %I_insert on public.%I for insert to authenticated with check (public.has_permission(municipality_id, %L))',
      item.table_name,
      item.table_name,
      item.write_permission
    );
    execute format(
      'create policy %I_update on public.%I for update to authenticated using (public.has_permission(municipality_id, %L)) with check (public.has_permission(municipality_id, %L))',
      item.table_name,
      item.table_name,
      item.write_permission,
      item.write_permission
    );
    execute format(
      'create policy %I_delete on public.%I for delete to authenticated using (public.has_permission(municipality_id, %L))',
      item.table_name,
      item.table_name,
      item.write_permission
    );
  end loop;
end;
$$;

-- Vista de perfil por membresía. security_invoker conserva RLS.
create view public.user_profiles_view
with (security_invoker = true)
as
select
  p.id,
  m.municipality_id,
  p.first_name,
  p.last_name,
  u.email,
  m.role,
  m.status,
  m.joined_at,
  p.last_access_at,
  p.avatar_url,
  p.preferences,
  p.created_at,
  p.updated_at,
  p.version
from public.profiles p
join auth.users u on u.id = p.id
join public.memberships m on m.user_id = p.id;

grant select on public.user_profiles_view to authenticated;
