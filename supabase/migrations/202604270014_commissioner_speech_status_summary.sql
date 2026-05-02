-- Purpose: include commissioner speech aggregate/sample status resolution in the dashboard audit view.

create or replace view public.dashboard_tab1_status_resolution_summary as
select 'agenda_items'::text as table_name, extraction_status::text as status, count(*)::bigint as rows
from public.agenda_items
group by extraction_status
union all
select 'decision_cases', extraction_status, count(*)::bigint
from public.decision_cases
group by extraction_status
union all
select 'sanctions', extraction_status, count(*)::bigint
from public.sanctions
group by extraction_status
union all
select 'monetary_penalties', extraction_status, count(*)::bigint
from public.monetary_penalties
group by extraction_status
union all
select 'law_citations_extraction', extraction_status, count(*)::bigint
from public.law_citations
group by extraction_status
union all
select 'law_citations_verification', verification_status, count(*)::bigint
from public.law_citations
group by verification_status
union all
select 'commissioner_speech_aggregates', extraction_status, count(*)::bigint
from public.commissioner_speech_aggregates
group by extraction_status
union all
select 'commissioner_speech_samples', extraction_status, count(*)::bigint
from public.commissioner_speech_samples
group by extraction_status
union all
select 'utterance_tendency_tags', extraction_status, count(*)::bigint
from public.utterance_tendency_tags
group by extraction_status
union all
select 'commissioner_tendency_stats', extraction_status, count(*)::bigint
from public.commissioner_tendency_stats
group by extraction_status
union all
select 'verified_penalty_outcomes', verification_status, count(*)::bigint
from public.verified_penalty_outcomes
group by verification_status;
