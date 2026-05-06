const KNOWN_LAWS = [
  "개인정보 보호법",
  "개인정보 보호법 시행령",
  "신용정보의 이용 및 보호에 관한 법률",
  "신용정보의 이용 및 보호에 관한 법률 시행령",
  "개인정보 보호위원회 운영규칙",
  "국가연구개발혁신법",
  "국가연구개발혁신법 시행령",
  "개인정보의 안전성 확보조치 기준",
];

const LAW_ALIASES = new Map([
  ["보호법", "개인정보 보호법"],
  ["개인정보보호법", "개인정보 보호법"],
  ["개인정보보호법시행령", "개인정보 보호법 시행령"],
  ["신용정보법", "신용정보의 이용 및 보호에 관한 법률"],
  ["신용정보의이용및보호에관한법률", "신용정보의 이용 및 보호에 관한 법률"],
  ["신용정보법시행령", "신용정보의 이용 및 보호에 관한 법률 시행령"],
  ["신용정보의이용및보호에관한법률시행령", "신용정보의 이용 및 보호에 관한 법률 시행령"],
  ["개인정보보호위원회운영규칙", "개인정보 보호위원회 운영규칙"],
  ["위원회운영규칙", "개인정보 보호위원회 운영규칙"],
  ["운영규칙", "개인정보 보호위원회 운영규칙"],
  ["국가연구개발혁신법", "국가연구개발혁신법"],
  ["국가연구개발혁신법시행령", "국가연구개발혁신법 시행령"],
  ["연구개발혁신법", "국가연구개발혁신법"],
  ["연구개발혁신법시행령", "국가연구개발혁신법 시행령"],
  ["개인정보의안전성확보조치기준", "개인정보의 안전성 확보조치 기준"],
  ["개인정보의안전성확보조치기준고시", "개인정보의 안전성 확보조치 기준"],
  ["개인정보안전성확보조치기준", "개인정보의 안전성 확보조치 기준"],
  ["개인정보안전성확보조치기준고시", "개인정보의 안전성 확보조치 기준"],
  ["안전성확보조치기준", "개인정보의 안전성 확보조치 기준"],
  ["안전성확보조치기준고시", "개인정보의 안전성 확보조치 기준"],
]);

const LAW_NAME_PATTERN = [
  "개인정보\\s*보호위원회\\s*운영규칙",
  "위원회\\s*운영규칙",
  "운영규칙",
  "개인정보의\\s*안전성\\s*확보조치\\s*기준(?:\\s*고시)?",
  "개인정보\\s*안전성\\s*확보조치\\s*기준(?:\\s*고시)?",
  "안전성\\s*확보조치\\s*기준(?:\\s*고시)?",
  "국가연구개발혁신법\\s*시행령",
  "국가\\s*연구개발\\s*혁신법\\s*시행령",
  "연구개발혁신법\\s*시행령",
  "국가연구개발혁신법",
  "국가\\s*연구개발\\s*혁신법",
  "연구개발혁신법",
  "개인정보\\s*보호법\\s*시행령",
  "개인정보보호법\\s*시행령",
  "개인정보\\s*보호법",
  "개인정보보호법",
  "신용정보의\\s*이용\\s*및\\s*보호에\\s*관한\\s*법률\\s*시행령",
  "신용정보의\\s*이용\\s*및\\s*보호에\\s*관한\\s*법률",
  "신용정보법\\s*시행령",
  "신용정보법",
  "보호법",
  "같은\\s*법\\s*시행령",
  "같은\\s*법",
  "시행령",
].join("|");

const ARTICLE_PATTERN = "제\\s*\\d+\\s*조(?:\\s*의\\s*\\d+)?(?:\\s*제\\s*\\d+\\s*항)?(?:\\s*제\\s*\\d+\\s*호)?";

function normalizeLawName(value, currentLaw = "") {
  const compact = String(value || "").replace(/\s+/g, "");
  if (!compact) return currentLaw || "";
  if (compact === "같은법") return currentLaw || "";
  if (compact === "시행령" || compact === "같은법시행령") {
    if (currentLaw === "신용정보의 이용 및 보호에 관한 법률") return "신용정보의 이용 및 보호에 관한 법률 시행령";
    if (currentLaw === "신용정보의 이용 및 보호에 관한 법률 시행령") return currentLaw;
    if (currentLaw === "국가연구개발혁신법") return "국가연구개발혁신법 시행령";
    if (currentLaw === "국가연구개발혁신법 시행령") return currentLaw;
    if (currentLaw === "개인정보 보호법") return "개인정보 보호법 시행령";
    if (currentLaw === "개인정보 보호법 시행령") return currentLaw;
    return "";
  }
  return LAW_ALIASES.get(compact) || value.replace(/\s+/g, " ").trim();
}

function normalizeArticle(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace(/제(\d+)조의(\d+)/g, "제$1조의$2")
    .replace(/제(\d+)조/g, "제$1조")
    .replace(/제(\d+)항/g, " 제$1항")
    .replace(/제(\d+)호/g, " 제$1호")
    .trim();
}

export function extractLawReferences(text) {
  const source = String(text || "");
  const refs = [];
  let currentLaw = "";
  const pattern = new RegExp(`(?:(${LAW_NAME_PATTERN})\\s*)?(${ARTICLE_PATTERN})`, "g");
  let match;

  while ((match = pattern.exec(source))) {
    const rawLaw = match[1] || "";
    const lawName = normalizeLawName(rawLaw, currentLaw);
    if (KNOWN_LAWS.includes(lawName)) currentLaw = lawName;
    if (!lawName) continue;
    refs.push({
      lawName,
      article: normalizeArticle(match[2]),
      index: match.index,
      text: match[0],
    });
  }

  return refs;
}

export function buildLawLookupRequest({ lawName, article, meetingDate }) {
  return {
    lawName,
    article,
    versions: [
      { label: "회의 당시", effectiveDate: meetingDate },
      { label: "현재", effectiveDate: "current" },
    ],
  };
}
