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
    meeting: "회의별 속기록 조회",
    commissioner: "위원별 대시보드",
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
    const items = [
      { label: "총 회의 수", value: totalMeetings },
      { label: "총 안건 수", value: totalAgendas },
      { label: "회의당 평균 안건 수", value: totalMeetings ? Math.round(totalAgendas / totalMeetings * 10) / 10 : 0 },
      { label: "심의·의결 / 보고", value: `${decision} / ${report}`, meta: `${formatPercent(decision / Math.max(totalAgendas, 1))} / ${formatPercent(report / Math.max(totalAgendas, 1))}` },
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
            <div class="year-flow-meta">의결 ${formatNumber(row.decision_agendas)} · 보고 ${formatNumber(row.report_agendas)}</div>
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

  function renderSituationBoard() {
    const overview = overviewRow();
    const totalAgendas = number(overview.agenda_items_total);
    const globalStats = analysisIndex.globalStats || {};
    return `
      <section class="section-band situation-board redesigned-board">
        <div class="section-header">
          <div>
            <h2>회의 운영 상황판</h2>
            <p class="section-caption">회의 흐름, 안건 처리 비율, 공개 여부, 주요 대상과 조항을 간결하게 정리했습니다.</p>
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
          <article class="ops-panel"><h3>실무 쟁점 주제</h3>${topicBars(data.topicDistribution || [])}</article>
          <article class="ops-panel"><h3>자주 등장한 관련 조항</h3>${rankList(globalStats.topArticles || [], "감지된 조항 없음")}</article>
        </div>
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
          <button class="small-button" type="button" data-search-meeting-id="${escapeHtml(row.meetingId)}" data-search-utterance-id="${escapeHtml(row.startUtteranceId || "")}">속기록에서 보기</button>
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
    if (!meeting) return `<section class="section-band"><h2>회의별 속기록 조회</h2><p class="section-caption">선택된 회의가 없습니다.</p></section>`;
    const detail = embeddedMeetingDetail(meeting);
    activeMeetingDetail = detail;
    const lawRefs = detail?.lawReferences || [];
    const overview = detail?.overview || {};
    const attendees = Array.isArray(overview.attendees) ? overview.attendees : [];
    return `
      <section class="section-band meeting-detail">
        <div class="section-header">
          <div><h2>회의별 속기록 조회</h2><p class="section-caption">${escapeHtml(meeting.meetingLabel)} · ${escapeHtml(meeting.date)}</p></div>
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

  function commissionerRoleTone(role = "", route = "") {
    if (/부위원장/.test(role)) return "vice";
    if (/위원장/.test(role)) return "chair";
    if (/상임|당연/.test(route)) return "executive";
    return "member";
  }

  function commissionerRoleRank(item = {}) {
    if (item.roleTone === "chair") return 0;
    if (item.roleTone === "vice") return 1;
    if (item.roleTone === "executive") return 2;
    return 3;
  }

  function sortCommissionerCards(left, right) {
    return commissionerRoleRank(left) - commissionerRoleRank(right) || String(left.name || "").localeCompare(String(right.name || ""), "ko");
  }

  function commissionerTags(activity = {}, character = {}) {
    const characterTags = Array.isArray(character.top_tags) ? character.top_tags : [];
    const activityTags = Array.isArray(activity.top_tags) ? activity.top_tags.map((tag) => text(tag.tag_label || tag.label || tag.name || tag)) : [];
    return (characterTags.length ? characterTags : activityTags).filter(Boolean).slice(0, 4);
  }

  function commissionerTagDetails(activity = {}, character = {}) {
    const characterTags = Array.isArray(character.top_tags)
      ? character.top_tags.map((tag) => ({ label: text(tag.tag_label || tag.label || tag.name || tag), count: Number.isFinite(Number(tag.utterance_count)) ? Number(tag.utterance_count) : null }))
      : [];
    const activityTags = Array.isArray(activity.top_tags)
      ? activity.top_tags.map((tag) => ({ label: text(tag.tag_label || tag.label || tag.name || tag), count: Number.isFinite(Number(tag.utterance_count)) ? Number(tag.utterance_count) : null }))
      : [];
    const activityCountByLabel = new Map(activityTags.map((tag) => [tag.label, tag.count]));
    const source = characterTags.length ? characterTags : activityTags;
    return source.filter((tag) => tag.label).slice(0, 4).map((tag) => ({
      label: tag.label,
      count: tag.count ?? activityCountByLabel.get(tag.label) ?? null,
    }));
  }

  const GENERIC_COMMISSIONER_QUESTION_TAGS = new Set(["절차·법리·근거 검토", "사실관계·증거 확인"]);
  const COMMISSIONER_TAG_KEYWORDS = {
    "AI·데이터 활용 거버넌스": ["AI", "인공지능", "데이터", "가명", "모델", "활용", "자동화"],
    "공공부문 책임성 강조": ["공공", "기관", "행정", "책임", "이행", "담당"],
    "기술·보안 통제 점검": ["보안", "안전", "접속", "접근", "권한", "암호", "암호화", "유출", "공격", "취약", "통제", "로그"],
    "사업자 부담·산업 맥락 고려": ["사업자", "기업", "부담", "산업", "시장", "서비스", "영업", "비용"],
    "정보주체 권리·피해 관점": ["정보주체", "이용자", "소비자", "피해", "권리", "구제", "손해배상"],
    "재발방지·개선·예방 지향": ["개선", "재발", "예방", "조치", "이행", "점검", "계획", "사후"],
    "처분 실효성·제재수준 점검": ["처분", "제재", "과징금", "과태료", "시정", "수준", "실효"],
    "절차·법리·근거 검토": ["법", "법적", "법리", "근거", "조항", "해석", "절차", "원칙", "기준"],
    "사실관계·증거 확인": ["사실", "증거", "자료", "확인", "기록", "경위"],
  };
  const COMMISSIONER_TERM_STOPWORDS = new Set(["위원", "위원장", "비상임위원", "상임위원", "관점", "문체", "역할", "회의", "안건", "정책", "확인", "질문", "검토", "정리", "중심", "유형", "분석", "흐름", "실제", "가능", "어떤", "어떻게", "있는지", "없는지"]);

  function commissionerQuestionTags(topTagDetails = [], activity = {}, character = {}) {
    const characterTags = Array.isArray(character.top_tags) ? character.top_tags.map((tag) => text(tag.tag_label || tag.label || tag.name || tag)) : [];
    const activityTags = Array.isArray(activity.top_tags) ? activity.top_tags.map((tag) => text(tag.tag_label || tag.label || tag.name || tag)) : [];
    const labels = [...topTagDetails.map((tag) => tag.label), ...characterTags, ...activityTags].filter(Boolean);
    const unique = [...new Set(labels)];
    const specific = unique.filter((label) => !GENERIC_COMMISSIONER_QUESTION_TAGS.has(label));
    return (specific.length ? specific : unique).slice(0, 2);
  }

  function commissionerKeywordTerms(activity = {}, character = {}, topTagDetails = [], meetingRole = "") {
    const characterTags = Array.isArray(character.top_tags) ? character.top_tags.map((tag) => text(tag.tag_label || tag.label || tag.name || tag)) : [];
    const activityTags = Array.isArray(activity.top_tags) ? activity.top_tags.map((tag) => text(tag.tag_label || tag.label || tag.name || tag)) : [];
    const tagLabels = [...topTagDetails.map((tag) => tag.label), ...characterTags, ...activityTags].filter(Boolean);
    const sources = [
      meetingRole,
      character.meeting_function,
      activity.meeting_function,
      character.characterType,
      character.character_type,
      activity.character_type,
      character.core_motif,
      activity.core_motif,
      ...tagLabels,
      ...tagLabels.flatMap((label) => COMMISSIONER_TAG_KEYWORDS[label] || []),
    ];
    const terms = new Set();
    for (const source of sources) {
      for (const token of String(source || "").match(/[가-힣A-Za-z0-9]{2,}/g) || []) {
        if (!COMMISSIONER_TERM_STOPWORDS.has(token)) terms.add(token);
      }
    }
    return [...terms];
  }

  function commissionerQuestionPerspective(value = "") {
    const raw = text(value).replace(/[.。!?！？]+$/, "");
    if (!raw) return "";
    if (raw.includes("관점에서")) {
      return raw
        .replace(/관점에서\s*/, "관점으로 ")
        .replace(/을 정리한다$/, "을 정리하는 흐름")
        .replace(/를 정리한다$/, "를 정리하는 흐름")
        .replace(/을 확인한다$/, "을 확인하는 흐름")
        .replace(/를 확인한다$/, "를 확인하는 흐름")
        .replace(/한다$/, "하는 흐름")
        .replace(/는다$/, "는 흐름")
        .replace(/다$/, "는 흐름");
    }
    return raw
      .replace(/을 동시에 묻는다$/, "을 동시에 묻는 관점")
      .replace(/를 동시에 묻는다$/, "를 동시에 묻는 관점")
      .replace(/을 정리한다$/, "을 정리하는 관점")
      .replace(/를 정리한다$/, "를 정리하는 관점")
      .replace(/을 연결한다$/, "을 연결하는 관점")
      .replace(/를 연결한다$/, "를 연결하는 관점")
      .replace(/을 선명하게 잡는다$/, "을 선명하게 잡는 관점")
      .replace(/를 선명하게 잡는다$/, "를 선명하게 잡는 관점")
      .replace(/을 회의 안으로 가져온다$/, "을 회의 안으로 가져오는 관점")
      .replace(/를 회의 안으로 가져온다$/, "를 회의 안으로 가져오는 관점")
      .replace(/의 현실성을 찌른다$/, "의 현실성을 검증하는 관점")
      .replace(/의 단단함을 검토한다$/, "의 단단함을 검토하는 관점")
      .replace(/을 밀도 있게 묻는다$/, "을 밀도 있게 묻는 관점")
      .replace(/를 밀도 있게 묻는다$/, "를 밀도 있게 묻는 관점")
      .replace(/한다$/, "하는 관점")
      .replace(/는다$/, "는 관점")
      .replace(/다$/, "는 관점");
  }

  function commissionerIsQuestionLike(value = "") {
    return commissionerIsDirectQuestionLike(value) || /질문|문의/.test(value);
  }

  function commissionerIsDirectQuestionLike(value = "") {
    return /[?？]|습니까|입니까|됩니까|합니까|아닙니까|맞습니까|있습니까|없습니까|겠습니까|주십니까|하십니까|나요|지요|죠|여쭤봅니다|궁금합니다|확인해 주시기 바랍니다|설명해 주시기 바랍니다|답변해 주시기 바랍니다|말씀해 주시기 바랍니다|인지 확인|는지 확인|인지 설명|는지 설명|인지 답변|는지 답변|맞는지/.test(value);
  }

  function commissionerSentenceChunks(value = "") {
    const normalized = text(value).replace(/\s+/g, " ");
    if (!normalized) return [];
    return (normalized.match(/[^.!?？。]+[.!?？。]?/g) || [normalized])
      .map((chunk) => chunk.trim())
      .filter(Boolean);
  }

  function commissionerQuestionExcerpt(value = "") {
    const normalized = text(value).replace(/\s+/g, " ");
    if (!normalized) return "";
    const chunks = commissionerSentenceChunks(normalized);
    const directMatches = chunks.filter((chunk) => commissionerIsDirectQuestionLike(chunk));
    if (directMatches.length) return directMatches.slice(0, 2).join(" ");
    const matches = chunks.map((chunk) => chunk.trim()).filter((chunk) => chunk && commissionerIsQuestionLike(chunk));
    if (!matches.length) return commissionerIsQuestionLike(normalized) ? normalized : "";
    return matches.slice(0, 2).join(" ");
  }

  function commissionerShortQuestionText(value = "", limit = 150) {
    const normalized = text(value).replace(/\s+/g, " ");
    if (normalized.length <= limit) return normalized;
    const slice = normalized.slice(0, Math.max(limit - 1, 0));
    const cut = Math.max(slice.lastIndexOf(" "), slice.lastIndexOf(","), slice.lastIndexOf("，"));
    return `${slice.slice(0, cut > 50 ? cut : limit - 1).trim()}…`;
  }

  function commissionerTrimQuestionLead(value = "", terms = []) {
    let normalized = text(value).replace(/\s+/g, " ");
    normalized = normalized.replace(/^(그런데|그리고|그래서|다만|또한|한편)\s*/, "");
    let bestIndex = -1;
    for (const term of terms) {
      const needle = text(term);
      if (needle.length < 2) continue;
      const index = normalized.indexOf(needle);
      if (index > 8 && (bestIndex === -1 || index < bestIndex)) bestIndex = index;
    }
    if (bestIndex > 8 && bestIndex < normalized.length * 0.45) normalized = normalized.slice(bestIndex);
    return normalized.trim();
  }

  function commissionerSummarizeQuestion(value = "", terms = []) {
    const chunks = commissionerSentenceChunks(value);
    const pool = chunks.filter(commissionerIsDirectQuestionLike);
    const candidates = pool.length ? pool : chunks.filter(commissionerIsQuestionLike);
    if (!candidates.length) return commissionerShortQuestionText(value);
    const ranked = candidates
      .map((chunk, order) => {
        const haystack = chunk.toLowerCase();
        const matched = terms.filter((term) => haystack.includes(String(term).toLowerCase())).length;
        const score = matched * 12 + (/[?？]/.test(chunk) ? 8 : 0) + (chunk.length >= 35 ? 4 : 0) - Math.max(chunk.length - 170, 0) / 12;
        return { chunk, order, score };
      })
      .sort((left, right) => right.score - left.score || left.order - right.order)
      .slice(0, 2)
      .sort((left, right) => left.order - right.order)
      .map((item) => commissionerTrimQuestionLead(item.chunk, terms));
    return commissionerShortQuestionText(ranked.join(" "), 150);
  }

  function commissionerUtterancesBySpeaker() {
    const rows = analysisIndex.meetings && typeof analysisIndex.meetings === "object" ? Object.values(analysisIndex.meetings) : [];
    const bySpeaker = new Map();
    for (const detail of rows) {
      const utterances = Array.isArray(detail?.utterances) ? detail.utterances : [];
      const meeting = detail?.meeting || {};
      const agendaById = new Map((Array.isArray(detail?.agendas) ? detail.agendas : []).map((agenda) => [agenda.id, agenda]));
      for (const utterance of utterances) {
        const speakerName = text(utterance?.speakerName || utterance?.speaker_name || "");
        if (!speakerName) continue;
        const agenda = agendaById.get(utterance.agendaId) || {};
        const enriched = {
          ...utterance,
          meetingId: text(detail?.meetingId || meeting.id || detail?.id || ""),
          meetingLabel: text(meeting.meetingLabel || meeting.label || detail?.meetingLabel || detail?.title || meeting.title || ""),
          date: text(meeting.date || detail?.date || ""),
          agendaTitle: text(agenda.title || utterance.sectionTitle || ""),
        };
        if (!bySpeaker.has(speakerName)) bySpeaker.set(speakerName, []);
        bySpeaker.get(speakerName).push(enriched);
      }
    }
    return bySpeaker;
  }

  function commissionerScoreQuestionCandidate(candidate = {}, terms = []) {
    const value = candidate.text || "";
    if (!value || !commissionerIsQuestionLike(value)) return -Infinity;
    let score = 100;
    if (/[?？]/.test(value)) score += 18;
    if (/확인|설명|답변|말씀|질문|문의/.test(value)) score += 12;
    if (/위원/.test(`${candidate.speakerRole || ""} ${candidate.speaker || ""}`)) score += 8;
    if (/개회선언|폐회|공개여부|성원보고/.test(candidate.sectionTitle || "")) score -= 50;
    const haystack = value.toLowerCase();
    const matchedTerms = new Set(terms.filter((term) => haystack.includes(String(term).toLowerCase())));
    score += Math.min(matchedTerms.size * 12, 84);
    if (value.length >= 35 && value.length <= 420) score += 18;
    if (value.length < 20) score -= 28;
    if (value.length > 650) score -= Math.min(Math.floor((value.length - 650) / 30), 40);
    return score;
  }

  function commissionerTranscriptRepresentativeQuestion(activity = {}, character = {}, topTagDetails = [], meetingRole = "", utterances = []) {
    const terms = commissionerKeywordTerms(activity, character, topTagDetails, meetingRole);
    const best = utterances
      .map((utterance, index) => {
        const originalText = text(utterance.text);
        const candidate = { ...utterance, text: commissionerQuestionExcerpt(originalText), originalText, order: index };
        return { candidate, score: commissionerScoreQuestionCandidate(candidate, terms) };
      })
      .filter((item) => Number.isFinite(item.score))
      .sort((left, right) => right.score - left.score || left.candidate.order - right.candidate.order)[0]?.candidate;
    if (!best) return { text: "", originalText: "", source: null };
    return {
      text: commissionerSummarizeQuestion(best.text, terms) || best.text,
      originalText: best.originalText || best.text,
      source: {
        meetingId: best.meetingId || "",
        utteranceId: best.id || "",
        agendaId: best.agendaId || "",
        meetingLabel: best.meetingLabel || "",
        date: best.date || "",
        agendaTitle: best.agendaTitle || "",
      },
    };
  }

  function commissionerRepresentativeQuestion(activity = {}, character = {}, topTagDetails = [], meetingRole = "", utterances = []) {
    const transcriptQuestion = commissionerTranscriptRepresentativeQuestion(activity, character, topTagDetails, meetingRole, utterances);
    if (transcriptQuestion.text) return transcriptQuestion;
    const explicitQuestion = text(activity?.representative_question || character?.representative_question || "");
    if (explicitQuestion) return { text: explicitQuestion, originalText: "", source: null };

    const tags = commissionerQuestionTags(topTagDetails, activity, character);
    const tagText = tags.length ? tags.map((tag) => `"${tag}"`).join(", ") : "핵심";
    const perspective = commissionerQuestionPerspective(meetingRole)
      || text(character?.characterType || character?.character_type || activity?.character_type || character?.core_motif || activity?.core_motif || "");
    if (perspective) return { text: `${perspective}에서 이 안건의 ${tagText} 쟁점을 어떤 사실과 근거로 확인해야 합니까?`, originalText: "", source: null };
    return { text: tags.length ? `${tagText} 쟁점을 어떤 사실과 근거로 확인해야 합니까?` : "", originalText: "", source: null };
  }

  function commissionerCardModel(member = {}, activity = {}, character = {}, representativeUtterances = []) {
    const name = text(member.name || activity?.commissioner_name || activity?.name || character?.name || "위원");
    const role = text(member.role_current || member.term_role || character?.role || activity?.role_current || "위원");
    const route = text(member.recommendation_route || member.appointment_route || activity?.recommendation_route || "");
    const roleTone = commissionerRoleTone(role, route);
    const topTagDetails = commissionerTagDetails(activity, character);
    const meetingRole = text(character?.meetingFunction || character?.meeting_function || activity?.meeting_function || "");
    const representativeQuestion = commissionerRepresentativeQuestion(activity, character, topTagDetails, meetingRole, representativeUtterances);
    return {
      name,
      role,
      roleTone,
      isExecutive: roleTone === "chair" || roleTone === "vice" || roleTone === "executive",
      generation: text(member.generation || character?.generation || ""),
      characterType: text(character?.characterType || character?.character_type || activity?.character_type || "분석 대기"),
      meetingRole,
      questionStyle: text(character?.voiceDirection || character?.voice_direction || activity?.voice_direction || ""),
      representativeQuestion: representativeQuestion.text,
      representativeQuestionOriginal: representativeQuestion.originalText || null,
      representativeQuestionSource: representativeQuestion.source,
      asset: text(character?.asset || ""),
      termText: text(member.official_term_text || ""),
      affiliation: route,
      recommendationRoute: route,
      appearances: member.appearances,
      totalUtterances: activity?.total_utterances,
      questionCount: activity?.question_count,
      agendaCount: activity?.agenda_count,
      meetingCount: activity?.meeting_count,
      topTags: commissionerTags(activity, character),
      topTagDetails,
    };
  }

  function commissionerMetrics(item = {}) {
    const metrics = [];
    if (Number.isFinite(Number(item.totalUtterances))) metrics.push(`발언 ${formatNumber(item.totalUtterances)}`);
    if (Number.isFinite(Number(item.questionCount))) metrics.push(`질문 ${formatNumber(item.questionCount)}`);
    if (Number.isFinite(Number(item.agendaCount))) metrics.push(`안건 ${formatNumber(item.agendaCount)}`);
    if (Number.isFinite(Number(item.meetingCount))) metrics.push(`회의 ${formatNumber(item.meetingCount)}`);
    if (Number.isFinite(Number(item.appearances))) metrics.push(`출석 ${formatNumber(item.appearances)}`);
    return metrics;
  }

  function commissionerQuestionSourceLabel(source = {}) {
    if (!source || typeof source !== "object") return "";
    return [source.date, source.meetingLabel, source.agendaTitle].filter(Boolean).map(text).join(" · ");
  }

  function commissionerCard(item = {}) {
    const classes = ["commissioner-card", `commissioner-card-${item.roleTone || "member"}`, item.isExecutive ? "commissioner-card-executive" : ""].filter(Boolean).join(" ");
    const portrait = item.asset
      ? `<div class="commissioner-portrait"><img src="${escapeHtml(item.asset)}" alt="${escapeHtml(item.name)} 캐릭터"></div>`
      : `<div class="commissioner-portrait commissioner-portrait-empty">${escapeHtml(item.name.slice(0, 1))}</div>`;
    const badges = [item.role, item.isExecutive ? "상임·당연직" : "", item.generation].filter(Boolean);
    const affiliation = text(item.affiliation || item.organization || item.recommendationRoute || item.appointmentRoute || "");
    const facts = [item.termText ? `임기 ${item.termText}` : ""].filter(Boolean);
    const metrics = commissionerMetrics(item);
    const insights = [
      item.meetingRole ? { label: "회의 내 역할", value: item.meetingRole } : null,
      item.questionStyle ? { label: "질문 스타일", value: item.questionStyle } : null,
      item.representativeQuestion ? { label: "대표 질문", value: item.representativeQuestion, wide: true } : null,
    ].filter(Boolean);
    return `
      <article class="${classes}">
        ${portrait}
        <div class="commissioner-card-body">
          <div class="commissioner-card-topline">${badges.map((badge) => `<span>${escapeHtml(badge)}</span>`).join("")}</div>
          <h3>${escapeHtml(item.name)}${affiliation ? `<span class="commissioner-affiliation">${escapeHtml(affiliation)}</span>` : ""}</h3>
          <p>${escapeHtml(item.characterType)}</p>
          ${facts.length ? `<div class="commissioner-facts">${facts.map((fact) => `<span>${escapeHtml(fact)}</span>`).join("")}</div>` : ""}
          ${metrics.length ? `<div class="kpi-meta">${metrics.join(" · ")}</div>` : ""}
          ${item.topTagDetails.length ? `
            <div class="commissioner-tag-section">
              <strong>발언 성향</strong>
              <div class="tag-list">${item.topTagDetails.map((tag) => `<span class="status-pill">${escapeHtml(tag.label)}${Number.isFinite(Number(tag.count)) ? ` ${formatNumber(tag.count)}건` : ""}</span>`).join("")}</div>
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

  function commissionerGroup(title, caption, rows = []) {
    const cards = rows.map(commissionerCard).join("");
    if (!cards) return "";
    return `
      <div class="commissioner-group">
        <div class="section-header compact"><div><h3>${escapeHtml(title)}</h3><p class="section-caption">${escapeHtml(caption)}</p></div></div>
        <div class="commissioner-grid">${cards}</div>
      </div>
    `;
  }

  function renderCommissionerAnalysis() {
    const characters = Array.isArray(analysisIndex.characterAssets) ? analysisIndex.characterAssets : [];
    const characterByName = new Map(characters.map((item) => [item.name, item]));
    const activityByName = new Map((Array.isArray(data.commissionerActivity) ? data.commissionerActivity : [])
      .map((item) => [item.commissioner_name || item.name, item]));
    const utterancesBySpeaker = commissionerUtterancesBySpeaker();
    const secondRows = Array.isArray(data.secondCommissioners) ? data.secondCommissioners : [];
    const secondNames = new Set(secondRows.map((item) => item.name));
    const currentSecond = secondRows
      .filter((item) => item.generation === "2기" && /current|현직/.test(`${item.term_status || ""} ${item.commissioner_status || ""} ${item.display_status || ""}`) && !/former|전직|교체/.test(`${item.term_status || ""} ${item.commissioner_status || ""} ${item.display_status || ""}`))
      .map((item) => commissionerCardModel(item, activityByName.get(item.name), characterByName.get(item.name), utterancesBySpeaker.get(item.name) || []))
      .sort(sortCommissionerCards);
    const formerSecond = secondRows
      .filter((item) => item.generation === "2기" && /former|전직|교체/.test(`${item.term_status || ""} ${item.commissioner_status || ""} ${item.display_status || ""}`))
      .map((item) => commissionerCardModel(item, activityByName.get(item.name), characterByName.get(item.name), utterancesBySpeaker.get(item.name) || []))
      .sort(sortCommissionerCards);
    const firstGeneration = characters
      .filter((item) => item.status === "former" && !secondNames.has(item.name))
      .map((item) => commissionerCardModel({}, activityByName.get(item.name), item, utterancesBySpeaker.get(item.name) || []))
      .sort(sortCommissionerCards);
    return `
      <section class="section-band commissioner-dashboard">
        <div class="section-header"><div><h2>위원별 대시보드</h2><p class="section-caption">현재 2기 위원을 먼저 확인하고, 캐릭터 프로필과 회의 활동 지표를 함께 봅니다.</p></div></div>
        ${commissionerGroup("현재 2기 위원 명단", "위원장과 부위원장은 상임·당연직 카드 톤으로 구분했습니다.", currentSecond)}
        ${commissionerGroup("2기 교체·전직 위원", "2기 중 교체되었거나 전직 상태인 위원입니다.", formerSecond)}
        ${commissionerGroup("1기 위원", "출범기와 1기 활동 위원 캐릭터를 모았습니다.", firstGeneration)}
      </section>
    `;
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
