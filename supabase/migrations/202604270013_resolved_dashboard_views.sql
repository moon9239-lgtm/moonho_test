-- Purpose: dashboard-ready tab 1 views after resolving candidate-grade states.
-- The UI should consume these views instead of the earlier candidate-labelled
-- exploratory views.

create or replace view public.dashboard_tab1_overview_kpis_resolved as
select
  (select count(*) from public.meetings)::bigint as meetings_total,
  (select count(*) from public.agenda_items)::bigint as agenda_items_total,
  (select count(*) from public.agenda_items where agenda_kind = 'deliberation_decision')::bigint as decision_agendas_total,
  (select count(*) from public.agenda_items where agenda_kind = 'report')::bigint as report_agendas_total,
  (select count(*) from public.agenda_items where agenda_kind = 'unspecified')::bigint as unspecified_agendas_total,
  (select count(*) from public.agenda_items where visibility = 'public')::bigint as public_agendas_total,
  (select count(*) from public.agenda_items where visibility = 'private')::bigint as private_agendas_total,
  (select count(*) from public.meetings where utterance_analysis_status = 'ready')::bigint as meetings_with_transcripts_ready,
  (select count(*) from public.meetings where utterance_analysis_status <> 'ready')::bigint as meetings_without_transcripts,
  (select count(*) from public.utterances)::bigint as utterances_total,
  (select count(*) from public.utterances where agenda_item_id is not null)::bigint as utterances_with_agenda,
  (select count(*) from public.decision_posts)::bigint as decision_posts_total,
  (select count(*) from public.decision_cases)::bigint as decision_cases_total,
  (select count(*) from public.agenda_decision_links)::bigint as agenda_decision_links_total,
  (select count(distinct agenda_item_id) from public.agenda_decision_links)::bigint as linked_agenda_items_total,
  (select count(distinct decision_post_id) from public.agenda_decision_links)::bigint as linked_decision_posts_total,
  (select count(*) from public.sanctions)::bigint as sanctions_total,
  (select count(*) from public.verified_penalty_outcomes)::bigint as monetary_penalty_outcomes_total,
  (select coalesce(sum(amount_krw), 0) from public.verified_penalty_outcomes)::bigint as monetary_penalty_outcomes_amount_total_krw,
  (select count(*) from public.law_citations where source_type = 'decision_case')::bigint as law_citations_total,
  (select count(*) from public.law_citations where source_type = 'decision_case' and verification_status = 'verified')::bigint as law_citations_mcp_verified_total,
  (select count(*) from public.law_citations where source_type = 'decision_case' and verification_status = 'pending')::bigint as law_citations_mcp_pending_total,
  (select count(*) from public.law_citations where source_type = 'decision_case' and verification_status = 'needs_review')::bigint as law_citations_needs_review_total,
  (select count(*) from public.commissioners)::bigint as commissioners_total,
  (select count(*) from public.utterance_tendency_tags)::bigint as commissioner_speech_tags_total,
  (select count(*) from public.source_documents)::bigint as source_documents_total,
  (select count(*) from public.document_chunks)::bigint as document_chunks_total,
  jsonb_build_object(
    'monetary_amount_source', 'verified_penalty_outcomes',
    'law_articles_status', 'verified_pending_and_review_separated',
    'document_chunks_missing', (select count(*) = 0 from public.document_chunks),
    'year_2026_is_partial', true
  ) as data_notes;

