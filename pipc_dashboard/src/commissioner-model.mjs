function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function optionalNumber(source, key) {
  if (!Object.prototype.hasOwnProperty.call(source, key)) return null;
  return number(source[key]);
}

function isRecord(value) {
  return value && typeof value === "object";
}

function normalizeTags(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      return item?.tag_label || item?.label || item?.tag || item?.name || "";
    })
    .filter(Boolean);
}

function normalizeTagDetails(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return { label: item, count: null };
      const label = item?.tag_label || item?.label || item?.tag || item?.name || "";
      return {
        label,
        count: Object.prototype.hasOwnProperty.call(item || {}, "utterance_count") ? number(item.utterance_count) : null,
      };
    })
    .filter((item) => item.label);
}

function mergeTagDetails(primary = [], fallback = []) {
  const fallbackCounts = new Map(fallback.map((item) => [item.label, item.count]));
  const source = primary.length ? primary : fallback;
  return source.map((item) => ({
    ...item,
    count: item.count ?? fallbackCounts.get(item.label) ?? null,
  }));
}

function firstText(...values) {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (text) return text;
  }
  return "";
}

const GENERIC_QUESTION_TAGS = new Set(["절차·법리·근거 검토", "사실관계·증거 확인"]);
const TAG_KEYWORDS = {
  "AI·데이터 활용 거버넌스": ["AI", "인공지능", "데이터", "가명", "모델", "활용", "자동화"],
  "공공부문 책임성 강조": ["공공", "기관", "행정", "책임", "이행", "담당"],
  "기술·보안 통제 점검": ["보안", "안전", "접속", "접근", "권한", "암호", "암호화", "유출", "공격", "취약", "통제", "로그"],
  "사업자 부담·산업 맥락 고려": ["사업자", "기업", "부담", "산업", "시장", "서비스", "영업", "비용"],
  "정보주체 권리·피해 관점": ["정보주체", "이용자", "소비자", "피해", "권리", "구제", "손해배상"],
  "재발방지·개선·예방 지향": ["개선", "재발", "예방", "조치", "이행", "점검", "계획", "사후"],
  "처분 실효성·제재수준 점검": ["처분", "제재", "과징금", "과태료", "시정", "수준", "실효"],
  "절차·법리·근거 검토": ["법", "법적", "법리", "근거", "조항", "해석", "절차", "원칙", "기준"],
  "사실관계·증거 확인": ["사실", "증거", "자료", "확인", "기록", "경위"],
};
const TERM_STOPWORDS = new Set([
  "위원", "위원장", "비상임위원", "상임위원", "관점", "문체", "역할", "회의", "안건", "정책", "확인", "질문",
  "검토", "정리", "중심", "유형", "분석", "흐름", "실제", "가능", "어떤", "어떻게", "있는지", "없는지",
]);

function questionTags(topTagDetails = [], characterTags = [], activityTags = []) {
  const labels = [...topTagDetails.map((item) => item.label), ...characterTags, ...activityTags].filter(Boolean);
  const unique = [...new Set(labels)];
  const specific = unique.filter((label) => !GENERIC_QUESTION_TAGS.has(label));
  return (specific.length ? specific : unique).slice(0, 2);
}

function keywordTerms({ character = {}, activity = {}, topTagDetails = [], characterTags = [], activityTags = [], meetingRole = "" } = {}) {
  const tagLabels = [...topTagDetails.map((item) => item.label), ...characterTags, ...activityTags].filter(Boolean);
  const sources = [
    meetingRole,
    character.meeting_function,
    activity.meeting_function,
    character.character_type,
    activity.character_type,
    character.core_motif,
    activity.core_motif,
    ...tagLabels,
    ...tagLabels.flatMap((label) => TAG_KEYWORDS[label] || []),
  ];
  const terms = new Set();
  for (const source of sources) {
    for (const token of String(source || "").match(/[가-힣A-Za-z0-9]{2,}/g) || []) {
      if (!TERM_STOPWORDS.has(token)) terms.add(token);
    }
  }
  return [...terms];
}

