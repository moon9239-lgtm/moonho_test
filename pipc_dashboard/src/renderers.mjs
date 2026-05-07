export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function formatNumber(value) {
  let number = 0;
  try {
    number = Number(value);
  } catch {
    number = 0;
  }
  return new Intl.NumberFormat("ko-KR").format(Number.isFinite(number) ? number : 0);
}

const PIPC_2026_FIFTH_MEETING_ID = "a47c6ac8-3acb-4644-8048-0f5333cc3102";
const PIPC_2026_FIFTH_WEBTOON_HREF = "./assets/webtoon/pipc_2026_5_image2_webtoon.html";

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

function pickText(value, keys = []) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value !== "object") return "";
  for (const key of keys) {
    const candidate = value[key];
    if (typeof candidate === "string" || typeof candidate === "number") return String(candidate);
  }
  return "";
}

function representativeQuestionSourceLabel(source = {}) {
  if (!source || typeof source !== "object") return "";
  return [
    pickText(source, ["date"]),
    pickText(source, ["meetingLabel"]),
    pickText(source, ["agendaTitle"]),
  ].filter(Boolean).join(" · ");
}

const DEFAULT_RENDERED_ANIMATION = {
  src: "",
  poster: "./assets/animation/pipc-committee-rigged.png",
  closeupSrc: "",
  alt: "PIPC Blender meeting animation prototype",
};

function renderedAnimationMedia(timeline = {}) {
  if (!timeline?.renderedMedia || typeof timeline.renderedMedia !== "object") return null;
  const media = timeline?.renderedMedia && typeof timeline.renderedMedia === "object"
    ? timeline.renderedMedia
    : {};
  const src = media.src || media.url || "";
  if (!src) return null;
  return {
    ...DEFAULT_RENDERED_ANIMATION,
    ...media,
    src,
  };
}

function sceneSpeechText(scene = {}) {
  return scene.text || scene.shortText || "";
}

function renderRenderedAnimation(media, scene = {}) {
  if (!media?.src) return "";
  const closeup = media.closeupSrc
    ? `<span class="rendered-animation-closeup" aria-hidden="true"><img src="${escapeHtml(media.closeupSrc)}" alt=""></span>`
    : "";
  return `
    <figure class="rendered-animation-panel" data-rendered-animation>
      <img class="rendered-animation-media" src="${escapeHtml(media.src)}" alt="${escapeHtml(media.alt || DEFAULT_RENDERED_ANIMATION.alt)}" loading="eager">
      <figcaption class="rendered-speech-card" data-rendered-speech-card>
        <span class="rendered-speech-kicker" data-stage-label>${escapeHtml(scene.stageNote || scene.phase || "속기록 장면")}</span>
        <span class="rendered-speaker-portrait" aria-hidden="true">
          <img data-rendered-speaker-image alt="" hidden>
          <b data-rendered-speaker-initial>${escapeHtml((scene.speakerName || scene.speaker || "발").slice(0, 1))}</b>
        </span>
        <strong data-stage-speaker>${escapeHtml(scene.speakerName || scene.speaker || "발언자")}</strong>
        <span class="rendered-mouth" aria-hidden="true"><i></i><i></i><i></i></span>
        <p data-stage-text>${escapeHtml(sceneSpeechText(scene))}</p>
      </figcaption>
      ${closeup}
    </figure>
  `;
}

function formatValue(value) {
  if (typeof value === "string") return escapeHtml(value);
  return formatNumber(value);
}

function formatPercent(value) {
  const number = Number(value);
  return `${Number.isFinite(number) ? Math.round(number * 1000) / 10 : 0}%`;
}

function kpiCard(item) {
  return `
    <article class="kpi-card">
      <div class="kpi-label">${escapeHtml(item.label)}</div>
      <div class="kpi-value">${formatValue(item.value)}</div>
      ${item.meta ? `<div class="kpi-meta">${escapeHtml(item.meta)}</div>` : ""}
    </article>
  `;
}

function donutChart(items = []) {
  const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0) || 1;
  let offset = 25;
  const circles = items.map((item) => {
    const share = Number(item.value || 0) / total * 100;
    const circle = `<circle class="donut-part donut-${escapeHtml(item.tone || "blue")}" cx="50" cy="50" r="36" pathLength="100" stroke-dasharray="${share} ${100 - share}" stroke-dashoffset="${offset}" />`;
    offset -= share;
    return circle;
  }).join("");
  const legend = items.map((item) => `
    <div class="donut-legend-row">
      <span class="legend-swatch ${escapeHtml(item.tone || "blue")}"></span>
      <strong>${escapeHtml(item.label)}</strong>
      <span>${formatNumber(item.value)}건 · ${formatPercent(item.ratio)}</span>
    </div>
  `).join("");
  return `
    <div class="donut-card">
      <svg class="donut-chart" viewBox="0 0 100 100" role="img" aria-label="비율 차트">
        <circle class="donut-bg" cx="50" cy="50" r="36"></circle>
        ${circles}
      </svg>
      <div class="donut-legend">${legend}</div>
    </div>
  `;
}

function yearlyFlowChart(rows = []) {
  const safeRows = rows.filter((row) => row && typeof row === "object");
  const max = Math.max(...safeRows.map((row) => Math.max(Number(row.meetings || 0), Number(row.agenda_items || 0))), 1);
  const items = safeRows.map((row) => {
    const meetingWidth = Math.max(Number(row.meetings || 0) / max * 100, 2);
    const agendaWidth = Math.max(Number(row.agenda_items || 0) / max * 100, 2);
    return `
      <div class="year-flow-row">
        <div class="year-flow-year">${escapeHtml(row.meeting_year)}</div>
        <div class="year-flow-bars">
          <span class="year-flow-bar meeting" style="width:${meetingWidth}%"><b>${formatNumber(row.meetings)}</b></span>
          <span class="year-flow-bar agenda" style="width:${agendaWidth}%"><b>${formatNumber(row.agenda_items)}</b></span>
        </div>
        <div class="year-flow-meta">의결 ${formatNumber(row.decision_agendas)} · 보고 ${formatNumber(row.report_agendas)}</div>
      </div>
    `;
  }).join("");
  return `
    <div class="year-flow">
      ${items}
      <div class="legend">
        <span class="legend-item"><span class="legend-swatch blue"></span>회의</span>
        <span class="legend-item"><span class="legend-swatch coral"></span>안건</span>
      </div>
    </div>
  `;
}

