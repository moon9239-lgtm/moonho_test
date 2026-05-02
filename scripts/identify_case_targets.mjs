import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "yfrjdbsaulawwqmuozao";
const API_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const outDir = path.join(ROOT, "pipc_knowledge_base", "90_normalized_data");
const indexDir = path.join(ROOT, "pipc_knowledge_base", "00_indexes");
const csvPath = path.join(outDir, "case_target_identification_candidates.csv");
const sqlPath = path.join(outDir, "case_target_identification_updates.sql");
const reportPath = path.join(indexDir, "case_target_identification_report.md");

const args = new Set(process.argv.slice(2));
const shouldUpload = args.has("--upload");
const includeIdentified = args.has("--all");

const querySql = `
with case_files as (
  select
    dc.id as case_id,
    array_remove(array_agg(distinct df.attachment_name order by df.attachment_name), null) as attachment_names,
    array_remove(array_agg(distinct dfs.raw_md_path order by dfs.raw_md_path), null) as decision_raw_paths
  from public.decision_cases dc
  left join public.decision_files df on df.decision_case_id = dc.id
  left join public.source_documents dfs on dfs.id = df.source_document_id
  group by dc.id
),
post_meetings as (
  select
    dp.id as decision_post_id,
    array_remove(array_agg(distinct m.title order by m.title), null) as meeting_titles,
    array_remove(array_agg(distinct m.meeting_date::text order by m.meeting_date::text), null) as meeting_dates,
    array_remove(array_agg(distinct sdt.raw_md_path order by sdt.raw_md_path), null) as transcript_paths,
    array_remove(array_agg(distinct sdm.raw_md_path order by sdm.raw_md_path), null) as minutes_paths,
    coalesce(max(meeting_post_counts.decision_post_count), 0) as max_meeting_decision_post_count
  from public.decision_posts dp
  left join public.agenda_decision_links adl on adl.decision_post_id = dp.id
  left join public.agenda_items ai on ai.id = adl.agenda_item_id
  left join public.meetings m on m.id = ai.meeting_id
  left join public.source_documents sdt on sdt.id = m.transcript_document_id
  left join public.source_documents sdm on sdm.id = m.minutes_document_id
  left join (
    select
      m2.id as meeting_id,
      count(distinct adl2.decision_post_id)::int as decision_post_count
    from public.meetings m2
    left join public.agenda_items ai2 on ai2.meeting_id = m2.id
    left join public.agenda_decision_links adl2 on adl2.agenda_item_id = ai2.id
    group by m2.id
  ) meeting_post_counts on meeting_post_counts.meeting_id = m.id
  group by dp.id
),
post_case_counts as (
  select
    decision_post_id,
    count(*)::int as cases_in_post
  from public.decision_cases
  group by decision_post_id
)
select
  dc.case_key,
  dc.case_no,
  dc.title as case_title,
  dc.decision_date::text as decision_date,
  dc.main_entity_id is not null as already_identified,
  dp.pipc_idx_id,
  dp.title as decision_post_title,
  dp.decision_date::text as post_decision_date,
  dp.detail_url,
  coalesce(pcc.cases_in_post, 0) as cases_in_post,
  coalesce(pm.max_meeting_decision_post_count, 0) as max_meeting_decision_post_count,
  coalesce(cf.attachment_names, array[]::text[]) as attachment_names,
  coalesce(cf.decision_raw_paths, array[]::text[]) as decision_raw_paths,
  coalesce(pm.transcript_paths, array[]::text[]) as transcript_paths,
  coalesce(pm.minutes_paths, array[]::text[]) as minutes_paths,
  coalesce(pm.meeting_titles, array[]::text[]) as meeting_titles,
  coalesce(pm.meeting_dates, array[]::text[]) as meeting_dates
from public.decision_cases dc
join public.decision_posts dp on dp.id = dc.decision_post_id
left join case_files cf on cf.case_id = dc.id
left join post_meetings pm on pm.decision_post_id = dp.id
left join post_case_counts pcc on pcc.decision_post_id = dp.id
where ${includeIdentified ? "true" : "dc.main_entity_id is null"}
order by dc.decision_date nulls last, dp.pipc_idx_id, dc.case_key;
`;