function asQuestionPerspective(value = "") {
  const text = String(value || "").trim().replace(/[.。!?！？]+$/, "");
  if (!text) return "";
  if (text.includes("관점에서")) {
    return text
      .replace(/관점에서\s*/, "관점으로 ")
      .replace(/을 정리한다$/, "을 정리하는 흐름")
      .replace(/를 정리한다$/, "를 정리하는 흐름")
      .replace(/을 확인한다$/, "을 확인하는 흐름")
      .replace(/를 확인한다$/, "를 확인하는 흐름")
      .replace(/한다$/, "하는 흐름")
      .replace(/는다$/, "는 흐름")
      .replace(/다$/, "는 흐름");
  }
  return text
    .replace(/을 동시에 묻는다$/, "을 동시에 묻는 관점")
    .replace(/를 동시에 묻는다$/, "를 동시에 묻는 관점")
    .replace(/을 정리한다$/, "을 정리하는 관점")
    .replace(/를 정리한다$/, "를 정리하는 관점")
    .replace(/을 연결한다$/, "을 연결하는 관점")
    .replace(/를 연결한다$/, "를 연결하는 관점")
    .replace(/을 선명하게 잡는다$/, "을 선명하게 잡는 관점")
    .replace(/를 선명하게 잡는다$/, "를 선명하게 잡는 관점")
    .replace(/을 회의 안으로 가져온다$/, "을 회의 안으로 가져오는 관점")
    .replace(/를 회의 안으로 가져온다$/, "를 회의 안으로 가져오는 관점")
    .replace(/의 현실성을 찌른다$/, "의 현실성을 검증하는 관점")
    .replace(/의 단단함을 검토한다$/, "의 단단함을 검토하는 관점")
    .replace(/을 밀도 있게 묻는다$/, "을 밀도 있게 묻는 관점")
    .replace(/를 밀도 있게 묻는다$/, "를 밀도 있게 묻는 관점")
    .replace(/한다$/, "하는 관점")
    .replace(/는다$/, "는 관점")
    .replace(/다$/, "는 관점");
}

function buildRepresentativeQuestion({ activity = {}, character = {}, topTagDetails = [], characterTags = [], activityTags = [], meetingRole = "" } = {}) {
  const explicitQuestion = firstText(activity.representative_question, character.representative_question);
  if (explicitQuestion) return explicitQuestion;

  const tags = questionTags(topTagDetails, characterTags, activityTags);
  const tagText = tags.length ? tags.map((tag) => `"${tag}"`).join(", ") : "핵심";
  const perspective = asQuestionPerspective(meetingRole) || firstText(character.character_type, activity.character_type, character.core_motif, activity.core_motif);
  if (perspective) {
    return `${perspective}에서 이 안건의 ${tagText} 쟁점을 어떤 사실과 근거로 확인해야 합니까?`;
  }
  return tags.length ? `${tagText} 쟁점을 어떤 사실과 근거로 확인해야 합니까?` : "";
}

function isQuestionLike(text = "") {
  return isDirectQuestionLike(text) || /질문|문의/.test(text);
}

function isDirectQuestionLike(text = "") {
  return /[?？]|습니까|입니까|됩니까|합니까|아닙니까|맞습니까|있습니까|없습니까|겠습니까|주십니까|하십니까|나요|지요|죠|여쭤봅니다|궁금합니다|확인해 주시기 바랍니다|설명해 주시기 바랍니다|답변해 주시기 바랍니다|말씀해 주시기 바랍니다|인지 확인|는지 확인|인지 설명|는지 설명|인지 답변|는지 답변|맞는지/.test(text);
}

function sentenceChunks(text = "") {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  return (normalized.match(/[^.!?？。]+[.!?？。]?/g) || [normalized])
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

function questionExcerpt(text = "") {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  const chunks = sentenceChunks(normalized);
  const directMatches = chunks.filter((chunk) => isDirectQuestionLike(chunk));
  if (directMatches.length) return directMatches.slice(0, 2).join(" ");
  const matches = chunks.map((chunk) => chunk.trim()).filter((chunk) => chunk && isQuestionLike(chunk));
  if (!matches.length) return isQuestionLike(normalized) ? normalized : "";
  return matches.slice(0, 2).join(" ");
}

function shortenQuestionText(value = "", limit = 150) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  const slice = text.slice(0, Math.max(limit - 1, 0));
  const cut = Math.max(slice.lastIndexOf(" "), slice.lastIndexOf(","), slice.lastIndexOf("，"));
  return `${slice.slice(0, cut > 50 ? cut : limit - 1).trim()}…`;
}

