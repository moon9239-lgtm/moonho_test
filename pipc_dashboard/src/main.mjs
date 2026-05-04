import { buildMeetingDetailModel, buildSituationBoardModel } from "./data-model.mjs";
import { renderMeetingDetail, renderSituationBoard } from "./renderers.mjs";

const dashboardData = window.PIPC_DASHBOARD_DATA || {};

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

function showMeetingDetail(id) {
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

document.addEventListener("click", (event) => {
  const card = event.target.closest(".meeting-card[data-meeting-id]");
  if (card) showMeetingDetail(card.dataset.meetingId);
});
