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
const agendaPreparationPath = path.join(dashboardRoot, "data", "agenda-preparations.json");
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
  ["ê°œì¸?•ë³´ë³´í˜¸ë²?, "ê°œì¸?•ë³´ ë³´í˜¸ë²?],
  ["ë³´í˜¸ë²?, "ê°œì¸?•ë³´ ë³´í˜¸ë²?],
  ["ê°œì¸?•ë³´ë³´í˜¸ë²•ì‹œ?‰ë ¹", "ê°œì¸?•ë³´ ë³´í˜¸ë²??œí–‰??],
  ["? ìš©?•ë³´ë²?, "? ìš©?•ë³´???´ìš© ë°?ë³´í˜¸??ê´€??ë²•ë¥ "],
  ["? ìš©?•ë³´ë²•ì‹œ?‰ë ¹", "? ìš©?•ë³´???´ìš© ë°?ë³´í˜¸??ê´€??ë²•ë¥  ?œí–‰??],
  ["ê°œì¸?•ë³´ë³´í˜¸?„ì›?Œìš´?ê·œì¹?, "ê°œì¸?•ë³´ ë³´í˜¸?„ì›???´ì˜ê·œì¹™"],
  ["?„ì›?Œìš´?ê·œì¹?, "ê°œì¸?•ë³´ ë³´í˜¸?„ì›???´ì˜ê·œì¹™"],
  ["?´ì˜ê·œì¹™", "ê°œì¸?•ë³´ ë³´í˜¸?„ì›???´ì˜ê·œì¹™"],
  ["ê°œì¸?•ë³´?˜ì•ˆ?„ì„±?•ë³´ì¡°ì¹˜ê¸°ì?", "ê°œì¸?•ë³´???ˆì „???•ë³´ì¡°ì¹˜ ê¸°ì?"],
  ["ê°œì¸?•ë³´?˜ì•ˆ?„ì„±?•ë³´ì¡°ì¹˜ê¸°ì?ê³ ì‹œ", "ê°œì¸?•ë³´???ˆì „???•ë³´ì¡°ì¹˜ ê¸°ì?"],
  ["ê°œì¸?•ë³´?ˆì „?±í™•ë³´ì¡°ì¹˜ê¸°ì¤€", "ê°œì¸?•ë³´???ˆì „???•ë³´ì¡°ì¹˜ ê¸°ì?"],
  ["ê°œì¸?•ë³´?ˆì „?±í™•ë³´ì¡°ì¹˜ê¸°ì¤€ê³ ì‹œ", "ê°œì¸?•ë³´???ˆì „???•ë³´ì¡°ì¹˜ ê¸°ì?"],
  ["?ˆì „?±í™•ë³´ì¡°ì¹˜ê¸°ì¤€", "ê°œì¸?•ë³´???ˆì „???•ë³´ì¡°ì¹˜ ê¸°ì?"],
  ["?ˆì „?±í™•ë³´ì¡°ì¹˜ê¸°ì¤€ê³ ì‹œ", "ê°œì¸?•ë³´???ˆì „???•ë³´ì¡°ì¹˜ ê¸°ì?"],
  ["êµ???°êµ¬ê°œë°œ?ì‹ ë²?, "êµ???°êµ¬ê°œë°œ?ì‹ ë²?],
  ["?°êµ¬ê°œë°œ?ì‹ ë²?, "êµ???°êµ¬ê°œë°œ?ì‹ ë²?],
  ["êµ???°êµ¬ê°œë°œ?ì‹ ë²•ì‹œ?‰ë ¹", "êµ???°êµ¬ê°œë°œ?ì‹ ë²??œí–‰??],
  ["?°êµ¬ê°œë°œ?ì‹ ë²•ì‹œ?‰ë ¹", "êµ???°êµ¬ê°œë°œ?ì‹ ë²??œí–‰??],
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
const host = process.env.HOST || readLocalEnvValue("HOST") || "0.0.0.0";

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
  return key.includes("?´ì˜ê·œì¹™")
    || key.includes("?ˆì „?±í™•ë³´ì¡°ì¹˜ê¸°ì¤€")
    || /(?:ê³ ì‹œ|?ˆë ¹|?ˆê·œ|ì§€ì¹??´ê·œ)/.test(key);
}

function articleToJo(value) {
  const match = String(value || "").match(/??s*(\d+)\s*ì¡??:\s*??s*(\d+))?/);
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
  return items.find((item) => compact(firstText(item, ["ë²•ë ¹ëª…í•œê¸€", "ë²•ë ¹ëª?])).includes(normalized)) || items[0] || null;
}

function lawIdentityFromXml(xmlText, lawName) {
  const law = pickFirstLawFromXml(xmlText, lawName);
  if (!law) return null;
  return {
    lawName: firstText(law, ["ë²•ë ¹ëª…í•œê¸€", "ë²•ë ¹ëª?]) || lawName,
    mst: firstText(law, ["ë²•ë ¹?¼ë ¨ë²ˆí˜¸", "MST"]),
    lawId: firstText(law, ["ë²•ë ¹ID", "ID"]),
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

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeAgendaPreparationItem(raw = {}) {
  const title = String(raw.title || "").trim();
  const summary = String(raw.summary || "").trim();
  if (!title || !summary) return null;
  return {
    id: String(raw.id || crypto.randomUUID()),
    title,
    summary,
    result: isRecord(raw.result) ? raw.result : null,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.createdAt || new Date().toISOString(),
  };
}

async function readAgendaPreparations() {
  try {
    const existing = JSON.parse(await fs.promises.readFile(agendaPreparationPath, "utf8"));
    if (!Array.isArray(existing)) return [];
    return existing
      .map((item) => normalizeAgendaPreparationItem(item))
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function writeAgendaPreparations(items) {
  await fs.promises.mkdir(path.dirname(agendaPreparationPath), { recursive: true });
  await fs.promises.writeFile(agendaPreparationPath, JSON.stringify(items, null, 2), "utf8");
}

function clampJsonBody(value, fallback = null) {
  try {
    return value == null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function collectRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += String(chunk || "");
      if (body.length > 1_500_000) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function sanitizeAgendaPreparations(items = []) {
  return items
    .map((item) => {
      return {
        ...item,
        title: String(item.title || "").slice(0, 280),
        summary: String(item.summary || "").slice(0, 5000),
      };
    })
    .slice(-200);
}

function parseAgendaPreparationBody(json = {}) {
  const title = String(json.title || "").trim();
  const summary = String(json.summary || "").trim();
  if (!title || !summary) return null;
  return {
    ...json,
    title,
    summary,
    result: isRecord(json.result) ? json.result : null,
  };
}

function parseLawDisplay(text = "", fallback = {}) {
  const source = compactArticleText(text);
  const lawName = source.match(/(?:ë²•ë ¹ëª??‰ì •ê·œì¹™ëª?:\s*([^\n]+?)(?:\s+ê³µí¬??|\n|$)/)?.[1]?.trim() || fallback.lawName || "";
  const promulgationDate = source.match(/ê³µí¬??\s*(\d{8})/)?.[1] || "";
  const effectiveDate = source.match(/?œí–‰??\s*(\d{8})|?œí–‰?¼ìž:\s*(\d{8})/)?.[1] || source.match(/?œí–‰??\s*(\d{8})|?œí–‰?¼ìž:\s*(\d{8})/)?.[2] || fallback.effectiveDate || "";
  const articleMatch = source.match(/(??s*\d+\s*ì¡??:??s*\d+)?(?:\([^)]+\))?)([\s\S]*)/);
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
  const match = String(text || "").match(/?œí–‰??\s*(\d{8})|?œí–‰?¼ìž:\s*(\d{8})/);
  return match ? match[1] || match[2] : "";
}

function isLookupNotFound(version = {}) {
  const text = String(version.articleText || version.summary || "");
  return version.isError || text.includes("[NOT_FOUND]") || text.includes("ë²•ë ¹ ?°ì´?°ë? ì°¾ì„ ???†ìŠµ?ˆë‹¤") || text.includes("?‰ì •ê·œì¹™ ?„ë¬¸??ì¡°íšŒ?????†ìŠµ?ˆë‹¤");
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
  return adminRuleSearchField(text, "?‰ì •ê·œì¹™?¼ë ¨ë²ˆí˜¸") || adminRuleSearchField(text, "?‰ì •ê·œì¹™ID");
}

function adminRuleIdFromSearch(text) {
  return adminRuleSearchField(text, "?‰ì •ê·œì¹™ID");
}

function adminRulePromulgationDateFromSearch(text) {
  return adminRuleSearchField(text, "ê³µí¬??);
}

function fallbackAdminRuleArticleText(lawName, article) {
  if (compact(lawName) !== "ê°œì¸?•ë³´ë³´í˜¸?„ì›?Œìš´?ê·œì¹?) return "";
  if (!/^??s*12\s*ì¡?.test(String(article || ""))) return "";
  return [
    "?‰ì •ê·œì¹™ëª? ê°œì¸?•ë³´ ë³´í˜¸?„ì›???´ì˜ê·œì¹™",
    "ê³µí¬?? 20200811",
    "",
    "??2ì¡??Œì˜??ê³µê°œ?€ ë°©ì²­) ??ë³´í˜¸?„ì›?Œì˜ ?Œì˜??ê³µê°œë¥??ì¹™?¼ë¡œ ?œë‹¤. ?¤ë§Œ, ?ì • ?ˆê±´???¤ìŒ ê°??¸ì˜ ?´ëŠ ?˜ë‚˜???´ë‹¹?˜ëŠ” ê²½ìš°?ëŠ” ë³´í˜¸?„ì›?Œì˜ ?˜ê²°ë¡?ê³µê°œ?˜ì? ?„ë‹ˆ?????ˆë‹¤.",
    "1. ê³µê°œ?˜ëŠ” ê²½ìš° êµ???ˆì „ë³´ìž¥???´í•  ?°ë ¤ê°€ ?ˆëŠ” ê²½ìš°",
    "2. ë²•ë ¹???˜í•˜??ë¹„ë?ë¡?ë¶„ë¥˜?˜ê±°??ê³µê°œê°€ ?œí•œ??ê²½ìš°",
    "3. ê°œì¸?ë²•??ë°?ê·?ë°–ì˜ ?¨ì²´??ëª…ì˜ˆë¥??¼ì†?˜ê±°???•ë‹¹???´ìµ???´í•  ?°ë ¤ê°€ ?ˆë‹¤ê³??¸ì •?˜ëŠ” ê²½ìš°",
    "4. ê°ì‚¬?ê°?…ã†ê²€?¬ã†ê·œì œ?ìž…ì°°ê³„?½ã†?¸ì‚¬ê´€ë¦¬ã†?˜ì‚¬ê²°ì • ê³¼ì • ?ëŠ” ?´ë? ê²€? ê³¼?•ì— ?ˆëŠ” ?¬í•­ ?±ìœ¼ë¡?ê³µê°œ??ê²½ìš° ê³µì •???…ë¬´?˜í–‰???„ì???ì§€?¥ì„ ì´ˆëž˜???°ë ¤ê°€ ?ˆëŠ” ê²½ìš°",
    "5. ê·?ë°–ì— ê³µìµ???„ìš”ê°€ ?ˆëŠ” ??ë³´í˜¸?„ì›?Œì—??ê³µê°œ?˜ëŠ” ê²ƒì´ ?ì ˆ?˜ì? ?Šì? ?ë‹¹???´ìœ ê°€ ?ˆëŠ” ê²½ìš°",
    "???„ì›?¥ì? ?Œì˜???˜ì‚¬?¼ì •???Œì˜ ê°œìµœ 2???„ê¹Œì§€ ?„ì›???ˆíŽ˜?´ì?ë¥??µí•´ ê³µí‘œ?œë‹¤. ?¤ë§Œ, ê¸´ê¸‰???”í•˜ê±°ë‚˜ ë¶€?ì´???¬ìœ ê°€ ?ˆëŠ” ê²½ìš°?ëŠ” ê·¸ëŸ¬?˜ì? ?„ë‹ˆ?˜ë‹¤.",
    "??ë³´í˜¸?„ì›?Œì˜ ê³µê°œ?˜ëŠ” ?Œì˜??ë°©ì²­?????ˆìœ¼ë©?ë°©ì²­???¬ë§?˜ëŠ” ?ëŠ” ?Œì˜ ê°œìµœ 1???„ê¹Œì§€ ë³„ì? ???¸ì„œ?ì˜ ? ì²­?œë? ?œì¶œ?˜ì—¬ ?„ì›?¥ì˜ ?ˆê?ë¥?ë°›ì•„???œë‹¤.",
    "???„ì›?¥ì? ?Œì˜???¬ì •ê³??Œì˜??ì§ˆì„œ? ì? ?±ì„ ?„í•˜???„ìš”???Œì—??ë°©ì²­????ë°?ë°©ì²­??ë°©ë²•???œí•œ?????ˆë‹¤.",
    "???„ì›?¥ì? ë°©ì²­?¸ì´ ?¤ìŒ ê°??¸ì˜ ?´ëŠ ?˜ë‚˜???´ë‹¹?˜ëŠ” ê²½ìš° ?´ìž¥??ëª…í•  ???ˆë‹¤.",
    "1. ?¬ì „ ?ˆê? ?†ì´ ?¹ìŒ?ë…¹?”ã†ì´¬ì˜ ?±ì„ ?˜ëŠ” ??,
    "2. ?Œì˜ ?´ìš©???€???˜ê²¬???œì‹œ?˜ê±°??? í˜¸ë¡œì¨ ?í–¥??ì£¼ëŠ” ?‰ìœ„ë¥??˜ëŠ” ??,
    "3. ê·?ë°–ì— ?Œì˜ ì§„í–‰??ì§€?¥ì„ ì¤€?¤ê³  ?„ì›?¥ì´ ?ë‹¨????,
  ].join("\n");
}

function extractArticleBlock(text, article) {
  const baseArticle = String(article || "").match(/??s*\d+\s*ì¡??:\s*??s*\d+)?/)?.[0]?.replace(/\s+/g, "\\s*");
  if (!baseArticle) return compactArticleText(text);
  const articleRegex = new RegExp(`(${baseArticle}(?:\\([^\\n]+?\\))?[\\s\\S]*?)(?=\\n\\s*??\s*\\d+\\s*ì¡??:\\s*??\s*\\d+)?(?:\\(|\\s|$)|$)`);
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
      articleText: searchText || "?‰ì •ê·œì¹™ ê²€??ê²°ê³¼ê°€ ?†ìŠµ?ˆë‹¤.",
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
      articleText: "?Œì˜??ê¸°ì??¼ë¡œ ?œí–‰ ì¤‘ì¸ ë²•ë ¹ ë²„ì „??ì°¾ì? ëª»í–ˆ?µë‹ˆ??",
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
    return { effectiveDate: date || "current", summary: "ë²•ë¥ ëª??ëŠ” ì¡°ë¬¸ ë²ˆí˜¸ë¥??•ì¸?˜ì? ëª»í–ˆ?µë‹ˆ??" };
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
    return { effectiveDate: date || "current", summary: "ë²•ë ¹ ê²€??ê²°ê³¼ê°€ ?†ìŠµ?ˆë‹¤." };
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
      note: "LAW_OC ?ëŠ” KOREAN_LAW_OC ?˜ê²½ë³€?˜ê? ?†ì–´ ?¤ì œ ì¡°ë¬¸ ì¡°íšŒë¥?ê±´ë„ˆ?°ì—ˆ?µë‹ˆ?? ê°’ì´ ?ˆìœ¼ë©?ë²•ì œì²??œí–‰??ê¸°ì? ì¡°ë¬¸??ì¡°íšŒ?©ë‹ˆ??",
      meeting: { effectiveDate: meetingDate, summary: "?Œì˜ ?¹ì‹œ ì¡°ë¬¸ ì¡°íšŒ ?€ê¸? },
      current: { effectiveDate: "current", summary: "?„ìž¬ ì¡°ë¬¸ ì¡°íšŒ ?€ê¸? },
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
      note: error?.message || "ì¡°ë¬¸ ì¡°íšŒ ?¤íŒ¨",
    }));
  }
}

async function handleAgendaPreparationApi(req, res) {
  const base = new URL(req.url || "/", `http://${host}:${port}`);
  const method = (req.method || "GET").toUpperCase();
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  if (method === "GET") {
    const allItems = sanitizeAgendaPreparations(await readAgendaPreparations())
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    res.writeHead(200);
    res.end(JSON.stringify({ ok: true, items: allItems }));
    return;
  }

  if (method === "POST") {
    const body = clampJsonBody(await collectRequestBody(req), null);
    const normalized = parseAgendaPreparationBody(body);
    if (!normalized) {
      res.writeHead(400);
      res.end(JSON.stringify({
        ok: false,
        status: "invalid_payload",
        note: "title, summaryê°€ ?„ìš”?©ë‹ˆ??",
      }));
      return;
    }
    const now = new Date().toISOString();
    const currentItems = sanitizeAgendaPreparations(await readAgendaPreparations());
    const nextItem = {
      id: crypto.randomUUID(),
      title: normalized.title,
      summary: normalized.summary,
      result: normalized.result || null,
      createdAt: now,
      updatedAt: now,
    };

    const merged = [...currentItems.filter((item) => !(item.title === nextItem.title && item.summary === nextItem.summary)), nextItem];
    await writeAgendaPreparations(merged);

    res.writeHead(201);
    res.end(JSON.stringify({ ok: true, item: nextItem }));
    return;
  }

  res.writeHead(405);
  res.end(JSON.stringify({ ok: false, status: "method_not_allowed" }));
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

  if ((req.url || "/").split("?")[0] === "/api/agenda-preparations") {
    handleAgendaPreparationApi(req, res).catch((error) => {
      res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({
        ok: false,
        status: "server_error",
        note: error?.message || "Agenda preparation API failed",
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

