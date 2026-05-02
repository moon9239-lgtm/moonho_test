import fs from "node:fs";
import path from "node:path";

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "yfrjdbsaulawwqmuozao";
const API_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_FILE = path.join(ROOT, "data", "dashboard-data.js");

const sql = `
select jsonb_build_object(
  'generatedAt', now(),
  'overviewKpis', (select coalesce(jsonb_agg(t), '[]'::jsonb) from public.dashboard_tab1_overview_kpis_resolved t),
  'yearlyStats', (select coalesce(jsonb_agg(t order by meeting_year), '[]'::jsonb) from public.dashboard_tab1_yearly_stats_resolved t),
  'agendaCompositionYearly', (select coalesce(jsonb_agg(t order by meeting_year, category_type, category_key), '[]'::jsonb) from public.dashboard_tab1_agenda_composition_yearly t),
  'sanctionDistribution', (select coalesce(jsonb_agg(t), '[]'::jsonb) from (select * from public.dashboard_tab1_sanction_distribution_resolved order by sanction_count desc limit 20) t),
  'lawArticleDistribution', (select coalesce(jsonb_agg(t), '[]'::jsonb) from (select * from public.dashboard_tab1_law_article_distribution_resolved order by citation_count desc limit 30) t),
  'penaltyOutcomeSummary', (select coalesce(jsonb_agg(t), '[]'::jsonb) from (select * from public.dashboard_tab1_penalty_outcome_summary order by outcome_rows desc) t),
  'commissionerActivity', (select coalesce(jsonb_agg(t), '[]'::jsonb) from (select * from public.dashboard_tab1_commissioner_activity order by total_utterances desc limit 30) t),
  'issueTagDistribution', (select coalesce(jsonb_agg(t), '[]'::jsonb) from (select * from public.dashboard_tab1_issue_tag_distribution_resolved order by utterance_total desc limit 30) t),
  'issueTagYearly', (select coalesce(jsonb_agg(t order by meeting_year, rank_in_year), '[]'::jsonb) from public.dashboard_tab1_issue_tag_yearly t),
  'dataQuality', (select coalesce(jsonb_agg(t), '[]'::jsonb) from public.dashboard_tab1_data_quality_resolved t),
  'topicDistribution', (select coalesce(jsonb_agg(t), '[]'::jsonb) from (select * from public.dashboard_tab1_topic_distribution order by agenda_count desc) t),
  'lawVerificationCoverage', (select coalesce(jsonb_agg(t), '[]'::jsonb) from public.dashboard_law_verification_coverage t),
  'statusResolutionSummary', (select coalesce(jsonb_agg(t order by table_name, status), '[]'::jsonb) from public.dashboard_tab1_status_resolution_summary t)
  ,'moneyKpis', (select coalesce(jsonb_agg(t order by sort_order), '[]'::jsonb) from public.dashboard_tab1_money_kpis t)
  ,'moneyYearly', (select coalesce(jsonb_agg(t order by decision_year), '[]'::jsonb) from public.dashboard_tab1_money_yearly t)
  ,'moneyMonthly', (select coalesce(jsonb_agg(t order by decision_year, decision_month), '[]'::jsonb) from public.dashboard_tab1_money_monthly t)
  ,'moneyByArticle', (select coalesce(jsonb_agg(t), '[]'::jsonb) from (select * from public.dashboard_tab1_money_by_article order by amount_total_krw desc, case_count desc limit 30) t)
  ,'targetGroupSummary', (select coalesce(jsonb_agg(t), '[]'::jsonb) from (select * from public.dashboard_tab1_target_group_summary order by amount_total_krw desc) t)
  ,'targetRankings', (select coalesce(jsonb_agg(t), '[]'::jsonb) from (select * from public.dashboard_tab1_target_rankings order by amount_total_krw desc limit 40) t)
  ,'majorPenaltyCases', (select coalesce(jsonb_agg(t), '[]'::jsonb) from (select * from public.dashboard_tab1_major_penalty_cases order by amount_total_krw desc, decision_date desc nulls last limit 40) t)
  ,'meetingYearMonth', (select coalesce(jsonb_agg(t order by meeting_year, meeting_month), '[]'::jsonb) from public.dashboard_tab1_meeting_year_month t)
  ,'meetingYearly', (select coalesce(jsonb_agg(t order by meeting_year), '[]'::jsonb) from public.dashboard_tab1_meeting_yearly t)
  ,'secondCommissioners', (select coalesce(jsonb_agg(t order by case when display_status = '현직' then 0 else 1 end, start_date nulls last, name), '[]'::jsonb) from public.dashboard_tab1_second_commissioners t)
) as dashboard_data;
`;

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    throw new Error("SUPABASE_ACCESS_TOKEN is not set.");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Supabase query failed (${response.status}): ${text}`);
  }

  const rows = JSON.parse(text);
  const dashboardData = rows?.[0]?.dashboard_data;
  if (!dashboardData) {
    throw new Error("Dashboard data query returned no payload.");
  }

  const js = [
    "window.PIPC_DASHBOARD_DATA = ",
    JSON.stringify(dashboardData, null, 2),
    ";",
    "",
  ].join("");

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, js, "utf8");
  console.log(`Wrote ${OUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