create or replace view public.dashboard_tab1_yearly_stats_resolved as
with years as (
  select distinct extract(year from meeting_date)::int as meeting_year
  from public.meetings
  union
  select distinct extract(year from decision_date)::int as meeting_year
  from public.decision_posts
  where decision_date is not null
),
meeting_stats as (
  select
    extract(year from meeting_date)::int as meeting_year,
    count(*)::bigint as meetings,
    count(*) filter (where utterance_analysis_status = 'ready')::bigint as meetings_with_transcripts_ready,
    count(*) filter (where utterance_analysis_status <> 'ready')::bigint as meetings_without_transcripts
  from public.meetings
  group by 1
),
agenda_stats as (
  select
    extract(year from m.meeting_date)::int as meeting_year,
    count(ai.id)::bigint as agenda_items,
    count(ai.id) filter (where ai.agenda_kind = 'deliberation_decision')::bigint as decision_agendas,
    count(ai.id) filter (where ai.agenda_kind = 'report')::bigint as report_agendas,
    count(ai.id) filter (where ai.agenda_kind = 'unspecified')::bigint as unspecified_agendas,
    count(ai.id) filter (where ai.visibility = 'public')::bigint as public_agendas,
    count(ai.id) filter (where ai.visibility = 'private')::bigint as private_agendas
  from public.meetings m
  left join public.agenda_items ai on ai.meeting_id = m.id
  group by 1
),
agenda_link_stats as (
  select
    extract(year from m.meeting_date)::int as meeting_year,
    count(*)::bigint as agenda_decision_links,
    count(distinct adl.agenda_item_id)::bigint as linked_agenda_items,
    count(distinct adl.decision_post_id)::bigint as linked_decision_posts
  from public.agenda_decision_links adl
  join public.agenda_items ai on ai.id = adl.agenda_item_id
  join public.meetings m on m.id = ai.meeting_id
  group by 1
),
decision_case_stats as (
  select
    extract(year from coalesce(dc.decision_date, dp.decision_date))::int as meeting_year,
    count(dc.id)::bigint as decision_cases
  from public.decision_cases dc
  join public.decision_posts dp on dp.id = dc.decision_post_id
  where coalesce(dc.decision_date, dp.decision_date) is not null
  group by 1
),
sanction_stats as (
  select
    extract(year from coalesce(dc.decision_date, dp.decision_date))::int as meeting_year,
    count(s.id)::bigint as sanctions
  from public.sanctions s
  join public.decision_cases dc on dc.id = s.case_id
  join public.decision_posts dp on dp.id = dc.decision_post_id
  where coalesce(dc.decision_date, dp.decision_date) is not null
  group by 1
),
penalty_outcome_stats as (
  select
    extract(year from dc.decision_date)::int as meeting_year,
    count(vpo.id)::bigint as monetary_penalty_outcomes,
    coalesce(sum(vpo.amount_krw), 0)::bigint as monetary_penalty_amount_total_krw,
    round(avg(vpo.amount_krw)::numeric, 0) as monetary_penalty_amount_avg_krw,
    max(vpo.amount_krw)::bigint as monetary_penalty_amount_max_krw
  from public.verified_penalty_outcomes vpo
  join public.decision_cases dc on dc.id = vpo.case_id
  where dc.decision_date is not null
  group by 1
),
law_stats as (
  select
    extract(year from coalesce(dc.decision_date, dp.decision_date))::int as meeting_year,
    count(lc.id)::bigint as law_citations,
    count(lc.id) filter (where lc.verification_status = 'verified')::bigint as law_citations_mcp_verified,
    count(lc.id) filter (where lc.verification_status = 'pending')::bigint as law_citations_mcp_pending,
    count(lc.id) filter (where lc.verification_status = 'needs_review')::bigint as law_citations_needs_review
  from public.law_citations lc
  join public.decision_cases dc on dc.id = lc.source_id
  join public.decision_posts dp on dp.id = dc.decision_post_id
  where lc.source_type = 'decision_case'
    and coalesce(dc.decision_date, dp.decision_date) is not null
  group by 1
),
utterance_stats as (
  select
    extract(year from u.utterance_date)::int as meeting_year,
    count(u.id)::bigint as utterances,
    count(u.id) filter (where u.agenda_item_id is not null)::bigint as utterances_with_agenda,
    count(distinct u.commissioner_id) filter (where u.commissioner_id is not null)::bigint as commissioners_with_utterances
  from public.utterances u
  where u.utterance_date is not null
  group by 1
),
utterance_case_stats as (
  select
    extract(year from u.utterance_date)::int as meeting_year,
    count(ucl.utterance_id)::bigint as utterance_case_links,
    count(distinct ucl.case_id)::bigint as decision_cases_with_utterances
  from public.utterance_case_links ucl
  join public.utterances u on u.id = ucl.utterance_id
  where u.utterance_date is not null
  group by 1
)
select
  y.meeting_year,
  coalesce(ms.meetings, 0) as meetings,
  coalesce(ms.meetings_with_transcripts_ready, 0) as meetings_with_transcripts_ready,
  coalesce(ms.meetings_without_transcripts, 0) as meetings_without_transcripts,
  coalesce(ag.agenda_items, 0) as agenda_items,
  coalesce(ag.decision_agendas, 0) as decision_agendas,
  coalesce(ag.report_agendas, 0) as report_agendas,
  coalesce(ag.unspecified_agendas, 0) as unspecified_agendas,
  coalesce(ag.public_agendas, 0) as public_agendas,
  coalesce(ag.private_agendas, 0) as private_agendas,
  coalesce(als.agenda_decision_links, 0) as agenda_decision_links,
  coalesce(als.linked_agenda_items, 0) as linked_agenda_items,
  coalesce(als.linked_decision_posts, 0) as linked_decision_posts,
  coalesce(dcs.decision_cases, 0) as decision_cases,
  coalesce(ss.sanctions, 0) as sanctions,
  coalesce(pos.monetary_penalty_outcomes, 0) as monetary_penalty_outcomes,
  coalesce(pos.monetary_penalty_amount_total_krw, 0) as monetary_penalty_amount_total_krw,
  coalesce(pos.monetary_penalty_amount_avg_krw, 0) as monetary_penalty_amount_avg_krw,
  coalesce(pos.monetary_penalty_amount_max_krw, 0) as monetary_penalty_amount_max_krw,
  coalesce(ls.law_citations, 0) as law_citations,
  coalesce(ls.law_citations_mcp_verified, 0) as law_citations_mcp_verified,
  coalesce(ls.law_citations_mcp_pending, 0) as law_citations_mcp_pending,
  coalesce(ls.law_citations_needs_review, 0) as law_citations_needs_review,
  coalesce(us.utterances, 0) as utterances,
  coalesce(us.utterances_with_agenda, 0) as utterances_with_agenda,
  coalesce(us.commissioners_with_utterances, 0) as commissioners_with_utterances,
  coalesce(ucs.utterance_case_links, 0) as utterance_case_links,
  coalesce(ucs.decision_cases_with_utterances, 0) as decision_cases_with_utterances,
  case when coalesce(ms.meetings, 0) > 0
    then round(coalesce(ag.agenda_items, 0)::numeric / nullif(ms.meetings, 0), 2)
    else 0::numeric
  end as avg_agendas_per_meeting,
  case when coalesce(ms.meetings, 0) > 0
    then round(coalesce(us.utterances, 0)::numeric / nullif(ms.meetings, 0), 2)
    else 0::numeric
  end as avg_utterances_per_meeting,
  case when coalesce(ag.agenda_items, 0) > 0
    then round(coalesce(ag.decision_agendas, 0)::numeric / nullif(ag.agenda_items, 0), 4)
    else 0::numeric
  end as decision_agenda_ratio,
  case when coalesce(ag.agenda_items, 0) > 0
    then round(coalesce(ag.report_agendas, 0)::numeric / nullif(ag.agenda_items, 0), 4)
    else 0::numeric
  end as report_agenda_ratio,
  case when coalesce(ag.agenda_items, 0) > 0
    then round(coalesce(ag.private_agendas, 0)::numeric / nullif(ag.agenda_items, 0), 4)
    else 0::numeric
  end as private_agenda_ratio
