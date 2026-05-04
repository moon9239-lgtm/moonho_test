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

function meetingCard(item) {
  return `
    <button class="meeting-card" type="button" data-meeting-id="${escapeHtml(item.id)}">
      <span class="meeting-card-title">${escapeHtml(item.meetingLabel)}</span>
      <span class="meeting-card-meta">${escapeHtml(item.date || "날짜 없음")}</span>
      <span class="meeting-card-badge">속기록</span>
    </button>
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
        <div class="year-flow-meta">의결 ${formatNumber(row.decision_agendas)} · 보고 ${formatNumber(row.report_agendas)} · 발언 ${formatNumber(row.utterances)}</div>
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

function qualityRows(rows = []) {
  return `
    <div class="quality-mini-list">
      ${rows.slice(0, 5).map((row) => `
        <div class="quality-mini-row">
          <div>
            <strong>${escapeHtml(row.label || row.metric_key || "지표")}</strong>
            <span>${escapeHtml(row.notes || "")}</span>
          </div>
          <div class="progress-track"><span class="progress-fill" style="width:${Math.max(Number(row.ratio || 0) * 100, row.value_count ? 4 : 0)}%"></span></div>
          <b>${formatPercent(row.ratio)}</b>
        </div>
      `).join("")}
    </div>
  `;
}

export function renderSituationBoard(model = {}) {
  const kpis = Object.values(model.kpis || {}).map(kpiCard).join("");
  const cards = (model.meetingCards || []).slice(0, 24).map(meetingCard).join("");
  const signalCount = (model.signals?.majorPenaltyCases || []).length;
  const sanctions = (model.sanctions || []).map((row) => `
    <span class="signal-chip">${escapeHtml(row.sanction_kind || "처분")} ${formatNumber(row.sanction_count)}</span>
  `).join("");

  return `
    <section class="section-band situation-board redesigned-board">
      <div class="section-header">
        <div>
          <h2>회의 운영 상황판</h2>
          <p class="section-caption">심의·의결, 보고, 공개 여부, 발언 연결, 제재 신호를 한 화면에서 확인합니다.</p>
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
          <h3>데이터 검증 상태</h3>
          ${qualityRows(model.dataQuality || [])}
        </article>
      </div>
      <div class="signal-strip">
        <strong>제재·처분 신호 ${formatNumber(signalCount)}건</strong>
        <div class="signal-chip-row">${sanctions}</div>
      </div>
      <div class="section-header compact">
        <div>
          <h3>회의 바로가기</h3>
          <p class="section-caption">속기록이 있는 회의를 눌러 상세 화면으로 이동합니다.</p>
        </div>
      </div>
      <div class="meeting-card-grid">${cards}</div>
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
        <span>안건 구간</span>
        <strong>${formatNumber(agendas.length)}개</strong>
      </article>
    </div>
  `;
}

function renderAgendaList(agendas = []) {
  if (!agendas.length) return `<p class="section-caption">감지된 안건 구간이 없습니다.</p>`;
  return agendas.map((agenda) => `
    <button class="agenda-jump-item" type="button" data-utterance-target="${escapeHtml(agenda.startUtteranceId)}">
      <span>${escapeHtml(agenda.type || "안건")}</span>
      <strong>${escapeHtml(agenda.title)}</strong>
    </button>
  `).join("");
}

function renderUtteranceText(utterance) {
  let html = escapeHtml(utterance.text || "");
  const refs = Array.isArray(utterance.lawReferences) ? utterance.lawReferences : [];
  for (const ref of refs) {
    const raw = ref.text || `${ref.lawName} ${ref.article}`;
    const escaped = escapeHtml(raw);
    const button = `<button class="inline-law-ref" type="button" data-law-ref-index="${escapeHtml(ref.globalIndex)}">${escaped}</button>`;
    html = html.replace(escaped, button);
  }
  return html;
}

function renderUtterances(utterances = [], fallbackText = "") {
  if (!utterances.length) {
    return `<pre class="transcript-body">${escapeHtml(fallbackText || "속기록을 불러오려면 원문 링크를 여세요.")}</pre>`;
  }
  return `
    <div class="utterance-list">
      ${utterances.map((utterance) => `
        <article class="utterance-card" id="${escapeHtml(utterance.id)}" data-utterance-id="${escapeHtml(utterance.id)}">
          <header>
            <span class="speaker-role">${escapeHtml(utterance.speakerRole || "발언")}</span>
            <strong>${escapeHtml(utterance.speakerName || utterance.speaker)}</strong>
            <em>${escapeHtml(utterance.sectionTitle || "")}</em>
          </header>
          <p>${renderUtteranceText(utterance)}</p>
        </article>
      `).join("")}
    </div>
  `;
}

export function renderLawReferenceDetail(ref = {}) {
  if (!ref || typeof ref !== "object") {
    return `<div class="law-detail-empty">법조항을 선택하면 회의 당시 조문과 현재 확인 포인트가 표시됩니다.</div>`;
  }
  const request = ref.lookupRequest || {};
  return `
    <article class="law-detail-card">
      <div class="law-detail-heading">
        <span class="status-pill status-ready">로컬 검증</span>
        <h3>${escapeHtml(ref.lawName)} ${escapeHtml(ref.article)} ${ref.title ? `(${escapeHtml(ref.title)})` : ""}</h3>
      </div>
      <div class="law-version-grid">
        <section>
          <h4>회의 당시 기준</h4>
          <p>${escapeHtml(ref.meetingVersion || "korean-law-mcp 연혁 조회 연결 대기")}</p>
          <small>기준일: ${escapeHtml(ref.meetingDate || request.versions?.[0]?.effectiveDate || "확인 필요")}</small>
        </section>
        <section>
          <h4>현재 확인 포인트</h4>
          <p>${escapeHtml(ref.currentVersion || "현재 조문 조회 연결 대기")}</p>
          <small>조회 도구: korean-law-mcp get_law_text / get_article_history</small>
        </section>
      </div>
      <pre class="law-request">${escapeHtml(JSON.stringify(request, null, 2))}</pre>
    </article>
  `;
}

export function renderMeetingDetail(detail) {
  if (!detail?.meeting) {
    return `<section class="section-band"><h2>회의 상세</h2><p class="section-caption">선택된 회의가 없습니다.</p></section>`;
  }

  const docs = (detail.relatedDocuments || []).map((doc) => `
    <a class="small-button" href="${escapeHtml(doc.path)}" target="_blank" rel="noreferrer">${escapeHtml(doc.label)}</a>
  `).join("");
  const lawReferences = Array.isArray(detail.lawReferences) ? detail.lawReferences : [];
  const lawItems = lawReferences.length
    ? lawReferences.map((ref, index) => `
      <button class="law-reference-item" type="button" data-law-ref-index="${index}">
        <strong>${escapeHtml(ref.lawName)} ${escapeHtml(ref.article)}</strong>
        <span>${escapeHtml(ref.title || ref.meetingDate || "")}</span>
      </button>
    `).join("")
    : `<p class="section-caption">감지된 법조항이 없습니다.</p>`;

  return `
    <section class="section-band meeting-detail">
      <div class="section-header">
        <div>
          <h2>회의 상세</h2>
          <p class="section-caption">${escapeHtml(detail.meeting.meetingLabel)} · ${escapeHtml(detail.meeting.date)}</p>
        </div>
        <button class="tool-button" type="button" data-animation-meeting-id="${escapeHtml(detail.meeting.id)}">애니메이션으로 보기</button>
      </div>
      ${renderOverview(detail.overview || detail.meeting, detail.agendas || [])}
      <div class="meeting-detail-grid redesigned-detail">
        <aside class="meeting-detail-side">
          <h3>관련 문서</h3>
          <div class="button-stack">${docs}</div>
          <div class="side-divider"></div>
          <h3>안건 목록</h3>
          <div class="agenda-jump-list">${renderAgendaList(detail.agendas || [])}</div>
        </aside>
        <article class="transcript-panel">
          <div class="panel-heading">
            <h3>발언자별 속기록</h3>
            <span>${formatNumber((detail.utterances || []).length)}개 발언</span>
          </div>
          ${renderUtterances(detail.utterances || [], detail.transcriptText)}
        </article>
        <aside class="law-panel">
          <h3>법조항 비교</h3>
          ${lawItems}
          <div id="law-detail-panel" class="law-detail-panel">${renderLawReferenceDetail(lawReferences[0])}</div>
        </aside>
      </div>
    </section>
  `;
}

export function renderAnimationViewer(timeline = {}) {
  const scenes = Array.isArray(timeline?.scenes) ? timeline.scenes : [];
  const sceneItems = scenes.map((scene, index) => `
    <button class="animation-scene-item" type="button" data-scene-index="${index}">
      <span>${escapeHtml(scene.stageNote || scene.type || "장면")}</span>
      <strong>${escapeHtml(scene.text)}</strong>
      <em>${escapeHtml(scene.speaker)}</em>
    </button>
  `).join("");
  const firstScene = scenes[0] || {};

  return `
    <section class="section-band animation-viewer rich-animation">
      <div class="section-header">
        <div>
          <h2>회의 애니메이션 재현</h2>
          <p class="section-caption">${escapeHtml(timeline?.meetingLabel)} 개회부터 산회까지 발언 단위로 이동합니다.</p>
        </div>
        <button class="tool-button" type="button" data-close-animation>속기록으로 돌아가기</button>
      </div>
      <div class="animation-layout">
        <div class="animation-stage" aria-label="회의장 재현 무대" data-animation-stage>
          <div class="stage-screen">
            <span data-stage-label>${escapeHtml(firstScene.stageNote || "위원 입장")}</span>
            <strong data-stage-speaker>${escapeHtml(firstScene.speaker || "회의장")}</strong>
          </div>
          <div class="meeting-room-table">
            <span class="seat seat-chair">위원장</span>
            <span class="seat">위원</span>
            <span class="seat">위원</span>
            <span class="seat">사무처</span>
            <span class="seat">안건 담당</span>
          </div>
          <p data-stage-text>${escapeHtml(firstScene.text || "")}</p>
        </div>
        <div class="animation-timeline">${sceneItems}</div>
      </div>
    </section>
  `;
}

export function renderCommissionerAnalysis(model = {}) {
  const commissioners = Array.isArray(model?.commissioners) ? model.commissioners : [];
  const rows = commissioners.filter((item) => item && typeof item === "object").map((item) => {
    const topTags = Array.isArray(item.topTags) ? item.topTags : [];
    const metrics = [`발언 ${formatNumber(item.totalUtterances)}`];
    if (hasNumber(item.questionCount)) metrics.push(`질문 ${formatNumber(item.questionCount)}`);
    if (hasNumber(item.agendaCount)) metrics.push(`안건 ${formatNumber(item.agendaCount)}`);
    if (hasNumber(item.meetingCount)) metrics.push(`회의 ${formatNumber(item.meetingCount)}`);
    return `
    <article class="commissioner-card">
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.characterType)}</p>
      <div class="kpi-meta">${metrics.join(" · ")}</div>
      <div class="tag-list">${topTags.map((tag) => `<span class="status-pill">${escapeHtml(tag)}</span>`).join("")}</div>
    </article>
  `;
  }).join("");

  return `
    <section class="section-band">
      <div class="section-header">
        <div>
          <h2>위원별 분석</h2>
          <p class="section-caption">정량 지표와 캐릭터 프로필 기반의 초기 분석입니다.</p>
        </div>
      </div>
      <div class="commissioner-grid">${rows}</div>
    </section>
  `;
}

export function renderAgendaAssistant() {
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
