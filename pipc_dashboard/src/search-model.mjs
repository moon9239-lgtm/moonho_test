function normalizeSearch(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function compact(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function uniqueSorted(values = []) {
  return [...new Set(values.map(compact).filter(Boolean))]
    .sort((left, right) => left.localeCompare(right, "ko"));
}

function rowFacetText(row, facet) {
  if (facet === "target") return (row.targets || []).join(" ");
  if (facet === "law") return (row.lawArticles || []).join(" ");
  if (facet === "issue") return (row.issueTags || []).join(" ");
  if (facet === "disposition") return (row.dispositions || []).join(" ");
  return [
    row.title,
    row.meetingLabel,
    row.date,
    row.type,
    (row.targets || []).join(" "),
    (row.lawArticles || []).join(" "),
    (row.issueTags || []).join(" "),
    (row.dispositions || []).join(" "),
    row.amountText,
    (row.caseIds || []).join(" "),
    row.snippet,
    row.searchText,
  ].join(" ");
}

function scoreSearchRow(row, query, facet) {
  if (!query) return 2;
  const haystack = normalizeSearch(rowFacetText(row, facet));
  const tokens = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return 2;
  let score = 0;
  for (const token of tokens) {
    if (haystack.includes(token)) score += 2;
    if ((row.title || "").toLowerCase().includes(token)) score += 2;
    if ((row.targets || []).some((item) => item.toLowerCase().includes(token))) score += 3;
    if ((row.lawArticles || []).some((item) => item.toLowerCase().includes(token))) score += 3;
    if ((row.issueTags || []).some((item) => item.toLowerCase().includes(token))) score += 3;
    if ((row.dispositions || []).some((item) => item.toLowerCase().includes(token))) score += 3;
  }
  return score;
}

function matchesFilter(row, field, selected) {
  if (!selected) return true;
  return (row[field] || []).includes(selected);
}

export function buildSearchModel(meetingAnalysisIndex = {}, filters = {}) {
  const query = String(filters.query || "").trim();
  const allowedFacets = new Set(["all", "target", "law", "issue", "disposition"]);
  const facet = allowedFacets.has(filters.facet) ? filters.facet : "all";
  const issue = compact(filters.issue);
  const disposition = compact(filters.disposition);
  const allRows = Array.isArray(meetingAnalysisIndex.searchIndex) ? meetingAnalysisIndex.searchIndex : [];
  const searchableRows = allRows.filter((row) => !row.isProcedural);
  const scored = searchableRows
    .filter((row) => matchesFilter(row, "issueTags", issue))
    .filter((row) => matchesFilter(row, "dispositions", disposition))
    .map((row, index) => ({ row, index, score: scoreSearchRow(row, query, facet) }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || String(right.row.date || "").localeCompare(String(left.row.date || "")) || left.index - right.index);

  return {
    rows: scored.slice(0, 80).map((item) => item.row),
    totalCount: allRows.length,
    visibleCount: scored.length,
    filters: { query, facet, issue, disposition },
    filterOptions: {
      issues: uniqueSorted(searchableRows.flatMap((row) => row.issueTags || [])),
      dispositions: uniqueSorted(searchableRows.flatMap((row) => row.dispositions || [])),
    },
    globalStats: meetingAnalysisIndex.globalStats || {},
  };
}