from years y
left join meeting_stats ms on ms.meeting_year = y.meeting_year
left join agenda_stats ag on ag.meeting_year = y.meeting_year
left join agenda_link_stats als on als.meeting_year = y.meeting_year
left join decision_case_stats dcs on dcs.meeting_year = y.meeting_year
left join sanction_stats ss on ss.meeting_year = y.meeting_year
left join penalty_outcome_stats pos on pos.meeting_year = y.meeting_year
left join law_stats ls on ls.meeting_year = y.meeting_year
left join utterance_stats us on us.meeting_year = y.meeting_year
left join utterance_case_stats ucs on ucs.meeting_year = y.meeting_year;

create or replace view public.dashboard_tab1_sanction_distribution_resolved as
with sanction_cases as (
  select
    s.id as sanction_id,
    s.sanction_kind,
    s.extraction_status,
    dc.id as case_id,
    coalesce(dc.decision_date, dp.decision_date) as decision_date,
    adl.agenda_item_id
  from public.sanctions s
  join public.decision_cases dc on dc.id = s.case_id
  join public.decision_posts dp on dp.id = dc.decision_post_id
  left join public.agenda_decision_links adl on adl.decision_post_id = dp.id
)
select
  sanction_kind,
  count(distinct sanction_id)::bigint as sanction_count,
  count(distinct case_id)::bigint as decision_case_count,
  count(distinct agenda_item_id)::bigint as linked_agenda_item_count,
  min(decision_date) as first_decision_date,
  max(decision_date) as last_decision_date,
  case
    when bool_and(extraction_status = 'verified_order_signal') then 'verified_order_signal'
    else 'mixed_review'
  end as data_status
