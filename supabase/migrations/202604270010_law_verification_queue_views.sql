-- Purpose: expose law citation verification priorities for korean-law-mcp passes.

create or replace view public.dashboard_law_verification_queue as
with normalized as (
  select
    lc.id,
    lc.source_id,
    lc.law_name_raw,
    lc.article_raw,
    lc.time_basis_date,
    lc.verification_status,
    case
      when nullif(trim(coalesce(lc.law_name_raw, '')), '') is null then '개인정보 보호법'
      when replace(lc.law_name_raw, ' ', '') in ('개인정보보호법', '舊개인정보보호법', '(구)개인정보보호법') then '개인정보 보호법'
      else trim(lc.law_name_raw)
    end as normalized_law_name,
    case
      when nullif(trim(coalesce(lc.law_name_raw, '')), '') is null then 'inferred_default_pipa'
      when replace(lc.law_name_raw, ' ', '') in ('개인정보보호법', '舊개인정보보호법', '(구)개인정보보호법') then 'normalized_alias'
      else 'source_text'
    end as law_name_resolution_method
  from public.law_citations lc
  where lc.source_type = 'decision_case'
    and nullif(trim(coalesce(lc.article_raw, '')), '') is not null
)
select
  normalized_law_name,
  article_raw,
  law_name_resolution_method,
  count(*)::bigint as citation_count,
  count(distinct source_id)::bigint as decision_case_count,
  min(time_basis_date) as first_basis_date,
  max(time_basis_date) as last_basis_date,
  count(distinct time_basis_date)::bigint as basis_date_count,
  count(*) filter (where verification_status = 'verified')::bigint as verified_count,
  count(*) filter (where verification_status <> 'verified')::bigint as unverified_count,
  jsonb_agg(distinct law_name_raw) filter (where nullif(trim(coalesce(law_name_raw, '')), '') is not null) as raw_law_names
from normalized
group by normalized_law_name, article_raw, law_name_resolution_method;

create or replace view public.dashboard_law_verification_coverage as
select
  verification_status,
  count(*)::bigint as citation_count,
  count(distinct source_id)::bigint as decision_case_count,
  count(distinct article_raw)::bigint as distinct_article_raw_count,
  min(time_basis_date) as first_basis_date,
  max(time_basis_date) as last_basis_date
from public.law_citations
where source_type = 'decision_case'
group by verification_status;