function trimQuestionLead(value = "", terms = []) {
  let text = String(value || "").replace(/\s+/g, " ").trim();
  text = text.replace(/^(그런데|그리고|그래서|다만|또한|한편)\s*/, "");
  let bestIndex = -1;
  for (const term of terms) {
    const needle = String(term || "").trim();
    if (needle.length < 2) continue;
    const index = text.indexOf(needle);
    if (index > 8 && (bestIndex === -1 || index < bestIndex)) bestIndex = index;
  }
  if (bestIndex > 8 && bestIndex < text.length * 0.45) text = text.slice(bestIndex);
  return text.trim();
}

function summarizeRepresentativeQuestion(text = "", terms = []) {
  const chunks = sentenceChunks(text);
  const pool = chunks.filter(isDirectQuestionLike);
  const candidates = pool.length ? pool : chunks.filter(isQuestionLike);
  if (!candidates.length) return shortenQuestionText(text);

  const ranked = candidates
    .map((chunk, order) => {
      const haystack = chunk.toLowerCase();
      const matched = terms.filter((term) => haystack.includes(String(term).toLowerCase())).length;
      const score = matched * 12 + (/[?？]/.test(chunk) ? 8 : 0) + (chunk.length >= 35 ? 4 : 0) - Math.max(chunk.length - 170, 0) / 12;
      return { chunk, order, score };
    })
    .sort((left, right) => right.score - left.score || left.order - right.order)
    .slice(0, 2)
    .sort((left, right) => left.order - right.order)
    .map((item) => trimQuestionLead(item.chunk, terms));

  return shortenQuestionText(ranked.join(" "), 150);
}

function detailMeetings(detailIndex = {}) {
  if (Array.isArray(detailIndex?.meetings)) return detailIndex.meetings;
  if (isRecord(detailIndex?.meetings)) return Object.values(detailIndex.meetings);
  if (Array.isArray(detailIndex?.meetingDetails)) return detailIndex.meetingDetails;
  return [];
}

function collectUtterancesBySpeaker(detailIndex = {}) {
  const bySpeaker = new Map();
  for (const detail of detailMeetings(detailIndex)) {
    if (!isRecord(detail)) continue;
    const utterances = Array.isArray(detail.utterances) ? detail.utterances : [];
    const meeting = isRecord(detail.meeting) ? detail.meeting : {};
    const meetingId = firstText(detail.meetingId, meeting.id, detail.id);
    const meetingLabel = firstText(meeting.meetingLabel, meeting.label, detail.meetingLabel, detail.title, meeting.title);
    const date = firstText(meeting.date, detail.date);
    const agendaById = new Map((Array.isArray(detail.agendas) ? detail.agendas : [])
      .filter(isRecord)
      .map((agenda) => [agenda.id, agenda]));

    for (const utterance of utterances) {
      if (!isRecord(utterance)) continue;
      const speakerName = firstText(utterance.speakerName, utterance.speaker_name);
      if (!speakerName) continue;
      const agenda = agendaById.get(utterance.agendaId) || {};
      const enriched = {
        ...utterance,
        meetingId,
        meetingLabel,
        date,
        agendaTitle: firstText(agenda.title, utterance.sectionTitle),
      };
      if (!bySpeaker.has(speakerName)) bySpeaker.set(speakerName, []);
      bySpeaker.get(speakerName).push(enriched);
    }
  }
  return bySpeaker;
}

function scoreQuestionCandidate(candidate = {}, terms = []) {
  const text = candidate.text || "";
  if (!text || !isQuestionLike(text)) return -Infinity;
  let score = 100;
  if (/[?？]/.test(text)) score += 18;
  if (/확인|설명|답변|말씀|질문|문의/.test(text)) score += 12;
  if (/위원/.test(`${candidate.speakerRole || ""} ${candidate.speaker || ""}`)) score += 8;
  if (/개회선언|폐회|공개여부|성원보고/.test(candidate.sectionTitle || "")) score -= 50;

  const haystack = text.toLowerCase();
  const matchedTerms = new Set();
  for (const term of terms) {
    if (haystack.includes(String(term).toLowerCase())) matchedTerms.add(term);
  }
  score += Math.min(matchedTerms.size * 12, 84);

  const length = text.length;
  if (length >= 35 && length <= 420) score += 18;
  if (length < 20) score -= 28;
  if (length > 650) score -= Math.min(Math.floor((length - 650) / 30), 40);
  return score;
}

