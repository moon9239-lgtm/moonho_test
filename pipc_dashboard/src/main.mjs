import { buildMeetingDetailModel, buildSituationBoardModel } from "./data-model.mjs";
import { buildAnimationTimeline, findSceneIndexByUtteranceId } from "./animation-model.mjs";
import { buildAgendaPreparationResult } from "./agenda-assistant-model.mjs";
import { loadCommissionerCharacters } from "./character-assets.mjs";
import { buildCommissionerAnalysisModel } from "./commissioner-model.mjs";
import { disposeMeeting3DView, mountMeeting3DView, updateMeeting3DScene } from "./meeting-3d-view.mjs";
import { buildSearchModel } from "./search-model.mjs";
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
let assistantSavedItems = [];

const tabTitles = {
  stats: "전체회의 통계·동향 대시보드",
  search: "안건 통합검색",
  meeting: "회의별 속기록 조회",
  commissioner: "위원별 대시보드",
  assistant: "신규 안건 준비 도우미",
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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
  renderMeetingTab();
  renderAssistantTab();
  initTabs();
}

init();

function renderAssistantTab() {
  const assistantTab = $("#tab-assistant");
  if (!assistantTab) return;
  assistantTab.innerHTML = renderAgendaAssistant({
    savedPreparations: assistantSavedItems,
  });
  const assistantForm = $("#tab-assistant [data-agenda-form]");
  const titleInput = assistantForm?.querySelector("input[name='title']");
  const summaryInput = assistantForm?.querySelector("textarea[name='summary']");
  if (titleInput && !titleInput.id) {
    titleInput.id = "assistant-title";
  }
  if (summaryInput && !summaryInput.id) {
    summaryInput.id = "assistant-summary";
  }

  const existingList = assistantTab.querySelector(".assistant-saved-list");
  if (existingList) existingList.remove();
  const anchor = assistantTab.querySelector(".assistant-form");
  if (!anchor) return;
  const list = renderAssistantSavedList(assistantSavedItems);
  anchor.insertAdjacentHTML("beforebegin", `<div class="assistant-saved-list">${list}</div>`);
}

function renderAssistantSavedItem(item = {}) {
  const title = String(item.title || "").trim();
  const summary = String(item.summary || "").trim();
  const summaryPreview = summary
    ? `${summary.slice(0, 220)}${summary.length > 220 ? "..." : ""}`
    : "요약이 비어 있습니다.";
  const payload = encodeURIComponent(JSON.stringify({
    title,
    summary,
    result: item.result || null,
  }));
  return `
    <article class="assistant-saved-item">
      <h4>${escapeHtml(title || "제목 없음")}</h4>
      <p>${escapeHtml(summaryPreview)}</p>
      <button class="small-button" type="button" data-load-preparation="${payload}">불러와서 다시 분석하기</button>
    </article>
  `;
}

function renderAssistantSavedList(items = []) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) {
    return `<p class="section-caption">저장된 안건이 없습니다.</p>`;
  }
  return `<div class="assistant-saved-grid">${list.slice(0, 8).map((item) => renderAssistantSavedItem(item)).join("")}</div>`;
}

async function fetchAgendaPreparations() {
  try {
    const response = await fetch("/api/agenda-preparations");
    if (!response.ok) return [];
    const payload = await response.json();
    return Array.isArray(payload?.items) ? payload.items : [];
  } catch {
    return [];
  }
}

async function syncAgendaPreparations() {
  assistantSavedItems = await fetchAgendaPreparations();
  renderAssistantTab();
}

