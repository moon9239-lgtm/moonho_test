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
  renderMeetingDetail,
  renderSituationBoard,
} from "./renderers.mjs";

const dashboardData = window.PIPC_DASHBOARD_DATA || {};
let activeMeetingId = null;

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
  const model = buildSituationBoardModel(dashboardData);
  setSnapshotTime(model.updatedAt);
  const stats = $("#tab-stats");
  if (stats) stats.innerHTML = renderSituationBoard(model);
  renderAssistantTab();
  initTabs();
}

init();

function renderAssistantTab() {
  const assistantTab = $("#tab-assistant");
  if (assistantTab) assistantTab.innerHTML = renderAgendaAssistant();
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
  const detail = buildMeetingDetailModel(dashboardData, id);
  const meetingTab = $("#tab-meeting");
  if (!meetingTab) return;
  meetingTab.innerHTML = renderMeetingDetail(detail);
  setActiveTab("meeting");
}

function showAnimationViewer(id) {
  const detail = buildMeetingDetailModel(dashboardData, id);
  if (!detail.meeting) return;
  activeMeetingId = id;
  const meetingTab = $("#tab-meeting");
  if (!meetingTab) return;
  const timeline = buildAnimationTimeline({
    meeting: detail.meeting,
    utterances: transcriptToUtterances(detail.transcriptText),
  });
  meetingTab.innerHTML = renderAnimationViewer(timeline);
}

document.addEventListener("click", (event) => {
  const card = event.target.closest(".meeting-card[data-meeting-id]");
  if (card) showMeetingDetail(card.dataset.meetingId);

  const animationButton = event.target.closest("[data-animation-meeting-id]");
  if (animationButton) showAnimationViewer(animationButton.dataset.animationMeetingId);

  const closeAnimationButton = event.target.closest("[data-close-animation]");
  if (closeAnimationButton && activeMeetingId) showMeetingDetail(activeMeetingId);
});

document.addEventListener("submit", (event) => {
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
