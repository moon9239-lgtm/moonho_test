(function () {
  const data = window.PIPC_DASHBOARD_DATA || {};
  const detailIndex = window.PIPC_MEETING_DETAIL_INDEX || {};
  let activeMeetingId = null;
  let activeMeetingDetail = null;

  const tabTitles = {
    stats: "전체회의 통계·동향 대시보드",
    search: "안건 통합검색",
    meeting: "회의 상세 탐색",
    commissioner: "위원별 분석",
    assistant: "신규 안건 준비 도우미",
  };

  const keyTokens = ["접속기록", "안전조치", "유출", "과징금", "공표", "AI", "국외이전", "처분", "동의"];
  const issueByToken = {
    접속기록: "접속기록 생성, 보관 기간, 위변조 방지 조치가 쟁점입니다.",
    안전조치: "접근통제, 암호화, 접속기록 관리 등 보호조치 수준을 확인해야 합니다.",
    유출: "유출 원인, 통지 여부, 추가 피해 방지 조치가 핵심입니다.",
    과징금: "위반 기간, 매출 기준, 감경·가중 사유를 준비해야 합니다.",
    공표: "공표 요건과 공익상 필요성을 별도로 검토해야 합니다.",
    AI: "자동화 처리, 설명 가능성, 데이터 활용 범위를 확인해야 합니다.",
    국외이전: "이전받는 자, 이전 국가, 보유 기간, 동의 절차가 쟁점입니다.",
    처분: "시정명령, 과징금, 공표 등 처분 조합의 균형을 점검해야 합니다.",
    동의: "고지 항목, 선택권, 철회 절차가 충분했는지 확인해야 합니다.",
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
    return `${Math.round(number(value) * 1000) / 10}%`;
  }

  function text(value) {
    if (value == null) return "";
    if (Array.isArray(value)) return value.map(text).filter(Boolean).join(" ");
    if (typeof value === "object") return Object.values(value).map(text).filter(Boolean).join(" ");
    return String(value);
  }

  function firstText(...values) {
    return values.map(text).find(Boolean) || "";
  }

  function compact(value) {
    return text(value).toLowerCase().replace(/\s+/g, "");
  }

  function findKeyTokens(value) {
    const source = compact(value);
    return keyTokens.filter((token) => source.includes(token.toLowerCase()));
  }

  function tokenize(value) {
    const tokens = new Set();
    const words = text(value).toLowerCase().match(/[a-z0-9가-힣]+/g) || [];
    for (const word of words) {
      if (word.length >= 2) tokens.add(word);
    }
    for (const token of findKeyTokens(value)) tokens.add(token);
    return tokens;
  }

  function normalizePath(value) {
    const path = String(value || "").replace(/\\/g, "/");
    if (!path || /^(https?:|file:|\/|\.\/|\.\.\/)/.test(path)) return path;
    return `../${path}`;
  }

  function normalizeTranscript(item, index) {
    const date = item.date || item.meeting_date || "";
    const year = number(item.year || item.meeting_year || date.slice(0, 4));
    const meetingNo = item.meetingNo ?? item.meeting_number ?? "";
    const fallbackId = `${date}-${meetingNo || index}`;
    return {
      id: String(item.id || item.meeting_id || fallbackId),
      year,
      date,
      meetingNo,
      meetingLabel: item.meetingLabel || item.meeting_label || (meetingNo ? `${year}년 제${meetingNo}회` : `${year}년`),
      title: item.title || item.transcript_title || item.meeting_title || "전체회의",
      path: normalizePath(item.path || item.transcript_path || item.raw_md_path || ""),
      content: item.content || "",
    };
  }

  function transcripts() {
    return Array.isArray(data.meetingTranscripts) ? data.meetingTranscripts.map(normalizeTranscript) : [];
  }

  function setSnapshotTime() {
    const node = $("#snapshot-time");
    if (!node) return;
    const generatedAt = data.generatedAt || "";
    const date = new Date(generatedAt);
    node.textContent = Number.isNaN(date.getTime())
      ? "업데이트 기준 확인 필요"
      : new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(date);
  }

  function renderKpis() {
    const yearlyRows = data.yearlyStats?.length ? data.yearlyStats : data.meetingYearly || [];
    const overview = Array.isArray(data.overviewKpis) ? data.overviewKpis[0] || {} : {};
    const totalMeetings = number(overview.meetings_total) || yearlyRows.reduce((sum, row) => sum + number(row.meetings ?? row.meeting_count), 0);
    const totalAgendas = number(overview.agenda_items_total) || yearlyRows.reduce((sum, row) => sum + number(row.agenda_items ?? row.agenda_count), 0);
    const decision = number(overview.decision_agendas_total) || yearlyRows.reduce((sum, row) => sum + number(row.decision_agendas), 0);
    const report = number(overview.report_agendas_total) || yearlyRows.reduce((sum, row) => sum + number(row.report_agendas), 0);
    const utterances = number(overview.utterances_total);
    const linkedUtterances = number(overview.utterances_with_agenda);
    const average = totalMeetings ? Math.round((totalAgendas / totalMeetings) * 10) / 10 : 0;
    return [
      { label: "총 회의 수", value: totalMeetings },
      { label: "총 안건 수", value: totalAgendas },
      { label: "회의당 평균 안건 수", value: average },
      { label: "심의·의결 / 보고", value: `${decision} / ${report}`, meta: `${formatPercent(decision / totalAgendas)} / ${formatPercent(report / totalAgendas)}` },
      { label: "안건 연결 발언", value: linkedUtterances || utterances, meta: formatPercent((linkedUtterances || utterances) / utterances) },
      { label: "속기록 보유", value: transcripts().length },
    ].map((item) => `
      <article class="kpi-card">
        <div class="kpi-label">${escapeHtml(item.label)}</div>
        <div class="kpi-value">${typeof item.value === "string" ? escapeHtml(item.value) : formatNumber(item.value)}</div>
        ${item.meta ? `<div class="kpi-meta">${escapeHtml(item.meta)}</div>` : ""}
      </article>
    `).join("");
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
    const meetingCards = transcripts().slice(0, 24).map(meetingCard).join("");
    const majorCount = Array.isArray(data.majorPenaltyCases) ? data.majorPenaltyCases.length : 0;
    const overview = Array.isArray(data.overviewKpis) ? data.overviewKpis[0] || {} : {};
    const totalAgendas = number(overview.agenda_items_total);
    const split = [
      { label: "심의·의결", value: number(overview.decision_agendas_total), tone: "blue" },
      { label: "보고", value: number(overview.report_agendas_total), tone: "lavender" },
      { label: "기타", value: number(overview.unspecified_agendas_total), tone: "slate" },
      { label: "공개", value: number(overview.public_agendas_total), tone: "blue" },
      { label: "비공개", value: number(overview.private_agendas_total), tone: "coral" },
    ];
    const topics = (Array.isArray(data.topicDistribution) ? data.topicDistribution : []).slice(0, 7);
    const topicMax = Math.max(...topics.map((item) => number(item.agenda_count)), 1);
    return `
      <section class="section-band situation-board redesigned-board">
        <div class="section-header">
          <div>
            <h2>회의 운영 상황판</h2>
            <p class="section-caption">심의·의결, 보고, 공개 여부, 발언 연결, 제재 신호를 한 화면에서 확인합니다.</p>
          </div>
          <div class="update-note">업데이트 기준: ${escapeHtml(data.generatedAt || "확인 필요")}</div>
        </div>
        <div class="kpi-grid">${renderKpis()}</div>
        <div class="operations-grid">
          <article class="ops-panel">
            <h3>안건 처리·공개 비율</h3>
            <div class="topic-bars">
              ${split.map((item) => `
                <div class="topic-bar-row">
                  <div class="topic-label">${escapeHtml(item.label)}</div>
                  <div class="topic-track"><span class="topic-fill tone-${item.tone === "coral" ? 2 : item.tone === "lavender" ? 1 : 0}" style="width:${Math.max(item.value / Math.max(totalAgendas, 1) * 100, 2)}%"></span></div>
                  <div class="topic-value">${formatNumber(item.value)}건</div>
                </div>
              `).join("")}
            </div>
          </article>
          <article class="ops-panel">
            <h3>실무 쟁점 주제</h3>
            <div class="topic-bars">
              ${topics.map((item, index) => `
                <div class="topic-bar-row">
                  <div class="topic-label">${escapeHtml(item.label)}</div>
                  <div class="topic-track"><span class="topic-fill tone-${index % 3}" style="width:${Math.max(number(item.agenda_count) / topicMax * 100, 2)}%"></span></div>
                  <div class="topic-value">${formatNumber(item.agenda_count)}</div>
                </div>
              `).join("")}
            </div>
          </article>
        </div>
        <div class="signal-strip"><strong>제재·처분 신호 ${formatNumber(majorCount)}건</strong></div>
        <div class="meeting-card-grid">${meetingCards}</div>
      </section>
    `;
  }

  function renderSearch() {
    const cases = Array.isArray(data.majorPenaltyCases) ? data.majorPenaltyCases.slice(0, 50) : [];
    const rows = cases.map((item) => `
      <article class="commissioner-card">
        <h3>${escapeHtml(item.agenda_title || item.case_title || item.target_name || "안건")}</h3>
        <p>${escapeHtml(item.sanction_type || item.decision_type || "처분 정보 확인 필요")}</p>
        <div class="kpi-meta">${escapeHtml(item.amount_text || item.amount_total_krw || "")}</div>
      </article>
    `).join("");
    return `
      <section class="section-band">
        <div class="section-header">
          <div>
            <h2>안건 통합검색</h2>
            <p class="section-caption">현재 파일 기반 보기에서는 주요 처분 안건을 먼저 보여줍니다.</p>
          </div>
        </div>
        <div class="commissioner-grid">${rows}</div>
      </section>
    `;
  }

  function extractLawReferences(transcriptText) {
    const matches = transcriptText.match(/(?:개인정보\s*보호법|정보통신망법|신용정보법)?\s*제\s*\d+\s*조(?:의\s*\d+)?/g) || [];
    return [...new Set(matches)].slice(0, 20).map((label) => ({ label: label.replace(/\s+/g, " ").trim() }));
  }

  function selectedMeeting(id) {
    const items = transcripts();
    return id ? items.find((item) => item.id === id) || items[0] : items[0];
  }

  function embeddedMeetingDetail(meeting) {
    const detail = meeting ? detailIndex.meetings?.[meeting.id] : null;
    return detail ? { ...detail, meeting } : null;
  }

  function lawDetail(ref) {
    if (!ref) return `<div class="law-detail-empty">법조항을 선택하면 구체적 내용이 표시됩니다.</div>`;
    return `
      <article class="law-detail-card">
        <div class="law-detail-heading">
          <span class="status-pill status-ready">로컬 검증</span>
          <h3>${escapeHtml(ref.lawName)} ${escapeHtml(ref.article)} ${ref.title ? `(${escapeHtml(ref.title)})` : ""}</h3>
        </div>
        <div class="law-version-grid">
          <section><h4>회의 당시 기준</h4><p>${escapeHtml(ref.meetingVersion || "MCP 조회 연결 대기")}</p><small>${escapeHtml(ref.meetingDate || "")}</small></section>
          <section><h4>현재 확인 포인트</h4><p>${escapeHtml(ref.currentVersion || "현재 조문 조회 연결 대기")}</p><small>korean-law-mcp get_law_text / get_article_history</small></section>
        </div>
        <pre class="law-request">${escapeHtml(JSON.stringify(ref.lookupRequest || {}, null, 2))}</pre>
      </article>
    `;
  }

  function renderAgendaList(agendas) {
    return (agendas || []).map((agenda) => `
      <button class="agenda-jump-item" type="button" data-utterance-target="${escapeHtml(agenda.startUtteranceId)}">
        <span>${escapeHtml(agenda.type || "안건")}</span>
        <strong>${escapeHtml(agenda.title)}</strong>
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

  function renderUtterances(utterances) {
    return `
      <div class="utterance-list">
        ${(utterances || []).map((utterance) => `
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

  function renderMeetingDetail(id) {
    const meeting = selectedMeeting(id);
    if (!meeting) {
      return `<section class="section-band"><h2>회의 상세</h2><p class="section-caption">선택된 회의가 없습니다.</p></section>`;
    }
    const detail = embeddedMeetingDetail(meeting);
    activeMeetingDetail = detail;
    const lawRefs = detail?.lawReferences || extractLawReferences(meeting.content);
    const lawItems = lawRefs.map((ref, index) => `
      <button class="law-reference-item" type="button" data-law-ref-index="${index}">
        <strong>${escapeHtml(ref.lawName ? `${ref.lawName} ${ref.article}` : ref.label)}</strong>
        <span>${escapeHtml(ref.title || ref.meetingDate || "")}</span>
      </button>
    `).join("") || `<p class="section-caption">감지된 법조항이 없습니다.</p>`;
    const overview = detail?.overview || {};
    const attendees = Array.isArray(overview.attendees) ? overview.attendees : [];
    const transcriptBody = detail?.utterances?.length
      ? renderUtterances(detail.utterances)
      : `<pre class="transcript-body">${escapeHtml(meeting.content || "이 회의는 현재 파일에 속기록 본문이 포함되어 있지 않습니다.")}</pre>`;

    return `
      <section class="section-band meeting-detail">
        <div class="section-header">
          <div>
            <h2>회의 상세</h2>
            <p class="section-caption">${escapeHtml(meeting.meetingLabel)} · ${escapeHtml(meeting.date)}</p>
          </div>
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
            <h3>관련 문서</h3>
            <div class="button-stack">
              <a class="small-button" href="${escapeHtml(meeting.path)}" target="_blank" rel="noreferrer">속기록 원문</a>
            </div>
            <div class="side-divider"></div>
            <h3>안건 목록</h3>
            <div class="agenda-jump-list">${renderAgendaList(detail?.agendas || [])}</div>
          </aside>
          <article class="transcript-panel">
            <div class="panel-heading">
              <h3>발언자별 속기록</h3>
              <span>${formatNumber(detail?.utterances?.length || 0)}개 발언</span>
            </div>
            ${transcriptBody}
          </article>
          <aside class="law-panel">
            <h3>법조항 비교</h3>
            ${lawItems}
            <div id="law-detail-panel" class="law-detail-panel">${lawDetail(lawRefs[0])}</div>
          </aside>
        </div>
      </section>
    `;
  }

  function transcriptToUtterances(value) {
    return String(value || "")
      .split(/\n+/)
      .map((line, index) => ({ id: `u${index + 1}`, speaker: "속기록", text: line.trim() }))
      .filter((item) => item.text)
      .slice(0, 200);
  }

  function renderAnimationViewer(id) {
    const meeting = selectedMeeting(id);
    if (!meeting) return renderMeetingDetail(id);
    const detail = embeddedMeetingDetail(meeting);
    activeMeetingDetail = detail;
    const utterances = transcriptToUtterances(meeting.content);
    const scenes = detail?.utterances?.length ? [
      { speaker: "회의장", text: `${meeting.meetingLabel} 입장과 개회를 준비합니다.`, stageNote: "위원 입장 · 착석" },
      ...detail.utterances.map((utterance, index) => ({ ...utterance, id: `scene-${index + 1}`, utteranceId: utterance.id, stageNote: utterance.sectionTitle })),
      { speaker: "회의장", text: `${meeting.meetingLabel} 산회와 퇴장을 재현합니다.`, stageNote: "산회 · 퇴장" },
    ] : [
      { speaker: "system", text: `${meeting.meetingLabel} 회의를 시작합니다.` },
      ...utterances,
      { speaker: "system", text: `${meeting.meetingLabel} 회의를 마칩니다.` },
    ];
    const sceneItems = scenes.map((scene, index) => `
      <button class="animation-scene-item" type="button" data-scene-index="${index}">
        <span>${escapeHtml(scene.stageNote || scene.speaker)}</span>
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
            <p class="section-caption">${escapeHtml(meeting.meetingLabel)} 개회부터 산회까지 발언 단위로 이동합니다.</p>
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
    return `
      <section class="section-band">
        <div class="section-header">
          <div>
            <h2>위원별 분석</h2>
            <p class="section-caption">속기록 활동 지표를 기반으로 위원별 관심 주제를 확인합니다.</p>
          </div>
        </div>
        <div class="commissioner-grid">${cards}</div>
      </section>
    `;
  }

  function renderAgendaAssistant() {
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

  function buildHistoricalAgendas() {
    const rows = Array.isArray(data.majorPenaltyCases) ? data.majorPenaltyCases : [];
    return rows.map((item) => ({
      title: item.agenda_title || item.case_title || item.title || item.target_name || item.top_target_name || "과거 안건",
      searchableText: text(item),
      lawArticle: firstText(item.law_article, item.primary_law_article, item.law_article_text),
      disposition: firstText(item.sanction_type, item.decision_type),
      amountText: firstText(item.amount_text, item.amount_total_krw),
    }));
  }

  function buildAgendaResult(title, summary) {
    const requestText = `${title} ${summary}`;
    const requestTokens = tokenize(requestText);
    const similarAgendas = buildHistoricalAgendas()
      .map((agenda, index) => {
        const agendaTokens = tokenize(agenda.searchableText);
        const matchedTokens = [...requestTokens].filter((token) => agendaTokens.has(token));
        return { ...agenda, index, matchedTokens, score: matchedTokens.length };
      })
      .filter((agenda) => agenda.score > 0)
      .sort((left, right) => right.score - left.score || left.index - right.index)
      .slice(0, 5);

    return {
      similarAgendas,
      issues: findKeyTokens(requestText),
      questions: (Array.isArray(data.commissionerActivity) ? data.commissionerActivity : []).slice(0, 3).map((item) => {
        const topTag = Array.isArray(item.top_tags) && item.top_tags[0] ? text(item.top_tags[0]) : "주요 쟁점";
        const name = item.commissioner_name || item.name || "관련 위원";
        return `${name}: "${topTag}" 관점에서 사실관계와 법적 근거를 어떻게 설명할 수 있습니까?`;
      }),
    };
  }

  function renderAgendaResult(result) {
    const similar = result.similarAgendas.map((item) => `
      <li><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.disposition || "처분 정보 확인 필요")} ${escapeHtml(item.amountText || "")}</span></li>
    `).join("") || `<li>입력 내용과 직접 매칭되는 과거 안건이 아직 없습니다.</li>`;
    const issues = result.issues.map((token) => `
      <li><strong>${escapeHtml(token)}</strong><span>${escapeHtml(issueByToken[token] || "추가 검토가 필요합니다.")}</span></li>
    `).join("") || `<li>안건 요약에 핵심 쟁점 단어를 더 넣으면 예상 쟁점이 보강됩니다.</li>`;
    const questions = result.questions.map((question) => `<li>${escapeHtml(question)}</li>`).join("");
    return `
      <div class="assistant-result-grid">
        <article><h3>유사 안건</h3><ul>${similar}</ul></article>
        <article><h3>예상 쟁점</h3><ul>${issues}</ul></article>
        <article><h3>위원별 예상 질문</h3><ul>${questions}</ul></article>
        <article><h3>준비 체크리스트</h3><ul>
          <li>사실관계와 증거 묶음을 타임라인으로 정리</li>
          <li>법 조항과 처분 근거, 감경·가중 사유 확인</li>
          <li>위원 질의 답변 초안과 보강 증거 위치 연결</li>
        </ul></article>
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

  function showAnimationViewer(id) {
    activeMeetingId = id;
    const meetingTab = $("#tab-meeting");
    if (meetingTab) meetingTab.innerHTML = renderAnimationViewer(id);
    setActiveTab("meeting");
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
    if (!panel || !ref) return;
    panel.innerHTML = lawDetail(ref);
  }

  function updateAnimationStage(button) {
    const stage = $("[data-animation-stage]");
    if (!stage || !button) return;
    const label = $("[data-stage-label]", stage);
    const speaker = $("[data-stage-speaker]", stage);
    const textNode = $("[data-stage-text]", stage);
    const scene = activeMeetingDetail?.utterances?.[Number(button.dataset.sceneIndex) - 1];
    document.querySelector(".animation-scene-item.active")?.classList.remove("active");
    button.classList.add("active");
    if (label) label.textContent = scene?.sectionTitle || button.querySelector("span")?.textContent || "";
    if (speaker) speaker.textContent = scene?.speaker || button.querySelector("em")?.textContent || "";
    if (textNode) textNode.textContent = scene?.text || button.querySelector("strong")?.textContent || "";
  }

  function init() {
    setSnapshotTime();
    $("#tab-stats").innerHTML = renderSituationBoard();
    $("#tab-search").innerHTML = renderSearch();
    $("#tab-meeting").innerHTML = renderMeetingDetail();
    $("#tab-commissioner").innerHTML = renderCommissionerAnalysis();
    $("#tab-assistant").innerHTML = renderAgendaAssistant();

    document.querySelectorAll(".nav-item[data-tab]").forEach((button) => {
      button.addEventListener("click", () => setActiveTab(button.dataset.tab));
    });
  }

  document.addEventListener("click", (event) => {
    const meeting = event.target.closest(".meeting-card[data-meeting-id]");
    if (meeting) showMeetingDetail(meeting.dataset.meetingId);

    const animation = event.target.closest("[data-animation-meeting-id]");
    if (animation) showAnimationViewer(animation.dataset.animationMeetingId);

    const closeAnimation = event.target.closest("[data-close-animation]");
    if (closeAnimation && activeMeetingId) showMeetingDetail(activeMeetingId);

    const agendaJump = event.target.closest("[data-utterance-target]");
    if (agendaJump) scrollToUtterance(agendaJump.dataset.utteranceTarget);

    const lawReference = event.target.closest("[data-law-ref-index]");
    if (lawReference) updateLawDetail(lawReference.dataset.lawRefIndex);

    const scene = event.target.closest(".animation-scene-item[data-scene-index]");
    if (scene) updateAnimationStage(scene);

    const clearFilter = event.target.closest("#clear-filter");
    if (clearFilter) setActiveTab("stats");
  });

  document.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-agenda-form]");
    if (!form) return;
    event.preventDefault();
    const formData = new FormData(form);
    const result = buildAgendaResult(formData.get("title"), formData.get("summary"));
    const resultNode = $("#assistant-result");
    if (resultNode) resultNode.innerHTML = renderAgendaResult(result);
  });

  init();
})();
