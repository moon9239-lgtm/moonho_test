import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { normalizeTranscriptRecord } from "../src/data-model.mjs";
import { parseTranscript } from "../src/transcript-model.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const outputPath = "pipc_dashboard/data/meeting-analysis-index.js";
const characterRoot = "pipc_knowledge_base/04_members/character_profiles";
const assetRoot = `${characterRoot}/character_assets/sd3d_members`;

const keywordDictionary = [
  "개인정보 유출",
  "안전조치",
  "접근권한",
  "접속기록",
  "암호화",
  "동의",
  "고지",
  "국외이전",
  "위탁",
  "가명정보",
  "영상정보",
  "AI",
  "자동화",
  "마이데이터",
  "아동",
  "민감정보",
  "고유식별정보",
  "정보주체 권리",
  "재발방지",
  "공공기관",
  "플랫폼",
  "위치정보",
  "바이오정보",
  "온라인 행태정보",
  "처리방침",
  "영향평가",
  "사전적정성",
  "과징금",
  "과태료",
  "시정명령",
  "시정조치",
  "공표명령",
  "보호조치",
  "처분수준",
  "사업자 부담",
  "공공부문",
  "산업진흥",
  "이용자 보호",
  "피해구제",
  "기술·보안",
];

const issueTaxonomy = [
  { label: "안전조치", patterns: [/안전조치|보호조치|접근권한|접속기록|암호화|비밀번호|해킹|취약점/] },
  { label: "유출 대응", patterns: [/유출|침해|통지|신고|재발방지|피해구제/] },
  { label: "동의·고지", patterns: [/동의|고지|처리방침|수집ㆍ이용|수집·이용|정보주체 권리|선택권/] },
  { label: "제공·위탁", patterns: [/제3자 제공|제공받|위탁|수탁|공동이용|국외이전/] },
  { label: "보유·파기", patterns: [/보유기간|파기|삭제|분리 보관|보존기간/] },
  { label: "민감·식별정보", patterns: [/민감정보|고유식별정보|주민등록번호|바이오정보|영상정보/] },
  { label: "AI·자동화", patterns: [/AI|인공지능|자동화|사전적정성|마이데이터|프로파일링/] },
  { label: "공공부문", patterns: [/공공기관|공공부문|행정기관|공무원|학교|재단|공단/] },
];

const dispositionPatterns = [
  { label: "시정명령", pattern: /시정명령/ },
  { label: "시정조치", pattern: /시정조치/ },
  { label: "과징금", pattern: /과징금/ },
  { label: "과태료", pattern: /과태료/ },
  { label: "공표명령", pattern: /공표명령|공표/ },
  { label: "개선권고", pattern: /개선권고|권고/ },
];

const stopWords = new Set([
  "개인정보",
  "보호위원회",
  "위원회",
  "회의",
  "위원",
  "위원장",
  "부위원장",
  "안건",
  "보고",
  "의결",
  "심의",
  "관련",
  "대한",
  "관한",
  "경우",
  "오늘",
  "이번",
  "있습니다",
  "없습니다",
  "하겠습니다",
  "말씀",
  "자료",
  "내용",
  "검토",
  "부분",
  "사항",
  "생각",
  "질문",
  "답변",
  "그리고",
  "그러면",
  "수고하셨습니다",
]);

const seatOrder = ["chair", "left1", "right1", "left2", "right2", "left3", "right3", "left4", "right4", "left5", "right5"];
const knownNameAliases = new Map([
  ["염흥렬", "염흥열"],
  ["고학수위원장", "고학수"],
  ["송경희위원장", "송경희"],
  ["윤종인위원장", "윤종인"],
]);

function compact(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeKey(value) {
  return compact(value).replace(/[()\[\]{}<>「」『』“”"'\s·ㆍ.,:;·․-]/g, "");
}

function normalizePath(value) {
  return String(value || "").replace(/\\/g, "/");
}

function dashboardAssetPath(value) {
  return `../${normalizePath(value)}`;
}

function quarterFromDate(date) {
  const month = Number(String(date || "").slice(5, 7));
  if (!Number.isFinite(month) || month < 1) return 0;
  return Math.ceil(month / 3);
}

function shortText(value, limit = 190) {
  const text = compact(value);
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}

function addCount(map, key, amount = 1) {
  const label = compact(key);
  if (!label) return;
  map.set(label, (map.get(label) || 0) + amount);
}

function rankFromMap(map, limit = 8) {
  return [...map.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "ko"))
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

function unique(values, limit = 30) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    const label = compact(value);
    if (!label || seen.has(label)) continue;
    seen.add(label);
    result.push(label);
    if (result.length >= limit) break;
  }
  return result;
}

async function readDashboardData() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(await readFile(resolve(root, "pipc_dashboard/data/dashboard-data.js"), "utf8"), context);
  return context.window.PIPC_DASHBOARD_DATA || {};
}

