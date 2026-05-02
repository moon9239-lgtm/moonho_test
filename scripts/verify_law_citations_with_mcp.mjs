import fs from "node:fs";
import path from "node:path";
import { DOMParser } from "../pipc_minutes_crawler/node_modules/@xmldom/xmldom/lib/index.js";
import { LawApiClient } from "../pipc_minutes_crawler/node_modules/korean-law-mcp/build/lib/api-client.js";
import { buildJO } from "../pipc_minutes_crawler/node_modules/korean-law-mcp/build/lib/law-parser.js";
import { formatArticleUnit, parseHangNumber } from "../pipc_minutes_crawler/node_modules/korean-law-mcp/build/lib/article-parser.js";

const ROOT = process.cwd();
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "yfrjdbsaulawwqmuozao";
const SUPABASE_API_BASE = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const LAW_API_BASE = "https://www.law.go.kr/DRF";

const args = new Set(process.argv.slice(2));
const shouldUpload = args.has("--upload");
const shouldDryRun = args.has("--dry-run");
const allDates = args.has("--all-dates");
const includeReviewed = args.has("--include-reviewed");
const groupLimit = numberArg("--limit-groups", Number(process.env.LAW_VERIFY_GROUP_LIMIT || 10));
const maxDatesPerGroup = allDates ? Infinity : numberArg("--max-dates", Number(process.env.LAW_VERIFY_MAX_DATES_PER_GROUP || 3));

const reportPath = path.join(ROOT, "pipc_knowledge_base", "00_indexes", "law_mcp_verification_report.md");
const outDir = path.join(ROOT, "pipc_knowledge_base", "90_normalized_data");
const queuePath = path.join(outDir, "law_mcp_verification_queue.csv");
const resultsPath = path.join(outDir, "law_mcp_verification_results.csv");

const lawSearchCache = new Map();
const lawHistoryCache = new Map();
const lawDataCache = new Map();

function numberArg(name, fallback) {
  const match = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (!match) return fallback;
  const value = Number(match.split("=")[1]);
  return Number.isFinite(value) ? value : fallback;
}

function compact(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function stripSpaces(value) {
  return compact(value).replace(/\s+/g, "");
}

function formatDateForLawApi(value) {
  const text = String(value ?? "").replace(/[^0-9]/g, "");
  return text.length === 8 ? text : undefined;
}

function sqlDate(value) {
  const text = String(value ?? "");
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
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
  fs.writeFileSync(filePath, `${body}\n`, "utf8");
}

function sqlJsonLiteral(rows) {
  const tag = `law_verify_${Math.random().toString(16).slice(2)}`;
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
    const debugPath = path.join(ROOT, ".tmp_last_supabase_query.sql");
    fs.writeFileSync(debugPath, sql, "utf8");
    throw new Error(`${label} failed (${response.status}): ${body}\nQuery written to ${debugPath}`);
  }

  if (!body.trim()) return [];
  return JSON.parse(body);
}

async function lawApiText(endpoint, params) {
  const url = `${LAW_API_BASE}/${endpoint}?${new URLSearchParams(params).toString()}`;
  const response = await fetch(url);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`law.go.kr ${endpoint} failed (${response.status})`);
  }
  return text;
}

async function cachedLawChoice(apiClient, apiKey, lawName) {
  const key = `${lawName}|${apiKey ? "with-key" : "no-key"}`;
  if (lawSearchCache.has(key)) return lawSearchCache.get(key);
  const lawSearchXml = await apiClient.searchLaw(lawName, apiKey, 100);
  const lawChoice = chooseLawFromSearchXml(lawSearchXml, lawName);
  lawSearchCache.set(key, lawChoice);
  return lawChoice;
}

async function cachedHistories(apiKey, lawName) {
  const key = `${lawName}|${apiKey ? "with-key" : "no-key"}`;
  if (lawHistoryCache.has(key)) return lawHistoryCache.get(key);
  const html = await lawApiText("lawSearch.do", {
    OC: apiKey,
    target: "lsHistory",
    type: "HTML",
    query: lawName,
    display: "100",
    sort: "efdes",
  });
  const histories = parseHistoryHtml(html, lawName);
  lawHistoryCache.set(key, histories);
  return histories;
}

