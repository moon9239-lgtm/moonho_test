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

export function normalizeCommissionerCharacters(value) {
  if (Array.isArray(value)) return value.filter((item) => item && item.name);
  if (Array.isArray(value?.characters)) return value.characters.filter((item) => item && item.name);
  return [];
}

export function buildCommissionerAnalysisModel(data = {}) {
  if (!isRecord(data)) data = {};
  const charactersByName = new Map(normalizeCommissionerCharacters(data.commissionerCharacters).map((item) => [item.name, item]));
  const activityRows = Array.isArray(data.commissionerActivity) ? data.commissionerActivity.filter(isRecord) : [];
  const commissioners = activityRows.map((activity) => {
    const name = activity.commissioner_name || activity.name || "";
    const character = charactersByName.get(name) || {};
    const characterTags = normalizeTags(character.top_tags);
    return {
      name,
      totalUtterances: number(activity.total_utterances),
      questionCount: optionalNumber(activity, "question_count"),
      agendaCount: optionalNumber(activity, "agenda_count"),
      meetingCount: optionalNumber(activity, "meeting_count"),
      characterType: character.character_type || "분석 대기",
      topTags: characterTags.length ? characterTags : normalizeTags(activity.top_tags),
      evidenceLinks: [],
    };
  });

  return { commissioners };
}
