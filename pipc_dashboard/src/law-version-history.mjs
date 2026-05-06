import { DOMParser } from "@xmldom/xmldom";

function asArray(value) {
  if (Array.isArray(value)) return value;
  return value == null ? [] : [value];
}

function compact(value) {
  return String(value || "").replace(/\s+/g, "");
}

function normalizeYmd(value) {
  const match = String(value || "").match(/(\d{4})-?(\d{2})-?(\d{2})/);
  return match ? `${match[1]}${match[2]}${match[3]}` : "";
}

function firstNodeText(node, names = []) {
  for (const name of names) {
    const value = node?.getElementsByTagName(name)?.[0]?.textContent;
    if (value) return value.trim();
  }
  return "";
}

function firstObjectText(object = {}, names = []) {
  for (const name of names) {
    const value = object?.[name];
    if (typeof value === "string" || typeof value === "number") return String(value).trim();
  }
  return "";
}

function lawNameMatches(candidate = "", target = "") {
  const candidateCompact = compact(candidate);
  const targetCompact = compact(target);
  if (!candidateCompact || !targetCompact) return false;
  if (candidateCompact !== targetCompact) return false;

  const targetIsSubordinate = /시행령|시행규칙/.test(target);
  const candidateIsSubordinate = /시행령|시행규칙/.test(candidate);
  return targetIsSubordinate || !candidateIsSubordinate;
}

export function selectEffectiveLawIdentityFromXml(xmlText = "", lawName = "", effectiveDate = "") {
  const targetYmd = normalizeYmd(effectiveDate);
  const doc = new DOMParser().parseFromString(String(xmlText || ""), "text/xml");
  const candidates = Array.from(doc.getElementsByTagName("law"))
    .map((law) => ({
      lawName: firstNodeText(law, ["법령명한글", "법령명"]),
      mst: firstNodeText(law, ["법령일련번호", "MST"]),
      lawId: firstNodeText(law, ["법령ID", "ID"]),
      effectiveDate: firstNodeText(law, ["시행일자", "시행일"]),
    }))
    .filter((law) => lawNameMatches(law.lawName, lawName))
    .filter((law) => !targetYmd || !law.effectiveDate || Number(law.effectiveDate) <= Number(targetYmd))
    .sort((a, b) => Number(b.effectiveDate || 0) - Number(a.effectiveDate || 0));

  return candidates[0] || null;
}

function parseArticleNumber(article = "") {
  const match = String(article || "").match(/제\s*(\d+)\s*조(?:\s*의\s*(\d+))?/);
  if (!match) return null;
  return {
    main: String(Number(match[1])),
    branch: match[2] ? String(Number(match[2])) : "",
  };
}

function articleUnitMatches(unit = {}, article = "") {
  if (unit["조문여부"] !== "조문") return false;
  const target = parseArticleNumber(article);
  if (!target) return false;

  const main = String(Number(firstObjectText(unit, ["조문번호", "조번호"]) || 0));
  const branchRaw = firstObjectText(unit, ["조문가지번호", "조가지번호"]);
  const branch = branchRaw ? String(Number(branchRaw)) : "";

  if (main !== target.main) return false;
  if (!target.branch) return !branch || branch === "0";
  return branch === target.branch;
}

function cleanLine(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function appendNestedUnit(lines, unit, textKeys = [], childKeys = []) {
  const text = cleanLine(firstObjectText(unit, textKeys));
  if (text) lines.push(text);

  for (const childKey of childKeys) {
    for (const child of asArray(unit?.[childKey])) {
      appendNestedUnit(lines, child, [`${childKey}내용`, `${childKey}내용문자열`], ["호", "목"]);
    }
  }
}

function buildArticleBody(unit = {}) {
  const lines = [];
  const articleHeader = cleanLine(firstObjectText(unit, ["조문내용"]));
  if (articleHeader) lines.push(articleHeader);

  for (const paragraph of asArray(unit["항"])) {
    appendNestedUnit(lines, paragraph, ["항내용", "항내용문자열"], ["호", "목"]);
  }

  return [...new Set(lines)].join("\n");
}

export function formatHistoricalLawArticle(jsonText = "", { lawName = "", article = "", effectiveDate = "" } = {}) {
  let payload;
  try {
    payload = JSON.parse(String(jsonText || ""));
  } catch {
    return {
      isError: true,
      lawName,
      effectiveDate,
      articleText: "[NOT_FOUND] 법령 JSON 응답을 해석하지 못했습니다.",
    };
  }

  const law = payload?.["법령"];
  const basic = law?.["기본정보"] || {};
  const units = asArray(law?.["조문"]?.["조문단위"]);
  const unit = units.find((item) => articleUnitMatches(item, article));
  const resolvedLawName = firstObjectText(basic, ["법령명_한글", "법령명한글", "법령명"]) || lawName;
  const promulgationDate = firstObjectText(basic, ["공포일자", "공포일"]);
  const resolvedEffectiveDate = firstObjectText(unit, ["조문시행일자"]) || firstObjectText(basic, ["시행일자", "최종시행일자", "시행일"]) || normalizeYmd(effectiveDate);

  if (!law || !unit) {
    return {
      isError: true,
      lawName: resolvedLawName,
      promulgationDate,
      effectiveDate: resolvedEffectiveDate,
      articleText: `[NOT_FOUND] ${article || "요청 조문"}를 회의일 기준 법령 본문에서 찾을 수 없습니다.`,
    };
  }

  const body = buildArticleBody(unit);
  const title = firstObjectText(unit, ["조문제목"]);
  const titleLine = title ? `${article} ${title}` : article;
  const articleText = [
    `법령명: ${resolvedLawName}`,
    promulgationDate ? `공포일: ${promulgationDate}` : "",
    resolvedEffectiveDate ? `시행일: ${resolvedEffectiveDate}` : "",
    titleLine,
    body,
  ].filter(Boolean).join("\n");

  return {
    isError: false,
    lawName: resolvedLawName,
    promulgationDate,
    effectiveDate: resolvedEffectiveDate,
    articleText,
  };
}

function versionLawName(version = {}) {
  return compact(version.lawName || version.display?.lawName || "");
}

function versionEffectiveDate(version = {}) {
  return normalizeYmd(version.effectiveDate || version.display?.effectiveDate || "");
}

function comparableArticleText(version = {}) {
  return compact(version.display?.articleText || version.articleText || "")
    .replace(/법령명:[^제]+/g, "")
    .replace(/공포일:\d{8}/g, "")
    .replace(/시행일:\d{8}/g, "");
}

export function lawVersionsDiffer(meeting = {}, current = {}) {
  if (meeting?.isError || current?.isError) return false;
  if (meeting?.mst && current?.mst && String(meeting.mst) === String(current.mst)) return false;
  if (versionLawName(meeting) && versionLawName(meeting) === versionLawName(current) && versionEffectiveDate(meeting) && versionEffectiveDate(meeting) === versionEffectiveDate(current)) {
    return false;
  }
  return comparableArticleText(meeting) !== comparableArticleText(current);
}
