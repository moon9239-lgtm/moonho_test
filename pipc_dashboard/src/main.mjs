import { buildMeetingDetailModel, buildSituationBoardModel } from "./data-model.mjs";
import { buildAnimationTimeline } from "./animation-model.mjs";
import { buildAgendaPreparationResult } from "./agenda-assistant-model.mjs";
import { loadCommissionerCharacters } from "./character-assets.mjs";
import { buildCommissionerAnalysisModel } from "./commissioner-model.mjs";
import {
  renderAgendaAssistant,
  renderAgendaPreparationResult,
  renderAnimationViewer,
  renderCommissionerAnalysis,
  renderIntegratedSearch,
  renderLawReferenceDetail,
  renderMeetingDetail,
  renderSituationBoard,
} from "./renderers.mjs";

const dashboardData = window.PIPC_DASHBOARD_DATA || {};
const meetingAnalysisIndex = window.PIPC_MEETING_ANALYSIS_INDEX || window.PIPC_MEETING_DETAIL_INDEX || {};
const meetingDetailIndex = meetingAnalysisIndex;
let activeMeetingId = null;
let activeMeetingDetail = null;
let activeAnimationTimeline = null;
let activeSceneIndex = 0;
let animationTimer = null;

const tabTitles = {
  stats: "전체회의 통계·동향 대시보드",
  search: "안건 통합검색",
  meeting: "회의 상세 탐색",
  commissioner: "위원별 분석",
  assistant: "신규 안건 준비 도우미",
};

function $(selector, root = document) {
  return root.querySelector(selector);
}

