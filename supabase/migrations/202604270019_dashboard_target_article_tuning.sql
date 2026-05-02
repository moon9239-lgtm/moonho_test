-- Purpose: make target-name extraction more conservative and keep article rankings focused on violation provisions.

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
    pt.target_name as paren_target_name,
    ft.target_name as file_suffix_target_name,
    st.target_name as source_target_name
  from public.decision_cases dc
  join penalty_by_case p on p.case_id = dc.id
  join public.decision_posts dp on dp.id = dc.decision_post_id
  left join public.entities e on e.id = dc.main_entity_id
  left join file_candidates fl on fl.case_id = dc.id
  left join penalty_source ps on ps.case_id = dc.id
  left join meeting_links ml on ml.decision_post_id = dc.decision_post_id
  left join lateral (
    select x.target_name
    from (
      select nullif(trim(regexp_replace(m.match[1], '[[:space:]]+', ' ', 'g')), '') as target_name
      from regexp_matches(coalesce(fl.attachment_name, ''), '\(([^()]*)\)', 'g') as m(match)
    ) x
    where x.target_name is not null
      and x.target_name !~ '(공개|꽁개|의결|심의|심결|결정|최종|버전|CYLFILE|첨부|pdf|hwp|대표자)'
      and x.target_name !~ '^[제]?[0-9]{4}[-–][-–0-9]+'
      and x.target_name !~ '^[-–0-9]+호?$'
      and char_length(x.target_name) between 2 and 80
    order by char_length(x.target_name) desc
    limit 1
  ) pt on true
  left join lateral (
    select x.target_name
    from (
      select nullif(trim(regexp_replace(substring(coalesce(fl.attachment_name, '') from '호[_ -]+([^(_\\.]{2,80})'), '[[:space:]]+', ' ', 'g')), '') as target_name
    ) x
    where x.target_name is not null
      and x.target_name !~ '(공개|꽁개|의결|심의|심결|결정|최종|버전|CYLFILE|첨부|pdf|hwp|대표자)'
      and x.target_name !~ '^[제]?[0-9]{4}[-–][-–0-9]+'
      and x.target_name !~ '^[-–0-9]+호?$'
      and char_length(x.target_name) between 2 and 80
    limit 1
  ) ft on true
  left join lateral (
    select x.target_name
    from (
      select nullif(
        trim(
          regexp_replace(
            regexp_replace(m.match[1], '(의결연월일|대표자|주[[:space:]]*문).*$', ''),
            '[[:space:]]+',
            ' ',
            'g'
          )
        ),
        ''
      ) as target_name
      from regexp_matches(
        coalesce(ps.source_text, ''),
        '피심인[[:space:]]*([㈜가-힣A-Za-z0-9·ㆍ().,& -]{2,100})([[:space:]]+의결연월일|[[:space:]]+대표자|[[:space:]]+주[[:space:]]*문)',
        'g'
      ) as m(match)
    ) x
    where x.target_name is not null
      and x.target_name !~ '^(에|에게|대하여|대한|대해|측|은|는|이|가|을|를|대표자|의결연월일|주 문)$'
      and x.target_name !~ '[0-9]{4}[. -][0-9]'
      and char_length(x.target_name) between 2 and 80
    order by char_length(x.target_name) desc
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
            coalesce(rc.entity_name, rc.source_target_name, rc.paren_target_name, rc.file_suffix_target_name),
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
      when rc.source_target_name is not null then 'source_text'
      when rc.paren_target_name is not null then 'attachment_parenthesis'
      when rc.file_suffix_target_name is not null then 'attachment_suffix'
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
    when coalesce(nc.target_name, '') ~ '(주식회사|㈜|\(주\)|회사|커머스|구글|넷플릭스|페이스북|카카오|네이버|엔에이치엔|레저플러스|이젠|트리플콤마|건설|빌딩|기원|은행|카드|보험|통신|플랫폼|Whaleco|Elementary)'
      then '민간기업'
    when nc.entity_kind = 'person'
      or coalesce(nc.target_name, '') ~ '^[가-힣][ㅇ○][ㅇ○]$'
      then '개인'
    when nc.target_name is null then '대상 미식별'
    else '기타/미분류'
  end as target_group
from named_cases nc;

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
      '제2조', '제5조', '제6조', '제7조', '제8조', '제9조', '제10조', '제11조',
      '제20조', '제27조', '제39조', '제63조', '제64조', '제64조의2',
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
