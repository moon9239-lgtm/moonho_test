const dashboardData = window.PIPC_DASHBOARD_DATA || {};

const state = {
  activeTab: "stats",
  activeFilter: null,
};

const tabTitles = {
  stats: "전체회의 통계·동향 대시보드",
  search: "안건 통합검색",
  meeting: "회의별 확인",
  commissioner: "위원 대시보드",
  assistant: "신규 안건 준비 도우미",
};

function $(selector, root = document) {
  return root.querySelector(selector);
}

function $all(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function fmtNumber(value) {
  return new Intl.NumberFormat("ko-KR").format(toNumber(value));
}

function fmtPct(value, digits = 1) {
  const number = toNumber(value);
  return `${(number * 100).toFixed(digits)}%`;
}

function fmtWon(value) {
  const number = toNumber(value);
  if (!number) return "-";
  if (number >= 100000000) return `${(number / 100000000).toFixed(1)}억`;
  if (number >= 10000) return `${Math.round(number / 10000).toLocaleString("ko-KR")}만`;
  return fmtNumber(number);
}

function fmtDateTime(value) {
  if (!value) return "스냅샷 없음";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function ratio(part, total) {
  const denominator = toNumber(total);
  if (!denominator) return 0;
  return toNumber(part) / denominator;
}

function statusClass(status) {
  return `status-${String(status || "ready").replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

function badge(label, status = "ready") {
  return `<span class="status-pill ${statusClass(status)}">${escapeHtml(label)}</span>`;
}

function setFilter(label, payload) {
  state.activeFilter = { label, payload };
  $("#filter-preview").textContent = `${label}: ${Object.entries(payload).map(([key, value]) => `${key}=${value}`).join(", ")}`;
}

function clearFilter() {
  state.activeFilter = null;
  $("#filter-preview").textContent = "필터 없음";
}

function bindFilterTargets(root = document) {
  $all("[data-filter]", root).forEach((element) => {
    element.addEventListener("click", () => {
      const payload = JSON.parse(element.dataset.filter || "{}");
      setFilter(element.dataset.filterLabel || "필터", payload);
    });
  });
}

function section(title, caption, body, extra = "") {
  return `
    <section class="section-band">
      <div class="section-header">
        <div>
          <h2>${escapeHtml(title)}</h2>
          ${caption ? `<p class="section-caption">${escapeHtml(caption)}</p>` : ""}
        </div>
        ${extra}
      </div>
      ${body}
    </section>
  `;
}

function kpiCard(label, value, meta, status) {
  return `
    <article class="kpi-card">
      <div class="kpi-label">${escapeHtml(label)}</div>
      <div class="kpi-value">${escapeHtml(value)}</div>
      <div class="kpi-meta">${escapeHtml(meta || "")}</div>
      ${status ? `<div class="kpi-meta">${status}</div>` : ""}
    </article>
  `;
}

function renderYearlySvg(rows) {
  const width = 760;
  const height = 282;
  const pad = { top: 18, right: 36, bottom: 42, left: 42 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const maxBar = Math.max(...rows.map((row) => Math.max(toNumber(row.agenda_items), toNumber(row.meetings))), 1);
  const maxLine = Math.max(...rows.map((row) => toNumber(row.utterances)), 1);
  const step = innerW / Math.max(rows.length, 1);
  const barW = Math.min(22, step / 5);

  const yBar = (value) => pad.top + innerH - (toNumber(value) / maxBar) * innerH;
  const yLine = (value) => pad.top + innerH - (toNumber(value) / maxLine) * innerH;
  const xCenter = (index) => pad.left + step * index + step / 2;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((tick) => {
    const y = pad.top + innerH - innerH * tick;
    return `<line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" stroke="#e2e7e1" stroke-width="1" />`;
  }).join("");

  const bars = rows.map((row, index) => {
    const x = xCenter(index);
    const meetingH = pad.top + innerH - yBar(row.meetings);
    const agendaH = pad.top + innerH - yBar(row.agenda_items);
    return `
      <rect class="filter-target" data-filter-label="연도" data-filter='{"year":${row.meeting_year}}' x="${x - barW - 2}" y="${yBar(row.meetings)}" width="${barW}" height="${meetingH}" fill="#177e7b" rx="3" />
      <rect class="filter-target" data-filter-label="연도" data-filter='{"year":${row.meeting_year}}' x="${x + 2}" y="${yBar(row.agenda_items)}" width="${barW}" height="${agendaH}" fill="#c95f49" rx="3" />
      <text class="axis-text" x="${x}" y="${height - 16}" text-anchor="middle">${row.meeting_year}</text>
    `;
  }).join("");

  const linePoints = rows.map((row, index) => `${xCenter(index)},${yLine(row.utterances)}`).join(" ");
  const points = rows.map((row, index) => {
    const x = xCenter(index);
    const y = yLine(row.utterances);
    return `<circle class="filter-target" data-filter-label="연도" data-filter='{"year":${row.meeting_year}}' cx="${x}" cy="${y}" r="4" fill="#5f7c38" />`;
  }).join("");

  return `
    <div class="chart-box">
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="연도별 회의 안건 발언 추이">
        ${gridLines}
        <line x1="${pad.left}" y1="${pad.top + innerH}" x2="${width - pad.right}" y2="${pad.top + innerH}" stroke="#b7c0b8" />
        <text class="axis-text" x="8" y="${pad.top + 6}">회의/안건</text>
        <text class="axis-text" x="${width - 34}" y="${pad.top + 6}" text-anchor="end">발언</text>
        ${bars}
        <polyline points="${linePoints}" fill="none" stroke="#5f7c38" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" />
        ${points}
      </svg>
      <div class="legend">
        <span class="legend-item"><span class="legend-swatch" style="background:#177e7b"></span>회의</span>
        <span class="legend-item"><span class="legend-swatch" style="background:#c95f49"></span>안건</span>
        <span class="legend-item"><span class="legend-swatch" style="background:#5f7c38"></span>발언</span>
      </div>
    </div>
  `;
}

