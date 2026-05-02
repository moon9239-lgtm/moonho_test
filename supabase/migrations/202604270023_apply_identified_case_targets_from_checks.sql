-- Purpose: apply verified respondent candidates recorded by case_target_identification_checks.

insert into public.entities (
  name,
  normalized_name,
  entity_kind,
  metadata
)
select distinct
  c.candidate_name,
  c.candidate_name,
  'unknown',
  jsonb_build_object(
    'source', 'public.case_target_identification_checks',
    'extraction_status', 'verified_by_rule',
    'updated_on', '2026-04-27'
  )
from public.case_target_identification_checks c
where c.status = 'identified'
  and c.candidate_name is not null
  and c.candidate_name <> ''
on conflict (name) do nothing;

with matched_cases as (
  select
    dc.id as case_id,
    e.id as entity_id,
    c.candidate_name,
    c.method,
    c.confidence,
    c.source_path,
    c.evidence_text
  from public.case_target_identification_checks c
  join public.decision_cases dc on dc.id = c.case_id
  join public.entities e on e.name = c.candidate_name
  where c.status = 'identified'
)
update public.decision_cases dc
set main_entity_id = mc.entity_id,
    updated_at = now(),
    metadata = dc.metadata || jsonb_build_object(
      'target_identification_status', 'identified',
      'target_identification_method', mc.method,
      'target_identification_confidence', mc.confidence,
      'target_identification_source_path', mc.source_path,
      'target_identification_evidence', mc.evidence_text,
      'target_identified_on', '2026-04-27'
    )
from matched_cases mc
where dc.id = mc.case_id;

with matched_cases as (
  select
    dc.id as case_id,
    e.id as entity_id,
    c.candidate_name
  from public.case_target_identification_checks c
  join public.decision_cases dc on dc.id = c.case_id
  join public.entities e on e.name = c.candidate_name
  where c.status = 'identified'
)
insert into public.case_entities (case_id, entity_id, role, entity_name_in_source)
select case_id, entity_id, 'respondent', candidate_name
from matched_cases
on conflict (case_id, entity_id, role) do update
set entity_name_in_source = excluded.entity_name_in_source;