function topicBars(rows = []) {
  const safeRows = rows.filter((row) => row && typeof row === "object");
  const max = Math.max(...safeRows.map((row) => Number(row.agenda_count || 0)), 1);
  return `
    <div class="topic-bars">
      ${safeRows.map((row, index) => `
        <div class="topic-bar-row">
          <div class="topic-label">${escapeHtml(row.label || row.topic_key || "주제")}</div>
          <div class="topic-track">
            <span class="topic-fill tone-${index % 3}" style="width:${Math.max(Number(row.agenda_count || 0) / max * 100, 2)}%"></span>
          </div>
          <div class="topic-value">${formatNumber(row.agenda_count)}안건</div>
        </div>
      `).join("")}
    </div>
  `;
}

function rankList(rows = [], emptyText = "집계된 항목이 없습니다.") {
  const items = rows.slice(0, 6).map((row) => `
    <li>
      <span>${escapeHtml(row.label || row.name || "")}</span>
      <strong>${formatNumber(row.count || row.value || 0)}</strong>
    </li>
  `).join("");
  return `<ol class="rank-list">${items || `<li><span>${escapeHtml(emptyText)}</span><strong>0</strong></li>`}</ol>`;
}

export function renderSituationBoard(model = {}) {
  const kpis = Object.values(model.kpis || {}).map(kpiCard).join("");
  const globalStats = model.globalStats || {};

  return `
    <section class="section-band situation-board redesigned-board">
      <div class="section-header">
        <div>
          <h2>회의 운영 상황판</h2>
          <p class="section-caption">회의 흐름, 안건 처리 비율, 공개 여부, 주요 대상과 조항을 간결하게 정리했습니다.</p>
        </div>
        <div class="update-note">업데이트 기준: ${escapeHtml(model.updatedAt || "확인 필요")}</div>
      </div>
      <div class="kpi-grid">${kpis}</div>
      <div class="operations-grid">
        <article class="ops-panel">
          <h3>안건 처리 비율</h3>
          ${donutChart(model.agendaSplit || [])}
        </article>
        <article class="ops-panel">
          <h3>공개 여부</h3>
          ${donutChart(model.visibilitySplit || [])}
        </article>
        <article class="ops-panel wide">
          <h3>연도별 회의·안건 흐름</h3>
          ${yearlyFlowChart(model.yearlyRows || [])}
        </article>
        <article class="ops-panel">
          <h3>실무 쟁점 주제</h3>
          ${topicBars(model.topicDistribution || [])}
        </article>
        <article class="ops-panel">
          <h3>자주 등장한 관련 조항</h3>
          ${rankList(globalStats.topArticles || [], "감지된 조항 없음")}
        </article>
      </div>
    </section>
  `;
}

function filterOptions(options = [], selected = "") {
  return options.map((option) => `
    <option value="${escapeHtml(option.value)}"${option.value === selected ? " selected" : ""}>${escapeHtml(option.label)}</option>
  `).join("");
}

function chips(items = [], className = "status-pill") {
  return items.slice(0, 6).map((item) => `<span class="${className}">${escapeHtml(item)}</span>`).join("");
}

function confidenceBadges(items = []) {
  return items.slice(0, 4).map((item) => {
    const label = item?.label || "";
    const status = item?.status || "";
    const source = item?.source || "";
    return `<span class="source-confidence-badge"><strong>${escapeHtml(label)}</strong>${escapeHtml(status)}${source ? ` · ${escapeHtml(source)}` : ""}</span>`;
  }).join("");
}

function similarAgendaList(items = []) {
  if (!items.length) return "";
  return `
    <div class="similar-agenda-list">
      <strong>유사 안건</strong>
      <ul>
        ${items.slice(0, 3).map((item) => `
          <li>
            <span>${escapeHtml(item.date || "")}</span>
            <b>${escapeHtml(item.title || "안건")}</b>
            ${item.reason ? `<em>${escapeHtml(item.reason)}</em>` : ""}
          </li>
        `).join("")}
      </ul>
    </div>
  `;
}

function searchResultCard(row) {
  const dispositionItems = [
    ...(row.dispositions || []),
    row.amountText ? `금액 ${row.amountText}` : "",
  ].filter(Boolean);
  return `
    <article class="search-result-card">
      <header>
        <div>
          <span class="search-result-meta">${escapeHtml(row.date || "")} · ${escapeHtml(row.meetingLabel || "")}</span>
          <h3>${escapeHtml(row.title || "안건")}</h3>
        </div>
        <span class="status-pill">${escapeHtml(row.type || "안건")}</span>
      </header>
      <p>${escapeHtml(row.snippet || "")}</p>
      <div class="search-facet-grid">
        <div><strong>처분대상</strong><div>${chips(row.targets || [], "data-pill") || "<span>해당 없음</span>"}</div></div>
        <div><strong>관련 조항</strong><div>${chips(row.lawArticles || [], "provision-chip") || "<span>감지 없음</span>"}</div></div>
        <div><strong>주요 쟁점</strong><div>${chips(row.issueTags || [], "issue-pill") || "<span>감지 없음</span>"}</div></div>
        <div><strong>조치 결과</strong><div>${chips(dispositionItems, "status-pill") || "<span>확인 필요</span>"}</div></div>
      </div>
      <div class="search-confidence-row">
        <strong>출처 신뢰도</strong>
        <div>${confidenceBadges(row.sourceConfidence || []) || "<span>자동 추출 검토 필요</span>"}</div>
      </div>
      ${similarAgendaList(row.similarAgendas || [])}
      <footer>
        <button class="small-button" type="button" data-search-meeting-id="${escapeHtml(row.meetingId)}" data-search-utterance-id="${escapeHtml(row.startUtteranceId || "")}">속기록에서 보기</button>
      </footer>
    </article>
  `;
}

