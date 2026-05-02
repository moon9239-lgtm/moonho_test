import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "yfrjdbsaulawwqmuozao";
const API_BASE = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const signalsPath = path.join(ROOT, "pipc_knowledge_base", "90_normalized_data", "decision_document_signals.csv");
const outDir = path.join(ROOT, "pipc_knowledge_base", "90_normalized_data");
const reportPath = path.join(ROOT, "pipc_knowledge_base", "00_indexes", "decision_case_candidate_seed_report.md");
const casesCsvPath = path.join(outDir, "decision_case_candidates.csv");
const jsonPath = path.join(outDir, "decision_case_candidate_seed.json");

const args = new Set(process.argv.slice(2));
const shouldUpload = args.has("--upload");

const actionableSanctionKinds = new Set([
  "과징금",
  "과태료",
  "시정명령",
  "공표명령",
  "개선권고",
  "고발",
  "경고",
  "주의",
  "수사의뢰",
  "징계권고",
]);

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

function compact(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function splitSemicolon(value) {
  return compact(value)
    .split(";")
    .map((item) => compact(item))
    .filter(Boolean);
}

function uniqueValues(values, limit = Infinity) {
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

function normalizeExternalId(externalId) {
  const match = compact(externalId).match(/^decision_file:([^:]+):([^:]+):([^:]+):([^:]+)$/);
  if (!match) {
    return {
      atchFileId: "",
      fileSn: "",
      fileExt: "",
      cnvCnt: "",
      groupSuffix: crypto.createHash("sha1").update(externalId).digest("hex").slice(0, 12),
    };
  }
  return {
    atchFileId: match[1],
    fileSn: match[2],
    fileExt: match[3],
    cnvCnt: match[4],
    groupSuffix: `${match[1]}:${match[2]}`,
  };
}

function normalizeKeyPart(value) {
  return compact(value)
    .replace(/[^\p{L}\p{N}_:-]+/gu, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 180);
}

function normalizeName(value) {
  return compact(value)
    .replace(/&amp;lt;/g, "<")
    .replace(/&amp;gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/[<>]/g, "")
    .replace(/^제\d{4}-\d{3}-\d{3}(?:호)?[,._\s-]*/g, "")
    .replace(/^\(?공개용?\)?[_\s-]*/g, "")
    .replace(/^공개용?의결서[_\s-]*/g, "")
    .replace(/^\d+\.\s*심의[·ㆍ-]?의결서?[_\s-]*/g, "")
    .replace(/^심의[·ㆍ-]?의결서?[_\s-]*/g, "")
    .replace(/[：:]\s*$/g, "")
    .replace(/^피심인\s*/g, "")
    .replace(/^[_.,\s-]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isGenericEntityName(name) {
  if (!name) return true;
  if (name.length < 2 || name.length > 100) return true;
  const genericPatterns = [
    /^\d+\.?$/,
    /^개인정보보호위원회$/,
    /^신용정보법령$/,
    /^공개$/,
    /^공개용$/,
    /^\(?공개용\)?$/,
    /^공개용의결서$/,
    /^공개용_?업로드$/,
    /^심의[·ㆍ-]?의결서?$/,
    /^\d+\.\s*심의[·ㆍ-]?의결서?$/,
    /^의결서$/,
    /^결정문$/,
    /^제\d{4}$/,
    /^제\d{4}-\d{3}-\d{3}호?$/,
    /개인정보\s*보호\s*법규\s*위반행위/,
    /공공기관의\s*개인정보보호/,
    /^신용정보의\s*이용\s*및\s*보호$/,
    /^별지와\s*같이\s*의결/,
    /^원안/,
    /^피심인$/,
    /^대상기관$/,
  ];
  return genericPatterns.some((pattern) => pattern.test(name));
}

function guessEntityKind(name, title) {
  const text = `${name} ${title}`;
  if (/(㈜|주식회사|유한회사|\bInc\b|\bLLC\b|\bLtd\b|컴퍼니|코리아|게임즈|games|Google|Meta|Amazon|Apple)/i.test(text)) {
    return { entityKind: "company", isPublicSector: false };
  }
  if (/(공단|공사|국립|시청|군청|구청|도청|교육청|경찰청|소방청|진흥원|박물관|공공기관|위원회|부$|처$|청$|시$|군$|구$)/.test(text)) {
    return { entityKind: "public_agency", isPublicSector: true };
  }
  if (/(대학교|대학|병원|재단|협회|조합|진흥원|센터)/.test(text)) {
    return { entityKind: "institution", isPublicSector: null };
  }
  return { entityKind: "unknown", isPublicSector: null };
}

function isLikelyEntityName(name) {
  if (isGenericEntityName(name)) return false;
  if (name.length > 45) return false;
  if (/^[\d\s().,_-]+$/.test(name)) return false;
  if (/^[제]?\d{4}[-–]\d{3}[-–]\d{3}/.test(name)) return false;
  if (/^(시정명령|과징금|과태료|개선권고|공표명령|주의|경고|고발|처분|부과|감경)/.test(name)) return false;
  if (/(의결|심의|검토|결과|공개용|업로드|수사준칙|개정안|요청|유출|위원회|※|제공자$|공공기관$|의료$|의료분야$|사전적정성)/.test(name)) return false;
  if (/^(에 대한|보호법 위반|국내대리인|정보통신서비스|개인정보 처리실태)/.test(name)) return false;

  if (/(㈜|\(주\)|주식회사|유한회사|\bInc\b|\bLLC\b|\bLtd\b|컴퍼니|코리아|게임즈|games|구글|넷플릭스|페이스북|Google|Meta|Amazon|Apple)/i.test(name)) {
    return true;
  }
  if (/(공단|공사|고등학교|대학교|대학|병원|건설|빌딩|기원|재단|협회|조합|진흥원|박물관|구청|시청|군청|도청|교육청|경찰청|소방청|위원회|청$|부$|처$)/.test(name)) {
    return true;
  }
  if (/ㅇㅇ/.test(name)) return true;
  return false;
}

function normalizeCaseNumber(value) {
  const compacted = compact(value).replace(/\s+/g, "");
  const match = compacted.match(/^(20\d{2}조[가-힣]{1,4})(\d{3,4})(.*)$/);
  if (!match) return compacted;
  const number = match[2].padStart(4, "0");
  return `${match[1]}${number}${match[3]}`;
}

function extractCaseNumbers(...texts) {
  const results = [];
  const pattern = /20\d{2}\s*조[가-힣]{1,4}\s*\d{3,4}(?:\s*[~∼-]\s*(?:20\d{2}\s*조[가-힣]{1,4})?\s*\d{3,4})?/g;
  for (const text of texts) {
    const normalized = compact(text);
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(normalized))) {
      results.push(normalizeCaseNumber(match[0]));
    }
  }
  return uniqueValues(results, 20);
}

function normalizeBillNumber(value) {
  return compact(value).replace(/\s+/g, "");
}

function extractBillNumbers(...texts) {
  const results = [];
  const pattern = /제?\s*\d{4}\s*-\s*\d{3}\s*-\s*\d{3}(?:\s*[~∼-]\s*\d{3})?\s*호?/g;
  for (const text of texts) {
    const normalized = compact(text);
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(normalized))) {
      let value = normalizeBillNumber(match[0]);
      if (!value.startsWith("제")) value = `제${value}`;
      if (!value.endsWith("호")) value = `${value}호`;
      results.push(value);
    }
  }
  return uniqueValues(results, 20);
}