async function saveAgendaPreparation(payload = {}) {
  const response = await fetch("/api/agenda-preparations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data?.item || null;
}

function renderSearchTab(filters = {}) {
  const searchTab = $("#tab-search");
  if (!searchTab) return;
  searchTab.innerHTML = renderIntegratedSearch(buildSearchModel(meetingAnalysisIndex, filters));
}

function defaultMeetingId() {
  const transcripts = Array.isArray(dashboardData.meetingTranscripts) ? dashboardData.meetingTranscripts : [];
  return transcripts[0]?.id || transcripts[0]?.meeting_id || null;
}

function renderMeetingTab(id = defaultMeetingId()) {
  disposeMeeting3DView();
  const meetingTab = $("#tab-meeting");
  if (!meetingTab) return;
  const detail = buildMeetingDetailModel(dashboardData, id, { detailIndex: meetingDetailIndex });
  activeMeetingId = detail.meeting?.id || id || null;
  activeMeetingDetail = detail;
  meetingTab.innerHTML = renderMeetingDetail(detail);
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
    secondCommissioners: dashboardData.secondCommissioners || [],
    commissionerActivity: dashboardData.commissionerActivity || [],
    commissionerCharacters,
    detailIndex: meetingAnalysisIndex,
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

function buildAnimationTimelineFromDetail(detail = {}) {
  const meeting = detail.meeting || {};
  const utterances = Array.isArray(detail.utterances) && detail.utterances.length
    ? detail.utterances
    : transcriptToUtterances(detail.transcriptText);
  const fallbackTimeline = buildAnimationTimeline({
    meeting,
    utterances,
    characters: Array.isArray(meetingAnalysisIndex.characterAssets) ? meetingAnalysisIndex.characterAssets : [],
  });

  return {
    ...fallbackTimeline,
    agendas: Array.isArray(detail.agendas) ? detail.agendas : [],
    scenes: fallbackTimeline.scenes,
  };
}

function showMeetingDetail(id) {
  disposeMeeting3DView();
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
  const timeline = buildAnimationTimelineFromDetail(detail);
  activeAnimationTimeline = timeline;
  meetingTab.innerHTML = renderAnimationViewer(timeline);
  mountMeeting3DView(timeline);
  setActiveTab("meeting");
  const initialIndex = initialUtteranceId
    ? findSceneIndexByUtteranceId(timeline, initialUtteranceId)
    : 0;
  setAnimationScene(initialIndex >= 0 ? initialIndex : 0);
}

function scrollToUtterance(id) {
  const target = id ? document.getElementById(id) : null;
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  target.classList.add("focus-flash");
  window.setTimeout(() => target.classList.remove("focus-flash"), 1000);
}

function closeLawDrawer() {
  const drawer = $("#law-drawer");
  if (!drawer) return;
  drawer.hidden = true;
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
}

async function lookupLawReference(ref) {
  const params = new URLSearchParams({
    lawName: ref.lawName || "",
    article: ref.article || "",
    meetingDate: ref.meetingDate || activeMeetingDetail?.meeting?.date || "",
  });
  const response = await fetch(`/api/law-lookup?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`조문 조회 응답 오류: ${response.status}`);
  return response.json();
}

async function updateLawDetail(index) {
  const drawer = $("#law-drawer");
  const panel = $("#law-drawer-content");
  const ref = activeMeetingDetail?.lawReferences?.[Number(index)];
  if (!drawer || !panel || !ref) return;
  drawer.hidden = false;
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  panel.innerHTML = renderLawReferenceDetail({
    ...ref,
    lookupState: "loading",
    contextHint: "속기록 문맥에서 감지한 법률명으로 회의 당시 기준과 현재 기준을 조회합니다.",
  });

  try {
    const lookupResult = await lookupLawReference(ref);
    panel.innerHTML = renderLawReferenceDetail({
      ...ref,
      lookupResult,
      contextHint: lookupResult.resolvedLawName && lookupResult.resolvedLawName !== ref.lawName
        ? `문맥상 ${lookupResult.resolvedLawName}으로 보정했습니다.`
        : "속기록 문맥에서 감지한 법률명으로 조회했습니다.",
    });
  } catch (error) {
    panel.innerHTML = renderLawReferenceDetail({
      ...ref,
      lookupError: error?.message || "조문 조회 중 오류가 발생했습니다.",
      lookupResult: {
        note: "현재 화면은 로컬 대시보드입니다. korean-law-mcp 또는 LAW_OC 기반 서버 브리지가 연결되면 회의 당시 조문과 현재 조문이 자동으로 채워집니다.",
      },
    });
  }
}

function sceneText(scene = {}) {
  const utterance = activeMeetingDetail?.utterances?.find((item) => item.id === scene.utteranceId);
  return utterance?.text || scene.text || scene.shortText || "";
}

function escapeCssValue(value) {
  if (window.CSS?.escape) return CSS.escape(value);
  return String(value || "").replace(/["\\]/g, "\\$&");
}

function jumpAnimationToUtterance(utteranceId) {
  const index = findSceneIndexByUtteranceId(activeAnimationTimeline, utteranceId);
  if (index >= 0) setAnimationScene(index);
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
  const progress = $("[data-animation-progress]");
  const progressBar = $("[data-animation-progress-bar]");
  document.querySelector(".animation-scene-item.active")?.classList.remove("active");
  button?.classList.add("active");
  stage.dataset.sceneType = scene.type || "";
  stage.dataset.sceneAction = scene.action || "";
  if (label) label.textContent = scene.stageNote || scene.phase || "";
  if (speaker) speaker.textContent = scene.speaker || scene.speakerName || "";
  if (text) text.textContent = sceneText(scene);
  if (progress) progress.textContent = `${activeSceneIndex + 1} / ${scenes.length}`;
  if (progressBar) progressBar.style.width = `${Math.round((activeSceneIndex + 1) / scenes.length * 100)}%`;
  updateMeeting3DScene(scene);
  document.querySelectorAll(".animation-actor.speaking").forEach((node) => node.classList.remove("speaking"));
  if (scene.memberId) {
    document.querySelector(`.animation-actor[data-member-id="${escapeCssValue(scene.memberId)}"]`)?.classList.add("speaking");
  }
  button?.scrollIntoView({ block: "nearest" });
}

function updateAnimationStage(button) {
  if (!button) return;
  setAnimationScene(Number(button.dataset.sceneIndex || 0));
}

function stopAnimationPlayback() {
  if (!animationTimer) return;
  window.clearTimeout(animationTimer);
  animationTimer = null;
  const playButton = $('[data-animation-action="play"]');
  if (playButton) playButton.textContent = "재생";
}

function startAnimationPlayback() {
  stopAnimationPlayback();
  const scenes = activeAnimationTimeline?.scenes || [];
  if (!scenes.length) return;
  if (activeSceneIndex >= scenes.length - 1) setAnimationScene(0);
  const playButton = $('[data-animation-action="play"]');
  if (playButton) playButton.textContent = "일시정지";
  const scheduleNext = () => {
    const currentScenes = activeAnimationTimeline?.scenes || [];
    if (activeSceneIndex >= currentScenes.length - 1) {
      stopAnimationPlayback();
      return;
    }
    setAnimationScene(activeSceneIndex + 1);
    const duration = Number(currentScenes[activeSceneIndex]?.durationMs) || 1800;
    animationTimer = window.setTimeout(scheduleNext, duration);
  };
  const firstDuration = Number(scenes[activeSceneIndex]?.durationMs) || 1800;
  animationTimer = window.setTimeout(scheduleNext, firstDuration);
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
  if (agendaJump) {
    if (agendaJump.closest(".animation-viewer")) jumpAnimationToUtterance(agendaJump.dataset.utteranceTarget);
    else scrollToUtterance(agendaJump.dataset.utteranceTarget);
  }

  const lawReference = event.target.closest("[data-law-ref-index]");
  if (lawReference) updateLawDetail(lawReference.dataset.lawRefIndex);

  const closeLawButton = event.target.closest("[data-close-law-drawer]");
  if (closeLawButton) closeLawDrawer();

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

  const loadPreparation = event.target.closest("[data-load-preparation]");
  if (loadPreparation) {
    const payload = loadPreparation.dataset.loadPreparation || "";
    if (!payload) return;
    try {
      const parsed = JSON.parse(decodeURIComponent(payload));
      const titleInput = $("#assistant-title");
      const summaryInput = $("#assistant-summary");
      if (titleInput && typeof parsed.title === "string") titleInput.value = parsed.title;
      if (summaryInput && typeof parsed.summary === "string") summaryInput.value = parsed.summary;
      if (parsed.result) {
        const resultNode = $("#assistant-result");
        if (resultNode) resultNode.innerHTML = renderAgendaPreparationResult(parsed.result);
      }
    } catch {
      // ignore malformed stored payload
    }
  }
});

document.addEventListener("change", (event) => {
  const meetingSelect = event.target.closest("[data-meeting-select]");
  if (meetingSelect?.value) showMeetingDetail(meetingSelect.value);
});

document.addEventListener("submit", (event) => {
  const searchForm = event.target.closest("[data-integrated-search-form]");
  if (searchForm) {
    event.preventDefault();
    const formData = new FormData(searchForm);
    renderSearchTab({
      query: formData.get("q"),
      facet: formData.get("facet") || "all",
      issue: formData.get("issue") || "",
      disposition: formData.get("disposition") || "",
    });
    return;
  }

  const form = event.target.closest("[data-agenda-form]");
  if (!form) return;
  event.preventDefault();

  const formData = new FormData(form);
  const title = String(formData.get("title") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  const result = buildAgendaPreparationResult({
    title,
    summary,
    historicalAgendas: buildHistoricalAgendas(dashboardData),
    commissionerActivity: dashboardData.commissionerActivity || [],
  });
  const resultNode = $("#assistant-result");
  if (resultNode) resultNode.innerHTML = renderAgendaPreparationResult(result);
  if (title && summary) {
    void saveAgendaPreparation({
      title,
      summary,
      result,
    }).then(() => {
      syncAgendaPreparations();
    });
  }
});

syncAgendaPreparations();
