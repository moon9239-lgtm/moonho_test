const KEY_TOKENS = ["접속기록", "안전조치", "유출", "과징금", "공표", "AI", "국외이전", "처분", "동의", "제3자 제공", "위탁", "시정명령", "파기", "정보주체"];
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
  "제3자 제공": {
    label: "제3자 제공 적법성",
    detail: "제공받는 자, 제공 목적, 제공 항목, 동의 또는 법적 근거를 확인해야 합니다.",
    tone: "blue",
  },
  위탁: {
    label: "처리위탁 관리·감독",
    detail: "수탁자 고지, 계약 조항, 재위탁 여부, 관리·감독 증거를 점검해야 합니다.",
    tone: "lavender",
  },
  시정명령: {
    label: "시정명령 필요성",
    detail: "재발방지 대책과 이행 가능성을 처분 주문에 반영해야 합니다.",
    tone: "slate",
  },
  파기: {
    label: "보유기간·파기",
    detail: "보유기간 경과 정보, 분리보관, 파기 기록을 확인해야 합니다.",
    tone: "coral",
  },
  정보주체: {
    label: "정보주체 피해와 권리보장",
    detail: "피해 범위, 권리행사 안내, 추가 통지 필요성을 확인해야 합니다.",
    tone: "blue",
  },
};

const PRIVACY_LAW_ARTICLES = [
  {
    label: "개인정보 보호법 제15조",
    title: "개인정보의 수집ㆍ이용",
    triggers: ["수집", "이용", "동의", "목적", "서비스 가입", "회원"],
    default: true,
    rationale: "개인정보 수집·이용의 적법 근거와 고지 범위를 먼저 확인합니다.",
  },
  {
    label: "개인정보 보호법 제17조",
    title: "개인정보의 제공",
    triggers: ["제3자 제공", "제공", "공유", "제공받는 자", "외부 제공"],
    default: true,
    rationale: "제3자 제공 여부, 제공받는 자, 제공 목적과 항목이 핵심입니다.",
  },
  {
    label: "개인정보 보호법 제18조",
    title: "개인정보의 목적 외 이용ㆍ제공 제한",
    triggers: ["목적 외", "다른 목적", "재사용", "전용", "학습", "모델"],
    default: true,
    rationale: "당초 수집 목적을 넘어선 이용·제공인지 확인합니다.",
  },
  {
    label: "개인정보 보호법 제21조",
    title: "개인정보의 파기",
    triggers: ["파기", "보유기간", "분리보관", "삭제", "보존"],
    default: true,
    rationale: "보유기간 경과 정보와 파기 기록을 확인합니다.",
  },
  {
    label: "개인정보 보호법 제22조",
    title: "동의를 받는 방법",
    triggers: ["동의", "선택 동의", "필수 동의", "고지", "철회"],
    rationale: "동의 방식, 구분 고지, 철회 가능성을 점검합니다.",
  },
  {
    label: "개인정보 보호법 제23조",
    title: "민감정보의 처리 제한",
    triggers: ["민감정보", "건강", "장애", "정치", "신념", "생체"],
    rationale: "민감정보가 포함되면 별도 근거와 안전조치 수준이 중요합니다.",
  },
  {
    label: "개인정보 보호법 제24조",
    title: "고유식별정보의 처리 제한",
    triggers: ["주민등록번호", "여권번호", "운전면허", "외국인등록", "고유식별"],
    rationale: "고유식별정보 처리 근거와 암호화 등 보호조치를 확인합니다.",
  },
  {
    label: "개인정보 보호법 제26조",
    title: "업무위탁에 따른 개인정보의 처리 제한",
    triggers: ["위탁", "수탁", "처리위탁", "재위탁", "계약", "관리감독"],
    default: true,
    rationale: "수탁자 고지, 위탁계약, 관리·감독 증거를 확인합니다.",
  },
  {
    label: "개인정보 보호법 제28조의8",
    title: "개인정보의 국외 이전",
    triggers: ["국외이전", "해외 이전", "국외 제공", "국외 보관", "해외", "클라우드"],
    rationale: "이전 국가, 이전받는 자, 이전 항목, 동의·고지 요건을 봅니다.",
  },
  {
    label: "개인정보 보호법 제29조",
    title: "안전조치의무",
    triggers: ["안전조치", "접근통제", "암호화", "접속기록", "해킹", "보안", "유출"],
    default: true,
    rationale: "접근통제, 암호화, 접속기록 보관·점검 등 보호조치를 확인합니다.",
  },
  {
    label: "개인정보 보호법 제34조",
    title: "개인정보 유출 등의 통지ㆍ신고",
    triggers: ["유출", "통지", "신고", "72시간", "침해", "누출"],
    default: true,
    rationale: "유출 인지 시점, 통지·신고 시점, 통지 항목을 확인합니다.",
  },
  {
    label: "개인정보 보호법 제34조의2",
    title: "노출된 개인정보의 삭제ㆍ차단",
    triggers: ["노출", "검색", "삭제", "차단", "게시", "공개"],
    rationale: "노출 정보의 삭제·차단 요청 및 후속 조치를 확인합니다.",
  },
  {
    label: "개인정보 보호법 제39조의15",
    title: "국내대리인의 지정",
    triggers: ["국외 사업자", "해외 사업자", "국내대리인", "대리인"],
    rationale: "국외 사업자의 국내대리인 지정 의무가 문제되는지 확인합니다.",
  },
];

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
  const issueTokens = findKeyTokens(requestText);
  const sourceText = text([
    requestText,
    similarAgendas.map((agenda) => [agenda.title, agenda.lawArticle, agenda.lawArticles, agenda.disposition, agenda.matchedTokens]),
  ]);
  const sourceCompact = compact(sourceText);
  const ranked = PRIVACY_LAW_ARTICLES.map((article, index) => {
    const triggerHits = article.triggers.filter((trigger) => sourceCompact.includes(compact(trigger))).length;
    const issueHits = issueTokens.filter((token) => article.triggers.some((trigger) => compact(trigger).includes(compact(token)) || compact(token).includes(compact(trigger)))).length;
    const directArticleHit = sourceCompact.includes(compact(article.label.replace("개인정보 보호법 ", ""))) ? 1 : 0;
    const score = triggerHits * 8 + issueHits * 6 + directArticleHit * 5;
    return {
      label: article.label,
      articleTitle: article.title,
      articleNo: article.label.replace("개인정보 보호법 ", ""),
      source: article.rationale,
      rationale: article.rationale,
      tone: "lavender",
      score,
      index,
    };
  })
    .filter((article) => article.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, 10);

  return uniqueByLabel(ranked);
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