function compact(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function truncate(value, max = 420) {
  const text = compact(value);
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function unique(values) {
  const seen = new Set();
  const result = [];
  for (const raw of values) {
    const value = compact(raw);
    if (!value || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}

function stripTags(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/t[dh]>\s*<t[dh][^>]*>/gi, " | ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

function normalizeSourcePath(rawPath) {
  if (!rawPath) return "";
  const normalized = String(rawPath).replace(/[\\/]+/g, path.sep);
  return path.resolve(ROOT, normalized);
}

function relativeSourcePath(absPath) {
  if (!absPath) return "";
  return path.relative(ROOT, absPath).replace(/\\/g, "/");
}

function readUtf8IfExists(rawPath) {
  const absPath = normalizeSourcePath(rawPath);
  if (!absPath || !fs.existsSync(absPath)) return null;
  return {
    absPath,
    relPath: relativeSourcePath(absPath),
    text: fs.readFileSync(absPath, "utf8").replace(/^\uFEFF/, ""),
  };
}

function collectParenSegments(text) {
  const segments = [];
  const stack = [];
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === "(") stack.push(i);
    if (text[i] === ")" && stack.length > 0) {
      const start = stack.pop();
      if (stack.length === 0) segments.push(text.slice(start + 1, i));
    }
  }
  return segments;
}

function cleanName(rawValue) {
  let value = stripTags(rawValue);
  value = value
    .replace(/\!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/^[#>\-*\s|:：]+/g, "")
    .replace(/^\d+\s+([가-힣].*)$/u, "$1")
    .replace(/^중\s+([가-힣A-Za-z0-9㈜(].*)$/u, "$1")
    .replace(/^\(?\s*(?:피\s*심\s*인|피심인|대상기관|대상\s*기관|처분\s*대상|일단|일단\s*피심인)\s*\)?\s*[:：]?\s*/i, "")
    .replace(/\s*\(?\s*사업자등록번호\s*[:：]?.*$/i, "")
    .replace(/\s*\(?\s*법인등록번호\s*[:：]?.*$/i, "")
    .replace(/\s*\(?\s*대표자\s*성명.*$/i, "")
    .replace(/\s*측(?:에서|은|이)?\s*(?:참석|의견|진술).*$/i, "")
    .replace(/\s*(?:건에\s*대해서|건을|건입니다|건에\s*관하여).*$/i, "")
    .replace(/\s*(?:에\s*대한|관련이고).*$/i, "")
    .replace(/[“”"']/g, "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  value = value
    .replace(/^[_.\-\s]+|[_.\-\s]+$/g, "")
    .replace(/[,;:：]+$/g, "")
    .trim();

  if (/^주식회사\s+\S/.test(value)) return value;
  return value;
}

function cleanAttachmentSegment(rawValue) {
  let value = String(rawValue ?? "")
    .replace(/\.(pdf|hwp|hwpx|docx?)$/i, "")
    .replace(/공개용|비공개용|최종버전|최종|수정|붙임|첨부/gi, " ")
    .replace(/심의[ㆍ·]?의결서|심의의결서|의결서|결정문|회의록|속기록/gi, " ")
    .replace(/제?\s*20\d{2}\s*[-–]\s*\d{3}\s*[-–]\s*\d{3}\s*호?/gi, " ")
    .replace(/20\d{2}\s*[-–]\s*\d{3}\s*[-–]\s*\d{3}/gi, " ")
    .replace(/20\d{2}\s*조[가-힣]{1,4}\s*\d{3,4}(?:\s*등\s*\d+\s*건)?/gi, " ")
    .replace(/\d{6,8}/g, " ")
    .replace(/CYLFILE[_\-\d]+/gi, " ")
    .replace(/[()[\]{}]/g, " ")
    .replace(/[_\-–]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  value = cleanName(value);
  return value;
}

function hasHangulOrLatin(value) {
  return /[가-힣A-Za-z]/.test(value);
}

function hasCorruptionMarkers(value) {
  const questionCount = (value.match(/\?/g) ?? []).length;
  const cjkCount = (value.match(/[\u3400-\u9fff]/g) ?? []).length;
  return questionCount > 0 || cjkCount > 0 || value.includes("�");
}

function isGenericName(value) {
  const name = compact(value);
  if (!name) return true;
  const genericPatterns = [
    /^.{0,3}$/,
    /^피\s*심\s*인$/,
    /^피심인$/,
    /^일단$/,
    /^주식회사$/,
    /^의료법인$/,
    /^해커$/,
    /^위원회$/,
    /^개인정보보호위원회$/,
    /^개인정보$/,
    /^개인정보보호$/,
    /^개인정보처리자$/,
    /^정보통신서비스$/,
    /^정보통신서비스 제공자$/,
    /^공공기관$/,
    /^온라인 서비스$/,
    /^서비스$/,
    /^심의의결서$/,
    /^의결서$/,
    /^공개용$/,
    /^시정조치$/,
    /^과징금$/,
    /^과태료$/,
    /^주문$/,
    /^일반현황$/,
    /^제출자료$/,
    /^사실조사 결과$/,
    /^Ⅱ\.?\s*사실조사 결과$/,
    /^사건명$/,
    /^사건번호$/,
    /^대상기관$/,
    /^처분대상$/,
    /^에 대하여/,
    /다음과 같이/,
    /과태료를 부과/,
    /과징금(?:을|과)?/,
    /부과한다/,
    /홈페이지에 공표/,
    /WebLogic|취약점/,
    /영리를 목적으로/,
    /지방자치법/,
    /제출자료/,
    /업로드/,
    /관한 건/,
    /제\s*\d+\s*조/,
    /^제\s*조/,
    /시행령|고시|보안업무규정|수사준칙|시행규칙|국가공무원법/,
    /확인하였다|조사|기초 사실|실태점검|현황|매출액|종업원|직원 수|방문,|유출 경위/,
    /소속 담당자|소속 학생|소속 공무원|소속 퇴사자|소속 정규직원|직위해제자|담당자는/,
    /운영관리자|관\s*리자 계정|관리자 페이지|SQL 인젝션|권한을 요청|납부기한|고유번호|고유등록번호|수\(명\)|의견입니다|홈페이지|처리방침|초안/,
    /^산하(?:\s|$)|DB 자료|해당 여부/,
    /서비스 이용자|Privacy Notice/,
    /[▣□■◆◇○]{2,}/,
    /\|/,
    /^\d+$/,
    /^제?\d{4}[-–]\d{3}[-–]\d{3}호?$/,
    /^20\d{2}조[가-힣]{1,4}\d{3,4}(?:#\d+)?$/,
  ];
  return genericPatterns.some((pattern) => pattern.test(name));
}

function isLikelyTargetName(value) {
  const name = compact(value);
  if (!name || name.length < 2 || name.length > 80) return false;
  if (!hasHangulOrLatin(name)) return false;
  if (hasCorruptionMarkers(name)) return false;
  if (isGenericName(name)) return false;
  if (/개인정보|보호법|위반행위|시정조치|의결|결정|공개|비공개|처분|사전통지|의견진술|의견입니다|과태료|과징금|부과|납부기한|일반현황|제출자료|사실조사|조사|확인하였다|제출 자료|가명정보|일부개정|법\s*시행|Privacy Notice|관\s*리자 계정|관리자 페이지|SQL 인젝션|권한을 요청|고유번호|고유등록번호|홈페이지|처리방침|초안|DB 자료|해당 여부|에 대하여/.test(name)) return false;
  if (/[.]\s*\d{1,2}[.]\s*\d{1,2}[.]|20\d{2}\s*년|20\d{2}[-.]\d{1,2}/.test(name)) return false;
  if (name.length > 34 && /[가-힣]/.test(name) && !/(학교법인|사회복지법인|재단법인|사단법인|협의회|연합회|조합|대학교|병원|의료원)/.test(name)) return false;
  if (/^(오늘은|다음은|참고로|효율적인|먼저|그리고|아울러)\s/.test(name)) return false;
  return true;
}

function inferEntityKind(name, row) {
  const text = `${name} ${row.case_title ?? ""} ${row.decision_post_title ?? ""}`;
  if (/(공공기관|공단|공사|구청|시청|군청|도청|교육청|경찰청|소방청|세무서|법원|검찰청|대학교|고등학교|중학교|초등학교|지방자치단체|행정기관|공공)/.test(text)) {
    return { entityKind: "public_agency", isPublicSector: true };
  }
  if (/(주식회사|\(주\)|㈜|유한회사|Inc\.?|LLC|Ltd\.?|Limited|Corporation|Corp\.?|Company|카카오|네이버|쿠팡|구글|메타|애플|아마존|넷플릭스|테무|알리|마이크로소프트)/i.test(text)) {
    return { entityKind: "company", isPublicSector: false };
  }
  if (/^[가-힣]{2,4}$/.test(name) && !/(병원|학교|공단|공사|협회|조합)$/.test(name)) {
    return { entityKind: "person", isPublicSector: false };
  }
  if (/(병원|의료원|협회|조합|재단|사단|학교|대학교|학원)/.test(text)) {
    return { entityKind: "institution", isPublicSector: null };
  }
  return { entityKind: "unknown", isPublicSector: null };
}

function canonicalNameKey(name) {
  return compact(name)
    .replace(/\s+/g, "")
    .replace(/^주식회사/, "㈜")
    .replace(/\(주\)/g, "㈜")
    .replace(/주식회사$/g, "㈜")
    .toLowerCase();
}

function hasEntitySignal(name) {
  const text = compact(name);
  if (/(㈜|\(주\)|주식회사|유한회사|유한책임회사|사단법인|재단법인|학교법인|법무법인\s*\S+|Inc\.?|LLC|Ltd\.?|Limited|Corporation|Corp\.?|Company|S\.R\.L|PTY)/i.test(text)) {
    return true;
  }
  if (/(공단|공사|재단|협의회|연합회|조합|대학교|고등학교|중학교|초등학교|병원|의료원|검역본부|관리단|박물관|개발원|정보원|평가원|진흥원|고용정보원|장학재단)$/.test(text)) {
    return true;
  }
  if (/(부|청|처)$/.test(text) && text.length >= 4 && text.length <= 12) {
    return true;
  }
  if (/(카카오|네이버|구글|메타|애플|아마존|넷플릭스|딥시크|우리카드|골프존|쿠팡|우아한형제들|당근마켓|인크루트|해성디에스|성보공업|SK텔레콤|에스케이텔레콤)/.test(text)) {
    return true;
  }
  return false;
}

function addCandidate(candidates, row, candidate) {
  const name = cleanName(candidate.name);
  if (!isLikelyTargetName(name)) return;
  const { entityKind, isPublicSector } = inferEntityKind(name, row);
  candidates.push({
    ...candidate,
    name,
    normalizedName: name,
    entityKind,
    isPublicSector,
    evidence: truncate(candidate.evidence),
  });
}

function extractFromDecisionText(row, doc, candidates) {
  const text = doc.text;
  const headerText = text.split(/\r?\n/).slice(0, 180).join("\n");
  const fullText = text.slice(0, 24000);

  const headerPatterns = [
    {
      method: "decision_header_respondent",
      confidence: 0.97,
      pattern: /피\s*심\s*인\s+([^\n(]{2,100})(?:\s*\(|\n|$)/g,
    },
    {
      method: "decision_header_respondent",
      confidence: 0.96,
      pattern: /피심인\s*[:：]?\s+([^\n(]{2,100})(?:\s*\(|\n|$)/g,
    },
    {
      method: "decision_header_target_agency",
      confidence: 0.94,
      pattern: /대상\s*기관\s*[:：]?\s+([^\n(]{2,100})(?:\s*\(|\n|$)/g,
    },
  ];

  for (const spec of headerPatterns) {
    let match;
    spec.pattern.lastIndex = 0;
    while ((match = spec.pattern.exec(headerText))) {
      addCandidate(candidates, row, {
        name: match[1],
        method: spec.method,
        confidence: spec.confidence,
        sourcePath: doc.relPath,
        evidence: match[0],
      });
    }
  }

  const tablePatterns = [
    /피심인명<\/t[dh]>.*?<\/tr>\s*<tr>\s*<t[dh][^>]*>(.*?)<\/t[dh]>/gis,
    /피\s*심\s*인\s*명<\/t[dh]>.*?<\/tr>\s*<tr>\s*<t[dh][^>]*>(.*?)<\/t[dh]>/gis,
  ];
  for (const pattern of tablePatterns) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(fullText))) {
      addCandidate(candidates, row, {
        name: match[1],
        method: "decision_table_respondent_name",
        confidence: 0.95,
        sourcePath: doc.relPath,
        evidence: match[0],
      });
    }
  }

  const lines = fullText.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    if (!/피\s*심\s*인\s*명|피심인명/.test(lines[i])) continue;
    for (const nextLine of lines.slice(i + 1, i + 4)) {
      const cells = nextLine
        .split("|")
        .map((cell) => cleanName(cell))
        .filter(Boolean);
      for (const cell of cells) {
        addCandidate(candidates, row, {
          name: cell,
          method: "decision_markdown_table_respondent_name",
          confidence: 0.92,
          sourcePath: doc.relPath,
          evidence: `${lines[i]} ${nextLine}`,
        });
      }
    }
  }
}

function extractFromAttachment(row, candidates) {
  for (const attachment of row.attachment_names ?? []) {
    const baseName = String(attachment ?? "").replace(/\.(pdf|hwp|hwpx|docx?)$/i, "");

    const companyPrefixMatch = baseName.match(/\(\s*주\s*\)\s*([가-힣A-Za-z0-9&.\-\s]{2,50})/);
    if (companyPrefixMatch) {
      const suffix = companyPrefixMatch[1]
        .replace(/[_\-\s]*(?:최종|공개용|비공개용|업로드|수정|첨부).*$/i, "")
        .trim();
      addCandidate(candidates, row, {
        name: `(주)${suffix}`,
        method: "attachment_company_abbreviation",
        confidence: 0.91,
        sourcePath: "",
        evidence: attachment,
      });
    }

    const companySuffixMatch = baseName.match(/([가-힣A-Za-z0-9&.\-\s]{2,50})\(\s*주\s*\)/);
    if (companySuffixMatch) {
      const prefix = companySuffixMatch[1]
        .replace(/^.*(?:호|_|-)\s*/i, "")
        .replace(/^(?:공개용|비공개용|심의의결서|의결서)\s*/i, "")
        .trim();
      addCandidate(candidates, row, {
        name: `${prefix}(주)`,
        method: "attachment_company_abbreviation",
        confidence: 0.91,
        sourcePath: "",
        evidence: attachment,
      });
    }

    for (const segment of collectParenSegments(baseName)) {
      const cleaned = cleanAttachmentSegment(segment);
      addCandidate(candidates, row, {
        name: cleaned,
        method: "attachment_parenthesis",
        confidence: 0.84,
        sourcePath: "",
        evidence: attachment,
      });
    }

    const cleanedWhole = cleanAttachmentSegment(baseName);
    if (cleanedWhole && cleanedWhole !== cleanAttachmentSegment(collectParenSegments(baseName).join(" "))) {
      addCandidate(candidates, row, {
        name: cleanedWhole,
        method: "attachment_suffix",
        confidence: 0.82,
        sourcePath: "",
        evidence: attachment,
      });
    }
  }
}

function caseNoNeedles(row) {
  const raw = String(row.case_no ?? "");
  const withoutSuffix = raw.replace(/#\d+$/, "");
  const needles = [raw, withoutSuffix].filter(Boolean);
  const titleMatches = `${row.case_title ?? ""} ${row.decision_post_title ?? ""}`.match(/20\d{2}조[가-힣]{1,4}\d{3,4}/g) ?? [];
  return unique([...needles, ...titleMatches]);
}

function relevantTranscriptWindow(text, row) {
  const needles = caseNoNeedles(row).filter((needle) => !/^제?\d{4}[-–]\d{3}[-–]\d{3}호?$/.test(needle));
  for (const needle of needles) {
    const idx = text.indexOf(needle);
    if (idx !== -1) {
      const start = Math.max(0, idx - 2600);
      const end = Math.min(text.length, idx + 3600);
      return { windowText: text.slice(start, end), methodSuffix: "case_window", needle };
    }
  }

  const singleDecisionContext =
    Number(row.cases_in_post) <= 1 && Number(row.max_meeting_decision_post_count) <= 1;
  if (singleDecisionContext) {
    return { windowText: text.slice(0, 30000), methodSuffix: "single_meeting", needle: "" };
  }
  return null;
}

function extractFromTranscriptLike(row, doc, candidates, sourceKind) {
  const relevant = relevantTranscriptWindow(doc.text, row);
  if (!relevant) return;

  const patterns = [
    {
      pattern: /피심인\s+(.{2,70}?)(?:\s*측에서|\s*측은|\s*측이|\s*에서\s*참석|\s*건에\s*대해서|\s*건을|\s*건입니다|\s*의견을|\s*의견진술)/g,
      confidence: relevant.methodSuffix === "case_window" ? 0.93 : 0.88,
    },
    {
      pattern: /먼저\s+피심인\s+(.{2,70}?)\s+건/g,
      confidence: 0.9,
    },
    {
      pattern: /피심인인\s+(.{2,60}?)(?:의|이|가|은|는|\s)/g,
      confidence: relevant.methodSuffix === "case_window" ? 0.9 : 0.84,
    },
    {
      pattern: /오늘은\s+(.{2,60}?)에\s+대한\s+개인정보보호/g,
      confidence: relevant.methodSuffix === "case_window" ? 0.88 : 0.82,
    },
    {
      pattern: /이\s+안건은\s+피심인\s+(.{2,70}?)(?:\s*측에서|\s*에서\s*참석|\s*의견)/g,
      confidence: relevant.methodSuffix === "case_window" ? 0.93 : 0.88,
    },
  ];

  for (const spec of patterns) {
    let match;
    spec.pattern.lastIndex = 0;
    while ((match = spec.pattern.exec(relevant.windowText))) {
      addCandidate(candidates, row, {
        name: match[1],
        method: `${sourceKind}_${relevant.methodSuffix}`,
        confidence: spec.confidence,
        sourcePath: doc.relPath,
        evidence: match[0],
      });
    }
  }
}

function bestCandidate(row) {
  const candidates = [];

  for (const rawPath of row.decision_raw_paths ?? []) {
    const doc = readUtf8IfExists(rawPath);
    if (!doc) continue;
    extractFromDecisionText(row, doc, candidates);
  }

  extractFromAttachment(row, candidates);

  for (const rawPath of [...(row.transcript_paths ?? []), ...(row.minutes_paths ?? [])]) {
    const doc = readUtf8IfExists(rawPath);
    if (!doc) continue;
    const sourceKind = rawPath.includes("transcripts") ? "transcript" : "minutes";
    extractFromTranscriptLike(row, doc, candidates, sourceKind);
  }

  if (candidates.length === 0) {
    const hasAnySource =
      (row.decision_raw_paths?.length ?? 0) + (row.transcript_paths?.length ?? 0) + (row.minutes_paths?.length ?? 0) > 0;
    return {
      status: hasAnySource ? "needs_review" : "no_source",
      checkPoint: hasAnySource
        ? "원문 파일은 있으나 신뢰 가능한 피심인 패턴을 찾지 못함"
        : "결정문/속기록 원문 경로가 DB에 연결되지 않음",
      candidates: [],
    };
  }

  const grouped = new Map();
  for (const candidate of candidates) {
    const key = canonicalNameKey(candidate.name);
    const group = grouped.get(key) ?? [];
    group.push(candidate);
    grouped.set(key, group);
  }

  const scored = [...grouped.values()].map((group) => {
    const best = group.sort((a, b) => b.confidence - a.confidence)[0];
    const sourceBonus = Math.min(0.04, (group.length - 1) * 0.015);
    return {
      ...best,
      confidence: Math.min(0.99, Number(best.confidence) + sourceBonus),
      supportCount: group.length,
      methods: unique(group.map((item) => item.method)).join("; "),
    };
  });

  scored.sort((a, b) => b.confidence - a.confidence || b.supportCount - a.supportCount || a.name.localeCompare(b.name, "ko"));
  const top = scored[0];
  const runnerUp = scored[1];

  if (runnerUp && top.confidence - runnerUp.confidence < 0.03 && top.name !== runnerUp.name) {
    if (hasEntitySignal(top.name) && !hasEntitySignal(runnerUp.name)) {
      return {
        status: "identified",
        candidate: top,
        candidates: scored,
        checkPoint: "자동 식별 및 DB 반영 대상",
      };
    }
    return {
      status: "ambiguous",
      checkPoint: `복수 피심인 후보가 비슷한 신뢰도로 추출됨: ${top.name} / ${runnerUp.name}`,
      candidate: top,
      candidates: scored,
    };
  }

  if (top.confidence < 0.86) {
    return {
      status: "needs_review",
      checkPoint: "피심인 후보는 있으나 자동 반영 기준 신뢰도 미만",
      candidate: top,
      candidates: scored,
    };
  }

  return {
    status: "identified",
    candidate: top,
    candidates: scored,
    checkPoint: "자동 식별 및 DB 반영 대상",
  };
}

function sqlLiteral(value) {
  if (value == null) return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlNumber(value) {
  if (value == null || value === "") return "null";
  return String(Number(value));
}

function sqlBoolean(value) {
  if (value === true) return "true";
  if (value === false) return "false";
  return "null";
}

function buildUpdateSql(rows) {
  const identified = rows.filter((row) => row.status === "identified" && row.candidate_name);
  const checks = rows;

  const identifiedValues = identified.length
    ? identified
        .map(
          (row) =>
            `(${[
              sqlLiteral(row.case_key),
              sqlLiteral(row.candidate_name),
              sqlLiteral(row.normalized_name),
              sqlLiteral(row.entity_kind),
              sqlBoolean(row.is_public_sector),
              sqlLiteral(row.method),
              sqlNumber(row.confidence),
              sqlLiteral(row.source_path),
              sqlLiteral(row.evidence_text),
            ].join(", ")})`,
        )
        .join(",\n")
    : "";

  const checkValues = checks
    .map(
      (row) =>
        `(${[
          sqlLiteral(row.case_key),
          sqlLiteral(row.status),
          sqlLiteral(row.candidate_name),
          sqlNumber(row.confidence),
          sqlLiteral(row.method),
          sqlLiteral(row.source_path),
          sqlLiteral(row.evidence_text),
          sqlLiteral(row.check_point),
        ].join(", ")})`,
    )
    .join(",\n");

  const identifiedSql = identified.length
    ? `
with target_values (
  case_key,
  entity_name,
  normalized_name,
  entity_kind,
  is_public_sector,
  method,
  confidence,
  source_path,
  evidence_text
) as (
  values
${identifiedValues}
),
entity_values as (
  select
    entity_name,
    max(normalized_name) as normalized_name,
    max(entity_kind) as entity_kind,
    case
      when bool_or(is_public_sector is true) then true
      when bool_or(is_public_sector is false) then false
      else null
    end as is_public_sector
  from target_values
  group by entity_name
),
upserted_entities as (
  insert into public.entities (
    name,
    normalized_name,
    entity_kind,
    is_public_sector,
    metadata
  )
  select
    entity_name,
    normalized_name,
    entity_kind,
    is_public_sector,
    jsonb_build_object(
      'source', 'scripts/identify_case_targets.mjs',
      'extraction_status', 'verified_by_rule',
      'updated_on', '2026-04-27'
    )
  from entity_values
  on conflict (name) do update
  set normalized_name = coalesce(excluded.normalized_name, public.entities.normalized_name),
      entity_kind = coalesce(nullif(excluded.entity_kind, 'unknown'), public.entities.entity_kind, excluded.entity_kind),
      is_public_sector = coalesce(excluded.is_public_sector, public.entities.is_public_sector),
      metadata = public.entities.metadata || excluded.metadata,
      updated_at = now()
  returning id, name
),
matched_cases as (
  select
    dc.id as case_id,
    dc.case_key,
    e.id as entity_id,
    tv.entity_name,
    tv.method,
    tv.confidence,
    tv.source_path,
    tv.evidence_text
  from target_values tv
  join public.decision_cases dc on dc.case_key = tv.case_key
  join public.entities e on e.name = tv.entity_name
)
update public.decision_cases dc
set main_entity_id = mc.entity_id,
    updated_at = now(),
    metadata = dc.metadata || jsonb_build_object(
      'target_identification_status', 'identified',
      'target_identification_method', mc.method,
      'target_identification_confidence', mc.confidence,
      'target_identification_source_path', mc.source_path,
      'target_identification_evidence', mc.evidence_text,
      'target_identified_on', '2026-04-27'
    )
from matched_cases mc
where dc.id = mc.case_id;

with target_values (
  case_key,
  entity_name,
  normalized_name,
  entity_kind,
  is_public_sector,
  method,
  confidence,
  source_path,
  evidence_text
) as (
  values
${identifiedValues}
),
matched_cases as (
  select
    dc.id as case_id,
    e.id as entity_id,
    tv.entity_name
  from target_values tv
  join public.decision_cases dc on dc.case_key = tv.case_key
  join public.entities e on e.name = tv.entity_name
)
insert into public.case_entities (case_id, entity_id, role, entity_name_in_source)
select case_id, entity_id, 'respondent', entity_name
from matched_cases
on conflict (case_id, entity_id, role) do update
set entity_name_in_source = excluded.entity_name_in_source;
`
    : "";

  return `${identifiedSql}
with check_values (
  case_key,
  status,
  candidate_name,
  confidence,
  method,
  source_path,
  evidence_text,
  check_point
) as (
  values
${checkValues}
)
insert into public.case_target_identification_checks (
  case_id,
  status,
  candidate_name,
  confidence,
  method,
  source_path,
  evidence_text,
  check_point,
  metadata,
  updated_at
)
select
  dc.id,
  cv.status,
  cv.candidate_name,
  cv.confidence,
  cv.method,
  cv.source_path,
  cv.evidence_text,
  cv.check_point,
  jsonb_build_object('source', 'scripts/identify_case_targets.mjs', 'updated_on', '2026-04-27'),
  now()
from check_values cv
join public.decision_cases dc on dc.case_key = cv.case_key
on conflict (case_id) do update
set status = excluded.status,
    candidate_name = excluded.candidate_name,
    confidence = excluded.confidence,
    method = excluded.method,
    source_path = excluded.source_path,
    evidence_text = excluded.evidence_text,
    check_point = excluded.check_point,
    metadata = public.case_target_identification_checks.metadata || excluded.metadata,
    updated_at = now();
`;
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function writeCsv(filePath, rows, headers) {
  const body = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n");
  fs.writeFileSync(filePath, `${body}\n`, "utf8");
}

function makeReport(rows) {
  const counts = new Map();
  for (const row of rows) counts.set(row.status, (counts.get(row.status) ?? 0) + 1);

  const topIdentified = rows
    .filter((row) => row.status === "identified")
    .slice(0, 30)
    .map((row) => `| ${row.decision_date ?? ""} | ${row.case_no ?? ""} | ${row.candidate_name ?? ""} | ${row.method ?? ""} | ${row.confidence ?? ""} |`);

  const reviewRows = rows
    .filter((row) => row.status !== "identified")
    .slice(0, 40)
    .map((row) => `| ${row.decision_date ?? ""} | ${row.case_no ?? ""} | ${row.status} | ${row.candidate_name ?? ""} | ${row.check_point ?? ""} |`);

  return [
    "# Case Target Identification Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Total analyzed: ${rows.length}`,
    `- Identified: ${counts.get("identified") ?? 0}`,
    `- Needs review: ${counts.get("needs_review") ?? 0}`,
    `- Ambiguous: ${counts.get("ambiguous") ?? 0}`,
    `- No source: ${counts.get("no_source") ?? 0}`,
    "",
    "## Sample Identified",
    "",
    "| Date | Case No | Target | Method | Confidence |",
    "| --- | --- | --- | --- | --- |",
    ...(topIdentified.length ? topIdentified : ["|  |  |  |  |  |"]),
    "",
    "## Checkpoints",
    "",
    "| Date | Case No | Status | Candidate | Check Point |",
    "| --- | --- | --- | --- | --- |",
    ...(reviewRows.length ? reviewRows : ["|  |  |  |  |  |"]),
    "",
  ].join("\n");
}

async function queryDatabase(sql) {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) throw new Error("SUPABASE_ACCESS_TOKEN is not set.");
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Supabase query failed (${response.status}): ${text}`);
  return JSON.parse(text);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(indexDir, { recursive: true });

  const rows = await queryDatabase(querySql);
  const results = rows.map((row) => {
    const result = bestCandidate(row);
    const candidate = result.candidate ?? {};
    return {
      case_key: row.case_key,
      case_no: row.case_no,
      decision_date: row.decision_date,
      case_title: row.case_title,
      decision_post_title: row.decision_post_title,
      pipc_idx_id: row.pipc_idx_id,
      status: result.status,
      candidate_name: candidate.name ?? "",
      normalized_name: candidate.normalizedName ?? "",
      entity_kind: candidate.entityKind ?? "",
      is_public_sector: candidate.isPublicSector,
      confidence: candidate.confidence == null ? "" : candidate.confidence.toFixed(3),
      method: candidate.methods ?? candidate.method ?? "",
      source_path: candidate.sourcePath ?? "",
      evidence_text: candidate.evidence ?? "",
      check_point: result.checkPoint ?? "",
      candidate_count: result.candidates?.length ?? 0,
      attachment_names: (row.attachment_names ?? []).join("; "),
      decision_raw_paths: (row.decision_raw_paths ?? []).join("; "),
      transcript_paths: (row.transcript_paths ?? []).join("; "),
    };
  });

  const headers = [
    "case_key",
    "case_no",
    "decision_date",
    "pipc_idx_id",
    "status",
    "candidate_name",
    "entity_kind",
    "is_public_sector",
    "confidence",
    "method",
    "source_path",
    "evidence_text",
    "check_point",
    "candidate_count",
    "case_title",
    "decision_post_title",
    "attachment_names",
    "decision_raw_paths",
    "transcript_paths",
  ];

  writeCsv(csvPath, results, headers);
  const updateSql = buildUpdateSql(results);
  fs.writeFileSync(sqlPath, updateSql, "utf8");
  fs.writeFileSync(reportPath, makeReport(results), "utf8");

  const statusCounts = results.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Analyzed ${results.length} cases`);
  console.log(JSON.stringify(statusCounts, null, 2));
  console.log(`Wrote ${csvPath}`);
  console.log(`Wrote ${sqlPath}`);
  console.log(`Wrote ${reportPath}`);

  if (shouldUpload) {
    await queryDatabase(updateSql);
    console.log("Uploaded target identification updates to Supabase");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