function pendingRowsSql() {
  return `
select
  id::text as citation_id,
  coalesce(law_name_raw, '') as law_name_raw,
  article_raw,
  time_basis_date::text as time_basis_date,
  source_id::text as decision_case_id
from public.law_citations
where source_type = 'decision_case'
  and ${includeReviewed ? "verification_status <> 'verified'" : "verification_status = 'pending'"}
  and nullif(trim(coalesce(article_raw, '')), '') is not null
order by created_at, id;
`;
}

function coverageSql() {
  return `
select verification_status, citation_count, decision_case_count, distinct_article_raw_count
from public.dashboard_law_verification_coverage
order by verification_status;
`;
}

function normalizeLawName(rawName) {
  const raw = compact(rawName);
  const squashed = stripSpaces(raw);
  if (!raw) return { lawName: "개인정보 보호법", method: "inferred_default_pipa", status: "candidate" };
  if (["개인정보보호법", "舊개인정보보호법", "(구)개인정보보호법"].includes(squashed)) {
    return { lawName: "개인정보 보호법", method: "normalized_alias", status: "candidate" };
  }
  if (raw.includes("안내서")) return { lawName: raw, method: "source_text", status: "skip_non_law_reference" };
  if (raw.includes("부과기준") || raw.includes("공표명령 지침") || raw.includes("표준 개인정보 보호지침")) {
    return { lawName: raw, method: "source_text", status: "needs_admin_rule_pass" };
  }
  return { lawName: raw.replace(/^舊\s*/, "").replace(/^\(구\)/, "").trim(), method: "source_text", status: "candidate" };
}

function parseArticleRaw(articleRaw) {
  const text = compact(articleRaw).replace(/\s+/g, "");
  const baseMatch = text.match(/^제(\d+)조(?:의(\d+))?/);
  if (!baseMatch) return null;
  const baseArticle = `제${baseMatch[1]}조${baseMatch[2] ? `의${baseMatch[2]}` : ""}`;
  const hangMatch = text.match(/제(\d+)항/);
  const hoMatch = text.match(/제(\d+)호/);
  const mokMatch = text.match(/제(\d+)목/);
  return {
    raw: text,
    articleNumber: Number(baseMatch[1]),
    articleBranch: baseMatch[2] ? Number(baseMatch[2]) : 0,
    baseArticle,
    hang: hangMatch ? Number(hangMatch[1]) : null,
    ho: hoMatch ? Number(hoMatch[1]) : null,
    mok: mokMatch ? Number(mokMatch[1]) : null,
    joCode: buildJO(baseArticle),
  };
}

function groupCandidates(rows) {
  const groups = new Map();
  for (const row of rows) {
    const normalized = normalizeLawName(row.law_name_raw);
    const article = parseArticleRaw(row.article_raw);
    if (!article) continue;
    const key = `${normalized.lawName}|${article.raw}|${normalized.method}`;
    if (!groups.has(key)) {
      groups.set(key, {
        normalized_law_name: normalized.lawName,
        law_name_resolution_method: normalized.method,
        normalization_status: normalized.status,
        article_raw: article.raw,
        base_article: article.baseArticle,
        jo_code: article.joCode,
        hang: article.hang,
        ho: article.ho,
        mok: article.mok,
        citation_count: 0,
        decision_case_ids: new Set(),
        raw_law_names: new Set(),
        dateBuckets: new Map(),
        articleNumber: article.articleNumber,
        articleBranch: article.articleBranch,
      });
    }
    const group = groups.get(key);
    group.citation_count += 1;
    if (row.decision_case_id) group.decision_case_ids.add(row.decision_case_id);
    if (compact(row.law_name_raw)) group.raw_law_names.add(compact(row.law_name_raw));
    const dateKey = sqlDate(row.time_basis_date) ?? "current";
    if (!group.dateBuckets.has(dateKey)) {
      group.dateBuckets.set(dateKey, { time_basis_date: dateKey, citation_ids: [] });
    }
    group.dateBuckets.get(dateKey).citation_ids.push(row.citation_id);
  }

  return [...groups.values()]
    .sort((a, b) => b.citation_count - a.citation_count || a.article_raw.localeCompare(b.article_raw))
    .slice(0, groupLimit);
}