function formatKrw(value) {
  const amount = number(value);
  if (amount <= 0) return "";
  if (amount >= 100000000) return `${(amount / 100000000).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}억 원`;
  if (amount >= 10000) return `${Math.round(amount / 10000).toLocaleString("ko-KR")}만 원`;
  return `${amount.toLocaleString("ko-KR")}원`;
}

function buildAmountEstimate(similarAgendas) {
  const evidence = similarAgendas
    .map((agenda) => ({
      title: agenda.title,
      disposition: agenda.disposition,
      amountTotalKrw: number(agenda.amountTotalKrw),
      amountText: agenda.amountText,
    }))
    .filter((agenda) => agenda.amountTotalKrw > 0 || agenda.amountText)
    .slice(0, 5);

  if (!evidence.length) {
    return {
      amountText: "—",
      basis: "금액 정보가 있는 유사 안건을 찾지 못했습니다. 실제 산정에는 관련 매출액, 위반 기간, 정보주체 수, 감경·가중 사유 자료가 필요합니다.",
      evidence: [],
    };
  }

  const numeric = evidence.map((item) => item.amountTotalKrw).filter((amount) => amount > 0).sort((a, b) => a - b);
  const min = numeric[0] || 0;
  const max = numeric[numeric.length - 1] || 0;
  const amountText = min && max && min !== max
    ? `${formatKrw(min)} ~ ${formatKrw(max)}`
    : formatKrw(max || min) || evidence[0].amountText || "유사 안건 금액 확인 필요";
  return {
    amountText,
    basis: `금액이 확인된 유사 안건 ${evidence.length}건의 과징금·과태료 범위를 참고했습니다. 이 값은 자동 추정치가 아니라 비교 기준이며, 최종 금액은 관련 매출액과 법정 산정 단계 검토가 필요합니다.`,
    evidence,
  };
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

function templateQuestion(templates = [], index = 0, variables = {}) {
  const selected = templates[Math.abs(index) % Math.max(templates.length, 1)] || "{focus} 쟁점을 어떻게 확인할 수 있습니까?";
  return selected.replace(/\{(\w+)\}/g, (_, key) => firstText(variables[key], `{${key}}`));
}

function hasFinalConsonant(value = "") {
  const chars = String(value || "").trim();
  const charCode = chars.charCodeAt(chars.length - 1) - 0xac00;
  return charCode >= 0 && charCode <= 11171 && charCode % 28 !== 0;
}

function objectLabel(value = "") {
  const label = firstText(value, "쟁점");
  return `${label}${hasFinalConsonant(label) ? "을" : "를"}`;
}

const COMMISSIONER_LENS_RULES = [
  {
    id: "technicalAudit",
    keywords: ["기술·보안", "접근", "접속", "로그", "SQL", "쿼리", "DB", "암호", "이상징후", "크리덴셜", "보안", "통제"],
    issueKeywords: ["안전조치", "접속기록", "유출", "API"],
    question: ({ focus, index }) => templateQuestion([
      "{focus} 쟁점에서 접근기록, 관리자 권한, 암호화·탐지 통제가 실제로 어떻게 작동했고 어느 단계에서 실패했는지 재현 가능하게 설명됩니까?",
      "{focus}와 관련해 비정상 접속이나 대량 처리 징후를 탐지할 기준이 있었고, 당시 로그 분석으로 놓친 신호가 무엇인지 확인됩니까?",
      "{focus} 문제의 발생 경로를 DB·쿼리·관리자 계정 단위로 나누면 누가 어떤 데이터에 접근했는지 기록으로 남아 있습니까?",
    ], index, { focus }),
    strategy: "로그 원본, 권한 부여 이력, 암호화키 관리, 이상징후 탐지 기준을 시간순으로 제시하고 기술적 실패 지점을 하나씩 대응합니다.",
  },
  {
    id: "dataGovernance",
    keywords: ["AI", "데이터", "가명", "모델", "국외", "목적", "활용", "자동화", "서비스 인증"],
    issueKeywords: ["AI", "국외이전", "제3자 제공", "동의", "정보주체"],
    question: ({ focus, index }) => templateQuestion([
      "이 안건의 개인정보 흐름이 당초 수집 목적 안에 머무는지, 아니면 {focus} 단계에서 별도 고지·동의나 추가 보호조치가 필요한 처리로 바뀌는지 특정돼 있습니까?",
      "AI 모델 학습이나 국외 처리 과정에서 {focus}가 정보주체가 예상할 수 있는 범위를 넘어서는지, 그 판단 기준이 안건에 드러나 있습니까?",
      "{focus} 관련 데이터가 어느 시스템에서 누구에게 이전되고 얼마 동안 보관되는지, 처리 흐름도가 사실관계와 일치합니까?",
    ], index, { focus }),
    strategy: "수집 목적, 실제 이용 목적, 제공·이전 경로, 고지·동의 문구를 분리해 처리 흐름이 어디에서 확장되는지 먼저 답합니다.",
  },
  {
    id: "responsibilityMap",
    keywords: ["사업자", "역할", "지위", "제3자", "위탁", "수탁", "계약", "책임", "관계", "처리 목적"],
    issueKeywords: ["위탁", "제3자 제공", "국외이전", "관련매출액", "API"],
    question: ({ focus, index }) => templateQuestion([
      "피심인과 관련 사업자 사이에서 누가 처리 목적과 수단을 결정했는지, {focusObject} 제3자 제공·위탁·공동처리 중 무엇으로 볼지 계약과 운영자료로 구분됩니까?",
      "{focus} 판단에서 명목상 계약 구조와 실제 데이터 운영 방식이 다를 가능성은 없고, 책임 주체가 자료상 특정되어 있습니까?",
      "수령자나 수탁자가 {focus} 데이터를 독자 목적으로 활용했는지 여부를 어떻게 확인했고, 그 결론이 주문 문구와 맞습니까?",
    ], index, { focus, focusObject: objectLabel(focus) }),
    strategy: "계약 조항, 실제 지시·감독 구조, 데이터 수령자의 독자 이용 여부를 나눠 법적 지위 판단의 근거를 제시합니다.",
  },
  {
    id: "remediation",
    keywords: ["개선", "재발", "예방", "권고", "시정", "이행", "가이드라인", "보도자료", "주의"],
    issueKeywords: ["시정명령", "파기", "유출 통지", "안전조치", "공표명령"],
    question: ({ focus, index }) => templateQuestion([
      "{focus} 관련 조치가 선언에 그치지 않고 실제 이행될 수 있도록 일정, 책임 주체, 검증 지표까지 안건에 반영되어 있습니까?",
      "{focus} 개선권고나 시정명령이 현장에서 작동하도록 피심인이 무엇을 바꾸고, 위원회가 어떤 자료로 이행을 확인합니까?",
      "정보주체나 이용사업자가 {focus} 문제를 다시 겪지 않도록 안내·가이드·사후점검 계획이 충분히 구체화되어 있습니까?",
    ], index, { focus }),
    strategy: "주문 문구와 별지 조치사항을 이행 주체·기한·증빙자료 단위로 풀어, 사후 점검에서 확인할 수 있는 형태로 답합니다.",
  },
  {
    id: "penaltyCalibration",
    keywords: ["과징금", "과태료", "처분", "제재", "감경", "가중", "예산", "비용", "매출", "산정", "수위"],
    issueKeywords: ["과징금", "과태료", "처분", "공표명령", "시정명령", "관련매출액"],
    question: ({ focus, index }) => templateQuestion([
      "{focus} 위반에 대해 관련 매출액, 위반기간, 고의·중과실 여부, 감경·가중 사유가 각각 처분 수위에 어떻게 반영됐습니까?",
      "{focus} 사안에서 유사 안건보다 처분이 강하거나 약해지는 이유가 무엇이고, 그 차이를 숫자와 사유로 설명할 수 있습니까?",
      "피심인의 보안 투자, 예산 제약, 사후 조치가 {focus} 처분 산정에서 감경 사유로 고려될 수 있는지 검토됐습니까?",
    ], index, { focus }),
    strategy: "산정 단계별 숫자와 감경·가중 사유를 표로 제시하고, 유사 안건 대비 처분 형평성이 달라지는 이유를 함께 설명합니다.",
  },
  {
    id: "subjectHarm",
    keywords: ["정보주체", "이용자", "피해", "통지", "권리", "2차", "소비자", "탈퇴", "파기"],
    issueKeywords: ["정보주체", "유출", "유출 통지", "파기", "동의"],
    question: ({ focus, index }) => templateQuestion([
      "{focus}로 정보주체에게 발생한 직접 피해와 2차 피해 가능성을 어떻게 산정했고, 통지·권리구제 조치는 충분히 마련되어 있습니까?",
      "이용자가 {focus} 상황을 실제로 인지하고 선택권을 행사할 수 있었는지, 고지 화면과 사후 안내 자료로 확인됩니까?",
      "{focus} 때문에 남아 있는 정보가 계속 처리되거나 추가 피해로 이어질 가능성은 없고, 차단 조치가 끝까지 추적됩니까?",
    ], index, { focus }),
    strategy: "영향받는 정보주체 범위, 통지 대상·시점, 추가 피해 차단 조치, 권리행사 안내를 한 흐름으로 정리해 답합니다.",
  },
  {
    id: "legalEvidence",
    keywords: ["절차", "법리", "근거", "사실", "증거", "자료", "조항", "사례", "비조치", "해석"],
    issueKeywords: [],
    question: ({ focus, index }) => templateQuestion([
      "{focus} 쟁점에서 적용 조항의 요건과 인정 사실이 정확히 대응되고, 피심인의 반대 논리를 배척할 증거가 충분합니까?",
      "{focusObject} 이 조항으로 판단하는 것이 기존 해석이나 유사 안건과 충돌하지 않는지, 차이가 있다면 무엇으로 설명됩니까?",
      "안건서의 사실인정, 법리 판단, 주문 문구가 {focus}에 대해 같은 결론을 가리키는지 문장 단위로 정합성이 확인됩니까?",
    ], index, { focus, focusObject: objectLabel(focus) }),
    strategy: "조항 요건, 인정 사실, 증거 위치, 피심인 주장과 배척 사유를 같은 순서로 맞춰 답변합니다.",
  },
];

const COMMISSIONER_LENS_HINTS = {
  김일환: "dataGovernance",
  김진욱: "responsibilityMap",
  김진환: "technicalAudit",
  김휘강: "technicalAudit",
  박상희: "legalEvidence",
  윤영미: "subjectHarm",
  이문한: "penaltyCalibration",
};

function commissionerTagLabels(commissioner = {}) {
  if (Array.isArray(commissioner.topTagDetails) && commissioner.topTagDetails.length) {
    return commissioner.topTagDetails
      .map((tag) => firstText(tag.label, tag.tag, tag.name))
      .filter(Boolean);
  }
  if (Array.isArray(commissioner.topTags)) return commissioner.topTags.map(text).filter(Boolean);
  return [];
}

function scoreLens(rule, commissioner = {}, requestText = "") {
  const tags = commissionerTagLabels(commissioner);
  const source = compact([
    tags,
    commissioner.representativeQuestion,
    commissioner.representativeQuestionOriginal,
    commissioner.questionStyle,
    commissioner.meetingRole,
    commissioner.characterType,
  ]);
  const request = compact(requestText);
  const sourceHits = rule.keywords.filter((keyword) => source.includes(compact(keyword))).length;
  const requestHits = rule.issueKeywords.filter((keyword) => request.includes(compact(keyword))).length;
  const tagBonus = tags.slice(0, 3).some((tag) => rule.keywords.some((keyword) => compact(tag).includes(compact(keyword)))) ? 4 : 0;
  const sourceWeight = rule.id === "legalEvidence" ? 4 : 9;
  return sourceHits * sourceWeight + requestHits * 3 + tagBonus;
}

function chooseCommissionerLens(commissioner = {}, requestText = "") {
  const hinted = COMMISSIONER_LENS_HINTS[firstText(commissioner.name, commissioner.commissionerName)];
  const ranked = COMMISSIONER_LENS_RULES
    .map((rule, index) => ({
      rule,
      index,
      score: scoreLens(rule, commissioner, requestText) + (rule.id === hinted ? 50 : 0),
    }))
    .sort((left, right) => right.score - left.score || left.index - right.index);
  if (ranked[0]?.score > 0) return ranked[0].rule;
  return COMMISSIONER_LENS_RULES.find((rule) => rule.id === hinted) || COMMISSIONER_LENS_RULES.at(-1);
}

function chooseIssueForLens(issues = [], lens = {}, index = 0) {
  if (!issues.length) return { label: "핵심 쟁점" };
  const matched = issues.find((issue) => lens.issueKeywords?.some((keyword) => compact(issue.label || issue.token).includes(compact(keyword))));
  return matched || issues[index % issues.length] || issues[0];
}

function patternEvidenceForCommissioner(commissioner = {}, lens = {}) {
  const tags = commissionerTagLabels(commissioner).slice(0, 3).join(", ");
  const representativeQuestion = firstText(commissioner.representativeQuestion);
  return [
    lens.id ? `질문 렌즈: ${lens.id}` : "",
    tags ? `속기록 태그: ${tags}` : "",
    representativeQuestion ? `대표질문: ${representativeQuestion}` : "",
  ].filter(Boolean).join(" · ");
}

function inferQuestionForCommissioner(commissioner = {}, issues = [], index = 0, requestText = "") {
  const name = firstText(commissioner.name, commissioner.commissionerName) || "위원";
  const role = firstText(commissioner.role, commissioner.roleTone, "위원");
  const lens = chooseCommissionerLens(commissioner, requestText);
  const issue = chooseIssueForLens(issues, lens, index);
  const focus = firstText(issue.label, commissionerTagLabels(commissioner)[0], "핵심 쟁점");
  const question = lens.question({ focus, issue, commissioner, index });
  const responseStrategy = lens.strategy;
  return {
    commissionerName: name,
    role,
    category: focus,
    tag: commissionerTagLabels(commissioner)[0] || focus,
    question,
    responseStrategy,
    patternEvidence: patternEvidenceForCommissioner(commissioner, lens),
    tone: "blue",
  };
}

function buildCommissionerQuestions({ currentSecondCommissioners = [], requestText = "" } = {}) {
  const issues = buildExpectedIssues(requestText);
  const commissionerQuestions = Array.isArray(currentSecondCommissioners)
    ? currentSecondCommissioners
      .filter(isRecord)
      .filter((commissioner) => !/위원장|부위원장/.test(firstText(commissioner.role, commissioner.roleTone)))
      .map((commissioner, index) => inferQuestionForCommissioner(commissioner, issues, index, requestText))
    : [];

  return commissionerQuestions
    .filter((item, index, rows) => item?.question && rows.findIndex((row) => row?.question === item.question) === index)
    .slice(0, 10);
}

function buildChecklist() {
  return [
    {
      label: "계약서, 전문, 부속합의서 등 처리 관계를 입증할 문서가 준비되었는가?",
      detail: "위탁·제공·공동처리 판단의 전제가 되는 자료입니다.",
      tone: "slate",
    },
    {
      label: "로그, 보고서, 통지 내역 등 사실관계 증빙이 충분한가?",
      detail: "위원 질의에 바로 답할 수 있도록 원자료 위치를 연결합니다.",
      tone: "lavender",
    },
    {
      label: "AI 모델, 자동화 처리, 외부 평가 여부가 문서화되어 있는가?",
      detail: "AI 또는 자동화 처리 사안이면 투명성·목적 외 이용 쟁점을 함께 봅니다.",
      tone: "coral",
    },
    {
      label: "정보주체 피해 규모와 2차 피해 가능성을 확인했는가?",
      detail: "유출·침해 사안은 대상자 수, 항목, 후속 피해를 분리해 정리합니다.",
      tone: "blue",
    },
    {
      label: "관련 매출액 또는 과징금 산정 자료가 확보되었는가?",
      detail: "재무제표, 서비스별 매출, 제외 사유를 같은 묶음으로 준비합니다.",
      tone: "coral",
    },
    {
      label: "유사 안건과 다른 점을 설명할 비교표가 있는가?",
      detail: "처분 수위와 주문 문구를 비교하기 쉽게 정리합니다.",
      tone: "slate",
    },
    {
      label: "피심인의 개선 조치와 이행 증거가 확인되었는가?",
      detail: "시정명령 필요성, 이행기한, 공표 여부를 판단하는 근거입니다.",
      tone: "lavender",
    },
    {
      label: "회의 당일 예상 질문에 대한 1문장 답변을 준비했는가?",
      detail: "법적 근거, 사실관계, 처분 수위 답변을 짧게 연결합니다.",
      tone: "coral",
    },
  ];
}

export function buildAgendaPreparationResult(input = {}) {
  if (!isRecord(input)) input = {};

  const title = text(input.title);
  const target = text(input.target);
  const summary = text(input.summary);
  const requestText = text([title, target, summary]);
  const similarAgendas = buildSimilarAgendas(input.historicalAgendas, requestText);

  return {
    title,
    target,
    summary,
    similarAgendas,
    expectedIssues: buildExpectedIssues(requestText),
    similarProvisions: buildSimilarProvisions(similarAgendas, requestText),
    dispositionLevels: buildDispositionLevels(similarAgendas),
    amountEstimate: buildAmountEstimate(similarAgendas),
    commissionerQuestions: buildCommissionerQuestions({
      currentSecondCommissioners: input.currentSecondCommissioners,
      requestText,
    }),
    checklist: buildChecklist(),
  };
}