export function renderIntegratedSearch(model = {}) {
  const rows = Array.isArray(model.rows) ? model.rows : [];
  const filters = model.filters || {};
  const facet = filters.facet || "all";
  const query = filters.query || "";
  const issue = filters.issue || "";
  const disposition = filters.disposition || "";
  const options = model.filterOptions || {};
  const globalStats = model.globalStats || {};
  const quickKeywords = [
    ...(globalStats.topTargets || []).slice(0, 4).map((item) => item.label),
    ...(globalStats.topArticles || []).slice(0, 3).map((item) => item.label),
    ...(globalStats.topIssues || []).slice(0, 3).map((item) => item.label),
    ...(globalStats.topDispositions || []).slice(0, 3).map((item) => item.label),
  ].filter(Boolean);

  return `
    <section class="section-band integrated-search">
      <div class="section-header">
        <div>
          <h2>안건 통합검색</h2>
          <p class="section-caption">속기록 안건을 처분대상, 관련 조항, 주요 쟁점, 조치 결과 중심으로 검색합니다.</p>
        </div>
        <div class="update-note">${formatNumber(model.totalCount || 0)}개 인덱스 · ${formatNumber(model.visibleCount || rows.length)}개 표시</div>
      </div>
      <form class="search-control-panel" data-integrated-search-form>
        <label class="search-field">
          <span>검색어</span>
          <input name="q" type="search" value="${escapeHtml(query)}" placeholder="예: 롯데카드, 공무원연금공단, 제29조">
        </label>
        <label class="search-field narrow">
          <span>검색 범위</span>
          <select name="facet">
            ${filterOptions([
              { value: "all", label: "전체" },
              { value: "target", label: "처분대상" },
              { value: "law", label: "관련 조항" },
              { value: "issue", label: "주요 쟁점" },
              { value: "disposition", label: "조치 결과" },
            ], facet)}
          </select>
        </label>
        <label class="search-field narrow">
          <span>주요 쟁점</span>
          <select name="issue">
            ${filterOptions([
              { value: "", label: "전체" },
              ...(options.issues || []).map((label) => ({ value: label, label })),
            ], issue)}
          </select>
        </label>
        <label class="search-field narrow">
          <span>조치 결과</span>
          <select name="disposition">
            ${filterOptions([
              { value: "", label: "전체" },
              ...(options.dispositions || []).map((label) => ({ value: label, label })),
            ], disposition)}
          </select>
        </label>
        <button class="tool-button assistant-primary-action" type="submit">검색</button>
      </form>
      <div class="quick-chip-row">
        ${quickKeywords.map((keyword) => `<button class="quick-chip" type="button" data-search-chip="${escapeHtml(keyword)}">${escapeHtml(keyword)}</button>`).join("")}
      </div>
      <div class="search-result-list">
        ${rows.map(searchResultCard).join("") || `<article class="search-result-card empty"><h3>검색 결과가 없습니다.</h3><p>처분대상명, 안건명, 법조항을 바꿔 다시 검색해 보세요.</p></article>`}
      </div>
    </section>
  `;
}

function renderOverview(overview = {}, agendas = []) {
  const attendees = Array.isArray(overview.attendees) ? overview.attendees : [];
  return `
    <div class="meeting-overview-grid">
      <article class="meeting-overview-card">
        <span>일시</span>
        <strong>${escapeHtml(overview.dateText || overview.date || "확인 필요")}</strong>
      </article>
      <article class="meeting-overview-card">
        <span>장소</span>
        <strong>${escapeHtml(overview.place || "확인 필요")}</strong>
      </article>
      <article class="meeting-overview-card">
        <span>참석위원</span>
        <strong>${escapeHtml(attendees.length ? `${attendees.length}명` : "확인 필요")}</strong>
        <p>${escapeHtml(attendees.join(", "))}</p>
      </article>
      <article class="meeting-overview-card">
        <span>안건 개수</span>
        <strong>${formatNumber(agendas.length)}개</strong>
      </article>
    </div>
  `;
}

function renderAgendaList(agendas = []) {
  if (!agendas.length) return `<p class="section-caption">감지된 안건 구간이 없습니다.</p>`;
  return agendas.map((agenda) => `
    <button class="agenda-jump-item" type="button" data-utterance-target="${escapeHtml(agenda.startUtteranceId)}">
      ${agenda.type ? `<span class="agenda-jump-type">${escapeHtml(agenda.type)}</span>` : ""}
      <strong>${escapeHtml(agenda.title)}</strong>
    </button>
  `).join("");
}

function splitLongText(value, maxLength = 420) {
  const text = String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/([.!?。！？])(?=[가-힣A-Za-z0-9])/g, "$1\n");
  const blocks = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const chunks = [];

  for (const block of blocks) {
    const sentences = block.match(/[^.!?。！？]+[.!?。！？]+|[^.!?。！？]+$/g) || [block];
    let current = "";
    for (const sentence of sentences.map((item) => item.trim()).filter(Boolean)) {
      if (!current) {
        current = sentence;
      } else if ((current.length + sentence.length + 1) <= maxLength) {
        current = `${current} ${sentence}`;
      } else {
        chunks.push(current);
        current = sentence;
      }

      while (current.length > maxLength * 1.35) {
        const splitAt = Math.max(
          current.lastIndexOf(" ", maxLength),
          current.lastIndexOf(",", maxLength),
          current.lastIndexOf("，", maxLength),
          current.lastIndexOf("、", maxLength),
        );
        const cut = splitAt > maxLength * 0.45 ? splitAt + 1 : maxLength;
        chunks.push(current.slice(0, cut).trim());
        current = current.slice(cut).trim();
      }
    }
    if (current) chunks.push(current);
  }

  return chunks.length ? chunks : [String(value || "")];
}