function setSnapshotTime(value) {
  const target = $("#snapshot-time");
  if (!target) return;
  if (!value) {
    target.textContent = "업데이트 기준 확인 필요";
    return;
  }
  const date = new Date(value);
  target.textContent = Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function init() {
  const model = buildSituationBoardModel(dashboardData, meetingAnalysisIndex);
  setSnapshotTime(model.updatedAt);
  const stats = $("#tab-stats");
  if (stats) stats.innerHTML = renderSituationBoard(model);
  renderSearchTab();
  renderAssistantTab();
  initTabs();
}

init();

function renderAssistantTab() {
  const assistantTab = $("#tab-assistant");
  if (assistantTab) assistantTab.innerHTML = renderAgendaAssistant();
}

function renderSearchTab(filters = {}) {
  const searchTab = $("#tab-search");
  if (!searchTab) return;
  searchTab.innerHTML = renderIntegratedSearch(buildSearchModel(filters));
}

function isRecord(value) {
  return value && typeof value === "object";
}

function articleLabel(article) {
  if (!isRecord(article)) return "";
  return [article.law_name, article.article_no, article.article_title ? `(${article.article_title})` : ""].filter(Boolean).join(" ");
}

function penaltyLabel(item = {}) {
  const breakdown = Array.isArray(item.penalty_breakdown) ? item.penalty_breakdown.filter(isRecord) : [];
  if (breakdown.length) {
    return breakdown.map((penalty) => [penalty.penalty_kind, penalty.amount_text].filter(Boolean).join(" ")).filter(Boolean).join(" · ");
  }
  return item.sanction_type || "";
}

function buildHistoricalAgendas(data = {}) {
  const rows = Array.isArray(data.majorPenaltyCases) ? data.majorPenaltyCases : [];
  return rows.filter(isRecord).map((item) => {
    const amount = Number(item.amount_total_krw || item.monetary_penalty_amount_total_krw || 0);
    const lawArticles = Array.isArray(item.articles) ? item.articles.map(articleLabel).filter(Boolean) : [];
    const penaltyBreakdown = Array.isArray(item.penalty_breakdown) ? item.penalty_breakdown.filter(isRecord) : [];
    return {
      title: item.agenda_title || item.case_title || item.title || item.target_name || item.top_target_name || "과거 안건",
      keywords: [
        item.target_name,
        item.top_target_name,
        item.law_article,
        item.primary_law_article,
        ...lawArticles,
        item.sanction_type,
        item.decision_type,
        ...penaltyBreakdown.map((penalty) => penalty.penalty_kind),
      ].filter(Boolean),
      lawArticles: lawArticles.length ? lawArticles : [item.law_article || item.primary_law_article].filter(Boolean),
      disposition: penaltyLabel(item) || (amount > 0 ? "과징금·과태료" : ""),
      amountTotalKrw: amount,
      amountText: amount > 0 ? `${new Intl.NumberFormat("ko-KR").format(amount)}원` : "",
    };
  });
}

function normalizeSearch(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function rowFacetText(row, facet) {
  if (facet === "target") return (row.targets || []).join(" ");
  if (facet === "law") return (row.lawArticles || []).join(" ");
  if (facet === "speaker") return (row.speakers || []).join(" ");
  if (facet === "keyword") return (row.keywords || []).join(" ");
  return [
    row.title,
    row.meetingLabel,
    row.date,
    row.type,
    (row.targets || []).join(" "),
    (row.lawArticles || []).join(" "),
    (row.speakers || []).join(" "),
    (row.keywords || []).join(" "),
    row.snippet,
    row.searchText,
  ].join(" ");
}

function scoreSearchRow(row, query, facet) {
  if (!query) return row.isProcedural ? 1 : 2;
  const haystack = normalizeSearch(rowFacetText(row, facet));
  const tokens = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return row.isProcedural ? 1 : 2;
  let score = 0;
  for (const token of tokens) {
    if (haystack.includes(token)) score += 2;
    if ((row.title || "").toLowerCase().includes(token)) score += 2;
    if ((row.targets || []).some((item) => item.toLowerCase().includes(token))) score += 3;
    if ((row.lawArticles || []).some((item) => item.toLowerCase().includes(token))) score += 3;
    if ((row.speakers || []).some((item) => item.toLowerCase().includes(token))) score += 2;
  }
  return score;
}

function buildSearchModel(filters = {}) {
  const query = String(filters.query || "").trim();
  const facet = filters.facet || "all";
  const includeProcedural = Boolean(filters.includeProcedural);
  const allRows = Array.isArray(meetingAnalysisIndex.searchIndex) ? meetingAnalysisIndex.searchIndex : [];
  const scored = allRows
    .map((row, index) => ({ row, index, score: scoreSearchRow(row, query, facet) }))
    .filter((item) => item.score > 0)
    .filter((item) => includeProcedural || !item.row.isProcedural || query)
    .sort((left, right) => right.score - left.score || String(right.row.date || "").localeCompare(String(left.row.date || "")) || left.index - right.index);

  return {
    rows: scored.slice(0, 80).map((item) => item.row),
    totalCount: allRows.length,
    visibleCount: scored.length,
    filters: { query, facet, includeProcedural },
    globalStats: meetingAnalysisIndex.globalStats || {},
  };
}

function setActiveTab(tabId) {
  const tab = $(`#tab-${tabId}`);
  const navItem = $(`.nav-item[data-tab="${tabId}"]`);
  if (!tab || !navItem) return;

  document.querySelector(".tab-view.active")?.classList.remove("active");
  tab.classList.add("active");
  document.querySelector(".nav-item.active")?.classList.remove("active");
  navItem.classList.add("active");
  const title = $("#page-title");
  if (title) title.textContent = tabTitles[tabId] || tabTitles.stats;
  history.replaceState(null, "", `#${tabId}`);
}

function initTabs() {
  document.querySelectorAll(".nav-item[data-tab]").forEach((button) => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tab));
  });

  const requestedTab = window.location.hash.replace("#", "");
  if (tabTitles[requestedTab]) setActiveTab(requestedTab);
}