from sanction_cases
group by sanction_kind;

create or replace view public.dashboard_tab1_law_article_distribution_resolved as
select
  coalesce(nullif(trim(article_raw), ''), '<unknown>') as article_raw,
  count(*)::bigint as citation_count,
  count(distinct source_id)::bigint as decision_case_count,
  count(*) filter (where nullif(trim(coalesce(law_name_raw, '')), '') is not null)::bigint as rows_with_law_name,
  coalesce(
    jsonb_agg(distinct law_name_raw) filter (where nullif(trim(coalesce(law_name_raw, '')), '') is not null),
    '[]'::jsonb
  ) as sample_law_names,
  count(*) filter (where verification_status = 'verified')::bigint as verified_rows,
  count(*) filter (where verification_status = 'pending')::bigint as pending_mcp_rows,
  count(*) filter (where verification_status = 'needs_review')::bigint as needs_review_rows,
  case
    when count(*) filter (where verification_status <> 'verified') = 0 then 'mcp_verified'
    when count(*) filter (where verification_status = 'verified') > 0 then 'partially_mcp_verified'
    when count(*) filter (where verification_status = 'needs_review') > 0 then 'needs_review'
    else 'pending_mcp'
  end as data_status
from public.law_citations
where source_type = 'decision_case'
group by 1;

create or replace view public.dashboard_tab1_penalty_outcome_summary as
select
  penalty_kind,
  count(*)::bigint as outcome_rows,
  count(*) filter (where amount_krw is not null)::bigint as rows_with_amount,
  count(distinct case_id)::bigint as decision_case_count,
  min(amount_krw) filter (where amount_krw is not null) as min_amount_krw,
  percentile_cont(0.5) within group (order by amount_krw)
    filter (where amount_krw is not null) as median_amount_krw,
  round((avg(amount_krw) filter (where amount_krw is not null))::numeric, 0) as avg_amount_krw,
  max(amount_krw) filter (where amount_krw is not null) as max_amount_krw,
  coalesce(sum(amount_krw), 0)::bigint as total_amount_krw,
  'verified_final_amount'::text as data_status,
  '결정문 주문과 처분 문맥에서 최종 과징금/과태료 금액으로 분리한 값입니다.'::text as notes
from public.verified_penalty_outcomes
group by penalty_kind;

create or replace view public.dashboard_tab1_issue_tag_distribution_resolved as
with tag_totals as (
  select
    tag_key,
    max(tag_label) as tag_label,
    max(tag_category) as tag_category,
    sum(utterance_count)::bigint as utterance_total,
    count(distinct commissioner_id)::bigint as commissioner_count,
    round(avg(average_confidence)::numeric, 4) as average_confidence
  from public.commissioner_tendency_stats
  group by tag_key
)
select
  tt.tag_key,
  tt.tag_label,
  tt.tag_category,
  tt.utterance_total,
  tt.commissioner_count,
  tt.average_confidence,
  coalesce(top_members.top_commissioners, '[]'::jsonb) as top_commissioners,
  'auto_aggregated_rule_based'::text as data_status
