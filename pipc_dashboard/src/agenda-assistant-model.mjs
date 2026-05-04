const KEY_TOKENS = ["접속기록", "안전조치", "유출", "과징금", "공표", "AI", "국외이전", "처분", "동의"];
const KEY_TOKEN_LOOKUP = new Set(KEY_TOKENS.map((token) => token.toLowerCase()));

const ISSUE_BY_TOKEN = {
  접속기록: {
    label: "접속기록 보관·점검",
    detail: "접속기록 생성, 보관 기간, 위변조 방지 조치가 쟁점입니다.",
    tone: "blue",
  },
  안전조치: {
    label: "안전조치 의무 이행",
    detail: "접근통제, 암호화, 접속기록 관리 등 보호조치 수준을 확인해야 합니다.",
    tone: "lavender",
  },
  유출: {
    label: "유출 경위와 피해 범위",
    detail: "유출 원인, 통지 여부, 추가 피해 방지 조치가 핵심입니다.",
    tone: "coral",
  },
  과징금: {
    label: "과징금 산정 근거",
    detail: "위반 기간, 매출 기준, 감경·가중 사유를 준비해야 합니다.",
    tone: "coral",
  },
  공표: {
    label: "처분 공표 필요성",
    detail: "공표 요건과 공익상 필요성을 별도로 검토해야 합니다.",
    tone: "slate",
  },
  AI: {
    label: "AI 처리 투명성",
    detail: "자동화 처리, 설명 가능성, 데이터 활용 범위를 확인해야 합니다.",
    tone: "lavender",
  },
  국외이전: {
    label: "국외이전 고지·동의",
    detail: "이전받는 자, 이전 국가, 보유 기간, 동의 절차가 쟁점입니다.",
    tone: "blue",
  },
  처분: {
    label: "처분 수위 적정성",
    detail: "시정명령, 과징금, 공표 등 처분 조합의 균형을 점검해야 합니다.",
    tone: "slate",
  },
  동의: {
    label: "동의의 유효성",
    detail: "고지 항목, 선택권, 철회 절차가 충분했는지 확인해야 합니다.",
    tone: "blue",
  },
};

function isRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function text(value) {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(" ");
  if (isRecord(value)) return Object.values(value).map(text).filter(Boolean).join(" ");
  return String(value);
}

function firstText(...values) {
  return values.map(text).find(Boolean) || "";
}

function uniqueTexts(values) {
  const flattened = values.flatMap((value) => (Array.isArray(value) ? value : [value]));
  return [...new Set(flattened.map(text).filter(Boolean))];
}

function compact(value) {
  return text(value).toLowerCase().replace(/\s+/g, "");
}

function findKeyTokens(value) {
  const compactText = compact(value);
  return KEY_TOKENS.filter((token) => compactText.includes(token.toLowerCase()));
}

function tokenize(value) {
  const rawText = text(value);
  const tokens = new Set();
  const words = rawText.toLowerCase().match(/[a-z0-9가-힣]+/g) || [];

  for (const word of words) {
    if (word.length >= 2 && !KEY_TOKEN_LOOKUP.has(word)) tokens.add(word);
  }
  for (const token of findKeyTokens(rawText)) tokens.add(token);

  return tokens;
}

function normalizeAgenda(agenda) {
  if (!isRecord(agenda)) return null;

  const title = firstText(agenda.title, agenda.agenda_title, agenda.name, agenda.target_name);
  const lawArticles = uniqueTexts([
    agenda.lawArticle,
    agenda.law_article,
    agenda.lawArticles,
    agenda.law_articles,
    agenda.law_article_text,
  ]);
  const lawArticle = lawArticles[0] || "";
  const disposition = firstText(agenda.disposition, agenda.sanction_type, agenda.decision_type);
  const searchableText = text([
    title,
    agenda.summary,
    agenda.keywords,
    lawArticles,
    disposition,
    agenda.targetName,
    agenda.target_name,
  ]);

  return {
    title,
    targetName: firstText(agenda.targetName, agenda.target_name),
    lawArticle,
    lawArticles,
    disposition,
    amountTotalKrw: agenda.amountTotalKrw ?? agenda.amount_total_krw ?? null,
    amountText: firstText(agenda.amountText, agenda.amount_text),
    searchableText,
  };
}

function scoreAgenda(agenda, requestTokens, index) {
  const agendaTokens = tokenize(agenda.searchableText);
  const matchedTokens = [...requestTokens].filter((token) => agendaTokens.has(token));
  const score = matchedTokens.reduce((sum, token) => sum + (KEY_TOKENS.includes(token) ? 2 : 1), 0);

  return { ...agenda, index, score, matchedTokens };
}