function inferAttachmentEntityName(attachmentName) {
  const stem = compact(attachmentName)
    .replace(/\.(pdf|hwp)$/i, "")
    .replace(/&amp;lt;/g, "<")
    .replace(/&amp;gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

  const firstToken = normalizeName(stem.split(/[_-]/)[0]);
  if (firstToken && !isGenericEntityName(firstToken) && firstToken.length <= 50 && !/^(심의|의결|결정|붙임|별지|개선권고)/.test(firstToken)) {
    return firstToken;
  }

  const withoutBillPrefix = normalizeName(stem);
  const afterBillToken = normalizeName(withoutBillPrefix.split(/[_-]/)[0]);
  if (
    afterBillToken &&
    !isGenericEntityName(afterBillToken) &&
    afterBillToken.length <= 50 &&
    !/^(심의|의결|결정|붙임|별지|개선권고)/.test(afterBillToken)
  ) {
    return afterBillToken;
  }

  const bracket = stem.match(/[<(（]([^>)）]{2,50})[>)）]/);
  if (bracket) {
    const value = normalizeName(bracket[1]);
    if (!isGenericEntityName(value)) return value;
  }

  return "";
}

function chooseRepresentative(rows) {
  const converted = rows.filter((row) => row.parse_status === "converted");
  const candidates = converted.length > 0 ? converted : rows;
  return [...candidates].sort((a, b) => {
    const extScore = (row) => (row.file_ext === "hwp" ? 2 : row.file_ext === "pdf" ? 1 : 0);
    const statusScore = (row) => (row.parse_status === "converted" ? 1 : 0);
    return (
      statusScore(b) - statusScore(a) ||
      extScore(b) - extScore(a) ||
      Number(b.char_count || 0) - Number(a.char_count || 0) ||
      compact(a.external_id).localeCompare(compact(b.external_id))
    );
  })[0];
}