from tag_totals tt
left join lateral (
  select jsonb_agg(
    jsonb_build_object(
      'commissioner_id', ranked.commissioner_id,
      'name', ranked.name,
      'utterance_count', ranked.utterance_count,
      'average_confidence', ranked.average_confidence
    )
    order by ranked.utterance_count desc, ranked.name
  ) as top_commissioners
  from (
    select
      c.id as commissioner_id,
      c.name,
      cts.utterance_count,
      cts.average_confidence
    from public.commissioner_tendency_stats cts
    join public.commissioners c on c.id = cts.commissioner_id
    where cts.tag_key = tt.tag_key
    order by cts.utterance_count desc, c.name
    limit 5
  ) ranked
) top_members on true;

create or replace view public.dashboard_tab1_data_quality_resolved as
with counts as (
  select
    (select count(*) from public.meetings)::bigint as meetings_total,
    (select count(*) from public.meetings where utterance_analysis_status = 'ready')::bigint as transcript_ready_meetings,
    (select count(*) from public.utterances)::bigint as utterances_total,
    (select count(*) from public.utterances where agenda_item_id is not null)::bigint as utterances_with_agenda,
    (select count(*) from public.decision_posts)::bigint as decision_posts_total,
    (select count(distinct decision_post_id) from public.agenda_decision_links)::bigint as linked_decision_posts,
    (select count(*) from public.decision_cases)::bigint as decision_cases_total,
    (select count(distinct case_id) from public.utterance_case_links)::bigint as decision_cases_with_utterance_links,
    (select count(*) from public.law_citations where source_type = 'decision_case')::bigint as decision_case_law_citations,
    (select count(*) from public.law_citations where source_type = 'decision_case' and verification_status = 'verified')::bigint as verified_law_citations,
    (select count(*) from public.law_citations where source_type = 'decision_case' and verification_status = 'pending')::bigint as pending_law_citations,
    (select count(*) from public.law_citations where source_type = 'decision_case' and verification_status = 'needs_review')::bigint as law_citations_needs_review,
    (select count(*) from public.source_documents)::bigint as source_documents_total,
    (select count(*) from public.document_chunks)::bigint as document_chunks_total,
    (select count(*) from public.monetary_penalties)::bigint as penalty_rows_total,
    (select count(*) from public.monetary_penalties where extraction_status <> 'candidate')::bigint as resolved_penalty_rows,
    (select count(*) from public.verified_penalty_outcomes)::bigint as verified_penalty_outcomes_total
)
select
  'transcript_ready_meetings'::text as metric_key,
  '속기록 분석 가능 회의'::text as label,
  transcript_ready_meetings as value_count,
  meetings_total as total_count,
  round(transcript_ready_meetings::numeric / nullif(meetings_total, 0), 4) as ratio,
  case when transcript_ready_meetings = meetings_total then 'ready' else 'partial' end as status,
  '속기록이 없는 회차는 없는 상태 그대로 표시합니다.'::text as notes
from counts
union all
select
  'utterances_with_agenda',
  '안건 연결 발언',
  utterances_with_agenda,
  utterances_total,
  round(utterances_with_agenda::numeric / nullif(utterances_total, 0), 4),
  case when utterances_with_agenda = utterances_total then 'ready' else 'partial' end,
  '일부 발언은 개회, 폐회, 절차 발언 등이라 특정 안건에 붙지 않을 수 있습니다.'
from counts
union all
select
  'decision_posts_linked_to_agenda',
  '회의 안건과 연결된 결정문 게시글',
  linked_decision_posts,
  decision_posts_total,
  round(linked_decision_posts::numeric / nullif(decision_posts_total, 0), 4),
  case when linked_decision_posts = decision_posts_total then 'ready' else 'partial' end,
  '제목, 회차, 사건번호를 이용해 연결한 범위입니다.'
from counts
union all
select
  'decision_cases_with_utterance_links',
  '발언과 연결된 결정 사건',
  decision_cases_with_utterance_links,
  decision_cases_total,
  round(decision_cases_with_utterance_links::numeric / nullif(decision_cases_total, 0), 4),
  case when decision_cases_with_utterance_links = decision_cases_total then 'ready' else 'needs_work' end,
  '위원 질의와 결정문 사건을 직접 연결한 범위입니다. 향후 검색/RAG로 보강할 구간입니다.'