function buildSimilarAgendas(historicalAgendas, requestText) {
  const requestTokens = tokenize(requestText);
  if (!requestTokens.size || !Array.isArray(historicalAgendas)) return [];

  return historicalAgendas
    .map((agenda, index) => {
      const normalized = normalizeAgenda(agenda);
      return normalized ? scoreAgenda(normalized, requestTokens, index) : null;
    })
    .filter((agenda) => agenda && agenda.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({ index, searchableText, ...agenda }) => agenda);
}

function buildExpectedIssues(requestText) {
  return findKeyTokens(requestText).map((token) => ({
    token,
    ...ISSUE_BY_TOKEN[token],
  }));
}

function uniqueByLabel(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item.label || seen.has(item.label)) return false;
    seen.add(item.label);
    return true;
  });
}

function buildSimilarProvisions(similarAgendas, requestText) {
  const provisions = similarAgendas
    .flatMap((agenda) => (Array.isArray(agenda.lawArticles) ? agenda.lawArticles : [agenda.lawArticle])
      .filter(Boolean)
      .map((lawArticle) => ({
        label: lawArticle,
        source: agenda.title,
        tone: "lavender",
      })));

  const hasSafetyIssue = findKeyTokens(requestText).includes("안전조치")
    || similarAgendas.some((agenda) => agenda.matchedTokens.includes("안전조치"));
  if (hasSafetyIssue) {
    provisions.push({ label: "개인정보 보호법 제29조", source: "안전조치", tone: "lavender" });
  }

  return uniqueByLabel(provisions);
}

function buildDispositionLevels(similarAgendas) {
  return similarAgendas
    .filter((agenda) => agenda.disposition || number(agenda.amountTotalKrw) > 0 || agenda.amountText)
    .slice(0, 5)
    .map((agenda) => ({
      label: agenda.disposition || "처분 수준 확인 필요",
      amountTotalKrw: number(agenda.amountTotalKrw),
      amountText: agenda.amountText,
      source: agenda.title,
      tone: "coral",
    }));
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeActivityTags(activity) {
  const tags = [];
  const add = (label, count) => {
    if (label) tags.push({ label, count: number(count), index: tags.length });
  };

  if (typeof activity === "string") add(activity, 0);
  if (!isRecord(activity)) return tags;

  add(firstText(activity.tag_label, activity.label, activity.tag), activity.utterance_count);
  const topTags = Array.isArray(activity.top_tags) ? activity.top_tags : [];
  for (const tag of topTags) {
    if (typeof tag === "string") add(tag, 0);
    if (isRecord(tag)) add(firstText(tag.tag_label, tag.label, tag.tag, tag.name), tag.utterance_count);
  }

  return tags.sort((left, right) => right.count - left.count || left.index - right.index);
}

function buildCommissionerQuestions(commissionerActivity) {
  if (!Array.isArray(commissionerActivity)) return [];

  return commissionerActivity
    .filter((activity) => typeof activity === "string" || isRecord(activity))
    .map((activity) => {
      const tag = normalizeActivityTags(activity)[0];
      if (!tag) return null;
      const commissionerName = firstText(activity?.commissioner_name, activity?.name) || "관련 위원";
      return {
        commissionerName,
        tag: tag.label,
        question: `${commissionerName}: "${tag.label}" 관점에서 사실관계와 법적 근거를 어떻게 설명할 수 있습니까?`,
        tone: "blue",
      };
    })
    .filter(Boolean)
    .slice(0, 3);
}

function buildChecklist() {
  return [
    {
      label: "사실관계와 증거 묶음 정리",
      detail: "타임라인, 처리 흐름, 로그·계약·통지 자료를 한 번에 볼 수 있게 준비합니다.",
      tone: "slate",
    },
    {
      label: "법 조항과 처분 근거 확인",
      detail: "유사 안건의 조항, 예상 쟁점, 감경·가중 사유를 대조합니다.",
      tone: "lavender",
    },
    {
      label: "위원 질의 답변 초안 작성",
      detail: "상위 관심 태그별로 짧은 답변과 보강 증거 위치를 연결합니다.",
      tone: "coral",
    },
  ];
}

export function buildAgendaPreparationResult(input = {}) {
  if (!isRecord(input)) input = {};

  const title = text(input.title);
  const summary = text(input.summary);
  const requestText = text([title, summary]);
  const similarAgendas = buildSimilarAgendas(input.historicalAgendas, requestText);

  return {
    title,
    summary,
    similarAgendas,
    expectedIssues: buildExpectedIssues(requestText),
    similarProvisions: buildSimilarProvisions(similarAgendas, requestText),
    dispositionLevels: buildDispositionLevels(similarAgendas),
    commissionerQuestions: buildCommissionerQuestions(input.commissionerActivity),
    checklist: buildChecklist(),
  };
}
