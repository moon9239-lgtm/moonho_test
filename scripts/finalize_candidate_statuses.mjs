import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "yfrjdbsaulawwqmuozao";
const SUPABASE_API_BASE = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const shouldUpload = process.argv.includes("--upload");
const reportPath = path.join(ROOT, "pipc_knowledge_base", "00_indexes", "candidate_resolution_report.md");
const outDir = path.join(ROOT, "pipc_knowledge_base", "90_normalized_data");
const outcomesCsvPath = path.join(outDir, "verified_penalty_outcomes.csv");

function compact(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function writeCsv(filePath, rows, headers) {
  const body = [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n");
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${body}\n`, "utf8");
}

function sqlJsonLiteral(rows) {
  const tag = `candidate_resolution_${Math.random().toString(16).slice(2)}`;
  return `$${tag}$${JSON.stringify(rows)}$${tag}$::jsonb`;
}

async function supabaseSql(label, sql) {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) throw new Error("SUPABASE_ACCESS_TOKEN is not set.");

  const response = await fetch(SUPABASE_API_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ query: sql }),
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`${label} failed (${response.status}): ${body}`);
  }

  if (!body.trim()) return [];
  return JSON.parse(body);
}

function statusSummarySql() {
  return `
select 'agenda_items' as table_name, ai.extraction_status as status, count(*)::bigint as rows
from public.agenda_items ai
group by ai.extraction_status
union all
select 'decision_cases', dc.extraction_status, count(*)::bigint
from public.decision_cases dc
group by dc.extraction_status
union all
select 'sanctions', s.extraction_status, count(*)::bigint
from public.sanctions s
group by s.extraction_status
union all
select 'sanctions_result', s.result_status, count(*)::bigint
from public.sanctions s
group by s.result_status
union all
select 'monetary_penalties', mp.extraction_status, count(*)::bigint
from public.monetary_penalties mp
group by mp.extraction_status
union all
select 'law_citations_extraction', lc.extraction_status, count(*)::bigint
from public.law_citations lc
group by lc.extraction_status
union all
select 'law_citations_verification', lc.verification_status, count(*)::bigint
from public.law_citations lc
group by lc.verification_status
union all
select 'utterance_tendency_tags', utt.extraction_status, count(*)::bigint
from public.utterance_tendency_tags utt
group by utt.extraction_status
union all
select 'commissioner_tendency_stats', cts.extraction_status, count(*)::bigint
from public.commissioner_tendency_stats cts
group by cts.extraction_status
union all
select 'verified_penalty_outcomes', vpo.verification_status, count(*)::bigint
from public.verified_penalty_outcomes vpo
group by vpo.verification_status
order by table_name, status;
`;
}

function decisionCasesSql() {
  return `
select
  dc.id::text as case_id,
  dc.case_no,
  dc.title,
  dc.decision_date::text as decision_date,
  dc.disposition_summary,
  dc.outcome,
  dc.metadata
from public.decision_cases dc
where dc.extraction_status in ('candidate', 'verified_document_case')
   or exists (
     select 1
     from public.monetary_penalties mp
     where mp.case_id = dc.id
       and mp.extraction_status in ('candidate', 'needs_review_not_final_amount', 'needs_review_role_classification')
   )
order by dc.decision_date nulls last, dc.case_no;
`;
}

function normalizeAmountText(value) {
  return String(value ?? "").replace(/\s+/g, "");
}

function amountFromText(value) {
  const digits = String(value ?? "").replace(/[^0-9]/g, "");
  if (!digits) return null;
  const amount = Number(digits);
  return Number.isSafeInteger(amount) ? amount : null;
}

function contextAround(text, index, length) {
  const start = Math.max(0, index - 180);
  const end = Math.min(text.length, index + length + 180);
  return compact(text.slice(start, end));
}

function extractOutcomesFromCase(row) {
  const sourceText = compact(row.disposition_summary || row.outcome || "");
  if (!sourceText) return [];

  const patterns = [
    { kind: "과징금", regex: /과\s*징\s*금\s*[:：]\s*([0-9][0-9,\s]*)\s*원/g },
    { kind: "과태료", regex: /과\s*태\s*료\s*[:：]\s*([0-9][0-9,\s]*)\s*원/g },
  ];

  const outcomes = [];
  const seen = new Set();
  for (const pattern of patterns) {
    for (const match of sourceText.matchAll(pattern.regex)) {
      const amount = amountFromText(match[1]);
      if (!amount || amount < 100000) continue;
      if (seen.has(pattern.kind)) continue;
      seen.add(pattern.kind);
      const sourceContext = contextAround(sourceText, match.index ?? 0, match[0].length);
      const hasOrderSignal = /주\s*문|부과한다|납부기한|납부장소/.test(sourceContext);
      outcomes.push({
        case_id: row.case_id,
        case_no: row.case_no,
        decision_date: row.decision_date,
        penalty_kind: pattern.kind,
        amount_krw: amount,
        amount_text: `${match[1].replace(/\s+/g, "")}원`,
        source_text: sourceContext,
        verification_status: "verified",
        source_confidence: hasOrderSignal ? 0.92 : 0.84,
        metadata: {
          resolver: "scripts/finalize_candidate_statuses.mjs",
          source_column: row.disposition_summary ? "decision_cases.disposition_summary" : "decision_cases.outcome",
          match_pattern: "order_label_amount",
          resolved_at: new Date().toISOString(),
        },
      });
    }
  }
  return outcomes;
}

function upsertOutcomesSql(outcomes) {
  if (outcomes.length === 0) return "select 0::bigint as upserted;";
  return `
with payload as (
  select *
  from jsonb_to_recordset(${sqlJsonLiteral(outcomes)}) as x(
    case_id uuid,
    penalty_kind text,
    amount_krw bigint,
    amount_text text,
    source_text text,
    verification_status text,
    source_confidence numeric,
    metadata jsonb
  )
),
upserted as (
  insert into public.verified_penalty_outcomes (
    case_id,
    penalty_kind,
    amount_krw,
    amount_text,
    source_text,
    verification_status,
    source_confidence,
    metadata
  )
  select
    case_id,
    penalty_kind,
    amount_krw,
    amount_text,
    source_text,
    verification_status,
    source_confidence,
    metadata
  from payload
  on conflict (case_id, penalty_kind) do update
  set amount_krw = excluded.amount_krw,
      amount_text = excluded.amount_text,
      source_text = excluded.source_text,
      verification_status = excluded.verification_status,
      source_confidence = excluded.source_confidence,
      metadata = public.verified_penalty_outcomes.metadata || excluded.metadata,
      updated_at = now()
  returning id
)
select count(*)::bigint as upserted from upserted;
`;
}

function finalizeStatusesSql() {
  return `
with agenda_updated as (
  update public.agenda_items
  set extraction_status = 'verified_official_agenda',
      source_confidence = greatest(coalesce(source_confidence, 0), 0.950),
      metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
        'candidate_resolved_to', 'verified_official_agenda',
        'candidate_resolved_at', now()
      ),
      updated_at = now()
  where extraction_status = 'candidate'
  returning id
),
decision_verified as (
  update public.decision_cases
  set extraction_status = 'verified_document_case',
      source_confidence = greatest(coalesce(source_confidence, 0), 0.820),
      metadata = coalesce(metadata, '{}'::jsonb) - 'candidate_warning' || jsonb_build_object(
        'candidate_resolved_to', 'verified_document_case',
        'candidate_resolved_at', now()
      ),
      updated_at = now()
  where extraction_status = 'candidate'
    and source_document_id is not null
    and nullif(trim(coalesce(title, '')), '') is not null
    and decision_date is not null
  returning id
),
decision_review as (
  update public.decision_cases
  set extraction_status = 'needs_review_source_document',
      metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
        'candidate_resolved_to', 'needs_review_source_document',
        'candidate_resolved_at', now()
      ),
      updated_at = now()
  where extraction_status = 'source_failed'
     or (
       extraction_status = 'candidate'
       and (
         source_document_id is null
         or nullif(trim(coalesce(title, '')), '') is null
         or decision_date is null
       )
     )
  returning id
),
sanctions_updated as (
  update public.sanctions
  set extraction_status = 'verified_order_signal',
      result_status = 'ordered',
      source_confidence = greatest(coalesce(source_confidence, 0), 0.780),
      metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
        'candidate_resolved_to', 'verified_order_signal',
        'candidate_resolved_at', now()
      ),
      updated_at = now()
  where extraction_status = 'candidate'
    and sanction_kind in ('과태료', '과징금', '시정명령', '주의', '개선권고', '공표명령', '고발', '징계권고', '경고', '수사의뢰')
  returning id
),
money_verified as (
  update public.monetary_penalties mp
  set extraction_status = 'verified_final_amount',
      penalty_kind = vpo.penalty_kind,
      source_confidence = greatest(coalesce(mp.source_confidence, 0), 0.900),
      metadata = coalesce(mp.metadata, '{}'::jsonb) - 'candidate_warning' || jsonb_build_object(
        'candidate_resolved_to', 'verified_final_amount',
        'verified_penalty_outcome_id', vpo.id,
        'candidate_resolved_at', now()
      ),
      updated_at = now()
  from public.verified_penalty_outcomes vpo
  where mp.case_id = vpo.case_id
    and mp.amount_krw = vpo.amount_krw
    and mp.extraction_status = 'candidate'
  returning mp.id
),
money_review as (
  update public.monetary_penalties mp
  set extraction_status = case
        when mp.penalty_kind = '금액후보' then 'needs_review_role_classification'
        when coalesce(mp.calculation_basis, mp.metadata ->> 'source_context', '') ~ '(환율|단위 미만|기준금액|조정|평균환율|위반기간|매출|유출|정보주체|제[0-9]+조|§)'
          then 'excluded_context_amount'
        else 'needs_review_not_final_amount'
      end,
      penalty_kind = case
        when mp.penalty_kind = '금액후보' then '역할미분류금액'
        else mp.penalty_kind
      end,
      source_confidence = case
        when coalesce(mp.calculation_basis, mp.metadata ->> 'source_context', '') ~ '(환율|단위 미만|기준금액|조정|평균환율|위반기간|매출|유출|정보주체|제[0-9]+조|§)'
          then 0.200
        else least(coalesce(mp.source_confidence, 0.45), 0.500)
      end,
      metadata = coalesce(mp.metadata, '{}'::jsonb) - 'candidate_warning' || jsonb_build_object(
        'candidate_resolved_to',
        case
          when mp.penalty_kind = '금액후보' then 'needs_review_role_classification'
          when coalesce(mp.calculation_basis, mp.metadata ->> 'source_context', '') ~ '(환율|단위 미만|기준금액|조정|평균환율|위반기간|매출|유출|정보주체|제[0-9]+조|§)'
            then 'excluded_context_amount'
          else 'needs_review_not_final_amount'
        end,
        'candidate_resolved_at', now()
      ),
      updated_at = now()
  where mp.extraction_status = 'candidate'
    and not exists (
      select 1
      from public.verified_penalty_outcomes vpo
      where vpo.case_id = mp.case_id
        and vpo.amount_krw = mp.amount_krw
    )
  returning mp.id
),
law_updated as (
  update public.law_citations
  set extraction_status = case
        when verification_status = 'pending' then 'extracted_pending_mcp'
        when verification_status = 'needs_review' then 'mcp_checked'
        else extraction_status
      end,
      metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
        'candidate_resolved_to',
        case
          when verification_status = 'pending' then 'extracted_pending_mcp'
          when verification_status = 'needs_review' then 'mcp_checked'
          else extraction_status
        end,
        'candidate_resolved_at', now()
      ),
      updated_at = now()
  where extraction_status = 'candidate'
  returning id
),
utterance_tags_updated as (
  update public.utterance_tendency_tags
  set extraction_status = 'auto_tagged_rule_based'
  where extraction_status = 'candidate'
  returning id
),
commissioner_stats_updated as (
  update public.commissioner_tendency_stats
  set extraction_status = 'auto_aggregated_rule_based'
  where extraction_status = 'candidate'
  returning commissioner_id
)
select
  (select count(*) from agenda_updated)::bigint as agenda_items,
  (select count(*) from decision_verified)::bigint as decision_cases_verified,
  (select count(*) from decision_review)::bigint as decision_cases_review,
  (select count(*) from sanctions_updated)::bigint as sanctions,
  (select count(*) from money_verified)::bigint as money_verified,
  (select count(*) from money_review)::bigint as money_review_or_excluded,
  (select count(*) from law_updated)::bigint as law_citations,
  (select count(*) from utterance_tags_updated)::bigint as utterance_tags,
  (select count(*) from commissioner_stats_updated)::bigint as commissioner_stats;
