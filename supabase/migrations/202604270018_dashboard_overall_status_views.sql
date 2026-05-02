-- Purpose: rebuild tab 1 around the first questions people ask about PIPC plenary meetings:
-- money, targets, legal bases, meeting timing, and the current second-term committee.

create or replace view public.dashboard_tab1_case_money_base as
with penalty_by_case as (
  select
    vpo.case_id,
    count(*)::bigint as penalty_rows,
    coalesce(sum(vpo.amount_krw), 0)::bigint as amount_total_krw,
    coalesce(sum(vpo.amount_krw) filter (where vpo.penalty_kind = '과징금'), 0)::bigint as surcharge_total_krw,
    coalesce(sum(vpo.amount_krw) filter (where vpo.penalty_kind = '과태료'), 0)::bigint as fine_total_krw,
    jsonb_agg(
      jsonb_build_object(
        'penalty_kind', vpo.penalty_kind,
        'amount_krw', vpo.amount_krw,
        'amount_text', vpo.amount_text
      )
      order by vpo.amount_krw desc, vpo.penalty_kind
    ) as penalty_breakdown
  from public.verified_penalty_outcomes vpo
  group by vpo.case_id
),
penalty_source as (
  select
    vpo.case_id,
    string_agg(left(coalesce(vpo.source_text, ''), 1600), ' || ' order by vpo.amount_krw desc) as source_text
  from public.verified_penalty_outcomes vpo
  group by vpo.case_id
),
file_candidates as (
  select
    df.decision_case_id as case_id,
    (array_agg(
      df.attachment_name
      order by
        case
          when df.attachment_name ~ '(구글|넷플릭스|페이스북|카카오|네이버|엔에이치엔|커머스|공단|공사|구청|시청|군청|학교|레저플러스|트리플콤마|주식회사|㈜)' then 0
          when df.attachment_name ~ '호[_ -]+[^()_.]{2,}' then 1
          else 2
        end,
        length(df.attachment_name) desc,
        df.attachment_name
    ))[1] as attachment_name,
    jsonb_agg(distinct df.attachment_name order by df.attachment_name) as attachment_names
  from public.decision_files df
  where df.decision_case_id is not null
    and df.attachment_name is not null
  group by df.decision_case_id
),
meeting_links as (
  select
    adl.decision_post_id,
    min(m.meeting_date) as meeting_date,
    (array_agg(m.title order by m.meeting_date, m.meeting_number nulls last))[1] as meeting_title,
    (array_agg(m.meeting_number order by m.meeting_date, m.meeting_number nulls last))[1] as meeting_number,
    count(distinct m.id)::bigint as linked_meeting_count
  from public.agenda_decision_links adl
  join public.agenda_items ai on ai.id = adl.agenda_item_id
  join public.meetings m on m.id = ai.meeting_id
  group by adl.decision_post_id
),
raw_cases as (
  select
    dc.id as case_id,
    dc.decision_post_id,
    dc.case_no,
    dc.title as case_title,
    dc.decision_date,
    extract(year from dc.decision_date)::int as decision_year,
    extract(month from dc.decision_date)::int as decision_month,
    to_char(dc.decision_date, 'YYYY-MM') as decision_month_key,
    dp.title as decision_post_title,
    dp.detail_url as decision_detail_url,
    e.name as entity_name,
    e.entity_kind,
    e.sector,
    e.is_public_sector,
    fl.attachment_name,
    fl.attachment_names,
    ml.meeting_date,
    ml.meeting_title,
    ml.meeting_number,
    ml.linked_meeting_count,
    p.penalty_rows,
    p.amount_total_krw,
    p.surcharge_total_krw,
    p.fine_total_krw,
    p.penalty_breakdown,
    nullif(trim(pt.target_name), '') as paren_target_name,
    nullif(trim(substring(coalesce(fl.attachment_name, '') from '호[_ -]+([^(_\\.]{2,80})')), '') as file_suffix_target_name,
    nullif(trim(st.target_name), '') as source_target_name
  from public.decision_cases dc
  join penalty_by_case p on p.case_id = dc.id
  join public.decision_posts dp on dp.id = dc.decision_post_id
  left join public.entities e on e.id = dc.main_entity_id
  left join file_candidates fl on fl.case_id = dc.id
  left join penalty_source ps on ps.case_id = dc.id
  left join meeting_links ml on ml.decision_post_id = dc.decision_post_id
  left join lateral (
    select trim(m.match[1]) as target_name
    from regexp_matches(coalesce(fl.attachment_name, ''), '\(([^()]*)\)', 'g') as m(match)
    where trim(m.match[1]) !~ '(공개|의결|심의|결정|제[0-9]|CYLFILE|첨부|pdf|hwp)'
      and char_length(trim(m.match[1])) between 2 and 80
    order by char_length(trim(m.match[1])) desc
    limit 1
  ) pt on true
  left join lateral (
    select trim(m.match[1]) as target_name
    from regexp_matches(
      coalesce(ps.source_text, ''),
      '피심인[[:space:]]*([㈜가-힣A-Za-z0-9·ㆍ().,& -]{2,80})([[:space:]]+의결연월일|[[:space:]]+대표자|[[:space:]]+주[[:space:]]*문)',
      'g'
    ) as m(match)
    where trim(m.match[1]) !~ '^(에|에게|대하여|대한|대해|측|은|는|이|가|을|를)'
    order by char_length(trim(m.match[1])) desc
    limit 1
  ) st on true
),
named_cases as (
  select
    rc.*,
    nullif(
      trim(
        regexp_replace(
          regexp_replace(
            coalesce(rc.entity_name, rc.paren_target_name, rc.file_suffix_target_name, rc.source_target_name),
            '\.(pdf|hwp|hwpx|docx?)$',
            '',
            'i'
          ),
          '[[:space:]]+$',
          ''
        )
      ),
      ''
    ) as target_name,
    case
      when rc.entity_name is not null then 'entity'
      when rc.paren_target_name is not null then 'attachment_parenthesis'
      when rc.file_suffix_target_name is not null then 'attachment_suffix'
      when rc.source_target_name is not null then 'source_text'
      else 'unidentified'
    end as target_source
  from raw_cases rc
)
select
  nc.*,
  case
    when coalesce(nc.is_public_sector, false)
      or coalesce(nc.target_name, '') ~ '(공단|공사|구청|시청|군청|교육청|학교|대학교|공공기관|지방자치단체|행정기관)'
      or coalesce(nc.case_title, '') ~ '(공공기관|공공시스템)'
      then '공공'
    when coalesce(nc.target_name, '') ~ '(주식회사|㈜|\(주\)|회사|커머스|구글|넷플릭스|페이스북|카카오|네이버|엔에이치엔|레저플러스|이젠|트리플콤마|건설|빌딩|기원|은행|카드|보험|통신|플랫폼)'
      then '민간기업'
    when nc.entity_kind = 'person'
      or coalesce(nc.target_name, '') ~ '^[가-힣][ㅇ○][ㅇ○]$'
      then '개인'
    when nc.target_name is null then '대상 미식별'
    else '기타/미분류'
  end as target_group
