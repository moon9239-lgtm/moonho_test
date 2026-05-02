-- Purpose: practice-oriented dashboard views for agenda preparation.
-- These views focus on issue patterns, sanction outcomes, penalty benchmarks,
-- adjustment factors, and deliberation points rather than data inventory.

create or replace view public.dashboard_tab1_practice_case_base as
with chunk_sample as (
  select
    dc.id as case_id,
    string_agg(left(x.chunk_text, 1200), ' ' order by x.chunk_index) as chunk_text
  from public.decision_cases dc
  left join lateral (
    select chunk_index, chunk_text
    from public.document_chunks
    where source_type = 'decision_case'
      and source_id = dc.id
    order by chunk_index
    limit 12
  ) x on true
  group by dc.id
),
combined as (
  select
    dc.id as case_id,
    dc.case_no,
    dc.title as case_title,
    dc.decision_date,
    extract(year from dc.decision_date)::int as decision_year,
    dp.pipc_idx_id,
    dp.detail_url,
    concat_ws(
      ' ',
      dc.title,
      dc.summary,
      dc.disposition_summary,
      dc.outcome,
      ch.chunk_text
    ) as combined_text
  from public.decision_cases dc
  join public.decision_posts dp on dp.id = dc.decision_post_id
  left join chunk_sample ch on ch.case_id = dc.id
)
select
  case_id,
  case_no,
  case_title,
  decision_date,
  decision_year,
  pipc_idx_id,
  detail_url,
  combined_text,
  case
    when combined_text ~* '(AI|인공지능|가명정보|프로파일링|행태정보|맞춤형 광고|자동화)' then 'ai_pseudonym_behavior'
    when combined_text ~* '(국외|해외|국경|이전|구글|Google|메타|Meta|페이스북|플랫폼|앱|서비스)' then 'cross_border_platform'
    when combined_text ~ '(유출|누출|침해|통지|신고 지연|유출 사실|해킹)' then 'breach_notification'
    when combined_text ~ '(안전성 확보|안전조치|접근권한|접근통제|암호화|비밀번호|인증|접속기록|권한|관리적.?기술적)' then 'technical_security'
    when combined_text ~ '(동의|수집|제3자 제공|목적 외|고지|법정대리인|14세)' then 'consent_collection_use'
    when combined_text ~ '(처리방침|개인정보처리방침|공개|필수.*기재)' then 'privacy_policy_notice'
    when combined_text ~ '(위탁|수탁|처리위탁|수탁자|재위탁)' then 'outsourcing_management'
    when combined_text ~ '(열람|정정|삭제|처리정지|정보주체.*권리)' then 'data_subject_rights'
    when combined_text ~ '(영상정보|CCTV|폐쇄회로|촬영)' then 'video_cctv'
    when combined_text ~ '(민감정보|고유식별정보|주민등록번호|여권번호|운전면허번호)' then 'sensitive_identifier'
    when combined_text ~ '(공공기관|지방자치|지자체|교육청|학교|시청|구청|군청|공사|공단|공무원)' then 'public_sector'
    else 'other'
  end as issue_key,
  case
    when combined_text ~* '(AI|인공지능|가명정보|프로파일링|행태정보|맞춤형 광고|자동화)' then 'AI·가명정보·행태정보'
    when combined_text ~* '(국외|해외|국경|이전|구글|Google|메타|Meta|페이스북|플랫폼|앱|서비스)' then '국외·플랫폼'
    when combined_text ~ '(유출|누출|침해|통지|신고 지연|유출 사실|해킹)' then '유출·통지'
    when combined_text ~ '(안전성 확보|안전조치|접근권한|접근통제|암호화|비밀번호|인증|접속기록|권한|관리적.?기술적)' then '안전조치'
    when combined_text ~ '(동의|수집|제3자 제공|목적 외|고지|법정대리인|14세)' then '동의·수집·제공'
    when combined_text ~ '(처리방침|개인정보처리방침|공개|필수.*기재)' then '처리방침·고지'
    when combined_text ~ '(위탁|수탁|처리위탁|수탁자|재위탁)' then '위탁·수탁 관리'
    when combined_text ~ '(열람|정정|삭제|처리정지|정보주체.*권리)' then '정보주체 권리'
    when combined_text ~ '(영상정보|CCTV|폐쇄회로|촬영)' then '영상정보·CCTV'
    when combined_text ~ '(민감정보|고유식별정보|주민등록번호|여권번호|운전면허번호)' then '민감·고유식별정보'
    when combined_text ~ '(공공기관|지방자치|지자체|교육청|학교|시청|구청|군청|공사|공단|공무원)' then '공공부문'
    else '기타'
  end as issue_label,
  combined_text ~ '(감경|감액|참작|시정.*완료|조사.*협조|적극.*협력|자진|중소기업|피해.*구제)' as has_mitigation_signal,
  combined_text ~ '(가중|반복|동종.*위반|고의|중과실|대규모|민감정보|고유식별정보|주민등록번호|유출.*규모)' as has_aggravation_signal
