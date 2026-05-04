export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function formatNumber(value) {
  return new Intl.NumberFormat("ko-KR").format(Number(value || 0));
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

export function renderSituationBoard(model) {
  const kpis = Object.values(model.kpis).map(kpiCard).join("");
  const cards = model.meetingCards.map(meetingCard).join("");
  const signalCount = model.signals.majorPenaltyCases.length;

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