function renderUtteranceText(utterance) {
  const refs = Array.isArray(utterance.lawReferences) ? utterance.lawReferences : [];
  return `
    <div class="utterance-bubbles">
      ${splitLongText(utterance.text || "").map((paragraph) => {
        let html = escapeHtml(paragraph);
        for (const ref of refs) {
          const raw = ref.text || `${ref.lawName} ${ref.article}`;
          const escaped = escapeHtml(raw);
          const button = `<button class="inline-law-ref" type="button" data-law-ref-index="${escapeHtml(ref.globalIndex)}">${escaped}</button>`;
          html = html.replace(escaped, button);
        }
        return `<p class="utterance-bubble">${html}</p>`;
      }).join("")}
    </div>
  `;
}

function groupUtterancesBySection(utterances = []) {
  const groups = [];
  for (const utterance of utterances) {
    const title = utterance.sectionTitle || "회의 진행";
    let group = groups[groups.length - 1];
    if (!group || group.title !== title) {
      group = { title, utterances: [] };
      groups.push(group);
    }
    group.utterances.push(utterance);
  }
  return groups;
}

function sectionMarker(title = "", index = 0) {
  const match = String(title).trim().match(/^([가-힣])\./);
  if (match) return `안건 ${match[1]}`;
  if (index === 0) return "회의 시작";
  return "회의 진행";
}

function speakerToneClass(utterance = {}) {
  const role = String(utterance.speakerRole || "");
  const speaker = String(utterance.speaker || utterance.speakerName || "");
  const combined = `${role} ${speaker}`.trim();
  if (/^(위원장|부위원장|위원)$/.test(role) || /^(위원장|부위원장|위원)\s/.test(speaker)) return "speaker-commissioner";
  if (/(사무처장|국장|과장|담당관|기획조정관|대변인|팀장|서기관|사무관|조사|심사|정책)/.test(combined)) return "speaker-staff";
  return "speaker-other";
}

function renderUtterances(utterances = [], fallbackText = "") {
  if (!utterances.length) {
    return `<pre class="transcript-body">${escapeHtml(fallbackText || "속기록을 불러오려면 원문 링크를 여세요.")}</pre>`;
  }
  return `
    <div class="utterance-section-list">
      ${groupUtterancesBySection(utterances).map((group, index) => `
        <section class="utterance-section">
          <header class="utterance-section-header">
            <div>
              <span class="utterance-section-kicker">${escapeHtml(sectionMarker(group.title, index))}</span>
              <h4 class="utterance-section-title">${escapeHtml(group.title)}</h4>
            </div>
            <span class="utterance-section-count">${formatNumber(group.utterances.length)}개 발언</span>
          </header>
          <div class="utterance-list">
            ${group.utterances.map((utterance) => `
              <article class="utterance-card ${speakerToneClass(utterance)}" id="${escapeHtml(utterance.id)}" data-utterance-id="${escapeHtml(utterance.id)}">
                <header>
                  <span class="speaker-role">${escapeHtml(utterance.speakerRole || "발언")}</span>
                  <strong>${escapeHtml(utterance.speakerName || utterance.speaker)}</strong>
                </header>
                ${renderUtteranceText(utterance)}
              </article>
            `).join("")}
          </div>
        </section>
      `).join("")}
    </div>
  `;
}

function lookupStatusText(ref = {}) {
  if (ref.lookupState === "loading") return "korean-law-mcp 조회 중";
  if (ref.lookupResult?.ok) return ref.lookupResult.changed ? "조문 변경 감지" : "법률 조문";
  if (ref.lookupResult?.status === "needs_credentials") return "LAW_OC 필요";
  if (ref.lookupError) return "조회 실패";
  return "조문 조회 준비";
}

function lawVersionText(version = {}, fallback = "") {
  return version?.articleText || version?.summary || fallback || "조문 원문을 아직 불러오지 못했습니다.";
}

function lawDisplay(version = {}, fallback = {}) {
  const display = version.display || {};
  return {
    lawName: display.lawName || version.lawName || fallback.lawName || "",
    articleTitle: display.articleTitle || fallback.articleTitle || version.article || "",
    articleText: display.articleText || lawVersionText(version, fallback.articleText || ""),
    promulgationDate: display.promulgationDate || version.promulgationDate || "",
    effectiveDate: display.effectiveDate || version.effectiveDate || fallback.effectiveDate || "",
    currentState: fallback.currentState || "",
    amendmentDate: fallback.amendmentDate || display.effectiveDate || version.effectiveDate || "",
  };
}

function renderLawField(label, value) {
  return `
    <div class="law-field">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value || "확인 필요")}</strong>
    </div>
  `;
}

function renderLawArticleCard(version = {}, options = {}) {
  const display = lawDisplay(version, options);
  const meta = options.mode === "current"
    ? renderLawField("개정 날짜", display.amendmentDate)
    : `
      ${renderLawField("법령명", display.lawName)}
      ${renderLawField("공포일", display.promulgationDate)}
      ${renderLawField("시행일", display.effectiveDate)}
      ${renderLawField("현행 여부", display.currentState)}
    `;
  return `
    <section class="law-article-card ${options.mode === "current" ? "current-law" : ""}">
      <h4>${escapeHtml(options.heading || "조문")}</h4>
      <div class="law-field-grid">${meta}</div>
      <div class="law-article-body">
        <span>조문명</span>
        <strong>${escapeHtml(display.articleTitle)}</strong>
        <p>${escapeHtml(display.articleText)}</p>
      </div>
      ${version.reuseReason ? `<small>${escapeHtml(version.reuseReason)}</small>` : ""}
    </section>
  `;
}

