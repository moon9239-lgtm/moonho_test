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

function kpiCard(item) {
  return `
    <article class="kpi-card">
      <div class="kpi-label">${escapeHtml(item.label)}</div>
      <div class="kpi-value">${formatNumber(item.value)}</div>
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

export function renderSituationBoard(model = {}) {
  const kpis = Object.values(model.kpis || {}).map(kpiCard).join("");
  const cards = (model.meetingCards || []).map(meetingCard).join("");
  const signalCount = (model.signals?.majorPenaltyCases || []).length;

  return `
    <section class="section-band situation-board">
      <div class="section-header">
        <div>
          <h2>회의 운영 상황판</h2>
          <p class="section-caption">보호위 출범 이후 전체회의 운영 현황입니다.</p>
        </div>
        <div class="update-note">업데이트 기준: ${escapeHtml(model.updatedAt || "확인 필요")}</div>
      </div>
      <div class="kpi-grid">${kpis}</div>
      <div class="signal-strip">제재·처분 신호 ${formatNumber(signalCount)}건</div>
      <div class="meeting-card-grid">${cards}</div>
    </section>
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
        ${escapeHtml(ref.lawName)} ${escapeHtml(ref.article)}
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
      <div class="meeting-detail-grid">
        <aside class="meeting-detail-side">
          <h3>관련 문서</h3>
          <div class="button-stack">${docs}</div>
        </aside>
        <article class="transcript-panel">
          <h3>속기록</h3>
          <pre class="transcript-body">${escapeHtml(detail.transcriptText || "속기록을 불러오려면 원문 링크를 여세요.")}</pre>
        </article>
        <aside class="law-panel">
          <h3>법조항 비교</h3>
          ${lawItems}
        </aside>
      </div>
    </section>
  `;
}

export function renderAnimationViewer(timeline = {}) {
  const scenes = Array.isArray(timeline?.scenes) ? timeline.scenes : [];
  const sceneItems = scenes.map((scene, index) => `
    <button class="animation-scene-item" type="button" data-scene-index="${index}">
      <span>${escapeHtml(scene.speaker)}</span>
      <strong>${escapeHtml(scene.text)}</strong>
    </button>
  `).join("");

  return `
    <section class="section-band animation-viewer">
      <div class="section-header">
        <div>
          <h2>회의 애니메이션 재현</h2>
          <p class="section-caption">${escapeHtml(timeline?.meetingLabel)} 속기록 기반 장면 타임라인</p>
        </div>
        <button class="tool-button" type="button" data-close-animation>속기록으로 돌아가기</button>
      </div>
      <div class="animation-layout">
        <div class="animation-stage" aria-label="회의장 재현 무대">
          <div class="meeting-room-line">위원장</div>
          <div class="meeting-room-table">회의 진행</div>
          <div class="meeting-room-line">위원 · 사무처 · 안건</div>
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