from named_cases nc;

create or replace view public.dashboard_tab1_money_kpis as
with base as (
  select * from public.dashboard_tab1_case_money_base
),
totals as (
  select
    coalesce(sum(amount_total_krw), 0)::bigint as amount_total_krw,
    coalesce(sum(surcharge_total_krw), 0)::bigint as surcharge_total_krw,
    coalesce(sum(fine_total_krw), 0)::bigint as fine_total_krw,
    count(*)::bigint as monetary_case_count,
    count(distinct target_name) filter (where target_name is not null)::bigint as identified_target_count,
    count(*) filter (where target_name is null)::bigint as unidentified_case_count
  from base
),
top_case as (
  select *
  from base
  order by amount_total_krw desc, decision_date desc nulls last
  limit 1
),
meetings as (
  select
    count(*)::bigint as meeting_count,
    min(meeting_date) as first_meeting_date,
    max(meeting_date) as last_meeting_date
  from public.meetings
),
current_commissioners as (
  select count(*)::bigint as current_count
  from public.commissioner_terms ct
  join public.commissioners c on c.id = ct.commissioner_id
  where ct.generation = '2기'
    and ct.status = 'current'
    and c.status = 'current'
)
select
  'total_penalty_amount'::text as card_key,
  1 as sort_order,
  '전체 처분금액'::text as label,
  round(t.amount_total_krw / 100000000.0, 1)::text || '억' as value_text,
  t.monetary_case_count::text || '개 금전처분 사건 기준' as meta_text,
  '과징금·과태료 등 확정 금액 합계'::text as note,
  t.amount_total_krw as amount_krw
from totals t
union all
select
  'surcharge_amount',
  2,
  '과징금 합계',
  round(t.surcharge_total_krw / 100000000.0, 1)::text || '억',
  '전체 금액의 ' || round(t.surcharge_total_krw * 100.0 / nullif(t.amount_total_krw, 0), 1)::text || '%',
  '금액 규모를 좌우하는 핵심 처분',
  t.surcharge_total_krw
from totals t
union all
select
  'fine_amount',
  3,
  '과태료 합계',
  round(t.fine_total_krw / 100000000.0, 1)::text || '억',
  '확정 과태료 합계',
  '건수는 많지만 과징금보다 총액 영향은 작음',
  t.fine_total_krw
