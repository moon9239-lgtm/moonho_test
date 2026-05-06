import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DOMParser } from "@xmldom/xmldom";
import { LawApiClient } from "korean-law-mcp/lib/api-client";
import { executeTool } from "korean-law-mcp/lib/cli-executor";
import { formatHistoricalLawArticle, lawVersionsDiffer, selectEffectiveLawIdentityFromXml } from "../src/law-version-history.mjs";

const dashboardRoot = path.resolve(import.meta.dirname, "..");
const root = path.resolve(dashboardRoot, "..");
const lawCacheDir = path.join(dashboardRoot, "data", "law-cache");
const lawCacheVersion = 6;
const envFiles = [
  path.join(dashboardRoot, ".env.local"),
  path.join(dashboardRoot, ".env"),
];

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".gif": "image/gif",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const lawAliases = new Map([
  ["개인정보보호법", "개인정보 보호법"],
  ["보호법", "개인정보 보호법"],
  ["개인정보보호법시행령", "개인정보 보호법 시행령"],
  ["신용정보법", "신용정보의 이용 및 보호에 관한 법률"],
  ["신용정보법시행령", "신용정보의 이용 및 보호에 관한 법률 시행령"],
  ["개인정보보호위원회운영규칙", "개인정보 보호위원회 운영규칙"],
  ["위원회운영규칙", "개인정보 보호위원회 운영규칙"],
  ["운영규칙", "개인정보 보호위원회 운영규칙"],
  ["개인정보의안전성확보조치기준", "개인정보의 안전성 확보조치 기준"],
  ["개인정보의안전성확보조치기준고시", "개인정보의 안전성 확보조치 기준"],
  ["개인정보안전성확보조치기준", "개인정보의 안전성 확보조치 기준"],
  ["개인정보안전성확보조치기준고시", "개인정보의 안전성 확보조치 기준"],
  ["안전성확보조치기준", "개인정보의 안전성 확보조치 기준"],
  ["안전성확보조치기준고시", "개인정보의 안전성 확보조치 기준"],
  ["국가연구개발혁신법", "국가연구개발혁신법"],
  ["연구개발혁신법", "국가연구개발혁신법"],
  ["국가연구개발혁신법시행령", "국가연구개발혁신법 시행령"],
  ["연구개발혁신법시행령", "국가연구개발혁신법 시행령"],
]);

function compact(value) {
  return String(value || "").replace(/\s+/g, "");
}

function parseEnvValue(line) {
  const match = String(line || "").match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (!match) return null;
  let value = match[2].trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return { name: match[1], value };
}

function readLocalEnvValue(name) {
  for (const envFile of envFiles) {
    try {
      const body = fs.readFileSync(envFile, "utf8");
      for (const line of body.split(/\r?\n/)) {
        const parsed = parseEnvValue(line);
        if (parsed?.name === name && parsed.value) return parsed.value;
      }
    } catch {
      // Optional local env files are intentionally ignored when absent.
    }
  }
  return "";
}

function resolveLawApiKey() {
  return process.env.LAW_OC || process.env.KOREAN_LAW_OC || readLocalEnvValue("LAW_OC") || readLocalEnvValue("KOREAN_LAW_OC") || "";
}

const port = Number(process.env.PORT || readLocalEnvValue("PORT") || 5174);
const host = process.env.HOST || readLocalEnvValue("HOST") || "127.0.0.1";

function lawLookupCacheKey({ lawName, article, meetingDate }) {
  const currentDate = toYmd("current");
  return crypto
    .createHash("sha256")
    .update(JSON.stringify({ version: lawCacheVersion, lawName, article, meetingDate, currentDate }))
    .digest("hex");
}

async function readLawLookupCache(cacheKey) {
  try {
    const cachePath = path.join(lawCacheDir, `${cacheKey}.json`);
    const cached = JSON.parse(await fs.promises.readFile(cachePath, "utf8"));
    return cached?.ok && !hasLookupError(cached) ? cached : null;
  } catch {
    return null;
  }
}

async function writeLawLookupCache(cacheKey, payload) {
  if (!payload?.ok || hasLookupError(payload)) return;
  await fs.promises.mkdir(lawCacheDir, { recursive: true });
  const cachePath = path.join(lawCacheDir, `${cacheKey}.json`);
  await fs.promises.writeFile(cachePath, JSON.stringify(payload, null, 2), "utf8");
}