function selectDates(group) {
  const buckets = [...group.dateBuckets.values()].sort((a, b) => {
    if (a.time_basis_date === "current") return 1;
    if (b.time_basis_date === "current") return -1;
    return a.time_basis_date.localeCompare(b.time_basis_date);
  });
  if (buckets.length <= maxDatesPerGroup) return buckets;
  if (maxDatesPerGroup <= 1) return [buckets[buckets.length - 1]];
  if (maxDatesPerGroup === 2) return [buckets[0], buckets[buckets.length - 1]];

  const selected = new Map();
  selected.set(buckets[0].time_basis_date, buckets[0]);
  selected.set(buckets[Math.floor(buckets.length / 2)].time_basis_date, buckets[Math.floor(buckets.length / 2)]);
  selected.set(buckets[buckets.length - 1].time_basis_date, buckets[buckets.length - 1]);
  for (const bucket of buckets) {
    if (selected.size >= maxDatesPerGroup) break;
    selected.set(bucket.time_basis_date, bucket);
  }
  return [...selected.values()].sort((a, b) => a.time_basis_date.localeCompare(b.time_basis_date));
}

function chooseLawFromSearchXml(xmlText, targetName) {
  const doc = new DOMParser().parseFromString(xmlText, "text/xml");
  const laws = [...doc.getElementsByTagName("law")];
  if (laws.length === 0) return null;
  const targetSquashed = stripSpaces(targetName);
  const rows = laws.map((law) => ({
    lawName: law.getElementsByTagName("법령명한글")[0]?.textContent || "",
    lawId: law.getElementsByTagName("법령ID")[0]?.textContent || "",
    mst: law.getElementsByTagName("법령일련번호")[0]?.textContent || "",
    promulgationDate: law.getElementsByTagName("공포일자")[0]?.textContent || "",
    lawType: law.getElementsByTagName("법령구분명")[0]?.textContent || "",
  }));
  return rows.find((row) => stripSpaces(row.lawName) === targetSquashed) ?? rows[0];
}

