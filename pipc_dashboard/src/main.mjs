import { buildMeetingDetailModel, buildSituationBoardModel } from "./data-model.mjs";
import { buildAnimationTimeline } from "./animation-model.mjs";
import { loadCommissionerCharacters } from "./character-assets.mjs";
import { buildCommissionerAnalysisModel } from "./commissioner-model.mjs";
import { renderAnimationViewer, renderCommissionerAnalysis, renderMeetingDetail, renderSituationBoard } from "./renderers.mjs";

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
  initTabs();
}

init();

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