`;
}

function makeMarkdownTable(headers, rows) {
  if (!rows || rows.length === 0) return "_없음_\n";
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${headers.map((header) => String(row[header] ?? "").replace(/\|/g, "\\|")).join(" | ")} |`),
    "",
  ].join("\n");
}

async function main() {
  const before = await supabaseSql("status_before", statusSummarySql());
  const cases = await supabaseSql("decision_cases", decisionCasesSql());
  const outcomes = cases.flatMap(extractOutcomesFromCase);

  writeCsv(outcomesCsvPath, outcomes.map((row) => ({
    case_id: row.case_id,
    case_no: row.case_no,
    decision_date: row.decision_date,
    penalty_kind: row.penalty_kind,
    amount_krw: row.amount_krw,
    amount_text: row.amount_text,
    source_confidence: row.source_confidence,
    source_text: row.source_text,
  })), ["case_id", "case_no", "decision_date", "penalty_kind", "amount_krw", "amount_text", "source_confidence", "source_text"]);

  let upsertResult = [];
  let finalizeResult = [];
  if (shouldUpload) {
    upsertResult = await supabaseSql("upsert_outcomes", upsertOutcomesSql(outcomes));
    finalizeResult = await supabaseSql("finalize_statuses", finalizeStatusesSql());
  }
  const after = await supabaseSql("status_after", statusSummarySql());

  const report = [
    "# Candidate Resolution Report",
    "",
    `- generated_at: ${new Date().toISOString()}`,
    `- mode: ${shouldUpload ? "upload" : "dry-run"}`,
    `- parsed_verified_penalty_outcomes: ${outcomes.length}`,
    `- outcomes_csv: ${path.relative(ROOT, outcomesCsvPath).replace(/\\/g, "/")}`,
    "",
    "## Upload Result",
    "",
    makeMarkdownTable(Object.keys(upsertResult[0] ?? { upserted: "" }), upsertResult),
    makeMarkdownTable(Object.keys(finalizeResult[0] ?? { agenda_items: "" }), finalizeResult),
    "## Status Before",
    "",
    makeMarkdownTable(["table_name", "status", "rows"], before),
    "## Status After",
    "",
    makeMarkdownTable(["table_name", "status", "rows"], after),
    "## Notes",
    "",
    "- `candidate` 상태는 확정 가능한 경우 `verified_*`로, 자동 분류값은 `auto_*`로, 최종액이 아닌 숫자는 `excluded_context_amount` 또는 `needs_review_*`로 전환합니다.",
    "- 금액 통계의 확정 원천은 `verified_penalty_outcomes`입니다. 기존 `monetary_penalties`는 원문 숫자 흔적 보존 및 검토용으로 유지합니다.",
    "- `needs_review_*`는 사람이 볼 필요가 있는 잔여 항목이며 후보 상태는 아닙니다.",
    "",
  ].join("\n");

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, report, "utf8");
  console.log(`Parsed outcomes: ${outcomes.length}`);
  console.log(`Report: ${reportPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
