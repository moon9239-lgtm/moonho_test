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
          <p class="section-caption">속기록 내 법조항을 선택하면 회의 당시 조문과 현재 조문을 비교합니다.</p>
        </aside>
      </div>
    </section>
  `;
}