from totals t
union all
select
  'largest_case',
  4,
  '최고 처분 사건',
  coalesce(top_case.target_name, top_case.case_no, '피심인 미식별'),
  round(top_case.amount_total_krw / 100000000.0, 1)::text || '억 · ' || coalesce(top_case.decision_date::text, '-'),
  coalesce(top_case.case_title, ''),
  top_case.amount_total_krw
from top_case
union all
select
  'identified_targets',
  5,
  '처분 대상',
  t.identified_target_count::text || '곳',
  '대상 미식별 사건 ' || t.unidentified_case_count::text || '건',
  '기관·기업명 식별 기준',
  null::bigint
from totals t
union all
select
  'meetings',
  6,
  '전체회의 개최',
  m.meeting_count::text || '회',
  coalesce(m.first_meeting_date::text, '-') || ' ~ ' || coalesce(m.last_meeting_date::text, '-'),
  '회의 개최 흐름은 하단 캘린더에서 확인',
  null::bigint
from meetings m
union all
select
  'current_second_commissioners',
  7,
  '현재 2기 위원',
  c.current_count::text || '명',
  '조소영 위원 사퇴, 김휘강 위원 합류 반영',
  '현재 전체회의 구성 스냅샷',
  null::bigint
from current_commissioners c;

create or replace view public.dashboard_tab1_money_yearly as
select
  decision_year,
  count(*)::bigint as monetary_case_count,
  count(distinct target_name) filter (where target_name is not null)::bigint as identified_target_count,
  coalesce(sum(amount_total_krw), 0)::bigint as amount_total_krw,
  coalesce(sum(surcharge_total_krw), 0)::bigint as surcharge_total_krw,
  coalesce(sum(fine_total_krw), 0)::bigint as fine_total_krw,
  max(amount_total_krw)::bigint as max_case_amount_krw,
  (array_agg(coalesce(target_name, case_no, '피심인 미식별') order by amount_total_krw desc, decision_date desc nulls last))[1] as top_target_name,
  (array_agg(case_no order by amount_total_krw desc, decision_date desc nulls last))[1] as top_case_no
from public.dashboard_tab1_case_money_base
where decision_year is not null
group by decision_year;

create or replace view public.dashboard_tab1_money_monthly as
select
  decision_month_key,
  decision_year,
  decision_month,
  count(*)::bigint as monetary_case_count,
  coalesce(sum(amount_total_krw), 0)::bigint as amount_total_krw,
  coalesce(sum(surcharge_total_krw), 0)::bigint as surcharge_total_krw,
  coalesce(sum(fine_total_krw), 0)::bigint as fine_total_krw,
  max(amount_total_krw)::bigint as max_case_amount_krw,
  (array_agg(coalesce(target_name, case_no, '피심인 미식별') order by amount_total_krw desc, decision_date desc nulls last))[1] as top_target_name
from public.dashboard_tab1_case_money_base
where decision_month_key is not null
group by decision_month_key, decision_year, decision_month;

create or replace view public.dashboard_tab1_money_by_article as
with case_articles as (
  select distinct
    b.case_id,
    b.case_no,
    b.case_title,
    b.decision_date,
    b.target_name,
    b.amount_total_krw,
    coalesce(l.law_name, lc.law_name_raw) as law_name,
    coalesce(la.article_no, lc.article_raw) as article_no,
    la.article_title
  from public.dashboard_tab1_case_money_base b
  join public.law_citations lc on lc.source_type = 'decision_case'
    and lc.source_id = b.case_id
  left join public.law_articles la on la.id = lc.law_article_id
  left join public.laws l on l.id = la.law_id
  where coalesce(l.law_name, lc.law_name_raw, '') like '%개인정보 보호법%'
    and coalesce(la.article_no, lc.article_raw) is not null
    and coalesce(la.article_no, lc.article_raw) not in ('제2조', '제5조', '제6조', '제7조', '제8조', '제20조', '제27조', '제63조', '제75조')
)
select
  law_name,
  article_no,
  article_title,
  count(distinct case_id)::bigint as case_count,
  coalesce(sum(amount_total_krw), 0)::bigint as amount_total_krw,
  max(amount_total_krw)::bigint as max_case_amount_krw,
  (array_agg(case_no order by amount_total_krw desc, decision_date desc nulls last))[1] as top_case_no,
  (array_agg(coalesce(target_name, '피심인 미식별') order by amount_total_krw desc, decision_date desc nulls last))[1] as top_target_name,
  (array_agg(case_title order by amount_total_krw desc, decision_date desc nulls last))[1] as top_case_title
from case_articles
group by law_name, article_no, article_title;