function firstContextForKeyword(contextText, keyword) {
  return compact(contextText)
    .split(" || ")
    .map((part) => compact(part))
    .find((part) => part.includes(keyword)) ?? "";
}

function normalizeAmountText(value) {
  return compact(value).replace(/\s+/g, "");
}

function parseSmallKoreanMoney(value) {
  let rest = value;
  let amount = 0;

  const thousandMan = rest.match(/^(\d+(?:\.\d+)?)천만/);
  if (thousandMan) {
    amount += Math.round(Number(thousandMan[1]) * 10_000_000);
    rest = rest.slice(thousandMan[0].length);
  }

  const hundredMan = rest.match(/^(\d+(?:\.\d+)?)백만/);
  if (hundredMan) {
    amount += Math.round(Number(hundredMan[1]) * 1_000_000);
    rest = rest.slice(hundredMan[0].length);
  }

  const tenMan = rest.match(/^(\d+(?:\.\d+)?)십만/);
  if (tenMan) {
    amount += Math.round(Number(tenMan[1]) * 100_000);
    rest = rest.slice(tenMan[0].length);
  }

  const man = rest.match(/^(\d+(?:\.\d+)?)만/);
  if (man) {
    amount += Math.round(Number(man[1]) * 10_000);
    rest = rest.slice(man[0].length);
  }

  const won = rest.match(/^(\d+)원?$/);
  if (won) amount += Number(won[1]);

  return amount || null;
}

function parseKrwAmount(text) {
  const normalized = normalizeAmountText(text).replace(/,/g, "");
  if (!normalized || normalized === "원") return null;

  const plain = normalized.match(/^(\d+)원$/);
  if (plain) return Number(plain[1]);

  let total = 0;
  let rest = normalized;
  const eok = rest.match(/^(\d+(?:\.\d+)?)억/);
  if (eok) {
    total += Math.round(Number(eok[1]) * 100_000_000);
    rest = rest.slice(eok[0].length);
  }

  const remainder = parseSmallKoreanMoney(rest);
  if (remainder) total += remainder;
  return total || null;
}

function inferPenaltyKind(amountText, monetaryContexts, sanctions) {
  const normalizedAmount = normalizeAmountText(amountText);
  const context = compact(monetaryContexts)
    .split(" || ")
    .map((part) => compact(part))
    .find((part) => normalizeAmountText(part).includes(normalizedAmount));

  if (context?.includes("과징금")) return { kind: "과징금", context };
  if (context?.includes("과태료")) return { kind: "과태료", context };
  if (sanctions.includes("과징금") && !sanctions.includes("과태료")) return { kind: "과징금", context: context ?? "" };
  if (sanctions.includes("과태료") && !sanctions.includes("과징금")) return { kind: "과태료", context: context ?? "" };
  return { kind: "금액후보", context: context ?? "" };
}

function parseLawCitation(citation) {
  const text = compact(citation);
  const articleMatch = text.match(/제\d+조(?:의\d+)?(?:제\d+항)?(?:제\d+호)?/);
  const article = articleMatch?.[0] ?? text;
  const lawName = articleMatch ? compact(text.slice(0, articleMatch.index)) : "";
  return {
    lawNameRaw: lawName || null,
    articleRaw: article,
    citedText: text,
  };
}

function sqlLiteral(value) {
  if (value == null) return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlJsonLiteral(rows) {
  const tag = `seed_${crypto.randomBytes(8).toString("hex")}`;
  return `$${tag}$${JSON.stringify(rows)}$${tag}$::jsonb`;
}

function chunks(values, size) {
  const result = [];
  for (let i = 0; i < values.length; i += size) {
    result.push(values.slice(i, i + size));
  }
  return result;
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
  return [...map.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), "ko")).slice(0, limit);
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

function dedupeCaseNos(caseRows) {
  const groups = new Map();
  for (const row of caseRows) {
    const key = `${row.decision_idx_id}|${row.case_no || ""}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }

  for (const rows of groups.values()) {
    if (rows.length <= 1) continue;
    const used = new Set();
    for (const row of rows) {
      const originalCaseNo = row.case_no;
      const billCandidates = splitSemicolon(row.bill_number);
      const billCandidate = billCandidates.find((bill) => bill && !used.has(bill));
      if (billCandidate) {
        row.case_no = billCandidate;
      } else {
        row.case_no = `${originalCaseNo || "case"}#${row.case_key.split(":").slice(-1)[0]}`;
      }
      used.add(row.case_no);
      row.metadata = {
        ...row.metadata,
        original_case_no_before_disambiguation: originalCaseNo,
        case_no_disambiguation: "decision_post_id_case_no_unique_guard",
      };
    }
  }
}

