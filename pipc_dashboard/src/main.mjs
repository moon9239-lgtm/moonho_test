import { buildMeetingDetailModel, buildSituationBoardModel } from "./data-model.mjs";
import { buildAgendaPreparationResult } from "./agenda-assistant-model.mjs";
import { loadCommissionerCharacters } from "./character-assets.mjs";
import { buildCommissionerAnalysisModel } from "./commissioner-model.mjs";
import { buildSearchModel } from "./search-model.mjs";
import {
  renderAgendaAssistant,
  renderAgendaPreparationResult,
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
let activeAssistantResult = null;
let activeCommissionerModel = null;
let activeAgendaMemoId = null;

const AGENDA_MEMOS_KEY = "pipc-new-agenda-memos";

const tabTitles = {
  stats: "전체회의 통계·동향 대시보드",
  search: "안건 통합검색",
  meeting: "회의별 속기록 조회",
  commissioner: "위원별 대시보드",
  assistant: "신규안건 준비 도우미",
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
  renderMeetingTab();
  renderAssistantTab();
  initTabs();
}

init();

function renderAssistantTab() {
  const assistantTab = $("#tab-assistant");
  if (assistantTab) {
    assistantTab.innerHTML = renderAgendaAssistant();
    renderSavedAgendaMemos();
  }
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
  activeCommissionerModel = commissionerModel;
  commissionerTab.innerHTML = renderCommissionerAnalysis(commissionerModel);
}

renderCommissionerTab(dashboardData);

function currentSecondCommissionersForAssistant() {
  const excludeExecutive = (rows = []) => rows.filter((commissioner) => !/위원장|부위원장/.test(`${commissioner.role || ""} ${commissioner.roleTone || ""}`));
  if (Array.isArray(activeCommissionerModel?.currentSecondCommissioners) && activeCommissionerModel.currentSecondCommissioners.length) {
    return excludeExecutive(activeCommissionerModel.currentSecondCommissioners);
  }
  return excludeExecutive(buildCommissionerAnalysisModel({
    secondCommissioners: dashboardData.secondCommissioners || [],
    commissionerActivity: dashboardData.commissionerActivity || [],
    detailIndex: meetingAnalysisIndex,
  }).currentSecondCommissioners || []);
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

function collectAgendaDraft(form) {
  if (!form) return {};
  const formData = new FormData(form);
  return {
    title: formData.get("title") || "",
    target: formData.get("target") || "",
    summary: formData.get("summary") || "",
  };
}

function loadAgendaMemos() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(AGENDA_MEMOS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((memo) => memo && typeof memo === "object") : [];
  } catch {
    return [];
  }
}

function writeAgendaMemos(memos = []) {
  window.localStorage.setItem(AGENDA_MEMOS_KEY, JSON.stringify(memos.slice(0, 20)));
}

function memoTitle(memo = {}) {
  return String(memo.title || memo.target || "저장된 신규안건").trim() || "저장된 신규안건";
}

function renderSavedAgendaMemos() {
  const target = $("[data-agenda-saved-memos]");
  if (!target) return;
  const memos = loadAgendaMemos();
  if (!memos.length) {
    target.innerHTML = `<p class="section-caption">저장된 준비안이 없습니다.</p>`;
    return;
  }
  target.innerHTML = memos.map((memo) => {
    const savedDate = memo.savedAt ? new Date(memo.savedAt) : null;
    const savedLabel = savedDate && !Number.isNaN(savedDate.getTime())
      ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "short", timeStyle: "short" }).format(savedDate)
      : "저장일 확인 필요";
    return `
      <button class="assistant-saved-memo" type="button" data-load-agenda-memo-id="${String(memo.id || "")}">
        <strong>${memoTitle(memo).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</strong>
        <span>${savedLabel}</span>
      </button>
    `;
  }).join("");
}

function restoreAgendaMemo(memo = {}) {
  const form = $("[data-agenda-form]");
  if (!form) return;
  form.elements.title.value = memo.title || "";
  form.elements.target.value = memo.target || "";
  form.elements.summary.value = memo.summary || "";
  activeAgendaMemoId = memo.id || null;
  activeAssistantResult = memo.result || null;
  const resultNode = $("#assistant-result");
  if (resultNode) resultNode.innerHTML = renderAgendaPreparationResult(activeAssistantResult || {});
  const status = $("[data-agenda-save-status]");
  if (status) status.textContent = "저장된 준비안을 불러왔습니다.";
}

function saveAgendaDraft(form, result = activeAssistantResult, options = {}) {
  const status = $("[data-agenda-save-status]");
  const draft = collectAgendaDraft(form);
  const memos = loadAgendaMemos();
  const now = new Date().toISOString();
  const id = activeAgendaMemoId || (window.crypto?.randomUUID ? window.crypto.randomUUID() : `memo-${Date.now()}`);
  const payload = {
    id,
    ...draft,
    result,
    savedAt: now,
  };
  try {
    const nextMemos = [payload, ...memos.filter((memo) => memo.id !== id)];
    writeAgendaMemos(nextMemos);
    activeAgendaMemoId = id;
    renderSavedAgendaMemos();
    if (status && !options.silent) {
      status.textContent = `저장됨 · ${new Intl.DateTimeFormat("ko-KR", { timeStyle: "short" }).format(new Date())}`;
    }
  } catch {
    if (status) status.textContent = "브라우저 저장소에 저장하지 못했습니다.";
  }
}

document.addEventListener("click", (event) => {
  const card = event.target.closest(".meeting-card[data-meeting-id]");
  if (card) showMeetingDetail(card.dataset.meetingId);

  const agendaJump = event.target.closest("[data-utterance-target]");
  if (agendaJump) scrollToUtterance(agendaJump.dataset.utteranceTarget);

  const lawReference = event.target.closest("[data-law-ref-index]");
  if (lawReference) updateLawDetail(lawReference.dataset.lawRefIndex);

  const closeLawButton = event.target.closest("[data-close-law-drawer]");
  if (closeLawButton) closeLawDrawer();

  const searchMeeting = event.target.closest("[data-search-meeting-id]");
  if (searchMeeting) {
    showMeetingDetail(searchMeeting.dataset.searchMeetingId);
    window.setTimeout(() => scrollToUtterance(searchMeeting.dataset.searchUtteranceId), 80);
  }

  const searchChip = event.target.closest("[data-search-chip]");
  if (searchChip) {
    renderSearchTab({ query: searchChip.dataset.searchChip, facet: "all" });
  }

  const saveButton = event.target.closest("[data-save-agenda-draft]");
  if (saveButton) {
    event.preventDefault();
    saveAgendaDraft(document.querySelector("[data-agenda-form]"));
  }

  const loadMemoButton = event.target.closest("[data-load-agenda-memo-id]");
  if (loadMemoButton) {
    const memo = loadAgendaMemos().find((item) => item.id === loadMemoButton.dataset.loadAgendaMemoId);
    if (memo) restoreAgendaMemo(memo);
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
  const result = buildAgendaPreparationResult({
    title: formData.get("title"),
    target: formData.get("target"),
    summary: formData.get("summary"),
    historicalAgendas: buildHistoricalAgendas(dashboardData),
    currentSecondCommissioners: currentSecondCommissionersForAssistant(),
  });
  activeAssistantResult = result;
  const resultNode = $("#assistant-result");
  if (resultNode) resultNode.innerHTML = renderAgendaPreparationResult(result);
});