function parseHistoryHtml(html, targetLawName) {
  const histories = [];
  const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
  for (const row of rows) {
    const linkMatch = row.match(/MST=(\d+)[^"]*efYd=(\d*)/);
    if (!linkMatch) continue;
    const lawNmMatch = row.match(/<a[^>]+>([^<]+)<\/a>/);
    const lawNm = compact(lawNmMatch?.[1] ?? "");
    if (!lawNm) continue;

    const normalizedTarget = stripSpaces(targetLawName);
    const normalizedLaw = stripSpaces(lawNm);
    const targetHasSubLaw = targetLawName.includes("시행령") || targetLawName.includes("시행규칙");
    const lawHasSubLaw = lawNm.includes("시행령") || lawNm.includes("시행규칙");
    if (!targetHasSubLaw && lawHasSubLaw) continue;
    if (normalizedLaw !== normalizedTarget) continue;

    const ancNoMatch = row.match(/제\s*(\d+)\s*호/);
    const dateCells = row.match(/<td[^>]*>(\d{4}[.\-]?\d{2}[.\-]?\d{2})<\/td>/g) || [];
    let ancYd = "";
    if (dateCells[0]) {
      const dateMatch = dateCells[0].match(/(\d{4})[.\-]?(\d{2})[.\-]?(\d{2})/);
      if (dateMatch) ancYd = `${dateMatch[1]}${dateMatch[2]}${dateMatch[3]}`;
    }
    const rrClsMatch = row.match(/(제정|일부개정|전부개정|폐지|타법개정|타법폐지|일괄개정|일괄폐지)/);
    histories.push({
      mst: linkMatch[1],
      efYd: linkMatch[2] || "",
      ancNo: ancNoMatch?.[1] || "",
      ancYd,
      lawNm,
      rrCls: rrClsMatch?.[1] || "",
    });
  }
  return histories.sort((a, b) => Number(b.efYd || 0) - Number(a.efYd || 0));
}

async function resolveMstForDate(apiClient, apiKey, lawName, basisDate, fallbackMst) {
  const dateText = formatDateForLawApi(basisDate);
  if (!dateText) return { mst: fallbackMst, status: "current_mst_no_basis_date" };
  try {
    const histories = await cachedHistories(apiKey, lawName);
    const selected = histories.find((entry) => entry.efYd && entry.efYd <= dateText) ?? histories.at(-1);
    if (selected?.mst) return { mst: selected.mst, status: "historical_mst_by_effective_date", effective_yyyymmdd: selected.efYd };
    return { mst: fallbackMst, status: "current_mst_no_history_match" };
  } catch (error) {
    return {
      mst: fallbackMst,
      status: "current_mst_history_api_error",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function getLawDataByMst(apiClient, apiKey, mst) {
  const key = `${mst}|${apiKey ? "with-key" : "no-key"}`;
  if (lawDataCache.has(key)) return lawDataCache.get(key);
  const responseText = await apiClient.fetchApi({
    endpoint: "lawService.do",
    target: "law",
    type: "JSON",
    extraParams: { MST: mst },
    apiKey,
  });
  const parsed = JSON.parse(responseText);
  const lawData = parsed?.법령 ?? null;
  lawDataCache.set(key, lawData);
  return lawData;
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function getArticleUnits(lawData) {
  return asArray(lawData?.조문?.조문단위).filter((unit) => unit?.조문여부 === "조문");
}

function getArticleUnit(lawData, group) {
  const units = getArticleUnits(lawData);
  return units.find((unit) => {
    const articleNo = Number(unit?.조문번호 ?? unit?.조번호 ?? 0);
    const branchNo = Number(unit?.조문가지번호 ?? 0);
    return articleNo === group.articleNumber && branchNo === group.articleBranch;
  }) ?? null;
}

function getArticleTitle(unit) {
  return compact(unit?.조문제목 ?? "");
}

function hasHang(unit, hang) {
  if (!hang) return true;
  const hangs = asArray(unit?.항);
  return hangs.some((item) => parseHangNumber(item?.항번호 ?? "") === hang);
}

function formatArticleText(unit) {
  const formatted = formatArticleUnit(unit);
  if (!formatted) return compact(unit?.조문내용 ?? "");
  if (typeof formatted === "string") return formatted;
  return [formatted.header, formatted.body].filter(Boolean).join("\n").trim();
}

function extractBasicInfo(lawData) {
  const basic = lawData?.기본정보 ?? lawData ?? {};
  const textValue = (value) => {
    if (value == null) return "";
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (typeof value === "object") {
      return compact(value.content ?? value._text ?? value.소관부처명 ?? value.기관명 ?? value.명칭 ?? "");
    }
    return "";
  };
  return {
    lawName: textValue(basic.법령명_한글 || basic.법령명한글 || basic.법령명),
    lawId: textValue(basic.법령ID),
    mst: textValue(basic.법령일련번호),
    promulgationDate: textValue(basic.공포일자),
    effectiveDate: textValue(basic.시행일자 || basic.최종시행일자),
    revisionType: textValue(basic.제개정구분명 || basic.제개정구분),
    ministry: textValue(basic.소관부처명 || basic.소관부처),
  };
}

function yyyymmddToDate(value) {
  const text = String(value ?? "").replace(/[^0-9]/g, "");
  if (text.length !== 8) return null;
  return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
}

async function verifyOne(apiClient, apiKey, group, bucket) {
  if (group.normalization_status !== "candidate") {
    return {
      ...baseResult(group, bucket),
      verification_status: "needs_review",
      note: group.normalization_status,
      citation_ids: bucket.citation_ids,
    };
  }

  const lawChoice = await cachedLawChoice(apiClient, apiKey, group.normalized_law_name);
  if (!lawChoice) {
    return {
      ...baseResult(group, bucket),
      verification_status: "not_found",
      note: "law_not_found",
      citation_ids: bucket.citation_ids,
    };
  }

  const mstResolution = await resolveMstForDate(apiClient, apiKey, group.normalized_law_name, bucket.time_basis_date, lawChoice.mst);
  const lawData = await getLawDataByMst(apiClient, apiKey, mstResolution.mst);
  const unit = getArticleUnit(lawData, group);
  const basic = extractBasicInfo(lawData);
  if (!lawData || !unit) {
    const inferredDefault = group.law_name_resolution_method === "inferred_default_pipa";
    return {
      ...baseResult(group, bucket),
      resolved_law_name: lawChoice.lawName,
      law_api_id: lawChoice.lawId,
      verification_status: inferredDefault ? "needs_review" : "not_found",
      note: inferredDefault ? "article_not_found_in_inferred_default_pipa" : "article_not_found",
      citation_ids: bucket.citation_ids,
    };
  }

  const paragraphOk = hasHang(unit, group.hang);
  const articleText = formatArticleText(unit);
  const basisYmd = formatDateForLawApi(bucket.time_basis_date);
  const effectiveYmd = String(basic.effectiveDate ?? "").replace(/[^0-9]/g, "");
  const timeSpecificOk = mstResolution.status === "historical_mst_by_effective_date"
    || !basisYmd
    || (effectiveYmd.length === 8 && effectiveYmd <= basisYmd);
  const verifiedStatus = paragraphOk && timeSpecificOk ? "verified" : "partially_verified";
  const note = paragraphOk
    ? (timeSpecificOk ? "article_verified_by_korean_law_mcp" : "article_verified_current_mst_only_time_needs_review")
    : "base_article_verified_but_paragraph_not_found";
  return {
    ...baseResult(group, bucket),
    resolved_law_name: basic.lawName || lawChoice.lawName,
    law_api_id: basic.lawId || lawChoice.lawId,
    law_type: lawChoice.lawType || "law",
    ministry: basic.ministry,
    mst: basic.mst || mstResolution.mst || lawChoice.mst,
    promulgation_date: yyyymmddToDate(basic.promulgationDate || lawChoice.promulgationDate),
    effective_date: yyyymmddToDate(basic.effectiveDate) || sqlDate(bucket.time_basis_date),
    revision_type: basic.revisionType,
    article_title: getArticleTitle(unit),
    article_text: articleText,
    verification_status: verifiedStatus,
    note,
    citation_ids: bucket.citation_ids,
    source_payload: {
      law_choice: lawChoice,
      basic_info: basic,
      requested_efYd: formatDateForLawApi(bucket.time_basis_date) ?? null,
      requested_jo: group.jo_code,
      resolved_mst: mstResolution.mst,
      mst_resolution: mstResolution,
    },
  };
}

function baseResult(group, bucket) {
  return {
    normalized_law_name: group.normalized_law_name,
    law_name_resolution_method: group.law_name_resolution_method,
    raw_law_names: [...group.raw_law_names],
    article_raw: group.article_raw,
    base_article: group.base_article,
    jo_code: group.jo_code,
    hang: group.hang,
    ho: group.ho,
    mok: group.mok,
    time_basis_date: bucket.time_basis_date === "current" ? null : bucket.time_basis_date,
    citation_count: bucket.citation_ids.length,
  };
}

function upsertVerifiedSql(result) {
  return `
with payload as (
  select *
  from jsonb_to_recordset(${sqlJsonLiteral([result])}) as x(
    normalized_law_name text,
    resolved_law_name text,
    law_api_id text,
    law_type text,
    ministry text,
    mst text,
    promulgation_date date,
    effective_date date,
    revision_type text,
    article_raw text,
    base_article text,
    article_title text,
    article_text text,
    verification_status text,
    note text,
    source_payload jsonb,
    law_name_resolution_method text,
    raw_law_names jsonb,
    jo_code text,
    time_basis_date date,
    citation_ids jsonb
  )
),
law_row as (
  insert into public.laws (law_name, law_api_id, law_type, ministry, metadata)
  select
    coalesce(nullif(resolved_law_name, ''), normalized_law_name),
    nullif(law_api_id, ''),
    nullif(law_type, ''),
    nullif(ministry, ''),
    jsonb_build_object('source', 'korean-law-mcp')
  from payload
  on conflict (law_name) do update
  set law_api_id = coalesce(excluded.law_api_id, public.laws.law_api_id),
      law_type = coalesce(excluded.law_type, public.laws.law_type),
      ministry = coalesce(excluded.ministry, public.laws.ministry),
      metadata = public.laws.metadata || excluded.metadata,
      updated_at = now()
  returning id
),
article_row as (
  insert into public.law_articles (law_id, article_no, article_title, canonical_article, metadata)
  select
    law_row.id,
    base_article,
    nullif(article_title, ''),
    article_raw,
    jsonb_build_object('jo_code', jo_code)
  from payload, law_row
  on conflict (law_id, article_no) do update
  set article_title = coalesce(excluded.article_title, public.law_articles.article_title),
      canonical_article = excluded.canonical_article,
      metadata = public.law_articles.metadata || excluded.metadata,
      updated_at = now()
  returning id
),
version_row as (
  insert into public.law_versions (law_id, mst, promulgation_date, effective_date, revision_type, source_api, source_payload)
  select
    law_row.id,
    coalesce(nullif(mst, ''), concat(coalesce(nullif(law_api_id, ''), 'unknown'), ':', coalesce(effective_date::text, 'current'))),
    promulgation_date,
    effective_date,
    nullif(revision_type, ''),
    'korean-law-mcp',
    source_payload
  from payload, law_row
  on conflict (law_id, mst) do update
  set promulgation_date = coalesce(excluded.promulgation_date, public.law_versions.promulgation_date),
      effective_date = coalesce(excluded.effective_date, public.law_versions.effective_date),
      revision_type = coalesce(excluded.revision_type, public.law_versions.revision_type),
      source_payload = excluded.source_payload
  returning id
),
article_version_row as (
  insert into public.law_article_versions (
    law_article_id,
    law_version_id,
    article_title,
    article_text,
    mcp_status,
    checked_at,
    metadata
  )
  select
    article_row.id,
    version_row.id,
    nullif(article_title, ''),
    article_text,
    verification_status,
    now(),
    jsonb_build_object('note', note)
  from payload, article_row, version_row
  on conflict (law_article_id, law_version_id) do update
  set article_title = coalesce(excluded.article_title, public.law_article_versions.article_title),
      article_text = excluded.article_text,
      mcp_status = excluded.mcp_status,
      checked_at = now(),
      metadata = public.law_article_versions.metadata || excluded.metadata,
      updated_at = now()
  returning id
),
citation_ids as (
  select (value #>> '{}')::uuid as id
  from payload, jsonb_array_elements(payload.citation_ids)
),
updated as (
  update public.law_citations lc
  set law_article_id = article_row.id,
      law_article_version_id = article_version_row.id,
      verification_status = case
        when payload.verification_status = 'verified' then 'verified'
        else 'needs_review'
      end,
      extraction_status = 'mcp_checked',
      source_confidence = case when payload.verification_status = 'verified' then 0.900 else 0.650 end,
      metadata = lc.metadata || jsonb_build_object(
        'mcp_status', payload.verification_status,
        'mcp_note', payload.note,
        'law_name_resolution_method', payload.law_name_resolution_method,
        'raw_law_names', payload.raw_law_names,
        'verified_at', now()
      ),
      updated_at = now()
  from payload, article_row, article_version_row, citation_ids
  where lc.id = citation_ids.id
  returning lc.id
)
select count(*)::int as updated_count from updated;
`;
}

function updateNonVerifiedSql(result) {
  return `
with payload as (
  select *
  from jsonb_to_recordset(${sqlJsonLiteral([result])}) as x(
    verification_status text,
    note text,
    normalized_law_name text,
    law_name_resolution_method text,
    raw_law_names jsonb,
    citation_ids jsonb
  )
),
citation_ids as (
  select (value #>> '{}')::uuid as id
  from payload, jsonb_array_elements(payload.citation_ids)
),
updated as (
  update public.law_citations lc
  set verification_status = case
        when payload.verification_status = 'not_found' then 'not_found'
        else 'needs_review'
      end,
      extraction_status = 'mcp_checked',
      source_confidence = 0.300,
      metadata = lc.metadata || jsonb_build_object(
        'mcp_status', payload.verification_status,
        'mcp_note', payload.note,
        'normalized_law_name', payload.normalized_law_name,
        'law_name_resolution_method', payload.law_name_resolution_method,
        'raw_law_names', payload.raw_law_names,
        'verified_at', now()
      ),
      updated_at = now()
  from payload, citation_ids
  where lc.id = citation_ids.id
  returning lc.id
)
select count(*)::int as updated_count from updated;
`;
}

function makeMarkdownTable(headers, rows) {
  if (!rows.length) return "_없음_\n";
  const escapeCell = (value) => String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, "<br>");
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${headers.map((header) => escapeCell(row[header])).join(" | ")} |`),
  ].join("\n") + "\n";
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });

  const apiKey = process.env.LAW_OC || process.env.KOREAN_LAW_API_KEY || "";
  const rows = await supabaseSql("pending_rows", pendingRowsSql());
  const groups = groupCandidates(rows);
  const queueRows = groups.map((group) => ({
    normalized_law_name: group.normalized_law_name,
    article_raw: group.article_raw,
    law_name_resolution_method: group.law_name_resolution_method,
    normalization_status: group.normalization_status,
    citation_count: group.citation_count,
    decision_case_count: group.decision_case_ids.size,
    basis_date_count: group.dateBuckets.size,
    selected_date_count: selectDates(group).length,
    raw_law_names: [...group.raw_law_names].join("; "),
  }));
  writeCsv(queuePath, queueRows, [
    "normalized_law_name",
    "article_raw",
    "law_name_resolution_method",
    "normalization_status",
    "citation_count",
    "decision_case_count",
    "basis_date_count",
    "selected_date_count",
    "raw_law_names",
  ]);

  if (shouldDryRun || !shouldUpload) {
    await writeReport({
      groups,
      results: [],
      coverage: await supabaseSql("coverage", coverageSql()),
      mode: shouldDryRun ? "dry-run" : "queue-only",
      apiKeyPresent: Boolean(apiKey),
    });
    console.log(`Pending rows: ${rows.length}`);
    console.log(`Groups selected: ${groups.length}`);
    console.log(`Queue: ${queuePath}`);
    console.log(`Report: ${reportPath}`);
    if (!apiKey) console.log("LAW_OC or KOREAN_LAW_API_KEY is not set.");
    return;
  }

  if (!apiKey) {
    throw new Error("LAW_OC or KOREAN_LAW_API_KEY is required for --upload.");
  }

  const apiClient = new LawApiClient({ apiKey });
  const results = [];
  for (const [index, group] of groups.entries()) {
    const buckets = selectDates(group);
    console.log(`[${index + 1}/${groups.length}] ${group.normalized_law_name} ${group.article_raw} dates=${buckets.length}`);
    for (const bucket of buckets) {
      try {
        const result = await verifyOne(apiClient, apiKey, group, bucket);
        results.push(result);
        if (result.verification_status === "verified" || result.verification_status === "partially_verified") {
          await supabaseSql("upsert_verified", upsertVerifiedSql(result));
        } else {
          await supabaseSql("update_non_verified", updateNonVerifiedSql(result));
        }
      } catch (error) {
        const result = {
          ...baseResult(group, bucket),
          verification_status: "api_error",
          note: error instanceof Error ? error.message : String(error),
          citation_ids: bucket.citation_ids,
        };
        results.push(result);
        await supabaseSql("update_api_error", updateNonVerifiedSql(result));
      }
    }
  }

  writeCsv(resultsPath, results.map((row) => ({
    normalized_law_name: row.normalized_law_name,
    resolved_law_name: row.resolved_law_name,
    article_raw: row.article_raw,
    base_article: row.base_article,
    time_basis_date: row.time_basis_date,
    citation_count: row.citation_count,
    verification_status: row.verification_status,
    note: row.note,
    mst: row.mst,
    effective_date: row.effective_date,
    article_title: row.article_title,
  })), [
    "normalized_law_name",
    "resolved_law_name",
    "article_raw",
    "base_article",
    "time_basis_date",
    "citation_count",
    "verification_status",
    "note",
    "mst",
    "effective_date",
    "article_title",
  ]);

  await writeReport({
    groups,
    results,
    coverage: await supabaseSql("coverage", coverageSql()),
    mode: "upload",
    apiKeyPresent: true,
  });
  console.log(`Results: ${resultsPath}`);
  console.log(`Report: ${reportPath}`);
}

async function writeReport({ groups, results, coverage, mode, apiKeyPresent }) {
  const resultSummary = new Map();
  for (const result of results) {
    resultSummary.set(result.verification_status, (resultSummary.get(result.verification_status) ?? 0) + result.citation_count);
  }
  const resultRows = [...resultSummary.entries()]
    .map(([status, citation_count]) => ({ status, citation_count }))
    .sort((a, b) => b.citation_count - a.citation_count);

  const topQueueRows = groups.slice(0, 20).map((group) => ({
    law: group.normalized_law_name,
    article: group.article_raw,
    method: group.law_name_resolution_method,
    citations: group.citation_count,
    cases: group.decision_case_ids.size,
    dates: group.dateBuckets.size,
    selected_dates: selectDates(group).length,
  }));

  const report = [
    "# Korean Law MCP Verification Report",
    "",
    `- generated_at: ${new Date().toISOString()}`,
    `- mode: ${mode}`,
    `- api_key_present: ${apiKeyPresent ? "yes" : "no"}`,
    `- selected_groups: ${groups.length}`,
    `- include_reviewed: ${includeReviewed ? "yes" : "no"}`,
    `- max_dates_per_group: ${Number.isFinite(maxDatesPerGroup) ? maxDatesPerGroup : "all"}`,
    "",
    "## Selected Queue",
    "",
    makeMarkdownTable(["law", "article", "method", "citations", "cases", "dates", "selected_dates"], topQueueRows),
    "## This Run Results",
    "",
    makeMarkdownTable(["status", "citation_count"], resultRows),
    "## Current DB Coverage",
    "",
    makeMarkdownTable(["verification_status", "citation_count", "decision_case_count", "distinct_article_raw_count"], coverage),
    "## Notes",
    "",
    "- 빈 법령명은 PIPC 결정문 관용 표현상 `개인정보 보호법`으로 추정합니다.",
    "- 추정 법령에서 조문을 찾지 못한 경우는 확정 부재가 아니라 `needs_review`로 남깁니다.",
    "- 연혁법령 조회는 `korean-law-mcp`의 법제처 클라이언트를 사용하되, `lsHistory`가 HTML 전용 API라 해당 응답만 직접 파싱합니다.",
    "- `--max-dates` 기본값은 3이라, 첫 패스는 최초/중간/최신 시점을 우선 검증합니다.",
    "- 전체 시점 검증은 `--all-dates --upload`로 재실행하면 됩니다.",
    "- 행정규칙/고시/지침 계열은 별도 admin-rule 패스로 분리하는 것이 안전합니다.",
    "",
  ].join("\n");
  fs.writeFileSync(reportPath, report, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