function dedupeRows(rows, keyFn) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!map.has(key)) map.set(key, row);
  }
  return [...map.values()];
}

function buildSeed() {
  const signalRows = parseCsv(readUtf8(signalsPath));
  const groups = new Map();

  for (const row of signalRows) {
    const parsed = normalizeExternalId(row.external_id);
    const groupKey = `${row.decision_idx_id}|${parsed.groupSuffix}`;
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey).push({ ...row, ...parsed, groupKey });
  }

  const caseRows = [];
  const entityRowsByName = new Map();
  const caseEntityRows = [];
  const sanctionRows = [];
  const penaltyRows = [];
  const lawCitationRows = [];
  const fileLinkRows = [];

  for (const [groupKey, rows] of groups.entries()) {
    const rep = chooseRepresentative(rows);
    const externalIds = uniqueValues(rows.map((row) => row.external_id));
    const convertedRows = rows.filter((row) => row.parse_status === "converted");
    const caseNumbers = extractCaseNumbers(
      rep.case_numbers,
      rep.attachment_name,
      rep.decision_title,
      rep.decision_content_summary
    );
    const billNumbers = uniqueValues([
      ...extractBillNumbers(rep.detected_bill_numbers, rep.attachment_name),
      ...splitSemicolon(rep.detected_bill_numbers),
      ...extractBillNumbers(rep.bill_number, rep.decision_title),
    ]).map(normalizeBillNumber);
    const caseNo = caseNumbers[0] || billNumbers[0] || normalizeKeyPart(groupKey);
    const caseKey = normalizeKeyPart(`${rep.decision_idx_id}:${rep.atchFileId || "unknown"}:${rep.fileSn || "0"}`);
    const sanctions = splitSemicolon(rep.sanction_keywords);
    const actionableSanctions = sanctions.filter((keyword) => actionableSanctionKinds.has(keyword));
    const lawCitations = splitSemicolon(rep.law_citation_candidates).slice(0, 40);
    const monetaryAmounts = splitSemicolon(rep.monetary_amounts).slice(0, 30);
    const attachmentEntityName = normalizeName(inferAttachmentEntityName(rep.attachment_name));
    const signalEntityName = normalizeName(rep.entity_candidate);
    const entityName = isLikelyEntityName(attachmentEntityName)
      ? attachmentEntityName
      : isLikelyEntityName(signalEntityName)
        ? signalEntityName
        : "";
    const hasEntity = Boolean(entityName);
    const { entityKind, isPublicSector } = guessEntityKind(entityName, rep.decision_title);
    const extractionStatus = convertedRows.length > 0 ? "candidate" : "source_failed";
    const confidence = convertedRows.length > 0 ? 0.62 : 0.2;
    const sourceExternalId = rep.external_id;

    if (hasEntity && !entityRowsByName.has(entityName)) {
      entityRowsByName.set(entityName, {
        name: entityName,
        normalized_name: entityName.replace(/\s+/g, "").toLowerCase(),
        entity_kind: entityKind,
        is_public_sector: isPublicSector,
        metadata: {
          extractor: "scripts/seed_decision_case_candidates.mjs",
          extraction_status: "candidate",
          source: "decision_document_signals.csv",
        },
      });
    }

    caseRows.push({
      decision_idx_id: rep.decision_idx_id,
      case_key: caseKey,
      case_no: caseNo,
      bill_number: billNumbers.join("; ") || rep.bill_number || null,
      title: rep.decision_title || rep.attachment_name || null,
      decision_date: rep.decision_date || null,
      investigation_case_no: caseNumbers.join("; ") || null,
      summary: rep.decision_content_summary || null,
      disposition_summary: rep.disposition_contexts || rep.decision_content_summary || null,
      outcome: sanctions.includes("원안의결") ? "원안의결" : null,
      main_entity_name: hasEntity ? entityName : null,
      source_external_id: sourceExternalId,
      extraction_status: extractionStatus,
      source_confidence: confidence,
      metadata: {
        extractor: "scripts/seed_decision_case_candidates.mjs",
        extraction_version: 1,
        group_key: groupKey,
        representative_external_id: sourceExternalId,
        representative_file_ext: rep.file_ext,
        representative_raw_md_path: rep.raw_md_path,
        attachment_names: uniqueValues(rows.map((row) => row.attachment_name)),
        external_ids: externalIds,
        parse_statuses: uniqueValues(rows.map((row) => row.parse_status)),
        detected_bill_numbers: billNumbers,
        detected_case_numbers: caseNumbers,
        non_actionable_keywords: sanctions.filter((keyword) => !actionableSanctionKinds.has(keyword)),
        candidate_warning: "자동 추출 후보이며 원문 대조 전에는 확정값으로 사용하지 말 것",
      },
    });

    if (hasEntity) {
      caseEntityRows.push({
        decision_idx_id: rep.decision_idx_id,
        case_key: caseKey,
        entity_name: entityName,
        role: "respondent",
        entity_name_in_source: rep.entity_candidate,
      });
    }

    for (const keyword of actionableSanctions) {
      sanctionRows.push({
        decision_idx_id: rep.decision_idx_id,
        case_key: caseKey,
        source_key: normalizeKeyPart(`${caseKey}:sanction:${keyword}`),
        sanction_kind: keyword,
        sanction_label: keyword,
        legal_basis_text: lawCitations.slice(0, 8).join("; ") || null,
        order_text: firstContextForKeyword(rep.disposition_contexts, keyword) || null,
        result_status: "candidate",
        extraction_status: "candidate",
        source_confidence: 0.55,
        metadata: {
          extractor: "scripts/seed_decision_case_candidates.mjs",
          representative_external_id: sourceExternalId,
          source_context: firstContextForKeyword(rep.disposition_contexts, keyword) || null,
        },
      });
    }

    for (const amountText of monetaryAmounts) {
      const { kind, context } = inferPenaltyKind(amountText, rep.monetary_contexts, sanctions);
      penaltyRows.push({
        decision_idx_id: rep.decision_idx_id,
        case_key: caseKey,
        source_key: normalizeKeyPart(`${caseKey}:money:${kind}:${normalizeAmountText(amountText)}`),
        penalty_kind: kind,
        amount_krw: parseKrwAmount(amountText),
        amount_text: amountText,
        calculation_basis: context || null,
        extraction_status: "candidate",
        source_confidence: kind === "금액후보" ? 0.35 : 0.45,
        metadata: {
          extractor: "scripts/seed_decision_case_candidates.mjs",
          representative_external_id: sourceExternalId,
          source_context: context || null,
          candidate_warning: "금액 후보에는 기준금액/감경금액/최종금액이 섞일 수 있음",
        },
      });
    }

    for (const citation of lawCitations) {
      const parsed = parseLawCitation(citation);
      lawCitationRows.push({
        decision_idx_id: rep.decision_idx_id,
        case_key: caseKey,
        source_key: normalizeKeyPart(`${caseKey}:law:${parsed.citedText}`),
        law_name_raw: parsed.lawNameRaw,
        article_raw: parsed.articleRaw,
        cited_text: parsed.citedText,
        issue: null,
        time_basis_date: rep.decision_date || null,
        time_basis_kind: "decision_date",
        verification_status: "pending",
        extraction_status: "candidate",
        source_confidence: parsed.lawNameRaw ? 0.5 : 0.35,
        metadata: {
          extractor: "scripts/seed_decision_case_candidates.mjs",
          representative_external_id: sourceExternalId,
          needs_korean_law_mcp: true,
        },
      });
    }

    for (const external_id of externalIds) {
      fileLinkRows.push({
        decision_idx_id: rep.decision_idx_id,
        case_key: caseKey,
        external_id,
      });
    }
  }

  dedupeCaseNos(caseRows);

  return {
    generated_at: new Date().toISOString(),
    cases: caseRows,
    entities: [...entityRowsByName.values()],
    case_entities: dedupeRows(caseEntityRows, (row) => `${row.decision_idx_id}|${row.case_key}|${row.entity_name}|${row.role}`),
    sanctions: dedupeRows(sanctionRows, (row) => `${row.decision_idx_id}|${row.case_key}|${row.source_key}`),
    monetary_penalties: dedupeRows(penaltyRows, (row) => `${row.decision_idx_id}|${row.case_key}|${row.source_key}`),
    law_citations: dedupeRows(lawCitationRows, (row) => `${row.decision_idx_id}|${row.case_key}|${row.source_key}`),
    file_links: dedupeRows(fileLinkRows, (row) => `${row.decision_idx_id}|${row.case_key}|${row.external_id}`),
  };
}

