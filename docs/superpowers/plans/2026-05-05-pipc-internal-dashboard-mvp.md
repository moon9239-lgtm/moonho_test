# PIPC Internal Dashboard MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first internal PIPC full-committee dashboard MVP: meeting operations situation board, meeting detail explorer, law comparison hook, transcript animation prototype, commissioner analysis starter, and text-first agenda preparation assistant.

**Architecture:** Keep the current static dashboard model, but split new behavior into testable ES modules under `pipc_dashboard/src`. `index.html` loads a module entrypoint, `dashboard-data.js` remains the local data snapshot, and Node built-in tests verify data normalization and rendering contracts before UI wiring. Existing knowledge-base and character-profile files are reused as data sources.

**Tech Stack:** Static HTML/CSS, browser ES modules, Node.js built-in `node:test`, Supabase snapshot generation script, local Markdown files, korean-law-mcp availability check, existing character profile assets.

---

## Scope Check

The approved design covers several subsystems. This plan implements one coherent MVP vertical slice:

- Meeting operations situation board
- Compressed meeting cards
- Meeting detail explorer with transcript reader
- Law-reference extraction and korean-law-mcp adapter shape
- Animation reconstruction prototype for one selected meeting
- Commissioner analysis starter
- Text-first new agenda preparation assistant starter

Production authentication, file upload, complete legal history exploration, and complete animation support for every meeting are separate delivery plans.

## Existing Files And Responsibilities

- `pipc_dashboard/index.html`: app shell, navigation containers, script entrypoint.
- `pipc_dashboard/app.js`: current monolithic renderer. Keep as a reference while migrating behavior into modules.
- `pipc_dashboard/styles.css`: current layout and dashboard styling.
- `pipc_dashboard/data/dashboard-data.js`: generated local data snapshot loaded in the browser.
- `pipc_dashboard/tools/fetch-dashboard-data.mjs`: Supabase query that writes `dashboard-data.js`.
- `pipc_dashboard/tools/static-server.mjs`: local static server that can serve Markdown and dashboard files.
- `pipc_knowledge_base/04_members/character_profiles/characters.json`: commissioner character metadata and speech profile hints.
- `pipc_knowledge_base/04_members/character_profiles/character_assets`: existing character image assets.
- `pipc_knowledge_base/05_animation_prototype/sample_2026_05_meeting_data.json`: existing animation scene-data prototype.
- `pipc_knowledge_base/05_animation_prototype/pipc_meeting_animation_sample.html`: existing browser animation prototype.
- `pipc_minutes_crawler/node_modules/korean-law-mcp`: installed korean-law-mcp package to inspect for law lookup integration.

## New File Structure

- `pipc_dashboard/package.json`: local scripts for tests and serving the dashboard.
- `pipc_dashboard/src/data-model.mjs`: dashboard snapshot normalization and derived model builders.
- `pipc_dashboard/src/law-references.mjs`: legal citation extraction and law lookup request shaping.
- `pipc_dashboard/src/animation-model.mjs`: transcript-to-animation timeline model helpers.
- `pipc_dashboard/src/commissioner-model.mjs`: commissioner profile and speech-analysis model helpers.
- `pipc_dashboard/src/character-assets.mjs`: browser loader for existing commissioner character profile JSON.
- `pipc_dashboard/src/agenda-assistant-model.mjs`: text-first agenda-prep ranking and prompt-result model helpers.
- `pipc_dashboard/src/renderers.mjs`: HTML string renderers for situation board, meeting detail, commissioner analysis, and assistant panels.
- `pipc_dashboard/src/main.mjs`: browser entrypoint and event wiring.
- `pipc_dashboard/tests/fixtures/dashboard-fixture.mjs`: small deterministic fixture used by tests.
- `pipc_dashboard/tests/data-model.test.mjs`: situation-board and meeting-card model tests.
- `pipc_dashboard/tests/law-references.test.mjs`: legal citation extraction and lookup-shape tests.
- `pipc_dashboard/tests/animation-model.test.mjs`: transcript timeline and jump-index tests.
- `pipc_dashboard/tests/commissioner-model.test.mjs`: commissioner analysis aggregation tests.
- `pipc_dashboard/tests/agenda-assistant-model.test.mjs`: text-first agenda matching tests.
- `docs/superpowers/reports/2026-05-05-pipc-dashboard-inventory.md`: implementation inventory of current data, assets, and integration gaps.

---

### Task 1: Inventory Current Data, Assets, And Integration Gaps

**Files:**
- Create: `docs/superpowers/reports/2026-05-05-pipc-dashboard-inventory.md`

- [ ] **Step 1: Inspect dashboard data keys**

Run:

```powershell
node -e "import('./pipc_dashboard/data/dashboard-data.js').catch(()=>{}); console.log('dashboard-data is browser global; inspect with text search')"
Select-String -Path pipc_dashboard\data\dashboard-data.js -Pattern 'meetingTranscripts|commissionerActivity|majorPenaltyCases|issueTagDistribution|lawArticleDistribution'
```

Expected: output shows existing keys for meeting transcripts, commissioner activity, major penalty cases, issue tags, and law article distribution.

- [ ] **Step 2: Inspect commissioner character assets**

Run:

```powershell
Get-ChildItem -Path pipc_knowledge_base\04_members\character_profiles -Force
Get-ChildItem -Path pipc_knowledge_base\04_members\character_profiles\character_assets -File | Select-Object -First 30 Name,Length
Get-Content -Encoding UTF8 pipc_knowledge_base\04_members\character_profiles\characters.json -TotalCount 80
```

Expected: output confirms `characters.json` and image assets exist, with commissioner IDs such as `go_haksu`, `song_kyunghee`, and related character metadata.

- [ ] **Step 3: Inspect animation prototype assets**

Run:

```powershell
Get-ChildItem -Path pipc_knowledge_base\05_animation_prototype -Force
Get-Content -Encoding UTF8 pipc_knowledge_base\05_animation_prototype\meeting_animation_plan.md -TotalCount 80
```