function selectRepresentativeTranscriptQuestion({ utterances = [], character = {}, activity = {}, topTagDetails = [], characterTags = [], activityTags = [], meetingRole = "" } = {}) {
  const terms = keywordTerms({ character, activity, topTagDetails, characterTags, activityTags, meetingRole });
  const candidates = utterances
    .map((utterance, index) => {
      const originalText = firstText(utterance.text);
      const text = questionExcerpt(originalText);
      const candidate = { ...utterance, text, originalText, order: index };
      return { candidate, score: scoreQuestionCandidate(candidate, terms) };
    })
    .filter((item) => Number.isFinite(item.score))
    .sort((left, right) => right.score - left.score || left.candidate.order - right.candidate.order);
  const best = candidates[0]?.candidate;
  if (!best) return { text: "", originalText: "", source: null };
  return {
    text: summarizeRepresentativeQuestion(best.text, terms) || best.text,
    originalText: best.originalText || best.text,
    source: {
      meetingId: best.meetingId || "",
      utteranceId: best.id || "",
      agendaId: best.agendaId || "",
      meetingLabel: best.meetingLabel || "",
      date: best.date || "",
      agendaTitle: best.agendaTitle || "",
    },
  };
}

function resolveRepresentativeQuestion(options = {}) {
  const transcriptQuestion = selectRepresentativeTranscriptQuestion(options);
  if (transcriptQuestion.text) return transcriptQuestion;
  return {
    text: buildRepresentativeQuestion(options),
    originalText: "",
    source: null,
  };
}

function characterAssetPath(character = {}) {
  const explicitPath = character.asset || character.image || character.image_path || "";
  if (explicitPath && !String(explicitPath).includes("../pipc_knowledge_base/")) return explicitPath;
  if (!character.id) return "";
  return `./assets/commissioners/${character.id}_sd3d_character.png`;
}

function normalizeGeneration(value) {
  return String(value || "").trim();
}

function roleTone(role = "", route = "") {
  if (/부위원장/.test(role)) return "vice";
  if (/위원장/.test(role)) return "chair";
  if (/상임|당연/.test(route)) return "executive";
  return "member";
}

function roleRank(item = {}) {
  const tone = item.roleTone || roleTone(item.role, item.recommendationRoute);
  if (tone === "chair") return 0;
  if (tone === "vice") return 1;
  if (tone === "executive") return 2;
  return 3;
}

function isCurrentSecondCommissioner(row = {}) {
  const generation = normalizeGeneration(row.generation);
  const status = `${row.term_status || ""} ${row.commissioner_status || ""} ${row.display_status || ""}`;
  return generation.includes("2기") && /current|현직/.test(status) && !/former|전직|교체/.test(status);
}

function isFormerSecondCommissioner(row = {}) {
  const generation = normalizeGeneration(row.generation);
  const status = `${row.term_status || ""} ${row.commissioner_status || ""} ${row.display_status || ""}`;
  return generation.includes("2기") && /former|전직|교체/.test(status);
}

function buildCommissionerCard({ name, member = {}, activity = {}, character = {}, representativeUtterances = [] } = {}) {
  const role = firstText(member.role_current, member.term_role, character.role, activity.role_current, "위원");
  const recommendationRoute = firstText(member.recommendation_route, member.appointment_route, activity.recommendation_route);
  const tone = roleTone(role, recommendationRoute);
  const characterTags = normalizeTags(character.top_tags);
  const activityTags = normalizeTags(activity.top_tags);
  const topTagDetails = mergeTagDetails(normalizeTagDetails(character.top_tags), normalizeTagDetails(activity.top_tags));
  const meetingRole = firstText(character.meeting_function, activity.meeting_function);
  const representativeQuestion = resolveRepresentativeQuestion({
    activity,
    character,
    topTagDetails,
    characterTags,
    activityTags,
    meetingRole,
    utterances: representativeUtterances,
  });
  return {
    id: firstText(character.id, member.commissioner_id, activity.commissioner_id, name),
    name,
    generation: firstText(member.generation, character.generation, activity.generation),
    role,
    roleTone: tone,
    isExecutive: tone === "chair" || tone === "vice" || tone === "executive",
    status: firstText(member.display_status, member.commissioner_status, character.status, activity.status),
    characterType: firstText(character.character_type, activity.character_type, "분석 대기"),
    meetingRole,
    questionStyle: firstText(character.voice_direction, activity.voice_direction),
    representativeQuestion: representativeQuestion.text,
    representativeQuestionOriginal: representativeQuestion.originalText || null,
    representativeQuestionSource: representativeQuestion.source,
    asset: characterAssetPath(character),
    termText: firstText(member.official_term_text, member.term_text),
    affiliation: recommendationRoute,
    recommendationRoute,
    appearances: optionalNumber(member, "appearances"),
    totalUtterances: number(activity.total_utterances),
    questionCount: optionalNumber(activity, "question_count"),
    agendaCount: optionalNumber(activity, "agenda_count"),
    meetingCount: optionalNumber(activity, "meeting_count"),
    topTags: characterTags.length ? characterTags : activityTags,
    topTagDetails,
    evidenceLinks: [],
  };
}