async function executeSql(label, sql) {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) throw new Error("SUPABASE_ACCESS_TOKEN is not set.");
  const response = await fetch(API_BASE, {
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
  console.log(`[${label}] ${body.slice(0, 500)}`);
}

function entitiesSql(rows) {
  return `
with payload as (
  select *
  from jsonb_to_recordset(${sqlJsonLiteral(rows)}) as x(
    name text,
    normalized_name text,
    entity_kind text,
    is_public_sector boolean,
    metadata jsonb
  )
)
insert into public.entities (name, normalized_name, entity_kind, is_public_sector, metadata)
select name, normalized_name, entity_kind, is_public_sector, metadata
from payload
on conflict (name) do update
set normalized_name = excluded.normalized_name,
    entity_kind = excluded.entity_kind,
    is_public_sector = excluded.is_public_sector,
    metadata = public.entities.metadata || excluded.metadata,
    updated_at = now();
`;
}

function casesSql(rows) {
  return `
with payload as (
  select *
  from jsonb_to_recordset(${sqlJsonLiteral(rows)}) as x(
    decision_idx_id text,
    case_key text,
    case_no text,
    bill_number text,
    title text,
    decision_date date,
    investigation_case_no text,
    summary text,
    disposition_summary text,
    outcome text,
    main_entity_name text,
    source_external_id text,
    extraction_status text,
    source_confidence numeric,
    metadata jsonb
  )
),
enriched as (
  select
    p.*,
    dp.id as decision_post_id,
    e.id as main_entity_id,
    sd.id as source_document_id
  from payload p
  join public.decision_posts dp on dp.pipc_idx_id = p.decision_idx_id
  left join public.entities e on e.name = p.main_entity_name
  left join public.source_documents sd
    on sd.source_system = 'pipc'
   and sd.external_id = p.source_external_id
)
insert into public.decision_cases (
  decision_post_id,
  main_entity_id,
  case_no,
  bill_number,
  title,
  decision_date,
  investigation_case_no,
  summary,
  disposition_summary,
  outcome,
  source_document_id,
  case_key,
  extraction_status,
  source_confidence,
  metadata
)
select
  decision_post_id,
  main_entity_id,
  case_no,
  bill_number,
  title,
  decision_date,
  investigation_case_no,
  summary,
  disposition_summary,
  outcome,
  source_document_id,
  case_key,
  extraction_status,
  source_confidence,
  metadata
from enriched
on conflict (decision_post_id, case_key) where case_key is not null do update
set main_entity_id = excluded.main_entity_id,
    case_no = excluded.case_no,
    bill_number = excluded.bill_number,
    title = excluded.title,
    decision_date = excluded.decision_date,
    investigation_case_no = excluded.investigation_case_no,
    summary = excluded.summary,
    disposition_summary = excluded.disposition_summary,
    outcome = excluded.outcome,
    source_document_id = excluded.source_document_id,
    extraction_status = excluded.extraction_status,
    source_confidence = excluded.source_confidence,
    metadata = public.decision_cases.metadata || excluded.metadata,
    updated_at = now();
`;
}

function caseEntitiesSql(rows) {
  return `
with payload as (
  select *
  from jsonb_to_recordset(${sqlJsonLiteral(rows)}) as x(
    decision_idx_id text,
    case_key text,
    entity_name text,
    role text,
    entity_name_in_source text
  )
),
enriched as (
  select dc.id as case_id, e.id as entity_id, p.role, p.entity_name_in_source
  from payload p
  join public.decision_posts dp on dp.pipc_idx_id = p.decision_idx_id
  join public.decision_cases dc on dc.decision_post_id = dp.id and dc.case_key = p.case_key
  join public.entities e on e.name = p.entity_name
)
insert into public.case_entities (case_id, entity_id, role, entity_name_in_source)
select case_id, entity_id, role, entity_name_in_source
from enriched
on conflict (case_id, entity_id, role) do update
set entity_name_in_source = excluded.entity_name_in_source;
`;
}

function fileLinksSql(rows) {
  return `
with payload as (
  select *
  from jsonb_to_recordset(${sqlJsonLiteral(rows)}) as x(
    decision_idx_id text,
    case_key text,
    external_id text
  )
),
enriched as (
  select df.id as decision_file_id, dc.id as case_id
  from payload p
  join public.decision_posts dp on dp.pipc_idx_id = p.decision_idx_id
  join public.decision_cases dc on dc.decision_post_id = dp.id and dc.case_key = p.case_key
  join public.source_documents sd on sd.source_system = 'pipc' and sd.external_id = p.external_id
  join public.decision_files df on df.source_document_id = sd.id
)
update public.decision_files df
set decision_case_id = e.case_id
from enriched e
where df.id = e.decision_file_id;
`;
}

function sanctionsSql(rows) {
  return `
with payload as (
  select *
  from jsonb_to_recordset(${sqlJsonLiteral(rows)}) as x(
    decision_idx_id text,
    case_key text,
    source_key text,
    sanction_kind text,
    sanction_label text,
    legal_basis_text text,
    order_text text,
    result_status text,
    extraction_status text,
    source_confidence numeric,
    metadata jsonb
  )
),
enriched as (
  select p.*, dc.id as case_id
  from payload p
  join public.decision_posts dp on dp.pipc_idx_id = p.decision_idx_id
  join public.decision_cases dc on dc.decision_post_id = dp.id and dc.case_key = p.case_key
)
insert into public.sanctions (
  case_id,
  sanction_kind,
  sanction_label,
  legal_basis_text,
  order_text,
  result_status,
  source_key,
  extraction_status,
  source_confidence,
  metadata
)
select
  case_id,
  sanction_kind,
  sanction_label,
  legal_basis_text,
  order_text,
  result_status,
  source_key,
  extraction_status,
  source_confidence,
  metadata
from enriched
on conflict (case_id, source_key) where source_key is not null do update
set sanction_kind = excluded.sanction_kind,
    sanction_label = excluded.sanction_label,
    legal_basis_text = excluded.legal_basis_text,
    order_text = excluded.order_text,
    result_status = excluded.result_status,
    extraction_status = excluded.extraction_status,
    source_confidence = excluded.source_confidence,
    metadata = public.sanctions.metadata || excluded.metadata,
    updated_at = now();
`;
}

function penaltiesSql(rows) {
  return `
with payload as (
  select *
  from jsonb_to_recordset(${sqlJsonLiteral(rows)}) as x(
    decision_idx_id text,
    case_key text,
    source_key text,
    penalty_kind text,
    amount_krw bigint,
    amount_text text,
    calculation_basis text,
    extraction_status text,
    source_confidence numeric,
    metadata jsonb
  )
),
enriched as (
  select p.*, dc.id as case_id, s.id as sanction_id
  from payload p
  join public.decision_posts dp on dp.pipc_idx_id = p.decision_idx_id
  join public.decision_cases dc on dc.decision_post_id = dp.id and dc.case_key = p.case_key
  left join public.sanctions s on s.case_id = dc.id and s.sanction_kind = p.penalty_kind
)
insert into public.monetary_penalties (
  case_id,
  sanction_id,
  penalty_kind,
  amount_krw,
  amount_text,
  calculation_basis,
  source_key,
  extraction_status,
  source_confidence,
  metadata
)
select
  case_id,
  sanction_id,
  penalty_kind,
  amount_krw,
  amount_text,
  calculation_basis,
  source_key,
  extraction_status,
  source_confidence,
  metadata
from enriched
on conflict (case_id, source_key) where source_key is not null do update
set sanction_id = excluded.sanction_id,
    penalty_kind = excluded.penalty_kind,
    amount_krw = excluded.amount_krw,
    amount_text = excluded.amount_text,
    calculation_basis = excluded.calculation_basis,
    extraction_status = excluded.extraction_status,
    source_confidence = excluded.source_confidence,
    metadata = public.monetary_penalties.metadata || excluded.metadata,
    updated_at = now();
`;
}

function lawCitationsSql(rows) {
  return `
with payload as (
  select *
  from jsonb_to_recordset(${sqlJsonLiteral(rows)}) as x(
    decision_idx_id text,
    case_key text,
    source_key text,
    law_name_raw text,
    article_raw text,
    cited_text text,
    issue text,
    time_basis_date date,
    time_basis_kind text,
    verification_status text,
    extraction_status text,
    source_confidence numeric,
    metadata jsonb
  )
),
enriched as (
  select p.*, dc.id as case_id
  from payload p
  join public.decision_posts dp on dp.pipc_idx_id = p.decision_idx_id
  join public.decision_cases dc on dc.decision_post_id = dp.id and dc.case_key = p.case_key
)
insert into public.law_citations (
  source_type,
  source_id,
  law_name_raw,
  article_raw,
  cited_text,
  issue,
  time_basis_date,
  time_basis_kind,
  verification_status,
  source_key,
  extraction_status,
  source_confidence,
  metadata
)
select
  'decision_case',
  case_id,
  law_name_raw,
  article_raw,
  cited_text,
  issue,
  time_basis_date,
  time_basis_kind,
  verification_status,
  source_key,
  extraction_status,
  source_confidence,
  metadata
from enriched
on conflict (source_type, source_id, source_key) where source_id is not null and source_key is not null do update
set law_name_raw = excluded.law_name_raw,
    article_raw = excluded.article_raw,
    cited_text = excluded.cited_text,
    issue = excluded.issue,
    time_basis_date = excluded.time_basis_date,
    time_basis_kind = excluded.time_basis_kind,
    verification_status = excluded.verification_status,
    extraction_status = excluded.extraction_status,
    source_confidence = excluded.source_confidence,
    metadata = public.law_citations.metadata || excluded.metadata,
    updated_at = now();
`;
}

async function uploadSeed(seed) {
  const operations = [
    ["entities", seed.entities, 300, entitiesSql],
    ["decision_cases", seed.cases, 150, casesSql],
    ["case_entities", seed.case_entities, 300, caseEntitiesSql],
    ["decision_file_links", seed.file_links, 300, fileLinksSql],
    ["sanctions", seed.sanctions, 300, sanctionsSql],
    ["monetary_penalties", seed.monetary_penalties, 250, penaltiesSql],
    ["law_citations", seed.law_citations, 200, lawCitationsSql],
  ];

  for (const [name, rows, chunkSize, sqlFn] of operations) {
    const rowChunks = chunks(rows, chunkSize);
    if (rowChunks.length === 0) {
      console.log(`[${name}] skipped empty`);
      continue;
    }
    for (let i = 0; i < rowChunks.length; i += 1) {
      await executeSql(`${name}.${i + 1}/${rowChunks.length}`, sqlFn(rowChunks[i]));
    }
  }
}

function writeOutputs(seed) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(seed, null, 2), "utf8");

  writeCsv(casesCsvPath, seed.cases, [
    "decision_idx_id",
    "case_key",
    "case_no",
    "bill_number",
    "decision_date",
    "title",
    "investigation_case_no",
    "main_entity_name",
    "source_external_id",
    "extraction_status",
    "source_confidence",
  ]);

  const byStatus = countBy(seed.cases, (row) => row.extraction_status);
  const byRepresentativeExt = countBy(seed.cases, (row) => row.metadata.representative_file_ext || "(blank)");
  const bySanction = countBy(seed.sanctions, (row) => row.sanction_kind);
  const generatedDate = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date());
  const sampleRows = seed.cases.slice(0, 15).map((row) => ({
    date: row.decision_date,
    idx: row.decision_idx_id,
    case_no: row.case_no,
    entity: row.main_entity_name,
    title: row.title,
  }));

  const report = `# 결정문 사건 후보 Seed 리포트

생성일: ${generatedDate}

이 리포트는 결정문 문서별 신호를 사건 후보 단위로 접은 결과입니다. HWP/PDF 중복은 같은 첨부파일 ID와 파일 순번을 기준으로 묶었고, 대표 문서는 HWP를 우선했습니다. 모든 값은 자동 추출 후보입니다.

## 생성 현황

- 사건 후보: ${seed.cases.length}
- 기관/피심인 후보: ${seed.entities.length}
- 사건-기관 연결 후보: ${seed.case_entities.length}
- 처분 후보: ${seed.sanctions.length}
- 금액 후보: ${seed.monetary_penalties.length}
- 조항 후보: ${seed.law_citations.length}
- 결정문 파일-사건 연결 후보: ${seed.file_links.length}

## 사건 상태별

${makeMarkdownTable(
  ["status", "count"],
  topEntries(byStatus).map(([status, count]) => ({ status, count }))
)}

## 대표 문서 확장자별

${makeMarkdownTable(
  ["file_ext", "count"],
  topEntries(byRepresentativeExt).map(([file_ext, count]) => ({ file_ext, count }))
)}

## 처분 후보 상위

${makeMarkdownTable(
  ["sanction_kind", "count"],
  topEntries(bySanction).map(([sanction_kind, count]) => ({ sanction_kind, count }))
)}

## 사건 후보 샘플

${makeMarkdownTable(["date", "idx", "case_no", "entity", "title"], sampleRows)}

## 산출물

- CSV: \`pipc_knowledge_base/90_normalized_data/decision_case_candidates.csv\`
- JSON: \`pipc_knowledge_base/90_normalized_data/decision_case_candidate_seed.json\`
- 리포트: \`pipc_knowledge_base/00_indexes/decision_case_candidate_seed_report.md\`

## 주의

- 금액 후보는 최종 부과액, 기준금액, 감경 후 금액이 섞여 있을 수 있습니다.
- 조항 후보는 아직 korean-law-mcp로 해당 시점 조문 검증을 거치지 않았습니다.
- 회의 안건과 결정문 연결은 현재 \`agenda_items\` 테이블이 비어 있어 다음 단계에서 회의록 안건 파싱 후 수행합니다.
`;

  fs.writeFileSync(reportPath, report, "utf8");
}

const seed = buildSeed();
writeOutputs(seed);

console.log(
  JSON.stringify(
    {
      cases: seed.cases.length,
      entities: seed.entities.length,
      case_entities: seed.case_entities.length,
      sanctions: seed.sanctions.length,
      monetary_penalties: seed.monetary_penalties.length,
      law_citations: seed.law_citations.length,
      file_links: seed.file_links.length,
      csv: path.relative(ROOT, casesCsvPath),
      json: path.relative(ROOT, jsonPath),
      report: path.relative(ROOT, reportPath),
      upload: shouldUpload,
    },
    null,
    2
  )
);

if (shouldUpload) {
  await uploadSeed(seed);
}