function normalizeLawQuery(value) {
  const key = compact(value);
  return lawAliases.get(key) || String(value || "").replace(/\s+/g, " ").trim();
}

function isAdminRuleQuery(lawName) {
  const key = compact(lawName);
  return key.includes("운영규칙")
    || key.includes("안전성확보조치기준")
    || /(?:고시|훈령|예규|지침|내규)/.test(key);
}

function articleToJo(value) {
  const match = String(value || "").match(/제\s*(\d+)\s*조(?:\s*의\s*(\d+))?/);
  if (!match) return "";
  return `${String(Number(match[1])).padStart(4, "0")}${String(Number(match[2] || 0)).padStart(2, "0")}`;
}

function toYmd(value) {
  if (!value || value === "current") {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  }
  const match = String(value).match(/(\d{4})-?(\d{2})-?(\d{2})/);
  return match ? `${match[1]}${match[2]}${match[3]}` : "";
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function firstText(node, names = []) {
  for (const name of names) {
    const value = node?.getElementsByTagName(name)?.[0]?.textContent;
    if (value) return value;
  }
  return "";
}

function pickFirstLawFromXml(xmlText, lawName) {
  const doc = new DOMParser().parseFromString(xmlText, "text/xml");
  const items = asArray(Array.from(doc.getElementsByTagName("law")));
  const normalized = compact(lawName);
  return items.find((item) => compact(firstText(item, ["법령명한글", "법령명"])).includes(normalized)) || items[0] || null;
}

function lawIdentityFromXml(xmlText, lawName) {
  const law = pickFirstLawFromXml(xmlText, lawName);
  if (!law) return null;
  return {
    lawName: firstText(law, ["법령명한글", "법령명"]) || lawName,
    mst: firstText(law, ["법령일련번호", "MST"]),
    lawId: firstText(law, ["법령ID", "ID"]),
  };
}

function extractArticleText(payload) {
  const text = String(payload || "");
  return text.length > 1600 ? `${text.slice(0, 1600)}...` : text;
}

function compactArticleText(text = "") {
  return String(text || "")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseLawDisplay(text = "", fallback = {}) {
  const source = compactArticleText(text);
  const lawName = source.match(/(?:법령명|행정규칙명):\s*([^\n]+?)(?:\s+공포일:|\n|$)/)?.[1]?.trim() || fallback.lawName || "";
  const promulgationDate = source.match(/공포일:\s*(\d{8})/)?.[1] || "";
  const effectiveDate = source.match(/시행일:\s*(\d{8})|시행일자:\s*(\d{8})/)?.[1] || source.match(/시행일:\s*(\d{8})|시행일자:\s*(\d{8})/)?.[2] || fallback.effectiveDate || "";
  const articleMatch = source.match(/(제\s*\d+\s*조(?:의\s*\d+)?(?:\([^)]+\))?)([\s\S]*)/);
  const articleTitle = articleMatch?.[1]?.replace(/\s+/g, " ").trim() || fallback.article || "";
  const articleText = articleMatch?.[0]?.trim() || source || fallback.summary || "";

  return {
    lawName,
    articleTitle,
    articleText,
    promulgationDate,
    effectiveDate,
  };
}

function effectiveDateFromText(text) {
  const match = String(text || "").match(/시행일:\s*(\d{8})|시행일자:\s*(\d{8})/);
  return match ? match[1] || match[2] : "";
}

function isLookupNotFound(version = {}) {
  const text = String(version.articleText || version.summary || "");
  return version.isError || text.includes("[NOT_FOUND]") || text.includes("법령 데이터를 찾을 수 없습니다") || text.includes("행정규칙 전문을 조회할 수 없습니다");
}

function hasLookupError(payload = {}) {
  return isLookupNotFound(payload.meeting) || isLookupNotFound(payload.current);
}

function mcpText(result) {
  return (result?.content || []).map((item) => item?.text || "").filter(Boolean).join("\n");
}

function adminRuleSearchField(text, label) {
  return String(text || "").match(new RegExp(`${label}:\\s*([^\\s\\n]+)`))?.[1] || "";
}

function adminRuleLookupIdFromSearch(text) {
  return adminRuleSearchField(text, "행정규칙일련번호") || adminRuleSearchField(text, "행정규칙ID");
}

function adminRuleIdFromSearch(text) {
  return adminRuleSearchField(text, "행정규칙ID");
}

function adminRulePromulgationDateFromSearch(text) {
  return adminRuleSearchField(text, "공포일");
}

function fallbackAdminRuleArticleText(lawName, article) {
  if (compact(lawName) !== "개인정보보호위원회운영규칙") return "";
  if (!/^제\s*12\s*조/.test(String(article || ""))) return "";
  return [
    "행정규칙명: 개인정보 보호위원회 운영규칙",
    "공포일: 20200811",
    "",
    "제12조(회의의 공개와 방청) ① 보호위원회의 회의는 공개를 원칙으로 한다. 다만, 상정 안건이 다음 각 호의 어느 하나에 해당하는 경우에는 보호위원회의 의결로 공개하지 아니할 수 있다.",
    "1. 공개하는 경우 국가안전보장을 해할 우려가 있는 경우",
    "2. 법령에 의하여 비밀로 분류되거나 공개가 제한된 경우",
    "3. 개인ㆍ법인 및 그 밖의 단체의 명예를 훼손하거나 정당한 이익을 해할 우려가 있다고 인정되는 경우",
    "4. 감사ㆍ감독ㆍ검사ㆍ규제ㆍ입찰계약ㆍ인사관리ㆍ의사결정 과정 또는 내부 검토과정에 있는 사항 등으로 공개될 경우 공정한 업무수행에 현저한 지장을 초래할 우려가 있는 경우",
    "5. 그 밖에 공익상 필요가 있는 등 보호위원회에서 공개하는 것이 적절하지 않은 상당한 이유가 있는 경우",
    "② 위원장은 회의의 의사일정을 회의 개최 2일 전까지 위원회 홈페이지를 통해 공표한다. 다만, 긴급을 요하거나 부득이한 사유가 있는 경우에는 그러하지 아니하다.",
    "③ 보호위원회의 공개되는 회의는 방청할 수 있으며 방청을 희망하는 자는 회의 개최 1일 전까지 별지 제5호서식의 신청서를 제출하여 위원장의 허가를 받아야 한다.",
    "④ 위원장은 회의장 사정과 회의의 질서유지 등을 위하여 필요한 때에는 방청인 수 및 방청의 방법을 제한할 수 있다.",
    "⑤ 위원장은 방청인이 다음 각 호의 어느 하나에 해당하는 경우 퇴장을 명할 수 있다.",
    "1. 사전 허가 없이 녹음ㆍ녹화ㆍ촬영 등을 하는 자",
    "2. 회의 내용에 대해 의견을 표시하거나 신호로써 영향을 주는 행위를 하는 자",
    "3. 그 밖에 회의 진행에 지장을 준다고 위원장이 판단한 자",
  ].join("\n");
}

function extractArticleBlock(text, article) {
  const baseArticle = String(article || "").match(/제\s*\d+\s*조(?:\s*의\s*\d+)?/)?.[0]?.replace(/\s+/g, "\\s*");
  if (!baseArticle) return compactArticleText(text);
  const articleRegex = new RegExp(`(${baseArticle}(?:\\([^\\n]+?\\))?[\\s\\S]*?)(?=\\n\\s*제\\s*\\d+\\s*조(?:\\s*의\\s*\\d+)?(?:\\(|\\s|$)|$)`);
  return compactArticleText(String(text || "").match(articleRegex)?.[1] || text);
}

async function lookupAdminRuleVersion({ oc, lawName, article, date }) {
  const query = normalizeLawQuery(lawName);
  const apiClient = new LawApiClient({ apiKey: oc });
  const searchResult = await executeTool(apiClient, "search_admin_rule", {
    query,
    display: 5,
    apiKey: oc,
  });
  const searchText = mcpText(searchResult);
  const ruleLookupId = adminRuleLookupIdFromSearch(searchText);
  const ruleId = adminRuleIdFromSearch(searchText);
  const promulgationDate = adminRulePromulgationDateFromSearch(searchText);
  if (!ruleLookupId) {
    return {
      effectiveDate: date || "current",
      lawName: query,
      article,
      articleText: searchText || "행정규칙 검색 결과가 없습니다.",
      display: parseLawDisplay(searchText, { lawName: query, article, effectiveDate: date || "current" }),
      isError: Boolean(searchResult?.isError) || true,
    };
  }

  const result = await executeTool(apiClient, "get_admin_rule", {
    id: ruleLookupId,
    apiKey: oc,
  });
  const text = mcpText(result);
  const fallbackText = fallbackAdminRuleArticleText(query, article);
  const shouldUseFallback = isLookupNotFound({ articleText: text, isError: result?.isError }) && fallbackText;
  const articleText = shouldUseFallback ? fallbackText : extractArticleBlock(text, article);
  const display = parseLawDisplay(articleText, {
    lawName: query,
    article,
    effectiveDate: date || "current",
  });
  if (!display.promulgationDate && promulgationDate) display.promulgationDate = promulgationDate;
  return {
    effectiveDate: date || "current",
    lawName: query,
    adminRuleId: ruleId,
    adminRuleLookupId: ruleLookupId,
    article,
    articleCode: articleToJo(article),
    articleText: extractArticleText(articleText),
    display,
    isError: shouldUseFallback ? false : Boolean(result?.isError),
    fallbackSource: shouldUseFallback ? "local-admin-rule-snapshot" : undefined,
  };
}

async function lookupHistoricalLawVersion({ apiClient, oc, lawName, article, date }) {
  const targetYmd = toYmd(date);
  const historyXml = await apiClient.fetchApi({
    endpoint: "lawSearch.do",
    target: "eflaw",
    type: "XML",
    extraParams: {
      query: lawName,
      display: "100",
      efYd: targetYmd,
    },
    apiKey: oc,
  });
  const historicalLaw = selectEffectiveLawIdentityFromXml(historyXml, lawName, targetYmd);
  if (!historicalLaw?.mst) {
    return {
      effectiveDate: date || "current",
      lawName,
      article,
      articleText: "회의일 기준으로 시행 중인 법령 버전을 찾지 못했습니다.",
      display: parseLawDisplay("", { lawName, article, effectiveDate: date || "current" }),
      isError: true,
    };
  }

  const lawJson = await apiClient.fetchApi({
    endpoint: "lawService.do",
    target: "law",
    type: "JSON",
    extraParams: { MST: historicalLaw.mst },
    apiKey: oc,
  });
  const formatted = formatHistoricalLawArticle(lawJson, {
    lawName: historicalLaw.lawName || lawName,
    article,
    effectiveDate: historicalLaw.effectiveDate || targetYmd,
  });
  const display = parseLawDisplay(formatted.articleText, {
    lawName: formatted.lawName || historicalLaw.lawName || lawName,
    article,
    effectiveDate: formatted.effectiveDate || historicalLaw.effectiveDate || date || "current",
  });
  return {
    effectiveDate: formatted.effectiveDate || historicalLaw.effectiveDate || date || "current",
    lawName: formatted.lawName || historicalLaw.lawName || lawName,
    mst: historicalLaw.mst,
    lawId: historicalLaw.lawId,
    article,
    articleCode: articleToJo(article),
    articleText: extractArticleText(formatted.articleText),
    display,
    isError: Boolean(formatted.isError),
    source: "lawService:law",
  };
}

async function lookupLawVersion({ oc, lawName, article, date }) {
  const query = normalizeLawQuery(lawName);
  if (!query || !articleToJo(article)) {
    return { effectiveDate: date || "current", summary: "법률명 또는 조문 번호를 확인하지 못했습니다." };
  }
  if (isAdminRuleQuery(query)) {
    return lookupAdminRuleVersion({ oc, lawName: query, article, date });
  }

  const apiClient = new LawApiClient({ apiKey: oc });
  if (date && date !== "current") {
    return lookupHistoricalLawVersion({ apiClient, oc, lawName: query, article, date });
  }

  const searchXml = await apiClient.searchLaw(query, oc, 20);
  const law = lawIdentityFromXml(searchXml, query);
  if (!law?.mst && !law?.lawId) {
    return { effectiveDate: date || "current", summary: "법령 검색 결과가 없습니다." };
  }

  const result = await executeTool(apiClient, "get_law_text", {
    mst: date === "current" ? law.mst || undefined : undefined,
    lawId: date !== "current" ? law.lawId || undefined : law.mst ? undefined : law.lawId || undefined,
    jo: article,
    efYd: date === "current" ? undefined : toYmd(date),
    apiKey: oc,
  });
  const text = mcpText(result);
  const normalizedEffectiveDate = date === "current" ? effectiveDateFromText(text) || "current" : date;
  const display = parseLawDisplay(text, {
    lawName: law.lawName || query,
    article,
    effectiveDate: normalizedEffectiveDate || "current",
  });
  return {
    effectiveDate: normalizedEffectiveDate || "current",
    lawName: law.lawName || query,
    mst: law.mst,
    lawId: law.lawId,
    article,
    articleCode: articleToJo(article),
    articleText: extractArticleText(text),
    display,
    isError: Boolean(result?.isError),
  };
}

async function handleLawLookup(req, res) {
  const url = new URL(req.url || "/", `http://${host}:${port}`);
  const lawName = normalizeLawQuery(url.searchParams.get("lawName") || "");
  const article = url.searchParams.get("article") || "";
  const meetingDate = url.searchParams.get("meetingDate") || "";
  const oc = resolveLawApiKey();
  const cacheKey = lawLookupCacheKey({ lawName, article, meetingDate });

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  const cached = await readLawLookupCache(cacheKey);
  if (cached) {
    res.writeHead(200);
    res.end(JSON.stringify({
      ...cached,
      cache: {
        ...(cached.cache || {}),
        hit: true,
        key: cacheKey,
      },
    }));
    return;
  }

  if (!oc) {
    res.writeHead(200);
    res.end(JSON.stringify({
      ok: false,
      status: "needs_credentials",
      resolvedLawName: lawName,
      note: "LAW_OC 또는 KOREAN_LAW_OC 환경변수가 없어 실제 조문 조회를 건너뛰었습니다. 값이 있으면 법제처 시행일 기준 조문을 조회합니다.",
      meeting: { effectiveDate: meetingDate, summary: "회의 당시 조문 조회 대기" },
      current: { effectiveDate: "current", summary: "현재 조문 조회 대기" },
    }));
    return;
  }

  try {
    const current = await lookupLawVersion({ oc, lawName, article, date: "current" });
    let meeting = await lookupLawVersion({ oc, lawName, article, date: meetingDate });
    const changed = lawVersionsDiffer(meeting, current);
    const payload = {
      ok: true,
      source: "korean-law-mcp",
      resolvedLawName: lawName,
      meeting,
      current,
      changed,
      cache: {
        hit: false,
        key: cacheKey,
        cachedAt: new Date().toISOString(),
      },
    };
    await writeLawLookupCache(cacheKey, payload);
    res.writeHead(200);
    res.end(JSON.stringify(payload));
  } catch (error) {
    res.writeHead(500);
    res.end(JSON.stringify({
      ok: false,
      status: "lookup_error",
      resolvedLawName: lawName,
      note: error?.message || "조문 조회 실패",
    }));
  }
}

function resolveRequestPath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
  let relativePath = cleanPath.replace(/^\/+/, "");
  if (relativePath === "pipc_dashboard" || relativePath === "pipc_dashboard/") {
    relativePath = "pipc_dashboard/index-fixed.html";
  }
  const filePath = path.resolve(root, relativePath);
  if (!filePath.startsWith(root)) return null;
  return filePath;
}

const server = http.createServer((req, res) => {
  if ((req.url || "/").split("?")[0] === "/api/law-lookup") {
    handleLawLookup(req, res).catch((error) => {
      res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({
        ok: false,
        status: "server_error",
        note: error?.message || "Law lookup failed",
      }));
    });
    return;
  }

  if ((req.url || "/").split("?")[0] === "/") {
    res.writeHead(302, { Location: "/pipc_dashboard/" });
    res.end();
    return;
  }

  const filePath = resolveRequestPath(req.url || "/");
  if (!filePath) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, body) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(body);
  });
});

server.listen(port, host, () => {
  console.log(`PIPC dashboard: http://${host}:${port}/`);
});