export function renderLawReferenceDetail(ref = {}) {
  if (!ref || typeof ref !== "object") {
    return `<div class="law-detail-empty">속기록의 법조항을 선택하면 회의 당시 조문과 현재 조문을 함께 표시합니다.</div>`;
  }
  const request = ref.lookupRequest || {};
  const result = ref.lookupResult || {};
  const meetingVersion = result.meeting || {};
  const currentVersion = result.current || {};
  const hasLookup = Boolean(result.ok || result.status || ref.lookupError);
  const changed = Boolean(result.changed);
  return `
    <article class="law-detail-card">
      <div class="law-detail-heading">
        <span class="status-pill status-ready">${escapeHtml(lookupStatusText(ref))}</span>
        <h3>${escapeHtml(ref.lawName)} ${escapeHtml(ref.article)} ${ref.title ? `(${escapeHtml(ref.title)})` : ""}</h3>
        ${ref.contextHint ? `<p>${escapeHtml(ref.contextHint)}</p>` : ""}
      </div>
      ${hasLookup ? `
        <div class="law-version-grid">
          ${renderLawArticleCard(meetingVersion, {
            heading: changed ? "회의 당시 조문" : "조문 내용",
            lawName: ref.lawName,
            articleTitle: ref.article,
            articleText: ref.meetingVersion || "회의일 기준 조문을 조회합니다.",
            effectiveDate: ref.meetingDate || request.versions?.[0]?.effectiveDate || "",
            currentState: changed ? "회의 당시 기준" : "현행",
          })}
          ${changed ? renderLawArticleCard(currentVersion, {
            mode: "current",
            heading: "현행 조문",
            lawName: ref.lawName,
            articleTitle: ref.article,
            articleText: ref.currentVersion || "현재 시행 조문을 조회합니다.",
            currentState: "현행",
            amendmentDate: currentVersion.display?.effectiveDate || currentVersion.effectiveDate,
          }) : ""}
        </div>
      ` : `
        <div class="law-detail-empty">${escapeHtml(lawVersionText(meetingVersion, ref.meetingVersion || "조문 조회를 준비합니다."))}</div>
      `}
      ${ref.lookupError ? `<p class="law-lookup-error">${escapeHtml(ref.lookupError)}</p>` : ""}
      ${result.note ? `<p class="law-lookup-note">${escapeHtml(result.note)}</p>` : ""}
    </article>
  `;
}

function renderLawDrawer() {
  return `
    <aside class="law-drawer" id="law-drawer" aria-hidden="true" hidden>
      <button class="law-drawer-backdrop" type="button" data-close-law-drawer aria-label="조문 패널 닫기"></button>
      <section class="law-drawer-panel" role="dialog" aria-modal="true" aria-labelledby="law-drawer-title">
        <header class="law-drawer-header">
          <div>
            <span>조문 비교</span>
            <h3 id="law-drawer-title">법조항 확인</h3>
          </div>
          <button class="icon-button" type="button" data-close-law-drawer aria-label="조문 패널 닫기">×</button>
        </header>
        <div id="law-drawer-content" class="law-drawer-content">${renderLawReferenceDetail(null)}</div>
      </section>
    </aside>
  `;
}

function meetingOptionLabel(item = {}) {
  return [item.date, item.meetingLabel || item.title || item.id].filter(Boolean).join(" · ");
}

function renderMeetingSelector(options = [], selectedId = "") {
  const safeOptions = Array.isArray(options) ? options.filter((item) => item?.id) : [];
  if (!safeOptions.length) {
    return `<p class="section-caption">선택 가능한 속기록 목록이 없습니다.</p>`;
  }
  return `
    <label class="meeting-selector" for="meeting-select">
      <span>회의 선택</span>
      <select id="meeting-select" data-meeting-select aria-label="회의별 속기록 선택">
        ${safeOptions.map((item) => `
          <option value="${escapeHtml(item.id)}"${item.selected || item.id === selectedId ? " selected" : ""}>${escapeHtml(meetingOptionLabel(item))}</option>
        `).join("")}
      </select>
    </label>
    <p class="meeting-selector-count">전체 ${formatNumber(safeOptions.length)}개 속기록</p>
  `;
}

function renderMeetingPrimaryActions(meeting = {}) {
  const webtoonAction = meeting.id === PIPC_2026_FIFTH_MEETING_ID
    ? `<a class="tool-button" href="${PIPC_2026_FIFTH_WEBTOON_HREF}">웹툰으로 보기</a>`
    : "";
  const animationAction = `<button class="tool-button" type="button" data-animation-meeting-id="${escapeHtml(meeting.id)}">애니메이션으로 보기</button>`;

  return `
    <div class="meeting-primary-actions">
      ${webtoonAction}
      ${animationAction}
    </div>
  `;
}

