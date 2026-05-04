import { buildSituationBoardModel } from "./data-model.mjs";
import { renderSituationBoard } from "./renderers.mjs";

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