async function renderCommissionerTab(dashboardData) {
  const commissionerTab = $("#tab-commissioner");
  if (!commissionerTab) return;

  const commissionerCharacters = await loadCommissionerCharacters();
  const commissionerModel = buildCommissionerAnalysisModel({
    commissionerActivity: dashboardData.commissionerActivity || [],
    commissionerCharacters,
  });
  commissionerTab.innerHTML = renderCommissionerAnalysis(commissionerModel);
}

renderCommissionerTab(dashboardData);

function transcriptToUtterances(text) {
  return String(text || "")
    .split(/\n+/)
    .map((line, index) => ({ id: `u${index + 1}`, speaker: "속기록", text: line.trim() }))
    .filter((item) => item.text);
}

function showMeetingDetail(id) {
  activeMeetingId = id;
  const detail = buildMeetingDetailModel(dashboardData, id, { detailIndex: meetingDetailIndex });
  activeMeetingDetail = detail;
  const meetingTab = $("#tab-meeting");
  if (!meetingTab) return;
  meetingTab.innerHTML = renderMeetingDetail(detail);
  setActiveTab("meeting");
}

function showAnimationViewer(id, initialUtteranceId = "") {
  const detail = buildMeetingDetailModel(dashboardData, id, { detailIndex: meetingDetailIndex });
  if (!detail.meeting) return;
  activeMeetingId = id;
  activeMeetingDetail = detail;
  const meetingTab = $("#tab-meeting");
  if (!meetingTab) return;
  const timeline = detail.animationTimeline || (detail.animationScenes?.length
    ? { meetingId: detail.meeting.id, meetingLabel: detail.meeting.meetingLabel, scenes: detail.animationScenes }
    : buildAnimationTimeline({
      meeting: detail.meeting,
      utterances: transcriptToUtterances(detail.transcriptText),
    }));
  activeAnimationTimeline = timeline;
  meetingTab.innerHTML = renderAnimationViewer(timeline);
  setActiveTab("meeting");
  const initialIndex = initialUtteranceId
    ? timeline.scenes?.findIndex((scene) => scene.utteranceId === initialUtteranceId)
    : 0;
  setAnimationScene(Math.max(initialIndex || 0, 0));
}

function scrollToUtterance(id) {
  const target = id ? document.getElementById(id) : null;
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  target.classList.add("focus-flash");
  window.setTimeout(() => target.classList.remove("focus-flash"), 1000);
}

function updateLawDetail(index) {
  const panel = $("#law-detail-panel");
  const ref = activeMeetingDetail?.lawReferences?.[Number(index)];
  if (!panel || !ref) return;
  panel.innerHTML = renderLawReferenceDetail(ref);
}

function sceneText(scene = {}) {
  const utterance = activeMeetingDetail?.utterances?.find((item) => item.id === scene.utteranceId);
  return utterance?.text || scene.text || scene.shortText || "";
}

function setAnimationScene(index) {
  const scenes = Array.isArray(activeAnimationTimeline?.scenes) ? activeAnimationTimeline.scenes : [];
  if (!scenes.length) return;
  activeSceneIndex = Math.max(0, Math.min(index, scenes.length - 1));
  const button = $(`.animation-scene-item[data-scene-index="${activeSceneIndex}"]`);
  const stage = $("[data-animation-stage]");
  const scene = scenes[activeSceneIndex];
  if (!stage || !scene) return;
  const label = $("[data-stage-label]", stage);
  const speaker = $("[data-stage-speaker]", stage);
  const text = $("[data-stage-text]", stage);
  document.querySelector(".animation-scene-item.active")?.classList.remove("active");
  button?.classList.add("active");
  if (label) label.textContent = scene.stageNote || scene.phase || "";
  if (speaker) speaker.textContent = scene.speaker || scene.speakerName || "";
  if (text) text.textContent = sceneText(scene);
  document.querySelectorAll(".animation-actor.speaking").forEach((node) => node.classList.remove("speaking"));
  if (scene.memberId) {
    document.querySelector(`.animation-actor[data-member-id="${CSS.escape(scene.memberId)}"]`)?.classList.add("speaking");
  }
  button?.scrollIntoView({ block: "nearest" });
}