export function renderMeetingDetail(detail) {
  if (!detail?.meeting) {
    return `<section class="section-band"><h2>회의별 속기록 조회</h2><p class="section-caption">선택된 회의가 없습니다.</p></section>`;
  }

  const meetingOptions = Array.isArray(detail.meetingOptions) && detail.meetingOptions.length
    ? detail.meetingOptions
    : [{ ...detail.meeting, selected: true }];

  return `
    <section class="section-band meeting-detail">
      <div class="section-header">
        <div>
          <h2>회의별 속기록 조회</h2>
          <p class="section-caption">${escapeHtml(detail.meeting.meetingLabel)} · ${escapeHtml(detail.meeting.date)}</p>
        </div>
        ${renderMeetingPrimaryActions(detail.meeting)}
      </div>
      ${renderOverview(detail.overview || detail.meeting, detail.agendas || [])}
      <div class="meeting-detail-grid redesigned-detail">
        <aside class="meeting-detail-side">
          <div class="meeting-selector-panel">
            ${renderMeetingSelector(meetingOptions, detail.meeting.id)}
          </div>
          <h3>안건 목록</h3>
          <div class="agenda-jump-list">${renderAgendaList(detail.agendas || [])}</div>
        </aside>
        <article class="transcript-panel">
          <div class="panel-heading">
            <h3>안건별 발언</h3>
            <span>${formatNumber((detail.utterances || []).length)}개 발언</span>
          </div>
          ${renderUtterances(detail.utterances || [], detail.transcriptText)}
        </article>
      </div>
      ${renderLawDrawer()}
    </section>
  `;
}

export function renderAnimationViewer(timeline = {}) {
  const scenes = Array.isArray(timeline?.scenes) ? timeline.scenes : [];
  const members = Array.isArray(timeline?.members) ? timeline.members : [];
  const characterActors = !members.length && Array.isArray(timeline?.characters) ? timeline.characters.slice(0, 10) : [];
  const staffActors = Array.isArray(timeline?.staffActors) ? timeline.staffActors : [{ id: "staff", name: "사무처", role: "보고자", seat: "staff-center" }];
  const actors = [...members, ...characterActors, ...staffActors];
  const agendas = Array.isArray(timeline?.agendas) ? timeline.agendas : [];
  const sceneItems = scenes.map((scene, index) => `
    <button class="animation-scene-item" type="button" data-scene-index="${index}">
      <span>${escapeHtml(scene.phase || scene.stageNote || scene.type || "장면")}</span>
      <strong>${escapeHtml(scene.shortText || scene.text)}</strong>
      <em>${escapeHtml(scene.speaker)}</em>
    </button>
  `).join("");
  const firstScene = scenes[0] || {};
  const actorItems = actors.map((actor) => `
    <div class="animation-actor ${actor.id === firstScene.memberId ? "speaking" : ""}" data-member-id="${escapeHtml(actor.id || "")}" data-seat="${escapeHtml(actor.seat || "")}">
      ${actor.asset ? `<img src="${escapeHtml(actor.asset)}" alt="${escapeHtml(actor.name)} 캐릭터">` : `<span class="staff-avatar">${escapeHtml((actor.name || "사").slice(0, 1))}</span>`}
      <strong>${escapeHtml(actor.name || "참석자")}</strong>
      <small>${escapeHtml(actor.role || "")}</small>
    </div>
  `).join("");
  const agendaItems = agendas.slice(0, 12).map((agenda) => `
    <button class="animation-agenda-item" type="button" data-animation-agenda-id="${escapeHtml(agenda.id)}" data-utterance-target="${escapeHtml(agenda.startUtteranceId || "")}">
      <span>${escapeHtml(agenda.type || "안건")}</span>
      <strong>${escapeHtml(agenda.title || "")}</strong>
    </button>
  `).join("");

  const renderedAnimation = renderRenderedAnimation(renderedAnimationMedia(timeline), firstScene);
  const stageClass = renderedAnimation ? "animation-stage rendered-stage" : "animation-stage";
  const completionStrip = timeline?.completedMeetingAnimation
    ? `<div class="animation-completion-strip">2026년 제5회 보호위원회 · ${formatNumber(scenes.length)}개 장면 · 속기록 발언자 동기화 완료</div>`
    : "";

  return `
    <section class="section-band animation-viewer rich-animation">
      <div class="section-header">
        <div>
          <h2>회의 애니메이션 재현</h2>
          <p class="section-caption">${escapeHtml(timeline?.meetingLabel)} 개회부터 산회까지 발언 단위로 이동합니다.</p>
        </div>
        <button class="tool-button" type="button" data-close-animation>속기록으로 돌아가기</button>
      </div>
      ${completionStrip}
      <div class="animation-layout">
        <div class="${stageClass}" aria-label="회의장 재현 무대" data-animation-stage>
          ${renderedAnimation}
          <div class="meeting-3d-scene" data-meeting-3d-scene aria-label="3D 회의장 애니메이션 무대"></div>
          <div class="stage-screen">
            <span data-stage-label>${escapeHtml(firstScene.stageNote || "위원 입장")}</span>
            <strong data-stage-speaker>${escapeHtml(firstScene.speaker || "회의장")}</strong>
          </div>
          <div class="animation-progress" aria-label="장면 진행률">
            <span data-animation-progress>${scenes.length ? `1 / ${scenes.length}` : "0 / 0"}</span>
            <div><b data-animation-progress-bar style="width:${scenes.length ? Math.round(1 / scenes.length * 100) : 0}%"></b></div>
          </div>
          <div class="meeting-room-table animation-actor-grid">${actorItems}</div>
          <div class="animation-controls" data-animation-controls>
            <button class="small-button" type="button" data-animation-action="prev">이전</button>
            <button class="small-button primary-control" type="button" data-animation-action="play">재생</button>
            <button class="small-button" type="button" data-animation-action="next">다음</button>
          </div>
          <p data-stage-text>${escapeHtml(firstScene.text || "")}</p>
        </div>
        <aside class="animation-side-panel">
          <h3>안건 흐름</h3>
          <div class="animation-agenda-list">${agendaItems || `<p class="section-caption">감지된 안건 구간이 없습니다.</p>`}</div>
          <h3>장면 타임라인</h3>
          <div class="animation-timeline">${sceneItems}</div>
        </aside>
      </div>
    </section>
  `;
}