from combined;

create or replace view public.dashboard_tab1_issue_yearly_trends as
with case_penalties as (
  select case_id, count(*)::bigint as penalty_rows, coalesce(sum(amount_krw), 0)::bigint as amount_total_krw
  from public.verified_penalty_outcomes
  group by case_id
),
agg as (
  select
    b.decision_year,
    b.issue_key,
    b.issue_label,
    count(*)::bigint as case_count,
    count(*) filter (where coalesce(cp.penalty_rows, 0) > 0)::bigint as monetary_case_count,
    coalesce(sum(cp.amount_total_krw), 0)::bigint as amount_total_krw,
    max(cp.amount_total_krw)::bigint as max_case_amount_krw,
    count(*) filter (where b.has_mitigation_signal)::bigint as mitigation_signal_cases,
    count(*) filter (where b.has_aggravation_signal)::bigint as aggravation_signal_cases
  from public.dashboard_tab1_practice_case_base b
  left join case_penalties cp on cp.case_id = b.case_id
  where b.decision_year is not null
  group by b.decision_year, b.issue_key, b.issue_label
),
totals as (
  select decision_year, sum(case_count)::bigint as year_case_count
  from agg
  group by decision_year
)
select
  agg.*,
  totals.year_case_count,
  round(agg.case_count::numeric / nullif(totals.year_case_count, 0), 4) as year_ratio
from agg
join totals on totals.decision_year = agg.decision_year;