async function readCharacters() {
  const charactersPath = resolve(root, `${characterRoot}/characters.json`);
  const characters = JSON.parse(await readFile(charactersPath, "utf8"));
  return characters.map((character) => ({
    ...character,
    asset: dashboardAssetPath(`${assetRoot}/${character.id}_sd3d_character.png`),
    aliases: unique([
      character.name,
      `${character.role || ""} ${character.name}`,
      `${character.name} ${character.role || ""}`,
      knownNameAliases.get(character.name),
    ]),
  }));
}

function makeCharacterLookup(characters) {
  const lookup = new Map();
  for (const character of characters) {
    for (const alias of character.aliases || []) {
      lookup.set(normalizeKey(alias), character);
    }
  }
  for (const [alias, canonical] of knownNameAliases) {
    const target = characters.find((item) => item.name === canonical);
    if (target) lookup.set(normalizeKey(alias), target);
  }
  return lookup;
}

function resolveCharacter(value, lookup) {
  const key = normalizeKey(value);
  if (!key) return null;
  if (lookup.has(key)) return lookup.get(key);
  for (const [candidate, character] of lookup.entries()) {
    if (candidate && (key.includes(candidate) || candidate.includes(key))) return character;
  }
  return null;
}

function cleanTarget(value) {
  let text = compact(value)
    .replace(/^.*(?:위원회가|이중 공개안건인|공개안건인|비공개안건인|오늘은|이번에는)\s+/, "")
    .replace(/^(?:피심인|처분대상|조사대상|대상기관|대상 사업자|신청인|관계기관)\s*/, "")
    .replace(/^(?:은|는|이|가|을|를|과|와|및|또는|중)\s*/, "")
    .replace(/^(오늘|이번|먼저|이중|상정된|공개안건인|비공개안건인)\s*/, "")
    .replace(/(?:으로부터|로부터).*$/, "")
    .replace(/\s*(?:측|관계자|대리인|담당자)$/g, "")
    .replace(/^측\s*/, "")
    .replace(/\s*(시스템|업무지원시스템|관리자 페이지|통합관제센터)$/g, "")
    .replace(/\s*(관련|등|및)$|[.。,:;]$/g, "")
    .trim();
  text = text.replace(/^안건\s*\d+\s*번?\s*/, "");
  if (text.length < 2 || text.length > 45) return "";
  if (/\d{4}조|의안|의결안건|보고안건|다음은|[~～]\d+호|호\)/.test(text)) return "";
  if (/^(개인정보|보호위원회|위원회|법규|위반행위|시정조치|보고안건|의결안건|회의|속기록|회의록|공개안건|비공개안건|현황|일반현황|조사결과|의견진술|질문|답변|주장|입니다|같습니다)$/.test(text)) return "";
  if (/회의에서|논의될|상정되었|설명드리|보고드리|의견|안건에 관|결정이|결과$|현황|사실|주장|판단|검토|처리|수집|저장|기록|로그|접속|시스템|페이지|정보|번호|식별|민감|암호|조치|위반|유출|탐지|취약점|통지|보유기간|법정|회원|외부|홈페|웹사|해커|징금|태료|매출액|방화벽|자료|신원확인|판매자|참석 가능|확인요청|법리 적용/.test(text)) return "";
  if (/^(의|에게|으로|로|또한|다만|그리고|그래도|혹시|여기서|효율적인|참고로)/.test(text)) return "";
  return text;
}

function splitTargets(value) {
  return compact(value)
    .split(/\s*(?:그리고|및|,|ㆍ|·|\/|와|과)\s*/g)
    .map(cleanTarget)
    .filter(Boolean);
}

