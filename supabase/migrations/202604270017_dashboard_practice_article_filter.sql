-- Purpose: focus the article/sanction matrix on substantive PIPA provisions
-- rather than procedural appeal, definition, or penalty-standard provisions.

create or replace view public.dashboard_tab1_article_sanction_matrix as
with law_case_article as (
  select distinct
    lc.source_id as case_id,
    concat_ws(
      ' ',
      coalesce(l.law_name, nullif(lc.law_name_raw, ''), '법령명 미상'),
      coalesce(la.article_no, substring(lc.article_raw from '(제[0-9]+조(의[0-9]+)?)'), lc.article_raw)
    ) as article_no,
    max(la.article_title) over (
      partition by lc.source_id,
      concat_ws(
        ' ',
        coalesce(l.law_name, nullif(lc.law_name_raw, ''), '법령명 미상'),
        coalesce(la.article_no, substring(lc.article_raw from '(제[0-9]+조(의[0-9]+)?)'), lc.article_raw)
      )
    ) as article_title
  from public.law_citations lc
  left join public.law_articles la on la.id = lc.law_article_id
  left join public.laws l on l.id = la.law_id
  where lc.source_type = 'decision_case'
    and lc.verification_status = 'verified'
    and lc.source_id is not null
),
top_articles as (
  select article_no
  from law_case_article
  where article_no like '개인정보 보호법 %'
    and article_no !~ '개인정보 보호법 제(2|5|6|7|8|20|27|63|75)조'
  group by article_no
  order by count(distinct case_id) desc, article_no
  limit 18
),
case_sanctions as (
  select distinct case_id, sanction_kind
  from public.sanctions
),
case_amounts as (
  select case_id, coalesce(sum(amount_krw), 0)::bigint as amount_total_krw
  from public.verified_penalty_outcomes
  group by case_id
)
select
  lca.article_no,
  max(lca.article_title) as article_title,
  cs.sanction_kind,
  count(distinct lca.case_id)::bigint as case_count,
  count(distinct lca.case_id) filter (where coalesce(ca.amount_total_krw, 0) > 0)::bigint as monetary_case_count,
  coalesce(sum(ca.amount_total_krw), 0)::bigint as amount_total_krw,
  max(ca.amount_total_krw)::bigint as max_case_amount_krw
from law_case_article lca
join top_articles ta on ta.article_no = lca.article_no
join case_sanctions cs on cs.case_id = lca.case_id
left join case_amounts ca on ca.case_id = lca.case_id
group by lca.article_no, cs.sanction_kind;

create or replace view public.dashboard_tab1_insight_cards as
with years as (
  select coalesce(
    max(decision_year) filter (where decision_year < extract(year from current_date)::int),
    max(decision_year)
  ) as latest_year
  from public.dashboard_tab1_practice_case_base
  where decision_year is not null
),
growth as (
  select
    current_issue.issue_key,
    current_issue.issue_label,
    current_issue.case_count as latest_count,
    coalesce(previous_issue.case_count, 0) as previous_count,
    current_issue.case_count - coalesce(previous_issue.case_count, 0) as growth_count,
    years.latest_year
  from years
  join (
    select issue_key, issue_label, decision_year, count(*)::int as case_count
    from public.dashboard_tab1_practice_case_base
    group by issue_key, issue_label, decision_year
  ) current_issue on current_issue.decision_year = years.latest_year
  left join (
    select issue_key, decision_year, count(*)::int as case_count
    from public.dashboard_tab1_practice_case_base
    group by issue_key, decision_year
  ) previous_issue
    on previous_issue.issue_key = current_issue.issue_key
   and previous_issue.decision_year = years.latest_year - 1
  order by growth_count desc, latest_count desc
  limit 1
),
article_anchor as (
  select article_no, max(article_title) as article_title, sum(case_count)::bigint as case_count
  from public.dashboard_tab1_article_sanction_matrix
  group by article_no
  order by sum(case_count) desc, article_no
  limit 1
),
penalty_risk as (
  select issue_label, penalty_kind, max_amount_krw, median_amount_krw, case_count
  from public.dashboard_tab1_penalty_benchmarks
  order by max_amount_krw desc nulls last
  limit 1
),
factor_anchor as (
  select
    factor_label,
    case direction
      when 'mitigating' then '감경'
      when 'aggravating' then '가중'
      else '산정'
    end as direction_label,
    case_count
  from public.dashboard_tab1_adjustment_factors
  order by case_count desc, factor_label
  limit 1
),
focus_anchor as (
  select tag_label, utterance_count, linked_case_count
  from public.dashboard_tab1_deliberation_focus
  order by utterance_count desc
  limit 1
)
select
  'recent_growth'::text as card_key,
  '최근 증가 쟁점'::text as label,
  coalesce(g.issue_label, '-') as value_text,
  coalesce(g.latest_year::text || '년 기준 +' || g.growth_count::text || '건 · ' || g.latest_count::text || '건', '-') as meta_text,
  '완료 연도끼리 비교해 늘어난 쟁점을 먼저 확인합니다.'::text as note,
  1 as sort_order
from growth g
union all
select
  'article_anchor',
  '주요 위반 조항',
  coalesce(a.article_no, '-'),
  coalesce(a.case_count::text || '건' || case when a.article_title is not null then ' · ' || a.article_title else '' end, '-'),
  '처분 사건과 함께 가장 자주 등장한 실체 위반 조항입니다.',
  2
from article_anchor a
union all
select
  'penalty_risk',
  '고액 리스크 유형',
  coalesce(p.issue_label, '-'),
  coalesce(p.penalty_kind || ' 최고 ' || round(p.max_amount_krw / 100000000.0, 1)::text || '억', '-'),
  '처분 수위 벤치마크에서 최고액이 큰 유형입니다.',
  3
from penalty_risk p
union all
select
  'adjustment_factor',
  '자주 등장한 산정 요소',
  coalesce(f.factor_label, '-'),
  coalesce(f.case_count::text || '건 · ' || f.direction_label, '-'),
  '감경·가중·산정 맥락에서 반복 등장한 요소입니다.',
  4
from factor_anchor f
union all
select
  'deliberation_focus',
  '위원회 심의 포인트',
  coalesce(d.tag_label, '-'),
  coalesce(d.utterance_count::text || '발언 · 사건연결 ' || d.linked_case_count::text || '건', '-'),
  '속기록에서 반복적으로 드러난 질의·검토 축입니다.',
  5
from focus_anchor d;