function commissionerMetrics(item = {}) {
  const metrics = [];
  if (hasNumber(item.totalUtterances)) metrics.push(`발언 ${formatNumber(item.totalUtterances)}`);
  if (hasNumber(item.questionCount)) metrics.push(`질문 ${formatNumber(item.questionCount)}`);
  if (hasNumber(item.agendaCount)) metrics.push(`안건 ${formatNumber(item.agendaCount)}`);
  if (hasNumber(item.meetingCount)) metrics.push(`회의 ${formatNumber(item.meetingCount)}`);
  if (hasNumber(item.appearances)) metrics.push(`출석 ${formatNumber(item.appearances)}`);
  return metrics;
}

function commissionerAffiliation(item = {}) {
  return pickText(item, ["affiliation", "organization", "recommendationRoute", "recommendation_route", "appointmentRoute", "appointment_route"]);
}

function renderCommissionerCard(item = {}) {
  if (!item || typeof item !== "object") return "";
  const topTagDetails = Array.isArray(item.topTagDetails) && item.topTagDetails.length
    ? item.topTagDetails
    : (Array.isArray(item.topTags) ? item.topTags.map((tag) => ({ label: tag, count: null })) : []);
  const metrics = commissionerMetrics(item);
  const tone = item.roleTone || "member";
  const className = [
    "commissioner-card",
    `commissioner-card-${tone}`,
    item.isExecutive ? "commissioner-card-executive" : "",
  ].filter(Boolean).join(" ");
  const asset = item.asset ? `
    <div class="commissioner-portrait">
      <img src="${escapeHtml(item.asset)}" alt="${escapeHtml(item.name || "위원")} 캐릭터">
    </div>
  ` : `<div class="commissioner-portrait commissioner-portrait-empty">${escapeHtml((item.name || "?").slice(0, 1))}</div>`;
  const roleBadges = [
    item.role || "위원",
    item.isExecutive ? "상임·당연직" : "",
    item.generation || "",
  ].filter(Boolean);
  const affiliation = commissionerAffiliation(item);
  const facts = [
    item.termText ? `임기 ${item.termText}` : "",
  ].filter(Boolean);
  const insights = [
    item.meetingRole ? { label: "회의 내 역할", value: item.meetingRole } : null,
    item.questionStyle ? { label: "질문 스타일", value: item.questionStyle } : null,
    item.representativeQuestion ? { label: "대표 질문", value: item.representativeQuestion, wide: true } : null,
  ].filter(Boolean);
  return `
    <article class="${className}">
        ${asset}
      <div class="commissioner-card-body">
        <div class="commissioner-card-topline">${roleBadges.map((badge) => `<span>${escapeHtml(badge)}</span>`).join("")}</div>
        <h3>${escapeHtml(item.name || "위원")}${affiliation ? `<span class="commissioner-affiliation">${escapeHtml(affiliation)}</span>` : ""}</h3>
        <p>${escapeHtml(item.characterType || "분석 대기")}</p>
        ${facts.length ? `<div class="commissioner-facts">${facts.map((fact) => `<span>${escapeHtml(fact)}</span>`).join("")}</div>` : ""}
        ${metrics.length ? `<div class="kpi-meta">${metrics.join(" · ")}</div>` : ""}
        ${topTagDetails.length ? `
          <div class="commissioner-tag-section">
            <strong>발언 성향</strong>
            <div class="tag-list">${topTagDetails.slice(0, 4).map((tag) => `<span class="status-pill">${escapeHtml(tag.label)}${hasNumber(tag.count) ? ` ${formatNumber(tag.count)}건` : ""}</span>`).join("")}</div>
          </div>
        ` : ""}
        ${insights.length ? `
          <div class="commissioner-insight-grid">
            ${insights.map((insight) => `
              <div class="${insight.wide ? "wide" : ""}">
                <strong>${escapeHtml(insight.label)}</strong>
                <span>${escapeHtml(insight.value)}</span>
              </div>
            `).join("")}
          </div>
        ` : ""}
      </div>
    </article>
  `;
}

function renderCommissionerGroup(title, caption, rows = [], className = "") {
  const cards = rows.filter((item) => item && typeof item === "object").map(renderCommissionerCard).join("");
  if (!cards) return "";
  return `
    <div class="commissioner-group ${className}">
      <div class="section-header compact">
        <div>
          <h3>${escapeHtml(title)}</h3>
          ${caption ? `<p class="section-caption">${escapeHtml(caption)}</p>` : ""}
        </div>
      </div>
      <div class="commissioner-grid">${cards}</div>
    </div>
  `;
}

export function renderCommissionerAnalysis(model = {}) {
  const currentSecond = Array.isArray(model?.currentSecondCommissioners) ? model.currentSecondCommissioners : [];
  const formerSecond = Array.isArray(model?.formerSecondCommissioners) ? model.formerSecondCommissioners : [];
  const firstGeneration = Array.isArray(model?.firstGenerationCommissioners) ? model.firstGenerationCommissioners : [];
  const fallbackCommissioners = !currentSecond.length && Array.isArray(model?.commissioners) ? model.commissioners : [];

  return `
    <section class="section-band commissioner-dashboard">
      <div class="section-header">
        <div>
          <h2>위원별 대시보드</h2>
          <p class="section-caption">현재 2기 위원을 먼저 확인하고, 캐릭터 프로필과 회의 활동 지표를 함께 봅니다.</p>
        </div>
      </div>
      ${renderCommissionerGroup("현재 2기 위원 명단", "위원장과 부위원장은 상임·당연직 카드 톤으로 구분했습니다.", currentSecond, "current-second")}
      ${renderCommissionerGroup("2기 교체·전직 위원", "2기 중 교체되었거나 전직 상태인 위원입니다.", formerSecond, "former-second")}
      ${renderCommissionerGroup("1기 위원", "출범기와 1기 활동 위원 캐릭터를 모았습니다.", firstGeneration, "first-generation")}
      ${renderCommissionerGroup("전체 위원 활동", "속기록 활동 지표를 기반으로 위원별 관심 주제를 확인합니다.", fallbackCommissioners, "legacy-activity")}
    </section>
  `;
}

