create or replace view public.dashboard_tab1_issue_tag_yearly as
with yearly as (
  select
    extract(year from u.utterance_date)::int as meeting_year,
    utt.tag_key,
    max(utt.tag_label) as tag_label,
    max(utt.tag_category) as tag_category,
    count(*)::bigint as utterance_count,
    count(distinct utt.commissioner_id)::bigint as commissioner_count,
    count(distinct u.meeting_id)::bigint as meeting_count,
    round(avg(utt.confidence)::numeric, 4) as average_confidence
  from public.utterance_tendency_tags utt
  join public.utterances u on u.id = utt.utterance_id
  where u.utterance_date is not null
  group by extract(year from u.utterance_date)::int, utt.tag_key
),
ranked as (
  select
    y.*,
    sum(y.utterance_count) over (partition by y.meeting_year)::bigint as year_tag_total,
    max(y.utterance_count) over (partition by y.meeting_year)::bigint as year_tag_max,
    row_number() over (
      partition by y.meeting_year
      order by y.utterance_count desc, y.tag_label
    ) as rank_in_year
  from yearly y
)
select
  meeting_year,
  tag_key,
  tag_label,
  tag_category,
  utterance_count,
  commissioner_count,
  meeting_count,
  average_confidence,
  year_tag_total,
  year_tag_max,
  round(utterance_count::numeric / nullif(year_tag_total, 0), 4) as share_in_year,
  rank_in_year,
  'auto_aggregated_rule_based'::text as data_status
from ranked
where rank_in_year <= 14;