function updateAnimationStage(button) {
  if (!button) return;
  setAnimationScene(Number(button.dataset.sceneIndex || 0));
}

function stopAnimationPlayback() {
  if (!animationTimer) return;
  window.clearInterval(animationTimer);
  animationTimer = null;
  const playButton = $('[data-animation-action="play"]');
  if (playButton) playButton.textContent = "재생";
}

function startAnimationPlayback() {
  stopAnimationPlayback();
  const playButton = $('[data-animation-action="play"]');
  if (playButton) playButton.textContent = "일시정지";
  animationTimer = window.setInterval(() => {
    const scenes = activeAnimationTimeline?.scenes || [];
    if (activeSceneIndex >= scenes.length - 1) {
      stopAnimationPlayback();
      return;
    }
    setAnimationScene(activeSceneIndex + 1);
  }, 1800);
}

function handleAnimationAction(action) {
  if (action === "prev") {
    stopAnimationPlayback();
    setAnimationScene(activeSceneIndex - 1);
  }
  if (action === "next") {
    stopAnimationPlayback();
    setAnimationScene(activeSceneIndex + 1);
  }
  if (action === "play") {
    if (animationTimer) stopAnimationPlayback();
    else startAnimationPlayback();
  }
}

document.addEventListener("click", (event) => {
  const card = event.target.closest(".meeting-card[data-meeting-id]");
  if (card) showMeetingDetail(card.dataset.meetingId);

  const animationButton = event.target.closest("[data-animation-meeting-id]");
  if (animationButton) showAnimationViewer(animationButton.dataset.animationMeetingId, animationButton.dataset.animationUtteranceId || "");

  const closeAnimationButton = event.target.closest("[data-close-animation]");
  if (closeAnimationButton && activeMeetingId) {
    stopAnimationPlayback();
    showMeetingDetail(activeMeetingId);
  }

  const agendaJump = event.target.closest("[data-utterance-target]");
  if (agendaJump) scrollToUtterance(agendaJump.dataset.utteranceTarget);

  const lawReference = event.target.closest("[data-law-ref-index]");
  if (lawReference) updateLawDetail(lawReference.dataset.lawRefIndex);

  const scene = event.target.closest(".animation-scene-item[data-scene-index]");
  if (scene) updateAnimationStage(scene);

  const animationAction = event.target.closest("[data-animation-action]");
  if (animationAction) handleAnimationAction(animationAction.dataset.animationAction);

  const searchMeeting = event.target.closest("[data-search-meeting-id]");
  if (searchMeeting) {
    showMeetingDetail(searchMeeting.dataset.searchMeetingId);
    window.setTimeout(() => scrollToUtterance(searchMeeting.dataset.searchUtteranceId), 80);
  }

  const searchChip = event.target.closest("[data-search-chip]");
  if (searchChip) {
    renderSearchTab({ query: searchChip.dataset.searchChip, facet: "all" });
  }
});

document.addEventListener("submit", (event) => {
  const searchForm = event.target.closest("[data-integrated-search-form]");
  if (searchForm) {
    event.preventDefault();
    const formData = new FormData(searchForm);
    renderSearchTab({
      query: formData.get("q"),
      facet: formData.get("facet") || "all",
      includeProcedural: formData.get("includeProcedural") === "on",
    });
    return;
  }

  const form = event.target.closest("[data-agenda-form]");
  if (!form) return;
  event.preventDefault();

  const formData = new FormData(form);
  const result = buildAgendaPreparationResult({
    title: formData.get("title"),
    summary: formData.get("summary"),
    historicalAgendas: buildHistoricalAgendas(dashboardData),
    commissionerActivity: dashboardData.commissionerActivity || [],
  });
  const resultNode = $("#assistant-result");
  if (resultNode) resultNode.innerHTML = renderAgendaPreparationResult(result);
});