export function normalizeCommissionerCharacters(value) {
  const rows = Array.isArray(value) ? value : Array.isArray(value?.characters) ? value.characters : [];
  return rows
    .filter((item) => item && item.name)
    .map((item) => ({ ...item, asset: characterAssetPath(item) }));
}

function sortCommissionerCards(rows = []) {
  return [...rows].sort((left, right) => roleRank(left) - roleRank(right) || String(left.name || "").localeCompare(String(right.name || ""), "ko"));
}

function mapByName(rows = []) {
  return new Map(rows.filter((item) => item?.name).map((item) => [item.name, item]));
}

function cardFromActivity(activity = {}, charactersByName = new Map(), utterancesBySpeaker = new Map()) {
  const name = firstText(activity.commissioner_name, activity.name);
  const character = charactersByName.get(name) || {};
  return buildCommissionerCard({ name, activity, character, representativeUtterances: utterancesBySpeaker.get(name) || [] });
}

function cardFromMember(member = {}, activityByName = new Map(), charactersByName = new Map(), utterancesBySpeaker = new Map()) {
  const name = firstText(member.name, member.commissioner_name);
  const activity = activityByName.get(name) || {};
  const character = charactersByName.get(name) || {};
  return buildCommissionerCard({ name, member, activity, character, representativeUtterances: utterancesBySpeaker.get(name) || [] });
}

function cardFromCharacter(character = {}, activityByName = new Map(), utterancesBySpeaker = new Map()) {
  const name = firstText(character.name);
  const activity = activityByName.get(name) || {};
  return buildCommissionerCard({ name, activity, character, representativeUtterances: utterancesBySpeaker.get(name) || [] });
}

function isFirstGenerationCharacter(character = {}) {
  const generation = normalizeGeneration(character.generation);
  return generation.includes("1기") && !generation.startsWith("2기");
}

function uniqueByName(rows = []) {
  const seen = new Set();
  return rows.filter((item) => {
    if (!item?.name || seen.has(item.name)) return false;
    seen.add(item.name);
    return true;
  });
}

export function buildCommissionerAnalysisModel(data = {}) {
  if (!isRecord(data)) data = {};
  const characters = normalizeCommissionerCharacters(data.commissionerCharacters);
  const charactersByName = mapByName(characters);
  const activityRows = Array.isArray(data.commissionerActivity) ? data.commissionerActivity.filter(isRecord) : [];
  const activityByName = mapByName(activityRows.map((activity) => ({
    ...activity,
    name: firstText(activity.commissioner_name, activity.name),
  })));
  const secondRows = Array.isArray(data.secondCommissioners) ? data.secondCommissioners.filter(isRecord) : [];
  const utterancesBySpeaker = collectUtterancesBySpeaker(data.detailIndex || data.meetingAnalysisIndex || data.meetingDetailIndex || {});

  const commissioners = activityRows.map((activity) => cardFromActivity(activity, charactersByName, utterancesBySpeaker));
  const currentSecondCommissioners = sortCommissionerCards(secondRows
    .filter(isCurrentSecondCommissioner)
    .map((member) => cardFromMember(member, activityByName, charactersByName, utterancesBySpeaker)));
  const formerSecondCommissioners = sortCommissionerCards(secondRows
    .filter(isFormerSecondCommissioner)
    .map((member) => cardFromMember(member, activityByName, charactersByName, utterancesBySpeaker)));
  const secondNames = new Set([...currentSecondCommissioners, ...formerSecondCommissioners].map((item) => item.name));
  const firstGenerationCommissioners = sortCommissionerCards(uniqueByName(characters
    .filter((character) => isFirstGenerationCharacter(character) && !secondNames.has(character.name))
    .map((character) => cardFromCharacter(character, activityByName, utterancesBySpeaker))));

  return {
    commissioners,
    currentSecondCommissioners,
    formerSecondCommissioners,
    firstGenerationCommissioners,
  };
}