create or replace view public.dashboard_tab1_target_group_summary as
select
  target_group,
  count(*)::bigint as monetary_case_count,
  count(distinct target_name) filter (where target_name is not null)::bigint as target_count,
  coalesce(sum(amount_total_krw), 0)::bigint as amount_total_krw,
  max(amount_total_krw)::bigint as max_case_amount_krw,
  (array_agg(coalesce(target_name, case_no, '피심인 미식별') order by amount_total_krw desc, decision_date desc nulls last))[1] as top_target_name,
  (array_agg(case_no order by amount_total_krw desc, decision_date desc nulls last))[1] as top_case_no
from public.dashboard_tab1_case_money_base
group by target_group;

create or replace view public.dashboard_tab1_target_rankings as
select
  target_name,
  target_group,
  target_source,
  count(*)::bigint as monetary_case_count,
  coalesce(sum(amount_total_krw), 0)::bigint as amount_total_krw,
  max(amount_total_krw)::bigint as max_case_amount_krw,
  (array_agg(case_no order by amount_total_krw desc, decision_date desc nulls last))[1] as top_case_no,
  (array_agg(case_title order by amount_total_krw desc, decision_date desc nulls last))[1] as top_case_title,
  (array_agg(decision_date order by amount_total_krw desc, decision_date desc nulls last))[1] as top_decision_date
from public.dashboard_tab1_case_money_base
where target_name is not null
group by target_name, target_group, target_source;

create or replace view public.dashboard_tab1_major_penalty_cases as
with case_articles as (
  select
    b.case_id,
    jsonb_agg(distinct jsonb_build_object(
      'law_name', coalesce(l.law_name, lc.law_name_raw),
      'article_no', coalesce(la.article_no, lc.article_raw),
      'article_title', la.article_title
    )) filter (where coalesce(la.article_no, lc.article_raw) is not null) as articles
  from public.dashboard_tab1_case_money_base b
  left join public.law_citations lc on lc.source_type = 'decision_case'
    and lc.source_id = b.case_id
  left join public.law_articles la on la.id = lc.law_article_id
  left join public.laws l on l.id = la.law_id
  group by b.case_id
)
select
  b.case_id,
  b.case_no,
  b.case_title,
  b.decision_date,
  b.target_name,
  b.target_group,
  b.target_source,
  b.amount_total_krw,
  b.surcharge_total_krw,
  b.fine_total_krw,
  b.penalty_breakdown,
  b.meeting_date,
  b.meeting_title,
  b.meeting_number,
  coalesce(ca.articles, '[]'::jsonb) as articles
from public.dashboard_tab1_case_money_base b
left join case_articles ca on ca.case_id = b.case_id
order by b.amount_total_krw desc, b.decision_date desc nulls last;

create or replace view public.dashboard_tab1_meeting_year_month as
select
  extract(year from m.meeting_date)::int as meeting_year,
  extract(month from m.meeting_date)::int as meeting_month,
  to_char(m.meeting_date, 'YYYY-MM') as meeting_month_key,
  count(distinct m.id)::bigint as meeting_count,
  count(ai.id)::bigint as agenda_count,
  count(ai.id) filter (where ai.agenda_kind = 'deliberation_decision')::bigint as decision_agenda_count,
  count(ai.id) filter (where ai.agenda_kind = 'report')::bigint as report_agenda_count,
  min(m.meeting_date) as first_meeting_date,
  max(m.meeting_date) as last_meeting_date
from public.meetings m
left join public.agenda_items ai on ai.meeting_id = m.id
group by extract(year from m.meeting_date)::int, extract(month from m.meeting_date)::int, to_char(m.meeting_date, 'YYYY-MM');

create or replace view public.dashboard_tab1_meeting_yearly as
select
  extract(year from m.meeting_date)::int as meeting_year,
  count(distinct m.id)::bigint as meeting_count,
  count(ai.id)::bigint as agenda_count,
  count(ai.id) filter (where ai.agenda_kind = 'deliberation_decision')::bigint as decision_agenda_count,
  count(ai.id) filter (where ai.agenda_kind = 'report')::bigint as report_agenda_count,
  min(m.meeting_date) as first_meeting_date,
  max(m.meeting_date) as last_meeting_date
from public.meetings m
left join public.agenda_items ai on ai.meeting_id = m.id
group by extract(year from m.meeting_date)::int;

create or replace view public.dashboard_tab1_second_commissioners as
select
  c.id as commissioner_id,
  c.name,
  c.role_current,
  c.status as commissioner_status,
  c.background_axis,
  c.profile_path,
  ct.generation,
  ct.role as term_role,
  ct.status as term_status,
  ct.recommendation_route,
  ct.appointment_route,
  ct.official_term_text,
  ct.start_date,
  ct.end_date,
  ct.minutes_first_seen,
  ct.minutes_last_seen,
  ct.appearances,
  case
    when ct.status = 'current' and c.status = 'current' then '현직'
    else '전직/교체'
  end as display_status
from public.commissioner_terms ct
join public.commissioners c on c.id = ct.commissioner_id
where ct.generation = '2기';
