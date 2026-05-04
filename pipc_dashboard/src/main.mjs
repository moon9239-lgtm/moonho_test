import { buildMeetingDetailModel, buildSituationBoardModel } from "./data-model.mjs";
import { buildAnimationTimeline } from "./animation-model.mjs";
import { renderAnimationViewer, renderMeetingDetail, renderSituationBoard } from "./renderers.mjs";

const dashboardData = window.PIPC_DASHBOARD_DATA || {};
let activeMeetingId = null;

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
}

init();

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
  document.querySelector(".tab-view.active")?.classList.remove("active");
  meetingTab.classList.add("active");
  document.querySelector(".nav-item.active")?.classList.remove("active");
  document.querySelector('.nav-item[data-tab="meeting"]')?.classList.add("active");
  const title = $("#page-title");
  if (title) title.textContent = "회의 상세 탐색";
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
