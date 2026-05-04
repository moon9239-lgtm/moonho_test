(function () {
  const data = window.PIPC_DASHBOARD_DATA || {};
  const analysisIndex = window.PIPC_MEETING_ANALYSIS_INDEX || window.PIPC_MEETING_DETAIL_INDEX || {};
  const detailIndex = analysisIndex;
  const cssEscape = window.CSS?.escape || ((value) => String(value).replace(/["\\]/g, "\\$&"));

  let activeMeetingId = null;
  let activeMeetingDetail = null;
  let activeAnimationTimeline = null;
  let activeSceneIndex = 0;
  let animationTimer = null;

  const tabTitles = {
    stats: "전체회의 통계·동향 대시보드",
    search: "안건 통합검색",
    meeting: "회의 상세 탐색",
    commissioner: "위원별 분석",
    assistant: "신규 안건 준비 도우미",
  };

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("ko-KR").format(number(value));
  }

  function formatPercent(value) {
    const parsed = number(value);
    return `${Math.round(parsed * 1000) / 10}%`;
  }

  function text(value) {
    if (value == null) return "";
    if (Array.isArray(value)) return value.map(text).filter(Boolean).join(" ");
    if (typeof value === "object") return Object.values(value).map(text).filter(Boolean).join(" ");
    return String(value);
  }

  function normalizePath(value) {
    const path = String(value || "").replace(/\\/g, "/");
    if (!path || /^(https?:|file:|\/|\.\/|\.\.\/)/.test(path)) return path;
    return `../${path}`;
  }

  function normalizeTranscript(item, index = 0) {
    const date = item.date || item.meeting_date || "";
    const year = number(item.year || item.meeting_year || date.slice(0, 4));
    const meetingNo = item.meetingNo ?? item.meeting_number ?? "";
    const meetingTitle = item.meetingTitle || item.meeting_title || "";
    return {
      id: String(item.id || item.meeting_id || `${date}-${meetingNo || index}`),
      year,
      date,
      meetingNo,
      meetingLabel: item.meetingLabel || item.meeting_label || meetingTitle || (meetingNo ? `${year}년 제${meetingNo}회` : `${year}년`),
      title: item.title || item.transcript_title || meetingTitle || "전체회의",
      path: normalizePath(item.path || item.transcript_path || item.raw_md_path || ""),
      content: item.content || "",
    };
  }

  function transcripts() {
    return Array.isArray(data.meetingTranscripts) ? data.meetingTranscripts.map(normalizeTranscript) : [];
  }

  function embeddedMeetingDetail(meeting) {
    const detail = meeting ? detailIndex.meetings?.[meeting.id] : null;
    if (!detail) return null;
    return { ...detail, meeting: { ...meeting, ...(detail.meeting || {}), id: meeting.id } };
  }

  function selectedMeeting(id) {
    const items = transcripts();
    return id ? items.find((item) => item.id === id) || items[0] : items[0];
  }

  function setSnapshotTime() {
    const node = $("#snapshot-time");
    if (!node) return;
    const generatedAt = analysisIndex.generatedAt || data.generatedAt || "";
    const date = new Date(generatedAt);
    node.textContent = Number.isNaN(date.getTime())
      ? "업데이트 기준 확인 필요"
      : new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(date);
  }

  function overviewRow() {
    return Array.isArray(data.overviewKpis) ? data.overviewKpis[0] || {} : {};
  }

  function yearlyRows() {
    return data.yearlyStats?.length ? data.yearlyStats : data.meetingYearly || [];
  }

  function kpiCards() {
    const overview = overviewRow();
    const years = yearlyRows();
    const totalMeetings = number(overview.meetings_total) || years.reduce((sum, row) => sum + number(row.meetings ?? row.meeting_count), 0);
    const totalAgendas = number(overview.agenda_items_total) || years.reduce((sum, row) => sum + number(row.agenda_items ?? row.agenda_count), 0);
    const decision = number(overview.decision_agendas_total);
    const report = number(overview.report_agendas_total);
    const totals = analysisIndex.totals || {};
    const compactMeetings = Array.isArray(analysisIndex.compactMeetings) ? analysisIndex.compactMeetings : [];
    const utterances = compactMeetings.reduce((sum, item) => sum + number(item.utteranceCount), 0);
    const lawRefs = compactMeetings.reduce((sum, item) => sum + number(item.lawReferenceCount), 0);
    const latestQuarter = (analysisIndex.quarterlyStats || [])[0];
    const items = [
      { label: "총 회의 수", value: totalMeetings },
      { label: "총 안건 수", value: totalAgendas },
      { label: "회의당 평균 안건 수", value: totalMeetings ? Math.round(totalAgendas / totalMeetings * 10) / 10 : 0 },
      { label: "심의·의결 / 보고", value: `${decision} / ${report}`, meta: `${formatPercent(decision / Math.max(totalAgendas, 1))} / ${formatPercent(report / Math.max(totalAgendas, 1))}` },
      { label: "속기록 발언", value: utterances, meta: `${number(totals.parsedMeetings)}개 회의 정제` },
      { label: "검색 가능 안건 구간", value: totals.searchEntries || 0, meta: `법조항 참조 ${formatNumber(lawRefs)}개` },
      { label: "최근 분기", value: latestQuarter?.label || "-", meta: latestQuarter ? `${latestQuarter.meetingCount}회 · ${latestQuarter.agendaCount}구간` : "" },
    ];
    return items.map((item) => `
      <article class="kpi-card">
        <div class="kpi-label">${escapeHtml(item.label)}</div>
        <div class="kpi-value">${typeof item.value === "string" ? escapeHtml(item.value) : formatNumber(item.value)}</div>
        ${item.meta ? `<div class="kpi-meta">${escapeHtml(item.meta)}</div>` : ""}
      </article>
    `).join("");
  }

  function rankList(rows = [], emptyText = "집계 없음") {
    return `<ol class="rank-list">${rows.slice(0, 6).map((row) => `
      <li><span>${escapeHtml(row.label || row.name || "")}</span><strong>${formatNumber(row.count || row.value || 0)}</strong></li>
    `).join("") || `<li><span>${escapeHtml(emptyText)}</span><strong>0</strong></li>`}</ol>`;
  }

  function quarterlyStatsTable(rows = []) {
    const safeRows = rows.slice(0, 10);
    const maxAgenda = Math.max(...safeRows.map((row) => number(row.agendaCount)), 1);
    return `
      <div class="quarter-table">
        ${safeRows.map((row) => `
          <button class="quarter-row" type="button" data-quarter-key="${escapeHtml(row.key || "")}">
            <span class="quarter-label">${escapeHtml(row.label || "")}</span>
            <span class="quarter-meter"><b style="width:${Math.max(number(row.agendaCount) / maxAgenda * 100, 3)}%"></b></span>
            <span>${formatNumber(row.meetingCount)}회</span>
            <span>${formatNumber(row.agendaCount)}구간</span>
            <span>${formatNumber(row.utteranceCount)}발언</span>
            <span>${formatNumber(row.lawReferenceCount)}조항</span>
          </button>
        `).join("")}
      </div>
    `;
  }

  function shareRows(rows) {
    const total = rows.reduce((sum, item) => sum + number(item.value), 0) || 1;
    return rows.map((item) => ({ ...item, ratio: number(item.value) / total }));
  }

  function donutChart(rows = []) {
    const items = shareRows(rows);
    let offset = 25;
    const circles = items.map((item) => {
      const share = number(item.ratio) * 100;
      const circle = `<circle class="donut-part donut-${escapeHtml(item.tone || "blue")}" cx="50" cy="50" r="36" pathLength="100" stroke-dasharray="${share} ${100 - share}" stroke-dashoffset="${offset}" />`;
      offset -= share;
      return circle;
    }).join("");
    return `
      <div class="donut-card">
        <svg class="donut-chart" viewBox="0 0 100 100" role="img" aria-label="비율 차트">
          <circle class="donut-bg" cx="50" cy="50" r="36"></circle>${circles}
        </svg>
        <div class="donut-legend">
          ${items.map((item) => `
            <div class="donut-legend-row"><span class="legend-swatch ${escapeHtml(item.tone || "blue")}"></span><strong>${escapeHtml(item.label)}</strong><span>${formatNumber(item.value)}건 · ${formatPercent(item.ratio)}</span></div>
          `).join("")}
        </div>
      </div>
    `;
  }

  function yearlyFlowChart(rows = []) {
    const safeRows = rows.filter((row) => row && typeof row === "object");
    const max = Math.max(...safeRows.map((row) => Math.max(number(row.meetings), number(row.agenda_items))), 1);
    return `
      <div class="year-flow">
        ${safeRows.map((row) => `
          <div class="year-flow-row">
            <div class="year-flow-year">${escapeHtml(row.meeting_year)}</div>
            <div class="year-flow-bars">
              <span class="year-flow-bar meeting" style="width:${Math.max(number(row.meetings) / max * 100, 2)}%"><b>${formatNumber(row.meetings)}</b></span>
              <span class="year-flow-bar agenda" style="width:${Math.max(number(row.agenda_items) / max * 100, 2)}%"><b>${formatNumber(row.agenda_items)}</b></span>
            </div>
            <div class="year-flow-meta">의결 ${formatNumber(row.decision_agendas)} · 보고 ${formatNumber(row.report_agendas)} · 발언 ${formatNumber(row.utterances)}</div>
          </div>
        `).join("")}
      </div>
    `;
  }

  function topicBars(rows = []) {
    const safeRows = rows.slice(0, 8);
    const max = Math.max(...safeRows.map((row) => number(row.agenda_count)), 1);
    return `
      <div class="topic-bars">
        ${safeRows.map((row, index) => `
          <div class="topic-bar-row">
            <div class="topic-label">${escapeHtml(row.label || row.topic_key || "주제")}</div>
            <div class="topic-track"><span class="topic-fill tone-${index % 3}" style="width:${Math.max(number(row.agenda_count) / max * 100, 2)}%"></span></div>
            <div class="topic-value">${formatNumber(row.agenda_count)}안건</div>
          </div>
        `).join("")}
      </div>
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

  function renderSituationBoard() {
    const overview = overviewRow();
    const totalAgendas = number(overview.agenda_items_total);
    const globalStats = analysisIndex.globalStats || {};
    return `
      <section class="section-band situation-board redesigned-board">
        <div class="section-header">
          <div>
            <h2>회의 운영 상황판</h2>
            <p class="section-caption">연도·분기별 회의 흐름, 안건 구간, 발언량, 조항 참조를 실무자가 바로 훑을 수 있게 정리했습니다.</p>
          </div>
          <div class="update-note">업데이트 기준: ${escapeHtml(analysisIndex.generatedAt || data.generatedAt || "확인 필요")}</div>
        </div>
        <div class="kpi-grid">${kpiCards()}</div>
        <div class="operations-grid">
          <article class="ops-panel"><h3>안건 처리 비율</h3>${donutChart([
            { label: "심의·의결", value: overview.decision_agendas_total, tone: "blue" },
            { label: "보고", value: overview.report_agendas_total, tone: "lavender" },
            { label: "기타·미분류", value: Math.max(totalAgendas - number(overview.decision_agendas_total) - number(overview.report_agendas_total), 0), tone: "slate" },
          ])}</article>
          <article class="ops-panel"><h3>공개 여부</h3>${donutChart([
            { label: "공개", value: overview.public_agendas_total, tone: "blue" },
            { label: "비공개", value: overview.private_agendas_total, tone: "coral" },
          ])}</article>
          <article class="ops-panel wide"><h3>연도별 회의·안건 흐름</h3>${yearlyFlowChart(yearlyRows())}</article>
          <article class="ops-panel wide"><h3>최근 분기별 회의 운영 통계</h3>${quarterlyStatsTable(analysisIndex.quarterlyStats || [])}</article>
          <article class="ops-panel"><h3>실무 쟁점 주제</h3>${topicBars(data.topicDistribution || [])}</article>
          <article class="ops-panel"><h3>속기록 기반 주요 대상</h3>${rankList(globalStats.topTargets || [], "추출된 대상 없음")}</article>
          <article class="ops-panel"><h3>자주 등장한 관련 조항</h3>${rankList(globalStats.topArticles || [], "감지된 조항 없음")}</article>
        </div>
        <div class="section-header compact"><div><h3>회의 바로가기</h3><p class="section-caption">속기록이 있는 회의를 눌러 상세 화면으로 이동합니다.</p></div></div>
        <div class="meeting-card-grid">${transcripts().slice(0, 24).map(meetingCard).join("")}</div>
      </section>
    `;
  }

  function normalizeSearch(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function rowFacetText(row, facet) {
    if (facet === "target") return (row.targets || []).join(" ");
    if (facet === "law") return (row.lawArticles || []).join(" ");
    if (facet === "speaker") return (row.speakers || []).join(" ");
    if (facet === "keyword") return (row.keywords || []).join(" ");
    return [row.title, row.meetingLabel, row.date, row.type, (row.targets || []).join(" "), (row.lawArticles || []).join(" "), (row.speakers || []).join(" "), (row.keywords || []).join(" "), row.snippet, row.searchText].join(" ");
  }

  function scoreSearchRow(row, query, facet) {
    if (!query) return row.isProcedural ? 1 : 2;
    const haystack = normalizeSearch(rowFacetText(row, facet));
    const tokens = normalizeSearch(query).split(/\s+/).filter(Boolean);
    let score = 0;
    for (const token of tokens) {
      if (haystack.includes(token)) score += 2;
      if ((row.targets || []).some((item) => item.toLowerCase().includes(token))) score += 3;
      if ((row.lawArticles || []).some((item) => item.toLowerCase().includes(token))) score += 3;
      if ((row.speakers || []).some((item) => item.toLowerCase().includes(token))) score += 2;
      if ((row.title || "").toLowerCase().includes(token)) score += 2;
    }
    return score;
  }

  function buildSearchModel(filters = {}) {
    const query = String(filters.query || "").trim();
    const facet = filters.facet || "all";
    const includeProcedural = Boolean(filters.includeProcedural);
    const allRows = Array.isArray(analysisIndex.searchIndex) ? analysisIndex.searchIndex : [];
    const scored = allRows
      .map((row, index) => ({ row, index, score: scoreSearchRow(row, query, facet) }))
      .filter((item) => item.score > 0)
      .filter((item) => includeProcedural || !item.row.isProcedural || query)
      .sort((left, right) => right.score - left.score || String(right.row.date || "").localeCompare(String(left.row.date || "")) || left.index - right.index);
    return {
      rows: scored.slice(0, 80).map((item) => item.row),
      totalCount: allRows.length,
      visibleCount: scored.length,
      filters: { query, facet, includeProcedural },
    };
  }

  function chipList(items = [], className = "status-pill") {
    return items.slice(0, 6).map((item) => `<span class="${className}">${escapeHtml(item)}</span>`).join("");
  }

  function renderSearch(filters = {}) {
    const model = buildSearchModel(filters);
    const globalStats = analysisIndex.globalStats || {};
    const quickKeywords = [
      ...(globalStats.topTargets || []).slice(0, 4).map((item) => item.label),
      ...(globalStats.topArticles || []).slice(0, 4).map((item) => item.label),
    ].filter(Boolean);
    const rows = model.rows.map((row) => `
      <article class="search-result-card">
        <header>
          <div><span class="search-result-meta">${escapeHtml(row.date)} · ${escapeHtml(row.meetingLabel)}</span><h3>${escapeHtml(row.title || "안건")}</h3></div>
          <span class="status-pill">${escapeHtml(row.type || "안건")}</span>
        </header>
        <p>${escapeHtml(row.snippet || "")}</p>
        <div class="search-facet-grid">
          <div><strong>대상</strong><div>${chipList(row.targets || [], "data-pill") || "<span>추출 없음</span>"}</div></div>
          <div><strong>관련 조항</strong><div>${chipList(row.lawArticles || [], "provision-chip") || "<span>감지 없음</span>"}</div></div>
          <div><strong>발언자</strong><div>${chipList(row.speakers || [], "status-pill")}</div></div>
          <div><strong>키워드</strong><div>${chipList(row.keywords || [], "data-pill")}</div></div>
        </div>
        <footer>
          <button class="small-button" type="button" data-search-meeting-id="${escapeHtml(row.meetingId)}" data-search-utterance-id="${escapeHtml(row.startUtteranceId || "")}">회의 상세에서 보기</button>
          ${row.isProcedural ? `<span class="search-procedure-note">절차성 구간</span>` : ""}
        </footer>
      </article>
    `).join("");
    return `
      <section class="section-band integrated-search">
        <div class="section-header">
          <div><h2>안건 통합검색</h2><p class="section-caption">속기록을 대상, 조항, 발언자, 키워드 단위로 쪼개 검색합니다.</p></div>
          <div class="update-note">${formatNumber(model.totalCount)}개 인덱스 · ${formatNumber(model.visibleCount)}개 표시</div>
        </div>
        <form class="search-control-panel" data-integrated-search-form>
          <label class="search-field"><span>검색어</span><input name="q" type="search" value="${escapeHtml(model.filters.query)}" placeholder="예: 카카오페이, 제29조, 안전조치, 송경희"></label>
          <label class="search-field narrow"><span>검색 범위</span><select name="facet">
            ${["all:전체", "target:처분대상", "law:관련 조항", "speaker:발언자", "keyword:키워드"].map((pair) => {
              const [value, label] = pair.split(":");
              return `<option value="${value}"${model.filters.facet === value ? " selected" : ""}>${label}</option>`;
            }).join("")}
          </select></label>
          <label class="toggle-field"><input name="includeProcedural" type="checkbox"${model.filters.includeProcedural ? " checked" : ""}><span>회의록·공개여부 같은 절차 구간 포함</span></label>
          <button class="tool-button assistant-primary-action" type="submit">검색</button>
        </form>
        <div class="quick-chip-row">${quickKeywords.map((keyword) => `<button class="quick-chip" type="button" data-search-chip="${escapeHtml(keyword)}">${escapeHtml(keyword)}</button>`).join("")}</div>
        <div class="search-result-list">${rows || `<article class="search-result-card empty"><h3>검색 결과가 없습니다.</h3><p>대상명, 법조항, 발언자명, 쟁점 키워드를 바꿔 다시 검색해 보세요.</p></article>`}</div>
      </section>
    `;
  }

  function lawDetail(ref) {
    if (!ref) return `<div class="law-detail-empty">법조항을 선택하면 구체적인 확인 포인트가 표시됩니다.</div>`;
    return `
      <article class="law-detail-card">
        <div class="law-detail-heading"><span class="status-pill status-ready">로컬 검증</span><h3>${escapeHtml(ref.lawName)} ${escapeHtml(ref.article)} ${ref.title ? `(${escapeHtml(ref.title)})` : ""}</h3></div>
        <div class="law-version-grid">
          <section><h4>회의 당시 기준</h4><p>${escapeHtml(ref.meetingVersion || "korean-law-mcp 연혁 조회 연결 대기")}</p><small>기준일: ${escapeHtml(ref.meetingDate || "")}</small></section>
          <section><h4>현재 확인 포인트</h4><p>${escapeHtml(ref.currentVersion || "현재 조문 조회 연결 대기")}</p><small>조회 도구: korean-law-mcp get_law_text / get_article_history</small></section>
        </div>
        <pre class="law-request">${escapeHtml(JSON.stringify(ref.lookupRequest || {}, null, 2))}</pre>
      </article>
    `;
  }

  function renderAgendaList(agendas = []) {
    return agendas.map((agenda) => `
      <button class="agenda-jump-item" type="button" data-utterance-target="${escapeHtml(agenda.startUtteranceId || "")}">
        <span>${escapeHtml(agenda.type || "안건")}</span><strong>${escapeHtml(agenda.title || "")}</strong>
      </button>
    `).join("") || `<p class="section-caption">감지된 안건 구간이 없습니다.</p>`;
  }

  function renderUtteranceText(utterance) {
    let html = escapeHtml(utterance.text || "");
    for (const ref of utterance.lawReferences || []) {
      const raw = ref.text || `${ref.lawName} ${ref.article}`;
      const escaped = escapeHtml(raw);
      html = html.replace(escaped, `<button class="inline-law-ref" type="button" data-law-ref-index="${escapeHtml(ref.globalIndex)}">${escaped}</button>`);
    }
    return html;
  }

  function renderUtterances(utterances = [], meetingId = "") {
    return `
      <div class="utterance-list">
        ${utterances.map((utterance) => `
          <article class="utterance-card" id="${escapeHtml(utterance.id)}" data-utterance-id="${escapeHtml(utterance.id)}">
            <header>
              <span class="speaker-role">${escapeHtml(utterance.speakerRole || "발언")}</span>
              <strong>${escapeHtml(utterance.speakerName || utterance.speaker)}</strong>
              <em>${escapeHtml(utterance.sectionTitle || "")}</em>
              <button class="utterance-animation-jump" type="button" data-animation-meeting-id="${escapeHtml(meetingId)}" data-animation-utterance-id="${escapeHtml(utterance.id)}">장면 이동</button>
            </header>
            <p>${renderUtteranceText(utterance)}</p>
          </article>
        `).join("")}
      </div>
    `;
  }

  function renderMeetingDetail(id) {
    const meeting = selectedMeeting(id);
    if (!meeting) return `<section class="section-band"><h2>회의 상세</h2><p class="section-caption">선택된 회의가 없습니다.</p></section>`;
    const detail = embeddedMeetingDetail(meeting);
    activeMeetingDetail = detail;
    const lawRefs = detail?.lawReferences || [];
    const overview = detail?.overview || {};
    const attendees = Array.isArray(overview.attendees) ? overview.attendees : [];
    return `
      <section class="section-band meeting-detail">
        <div class="section-header">
          <div><h2>회의 상세</h2><p class="section-caption">${escapeHtml(meeting.meetingLabel)} · ${escapeHtml(meeting.date)}</p></div>
          <button class="tool-button" type="button" data-animation-meeting-id="${escapeHtml(meeting.id)}">애니메이션으로 보기</button>
        </div>
        ${detail ? `
          <div class="meeting-overview-grid">
            <article class="meeting-overview-card"><span>일시</span><strong>${escapeHtml(overview.dateText || overview.date || meeting.date)}</strong></article>
            <article class="meeting-overview-card"><span>장소</span><strong>${escapeHtml(overview.place || "확인 필요")}</strong></article>
            <article class="meeting-overview-card"><span>참석위원</span><strong>${formatNumber(attendees.length)}명</strong><p>${escapeHtml(attendees.join(", "))}</p></article>
            <article class="meeting-overview-card"><span>안건 구간</span><strong>${formatNumber((detail.agendas || []).length)}개</strong></article>
          </div>` : ""}
        <div class="meeting-detail-grid redesigned-detail">
          <aside class="meeting-detail-side">
            <h3>관련 문서</h3><div class="button-stack"><a class="small-button" href="${escapeHtml(meeting.path)}" target="_blank" rel="noreferrer">속기록 원문</a></div>
            <div class="side-divider"></div><h3>안건 목록</h3><div class="agenda-jump-list">${renderAgendaList(detail?.agendas || [])}</div>
          </aside>
          <article class="transcript-panel">
            <div class="panel-heading"><h3>발언자별 속기록</h3><span>${formatNumber(detail?.utterances?.length || 0)}개 발언</span></div>
            ${detail?.utterances?.length ? renderUtterances(detail.utterances, meeting.id) : `<pre class="transcript-body">${escapeHtml(meeting.content || "속기록 본문을 찾지 못했습니다.")}</pre>`}
          </article>
          <aside class="law-panel">
            <h3>법조항 비교</h3>
            ${lawRefs.map((ref, index) => `<button class="law-reference-item" type="button" data-law-ref-index="${index}"><strong>${escapeHtml(ref.lawName)} ${escapeHtml(ref.article)}</strong><span>${escapeHtml(ref.title || ref.meetingDate || "")}</span></button>`).join("") || `<p class="section-caption">감지된 법조항이 없습니다.</p>`}
            <div id="law-detail-panel" class="law-detail-panel">${lawDetail(lawRefs[0])}</div>
          </aside>
        </div>
      </section>
    `;
  }

  function renderAnimationViewer(id) {
    const meeting = selectedMeeting(id);
    if (!meeting) return renderMeetingDetail(id);
    const detail = embeddedMeetingDetail(meeting);
    activeMeetingDetail = detail;
    const timeline = detail?.animationTimeline || { meetingId: meeting.id, meetingLabel: meeting.meetingLabel, scenes: [] };
    activeAnimationTimeline = timeline;
    const scenes = timeline.scenes || [];
    const firstScene = scenes[0] || {};
    const actors = [...(timeline.members || []), ...(timeline.staffActors || [{ id: "staff", name: "사무처", role: "보고자", seat: "staff-center" }])];
    const actorItems = actors.map((actor) => `
      <div class="animation-actor ${actor.id === firstScene.memberId ? "speaking" : ""}" data-member-id="${escapeHtml(actor.id || "")}" data-seat="${escapeHtml(actor.seat || "")}">
        ${actor.asset ? `<img src="${escapeHtml(actor.asset)}" alt="${escapeHtml(actor.name)} 캐릭터">` : `<span class="staff-avatar">${escapeHtml((actor.name || "사").slice(0, 1))}</span>`}
        <strong>${escapeHtml(actor.name || "참석자")}</strong><small>${escapeHtml(actor.role || "")}</small>
      </div>
    `).join("");
    const sceneItems = scenes.map((scene, index) => `
      <button class="animation-scene-item" type="button" data-scene-index="${index}">
        <span>${escapeHtml(scene.phase || scene.stageNote || scene.type || "장면")}</span>
        <strong>${escapeHtml(scene.shortText || scene.text || "")}</strong>
        <em>${escapeHtml(scene.speaker || "")}</em>
      </button>
    `).join("");
    return `
      <section class="section-band animation-viewer rich-animation">
        <div class="section-header">
          <div><h2>회의 애니메이션 재현</h2><p class="section-caption">${escapeHtml(timeline.meetingLabel || meeting.meetingLabel)} 개회부터 산회까지 발언 단위로 이동합니다.</p></div>
          <button class="tool-button" type="button" data-close-animation>속기록으로 돌아가기</button>
        </div>
        <div class="animation-layout">
          <div class="animation-stage" aria-label="회의장 재현 무대" data-animation-stage>
            <div class="stage-screen"><span data-stage-label>${escapeHtml(firstScene.stageNote || "위원 입장")}</span><strong data-stage-speaker>${escapeHtml(firstScene.speaker || "회의장")}</strong></div>
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
            <div class="animation-agenda-list">${renderAgendaList(timeline.agendas || [])}</div>
            <h3>장면 타임라인</h3>
            <div class="animation-timeline">${sceneItems}</div>
          </aside>
        </div>
      </section>
    `;
  }

  function renderCommissionerAnalysis() {
    const rows = Array.isArray(data.commissionerActivity) ? data.commissionerActivity : [];
    const cards = rows.map((item) => {
      const topTags = Array.isArray(item.top_tags) ? item.top_tags.map((tag) => text(tag.tag_label || tag.label || tag.name || tag)).filter(Boolean).slice(0, 4) : [];
      return `
        <article class="commissioner-card">
          <h3>${escapeHtml(item.commissioner_name || item.name || "위원")}</h3>
          <p>${escapeHtml(item.character_type || "분석 대기")}</p>
          <div class="kpi-meta">발언 ${formatNumber(item.total_utterances)} · 질문 ${formatNumber(item.question_count)} · 안건 ${formatNumber(item.agenda_count)}</div>
          <div class="tag-list">${topTags.map((tag) => `<span class="status-pill">${escapeHtml(tag)}</span>`).join("")}</div>
        </article>
      `;
    }).join("");
    return `<section class="section-band"><div class="section-header"><div><h2>위원별 분석</h2><p class="section-caption">속기록 활동 지표를 기반으로 위원별 관심 주제를 확인합니다.</p></div></div><div class="commissioner-grid">${cards}</div></section>`;
  }

  function renderAgendaAssistant() {
    return `
      <section class="section-band">
        <div class="section-header"><div><h2>새 안건 준비 도우미</h2><p class="section-caption">안건명과 요약을 입력하면 유사 안건, 예상 쟁점, 준비 체크리스트를 확인합니다.</p></div></div>
        <form class="assistant-form" data-agenda-form>
          <label class="assistant-field"><span>안건명</span><input name="title" type="text" placeholder="예: 안전조치의무 위반 검토"></label>
          <label class="assistant-field"><span>안건 요약</span><textarea name="summary" rows="7" placeholder="사안 개요와 검토 포인트를 붙여 넣으세요."></textarea></label>
          <button class="tool-button assistant-primary-action" type="submit">분석하기</button>
        </form>
        <div class="assistant-result" id="assistant-result"></div>
      </section>
    `;
  }

  function renderAgendaResult(title, summary) {
    const request = normalizeSearch(`${title} ${summary}`);
    const rows = (analysisIndex.searchIndex || [])
      .map((row) => ({ row, score: scoreSearchRow(row, request, "all") }))
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 6)
      .map((item) => item.row);
    const issues = [...new Set(rows.flatMap((row) => row.keywords || []))].slice(0, 12);
    const provisions = [...new Set(rows.flatMap((row) => row.lawArticles || []))].slice(0, 12);
    return `
      <div class="assistant-result-grid">
        <section><h3>유사 안건</h3><ul class="assistant-list">${rows.map((row) => `<li><strong>${escapeHtml(row.title)}</strong><span>${escapeHtml(row.meetingLabel)} · ${escapeHtml((row.targets || []).join(", "))}</span></li>`).join("") || "<li>유사 안건 후보 없음</li>"}</ul></section>
        <section><h3>예상 쟁점</h3><div class="assistant-tag-list">${issues.map((item) => `<span class="status-pill">${escapeHtml(item)}</span>`).join("")}</div></section>
        <section><h3>유사 조항</h3><div class="assistant-tag-list">${provisions.map((item) => `<span class="provision-chip">${escapeHtml(item)}</span>`).join("")}</div></section>
        <section><h3>준비 체크리스트</h3><ul class="assistant-list"><li>대상, 처리 행위, 법적 근거를 안건 첫 장에 분리</li><li>동일 조항의 과거 의결·보고 사례 확인</li><li>위원 질의가 예상되는 사실관계와 증거 위치를 표시</li></ul></section>
      </div>
    `;
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
    if (window.location.protocol !== "file:") history.replaceState(null, "", `#${tabId}`);
  }

  function showMeetingDetail(id) {
    activeMeetingId = id;
    const meetingTab = $("#tab-meeting");
    if (meetingTab) meetingTab.innerHTML = renderMeetingDetail(id);
    setActiveTab("meeting");
  }

  function showAnimationViewer(id, initialUtteranceId = "") {
    activeMeetingId = id;
    const meetingTab = $("#tab-meeting");
    if (meetingTab) meetingTab.innerHTML = renderAnimationViewer(id);
    setActiveTab("meeting");
    const scenes = activeAnimationTimeline?.scenes || [];
    const initialIndex = initialUtteranceId ? scenes.findIndex((scene) => scene.utteranceId === initialUtteranceId) : 0;
    setAnimationScene(Math.max(initialIndex || 0, 0));
  }

  function scrollToUtterance(id) {
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    target.classList.add("focus-flash");
    window.setTimeout(() => target.classList.remove("focus-flash"), 1000);
  }

  function updateLawDetail(index) {
    const panel = $("#law-detail-panel");
    const ref = activeMeetingDetail?.lawReferences?.[Number(index)];
    if (panel && ref) panel.innerHTML = lawDetail(ref);
  }

  function sceneText(scene = {}) {
    const utterance = activeMeetingDetail?.utterances?.find((item) => item.id === scene.utteranceId);
    return utterance?.text || scene.text || scene.shortText || "";
  }

  function setAnimationScene(index) {
    const scenes = activeAnimationTimeline?.scenes || [];
    if (!scenes.length) return;
    activeSceneIndex = Math.max(0, Math.min(index, scenes.length - 1));
    const scene = scenes[activeSceneIndex];
    const stage = $("[data-animation-stage]");
    if (!stage) return;
    const button = $(`.animation-scene-item[data-scene-index="${activeSceneIndex}"]`);
    document.querySelector(".animation-scene-item.active")?.classList.remove("active");
    button?.classList.add("active");
    $("[data-stage-label]", stage).textContent = scene.stageNote || scene.phase || "";
    $("[data-stage-speaker]", stage).textContent = scene.speaker || scene.speakerName || "";
    $("[data-stage-text]", stage).textContent = sceneText(scene);
    document.querySelectorAll(".animation-actor.speaking").forEach((node) => node.classList.remove("speaking"));
    if (scene.memberId) document.querySelector(`.animation-actor[data-member-id="${cssEscape(scene.memberId)}"]`)?.classList.add("speaking");
    button?.scrollIntoView({ block: "nearest" });
  }

  function stopAnimationPlayback() {
    if (!animationTimer) return;
    window.clearInterval(animationTimer);
    animationTimer = null;
    const play = $('[data-animation-action="play"]');
    if (play) play.textContent = "재생";
  }

  function startAnimationPlayback() {
    stopAnimationPlayback();
    const play = $('[data-animation-action="play"]');
    if (play) play.textContent = "일시정지";
    animationTimer = window.setInterval(() => {
      const scenes = activeAnimationTimeline?.scenes || [];
      if (activeSceneIndex >= scenes.length - 1) {
        stopAnimationPlayback();
        return;
      }
      setAnimationScene(activeSceneIndex + 1);
    }, 1800);
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

  function init() {
    setSnapshotTime();
    $("#tab-stats").innerHTML = renderSituationBoard();
    $("#tab-search").innerHTML = renderSearch();
    $("#tab-meeting").innerHTML = renderMeetingDetail();
    $("#tab-commissioner").innerHTML = renderCommissionerAnalysis();
    $("#tab-assistant").innerHTML = renderAgendaAssistant();
    document.querySelectorAll(".nav-item[data-tab]").forEach((button) => button.addEventListener("click", () => setActiveTab(button.dataset.tab)));
  }

  document.addEventListener("click", (event) => {
    const meeting = event.target.closest(".meeting-card[data-meeting-id]");
    if (meeting) showMeetingDetail(meeting.dataset.meetingId);

    const animation = event.target.closest("[data-animation-meeting-id]");
    if (animation) showAnimationViewer(animation.dataset.animationMeetingId, animation.dataset.animationUtteranceId || "");

    const closeAnimation = event.target.closest("[data-close-animation]");
    if (closeAnimation && activeMeetingId) {
      stopAnimationPlayback();
      showMeetingDetail(activeMeetingId);
    }

    const agendaJump = event.target.closest("[data-utterance-target]");
    if (agendaJump) scrollToUtterance(agendaJump.dataset.utteranceTarget);

    const lawReference = event.target.closest("[data-law-ref-index]");
    if (lawReference) updateLawDetail(lawReference.dataset.lawRefIndex);

    const scene = event.target.closest(".animation-scene-item[data-scene-index]");
    if (scene) setAnimationScene(Number(scene.dataset.sceneIndex || 0));

    const animationAction = event.target.closest("[data-animation-action]");
    if (animationAction) handleAnimationAction(animationAction.dataset.animationAction);

    const searchMeeting = event.target.closest("[data-search-meeting-id]");
    if (searchMeeting) {
      showMeetingDetail(searchMeeting.dataset.searchMeetingId);
      window.setTimeout(() => scrollToUtterance(searchMeeting.dataset.searchUtteranceId), 80);
    }

    const searchChip = event.target.closest("[data-search-chip]");
    if (searchChip) $("#tab-search").innerHTML = renderSearch({ query: searchChip.dataset.searchChip });

    const clearFilter = event.target.closest("#clear-filter");
    if (clearFilter) setActiveTab("stats");
  });

  document.addEventListener("submit", (event) => {
    const searchForm = event.target.closest("[data-integrated-search-form]");
    if (searchForm) {
      event.preventDefault();
      const formData = new FormData(searchForm);
      $("#tab-search").innerHTML = renderSearch({
        query: formData.get("q"),
        facet: formData.get("facet") || "all",
        includeProcedural: formData.get("includeProcedural") === "on",
      });
      return;
    }

    const form = event.target.closest("[data-agenda-form]");
    if (!form) return;
    event.preventDefault();
    const formData = new FormData(form);
    const resultNode = $("#assistant-result");
    if (resultNode) resultNode.innerHTML = renderAgendaResult(formData.get("title"), formData.get("summary"));
  });

  init();
})();
