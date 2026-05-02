-- Purpose: keep summary labels readable and exclude general/organization/penalty-basis articles from the first article chart.

create or replace view public.dashboard_tab1_target_group_summary as
select
  target_group,
  count(*)::bigint as monetary_case_count,
  count(distinct target_name) filter (where target_name is not null)::bigint as target_count,
  coalesce(sum(amount_total_krw), 0)::bigint as amount_total_krw,
  max(amount_total_krw)::bigint as max_case_amount_krw,
  (array_agg(coalesce(target_name, '피심인 미식별') order by amount_total_krw desc, decision_date desc nulls last))[1] as top_target_name,
  (array_agg(case_no order by amount_total_krw desc, decision_date desc nulls last))[1] as top_case_no
from public.dashboard_tab1_case_money_base
group by target_group;

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
    and coalesce(la.article_no, lc.article_raw) not in (
      '제2조', '제4조', '제5조', '제6조', '제7조', '제8조', '제9조', '제10조', '제11조', '제12조',
      '제20조', '제27조', '제39조', '제39조의15', '제40조', '제63조', '제64조', '제64조의2',
      '제65조', '제66조', '제75조', '제76조'
    )
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