function renderYearlyTable(rows) {
  const body = rows.map((row) => `
    <tr class="filter-target" data-filter-label="연도" data-filter='{"year":${row.meeting_year}}'>
      <td>${row.meeting_year}${row.meeting_year === 2026 ? " partial" : ""}</td>
      <td class="number-cell">${fmtNumber(row.meetings)}</td>
      <td class="number-cell">${fmtNumber(row.agenda_items)}</td>
      <td class="number-cell">${fmtNumber(row.decision_agendas)}</td>
      <td class="number-cell">${fmtNumber(row.report_agendas)}</td>
      <td class="number-cell">${fmtPct(row.private_agenda_ratio)}</td>
      <td class="number-cell">${fmtNumber(row.decision_cases)}</td>
      <td class="number-cell">${fmtNumber(row.utterances)}</td>
    </tr>
  `).join("");
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>연도</th>
            <th class="number-cell">회의</th>
            <th class="number-cell">안건</th>
            <th class="number-cell">의결</th>
            <th class="number-cell">보고</th>
            <th class="number-cell">비공개율</th>
            <th class="number-cell">결정사건</th>
            <th class="number-cell">발언</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function renderComposition(rows) {
  const byYear = new Map();
  rows.forEach((row) => {
    if (!byYear.has(row.meeting_year)) byYear.set(row.meeting_year, []);
    byYear.get(row.meeting_year).push(row);
  });

  const labelMap = {
    deliberation_decision: "의결",
    report: "보고",
    unspecified: "미분류",
    public: "공개",
    private: "비공개",
  };
  const classMap = {
    deliberation_decision: "decision",
    report: "report",
    unspecified: "unspecified",
    public: "public",
    private: "private",
  };

  const rowsHtml = [...byYear.entries()].map(([year, items]) => {
    const kind = items.filter((item) => item.category_type === "agenda_kind");
    const visibility = items.filter((item) => item.category_type === "visibility");
    const line = (parts, filterKey) => `
      <div class="stacked-line">
        ${parts.map((part) => {
          const percent = Math.max(toNumber(part.ratio) * 100, part.item_count ? 2 : 0);
          const label = labelMap[part.category_key] || part.label;
          const filter = JSON.stringify({ year, [filterKey]: part.category_key });
          return `<div class="stacked-segment ${classMap[part.category_key] || "unspecified"} filter-target" data-filter-label="${label}" data-filter='${filter}' style="width:${percent}%">${percent >= 12 ? `${label} ${part.item_count}` : ""}</div>`;
        }).join("")}
      </div>
    `;
    return `
      <div class="stacked-row">
        <div class="stacked-title">${year}</div>
        <div class="stacked-bars">
          ${line(kind, "agenda_kind")}
          ${line(visibility, "visibility")}
        </div>
      </div>
    `;
  }).join("");

  return `<div class="stacked-list">${rowsHtml}</div>`;
}

function renderBars(rows, config) {
  const max = Math.max(...rows.map((row) => toNumber(row[config.valueKey])), 1);
  return `
    <div class="bar-list">
      ${rows.map((row) => {
        const value = toNumber(row[config.valueKey]);
        const percent = Math.max((value / max) * 100, value ? 1 : 0);
        const label = row[config.labelKey] || "";
        const filterPayload = config.filter ? config.filter(row) : null;
        const filterAttrs = filterPayload
          ? ` data-filter-label="${escapeHtml(config.filterLabel || label)}" data-filter='${escapeHtml(JSON.stringify(filterPayload))}'`
          : "";
        return `
          <div class="bar-row ${filterPayload ? "filter-target" : ""}"${filterAttrs}>
            <div class="bar-label" title="${escapeHtml(label)}">${escapeHtml(label)}</div>
            <div class="bar-track"><div class="bar-fill ${config.color || ""}" style="width:${percent}%"></div></div>
            <div class="bar-value">${config.format ? config.format(value, row) : fmtNumber(value)}</div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderPenaltyTable(rows) {
  const body = rows.map((row) => `
    <tr>
      <td>${escapeHtml(row.penalty_kind)}</td>
      <td class="number-cell">${fmtNumber(row.outcome_rows)}</td>
      <td class="number-cell">${fmtNumber(row.decision_case_count)}</td>
      <td class="number-cell">${fmtWon(row.median_amount_krw)}</td>
      <td class="number-cell">${fmtWon(row.max_amount_krw)}</td>
      <td>${badge("확정", row.data_status || "verified_final_amount")}</td>
    </tr>
  `).join("");
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>구분</th>
            <th class="number-cell">확정 행</th>
            <th class="number-cell">사건</th>
            <th class="number-cell">중앙값</th>
            <th class="number-cell">최대값</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function renderLawTable(rows) {
  const body = rows.slice(0, 12).map((row) => {
    const verifiedRatio = ratio(row.verified_rows, row.citation_count);
    return `
      <tr class="filter-target" data-filter-label="조항" data-filter='{"article":"${escapeHtml(row.article_raw)}"}'>
        <td>${escapeHtml(row.article_raw)}</td>
        <td class="number-cell">${fmtNumber(row.citation_count)}</td>
        <td class="number-cell">${fmtNumber(row.decision_case_count)}</td>
        <td>
          <div class="progress-track"><div class="progress-fill" style="width:${Math.max(verifiedRatio * 100, row.verified_rows ? 2 : 0)}%"></div></div>
          <div class="kpi-meta">${fmtNumber(row.verified_rows)}건 검증</div>
        </td>
      </tr>
    `;
  }).join("");
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>조항</th>
            <th class="number-cell">인용 건</th>
            <th class="number-cell">결정사건</th>
            <th>검증 진행</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function renderCommissionerTable(rows) {
  const body = rows.slice(0, 12).map((row) => {
    const tags = Array.isArray(row.top_tags) ? row.top_tags.slice(0, 3) : [];
    return `
      <tr class="filter-target" data-filter-label="위원" data-filter='{"commissioner":"${escapeHtml(row.name)}"}'>
        <td>
          <strong>${escapeHtml(row.name)}</strong>
          <div class="kpi-meta">${escapeHtml(row.status === "current" ? "현직" : "전직")}</div>
        </td>
        <td class="number-cell">${fmtNumber(row.total_utterances)}</td>
        <td class="number-cell">${fmtNumber(row.meeting_count)}</td>
        <td class="number-cell">${fmtNumber(row.agenda_count)}</td>
        <td class="number-cell">${fmtNumber(row.case_count)}</td>
        <td>
          <div class="tag-list">
            ${tags.map((tag) => `<span class="tag-chip">${escapeHtml(tag.tag_label)} ${fmtNumber(tag.utterance_count)}</span>`).join("")}
          </div>
        </td>
      </tr>
    `;
  }).join("");
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>위원</th>
            <th class="number-cell">발언</th>
            <th class="number-cell">회의</th>
            <th class="number-cell">안건</th>
            <th class="number-cell">사건</th>
            <th>상위 발언 태그</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function renderQuality(rows) {
  const body = rows.map((row) => {
    const pct = Math.max(toNumber(row.ratio) * 100, row.value_count ? 2 : 0);
    return `
      <div class="quality-row">
        <div>
          <div class="quality-title">${escapeHtml(row.label)}</div>
          <div class="quality-note">${escapeHtml(row.notes)}</div>
        </div>
        <div>
          <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
          <div class="kpi-meta">${fmtNumber(row.value_count)} / ${fmtNumber(row.total_count)}</div>
        </div>
        <div>${badge(row.status, row.status)}</div>
      </div>
    `;
  }).join("");
  return `<div class="quality-list">${body}</div>`;
}

function renderInsightCards(cards) {
  const body = cards.map((card) => kpiCard(card.label, card.value_text, card.meta_text, `<div class="kpi-meta">${escapeHtml(card.note || "")}</div>`)).join("");
  return `<div class="kpi-grid insight-grid">${body}</div>`;
}

function topBy(rows, key, limit = 8) {
  return [...rows]
    .sort((a, b) => toNumber(b[key]) - toNumber(a[key]))
    .slice(0, limit);
}

function renderIssueYearlyTrends(rows) {
  const years = [...new Set(rows.map((row) => row.decision_year))].sort((a, b) => a - b);
  const issueTotals = new Map();
  rows.forEach((row) => {
    const current = issueTotals.get(row.issue_key) || { issue_key: row.issue_key, issue_label: row.issue_label, total: 0, amount: 0 };
    current.total += toNumber(row.case_count);
    current.amount += toNumber(row.amount_total_krw);
    issueTotals.set(row.issue_key, current);
  });
  const issues = [...issueTotals.values()].sort((a, b) => b.total - a.total).slice(0, 9);
  const max = Math.max(...rows.map((row) => toNumber(row.case_count)), 1);
  const lookup = new Map(rows.map((row) => [`${row.issue_key}:${row.decision_year}`, row]));
  const body = issues.map((issue) => `
    <tr class="filter-target" data-filter-label="쟁점" data-filter='${escapeHtml(JSON.stringify({ issue: issue.issue_key }))}'>
      <td><strong>${escapeHtml(issue.issue_label)}</strong><div class="kpi-meta">누적 ${fmtNumber(issue.total)}건</div></td>
      ${years.map((year) => {
        const row = lookup.get(`${issue.issue_key}:${year}`);
        const count = toNumber(row?.case_count);
        const intensity = count ? Math.max(0.12, count / max) : 0;
        return `<td class="heat-cell" style="--heat:${intensity}">${count ? fmtNumber(count) : ""}</td>`;
      }).join("")}
      <td class="number-cell">${fmtWon(issue.amount)}</td>
    </tr>
  `).join("");
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>쟁점</th>
            ${years.map((year) => `<th class="number-cell">${year}</th>`).join("")}
            <th class="number-cell">금액 합계</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function renderArticleSanctionMatrix(rows) {
  const sanctions = ["과징금", "과태료", "시정명령", "개선권고", "주의", "공표명령", "고발", "징계권고"];
  const byArticle = new Map();
  rows.forEach((row) => {
    if (!byArticle.has(row.article_no)) {
      byArticle.set(row.article_no, { article_no: row.article_no, article_title: row.article_title, total: 0, maxAmount: 0, sanctions: new Map() });
    }
    const entry = byArticle.get(row.article_no);
    entry.total += toNumber(row.case_count);
    entry.maxAmount = Math.max(entry.maxAmount, toNumber(row.max_case_amount_krw));
    entry.sanctions.set(row.sanction_kind, row);
  });
  const articles = [...byArticle.values()].sort((a, b) => b.total - a.total).slice(0, 12);
  const maxCell = Math.max(...rows.map((row) => toNumber(row.case_count)), 1);
  const body = articles.map((article) => `
    <tr class="filter-target" data-filter-label="조항" data-filter='${escapeHtml(JSON.stringify({ article: article.article_no }))}'>
      <td>
        <strong>${escapeHtml(article.article_no)}</strong>
        <div class="kpi-meta">${escapeHtml(article.article_title || "")}</div>
      </td>
      ${sanctions.map((sanction) => {
        const row = article.sanctions.get(sanction);
        const count = toNumber(row?.case_count);
        const width = Math.max((count / maxCell) * 100, count ? 8 : 0);
        return `<td class="matrix-cell"><span style="width:${width}%"></span><b>${count ? fmtNumber(count) : ""}</b></td>`;
      }).join("")}
      <td class="number-cell">${fmtWon(article.maxAmount)}</td>
    </tr>
  `).join("");
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>조항</th>
            ${sanctions.map((sanction) => `<th class="number-cell">${sanction}</th>`).join("")}
            <th class="number-cell">최고액</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function renderPenaltyBenchmarks(rows) {
  const body = rows.slice(0, 14).map((row) => `
    <tr class="filter-target" data-filter-label="처분수위" data-filter='${escapeHtml(JSON.stringify({ issue: row.issue_key, penalty: row.penalty_kind }))}'>
      <td><strong>${escapeHtml(row.issue_label)}</strong></td>
      <td>${escapeHtml(row.penalty_kind)}</td>
      <td class="number-cell">${fmtNumber(row.case_count)}</td>
      <td class="number-cell">${fmtWon(row.median_amount_krw)}</td>
      <td class="number-cell">${fmtWon(row.p75_amount_krw)}</td>
      <td class="number-cell">${fmtWon(row.max_amount_krw)}</td>
      <td>${escapeHtml(row.max_case_no || "")}<div class="kpi-meta">${escapeHtml(row.max_case_title || "")}</div></td>
    </tr>
  `).join("");
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>쟁점</th>
            <th>구분</th>
            <th class="number-cell">사건</th>
            <th class="number-cell">중앙값</th>
            <th class="number-cell">상위 25%</th>
            <th class="number-cell">최고액</th>
            <th>최고액 사건</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function renderViolationPatterns(rows) {
  const body = rows.map((row) => {
    const articles = Array.isArray(row.top_articles) ? row.top_articles.slice(0, 3) : [];
    const sanctions = Array.isArray(row.top_sanctions) ? row.top_sanctions.slice(0, 3) : [];
    return `
      <tr class="filter-target" data-filter-label="위반유형" data-filter='${escapeHtml(JSON.stringify({ issue: row.issue_key }))}'>
        <td><strong>${escapeHtml(row.issue_label)}</strong><div class="kpi-meta">${fmtNumber(row.case_count)}건</div></td>
        <td><div class="tag-list">${articles.map((item) => `<span class="tag-chip">${escapeHtml(item.article_no)} ${fmtNumber(item.case_count)}</span>`).join("")}</div></td>
        <td><div class="tag-list">${sanctions.map((item) => `<span class="tag-chip">${escapeHtml(item.sanction_kind)} ${fmtNumber(item.case_count)}</span>`).join("")}</div></td>
        <td class="number-cell">${fmtWon(row.median_case_amount_krw)}</td>
        <td class="number-cell">${fmtWon(row.max_case_amount_krw)}</td>
        <td class="number-cell">${fmtNumber(row.mitigation_signal_cases)} / ${fmtNumber(row.aggravation_signal_cases)}</td>
      </tr>
    `;
  }).join("");
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>위반유형</th>
            <th>주요 조항</th>
            <th>주된 처분</th>
            <th class="number-cell">금액 중앙값</th>
            <th class="number-cell">최고액</th>
            <th class="number-cell">감경/가중 신호</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function renderAdjustmentFactors(rows) {
  const directionMap = { mitigating: "감경", aggravating: "가중", context: "산정" };
  return renderBars(rows, {
    labelKey: "factor_label",
    valueKey: "case_count",
    color: "coral",
    filterLabel: "산정 요소",
    format: (value, row) => `${fmtNumber(value)}건 · ${directionMap[row.direction] || row.direction}`,
    filter: (row) => ({ factor: row.factor_key }),
  });
}

function renderDeliberationFocus(rows) {
  const body = rows.slice(0, 10).map((row) => `
    <tr class="filter-target" data-filter-label="심의포인트" data-filter='${escapeHtml(JSON.stringify({ tag: row.tag_key }))}'>
      <td><strong>${escapeHtml(row.tag_label)}</strong><div class="kpi-meta">${escapeHtml(row.tag_category || "")}</div></td>
      <td class="number-cell">${fmtNumber(row.utterance_count)}</td>
      <td class="number-cell">${fmtNumber(row.linked_case_count)}</td>
      <td>${escapeHtml(row.sample_evidence || "")}</td>
    </tr>
  `).join("");
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>쟁점</th>
            <th class="number-cell">발언</th>
            <th class="number-cell">연결 사건</th>
            <th>대표 문맥</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function renderRepresentativeCases(rows) {
  const body = rows.map((row) => {
    const articles = Array.isArray(row.top_articles) ? row.top_articles.slice(0, 3) : [];
    const sanctions = Array.isArray(row.sanctions) ? row.sanctions.slice(0, 4) : [];
    return `
      <tr class="filter-target" data-filter-label="대표사건" data-filter='${escapeHtml(JSON.stringify({ case_id: row.case_id, issue: row.issue_key }))}'>
        <td><strong>${escapeHtml(row.issue_label)}</strong><div class="kpi-meta">${escapeHtml(row.decision_date || "")}</div></td>
        <td>${escapeHtml(row.case_no || "")}<div class="kpi-meta">${escapeHtml(row.case_title || "")}</div></td>
        <td><div class="tag-list">${articles.map((item) => `<span class="tag-chip">${escapeHtml(item.article_no)}</span>`).join("")}</div></td>
        <td><div class="tag-list">${sanctions.map((item) => `<span class="tag-chip">${escapeHtml(item)}</span>`).join("")}</div></td>
        <td class="number-cell">${fmtWon(row.amount_total_krw)}</td>
      </tr>
    `;
  }).join("");
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>유형</th>
            <th>대표 사건</th>
            <th>조항</th>
            <th>처분</th>
            <th class="number-cell">금액</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function renderMoneyKpis(cards) {
  const body = cards.map((card) => (
    kpiCard(card.label, card.value_text, card.meta_text, `<div class="kpi-meta">${escapeHtml(card.note || "")}</div>`)
  )).join("");
  return `<div class="kpi-grid executive-kpi-grid">${body}</div>`;
}

function renderYearlyMoneyChart(rows) {
  const width = 820;
  const height = 300;
  const pad = { top: 22, right: 34, bottom: 44, left: 52 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const maxAmount = Math.max(...rows.map((row) => toNumber(row.amount_total_krw)), 1);
  const maxCases = Math.max(...rows.map((row) => toNumber(row.monetary_case_count)), 1);
  const step = innerW / Math.max(rows.length, 1);
  const barW = Math.min(42, step * 0.48);
  const xCenter = (index) => pad.left + step * index + step / 2;
  const yAmount = (value) => pad.top + innerH - (toNumber(value) / maxAmount) * innerH;
  const yCases = (value) => pad.top + innerH - (toNumber(value) / maxCases) * innerH;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((tick) => {
    const y = pad.top + innerH - innerH * tick;
    return `<line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" stroke="#e2e7e1" stroke-width="1" />`;
  }).join("");

  const bars = rows.map((row, index) => {
    const x = xCenter(index);
    const y = yAmount(row.amount_total_krw);
    const h = pad.top + innerH - y;
    return `
      <rect class="filter-target" data-filter-label="연도" data-filter='${escapeHtml(JSON.stringify({ year: row.decision_year }))}' x="${x - barW / 2}" y="${y}" width="${barW}" height="${h}" fill="#177e7b" rx="4" />
      <text class="axis-text" x="${x}" y="${height - 18}" text-anchor="middle">${row.decision_year}</text>
    `;
  }).join("");

  const linePoints = rows.map((row, index) => `${xCenter(index)},${yCases(row.monetary_case_count)}`).join(" ");
  const points = rows.map((row, index) => {
    const x = xCenter(index);
    const y = yCases(row.monetary_case_count);
    return `<circle cx="${x}" cy="${y}" r="4" fill="#c95f49" />`;
  }).join("");

  return `
    <div class="chart-box">
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="연도별 처분금액과 금전처분 사건 수">
        ${gridLines}
        <line x1="${pad.left}" y1="${pad.top + innerH}" x2="${width - pad.right}" y2="${pad.top + innerH}" stroke="#b7c0b8" />
        <text class="axis-text" x="8" y="${pad.top + 6}">처분금액</text>
        <text class="axis-text" x="${width - 28}" y="${pad.top + 6}" text-anchor="end">사건 수</text>
        ${bars}
        <polyline points="${linePoints}" fill="none" stroke="#c95f49" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" />
        ${points}
      </svg>
      <div class="legend">
        <span class="legend-item"><span class="legend-swatch" style="background:#177e7b"></span>처분금액</span>
        <span class="legend-item"><span class="legend-swatch" style="background:#c95f49"></span>금전처분 사건 수</span>
      </div>
    </div>
  `;
}

function renderYearlyMoneyTable(rows) {
  const body = rows.map((row) => `
    <tr class="filter-target" data-filter-label="연도" data-filter='${escapeHtml(JSON.stringify({ year: row.decision_year }))}'>
      <td><strong>${row.decision_year}</strong></td>
      <td class="number-cell">${fmtWon(row.amount_total_krw)}</td>
      <td class="number-cell">${fmtWon(row.surcharge_total_krw)}</td>
      <td class="number-cell">${fmtWon(row.fine_total_krw)}</td>
      <td class="number-cell">${fmtNumber(row.monetary_case_count)}</td>
      <td>${escapeHtml(row.top_target_name || "피심인 미식별")}<div class="kpi-meta">${escapeHtml(row.top_case_no || "")}</div></td>
    </tr>
  `).join("");
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>연도</th>
            <th class="number-cell">총액</th>
            <th class="number-cell">과징금</th>
            <th class="number-cell">과태료</th>
            <th class="number-cell">사건</th>
            <th>최고액 사건</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function renderMonthlyMoneyHeat(rows) {
  const years = [...new Set(rows.map((row) => row.decision_year))].sort((a, b) => a - b);
  const months = Array.from({ length: 12 }, (_, index) => index + 1);
  const lookup = new Map(rows.map((row) => [`${row.decision_year}:${row.decision_month}`, row]));
  const max = Math.max(...rows.map((row) => toNumber(row.amount_total_krw)), 1);
  const body = years.map((year) => `
    <tr>
      <td><strong>${year}</strong></td>
      ${months.map((month) => {
        const row = lookup.get(`${year}:${month}`);
        const amount = toNumber(row?.amount_total_krw);
        const intensity = amount ? Math.max(0.12, amount / max) : 0;
        return `
          <td class="month-money-cell filter-target" data-filter-label="월" data-filter='${escapeHtml(JSON.stringify({ year, month }))}' style="--heat:${intensity}">
            <strong>${amount ? fmtWon(amount) : ""}</strong>
            <span>${row?.monetary_case_count ? `${fmtNumber(row.monetary_case_count)}건` : ""}</span>
          </td>
        `;
      }).join("")}
    </tr>
  `).join("");
  return `
    <div class="table-wrap">
      <table class="calendar-table">
        <thead>
          <tr>
            <th>연도</th>
            ${months.map((month) => `<th class="number-cell">${month}월</th>`).join("")}
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function renderMoneyArticleTable(rows) {
  const body = rows.slice(0, 14).map((row) => `
    <tr class="filter-target" data-filter-label="조항" data-filter='${escapeHtml(JSON.stringify({ article: row.article_no }))}'>
      <td>
        <strong>${escapeHtml(row.article_no || "")}</strong>
        <div class="kpi-meta">${escapeHtml(row.article_title || "")}</div>
      </td>
      <td class="number-cell">${fmtWon(row.amount_total_krw)}</td>
      <td class="number-cell">${fmtNumber(row.case_count)}</td>
      <td class="number-cell">${fmtWon(row.max_case_amount_krw)}</td>
      <td>${escapeHtml(row.top_target_name || "피심인 미식별")}<div class="kpi-meta">${escapeHtml(row.top_case_no || "")}</div></td>
    </tr>
  `).join("");
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>조항</th>
            <th class="number-cell">연결 처분금액</th>
            <th class="number-cell">사건</th>
            <th class="number-cell">최고액</th>
            <th>대표 사건</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function renderTargetGroupSummary(rows) {
  const total = rows.reduce((sum, row) => sum + toNumber(row.amount_total_krw), 0);
  const cards = rows.map((row) => {
    const share = total ? toNumber(row.amount_total_krw) / total : 0;
    return `
      <article class="kpi-card filter-target" data-filter-label="대상분류" data-filter='${escapeHtml(JSON.stringify({ target_group: row.target_group }))}'>
        <div class="kpi-label">${escapeHtml(row.target_group)}</div>
        <div class="kpi-value">${fmtWon(row.amount_total_krw)}</div>
        <div class="kpi-meta">${fmtPct(share)} · ${fmtNumber(row.monetary_case_count)}건 · 대상 ${fmtNumber(row.target_count)}곳</div>
        <div class="kpi-meta">최고액: ${escapeHtml(row.top_target_name || "피심인 미식별")} ${row.top_case_no ? `(${escapeHtml(row.top_case_no)})` : ""}</div>
      </article>
    `;
  }).join("");
  return `<div class="kpi-grid target-grid">${cards}</div>`;
}

function renderTargetRankings(rows) {
  const body = rows.slice(0, 16).map((row) => `
    <tr class="filter-target" data-filter-label="처분대상" data-filter='${escapeHtml(JSON.stringify({ target: row.target_name }))}'>
      <td><strong>${escapeHtml(row.target_name)}</strong><div class="kpi-meta">${escapeHtml(row.target_group || "")}</div></td>
      <td class="number-cell">${fmtWon(row.amount_total_krw)}</td>
      <td class="number-cell">${fmtNumber(row.monetary_case_count)}</td>
      <td class="number-cell">${fmtWon(row.max_case_amount_krw)}</td>
      <td>${escapeHtml(row.top_case_no || "")}<div class="kpi-meta">${escapeHtml(row.top_decision_date || "")}</div></td>
    </tr>
  `).join("");
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>기업·기관</th>
            <th class="number-cell">처분금액</th>
            <th class="number-cell">사건</th>
            <th class="number-cell">최고액</th>
            <th>대표 사건</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function renderMajorPenaltyCases(rows) {
  const body = rows.slice(0, 15).map((row) => {
    const penalties = Array.isArray(row.penalty_breakdown) ? row.penalty_breakdown.slice(0, 3) : [];
    const articles = Array.isArray(row.articles) ? row.articles
      .filter((article) => article.article_no)
      .slice(0, 3) : [];
    return `
      <tr class="filter-target" data-filter-label="처분사건" data-filter='${escapeHtml(JSON.stringify({ case_id: row.case_id, case_no: row.case_no }))}'>
        <td>
          <strong>${escapeHtml(row.target_name || "피심인 미식별")}</strong>
          <div class="kpi-meta">${escapeHtml(row.target_group || "")}</div>
        </td>
        <td>${escapeHtml(row.case_no || "")}<div class="kpi-meta">${escapeHtml(row.decision_date || "")}</div></td>
        <td class="number-cell">${fmtWon(row.amount_total_krw)}</td>
        <td><div class="tag-list">${penalties.map((item) => `<span class="tag-chip">${escapeHtml(item.penalty_kind)} ${fmtWon(item.amount_krw)}</span>`).join("")}</div></td>
        <td><div class="tag-list">${articles.map((item) => `<span class="tag-chip">${escapeHtml(item.article_no)}</span>`).join("")}</div></td>
        <td>${escapeHtml(row.meeting_title || "")}</td>
      </tr>
    `;
  }).join("");
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>대상</th>
            <th>사건</th>
            <th class="number-cell">금액</th>
            <th>금전처분</th>
            <th>조항</th>
            <th>회의</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function renderMeetingCalendar(rows) {
  const years = [...new Set(rows.map((row) => row.meeting_year))].sort((a, b) => a - b);
  const months = Array.from({ length: 12 }, (_, index) => index + 1);
  const lookup = new Map(rows.map((row) => [`${row.meeting_year}:${row.meeting_month}`, row]));
  const max = Math.max(...rows.map((row) => toNumber(row.meeting_count)), 1);
  const body = years.map((year) => `
    <tr>
      <td><strong>${year}</strong></td>
      ${months.map((month) => {
        const row = lookup.get(`${year}:${month}`);
        const count = toNumber(row?.meeting_count);
        const intensity = count ? Math.max(0.14, count / max) : 0;
        return `
          <td class="month-meeting-cell filter-target" data-filter-label="회의월" data-filter='${escapeHtml(JSON.stringify({ year, month }))}' style="--heat:${intensity}">
            <strong>${count ? fmtNumber(count) : ""}</strong>
            <span>${row?.agenda_count ? `${fmtNumber(row.agenda_count)}안건` : ""}</span>
          </td>
        `;
      }).join("")}
    </tr>
  `).join("");
  return `
    <div class="table-wrap">
      <table class="calendar-table">
        <thead>
          <tr>
            <th>연도</th>
            ${months.map((month) => `<th class="number-cell">${month}월</th>`).join("")}
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function renderSecondCommissioners(rows) {
  const body = rows.map((row) => `
    <tr class="filter-target" data-filter-label="위원" data-filter='${escapeHtml(JSON.stringify({ commissioner: row.name }))}'>
      <td>
        <strong>${escapeHtml(row.name)}</strong>
        <div class="kpi-meta">${escapeHtml(row.role_current || row.term_role || "")}</div>
      </td>
      <td>${badge(row.display_status || row.term_status, row.display_status === "현직" ? "ready" : "partial")}</td>
      <td>${escapeHtml(row.recommendation_route || "")}</td>
      <td>${escapeHtml(row.official_term_text || "")}<div class="kpi-meta">${escapeHtml(row.start_date || "")}${row.end_date ? ` ~ ${escapeHtml(row.end_date)}` : ""}</div></td>
      <td>${escapeHtml(row.background_axis || "")}</td>
    </tr>
  `).join("");
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>위원</th>
            <th>상태</th>
            <th>추천·임명</th>
            <th>임기</th>
            <th>배경</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function overviewRow() {
  return (dashboardData.overviewKpis || [])[0] || {};
}

function yearRangeLabel(rows) {
  const years = rows.map((row) => toNumber(row.meeting_year || row.decision_year)).filter(Boolean);
  if (!years.length) return "";
  return `${Math.min(...years)}~${Math.max(...years)}`;
}

function renderOperationalKpis(overview, yearlyRows, secondCommissioners) {
  const latest = [...yearlyRows].sort((a, b) => toNumber(b.meeting_year) - toNumber(a.meeting_year))[0] || {};
  const currentSecondCount = secondCommissioners.filter((row) => row.display_status === "현직").length;
  const totalAgendas = toNumber(overview.agenda_items_total);
  const totalMeetings = toNumber(overview.meetings_total);
  const decisionAgendas = toNumber(overview.decision_agendas_total);
  const reportAgendas = toNumber(overview.report_agendas_total);
  const linkedUtterances = toNumber(overview.utterances_with_agenda);
  const utterances = toNumber(overview.utterances_total);
  const avgAgendas = totalMeetings ? (totalAgendas / totalMeetings).toFixed(1) : "-";
  const cards = [
    {
      label: "전체회의",
      value: `${fmtNumber(totalMeetings)}회`,
      meta: `${yearRangeLabel(yearlyRows)} 누적 · 최근 ${latest.last_meeting_date || "-"}`
    },
    {
      label: "전체 안건",
      value: `${fmtNumber(totalAgendas)}건`,
      meta: `회의당 평균 ${avgAgendas}건`
    },
    {
      label: "의결 / 보고",
      value: `${fmtNumber(decisionAgendas)} / ${fmtNumber(reportAgendas)}`,
      meta: `${fmtPct(ratio(decisionAgendas, totalAgendas))} / ${fmtPct(ratio(reportAgendas, totalAgendas))}`
    },
    {
      label: "결정사건",
      value: `${fmtNumber(overview.decision_cases_total)}건`,
      meta: `처분 신호 ${fmtNumber(overview.sanctions_total)}개`
    },
    {
      label: "속기록 발언",
      value: `${fmtNumber(utterances)}개`,
      meta: `안건 연결 ${fmtPct(ratio(linkedUtterances, utterances))}`
    },
    {
      label: "현재 2기 위원",
      value: `${fmtNumber(currentSecondCount)}명`,
      meta: `2기 전체 이력 ${fmtNumber(secondCommissioners.length)}명`
    },
  ];
  return `<div class="kpi-grid overview-kpi-grid">${cards.map((card) => kpiCard(card.label, card.value, card.meta)).join("")}</div>`;
}

function renderYearlyOperationsChart(rows) {
  const width = 820;
  const height = 306;
  const pad = { top: 24, right: 38, bottom: 42, left: 48 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const maxBar = Math.max(...rows.map((row) => Math.max(toNumber(row.meetings), toNumber(row.agenda_items))), 1);
  const maxUtterances = Math.max(...rows.map((row) => toNumber(row.utterances)), 1);
  const step = innerW / Math.max(rows.length, 1);
  const barW = Math.min(26, step / 5);
  const xCenter = (index) => pad.left + step * index + step / 2;
  const yBar = (value) => pad.top + innerH - (toNumber(value) / maxBar) * innerH;
  const yLine = (value) => pad.top + innerH - (toNumber(value) / maxUtterances) * innerH;
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((tick) => {
    const y = pad.top + innerH - innerH * tick;
    return `<line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" stroke="#e2e7e1" stroke-width="1" />`;
  }).join("");
  const bars = rows.map((row, index) => {
    const x = xCenter(index);
    const meetingY = yBar(row.meetings);
    const agendaY = yBar(row.agenda_items);
    return `
      <rect class="filter-target" data-filter-label="연도" data-filter='${escapeHtml(JSON.stringify({ year: row.meeting_year }))}' x="${x - barW - 2}" y="${meetingY}" width="${barW}" height="${pad.top + innerH - meetingY}" fill="#177e7b" rx="4" />
      <rect class="filter-target" data-filter-label="연도" data-filter='${escapeHtml(JSON.stringify({ year: row.meeting_year }))}' x="${x + 2}" y="${agendaY}" width="${barW}" height="${pad.top + innerH - agendaY}" fill="#c95f49" rx="4" />
      <text class="axis-text" x="${x}" y="${height - 15}" text-anchor="middle">${row.meeting_year}</text>
    `;
  }).join("");
  const linePoints = rows.map((row, index) => `${xCenter(index)},${yLine(row.utterances)}`).join(" ");
  const points = rows.map((row, index) => {
    const x = xCenter(index);
    const y = yLine(row.utterances);
    return `<circle class="filter-target" data-filter-label="연도" data-filter='${escapeHtml(JSON.stringify({ year: row.meeting_year }))}' cx="${x}" cy="${y}" r="4" fill="#5f7c38" />`;
  }).join("");

  return `
    <div class="chart-box">
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="연도별 전체회의, 안건, 발언 추이">
        ${gridLines}
        <line x1="${pad.left}" y1="${pad.top + innerH}" x2="${width - pad.right}" y2="${pad.top + innerH}" stroke="#b7c0b8" />
        <text class="axis-text" x="8" y="${pad.top + 5}">회의/안건</text>
        <text class="axis-text" x="${width - 8}" y="${pad.top + 5}" text-anchor="end">발언</text>
        ${bars}
        <polyline points="${linePoints}" fill="none" stroke="#5f7c38" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" />
        ${points}
      </svg>
      <div class="legend">
        <span class="legend-item"><span class="legend-swatch" style="background:#177e7b"></span>회의</span>
        <span class="legend-item"><span class="legend-swatch" style="background:#c95f49"></span>안건</span>
        <span class="legend-item"><span class="legend-swatch" style="background:#5f7c38"></span>속기록 발언</span>
      </div>
    </div>
  `;
}

function renderYearlyOperationsTable(rows) {
  const body = rows.map((row) => `
    <tr class="filter-target" data-filter-label="연도" data-filter='${escapeHtml(JSON.stringify({ year: row.meeting_year }))}'>
      <td><strong>${row.meeting_year}</strong></td>
      <td class="number-cell">${fmtNumber(row.meetings)}</td>
      <td class="number-cell">${fmtNumber(row.agenda_items)}</td>
      <td class="number-cell">${fmtNumber(row.avg_agendas_per_meeting)}</td>
      <td class="number-cell">${fmtNumber(row.decision_agendas)}</td>
      <td class="number-cell">${fmtNumber(row.report_agendas)}</td>
      <td class="number-cell">${fmtNumber(row.utterances)}</td>
    </tr>
  `).join("");
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>연도</th>
            <th class="number-cell">회의</th>
            <th class="number-cell">안건</th>
            <th class="number-cell">회의당 안건</th>
            <th class="number-cell">의결</th>
            <th class="number-cell">보고</th>
            <th class="number-cell">발언</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function renderAgendaDecisionSplit(yearlyRows) {
  const max = Math.max(...yearlyRows.map((row) => toNumber(row.agenda_items)), 1);
  const rows = yearlyRows.map((row) => {
    const decision = toNumber(row.decision_agendas);
    const report = toNumber(row.report_agendas);
    const unspecified = Math.max(toNumber(row.agenda_items) - decision - report, 0);
    const total = Math.max(toNumber(row.agenda_items), 1);
    const width = Math.max((toNumber(row.agenda_items) / max) * 100, 2);
    return `
      <div class="distribution-row filter-target" data-filter-label="연도" data-filter='${escapeHtml(JSON.stringify({ year: row.meeting_year }))}'>
        <div class="distribution-label">${row.meeting_year}</div>
        <div class="distribution-track" style="width:${width}%">
          <span class="distribution-part decision" style="width:${ratio(decision, total) * 100}%">${decision >= 8 ? fmtNumber(decision) : ""}</span>
          <span class="distribution-part report" style="width:${ratio(report, total) * 100}%">${report >= 8 ? fmtNumber(report) : ""}</span>
          <span class="distribution-part unspecified" style="width:${ratio(unspecified, total) * 100}%">${unspecified >= 3 ? fmtNumber(unspecified) : ""}</span>
        </div>
        <div class="distribution-value">${fmtNumber(row.agenda_items)}건</div>
      </div>
    `;
  }).join("");
  return `
    <div class="distribution-list">
      ${rows}
      <div class="legend">
        <span class="legend-item"><span class="legend-swatch" style="background:#177e7b"></span>의결</span>
        <span class="legend-item"><span class="legend-swatch" style="background:#c95f49"></span>보고</span>
        <span class="legend-item"><span class="legend-swatch" style="background:#b17b16"></span>기타</span>
      </div>
    </div>
  `;
}

function renderIssueTagCloudByYear(rows) {
  const byYear = new Map();
  rows.forEach((row) => {
    if (!byYear.has(row.meeting_year)) byYear.set(row.meeting_year, []);
    byYear.get(row.meeting_year).push(row);
  });
  const cards = [...byYear.entries()].sort(([a], [b]) => a - b).map(([year, items]) => {
    const max = Math.max(...items.map((item) => toNumber(item.utterance_count)), 1);
    const total = toNumber(items[0]?.year_tag_total);
    const tokens = items.slice(0, 12).map((item) => {
      const size = Math.max(toNumber(item.utterance_count) / max, 0.18);
      const filter = JSON.stringify({ year, issue: item.tag_key });
      return `
        <span class="cloud-token filter-target" data-filter-label="쟁점" data-filter='${escapeHtml(filter)}' style="--size:${size}" title="${escapeHtml(`${item.tag_label} ${fmtNumber(item.utterance_count)}개`)}">
          ${escapeHtml(item.tag_label)}
        </span>
      `;
    }).join("");
    return `
      <article class="word-cloud-card">
        <div class="word-cloud-heading">
          <strong>${year}</strong>
          <span>${fmtNumber(total)}개 태그</span>
        </div>
        <div class="word-cloud">${tokens}</div>
      </article>
    `;
  }).join("");
  return `<div class="word-cloud-grid">${cards}</div>`;
}

function renderLawArticleMap(lawRows, moneyRows) {
  const moneyByArticle = new Map(moneyRows.map((row) => [row.article_no, row]));
  const body = lawRows.slice(0, 16).map((row) => {
    const money = moneyByArticle.get(row.article_raw) || {};
    const verifiedRatio = ratio(row.verified_rows, row.citation_count);
    return `
      <tr class="filter-target" data-filter-label="조항" data-filter='${escapeHtml(JSON.stringify({ article: row.article_raw }))}'>
        <td>
          <strong>${escapeHtml(row.article_raw)}</strong>
          <div class="kpi-meta">${escapeHtml((row.sample_law_names || [])[0] || "개인정보 보호법")}</div>
        </td>
        <td class="number-cell">${fmtNumber(row.citation_count)}</td>
        <td class="number-cell">${fmtNumber(row.decision_case_count)}</td>
        <td>
          <div class="progress-track"><div class="progress-fill" style="width:${Math.max(verifiedRatio * 100, row.verified_rows ? 2 : 0)}%"></div></div>
          <div class="kpi-meta">${fmtPct(verifiedRatio)} 검증</div>
        </td>
        <td class="number-cell">${fmtWon(money.amount_total_krw)}</td>
        <td>${escapeHtml(money.top_target_name || "-")}<div class="kpi-meta">${escapeHtml(money.top_case_no || "")}</div></td>
      </tr>
    `;
  }).join("");
  return `
    <div class="article-map-grid">
      ${renderBars(lawRows.slice(0, 12), {
        labelKey: "article_raw",
        valueKey: "citation_count",
        filterLabel: "조항",
        filter: (row) => ({ article: row.article_raw }),
        format: (value, row) => `${fmtNumber(value)}회 · ${fmtNumber(row.decision_case_count)}건`,
      })}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>조항</th>
              <th class="number-cell">인용</th>
              <th class="number-cell">사건</th>
              <th>MCP 검증</th>
              <th class="number-cell">연결 금액</th>
              <th>대표 대상</th>
            </tr>
          </thead>
          <tbody>${body}</tbody>
        </table>
      </div>
    </div>
  `;
}

function renderTargetGroupCards(rows) {
  const totalCases = rows.reduce((sum, row) => sum + toNumber(row.monetary_case_count), 0);
  const cards = rows.map((row) => {
    const share = ratio(row.monetary_case_count, totalCases);
    return `
      <article class="kpi-card filter-target" data-filter-label="대상분류" data-filter='${escapeHtml(JSON.stringify({ target_group: row.target_group }))}'>
        <div class="kpi-label">${escapeHtml(row.target_group)}</div>
        <div class="kpi-value">${fmtNumber(row.monetary_case_count)}건</div>
        <div class="kpi-meta">금전처분 ${fmtWon(row.amount_total_krw)} · ${fmtPct(share)}</div>
        <div class="kpi-meta">대표 ${escapeHtml(row.top_target_name || "-")} ${row.top_case_no ? `(${escapeHtml(row.top_case_no)})` : ""}</div>
      </article>
    `;
  }).join("");
  return `<div class="kpi-grid target-grid">${cards}</div>`;
}

function renderTargetRankingCompact(rows) {
  const body = rows.slice(0, 12).map((row) => `
    <tr class="filter-target" data-filter-label="대상" data-filter='${escapeHtml(JSON.stringify({ target: row.target_name }))}'>
      <td><strong>${escapeHtml(row.target_name)}</strong><div class="kpi-meta">${escapeHtml(row.target_group || "")}</div></td>
      <td class="number-cell">${fmtNumber(row.monetary_case_count)}</td>
      <td class="number-cell">${fmtWon(row.amount_total_krw)}</td>
      <td class="number-cell">${fmtWon(row.max_case_amount_krw)}</td>
      <td>${escapeHtml(row.top_case_no || "")}<div class="kpi-meta">${escapeHtml(row.top_decision_date || "")}</div></td>
    </tr>
  `).join("");
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>기업·기관</th>
            <th class="number-cell">건수</th>
            <th class="number-cell">총액</th>
            <th class="number-cell">최고액</th>
            <th>대표 사건</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function renderSanctionOverview(sanctionRows, penaltyRows, yearlyMoneyRows) {
  return `
    <div class="two-column-grid">
      <div>
        <h3 class="subsection-title">제재 유형 분포</h3>
        ${renderBars(sanctionRows.slice(0, 10), {
          labelKey: "sanction_kind",
          valueKey: "sanction_count",
          color: "olive",
          filterLabel: "제재유형",
          filter: (row) => ({ sanction: row.sanction_kind }),
          format: (value, row) => `${fmtNumber(value)}개 · ${fmtNumber(row.decision_case_count)}건`,
        })}
      </div>
      <div>
        <h3 class="subsection-title">금전처분 수준</h3>
        ${renderPenaltyTable(penaltyRows)}
      </div>
    </div>
    <div class="section-spacer"></div>
    <div class="chart-grid">${renderYearlyMoneyChart(yearlyMoneyRows)}${renderYearlyMoneyTable(yearlyMoneyRows)}</div>
  `;
}

function renderStatsTab() {
  const overview = overviewRow();
  const yearlyStats = dashboardData.yearlyStats || [];
  const moneyYearly = dashboardData.moneyYearly || [];
  const moneyMonthly = dashboardData.moneyMonthly || [];
  const moneyByArticle = dashboardData.moneyByArticle || [];
  const lawArticles = dashboardData.lawArticleDistribution || [];
  const issueTagYearly = dashboardData.issueTagYearly || [];
  const sanctionDistribution = dashboardData.sanctionDistribution || [];
  const penaltyOutcomeSummary = dashboardData.penaltyOutcomeSummary || [];
  const targetGroups = dashboardData.targetGroupSummary || [];
  const targetRankings = dashboardData.targetRankings || [];
  const meetingMonths = dashboardData.meetingYearMonth || [];
  const secondCommissioners = dashboardData.secondCommissioners || [];

  $("#tab-stats").innerHTML = [
    section("전체회의 규모", "회의 수, 안건 수, 의결·보고, 결정사건, 발언량을 먼저 크게 봅니다.", renderOperationalKpis(overview, yearlyStats, secondCommissioners)),
    section(
      "연도별 회의·안건 흐름",
      "막대는 회의와 안건, 선은 속기록 발언량입니다. 전체회의 운영 규모가 해마다 어떻게 달라졌는지 보여줍니다.",
      `<div class="chart-grid">${renderYearlyOperationsChart(yearlyStats)}${renderYearlyOperationsTable(yearlyStats)}</div>`
    ),
    section(
      "안건 처리 방식 분포",
      "연도별 전체 안건 안에서 의결과 보고가 차지하는 비중입니다.",
      renderAgendaDecisionSplit(yearlyStats)
    ),
    section(
      "연도별 주요 쟁점 키워드",
      "속기록 발언 태그를 연도별 워드클라우드로 묶었습니다. 글자가 클수록 해당 연도 발언에서 더 자주 등장한 쟁점입니다.",
      renderIssueTagCloudByYear(issueTagYearly)
    ),
    section(
      "관련 조항 지도",
      "자주 등장한 조항, 결정사건 연결 수, MCP 조문 검증률, 처분금액 연결을 함께 봅니다.",
      renderLawArticleMap(lawArticles, moneyByArticle)
    ),
    section(
      "대상 유형·주요 기업/기관",
      "금전처분이 있는 사건 기준으로 공공·민간 등 대상 유형과 반복·고액 대상을 봅니다.",
      `${renderTargetGroupCards(targetGroups)}<div class="section-spacer"></div>${renderTargetRankingCompact(targetRankings)}`
    ),
    section(
      "결과·제재 강도",
      "처분 유형의 빈도와 과징금·과태료 수준을 함께 봅니다. 금액은 확정 금전처분 기준입니다.",
      renderSanctionOverview(sanctionDistribution, penaltyOutcomeSummary, moneyYearly)
    ),
    section(
      "전체회의 개최 캘린더",
      "월별 회의 수와 안건 수를 함께 표시합니다. 특정 시기에 회의와 안건이 몰렸는지 한눈에 볼 수 있습니다.",
      renderMeetingCalendar(meetingMonths)
    ),
    section(
      "현재 2기 위원 현황",
      "현재 구성과 교체 이력을 함께 표시합니다. 조소영 위원 사퇴 및 김휘강 위원 합류가 반영되어 있습니다.",
      renderSecondCommissioners(secondCommissioners)
    ),
  ].join("");

  bindFilterTargets($("#tab-stats"));
}

function renderPlaceholderTab(tabId) {
  const content = {
    search: {
      title: "안건 통합검색",
      lead: "다음 구현 단위입니다. 안건, 결정사건, 조항, 처분, 발언 키워드를 한 번에 조회하는 작업면입니다.",
      left: ["검색어 입력", "연도·회차 필터", "의결/보고 필터", "처분대상·조항·처분 유형 필터", "원문 키워드 검색"],
      right: ["dashboard_agenda_search_index 생성", "처분대상명 정규화", "조항 MCP 검증 계속", "임베딩 적재 후 유사사건 검색"],
    },
    meeting: {
      title: "회의별 확인",
      lead: "통합검색 결과에서 특정 회의를 열었을 때 들어오는 상세 작업면입니다.",
      left: ["회의 기본정보", "참석위원", "안건 목록", "회의록·속기록 원문", "발언 타임라인"],
      right: ["meeting_attendance", "agenda_segments", "agenda_outcomes", "meeting_timeline_events"],
    },
    commissioner: {
      title: "위원 대시보드",
      lead: "위원별 프로필과 발언·쟁점·성향 분석을 보는 작업면입니다.",
      left: ["위원 프로필", "임기와 추천 경로", "발언량 추이", "상위 쟁점", "대표 발언"],
      right: ["성향 태그 방향성", "질문 유형 분류", "연도별 관심 쟁점", "위원별 페르소나 초안"],
    },
    assistant: {
      title: "신규 안건 준비 도우미",
      lead: "새 안건 입력 후 유사사건, 관련 조문, 예상 질의, 검토 포인트를 생성하는 작업면입니다.",
      left: ["안건명", "피심인·대상기관", "사건 개요", "위반 의심 조항", "검토 메모"],
      right: ["유사사건 검색", "해당 시점 조문 조회", "처분 금액 추정", "위원별 예상질의"],
    },
  }[tabId];

  $(`#tab-${tabId}`).innerHTML = section(
    content.title,
    content.lead,
    `<div class="placeholder-grid">
      <div class="placeholder-panel">
        <h3>화면 블록</h3>
        <ul class="placeholder-list">${content.left.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </div>
      <div class="placeholder-panel">
        <h3>데이터 작업</h3>
        <ul class="placeholder-list">${content.right.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </div>
    </div>`
  );
}

function setActiveTab(tabId) {
  state.activeTab = tabId;
  $(".nav-item.active")?.classList.remove("active");
  $(`.nav-item[data-tab="${tabId}"]`)?.classList.add("active");
  $(".tab-view.active")?.classList.remove("active");
  $(`#tab-${tabId}`)?.classList.add("active");
  $("#page-title").textContent = tabTitles[tabId] || tabTitles.stats;
  history.replaceState(null, "", `#${tabId}`);
}

function initTabs() {
  $all(".nav-item").forEach((button) => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tab));
  });

  const requested = location.hash.replace("#", "");
  if (tabTitles[requested]) setActiveTab(requested);
}

function init() {
  $("#snapshot-time").textContent = fmtDateTime(dashboardData.generatedAt);
  $("#clear-filter").addEventListener("click", clearFilter);
  renderStatsTab();
  ["search", "meeting", "commissioner", "assistant"].forEach(renderPlaceholderTab);
  initTabs();
}

init();
