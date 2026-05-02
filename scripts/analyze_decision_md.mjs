import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const manifestPath = path.join(ROOT, "pipc_knowledge_base", "99_raw", "decisions", "_manifest.csv");
const decisionsPath = path.join(ROOT, "pipc_committee_decisions_crawler", "data", "decisions.csv");
const outDir = path.join(ROOT, "pipc_knowledge_base", "90_normalized_data");
const indexDir = path.join(ROOT, "pipc_knowledge_base", "00_indexes");
const csvOutPath = path.join(outDir, "decision_document_signals.csv");
const reportOutPath = path.join(indexDir, "decision_document_signal_report.md");

const sanctionKeywords = [
  "시정명령",
  "과징금",
  "과태료",
  "공표명령",
  "개선권고",
  "고발",
  "경고",
  "주의",
  "원안의결",
  "수사의뢰",
  "감경",
  "부과",
  "징계권고",
];

const lawHintPattern = /「([^」]{2,80})」/g;
const articlePattern = /제\s*\d+\s*조(?:\s*의\s*\d+)?(?:\s*제\s*\d+\s*항)?(?:\s*제\s*\d+\s*호)?/g;
const billNumberPattern = /제?\s*\d{4}\s*-\s*\d{3}\s*-\s*\d{3}\s*호?/g;
const caseNumberPattern = /20\d{2}\s*조[가-힣]{1,4}\s*\d{4}/g;
const amountPattern =
  /(?:\d+\s*억\s*(?:\d{1,3}(?:,\d{3})+|\d+)?\s*(?:만)?\s*원|(?:\d{1,3}(?:,\d{3})+|\d+)\s*(?:천만|백만|십만|만)?\s*원)/g;

function readUtf8(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.replace(/\r$/, ""));
    rows.push(row);
  }

  if (rows.length === 0) return [];
  const headers = rows.shift();
  return rows
    .filter((values) => values.some((value) => value !== ""))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
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

function normalizePath(rawPath) {
  return path.resolve(ROOT, rawPath.replace(/[\\/]+/g, path.sep));
}

