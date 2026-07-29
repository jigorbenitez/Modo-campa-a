-- Sprint 23: una única proyección territorial para todos los consumidores.

with duplicates as (
  select id,
    row_number() over (
      partition by municipality_id, category, fingerprint
      order by updated_at desc, created_at desc, id
    ) as position
  from public.territorial_public_features
  where status = 'active'
)
update public.territorial_public_features as feature
set status = 'removed', updated_at = now()
from duplicates
where feature.id = duplicates.id and duplicates.position > 1;

create unique index if not exists territorial_features_active_fingerprint_uidx
  on public.territorial_public_features (municipality_id, category, fingerprint)
  where status = 'active';

create index if not exists territorial_features_name_idx
  on public.territorial_public_features (municipality_id, lower(name))
  where status = 'active';

create or replace view public.territorial_registry
with (security_invoker = true)
as
with ranked as (
select
  feature.id,
  feature.municipality_id,
  feature.external_id,
  feature.category,
  feature.name,
  feature.geometry,
  feature.properties,
  feature.fingerprint,
  feature.status,
  feature.updated_at,
  source.external_id as source_dataset_id,
  source.publisher,
  source.source_url,
  source.license,
  source.confidence,
  row_number() over (
    partition by feature.municipality_id, source.publisher, feature.external_id
    order by
      case source.confidence when 'verified' then 1 when 'high' then 2 when 'medium' then 3 else 4 end,
      feature.updated_at desc,
      feature.id
  ) as position
from public.territorial_public_features as feature
join public.territorial_data_sources as source on source.id = feature.source_id
where feature.status = 'active'
)
select
  id, municipality_id, external_id, category, name, geometry, properties,
  fingerprint, status, updated_at, source_dataset_id, publisher, source_url,
  license, confidence
from ranked
where position = 1;

comment on view public.territorial_registry is
  'Proyección territorial canónica: Supabase -> Repository -> DDD -> UI.';
