-- Purpose: identify the respondent for the 2025-08-27 SK Telecom decision case.

with upsert_entity as (
  insert into public.entities (
    name,
    normalized_name,
    entity_kind,
    sector,
    is_public_sector,
    identifiers,
    metadata
  )
  values (
    '에스케이텔레콤 주식회사',
    'SK텔레콤',
    'company',
    '통신',
    false,
    jsonb_build_object('aliases', jsonb_build_array('SK텔레콤', '에스케이 텔레콤(주)', 'SK Telecom')),
    jsonb_build_object(
      'verified_from', 'official_decision_raw_md',
      'source_path', 'pipc_knowledge_base/99_raw/decisions/2025/2025-08-27_2025-0687_CYLFILE_000000018756_1_1_hwp.md',
      'source_quote', '피 심 인 에스케이텔레콤 주식회사',
      'verified_case_no', '2025조이0056',
      'verified_on', '2026-04-27'
    )
  )
  on conflict (name) do update
  set normalized_name = excluded.normalized_name,
      entity_kind = excluded.entity_kind,
      sector = excluded.sector,
      is_public_sector = excluded.is_public_sector,
      identifiers = public.entities.identifiers || excluded.identifiers,
      metadata = public.entities.metadata || excluded.metadata,
      updated_at = now()
  returning id
),
target_case as (
  select dc.id as case_id, ue.id as entity_id
  from public.decision_cases dc
  cross join upsert_entity ue
  where dc.case_no = '2025조이0056'
    and dc.decision_date = date '2025-08-27'
)
update public.decision_cases dc
set main_entity_id = tc.entity_id,
    updated_at = now(),
    metadata = dc.metadata || jsonb_build_object(
      'target_verification_status', 'verified',
      'target_verified_from', 'official_decision_raw_md',
      'target_verified_on', '2026-04-27'
    )
from target_case tc
where dc.id = tc.case_id;

with target_case as (
  select dc.id as case_id, e.id as entity_id
  from public.decision_cases dc
  join public.entities e on e.name = '에스케이텔레콤 주식회사'
  where dc.case_no = '2025조이0056'
    and dc.decision_date = date '2025-08-27'
)
insert into public.case_entities (case_id, entity_id, role, entity_name_in_source)
select case_id, entity_id, 'respondent', '에스케이텔레콤 주식회사'
from target_case
on conflict (case_id, entity_id, role) do update
set entity_name_in_source = excluded.entity_name_in_source;