function extractTargetsFromText(text) {
  const source = compact(text);
  const targets = [];
  const patterns = [
    /피심인(?:\s*중)?\s+(?!측\b)([가-힣A-Za-z0-9㈜()·ㆍ\-\s,]{2,90}?)\s*측/g,
    /(?:처분대상|조사대상|대상기관|대상 사업자|대상자)\s*[:：]\s*([가-힣A-Za-z0-9㈜()·ㆍ\-\s,]{2,90})/g,
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(source))) targets.push(...splitTargets(match[1]));
  }
  return unique(targets, 12);
}

function extractTargetsFromTitle(title) {
  const source = compact(title).replace(/^[가-하]\.\s*/, "");
  const targets = [];
  const patterns = [
    /^([가-힣A-Za-z0-9㈜()·ㆍ\-\s,]{2,80}?)(?:의|에 대한)\s*(?:개인정보(?:보호)?\s*)?(?:법규 위반행위|법규 위반|위반행위|시정조치|처분|과징금|과태료)에 관한 건/,
  ];
  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match) targets.push(...splitTargets(match[1]));
  }
  return unique(targets, 8);
}

function caseTokens(value) {
  return new Set(String(value || "").match(/\d{4}조[가-힣]{1,3}\d{4}(?:-\d+)?/g) || []);
}

function hasTokenOverlap(left, right) {
  for (const token of left) {
    if (right.has(token)) return true;
  }
  return false;
}

function isEnforcementAgenda(title = "", text = "") {
  return /법규 위반|위반행위|시정조치|처분|과징금|과태료|피심인|조사대상/.test(`${title}\n${text}`);
}

function penaltyRowsForAgenda(penaltyRows = [], agenda = {}, text = "") {
  const title = agenda?.title || "";
  if (!isEnforcementAgenda(title, text)) return [];
  const agendaTokens = caseTokens(title);
  const matched = penaltyRows.filter((item) => {
    const penaltyTokens = caseTokens([item.case_no, item.case_id, item.agenda_title, item.case_title].filter(Boolean).join(" "));
    return agendaTokens.size && penaltyTokens.size && hasTokenOverlap(agendaTokens, penaltyTokens);
  });
  return matched.length ? matched : [];
}

function targetsFromPenaltyRows(rows = []) {
  return unique(rows.map((item) => item.target_name || item.top_target_name).filter((name) => !/미식별|^\d{4}조|^제\d{4}-/.test(name || "")), 12);
}

function lawLabel(ref) {
  if (!ref) return "";
  return compact([ref.lawName, ref.article, ref.title ? `(${ref.title})` : ""].filter(Boolean).join(" "));
}

function formatKrw(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return "";
  return `${new Intl.NumberFormat("ko-KR").format(amount)}원`;
}