Expected: output confirms `sample_2026_05_meeting_data.json` and `pipc_meeting_animation_sample.html` exist.

- [ ] **Step 4: Inspect korean-law-mcp availability**

Run:

```powershell
Get-Content -Encoding UTF8 pipc_minutes_crawler\node_modules\korean-law-mcp\package.json -TotalCount 80
Get-ChildItem -Path pipc_minutes_crawler\node_modules\korean-law-mcp\build\tools -Force | Select-Object Name
```

Expected: output confirms the package exists and exposes built tools or CLI files.

- [ ] **Step 5: Write the inventory report**

Create `docs/superpowers/reports/2026-05-05-pipc-dashboard-inventory.md` with this structure:

```markdown
# PIPC Dashboard Inventory

## Dashboard Snapshot

- Existing snapshot file:
- Keys available for situation board:
- Keys missing for MVP:

## Meeting Detail Sources

- Transcript index source:
- Markdown serving path:
- Known limits:

## Law Lookup

- korean-law-mcp package path:
- Historical lookup support observed:
- Adapter requirement:

## Animation Assets

- Character metadata:
- Character image directory:
- Existing animation prototype:
- Missing assets:

## Commissioner Analysis Sources

- Existing commissioner activity keys:
- Existing speech profile files:
- Required derived fields:

## Agenda Assistant Sources

- Existing similar-case sources:
- Existing decision metadata:
- Required text matching fields:
```

- [ ] **Step 6: Commit the inventory report**

Run:

```powershell
git add docs/superpowers/reports/2026-05-05-pipc-dashboard-inventory.md
git commit -m "docs: inventory PIPC dashboard MVP inputs"
```

Expected: commit succeeds with only the inventory report staged.

---

### Task 2: Add Test Harness And Core Dashboard Data Model

**Files:**
- Create: `pipc_dashboard/package.json`
- Create: `pipc_dashboard/src/data-model.mjs`
- Create: `pipc_dashboard/tests/fixtures/dashboard-fixture.mjs`
- Create: `pipc_dashboard/tests/data-model.test.mjs`

- [ ] **Step 1: Write the failing data-model test**

Create `pipc_dashboard/tests/fixtures/dashboard-fixture.mjs`:

```javascript
export const dashboardFixture = {
  generatedAt: "2026-05-05T00:00:00.000Z",
  meetingYearly: [
    { meeting_year: 2024, meeting_count: 20, agenda_count: 82 },
    { meeting_year: 2025, meeting_count: 24, agenda_count: 96 },
  ],
  overviewKpis: [
    { metric_key: "meetings", value_text: "44회", label: "전체회의 개최" },
  ],
  yearlyStats: [
    { meeting_year: 2024, meetings: 20, agenda_items: 82, decision_agendas: 50, report_agendas: 20 },
    { meeting_year: 2025, meetings: 24, agenda_items: 96, decision_agendas: 60, report_agendas: 22 },
  ],
  majorPenaltyCases: [
    { decision_date: "2025-08-27", agenda_title: "대형 유출 관련 건", amount_total_krw: 134800600000, target_name: "예시기관" },
  ],
  meetingTranscripts: [
    {
      id: "2025-24",
      meeting_date: "2025-11-26",
      meeting_year: 2025,
      meeting_number: 24,
      meeting_title: "2025년 제24회 전체회의",
      raw_md_path: "pipc_knowledge_base/99_raw/transcripts/2025/example.md",
      size_bytes: 10240,
    },
  ],
};
```

Create `pipc_dashboard/tests/data-model.test.mjs`:

```javascript
import test from "node:test";
import assert from "node:assert/strict";
import { buildSituationBoardModel, normalizeTranscriptRecord } from "../src/data-model.mjs";
import { dashboardFixture } from "./fixtures/dashboard-fixture.mjs";

test("buildSituationBoardModel derives operations KPIs and meeting cards", () => {
  const model = buildSituationBoardModel(dashboardFixture);

  assert.equal(model.updatedAt, "2026-05-05T00:00:00.000Z");
  assert.equal(model.kpis.totalMeetings.value, 44);
  assert.equal(model.kpis.totalAgendas.value, 178);
  assert.equal(model.kpis.averageAgendasPerMeeting.value, 4.0);
  assert.equal(model.meetingCards.length, 1);
  assert.equal(model.meetingCards[0].meetingLabel, "2025년 제24회");
  assert.equal(model.signals.majorPenaltyCases.length, 1);
});

test("normalizeTranscriptRecord creates browser-safe relative paths", () => {
  const record = normalizeTranscriptRecord({
    meeting_date: "2025-11-26",
    meeting_year: 2025,
    meeting_number: 24,
    raw_md_path: "pipc_knowledge_base/99_raw/transcripts/2025/example.md",
    size_bytes: 2048,
  }, 0);

  assert.equal(record.year, 2025);
  assert.equal(record.meetingLabel, "2025년 제24회");
  assert.equal(record.path, "../pipc_knowledge_base/99_raw/transcripts/2025/example.md");
  assert.equal(record.sizeKb, 2);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```powershell
