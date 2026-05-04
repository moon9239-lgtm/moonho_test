const KNOWN_LAWS = ["개인정보 보호법", "개인정보 보호법 시행령"];

function normalizeLawName(value, currentLaw = "") {
  const compact = String(value || "").replace(/\s+/g, "");
  if (!compact) return currentLaw || "개인정보 보호법";
  if (compact === "같은법") return currentLaw || "";
  if (compact === "보호법" || compact === "개인정보보호법") return "개인정보 보호법";
  if (compact === "시행령" || compact === "같은법시행령" || compact === "개인정보보호법시행령") return "개인정보 보호법 시행령";
  if (compact === "개인정보보호법") return "개인정보 보호법";
  return value.replace(/\s+/g, " ").trim();
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
  const pattern = /(?:(개인정보\s*보호법\s*시행령|개인정보보호법\s*시행령|개인정보\s*보호법|개인정보보호법|보호법|같은\s*법\s*시행령|같은\s*법|시행령)\s*)?(제\s*\d+\s*조(?:\s*의\s*\d+)?(?:\s*제\s*\d+\s*항)?(?:\s*제\s*\d+\s*호)?)/g;
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