function classifyIssueTags(text) {
  const source = compact(text);
  const scored = issueTaxonomy
    .map((issue, index) => ({
      label: issue.label,
      index,
      score: issue.patterns.reduce((sum, pattern) => sum + (pattern.test(source) ? 1 : 0), 0),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map((item) => item.label);
  return unique(scored, 4);
}

function normalizeDisposition(value) {
  const text = compact(value);
  if (!text) return "";
  if (/과징금/.test(text)) return "과징금";
  if (/과태료/.test(text)) return "과태료";
  if (/시정명령/.test(text)) return "시정명령";
  if (/시정조치/.test(text)) return "시정조치";
  if (/공표/.test(text)) return "공표명령";
  if (/권고/.test(text)) return "개선권고";
  if (/원안/.test(text)) return "원안 의결";
  if (/수정/.test(text)) return "수정 의결";
  return text.length > 24 ? "" : text;
}

function extractDecisionLabels(text) {
  const source = compact(text);
  if (/수정.*의결|수정.*가결/.test(source)) return ["수정 의결"];
  if (/원안.*의결|원안대로.*의결|원안.*가결/.test(source)) return ["원안 의결"];
  return [];
}

function extractDispositions(text, penaltyRows = [], options = {}) {
  const labels = [];
  for (const row of penaltyRows) {
    labels.push(normalizeDisposition(row.sanction_type));
    labels.push(normalizeDisposition(row.decision_type));
    const breakdown = Array.isArray(row.penalty_breakdown) ? row.penalty_breakdown : [];
    for (const penalty of breakdown) labels.push(normalizeDisposition(penalty?.penalty_kind));
    const amount = Number(row.amount_total_krw || row.monetary_penalty_amount_total_krw || 0);
    if (amount > 0) labels.push("금전 제재");
  }
  const source = compact(text);
  if (options.includeSanctionText) {
    for (const item of dispositionPatterns) {
      if (item.pattern.test(source)) labels.push(item.label);
    }
  }
  labels.push(...extractDecisionLabels(options.decisionText || ""));
  return unique(labels.filter(Boolean), 8);
}

function totalPenaltyAmount(penaltyRows = []) {
  return penaltyRows.reduce((sum, row) => {
    const amount = Number(row.amount_total_krw || row.monetary_penalty_amount_total_krw || 0);
    return Number.isFinite(amount) ? sum + amount : sum;
  }, 0);
}

function caseIdsForRows(penaltyRows = []) {
  return unique(penaltyRows.flatMap((row) => [row.case_no, row.case_id]).filter(Boolean), 8);
}

function buildSourceConfidence({ targets, lawArticles, dispositions, penaltyRows }) {
  const hasPenaltyRows = penaltyRows.length > 0;
  const items = [];
  if (targets.length) {
    items.push({
      label: "처분대상",
      status: hasPenaltyRows ? "확정" : "속기록 추정",
      source: hasPenaltyRows ? "처분 데이터" : "피심인 문구",
    });
  }
  if (lawArticles.length) {
    items.push({ label: "관련 조항", status: "확인", source: "속기록 조문" });
  }
  if (dispositions.length) {
    items.push({
      label: "조치 결과",
      status: hasPenaltyRows ? "확정" : "속기록 추정",
      source: hasPenaltyRows ? "처분 데이터" : "의결 문구",
    });
  }
  return items;
}

function extractKeywords(text) {
  const source = compact(text);
  const keywords = [];
  for (const keyword of keywordDictionary) {
    const plain = keyword.replace(/[·\s]/g, "");
    const sourcePlain = source.replace(/[·\s]/g, "");
    if (source.includes(keyword) || sourcePlain.includes(plain)) keywords.push(keyword);
  }

  const counts = new Map();
  const words = source.match(/[가-힣A-Za-z0-9]{2,}/g) || [];
  for (const word of words) {
    if (stopWords.has(word) || /^\d+$/.test(word)) continue;
    addCount(counts, word);
  }
  keywords.push(...rankFromMap(counts, 12).map((item) => item.label));
  return unique(keywords, 16);
}

function speakerStats(utterances) {
  const map = new Map();
  for (const utterance of utterances) {
    const name = compact(utterance.speakerName || utterance.speaker);
    if (!name) continue;
    const current = map.get(name) || {
      name,
      role: utterance.speakerRole || "",
      utteranceCount: 0,
      questionCount: 0,
    };
    current.utteranceCount += 1;
    if (/[?？]|습니까|나요|지요|질문|문의|확인/.test(utterance.text || "")) current.questionCount += 1;
    if (!current.role && utterance.speakerRole) current.role = utterance.speakerRole;
    map.set(name, current);
  }
  return [...map.values()].sort((left, right) => right.utteranceCount - left.utteranceCount || left.name.localeCompare(right.name, "ko"));
}

function classifyScene(utterance) {
  const text = utterance.text || "";
  if (/산회|폐회|마치겠습니다|이상으로.*마치/.test(text)) return "closing";
  if (/개의|성원|국민의례|개회/.test(text)) return "opening";
  if (/상정|보고해 주시기|안건.*설명|공개.*진행|비공개/.test(text)) return "agenda_transition";
  if (/이의 없으십니까|가결|의결|접수하도록|원안대로|수정.*의결|\[의사봉/.test(text)) return "decision";
  if (/[?？]|습니까|나요|지요|질문|문의/.test(text) && /위원/.test(utterance.speakerRole || utterance.speaker || "")) return "qa";
  return "utterance";
}

function resolveMemberId(utterance, characterLookup) {
  const character = resolveCharacter(utterance.speakerName || utterance.speaker, characterLookup);
  if (character) return character.id;
  if (/위원/.test(utterance.speakerRole || "") && utterance.speakerName) return normalizeKey(utterance.speakerName);
  return "staff";
}

function buildAnimationTimeline({ meeting, detail, characterLookup }) {
  const utterances = Array.isArray(detail.utterances) ? detail.utterances : [];
  const attendeeCharacters = unique(detail.overview?.attendees || [], 20)
    .map((name) => resolveCharacter(name, characterLookup))
    .filter(Boolean);
  const speakerCharacters = unique(utterances.map((item) => item.speakerName), 40)
    .map((name) => resolveCharacter(name, characterLookup))
    .filter(Boolean);
  const memberMap = new Map();
  for (const character of [...attendeeCharacters, ...speakerCharacters]) memberMap.set(character.id, character);
  const members = [...memberMap.values()].map((character, index) => ({
    id: character.id,
    name: character.name,
    role: character.role || "위원",
    asset: character.asset,
    seat: seatOrder[index] || `seat${index + 1}`,
    present: true,
    aliases: character.aliases || [character.name],
  }));

  const scenes = [
    {
      id: "enter",
      type: "enter",
      phase: "입장",
      speaker: "회의장",
      speakerName: "회의장",
      memberId: "",
      text: `${meeting.meetingLabel} 참석자가 입장해 좌석에 착석합니다.`,
      shortText: "위원 입장과 착석",
      stageNote: "위원 입장",
      action: "enter",
      durationMs: 3600,
      camera: "wide",
    },
    {
      id: "seat",
      type: "seat",
      phase: "착석",
      speaker: "회의장",
      speakerName: "회의장",
      memberId: "",
      text: "성원보고와 회의 개회를 준비합니다.",
      shortText: "성원보고 준비",
      stageNote: "착석",
      action: "sit",
      durationMs: 2800,
      camera: "wide",
    },
    ...utterances.map((utterance, index) => {
      const type = classifyScene(utterance);
      const memberId = resolveMemberId(utterance, characterLookup);
      return {
        id: `scene-${index + 1}`,
        type,
        phase: type === "qa" ? "질의응답" : type === "decision" ? "의결" : type === "agenda_transition" ? "안건 전환" : type === "opening" ? "개회" : "발언",
        agendaId: utterance.agendaId,
        utteranceId: utterance.id,
        speaker: utterance.speaker,
        speakerName: utterance.speakerName,
        speakerRole: utterance.speakerRole,
        memberId,
        text: shortText(utterance.text, 220),
        shortText: shortText(utterance.text, 150),
        stageNote: utterance.sectionTitle || "속기록 발언",
        action: /\[의사봉/.test(utterance.text || "") ? "knock_gavel" : "speak",
        effects: /\[의사봉/.test(utterance.text || "") ? ["gavel"] : [],
        durationMs: Math.max(2600, Math.min(9000, compact(utterance.text).length * 42)),
        camera: type === "decision" || type === "opening" || type === "closing" ? "wide" : "speaker",
      };
    }),
    {
      id: "exit",
      type: "exit",
      phase: "퇴장",
      speaker: "회의장",
      speakerName: "회의장",
      memberId: "",
      text: `${meeting.meetingLabel} 산회 후 참석자가 퇴장합니다.`,
      shortText: "산회와 퇴장",
      stageNote: "퇴장",
      action: "exit",
      durationMs: 3600,
      camera: "wide",
    },
  ];

  return {
    meetingId: meeting.id,
    meetingLabel: meeting.meetingLabel,
    date: meeting.date,
    place: detail.overview?.place || "",
    attendees: detail.overview?.attendees || [],
    members,
    staffActors: [{ id: "staff", name: "사무처", role: "보고자", seat: "staff-center", asset: "" }],
    agendas: detail.agendas || [],
    scenes,
  };
}

function matchingPenaltyCases(data, meeting) {
  const rows = Array.isArray(data.majorPenaltyCases) ? data.majorPenaltyCases : [];
  return rows.filter((item) => (item.meeting_date || item.decision_date) === meeting.date);
}

function analyzeAgenda({ meeting, agenda, utterances, penaltyRows }) {
  const text = utterances.map((item) => item.text).join("\n");
  const targetContext = [
    agenda?.title || "",
    ...utterances.slice(0, 8).map((item) => item.text || ""),
  ].join("\n");
  const lawArticles = unique(utterances.flatMap((utterance) => utterance.lawReferences || []).map(lawLabel), 20);
  const speakers = speakerStats(utterances).slice(0, 8).map((item) => item.name);
  const targets = isEnforcementAgenda(agenda?.title || "", targetContext)
    ? unique([
        ...targetsFromPenaltyRows(penaltyRows),
        ...extractTargetsFromTitle(agenda?.title || ""),
        ...extractTargetsFromText(targetContext),
      ], 12)
    : [];
  const issueTags = classifyIssueTags(`${agenda?.title || ""}\n${text}\n${lawArticles.join(" ")}`);
  const isEnforcement = isEnforcementAgenda(agenda?.title || "", targetContext);
  const decisionText = utterances.slice(-8).map((item) => item.text || "").join("\n");
  const dispositions = extractDispositions(`${agenda?.title || ""}\n${text}`, penaltyRows, {
    includeSanctionText: isEnforcement,
    decisionText,
  });
  const amountTotalKrw = totalPenaltyAmount(penaltyRows);
  const amountText = formatKrw(amountTotalKrw);
  const caseIds = caseIdsForRows(penaltyRows);
  const sourceConfidence = buildSourceConfidence({ targets, lawArticles, dispositions, penaltyRows });
  const keywords = extractKeywords(`${agenda?.title || ""}\n${text}`);
  const snippet = utterances.find((item) => compact(item.text).length > 40)?.text || text;
  const quarter = quarterFromDate(meeting.date);
  const isProcedural = agenda?.type === "절차" || /회의록|속기록|성원|국민의례|공개여부|안건현황|촬영|방청|개회|폐회|산회|차기 회의|일정/.test(agenda?.title || "");
  const searchFields = compact([
    meeting.meetingLabel,
    meeting.date,
    agenda?.title,
    agenda?.type,
    targets.join(" "),
    lawArticles.join(" "),
    issueTags.join(" "),
    dispositions.join(" "),
    amountText,
    caseIds.join(" "),
    utterances.slice(0, 8).map((item) => item.text).join(" "),
  ].join(" ")).toLowerCase();

  return {
    id: `${meeting.id}-${agenda?.id || "meeting"}`,
    meetingId: meeting.id,
    date: meeting.date,
    year: meeting.year,
    quarter,
    quarterKey: quarter ? `${meeting.year}-Q${quarter}` : "",
    meetingLabel: meeting.meetingLabel,
    title: agenda?.title || meeting.title,
    type: agenda?.type || "회의",
    startUtteranceId: agenda?.startUtteranceId || utterances[0]?.id || "",
    utteranceCount: utterances.length,
    targets,
    lawArticles,
    issueTags,
    dispositions,
    amountTotalKrw,
    amountText,
    caseIds,
    sourceConfidence,
    similarAgendas: [],
    speakers,
    keywords,
    snippet: shortText(snippet, 260),
    isProcedural,
    searchText: shortText(searchFields, 5000),
  };
}

function analyzeMeeting({ data, meeting, detail, characterLookup }) {
  const penaltyRows = matchingPenaltyCases(data, meeting);
  const agendaUtterances = new Map();
  for (const utterance of detail.utterances || []) {
    const key = utterance.agendaId || "meeting";
    if (!agendaUtterances.has(key)) agendaUtterances.set(key, []);
    agendaUtterances.get(key).push(utterance);
  }

  const agendas = detail.agendas?.length ? detail.agendas : [{ id: "meeting", title: meeting.title, type: "회의", startUtteranceId: detail.utterances?.[0]?.id || "" }];
  const agendaAnalyses = agendas.map((agenda) => analyzeAgenda({
    meeting,
    agenda,
    utterances: agendaUtterances.get(agenda.id) || detail.utterances || [],
    penaltyRows: penaltyRowsForAgenda(penaltyRows, agenda, (agendaUtterances.get(agenda.id) || []).slice(0, 8).map((item) => item.text).join("\n")),
  }));
  const fullText = detail.transcriptText || "";
  const lawArticles = unique((detail.lawReferences || []).map(lawLabel), 40);
  const speakers = speakerStats(detail.utterances || []);
  const targets = unique([
    ...agendaAnalyses.flatMap((item) => item.targets),
  ], 24);
  const keywords = unique([
    ...agendaAnalyses.flatMap((item) => item.keywords),
    ...extractKeywords(fullText),
  ], 24);

  return {
    targets,
    keywords,
    lawArticles,
    speakers,
    agendaAnalyses,
    penaltyCases: penaltyRows.map((item) => ({
      caseId: item.case_id,
      caseNo: item.case_no,
      targetName: item.target_name || item.top_target_name || "",
      caseTitle: item.case_title || "",
      amountTotalKrw: item.amount_total_krw || 0,
      amountText: formatKrw(item.amount_total_krw || item.monetary_penalty_amount_total_krw || 0),
      dispositions: extractDispositions(item.case_title || item.agenda_title || "", [item]),
      penaltyBreakdown: item.penalty_breakdown || [],
    })),
    animationTimeline: buildAnimationTimeline({ meeting, detail, characterLookup }),
  };
}

function buildQuarterlyStats(searchIndex, meetings) {
  const groups = new Map();
  for (const meeting of meetings) {
    const quarter = quarterFromDate(meeting.date);
    if (!quarter) continue;
    const key = `${meeting.year}-Q${quarter}`;
    const current = groups.get(key) || {
      key,
      year: meeting.year,
      quarter,
      label: `${meeting.year}년 ${quarter}분기`,
      meetingIds: new Set(),
      agendaCount: 0,
      utteranceCount: 0,
      lawReferenceCount: 0,
      speakerNames: new Set(),
      targetCounts: new Map(),
      keywordCounts: new Map(),
      articleCounts: new Map(),
    };
    current.meetingIds.add(meeting.id);
    current.agendaCount += meeting.agendaCount || 0;
    current.utteranceCount += meeting.utteranceCount || 0;
    current.lawReferenceCount += meeting.lawReferenceCount || 0;
    for (const speaker of meeting.speakers || []) current.speakerNames.add(speaker.name);
    groups.set(key, current);
  }

  for (const entry of searchIndex) {
    const group = groups.get(entry.quarterKey);
    if (!group) continue;
    for (const target of entry.targets || []) addCount(group.targetCounts, target);
    for (const keyword of entry.keywords || []) addCount(group.keywordCounts, keyword);
    for (const article of entry.lawArticles || []) addCount(group.articleCounts, article);
  }

  return [...groups.values()]
    .sort((left, right) => right.year - left.year || right.quarter - left.quarter)
    .map((group) => ({
      key: group.key,
      year: group.year,
      quarter: group.quarter,
      label: group.label,
      meetingCount: group.meetingIds.size,
      agendaCount: group.agendaCount,
      utteranceCount: group.utteranceCount,
      lawReferenceCount: group.lawReferenceCount,
      speakerCount: group.speakerNames.size,
      topTargets: rankFromMap(group.targetCounts, 5),
      topKeywords: rankFromMap(group.keywordCounts, 5),
      topArticles: rankFromMap(group.articleCounts, 5),
    }));
}

function overlap(left = [], right = []) {
  const rightSet = new Set(right);
  return left.filter((item) => rightSet.has(item));
}

function similarityReason(left, right) {
  const target = overlap(left.targets || [], right.targets || [])[0];
  if (target) return `같은 처분대상: ${target}`;
  const article = overlap(left.lawArticles || [], right.lawArticles || [])[0];
  if (article) return "같은 조항";
  const issue = overlap(left.issueTags || [], right.issueTags || [])[0];
  if (issue) return `같은 쟁점: ${issue}`;
  const disposition = overlap(left.dispositions || [], right.dispositions || [])[0];
  if (disposition) return `같은 조치: ${disposition}`;
  return "";
}

function similarityScore(left, right) {
  return overlap(left.targets || [], right.targets || []).length * 5
    + overlap(left.lawArticles || [], right.lawArticles || []).length * 3
    + overlap(left.issueTags || [], right.issueTags || []).length * 2
    + overlap(left.dispositions || [], right.dispositions || []).length;
}

function attachSimilarAgendas(searchIndex) {
  for (const entry of searchIndex) {
    entry.similarAgendas = searchIndex
      .filter((candidate) => candidate.id !== entry.id)
      .map((candidate) => ({ candidate, score: similarityScore(entry, candidate), reason: similarityReason(entry, candidate) }))
      .filter((item) => item.score > 0 && item.reason)
      .sort((left, right) => right.score - left.score || String(right.candidate.date || "").localeCompare(String(left.candidate.date || "")))
      .slice(0, 3)
      .map(({ candidate, reason }) => ({
        id: candidate.id,
        date: candidate.date,
        meetingLabel: candidate.meetingLabel,
        title: candidate.title,
        reason,
      }));
  }
}

const data = await readDashboardData();
const characters = await readCharacters();
const characterLookup = makeCharacterLookup(characters);
const records = (data.meetingTranscripts || []).map(normalizeTranscriptRecord);
const meetings = {};
const compactMeetings = [];
const searchIndex = [];
const errors = [];

for (const record of records) {
  const sourcePath = normalizePath(record.path || "");
  const rawPath = sourcePath.replace(/^\.\.\//, "");
  try {
    const rawText = await readFile(resolve(root, rawPath), "utf8");
    const detail = parseTranscript(rawText, record);
    const analysis = analyzeMeeting({ data, meeting: record, detail, characterLookup });
    const { transcriptText, ...detailWithoutTranscriptText } = detail;
    const meetingPayload = {
      meetingId: record.id,
      sourcePath: rawPath,
      meeting: record,
      ...detailWithoutTranscriptText,
      transcriptText: "",
      analysis: {
        targets: analysis.targets,
        keywords: analysis.keywords,
        lawArticles: analysis.lawArticles,
        speakers: analysis.speakers,
        agendaAnalyses: analysis.agendaAnalyses,
        penaltyCases: analysis.penaltyCases,
      },
      animationTimeline: analysis.animationTimeline,
    };
    meetings[record.id] = meetingPayload;
    compactMeetings.push({
      id: record.id,
      date: record.date,
      year: record.year,
      quarter: quarterFromDate(record.date),
      meetingLabel: record.meetingLabel,
      title: record.title,
      sourcePath: rawPath,
      agendaCount: detail.agendas?.length || 0,
      utteranceCount: detail.utterances?.length || 0,
      lawReferenceCount: detail.lawReferences?.length || 0,
      targets: analysis.targets,
      keywords: analysis.keywords,
      lawArticles: analysis.lawArticles,
      speakers: analysis.speakers,
    });
    searchIndex.push(...analysis.agendaAnalyses.filter((agenda) => !agenda.isProcedural));
  } catch (error) {
    errors.push({ meetingId: record.id, sourcePath: rawPath, message: error.message });
  }
}

attachSimilarAgendas(searchIndex);

const targetCounts = new Map();
const keywordCounts = new Map();
const articleCounts = new Map();
const speakerCounts = new Map();
const issueCounts = new Map();
const dispositionCounts = new Map();
for (const entry of searchIndex) {
  for (const target of entry.targets || []) addCount(targetCounts, target);
  for (const article of entry.lawArticles || []) addCount(articleCounts, article);
  for (const speaker of entry.speakers || []) addCount(speakerCounts, speaker);
  for (const issue of entry.issueTags || []) addCount(issueCounts, issue);
  for (const disposition of entry.dispositions || []) addCount(dispositionCounts, disposition);
}

const payload = {
  generatedAt: new Date().toISOString(),
  source: "kordoc-converted markdown + local transcript parser + PIPC dashboard sanctions snapshot",
  mcpNotes: {
    koreanLawMcp: "korean-law-mcp@3.5.4 패키지 확인. LAW_OC/API 키가 없는 로컬 환경에서는 조문 조회 파라미터와 로컬 스냅샷을 표시합니다.",
    kordoc: "kordoc 변환 산출물 Markdown을 입력으로 사용했습니다.",
  },
  totals: {
    transcriptMeetings: records.length,
    parsedMeetings: compactMeetings.length,
    searchEntries: searchIndex.length,
    errors: errors.length,
  },
  characterAssets: characters.map((character) => ({
    id: character.id,
    name: character.name,
    role: character.role,
    status: character.status,
    characterType: character.character_type,
    asset: character.asset,
    aliases: character.aliases,
  })),
  compactMeetings,
  quarterlyStats: buildQuarterlyStats(searchIndex, compactMeetings),
  globalStats: {
    topTargets: rankFromMap(targetCounts, 12),
    topKeywords: rankFromMap(keywordCounts, 16),
    topArticles: rankFromMap(articleCounts, 16),
    topIssues: rankFromMap(issueCounts, 16),
    topDispositions: rankFromMap(dispositionCounts, 16),
    topSpeakers: rankFromMap(speakerCounts, 12),
  },
  searchIndex,
  meetings,
  errors,
};

const body = `window.PIPC_MEETING_ANALYSIS_INDEX=${JSON.stringify(payload)};\nwindow.PIPC_MEETING_DETAIL_INDEX=window.PIPC_MEETING_ANALYSIS_INDEX;\n`;
await writeFile(resolve(root, outputPath), body, "utf8");
console.log(`${outputPath} written`);
console.log(`${compactMeetings.length}/${records.length} meetings, ${searchIndex.length} agenda search entries, ${errors.length} errors`);