node --test pipc_dashboard\tests\data-model.test.mjs
```

Expected: FAIL with module-not-found for `pipc_dashboard/src/data-model.mjs`.

- [ ] **Step 3: Add the local package scripts**

Create `pipc_dashboard/package.json`:

```json
{
  "name": "pipc-dashboard",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/*.test.mjs",
    "serve": "node tools/static-server.mjs"
  }
}
```

- [ ] **Step 4: Implement the minimal data model**

Create `pipc_dashboard/src/data-model.mjs`:

```javascript
export function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(toNumber(value) * factor) / factor;
}

export function normalizePath(value) {
  return String(value || "").replace(/\\/g, "/");
}

export function normalizeDashboardPath(value) {
  const path = normalizePath(value);
  if (!path || /^(https?:|file:|\/|\.\/|\.\.\/)/.test(path)) return path;
  return `../${path}`;
}

export function normalizeTranscriptRecord(item, index = 0) {
  const date = item.date || item.meeting_date || "";
  const year = toNumber(item.year || item.meeting_year || date.slice(0, 4));
  const meetingNo = item.meetingNo ?? item.meeting_number ?? null;
  const path = normalizeDashboardPath(item.path || item.transcript_path || item.raw_md_path || "");
  const sizeBytes = toNumber(item.size_bytes);
  return {
    id: String(item.id || item.meeting_id || `${date}-${meetingNo || index}`),
    year,
    date,
    meetingNo,
    meetingLabel: item.meetingLabel || item.meeting_label || (meetingNo ? `${year}년 제${meetingNo}회` : `${year}년`),
    title: item.title || item.transcript_title || item.meeting_title || path.split("/").pop() || "",
    path,
    sizeKb: item.sizeKb || item.size_kb || (sizeBytes ? Math.round(sizeBytes / 1024) : null),
    content: item.content || "",
  };
}

export function buildSituationBoardModel(data = {}) {
  const yearlyRows = data.yearlyStats || data.meetingYearly || [];
  const totalMeetings = yearlyRows.reduce((sum, row) => sum + toNumber(row.meetings ?? row.meeting_count), 0);
  const totalAgendas = yearlyRows.reduce((sum, row) => sum + toNumber(row.agenda_items ?? row.agenda_count), 0);
  const meetingCards = (data.meetingTranscripts || []).map(normalizeTranscriptRecord);

  return {
    updatedAt: data.generatedAt || "",
    kpis: {
      totalMeetings: { label: "총 회의 수", value: totalMeetings },
      totalAgendas: { label: "총 안건 수", value: totalAgendas },
      averageAgendasPerMeeting: {
        label: "회의당 평균 안건 수",
        value: totalMeetings ? round(totalAgendas / totalMeetings, 1) : 0,
      },
    },
    yearlyRows,
    meetingCards,
    signals: {
      majorPenaltyCases: data.majorPenaltyCases || [],
    },
  };
}
```

- [ ] **Step 5: Run the test and verify it passes**

Run:

```powershell
cd pipc_dashboard
npm test
```

Expected: PASS for both data-model tests.

- [ ] **Step 6: Commit**

Run:

```powershell
git add pipc_dashboard/package.json pipc_dashboard/src/data-model.mjs pipc_dashboard/tests
git commit -m "test: add PIPC dashboard data model"
```

Expected: commit succeeds with only Task 2 files staged.

---

### Task 3: Render The Meeting Operations Situation Board From The Model

**Files:**
- Create: `pipc_dashboard/src/renderers.mjs`
- Create: `pipc_dashboard/tests/renderers.test.mjs`
- Modify: `pipc_dashboard/src/data-model.mjs`

- [ ] **Step 1: Write the failing renderer test**

Create `pipc_dashboard/tests/renderers.test.mjs`:

```javascript
import test from "node:test";
import assert from "node:assert/strict";
import { buildSituationBoardModel } from "../src/data-model.mjs";
import { renderSituationBoard } from "../src/renderers.mjs";
import { dashboardFixture } from "./fixtures/dashboard-fixture.mjs";

test("renderSituationBoard includes operational KPIs and meeting cards", () => {
  const html = renderSituationBoard(buildSituationBoardModel(dashboardFixture));

  assert.match(html, /총 회의 수/);
  assert.match(html, /44/);
  assert.match(html, /총 안건 수/);
  assert.match(html, /2025년 제24회/);
  assert.match(html, /제재·처분 신호/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```powershell
cd pipc_dashboard
npm test
```

Expected: FAIL with module-not-found for `src/renderers.mjs`.

- [ ] **Step 3: Implement the renderer**

Create `pipc_dashboard/src/renderers.mjs`:

```javascript
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
```

- [ ] **Step 4: Run tests and verify they pass**

Run:

```powershell
cd pipc_dashboard
npm test
```

Expected: PASS for data-model and renderer tests.

- [ ] **Step 5: Commit**

Run:

```powershell
git add pipc_dashboard/src/renderers.mjs pipc_dashboard/tests/renderers.test.mjs pipc_dashboard/src/data-model.mjs
git commit -m "feat: render meeting operations situation board"
```

Expected: commit succeeds.

---

### Task 4: Wire ES Module Entrypoint Without Losing Existing Dashboard Data

**Files:**
- Create: `pipc_dashboard/src/main.mjs`
- Modify: `pipc_dashboard/index.html`
- Modify: `pipc_dashboard/styles.css`

- [ ] **Step 1: Write a smoke test by running the static server command**

Run:

```powershell
cd pipc_dashboard
npm run serve
```

Expected: server prints `PIPC dashboard: http://127.0.0.1:5174/`. Stop the server after confirming the command starts.

- [ ] **Step 2: Create the module entrypoint**

Create `pipc_dashboard/src/main.mjs`:

```javascript
import { buildSituationBoardModel } from "./data-model.mjs";
import { renderSituationBoard } from "./renderers.mjs";

const dashboardData = window.PIPC_DASHBOARD_DATA || {};

function $(selector, root = document) {
  return root.querySelector(selector);
}

function setSnapshotTime(value) {
  const target = $("#snapshot-time");
  if (!target) return;
  if (!value) {
    target.textContent = "업데이트 기준 확인 필요";
    return;
  }
  const date = new Date(value);
  target.textContent = Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function init() {
  const model = buildSituationBoardModel(dashboardData);
  setSnapshotTime(model.updatedAt);
  const stats = $("#tab-stats");
  if (stats) stats.innerHTML = renderSituationBoard(model);
}

init();
```

- [ ] **Step 3: Switch `index.html` to the module entrypoint**

In `pipc_dashboard/index.html`, replace:

```html
<script src="./app.js"></script>
```

with:

```html
<script type="module" src="./src/main.mjs"></script>
```

- [ ] **Step 4: Add minimal styles for new cards**

Append to `pipc_dashboard/styles.css`:

```css
.situation-board .update-note {
  color: var(--muted);
  font-size: 12px;
}

.signal-strip {
  margin-top: 14px;
  padding: 10px 12px;
  border: 1px solid var(--coral-soft);
  border-radius: 8px;
  background: var(--coral-soft);
  color: var(--danger);
  font-weight: 800;
}

.meeting-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.meeting-card {
  display: grid;
  gap: 6px;
  min-height: 104px;
  padding: 13px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text);
  text-align: left;
  cursor: pointer;
}

.meeting-card:hover {
  border-color: var(--teal);
}

.meeting-card-title {
  font-weight: 800;
}

.meeting-card-meta {
  color: var(--muted);
  font-size: 12px;
}

.meeting-card-badge {
  width: fit-content;
  padding: 3px 7px;
  border-radius: 999px;
  background: var(--teal-soft);
  color: var(--teal);
  font-size: 11px;
  font-weight: 800;
}
```

- [ ] **Step 5: Verify tests still pass**

Run:

```powershell
cd pipc_dashboard
npm test
```

Expected: PASS.

- [ ] **Step 6: Verify in browser**

Run:

```powershell
cd pipc_dashboard
npm run serve
```

Open `http://127.0.0.1:5174/`. Expected: dashboard loads, KPI cards render, and no console error appears. Stop the server after checking.

- [ ] **Step 7: Commit**

Run:

```powershell
git add pipc_dashboard/index.html pipc_dashboard/src/main.mjs pipc_dashboard/styles.css
git commit -m "feat: wire modular PIPC dashboard shell"
```

Expected: commit succeeds.

---

### Task 5: Add Meeting Detail Explorer Model And Transcript Reader

**Files:**
- Modify: `pipc_dashboard/src/data-model.mjs`
- Modify: `pipc_dashboard/src/renderers.mjs`
- Modify: `pipc_dashboard/src/main.mjs`
- Modify: `pipc_dashboard/styles.css`
- Create: `pipc_dashboard/tests/meeting-detail.test.mjs`

- [ ] **Step 1: Write the failing meeting-detail test**

Create `pipc_dashboard/tests/meeting-detail.test.mjs`:

```javascript
import test from "node:test";
import assert from "node:assert/strict";
import { buildMeetingDetailModel } from "../src/data-model.mjs";
import { renderMeetingDetail } from "../src/renderers.mjs";
import { dashboardFixture } from "./fixtures/dashboard-fixture.mjs";

test("buildMeetingDetailModel finds a meeting by transcript id", () => {
  const detail = buildMeetingDetailModel(dashboardFixture, "2025-24");

  assert.equal(detail.meeting.id, "2025-24");
  assert.equal(detail.meeting.meetingLabel, "2025년 제24회");
  assert.equal(detail.lawReferences.length, 0);
});

test("renderMeetingDetail includes animation action", () => {
  const detail = buildMeetingDetailModel(dashboardFixture, "2025-24");
  const html = renderMeetingDetail(detail);

  assert.match(html, /회의 상세/);
  assert.match(html, /애니메이션으로 보기/);
  assert.match(html, /속기록/);
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```powershell
cd pipc_dashboard
npm test
```

Expected: FAIL with missing `buildMeetingDetailModel` and `renderMeetingDetail`.

- [ ] **Step 3: Implement meeting detail model**

Append to `pipc_dashboard/src/data-model.mjs`:

```javascript
export function buildMeetingDetailModel(data = {}, transcriptId) {
  const transcripts = (data.meetingTranscripts || []).map(normalizeTranscriptRecord);
  const meeting = transcripts.find((item) => item.id === transcriptId) || transcripts[0] || null;
  return {
    meeting,
    transcriptText: meeting?.content || "",
    agendas: [],
    lawReferences: [],
    relatedDocuments: meeting ? [{ label: "속기록 원문", path: meeting.path }] : [],
  };
}
```

- [ ] **Step 4: Implement meeting detail renderer**

Append to `pipc_dashboard/src/renderers.mjs`:

```javascript
export function renderMeetingDetail(detail) {
  if (!detail?.meeting) {
    return `<section class="section-band"><h2>회의 상세</h2><p class="section-caption">선택된 회의가 없습니다.</p></section>`;
  }

  const docs = detail.relatedDocuments.map((doc) => `
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
```

- [ ] **Step 5: Wire meeting-card clicks**

In `pipc_dashboard/src/main.mjs`, import `buildMeetingDetailModel` and `renderMeetingDetail`, then after rendering the situation board add:

```javascript
function showMeetingDetail(id) {
  const detail = buildMeetingDetailModel(dashboardData, id);
  const meetingTab = $("#tab-meeting");
  if (!meetingTab) return;
  meetingTab.innerHTML = renderMeetingDetail(detail);
  document.querySelector(".tab-view.active")?.classList.remove("active");
  meetingTab.classList.add("active");
  document.querySelector(".nav-item.active")?.classList.remove("active");
  document.querySelector('.nav-item[data-tab="meeting"]')?.classList.add("active");
  const title = $("#page-title");
  if (title) title.textContent = "회의 상세 탐색";
}

document.addEventListener("click", (event) => {
  const card = event.target.closest("[data-meeting-id]");
  if (card) showMeetingDetail(card.dataset.meetingId);
});
```

- [ ] **Step 6: Add detail layout styles**

Append to `pipc_dashboard/styles.css`:

```css
.meeting-detail-grid {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) 280px;
  gap: 14px;
}

.meeting-detail-side,
.transcript-panel,
.law-panel {
  min-width: 0;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
}

.button-stack {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}

.transcript-body {
  max-height: 58vh;
  overflow: auto;
  white-space: pre-wrap;
  line-height: 1.65;
}
```

- [ ] **Step 7: Run tests**

Run:

```powershell
cd pipc_dashboard
npm test
```

Expected: PASS.

- [ ] **Step 8: Commit**

Run:

```powershell
git add pipc_dashboard/src pipc_dashboard/tests pipc_dashboard/styles.css
git commit -m "feat: add meeting detail explorer"
```

Expected: commit succeeds.

---

### Task 6: Add Law Citation Extraction And Lookup Adapter Shape

**Files:**
- Create: `pipc_dashboard/src/law-references.mjs`
- Create: `pipc_dashboard/tests/law-references.test.mjs`
- Modify: `pipc_dashboard/src/data-model.mjs`
- Modify: `pipc_dashboard/src/renderers.mjs`

- [ ] **Step 1: Write failing legal-reference tests**

Create `pipc_dashboard/tests/law-references.test.mjs`:

```javascript
import test from "node:test";
import assert from "node:assert/strict";
import { extractLawReferences, buildLawLookupRequest } from "../src/law-references.mjs";

test("extractLawReferences finds Korean law article citations", () => {
  const refs = extractLawReferences("개인정보 보호법 제29조 및 같은 법 제34조 제1항 위반 여부를 검토하였다.");

  assert.equal(refs.length, 2);
  assert.equal(refs[0].lawName, "개인정보 보호법");
  assert.equal(refs[0].article, "제29조");
  assert.equal(refs[1].article, "제34조 제1항");
});

test("buildLawLookupRequest keeps meeting date and current comparison target", () => {
  const request = buildLawLookupRequest({
    lawName: "개인정보 보호법",
    article: "제29조",
    meetingDate: "2025-08-27",
  });

  assert.deepEqual(request, {
    lawName: "개인정보 보호법",
    article: "제29조",
    versions: [
      { label: "회의 당시", effectiveDate: "2025-08-27" },
      { label: "현재", effectiveDate: "current" },
    ],
  });
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```powershell
cd pipc_dashboard
npm test
```

Expected: FAIL with module-not-found for `src/law-references.mjs`.

- [ ] **Step 3: Implement citation extraction**

Create `pipc_dashboard/src/law-references.mjs`:

```javascript
const KNOWN_LAWS = ["개인정보 보호법", "개인정보 보호법 시행령"];

export function extractLawReferences(text) {
  const source = String(text || "");
  const refs = [];
  let currentLaw = "";
  const pattern = /(개인정보 보호법 시행령|개인정보 보호법|같은 법)\s*(제\d+조(?:의\d+)?(?:\s*제\d+항)?)/g;
  let match;

  while ((match = pattern.exec(source))) {
    const rawLaw = match[1];
    if (KNOWN_LAWS.includes(rawLaw)) currentLaw = rawLaw;
    const lawName = rawLaw === "같은 법" ? currentLaw : rawLaw;
    if (!lawName) continue;
    refs.push({
      lawName,
      article: match[2].replace(/\s+/g, " ").trim(),
      index: match.index,
      text: match[0],
    });
  }

  return refs;
}

export function buildLawLookupRequest({ lawName, article, meetingDate }) {
  return {
    lawName,
    article,
    versions: [
      { label: "회의 당시", effectiveDate: meetingDate },
      { label: "현재", effectiveDate: "current" },
    ],
  };
}
```

- [ ] **Step 4: Attach law references to meeting detail**

In `pipc_dashboard/src/data-model.mjs`, import `extractLawReferences` and update `buildMeetingDetailModel` so `lawReferences` is derived from `meeting.content`:

```javascript
import { extractLawReferences } from "./law-references.mjs";
```

Inside `buildMeetingDetailModel`:

```javascript
const transcriptText = meeting?.content || "";
const lawReferences = extractLawReferences(transcriptText).map((ref) => ({
  ...ref,
  meetingDate: meeting?.date || "",
}));
```

Return `transcriptText` and `lawReferences`.

- [ ] **Step 5: Render law references**

In `renderMeetingDetail`, replace the static law-panel paragraph with a list:

```javascript
const lawItems = detail.lawReferences.length
  ? detail.lawReferences.map((ref, index) => `
      <button class="law-reference-item" type="button" data-law-ref-index="${index}">
        ${escapeHtml(ref.lawName)} ${escapeHtml(ref.article)}
      </button>
    `).join("")
  : `<p class="section-caption">감지된 법조항이 없습니다.</p>`;
```

Render `${lawItems}` in `.law-panel`.

- [ ] **Step 6: Add styles**

Append to `pipc_dashboard/styles.css`:

```css
.law-reference-item {
  display: block;
  width: 100%;
  margin-top: 8px;
  padding: 9px 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface-soft);
  color: var(--text);
  text-align: left;
  cursor: pointer;
}
```

- [ ] **Step 7: Run tests**

Run:

```powershell
cd pipc_dashboard
npm test
```

Expected: PASS.

- [ ] **Step 8: Commit**

Run:

```powershell
git add pipc_dashboard/src pipc_dashboard/tests pipc_dashboard/styles.css
git commit -m "feat: detect transcript law references"
```

Expected: commit succeeds.

---

### Task 7: Add Animation Timeline Model And Prototype Entry Point

**Files:**
- Create: `pipc_dashboard/src/animation-model.mjs`
- Create: `pipc_dashboard/tests/animation-model.test.mjs`
- Modify: `pipc_dashboard/src/renderers.mjs`
- Modify: `pipc_dashboard/src/main.mjs`
- Modify: `pipc_dashboard/styles.css`

- [ ] **Step 1: Write failing animation-model test**

Create `pipc_dashboard/tests/animation-model.test.mjs`:

```javascript
import test from "node:test";
import assert from "node:assert/strict";
import { buildAnimationTimeline, findSceneIndexByUtteranceId } from "../src/animation-model.mjs";

test("buildAnimationTimeline converts utterances into ordered scenes", () => {
  const timeline = buildAnimationTimeline({
    meeting: { id: "m1", meetingLabel: "2026년 제5회" },
    utterances: [
      { id: "u1", speaker: "위원장", text: "개의하겠습니다." },
      { id: "u2", speaker: "위원", text: "질문드리겠습니다." },
    ],
  });

  assert.equal(timeline.meetingId, "m1");
  assert.equal(timeline.scenes.length, 4);
  assert.equal(timeline.scenes[0].type, "opening");
  assert.equal(timeline.scenes[1].utteranceId, "u1");
  assert.equal(timeline.scenes[3].type, "closing");
});

test("findSceneIndexByUtteranceId supports transcript click jump", () => {
  const timeline = buildAnimationTimeline({
    meeting: { id: "m1", meetingLabel: "2026년 제5회" },
    utterances: [{ id: "u1", speaker: "위원장", text: "개의하겠습니다." }],
  });

  assert.equal(findSceneIndexByUtteranceId(timeline, "u1"), 1);
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```powershell
cd pipc_dashboard
npm test
```

Expected: FAIL with module-not-found for `src/animation-model.mjs`.

- [ ] **Step 3: Implement animation model**

Create `pipc_dashboard/src/animation-model.mjs`:

```javascript
export function buildAnimationTimeline({ meeting, utterances = [], characters = [] }) {
  const scenes = [
    {
      id: "opening",
      type: "opening",
      speaker: "system",
      text: `${meeting.meetingLabel} 회의를 시작합니다.`,
    },
    ...utterances.map((utterance, index) => ({
      id: `scene-${index + 1}`,
      type: "utterance",
      utteranceId: utterance.id,
      speaker: utterance.speaker,
      text: utterance.text,
    })),
    {
      id: "closing",
      type: "closing",
      speaker: "system",
      text: `${meeting.meetingLabel} 회의를 마칩니다.`,
    },
  ];

  return {
    meetingId: meeting.id,
    meetingLabel: meeting.meetingLabel,
    characters,
    scenes,
  };
}

export function findSceneIndexByUtteranceId(timeline, utteranceId) {
  return timeline.scenes.findIndex((scene) => scene.utteranceId === utteranceId);
}
```

- [ ] **Step 4: Render animation prototype shell**

Append to `pipc_dashboard/src/renderers.mjs`:

```javascript
export function renderAnimationViewer(timeline) {
  const sceneItems = timeline.scenes.map((scene, index) => `
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
          <p class="section-caption">${escapeHtml(timeline.meetingLabel)} 속기록 기반 장면 타임라인</p>
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
```

- [ ] **Step 5: Wire the animation button**

In `pipc_dashboard/src/main.mjs`, import `buildAnimationTimeline` and `renderAnimationViewer`. Add a click handler for `[data-animation-meeting-id]` that builds a timeline with a minimal utterance list from the selected meeting content.

Use this starter parser:

```javascript
function transcriptToUtterances(text) {
  return String(text || "")
    .split(/\n+/)
    .map((line, index) => ({ id: `u${index + 1}`, speaker: "속기록", text: line.trim() }))
    .filter((item) => item.text);
}
```

When the button is clicked, render `renderAnimationViewer(timeline)` into `#tab-meeting`.

- [ ] **Step 6: Add animation styles**

Append to `pipc_dashboard/styles.css`:

```css
.animation-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 14px;
}

.animation-stage {
  display: grid;
  align-content: center;
  gap: 18px;
  min-height: 460px;
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface-soft);
  text-align: center;
}

.meeting-room-line,
.meeting-room-table {
  padding: 16px;
  border: 1px solid var(--line-strong);
  border-radius: 8px;
  background: var(--surface);
  font-weight: 800;
}

.animation-timeline {
  max-height: 460px;
  overflow: auto;
  display: grid;
  gap: 8px;
}

.animation-scene-item {
  display: grid;
  gap: 5px;
  padding: 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  text-align: left;
}
```

- [ ] **Step 7: Run tests**

Run:

```powershell
cd pipc_dashboard
npm test
```

Expected: PASS.

- [ ] **Step 8: Commit**

Run:

```powershell
git add pipc_dashboard/src pipc_dashboard/tests pipc_dashboard/styles.css
git commit -m "feat: add transcript animation timeline prototype"
```

Expected: commit succeeds.

---

### Task 8: Add Commissioner Analysis Starter

**Files:**
- Create: `pipc_dashboard/src/commissioner-model.mjs`
- Create: `pipc_dashboard/src/character-assets.mjs`
- Create: `pipc_dashboard/tests/commissioner-model.test.mjs`
- Modify: `pipc_dashboard/src/renderers.mjs`
- Modify: `pipc_dashboard/src/main.mjs`

- [ ] **Step 1: Write failing commissioner-model test**

Create `pipc_dashboard/tests/commissioner-model.test.mjs`:

```javascript
import test from "node:test";
import assert from "node:assert/strict";
import { buildCommissionerAnalysisModel, normalizeCommissionerCharacters } from "../src/commissioner-model.mjs";

test("buildCommissionerAnalysisModel merges activity and character profiles", () => {
  const model = buildCommissionerAnalysisModel({
    commissionerActivity: [
      { commissioner_name: "송경희", total_utterances: 120, question_count: 30 },
    ],
    commissionerCharacters: [
      { id: "song_kyunghee", name: "송경희", top_tags: ["AI·데이터 활용 거버넌스"], character_type: "AI 정책 항해자" },
    ],
  });

  assert.equal(model.commissioners.length, 1);
  assert.equal(model.commissioners[0].name, "송경희");
  assert.equal(model.commissioners[0].characterType, "AI 정책 항해자");
  assert.deepEqual(model.commissioners[0].topTags, ["AI·데이터 활용 거버넌스"]);
});

test("normalizeCommissionerCharacters accepts existing characters.json array", () => {
  const characters = normalizeCommissionerCharacters([
    { id: "go_haksu", name: "고학수", character_type: "균형 조율형 의장" },
  ]);

  assert.equal(characters.length, 1);
  assert.equal(characters[0].id, "go_haksu");
  assert.equal(characters[0].name, "고학수");
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```powershell
cd pipc_dashboard
npm test
```

Expected: FAIL with module-not-found for `src/commissioner-model.mjs`.

- [ ] **Step 3: Implement commissioner model**

Create `pipc_dashboard/src/commissioner-model.mjs`:

```javascript
function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeCommissionerCharacters(value) {
  if (Array.isArray(value)) return value.filter((item) => item && item.name);
  if (Array.isArray(value?.characters)) return value.characters.filter((item) => item && item.name);
  return [];
}

export function buildCommissionerAnalysisModel(data = {}) {
  const charactersByName = new Map(normalizeCommissionerCharacters(data.commissionerCharacters).map((item) => [item.name, item]));
  const commissioners = (data.commissionerActivity || []).map((activity) => {
    const name = activity.commissioner_name || activity.name || "";
    const character = charactersByName.get(name) || {};
    return {
      name,
      totalUtterances: number(activity.total_utterances),
      questionCount: number(activity.question_count),
      characterType: character.character_type || "분석 대기",
      topTags: character.top_tags || [],
      evidenceLinks: [],
    };
  });

  return { commissioners };
}
```

- [ ] **Step 4: Add character profile loader**

Create `pipc_dashboard/src/character-assets.mjs`:

```javascript
import { normalizeCommissionerCharacters } from "./commissioner-model.mjs";

export async function loadCommissionerCharacters(url = "../pipc_knowledge_base/04_members/character_profiles/characters.json") {
  if (typeof fetch !== "function") return [];

  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return normalizeCommissionerCharacters(data);
  } catch (error) {
    console.warn("위원 캐릭터 프로필을 읽지 못했습니다.", error);
    return [];
  }
}
```

- [ ] **Step 5: Add commissioner renderer**

Append to `pipc_dashboard/src/renderers.mjs`:

```javascript
export function renderCommissionerAnalysis(model) {
  const rows = model.commissioners.map((item) => `
    <article class="commissioner-card">
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.characterType)}</p>
      <div class="kpi-meta">발언 ${formatNumber(item.totalUtterances)} · 질문 ${formatNumber(item.questionCount)}</div>
      <div class="tag-list">${item.topTags.map((tag) => `<span class="status-pill">${escapeHtml(tag)}</span>`).join("")}</div>
    </article>
  `).join("");

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
```

- [ ] **Step 6: Wire commissioner tab**

In `pipc_dashboard/src/main.mjs`, import `buildCommissionerAnalysisModel`, `loadCommissionerCharacters`, and `renderCommissionerAnalysis`. Add an async render helper so the separate commissioner menu uses the existing character profile JSON:

```javascript
async function renderCommissionerTab(dashboardData) {
  const commissionerTab = $("#tab-commissioner");
  if (!commissionerTab) return;

  const commissionerCharacters = await loadCommissionerCharacters();
  const commissionerModel = buildCommissionerAnalysisModel({
    commissionerActivity: dashboardData.commissionerActivity || [],
    commissionerCharacters,
  });
  commissionerTab.innerHTML = renderCommissionerAnalysis(commissionerModel);
}

renderCommissionerTab(dashboardData);
```

- [ ] **Step 7: Add styles**

Append to `pipc_dashboard/styles.css`:

```css
.commissioner-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.commissioner-card {
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}
```

- [ ] **Step 8: Run tests**

Run:

```powershell
cd pipc_dashboard
npm test
```

Expected: PASS.

- [ ] **Step 9: Commit**

Run:

```powershell
git add pipc_dashboard/src pipc_dashboard/tests pipc_dashboard/styles.css
git commit -m "feat: add commissioner analysis starter"
```

Expected: commit succeeds.

---

### Task 9: Add Text-First New Agenda Preparation Assistant Starter

**Files:**
- Create: `pipc_dashboard/src/agenda-assistant-model.mjs`
- Create: `pipc_dashboard/tests/agenda-assistant-model.test.mjs`
- Modify: `pipc_dashboard/src/renderers.mjs`
- Modify: `pipc_dashboard/src/main.mjs`
- Modify: `pipc_dashboard/styles.css`

- [ ] **Step 1: Write failing agenda-assistant test**

Create `pipc_dashboard/tests/agenda-assistant-model.test.mjs`:

```javascript
import test from "node:test";
import assert from "node:assert/strict";
import { buildAgendaPreparationResult } from "../src/agenda-assistant-model.mjs";

test("buildAgendaPreparationResult ranks similar agenda text", () => {
  const result = buildAgendaPreparationResult({
    title: "안전조치의무 위반 검토",
    summary: "접속기록 보관과 접근통제 미흡이 문제된 사안",
    historicalAgendas: [
      { title: "접속기록 안전조치 위반", keywords: ["접속기록", "안전조치"], disposition: "과징금" },
      { title: "개인정보 처리방침 개선", keywords: ["처리방침"], disposition: "개선권고" },
    ],
  });

  assert.equal(result.similarAgendas[0].title, "접속기록 안전조치 위반");
  assert.ok(result.expectedIssues.includes("접속기록"));
  assert.ok(result.checklist.length > 0);
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```powershell
cd pipc_dashboard
npm test
```

Expected: FAIL with module-not-found for `src/agenda-assistant-model.mjs`.

- [ ] **Step 3: Implement assistant model**

Create `pipc_dashboard/src/agenda-assistant-model.mjs`:

```javascript
function tokenize(text) {
  return [...new Set(String(text || "").match(/[가-힣A-Za-z0-9]+/g) || [])];
}

function scoreAgenda(queryTokens, agenda) {
  const agendaTokens = new Set(tokenize([agenda.title, ...(agenda.keywords || [])].join(" ")));
  return queryTokens.filter((token) => agendaTokens.has(token)).length;
}

export function buildAgendaPreparationResult({ title, summary, historicalAgendas = [] }) {
  const queryTokens = tokenize(`${title} ${summary}`);
  const similarAgendas = historicalAgendas
    .map((agenda) => ({ ...agenda, score: scoreAgenda(queryTokens, agenda) }))
    .filter((agenda) => agenda.score > 0)
    .sort((a, b) => b.score - a.score);

  const expectedIssues = queryTokens.filter((token) =>
    ["접속기록", "안전조치", "유출", "과징금", "공표", "AI"].includes(token)
  );

  return {
    similarAgendas,
    expectedIssues,
    similarProvisions: expectedIssues.includes("안전조치") ? ["개인정보 보호법 제29조"] : [],
    commissionerQuestions: [],
    checklist: [
      "유사 안건의 처분 수준을 확인한다.",
      "회의 당시 적용 조문과 현재 조문 차이를 확인한다.",
      "위원별 예상 질문을 사전 답변 메모로 정리한다.",
    ],
  };
}
```

- [ ] **Step 4: Add assistant renderer**

Append to `pipc_dashboard/src/renderers.mjs`:

```javascript
export function renderAgendaAssistant() {
  return `
    <section class="section-band">
      <div class="section-header">
        <div>
          <h2>새 안건 준비 도우미</h2>
          <p class="section-caption">안건명과 요약을 입력하면 유사 안건, 예상 쟁점, 준비 체크리스트를 생성합니다.</p>
        </div>
      </div>
      <form class="assistant-form" data-agenda-form>
        <label class="field-label">
          <span>안건명</span>
          <input name="title" type="text" placeholder="예: 안전조치의무 위반 검토">
        </label>
        <label class="field-label">
          <span>안건 요약</span>
          <textarea name="summary" rows="7" placeholder="사안 개요와 검토 포인트를 붙여 넣으세요."></textarea>
        </label>
        <button class="tool-button" type="submit">분석하기</button>
      </form>
      <div class="assistant-result" id="assistant-result"></div>
    </section>
  `;
}

export function renderAgendaPreparationResult(result) {
  const similar = result.similarAgendas.map((item) => `<li>${escapeHtml(item.title)} · ${escapeHtml(item.disposition || "")}</li>`).join("");
  const issues = result.expectedIssues.map((item) => `<span class="status-pill">${escapeHtml(item)}</span>`).join("");
  const checklist = result.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  return `
    <div class="assistant-result-grid">
      <section><h3>유사 안건</h3><ul>${similar || "<li>유사 안건 후보 없음</li>"}</ul></section>
      <section><h3>예상 쟁점</h3><div class="tag-list">${issues || "감지된 핵심 쟁점 없음"}</div></section>
      <section><h3>준비 체크리스트</h3><ul>${checklist}</ul></section>
    </div>
  `;
}
```

- [ ] **Step 5: Wire assistant form**

In `pipc_dashboard/src/main.mjs`, import `buildAgendaPreparationResult`, `renderAgendaAssistant`, and `renderAgendaPreparationResult`. Render assistant tab and handle submit:

```javascript
const assistantTab = $("#tab-assistant");
if (assistantTab) assistantTab.innerHTML = renderAgendaAssistant();

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-agenda-form]");
  if (!form) return;
  event.preventDefault();
  const formData = new FormData(form);
  const result = buildAgendaPreparationResult({
    title: formData.get("title"),
    summary: formData.get("summary"),
    historicalAgendas: (dashboardData.majorPenaltyCases || []).map((item) => ({
      title: item.agenda_title || item.case_title || item.target_name || "과거 안건",
      keywords: [item.target_name, item.law_article, item.sanction_type].filter(Boolean),
      disposition: item.sanction_type || item.amount_total_krw ? "제재·처분" : "",
    })),
  });
  const resultNode = $("#assistant-result");
  if (resultNode) resultNode.innerHTML = renderAgendaPreparationResult(result);
});
```

- [ ] **Step 6: Add styles**

Append to `pipc_dashboard/styles.css`:

```css
.assistant-form {
  display: grid;
  gap: 12px;
  max-width: 860px;
}

.field-label {
  display: grid;
  gap: 6px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 800;
}

.field-label input,
.field-label textarea,
.field-label select {
  width: 100%;
  padding: 10px 11px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text);
}

.assistant-result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.assistant-result-grid section {
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
}
```

- [ ] **Step 7: Run tests**

Run:

```powershell
cd pipc_dashboard
npm test
```

Expected: PASS.

- [ ] **Step 8: Commit**

Run:

```powershell
git add pipc_dashboard/src pipc_dashboard/tests pipc_dashboard/styles.css
git commit -m "feat: add text-first agenda assistant"
```

Expected: commit succeeds.

---

### Task 10: Final Verification And Handoff

**Files:**
- Modify: `pipc_dashboard/README.md`

- [ ] **Step 1: Run all tests**

Run:

```powershell
cd pipc_dashboard
npm test
```

Expected: all test files pass.

- [ ] **Step 2: Run local server**

Run:

```powershell
cd pipc_dashboard
npm run serve
```

Expected: server prints `PIPC dashboard: http://127.0.0.1:5174/`.

- [ ] **Step 3: Browser verification**

Open `http://127.0.0.1:5174/` and verify:

- Situation board renders with KPI cards.
- Meeting cards render and can open meeting detail.
- Meeting detail includes `애니메이션으로 보기`.
- Animation viewer opens from a meeting detail.
- Commissioner tab renders starter cards.
- New agenda assistant accepts text and renders analysis output.

- [ ] **Step 4: Update README**

Replace the broken-encoding content in `pipc_dashboard/README.md` with:

```markdown
# PIPC Dashboard

개인정보보호위원회 전체회의 내부 업무도구입니다.

## 실행

```powershell
cd pipc_dashboard
npm run serve
```

브라우저에서 `http://127.0.0.1:5174/`를 엽니다.

## 테스트

```powershell
cd pipc_dashboard
npm test
```

## 데이터 갱신

```powershell
node tools/fetch-dashboard-data.mjs
```

`SUPABASE_ACCESS_TOKEN`이 현재 환경에 설정되어 있어야 합니다.

## 현재 MVP 범위

- 회의 운영 상황판
- 회의 상세 탐색
- 법조항 참조 감지와 비교 패널 구조
- 선택형 회의 애니메이션 프로토타입
- 위원별 분석 초기 화면
- 텍스트 입력 기반 새 안건 준비 도우미
```

- [ ] **Step 5: Commit**

Run:

```powershell
git add pipc_dashboard/README.md
git commit -m "docs: update PIPC dashboard usage"
```

Expected: commit succeeds.

- [ ] **Step 6: Summarize remaining work**

Report:

- Tests run and result.
- Local URL.
- Any missing data fields discovered.
- Whether korean-law-mcp historical lookup was verified or still needs a direct adapter task.
- Which follow-up plan should come next: animation completeness, commissioner scoring, or agenda assistant retrieval quality.