function compact(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeArticle(value) {
  return compact(value)
    .replace(/\s+/g, "")
    .replace("제", "제")
    .replace("조의", "조의");
}

function uniqueValues(values, limit = 30) {
  const seen = new Set();
  const result = [];
  for (const raw of values) {
    const value = compact(raw);
    if (!value || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
    if (result.length >= limit) break;
  }
  return result;
}

function matchAllUnique(text, pattern, normalizer = compact, limit = 30) {
  pattern.lastIndex = 0;
  const matches = [];
  let match;
  while ((match = pattern.exec(text))) {
    matches.push(normalizer(match[0]));
  }
  return uniqueValues(matches, limit);
}

function findLawNameBefore(text, index) {
  const windowText = text.slice(Math.max(0, index - 120), index + 1);
  lawHintPattern.lastIndex = 0;
  let last = "";
  let match;
  while ((match = lawHintPattern.exec(windowText))) {
    last = compact(match[1]);
  }
  if (!last) return "";
  if (!/(법|령|규칙|규정|고시|지침|헌법)/.test(last)) return "";
  return last;
}

function extractLawCitations(text) {
  const citations = [];
  articlePattern.lastIndex = 0;
  let match;
  while ((match = articlePattern.exec(text))) {
    const article = normalizeArticle(match[0]);
    const lawName = findLawNameBefore(text, match.index);
    citations.push(lawName ? `${lawName} ${article}` : article);
  }
  return uniqueValues(citations, 40);
}

function extractFragments(text, needlePattern, limit = 8) {
  const fragments = [];
  needlePattern.lastIndex = 0;
  let match;
  while ((match = needlePattern.exec(text))) {
    const start = Math.max(0, match.index - 60);
    const end = Math.min(text.length, match.index + match[0].length + 80);
    fragments.push(compact(text.slice(start, end)));
    if (fragments.length >= limit) break;
  }
  return uniqueValues(fragments, limit);
}

function detectSanctions(text) {
  const found = [];
  for (const keyword of sanctionKeywords) {
    if (text.includes(keyword)) found.push(keyword);
  }
  return found;
}

function cleanEntityCandidate(value) {
  return compact(value)
    .replace(/&amp;lt;/g, "<")
    .replace(/&amp;gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\.(pdf|hwp)$/i, "")
    .replace(/\[[^\]]+\]/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/개인정보보호위원회/g, " ")
    .replace(/전체회의/g, " ")
    .replace(/심의의결서|의결서|결정문|공개용|최종|수정|붙임|별첨|별지/gi, " ")
    .replace(/제\s*\d+\s*회/g, " ")
    .replace(/\d{6,8}|\d{2}\.\d{1,2}\.\d{1,2}/g, " ")
    .replace(/개인정보\s*보호\s*법규\s*위반행위/g, " ")
    .replace(/시정조치에?\s*관한\s*건/g, " ")
    .replace(/관련\s*처분/g, " ")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferEntityCandidate(manifestRow, decisionRow) {
  const decisionContent = decisionRow?.decision_content ?? "";
  const title = decisionRow?.title ?? "";
  const attachment = manifestRow.attachment_name ?? "";

  const contentMatch = compact(decisionContent).match(
    /^(.{2,80}?)(?:\s+)?(?:과징금|과태료|시정명령|공표명령|개선권고|경고|주의|고발|원안의결|수사의뢰|부과)/
  );
  if (contentMatch) return cleanEntityCandidate(contentMatch[1]);

  const titleMatch = compact(title).match(/^(.{2,80}?)(?:의\s*)?개인정보|^(.{2,80}?)(?:에\s*대한|에\s*관한)/);
  if (titleMatch) return cleanEntityCandidate(titleMatch[1] || titleMatch[2]);

  const attachmentCandidate = cleanEntityCandidate(attachment);
  if (attachmentCandidate.length <= 80) return attachmentCandidate;
  return attachmentCandidate.slice(0, 80).trim();
}

function countBy(rows, keyFn) {
  const result = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    result.set(key, (result.get(key) ?? 0) + 1);
  }
  return result;
}

function topEntries(map, limit = 20) {
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko")).slice(0, limit);
}

function makeMarkdownTable(headers, rows) {
  if (rows.length === 0) return "_없음_\n";
  const escapeCell = (value) => String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${headers.map((header) => escapeCell(row[header])).join(" | ")} |`),
  ].join("\n");
}

function main() {
  if (!fs.existsSync(manifestPath)) throw new Error(`Manifest not found: ${manifestPath}`);
  if (!fs.existsSync(decisionsPath)) throw new Error(`Decisions CSV not found: ${decisionsPath}`);

  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(indexDir, { recursive: true });

  const manifestRows = parseCsv(readUtf8(manifestPath));
  const decisionRows = parseCsv(readUtf8(decisionsPath));
  const decisionsByIdx = new Map(decisionRows.map((row) => [row.idx_id, row]));

  const signalRows = [];
  const missingMdRows = [];

  for (const manifestRow of manifestRows) {
    const decisionRow = decisionsByIdx.get(manifestRow.decision_idx_id) ?? {};
    const base = {
      external_id: manifestRow.external_id,
      decision_idx_id: manifestRow.decision_idx_id,
      decision_date: manifestRow.decision_date,
      bill_number: manifestRow.bill_number,
      attachment_name: manifestRow.attachment_name,
      file_ext: manifestRow.file_ext,
      parse_status: manifestRow.status,
      raw_md_path: manifestRow.raw_md_path,
      decision_title: decisionRow.title ?? "",
      decision_content_summary: decisionRow.decision_content ?? "",
      entity_candidate: inferEntityCandidate(manifestRow, decisionRow),
      char_count: 0,
      detected_bill_numbers: "",
      case_numbers: "",
      law_articles: "",
      law_citation_candidates: "",
      sanction_keywords: "",
      monetary_amounts: "",
      monetary_contexts: "",
      disposition_contexts: "",
      signal_note: "",
    };

    if (manifestRow.status !== "converted") {
      signalRows.push({
        ...base,
        signal_note: manifestRow.error || "source attachment was not downloaded as a usable document",
      });
      continue;
    }

    const mdPath = normalizePath(manifestRow.raw_md_path);
    if (!fs.existsSync(mdPath)) {
      missingMdRows.push(manifestRow);
      signalRows.push({
        ...base,
        parse_status: "missing_md",
        signal_note: "manifest says converted, but raw_md_path was not found",
      });
      continue;
    }

    const text = readUtf8(mdPath);
    const normalizedText = compact(text);
    const lawCitations = extractLawCitations(normalizedText);
    const lawArticles = uniqueValues(
      lawCitations.map((citation) => citation.match(/제\d+조(?:의\d+)?(?:제\d+항)?(?:제\d+호)?/)?.[0] ?? citation),
      40
    );
    const sanctionMatches = detectSanctions(normalizedText);
    const monetaryAmounts = matchAllUnique(normalizedText, amountPattern, compact, 30).filter((value) => value !== "원");
    const monetaryContexts = extractFragments(normalizedText, amountPattern, 8);
    const dispositionContexts = extractFragments(
      normalizedText,
      /(시정명령|과징금|과태료|공표명령|개선권고|고발|경고|주의|원안의결|수사의뢰|감경|징계권고)/g,
      8
    );

    signalRows.push({
      ...base,
      char_count: text.length,
      detected_bill_numbers: matchAllUnique(normalizedText, billNumberPattern, compact, 20).join("; "),
      case_numbers: matchAllUnique(normalizedText, caseNumberPattern, (value) => value.replace(/\s+/g, ""), 30).join("; "),
      law_articles: lawArticles.join("; "),
      law_citation_candidates: lawCitations.join("; "),
      sanction_keywords: sanctionMatches.join("; "),
      monetary_amounts: monetaryAmounts.join("; "),
      monetary_contexts: monetaryContexts.join(" || "),
      disposition_contexts: dispositionContexts.join(" || "),
      signal_note: "first-pass candidate extraction; verify before citation or quantitative analysis",
    });
  }

  const headers = [
    "external_id",
    "decision_idx_id",
    "decision_date",
    "bill_number",
    "attachment_name",
    "file_ext",
    "parse_status",
    "raw_md_path",
    "decision_title",
    "decision_content_summary",
    "entity_candidate",
    "char_count",
    "detected_bill_numbers",
    "case_numbers",
    "law_articles",
    "law_citation_candidates",
    "sanction_keywords",
    "monetary_amounts",
    "monetary_contexts",
    "disposition_contexts",
    "signal_note",
  ];

  writeCsv(csvOutPath, signalRows, headers);

  const convertedRows = signalRows.filter((row) => row.parse_status === "converted");
  const failedRows = signalRows.filter((row) => row.parse_status !== "converted");
  const byStatus = countBy(signalRows, (row) => row.parse_status || "(blank)");
  const byExt = countBy(convertedRows, (row) => row.file_ext || "(blank)");
  const docsWithLaw = convertedRows.filter((row) => row.law_articles).length;
  const docsWithMoney = convertedRows.filter((row) => row.monetary_amounts).length;
  const docsWithSanctions = convertedRows.filter((row) => row.sanction_keywords).length;

  const lawCounter = new Map();
  for (const row of convertedRows) {
    for (const citation of row.law_citation_candidates.split("; ").filter(Boolean)) {
      lawCounter.set(citation, (lawCounter.get(citation) ?? 0) + 1);
    }
  }

  const sanctionCounter = new Map();
  for (const row of convertedRows) {
    for (const keyword of row.sanction_keywords.split("; ").filter(Boolean)) {
      sanctionCounter.set(keyword, (sanctionCounter.get(keyword) ?? 0) + 1);
    }
  }

  const failedTableRows = failedRows.map((row) => ({
    decision_idx_id: row.decision_idx_id,
    decision_date: row.decision_date,
    attachment_name: row.attachment_name,
    file_ext: row.file_ext,
    parse_status: row.parse_status,
    note: row.signal_note,
  }));

  const sampleRows = convertedRows
    .filter((row) => row.sanction_keywords || row.law_articles || row.monetary_amounts)
    .slice(0, 12)
    .map((row) => ({
      decision_date: row.decision_date,
      idx: row.decision_idx_id,
      entity_candidate: row.entity_candidate,
      sanctions: row.sanction_keywords,
      law_articles: row.law_articles.split("; ").slice(0, 5).join("; "),
      monetary_amounts: row.monetary_amounts.split("; ").slice(0, 4).join("; "),
    }));

  const generatedDate = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date());

  const report = `# 결정문 MD 1차 구조화 신호 리포트

생성일: ${generatedDate}

이 문서는 결정문 원문 MD에서 자동 추출한 후보 신호입니다. 처분 주체, 조항, 금액, 사건번호는 정규화 전 단계의 값이므로 인용이나 통계에 쓰기 전에 원문 대조가 필요합니다.

## 전체 현황

- manifest 행: ${manifestRows.length}
- 신호 CSV 행: ${signalRows.length}
- 변환 성공 행: ${convertedRows.length}
- 원천 다운로드 실패/미변환 행: ${failedRows.length}
- manifest상 변환 성공이지만 MD 파일이 없는 행: ${missingMdRows.length}
- 조항 후보가 잡힌 변환 문서: ${docsWithLaw}
- 금액 후보가 잡힌 변환 문서: ${docsWithMoney}
- 처분 키워드가 잡힌 변환 문서: ${docsWithSanctions}

## 변환 상태별 건수

${makeMarkdownTable(
  ["status", "count"],
  topEntries(byStatus).map(([status, count]) => ({ status, count }))
)}

## 변환 문서 확장자별 건수

${makeMarkdownTable(
  ["file_ext", "count"],
  topEntries(byExt).map(([file_ext, count]) => ({ file_ext, count }))
)}

## 처분 키워드 상위

${makeMarkdownTable(
  ["keyword", "documents"],
  topEntries(sanctionCounter, 20).map(([keyword, documents]) => ({ keyword, documents }))
)}

## 조항 후보 상위

${makeMarkdownTable(
  ["citation_candidate", "documents"],
  topEntries(lawCounter, 30).map(([citation_candidate, documents]) => ({ citation_candidate, documents }))
)}

## 실패/결측 행

${makeMarkdownTable(["decision_idx_id", "decision_date", "attachment_name", "file_ext", "parse_status", "note"], failedTableRows)}

## 샘플 신호

${makeMarkdownTable(
  ["decision_date", "idx", "entity_candidate", "sanctions", "law_articles", "monetary_amounts"],
  sampleRows
)}

## 산출물

- CSV: \`pipc_knowledge_base/90_normalized_data/decision_document_signals.csv\`
- 리포트: \`pipc_knowledge_base/00_indexes/decision_document_signal_report.md\`

## 다음 단계 제안

1. 같은 결정문의 HWP/PDF 중복을 묶어 대표 원문을 정합니다.
2. 결정문 신호를 사건 단위로 접어 \`decision_cases\`, \`decision_sanctions\`, \`decision_law_citations\`, \`decision_penalties\` 후보 테이블로 나눕니다.
3. 회의 안건번호와 결정문 안건번호를 매칭해 회의록/속기록 발언과 최종 처분 결과를 연결합니다.
`;

  fs.writeFileSync(reportOutPath, report, "utf8");

  console.log(
    JSON.stringify(
      {
        manifest_rows: manifestRows.length,
        signal_rows: signalRows.length,
        converted_rows: convertedRows.length,
        failed_rows: failedRows.length,
        missing_md_rows: missingMdRows.length,
        docs_with_law: docsWithLaw,
        docs_with_money: docsWithMoney,
        docs_with_sanctions: docsWithSanctions,
        csv: path.relative(ROOT, csvOutPath),
        report: path.relative(ROOT, reportOutPath),
      },
      null,
      2
    )
  );
}

main();
