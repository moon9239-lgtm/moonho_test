-- Purpose: dashboard-ready views for tab 1, the whole-committee statistics view.
-- These views intentionally expose candidate/unverified flags where extraction is
-- useful for exploration but not yet final legal or accounting-grade data.

create or replace view public.dashboard_tab1_overview_kpis as
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
  (select count(*) from public.monetary_penalties)::bigint as monetary_penalty_candidates_total,
  (select count(*) from public.law_citations where source_type = 'decision_case')::bigint as law_citation_candidates_total,
  (select count(*) from public.commissioners)::bigint as commissioners_total,
  (select count(*) from public.utterance_tendency_tags)::bigint as commissioner_speech_tags_total,
  (select count(*) from public.source_documents)::bigint as source_documents_total,
  (select count(*) from public.document_chunks)::bigint as document_chunks_total,
  jsonb_build_object(
    'amounts_are_candidates', true,
    'law_articles_unverified', true,
    'document_chunks_missing', (select count(*) = 0 from public.document_chunks),
    'year_2026_is_partial', true
  ) as data_notes;

create or replace view public.dashboard_tab1_yearly_stats as
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
penalty_stats as (
  select
    extract(year from coalesce(dc.decision_date, dp.decision_date))::int as meeting_year,
    count(mp.id)::bigint as monetary_penalty_candidates
  from public.monetary_penalties mp
  join public.decision_cases dc on dc.id = mp.case_id
  join public.decision_posts dp on dp.id = dc.decision_post_id
  where coalesce(dc.decision_date, dp.decision_date) is not null
  group by 1
),
law_stats as (
  select
    extract(year from coalesce(dc.decision_date, dp.decision_date))::int as meeting_year,
    count(lc.id)::bigint as law_citation_candidates
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
  coalesce(ps.monetary_penalty_candidates, 0) as monetary_penalty_candidates,
  coalesce(ls.law_citation_candidates, 0) as law_citation_candidates,
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
left join penalty_stats ps on ps.meeting_year = y.meeting_year
left join law_stats ls on ls.meeting_year = y.meeting_year
left join utterance_stats us on us.meeting_year = y.meeting_year
left join utterance_case_stats ucs on ucs.meeting_year = y.meeting_year;

create or replace view public.dashboard_tab1_agenda_composition_yearly as
with base as (
  select
    extract(year from m.meeting_date)::int as meeting_year,
    ai.agenda_kind,
    ai.visibility
  from public.agenda_items ai
  join public.meetings m on m.id = ai.meeting_id
),
labeled as (
  select
    meeting_year,
    'agenda_kind'::text as category_type,
    coalesce(agenda_kind, 'unknown') as category_key,
    case coalesce(agenda_kind, 'unknown')
      when 'deliberation_decision' then '의결'
      when 'report' then '보고'
      when 'unspecified' then '미분류'
      else coalesce(agenda_kind, 'unknown')
    end as label
  from base
  union all
  select
    meeting_year,
    'visibility'::text as category_type,
    coalesce(visibility, 'unknown') as category_key,
    case coalesce(visibility, 'unknown')
      when 'public' then '공개'
      when 'private' then '비공개'
      else coalesce(visibility, 'unknown')
    end as label
  from base
),
agg as (
  select meeting_year, category_type, category_key, label, count(*)::bigint as item_count
  from labeled
  group by 1, 2, 3, 4
),
totals as (
  select meeting_year, category_type, sum(item_count)::bigint as total_count
  from agg
  group by 1, 2
)
select
  a.meeting_year,
  a.category_type,
  a.category_key,
  a.label,
  a.item_count,
  t.total_count,
  round(a.item_count::numeric / nullif(t.total_count, 0), 4) as ratio
from agg a
join totals t
  on t.meeting_year = a.meeting_year
 and t.category_type = a.category_type;

create or replace view public.dashboard_tab1_sanction_distribution as
with sanction_cases as (
  select
    s.id as sanction_id,
    s.sanction_kind,
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
  'candidate'::text as data_status
from sanction_cases
group by sanction_kind;

create or replace view public.dashboard_tab1_law_article_distribution as
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
  'unverified_candidate'::text as data_status
from public.law_citations
where source_type = 'decision_case'
group by 1;

create or replace view public.dashboard_tab1_penalty_candidate_summary as
select
  penalty_kind,
  count(*)::bigint as candidate_rows,
  count(*) filter (where amount_krw is not null)::bigint as rows_with_amount,
  count(distinct case_id)::bigint as decision_case_count,
  min(amount_krw) filter (where amount_krw is not null) as min_amount_krw,
  percentile_cont(0.5) within group (order by amount_krw)
    filter (where amount_krw is not null) as median_amount_krw,
  round((avg(amount_krw) filter (where amount_krw is not null))::numeric, 0) as avg_amount_krw,
  max(amount_krw) filter (where amount_krw is not null) as max_amount_krw,
  'candidate_needs_role_classification'::text as data_status,
  '금액은 본문 숫자 후보 추출값입니다. 최종 과징금/과태료 확정액으로 쓰기 전 역할 분류와 원문 대조가 필요합니다.'::text as warning_text
from public.monetary_penalties
group by penalty_kind;

create or replace view public.dashboard_tab1_commissioner_activity as
select
  c.id as commissioner_id,
  c.name,
  c.role_current,
  c.status,
  c.background_axis,
  c.profile_path,
  coalesce(csa.total_utterances, 0)::bigint as total_utterances,
  coalesce(csa.meeting_count, 0)::bigint as meeting_count,
  coalesce(csa.agenda_utterance_count, 0)::bigint as agenda_utterance_count,
  coalesce(csa.case_utterance_count, 0)::bigint as case_utterance_count,
  coalesce(csa.agenda_count, 0)::bigint as agenda_count,
  coalesce(csa.case_count, 0)::bigint as case_count,
  csa.first_utterance_date,
  csa.last_utterance_date,
  csa.sample_md_path,
  coalesce(tags.top_tags, '[]'::jsonb) as top_tags,
  coalesce(csa.extraction_status, 'not_extracted') as extraction_status,
  csa.source_confidence
from public.commissioners c
left join public.commissioner_speech_aggregates csa
  on csa.commissioner_id = c.id
left join lateral (
  select jsonb_agg(
    jsonb_build_object(
      'tag_key', ranked.tag_key,
      'tag_label', ranked.tag_label,
      'tag_category', ranked.tag_category,
      'utterance_count', ranked.utterance_count,
      'average_confidence', ranked.average_confidence
    )
    order by ranked.utterance_count desc, ranked.tag_key
  ) as top_tags
  from (
    select
      cts.tag_key,
      cts.tag_label,
      cts.tag_category,
      cts.utterance_count,
      cts.average_confidence
    from public.commissioner_tendency_stats cts
    where cts.commissioner_id = c.id
    order by cts.utterance_count desc, cts.tag_key
    limit 5
  ) ranked
) tags on true;

create or replace view public.dashboard_tab1_issue_tag_distribution as
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
  'candidate'::text as data_status
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

create or replace view public.dashboard_tab1_data_quality as
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
    (select count(*) from public.source_documents)::bigint as source_documents_total,
    (select count(*) from public.document_chunks)::bigint as document_chunks_total,
    (select count(*) from public.monetary_penalties)::bigint as penalty_rows_total,
    (select count(*) from public.monetary_penalties where extraction_status = 'verified')::bigint as verified_penalty_rows
)
select
  'transcript_ready_meetings'::text as metric_key,
  '속기록 분석 가능 회의'::text as label,
  transcript_ready_meetings as value_count,
  meetings_total as total_count,
  round(transcript_ready_meetings::numeric / nullif(meetings_total, 0), 4) as ratio,
  case when transcript_ready_meetings = meetings_total then 'ready' else 'partial' end as status,
  '속기록이 없는 회차는 없는 상태 그대로 표시해야 합니다.'::text as notes
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
  '제목, 회차, 사건번호 기반 후보 연결입니다.'
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
  'law_citations_verified',
  '법령 MCP 검증 조항',
  verified_law_citations,
  decision_case_law_citations,
  round(verified_law_citations::numeric / nullif(decision_case_law_citations, 0), 4),
  case when verified_law_citations = decision_case_law_citations and decision_case_law_citations > 0 then 'ready' else 'needs_work' end,
  '현재 조항은 원문 후보 추출값입니다. korean-law-mcp로 시점별 조문 검증이 필요합니다.'
from counts
union all
select
  'document_chunks',
  '검색/RAG 문서 청크',
  document_chunks_total,
  source_documents_total,
  round(document_chunks_total::numeric / nullif(source_documents_total, 0), 4),
  case when document_chunks_total > 0 then 'partial' else 'needs_work' end,
  '통합검색과 신규 안건 도우미를 위해 다음 단계에서 청크/임베딩 적재가 필요합니다.'
from counts
union all
select
  'verified_penalty_rows',
  '검증 완료 금액 행',
  verified_penalty_rows,
  penalty_rows_total,
  round(verified_penalty_rows::numeric / nullif(penalty_rows_total, 0), 4),
  case when verified_penalty_rows = penalty_rows_total and penalty_rows_total > 0 then 'ready' else 'needs_work' end,
  '금액 후보는 본문 숫자 추출값이라 최종액, 기준금액, 감경액 분리가 필요합니다.'
from counts;

create or replace view public.dashboard_tab1_topic_candidate_distribution as
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
  'rule_based_candidate'::text as data_status
from classified
group by topic_key;
