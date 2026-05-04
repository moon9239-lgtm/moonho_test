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