function renderAgendaPreparationSavedItem(item = {}) {
  const title = escapeHtml(item.title || "제목 없음");
  const summary = escapeHtml(item.summary || "");
  const summaryPreview = summary ? `${summary.slice(0, 220)}${summary.length > 220 ? "..." : ""}` : "요약이 없습니다.";
  const payload = encodeURIComponent(JSON.stringify({
    title: item.title || "",
    summary: item.summary || "",
    result: item.result || null,
  }));
  return `
    <article class="assistant-saved-item">
      <h4>${title}</h4>
      <p>${summaryPreview}</p>
      <button class="small-button" type="button" data-load-preparation="${payload}">불러와서 다시 분석하기</button>
    </article>
  `;
}

function renderAgendaPreparationSavedItemList(items = []) {
  if (!items.length) {
    return `<p class="section-caption">아직 저장된 준비안이 없습니다.</p>`;
  }
  return items
    .slice(0, 8)
    .map((item) => renderAgendaPreparationSavedItem(item))
    .join("");
}

export function renderAgendaAssistant({
  savedPreparations = [],
} = {}) {
  return `
    <section class="section-band">
      <div class="section-header">
        <div>
          <h2>새 안건 준비 도우미</h2>
          <p class="section-caption">안건명과 요약을 입력하면 유사 안건, 예상 쟁점, 준비 체크리스트를 확인합니다.</p>
        </div>
      </div>
      <form class="assistant-form" data-agenda-form>
        <label class="assistant-field">
          <span>안건명</span>
          <input name="title" type="text" placeholder="예: 안전조치의무 위반 검토">
        </label>
        <label class="assistant-field">
          <span>안건 요약</span>
          <textarea name="summary" rows="7" placeholder="사안 개요와 검토 포인트를 붙여 넣으세요."></textarea>
        </label>
        <button class="tool-button assistant-primary-action" type="submit">분석하기</button>
      </form>
      <div class="assistant-result" id="assistant-result"></div>
    </section>
  `;
}

export function renderAgendaPreparationResult(result = {}) {
  if (!result || typeof result !== "object") result = {};
  const similarAgendas = Array.isArray(result.similarAgendas) ? result.similarAgendas : [];
  const expectedIssues = Array.isArray(result.expectedIssues) ? result.expectedIssues : [];
  const similarProvisions = Array.isArray(result.similarProvisions) ? result.similarProvisions : [];
  const dispositionLevels = Array.isArray(result.dispositionLevels) ? result.dispositionLevels : [];
  const commissionerQuestions = Array.isArray(result.commissionerQuestions) ? result.commissionerQuestions : [];
  const checklist = Array.isArray(result.checklist) ? result.checklist : [];

  const similar = similarAgendas.map((item) => {
    const title = pickText(item, ["title", "label"]);
    if (!title) return "";
    const disposition = pickText(item, ["disposition"]) || "처분 정보 확인 필요";
    return `
    <li>
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(disposition)}</span>
    </li>
  `;
  }).filter(Boolean).join("");
  const issues = expectedIssues
    .map((item) => pickText(item, ["label", "token"]))
    .filter(Boolean)
    .map((label) => `<span class="status-pill">${escapeHtml(label)}</span>`)
    .join("");
  const provisions = similarProvisions
    .map((item) => pickText(item, ["label"]))
    .filter(Boolean)
    .map((label) => `<span class="provision-chip">${escapeHtml(label)}</span>`)
    .join("");
  const dispositions = dispositionLevels.map((item) => {
    const label = pickText(item, ["label"]);
    if (!label) return "";
    const amount = pickText(item, ["amountText", "source"])
      || (hasNumber(item?.amountTotalKrw) && Number(item.amountTotalKrw) > 0 ? `${formatNumber(item.amountTotalKrw)}원` : "");
    return `
    <li>
      <strong>${escapeHtml(label)}</strong>
      <span class="assistant-danger">${escapeHtml(amount)}</span>
    </li>
  `;
  }).filter(Boolean).join("");
  const questions = commissionerQuestions.map((item) => {
    const question = pickText(item, ["question"]);
    if (!question) return "";
    return `
    <li>
      <strong>${escapeHtml(pickText(item, ["commissionerName"]) || "관련 위원")}</strong>
      <span>${escapeHtml(question)}</span>
    </li>
  `;
  }).filter(Boolean).join("");
  const checklistItems = checklist.map((item) => {
    const label = pickText(item, ["label"]);
    if (!label) return "";
    const detail = pickText(item, ["detail"]);
    return `
    <li>
      <strong>${escapeHtml(label)}</strong>
      ${detail ? `<span>${escapeHtml(detail)}</span>` : ""}
    </li>
  `;
  }).filter(Boolean).join("");

  return `
    <div class="assistant-result-grid">
      <section>
        <h3>유사 안건</h3>
        <ul class="assistant-list">${similar || "<li>유사 안건 후보 없음</li>"}</ul>
      </section>
      <section>
        <h3>예상 쟁점</h3>
        <div class="assistant-tag-list">${issues || "<span>감지된 핵심 쟁점 없음</span>"}</div>
      </section>
      <section>
        <h3>유사 법조항</h3>
        <div class="assistant-tag-list">${provisions}</div>
      </section>
      <section>
        <h3>과거 처분 수준</h3>
        <ul class="assistant-list">${dispositions || "<li>처분 수준 후보 없음</li>"}</ul>
      </section>
      <section>
        <h3>위원별 예상 질문</h3>
        <ul class="assistant-list">${questions || "<li>위원별 질문 근거가 더 필요합니다.</li>"}</ul>
      </section>
      <section>
        <h3>준비 체크리스트</h3>
        <ul class="assistant-list">${checklistItems}</ul>
      </section>
    </div>
  `;
}
