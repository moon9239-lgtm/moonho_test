const KNOWN_LAWS = ["개인정보 보호법", "개인정보 보호법 시행령"];

export function extractLawReferences(text) {
  const source = String(text || "");
  const refs = [];
  let currentLaw = "";
  const pattern = /(개인정보 보호법 시행령|개인정보 보호법|같은 법)\s*(제\d+조(?:의\d+)?(?:\s*제\d+항)?)/g;
  let match;

  while ((match = pattern.exec(source))) {
    const rawLaw = match[1];
    if (KNOWN_LAWS.includes(rawLaw)) currentLaw = rawLaw;
    const lawName = rawLaw === "같은 법" ? currentLaw : rawLaw;
    if (!lawName) continue;
    refs.push({
      lawName,
      article: match[2].replace(/\s+/g, " ").trim(),
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