create or replace view public.dashboard_tab1_article_sanction_matrix as
with law_case_article as (
  select distinct
    lc.source_id as case_id,
    coalesce(la.article_no, substring(lc.article_raw from '(제[0-9]+조(의[0-9]+)?)'), lc.article_raw) as article_no,
    max(la.article_title) over (
      partition by lc.source_id, coalesce(la.article_no, substring(lc.article_raw from '(제[0-9]+조(의[0-9]+)?)'), lc.article_raw)
    ) as article_title
  from public.law_citations lc
  left join public.law_articles la on la.id = lc.law_article_id
  where lc.source_type = 'decision_case'
    and lc.verification_status = 'verified'
    and lc.source_id is not null
),
top_articles as (
  select article_no
  from law_case_article
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

create or replace view public.dashboard_tab1_penalty_benchmarks as
select
  b.issue_key,
  b.issue_label,
  vpo.penalty_kind,
  count(*)::bigint as outcome_rows,
  count(distinct b.case_id)::bigint as case_count,
  min(vpo.amount_krw) as min_amount_krw,
  percentile_cont(0.5) within group (order by vpo.amount_krw) as median_amount_krw,
  percentile_cont(0.75) within group (order by vpo.amount_krw) as p75_amount_krw,
  round(avg(vpo.amount_krw)::numeric, 0) as avg_amount_krw,
  max(vpo.amount_krw) as max_amount_krw,
  coalesce(sum(vpo.amount_krw), 0)::bigint as total_amount_krw,
  (array_agg(b.case_no order by vpo.amount_krw desc, b.decision_date desc))[1] as max_case_no,
  (array_agg(b.case_title order by vpo.amount_krw desc, b.decision_date desc))[1] as max_case_title,
  (array_agg(b.decision_date order by vpo.amount_krw desc, b.decision_date desc))[1] as max_case_date
from public.dashboard_tab1_practice_case_base b
join public.verified_penalty_outcomes vpo on vpo.case_id = b.case_id
group by b.issue_key, b.issue_label, vpo.penalty_kind;

create or replace view public.dashboard_tab1_violation_pattern_summary as
with case_penalties as (
  select case_id, coalesce(sum(amount_krw), 0)::bigint as amount_total_krw
  from public.verified_penalty_outcomes
  group by case_id
),
base as (
  select
    b.*,
    coalesce(cp.amount_total_krw, 0)::bigint as amount_total_krw
  from public.dashboard_tab1_practice_case_base b
  left join case_penalties cp on cp.case_id = b.case_id
),
issue_agg as (
  select
    issue_key,
    issue_label,
    count(*)::bigint as case_count,
    count(*) filter (where amount_total_krw > 0)::bigint as monetary_case_count,
    coalesce(sum(amount_total_krw), 0)::bigint as amount_total_krw,
    max(amount_total_krw)::bigint as max_case_amount_krw,
    percentile_cont(0.5) within group (order by nullif(amount_total_krw, 0)) as median_case_amount_krw,
    count(*) filter (where has_mitigation_signal)::bigint as mitigation_signal_cases,
    count(*) filter (where has_aggravation_signal)::bigint as aggravation_signal_cases
  from base
  group by issue_key, issue_label
)
select
  ia.*,
  coalesce(articles.top_articles, '[]'::jsonb) as top_articles,
  coalesce(sanctions.top_sanctions, '[]'::jsonb) as top_sanctions,
  rep.case_id as representative_case_id,
  rep.case_no as representative_case_no,
  rep.case_title as representative_case_title,
  rep.decision_date as representative_decision_date,
  rep.amount_total_krw as representative_amount_krw
from issue_agg ia
left join lateral (
  select jsonb_agg(jsonb_build_object('article_no', article_no, 'case_count', case_count, 'article_title', article_title) order by case_count desc, article_no) as top_articles
  from (
    select
      coalesce(la.article_no, substring(lc.article_raw from '(제[0-9]+조(의[0-9]+)?)'), lc.article_raw) as article_no,
      max(la.article_title) as article_title,
      count(distinct lc.source_id)::bigint as case_count
    from public.law_citations lc
    left join public.law_articles la on la.id = lc.law_article_id
    join base b on b.case_id = lc.source_id
    where lc.source_type = 'decision_case'
      and lc.verification_status = 'verified'
      and b.issue_key = ia.issue_key
    group by 1
    order by count(distinct lc.source_id) desc, 1
    limit 5
  ) ranked
) articles on true
left join lateral (
  select jsonb_agg(jsonb_build_object('sanction_kind', sanction_kind, 'case_count', case_count) order by case_count desc, sanction_kind) as top_sanctions
  from (
    select s.sanction_kind, count(distinct s.case_id)::bigint as case_count
    from public.sanctions s
    join base b on b.case_id = s.case_id
    where b.issue_key = ia.issue_key
    group by s.sanction_kind
    order by count(distinct s.case_id) desc, s.sanction_kind
    limit 5
  ) ranked
) sanctions on true
left join lateral (
  select case_id, case_no, case_title, decision_date, amount_total_krw
  from base b
  where b.issue_key = ia.issue_key
  order by amount_total_krw desc, decision_date desc nulls last
  limit 1
) rep on true;

create or replace view public.dashboard_tab1_adjustment_factors as
with factors as (
  select
    b.case_id,
    b.issue_key,
    b.issue_label,
    factor.factor_key,
    factor.factor_label,
    factor.direction
  from public.dashboard_tab1_practice_case_base b
  cross join lateral (
    values
      ('corrective_action', '시정 완료·재발방지', 'mitigating', b.combined_text ~ '(시정.*완료|위반행위.*중지|재발방지|개선조치|조치.*완료)'),
      ('cooperation', '조사 협조·자료 제출', 'mitigating', b.combined_text ~ '(조사.*협조|자료.*제출|적극.*협력|조사에.*협력)'),
      ('first_violation', '최근 3년 처분 이력 없음', 'mitigating', b.combined_text ~ '(최근 3년간.*처분.*없|처분을 받은 사실이 없|1회 위반)'),
      ('small_business', '중소기업·영세성', 'mitigating', b.combined_text ~ '(중소기업|중기업|소기업|영세|스타트업)'),
      ('self_correction', '자진신고·자진시정', 'mitigating', b.combined_text ~ '(자진신고|자진.*시정|자발적.*시정)'),
      ('harm_remedy', '피해구제·보상 노력', 'mitigating', b.combined_text ~ '(피해.*구제|피해자.*보상|보상.*노력|구제.*노력)'),
      ('affected_scale', '정보주체·유출 규모', 'aggravating', b.combined_text ~ '(정보주체.*[0-9,]+명|이용자.*[0-9,]+명|유출.*[0-9,]+명|대규모|피해.*규모)'),
      ('repeat_violation', '반복·동종 위반', 'aggravating', b.combined_text ~ '(반복|동종.*위반|재차|과거.*위반|처분.*전력)'),
      ('intent_negligence', '고의·중과실·관리소홀', 'aggravating', b.combined_text ~ '(고의|중과실|중대한 과실|관리소홀|주의의무.*위반)'),
      ('sensitive_identifier', '민감·고유식별정보 포함', 'aggravating', b.combined_text ~ '(민감정보|고유식별정보|주민등록번호|여권번호|운전면허번호)'),
      ('revenue_basis', '매출액·관련매출액 산정', 'context', b.combined_text ~ '(매출액|관련매출액|부가서비스|산정기준|부과기준율)')
  ) as factor(factor_key, factor_label, direction, matched)
  where factor.matched
),
case_amounts as (
  select case_id, coalesce(sum(amount_krw), 0)::bigint as amount_total_krw
  from public.verified_penalty_outcomes
  group by case_id
)
select
  f.factor_key,
  f.factor_label,
  f.direction,
  count(*)::bigint as signal_rows,
  count(distinct f.case_id)::bigint as case_count,
  count(distinct f.case_id) filter (where coalesce(ca.amount_total_krw, 0) > 0)::bigint as monetary_case_count,
  coalesce(sum(ca.amount_total_krw), 0)::bigint as amount_total_krw,
  max(ca.amount_total_krw)::bigint as max_case_amount_krw,
  coalesce(
    jsonb_agg(distinct jsonb_build_object('issue_key', f.issue_key, 'issue_label', f.issue_label))
      filter (where f.issue_key is not null),
    '[]'::jsonb
  ) as related_issues
from factors f
left join case_amounts ca on ca.case_id = f.case_id
group by f.factor_key, f.factor_label, f.direction;

create or replace view public.dashboard_tab1_deliberation_focus as
select
  utt.tag_key,
  max(utt.tag_label) as tag_label,
  max(utt.tag_category) as tag_category,
  count(*)::bigint as utterance_count,
  count(distinct utt.commissioner_id)::bigint as commissioner_count,
  count(distinct u.meeting_id)::bigint as meeting_count,
  count(distinct ucl.case_id)::bigint as linked_case_count,
  round(avg(utt.confidence)::numeric, 4) as average_confidence,
  (array_agg(left(utt.evidence_text, 180) order by utt.confidence desc nulls last))[1] as sample_evidence
from public.utterance_tendency_tags utt
join public.utterances u on u.id = utt.utterance_id
left join public.utterance_case_links ucl on ucl.utterance_id = u.id
group by utt.tag_key
order by count(*) desc;

create or replace view public.dashboard_tab1_representative_cases as
with case_amounts as (
  select
    case_id,
    coalesce(sum(amount_krw), 0)::bigint as amount_total_krw,
    jsonb_agg(jsonb_build_object('penalty_kind', penalty_kind, 'amount_krw', amount_krw) order by amount_krw desc) as penalties
  from public.verified_penalty_outcomes
  group by case_id
),
ranked as (
  select
    b.issue_key,
    b.issue_label,
    b.case_id,
    b.case_no,
    b.case_title,
    b.decision_date,
    b.detail_url,
    coalesce(ca.amount_total_krw, 0)::bigint as amount_total_krw,
    coalesce(ca.penalties, '[]'::jsonb) as penalties,
    row_number() over (partition by b.issue_key order by coalesce(ca.amount_total_krw, 0) desc, b.decision_date desc nulls last) as rn
  from public.dashboard_tab1_practice_case_base b
  left join case_amounts ca on ca.case_id = b.case_id
)
select
  r.*,
  coalesce(articles.top_articles, '[]'::jsonb) as top_articles,
  coalesce(sanctions.sanctions, '[]'::jsonb) as sanctions
from ranked r
left join lateral (
  select jsonb_agg(jsonb_build_object('article_no', article_no, 'article_title', article_title) order by article_no) as top_articles
  from (
    select distinct
      coalesce(la.article_no, substring(lc.article_raw from '(제[0-9]+조(의[0-9]+)?)'), lc.article_raw) as article_no,
      la.article_title
    from public.law_citations lc
    left join public.law_articles la on la.id = lc.law_article_id
    where lc.source_type = 'decision_case'
      and lc.source_id = r.case_id
      and lc.verification_status = 'verified'
    limit 5
  ) x
) articles on true
left join lateral (
  select jsonb_agg(distinct sanction_kind order by sanction_kind) as sanctions
  from public.sanctions s
  where s.case_id = r.case_id
) sanctions on true
where r.rn = 1;

create or replace view public.dashboard_tab1_insight_cards as
with years as (
  select max(decision_year) as latest_year
  from public.dashboard_tab1_practice_case_base
  where decision_year is not null
),
growth as (
  select
    current_issue.issue_key,
    current_issue.issue_label,
    current_issue.case_count as latest_count,
    coalesce(previous_issue.case_count, 0) as previous_count,
    current_issue.case_count - coalesce(previous_issue.case_count, 0) as growth_count
  from (
    select issue_key, issue_label, count(*)::int as case_count
    from public.dashboard_tab1_practice_case_base, years
    where decision_year = years.latest_year
    group by issue_key, issue_label
  ) current_issue
  left join (
    select issue_key, count(*)::int as case_count
    from public.dashboard_tab1_practice_case_base, years
    where decision_year = years.latest_year - 1
    group by issue_key
  ) previous_issue on previous_issue.issue_key = current_issue.issue_key
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
  select factor_label, direction, case_count
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
  coalesce('+' || g.growth_count::text || '건 / 최근연도 ' || g.latest_count::text || '건', '-') as meta_text,
  '전년 대비 늘어난 쟁점을 먼저 확인합니다.'::text as note,
  1 as sort_order
from growth g
union all
select
  'article_anchor',
  '주요 적용 조항',
  coalesce(a.article_no, '-'),
  coalesce(a.case_count::text || '건' || case when a.article_title is not null then ' · ' || a.article_title else '' end, '-'),
  '처분 사건과 함께 가장 자주 등장한 조항입니다.',
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
  coalesce(f.case_count::text || '건 · ' || f.direction, '-'),
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