from counts
union all
select
  'law_citations_mcp_verified',
  '법령 MCP 검증 조항',
  verified_law_citations,
  decision_case_law_citations,
  round(verified_law_citations::numeric / nullif(decision_case_law_citations, 0), 4),
  case when verified_law_citations = decision_case_law_citations and decision_case_law_citations > 0 then 'ready' else 'needs_work' end,
  '시점별 조문 검증 완료, MCP 대기, 재검토 필요 항목을 분리했습니다.'
from counts
union all
select
  'law_citations_pending_mcp',
  '법령 MCP 대기 조항',
  pending_law_citations,
  decision_case_law_citations,
  round(pending_law_citations::numeric / nullif(decision_case_law_citations, 0), 4),
  case when pending_law_citations = 0 then 'ready' else 'needs_work' end,
  '대기 항목은 조문 원문 확인을 계속 진행해야 합니다.'
from counts
union all
select
  'document_chunks',
  '검색/RAG 문서 청크',
  document_chunks_total,
  source_documents_total,
  round(document_chunks_total::numeric / nullif(source_documents_total, 0), 4),
  case when document_chunks_total > 0 then 'partial' else 'needs_work' end,
  '통합검색과 신규 안건 도우미를 위해 청크/임베딩 적재를 계속 보강합니다.'
from counts
union all
select
  'penalty_rows_resolved',
  '금액 행 상태 정리',
  resolved_penalty_rows,
  penalty_rows_total,
  round(resolved_penalty_rows::numeric / nullif(penalty_rows_total, 0), 4),
  case when resolved_penalty_rows = penalty_rows_total and penalty_rows_total > 0 then 'ready' else 'needs_work' end,
  '최종액, 문맥상 숫자, 재검토 필요 금액을 구분했습니다.'
from counts
union all
select
  'verified_penalty_outcomes',
  '확정 처분 금액',
  verified_penalty_outcomes_total,
  verified_penalty_outcomes_total,
  1::numeric,
  case when verified_penalty_outcomes_total > 0 then 'ready' else 'needs_work' end,
  '대시보드 금액 통계는 이 확정 금액 테이블을 사용합니다.'
from counts;

create or replace view public.dashboard_tab1_topic_distribution as
with classified as (
  select
    ai.id,
    ai.meeting_id,
    ai.agenda_kind,
    ai.visibility,
    case
      when coalesce(ai.title, '') ~ '(법규 위반|위반행위|시정조치|과징금|과태료|처분)' then 'violation_sanction'
      when coalesce(ai.title, '') ~ '(시행령|시행규칙|고시|규정|지침|개정|제정|입법|법률)' then 'law_rulemaking'
      when coalesce(ai.title, '') ~ '(AI|인공지능|가명정보|데이터|영상정보|CCTV|마이데이터|사전적정성)' then 'ai_data'
      when coalesce(ai.title, '') ~ '(공공기관|공공부문|중앙행정기관|지방자치|교육청|공공)' then 'public_sector'
      when coalesce(ai.title, '') ~ '(정보주체|처리방침|동의|열람|삭제|정정|권리|고지)' then 'rights_policy'
      when coalesce(ai.title, '') ~ '(국외|국경|글로벌|해외|구글|Google|메타|Meta|페이스북|넷플릭스|애플)' then 'cross_border_platform'
      else 'other'
    end as topic_key
  from public.agenda_items ai
)
select
  topic_key,
  case topic_key
    when 'violation_sanction' then '위반·처분'
    when 'law_rulemaking' then '법령·규정 정비'
    when 'ai_data' then 'AI·데이터·영상'
    when 'public_sector' then '공공부문'
    when 'rights_policy' then '정보주체 권리·동의'
    when 'cross_border_platform' then '국외·플랫폼'
    else '기타'
  end as label,
  count(*)::bigint as agenda_count,
  count(distinct meeting_id)::bigint as meeting_count,
  count(*) filter (where agenda_kind = 'deliberation_decision')::bigint as decision_agenda_count,
  count(*) filter (where agenda_kind = 'report')::bigint as report_agenda_count,
  count(*) filter (where visibility = 'public')::bigint as public_agenda_count,
  count(*) filter (where visibility = 'private')::bigint as private_agenda_count,
  'rule_based_topic'::text as data_status
from classified
group by topic_key;

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
