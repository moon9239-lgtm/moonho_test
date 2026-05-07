# Altivo Dashboard Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current pastel Dribbble visual experiment with an Altivo-inspired productivity dashboard treatment while preserving the PIPC dashboard's dense public-data workflows.

**Architecture:** Keep the static dashboard architecture intact and implement the refresh as a CSS-only override layer in `pipc_dashboard/styles.css`. Replace the current `/* Dribbble-inspired visual refresh layer */` block rather than appending another competing layer, so future edits have one visual source of truth.

**Tech Stack:** Static HTML, CSS custom properties, vanilla JavaScript renderers, Node test runner, existing local static server.

---

## File Structure

- Modify: `pipc_dashboard/styles.css`
  - Owns all visual token, layout, component, responsive, and role-color changes.
  - The existing old visual refresh block starts at `/* Dribbble-inspired visual refresh layer */`; replace that block through the end of the file with the Altivo layer.
- Read only: `pipc_dashboard/index.html`
  - Confirm existing nav `data-tab` hooks are enough; avoid markup edits unless a CSS-only hook is impossible.
- Read only: `pipc_dashboard/src/renderers.mjs`
  - Confirm class names used by search, meeting, law drawer, commissioner cards, assistant, and animation views.
- Verify only: `pipc_dashboard/tests/*.test.mjs`
  - Existing tests should continue to pass. Add tests only if implementation accidentally requires markup or class contract changes.
- Keep: `pipc_dashboard/docs/superpowers/specs/2026-05-08-altivo-dashboard-refresh-design.md`
  - Source design spec.

## Task 1: Replace The Visual Override Boundary

**Files:**
- Modify: `pipc_dashboard/styles.css`

- [x] **Step 1: Locate the old visual layer**

Run:

```powershell
Select-String -Path pipc_dashboard\styles.css -Pattern '/\* Dribbble-inspired visual refresh layer \*/' -Context 0,3
```

Expected: one match near the end of `styles.css`.

- [ ] **Step 2: Replace the old block header**

Change the existing block marker to:

```css
/* Altivo-inspired productivity refresh layer */
```

This confirms the file has one current visual layer.

- [x] **Step 3: Establish Altivo tokens**

Inside the override block, define these tokens:

```css
:root {
  --bg: #f7f7f2;
  --bg-soft: #f1f4ec;
  --surface: #ffffff;
  --surface-strong: #fffdf7;
  --surface-muted: #f4f6ef;
  --ink: #151713;
  --ink-soft: #3b4138;
  --muted: #71796c;
  --line: #dfe5d7;
  --line-strong: #cbd5c1;
  --green: #1f8f5f;
  --green-strong: #146c49;
  --green-soft: #e2f4e8;
  --orange: #f29f45;
  --orange-strong: #b96317;
  --orange-soft: #fff0dc;
  --blue: #406fd0;
  --blue-soft: #e6edff;
  --red: #d95b4f;
  --red-soft: #ffe8e3;
  --shadow-soft: 0 10px 28px rgba(25, 35, 20, 0.08);
  --shadow-card: 0 6px 16px rgba(25, 35, 20, 0.06);
  --radius: 8px;
  --radius-sm: 6px;
}
```

- [x] **Step 4: Remove one-note pastel remnants from the override**

Search the override block for the previous dominant palette values:

```powershell
Select-String -Path pipc_dashboard\styles.css -Pattern '#736894|#f8b1a8|#b2c7dc|#603e43|Dribbble-inspired'
```

Expected after cleanup: no `Dribbble-inspired`; old colors appear only if deliberately retained as legacy code before the override block.

## Task 2: Repaint The Shell And Navigation

**Files:**
- Modify: `pipc_dashboard/styles.css`

- [x] **Step 1: Restyle the app canvas**

Implement a crisp productivity workspace:

```css
body {
  background:
    linear-gradient(180deg, #fbfbf6 0%, var(--bg) 46%, #f4f1e8 100%);
  color: var(--ink);
}

.app-shell {
  grid-template-columns: 268px minmax(0, 1fr);
  background: transparent;
}

.main-content {
  background: transparent;
}
```

- [x] **Step 2: Restyle sidebar and brand**

Use a compact rail with white status surfaces:

```css
.sidebar {
  padding: 22px 18px;
  background: rgba(255, 255, 250, 0.88);
  border-right: 1px solid var(--line);
  box-shadow: 12px 0 32px rgba(28, 40, 22, 0.05);
}

.brand {
  min-height: 58px;
}

.brand-mark {
  border-radius: var(--radius);
  background: var(--ink);
  color: #ffffff;
  box-shadow: inset 0 -4px 0 rgba(31, 143, 95, 0.35);
}

.brand-title {
  color: var(--ink);
  font-weight: 900;
}

.brand-subtitle {
  color: var(--muted);
}
```

- [x] **Step 3: Restyle navigation items**

Make active navigation feel like a productivity app command:

```css
.nav-item {
  min-height: 46px;
  border-radius: var(--radius);
  border: 1px solid transparent;
  color: var(--ink-soft);
  font-weight: 800;
}

.nav-item:hover {
  background: var(--surface);
  border-color: var(--line);
}

.nav-item.active {
  background: var(--ink);
  border-color: var(--ink);
  color: #ffffff;
  box-shadow: var(--shadow-card);
}

.nav-item.active::before {
  background: var(--green);
}
```

- [x] **Step 4: Restyle nav icons with geometric Altivo-like marks**

Keep the existing `data-tab` hooks:

```css
.nav-icon {
  border-radius: var(--radius-sm);
  background: var(--green-soft);
  border-color: rgba(31, 143, 95, 0.28);
}

.nav-item.active .nav-icon {
  background: var(--green);
  border-color: rgba(255, 255, 255, 0.35);
}

.nav-item[data-tab="search"] .nav-icon,
.nav-item[data-tab="meeting"] .nav-icon {
  background: var(--blue-soft);
  border-color: rgba(64, 111, 208, 0.25);
}

.nav-item[data-tab="assistant"] .nav-icon {
  background: var(--orange-soft);
  border-color: rgba(242, 159, 69, 0.3);
}
```

## Task 3: Repaint Shared Dashboard Components

**Files:**
- Modify: `pipc_dashboard/styles.css`

- [x] **Step 1: Restyle headers and section surfaces**

Use strong title contrast and flatter panels:

```css
.topbar {
  border-bottom: 1px solid var(--line);
  background: rgba(247, 247, 242, 0.86);
  backdrop-filter: blur(14px);
}

.topbar h1,
.section-header h2,
.section-title {
  color: var(--ink);
  letter-spacing: 0;
}

.section-band,
.content-card,
.search-control-panel,
.meeting-overview-card,
.law-drawer-panel {
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: var(--surface);
  box-shadow: var(--shadow-card);
}
```

- [x] **Step 2: Restyle buttons and inputs**

Keep clear command affordances:

```css
button,
.btn,
.link-button {
  border-radius: var(--radius-sm);
}

.primary-button,
.animation-action-primary,
button[data-start-animation] {
  background: var(--ink);
  border-color: var(--ink);
  color: #ffffff;
}

.primary-button:hover,
.animation-action-primary:hover,
button[data-start-animation]:hover {
  background: var(--green-strong);
  border-color: var(--green-strong);
}

input,
select,
textarea {
  border-color: var(--line-strong);
  background: #ffffff;
  color: var(--ink);
}

input:focus,
select:focus,
textarea:focus,
button:focus-visible {
  outline: 3px solid rgba(31, 143, 95, 0.22);
  outline-offset: 2px;
}
```

- [x] **Step 3: Restyle chips and status labels**

Use role-like color semantics:

```css
.status-pill,
.tag-list span,
.law-chip,
.meta-chip {
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  background: var(--surface-muted);
  color: var(--ink-soft);
}

.law-chip,
.data-pill-law,
.provision-chip {
  background: var(--blue-soft);
  border-color: rgba(64, 111, 208, 0.2);
  color: var(--blue);
}
```

## Task 4: Repaint Integrated Status And Search

**Files:**
- Modify: `pipc_dashboard/styles.css`

- [x] **Step 1: Restyle KPI cards as productivity widgets**

Implement compact strong cards:

```css
.kpi-card {
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.kpi-card::before {
  background: var(--green);
  border-radius: var(--radius-sm);
}

.kpi-card strong,
.kpi-value {
  color: var(--ink);
  font-weight: 900;
}
```

- [x] **Step 2: Restyle operations panels and tables**

Keep data dense:

```css
.ops-panel,
.rank-card,
.table-wrap {
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: #ffffff;
  box-shadow: none;
}

thead th {
  background: var(--surface-muted);
  color: var(--ink-soft);
}

tbody tr:hover {
  background: #fbf8ef;
}
```

- [x] **Step 3: Restyle integrated search workbench**

Make search the strongest command surface:

```css
.integrated-search-layout {
  gap: 18px;
}

.search-control-panel {
  background:
    linear-gradient(180deg, #ffffff 0%, #fffaf1 100%);
}

.search-control-panel input[type="search"],
.search-control-panel .search-input {
  min-height: 46px;
  border-color: rgba(31, 143, 95, 0.38);
  box-shadow: inset 0 0 0 1px rgba(31, 143, 95, 0.08);
}
```

- [x] **Step 4: Restyle search result cards**

Keep target/legal/result zones visible:

```css
.search-result-card {
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.search-result-card header {
  border-bottom: 1px solid var(--line);
}

.target-chip {
  background: var(--green-soft);
  color: var(--green-strong);
}

.result-chip,
.disposition-chip {
  background: var(--orange-soft);
  color: var(--orange-strong);
}
```

## Task 5: Repaint Meeting Transcript And Law Drawer

**Files:**
- Modify: `pipc_dashboard/styles.css`

- [x] **Step 1: Restyle meeting selector and agenda list**

```css
.meeting-picker,
.agenda-jump-list {
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: var(--surface);
}

.agenda-jump {
  border-radius: var(--radius-sm);
  border-color: var(--line);
  color: var(--ink-soft);
}

.agenda-jump:hover,
.agenda-jump.active {
  background: var(--ink);
  border-color: var(--ink);
  color: #ffffff;
}
```

- [x] **Step 2: Restyle agenda section dividers**

```css
.utterance-agenda-heading,
.agenda-section-heading {
  border-radius: var(--radius);
  background: var(--ink);
  color: #ffffff;
  box-shadow: var(--shadow-card);
}

.utterance-agenda-heading small,
.agenda-section-heading small {
  color: rgba(255, 255, 255, 0.72);
}
```

- [x] **Step 3: Restyle utterance cards as meeting log entries**

```css
.utterance-card {
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: var(--surface);
  box-shadow: none;
}

.utterance-card[data-speaker-kind="commissioner"],
.utterance-card.speaker-commissioner {
  border-left: 4px solid var(--green);
}

.utterance-card[data-speaker-kind="staff"],
.utterance-card.speaker-staff,
.utterance-card.speaker-secretariat {
  border-left: 4px solid var(--orange);
}
```

- [x] **Step 4: Restyle law drawer**

```css
.law-drawer-panel {
  background: #fffef8;
  border-left: 1px solid var(--line-strong);
}

.law-version-card,
.law-article-card {
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: #ffffff;
}

.law-version-card.current,
.law-article-card.current {
  border-color: rgba(31, 143, 95, 0.32);
}
```

## Task 6: Repaint Commissioner, Animation, And Assistant Surfaces

**Files:**
- Modify: `pipc_dashboard/styles.css`

- [x] **Step 1: Preserve one-column commissioner cards**

Keep portraits large and uncropped:

```css
.commissioner-card {
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.commissioner-portrait {
  border-radius: var(--radius);
  background: var(--surface-muted);
  overflow: hidden;
}

.commissioner-portrait img {
  object-fit: contain;
  object-position: center bottom;
}
```

- [x] **Step 2: Apply role accents**

```css
.commissioner-card-chair::before {
  background: var(--green);
}

.commissioner-card-vice::before,
.commissioner-card-executive::before {
  background: var(--orange);
}

.commissioner-card-member::before {
  background: var(--blue);
}
```

- [x] **Step 3: Restyle animation view**

```css
.rendered-animation-panel,
.animation-stage,
.animation-scene-list {
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: var(--surface);
}

.animation-scene-item.active {
  background: var(--ink);
  border-color: var(--ink);
  color: #ffffff;
}
```

- [x] **Step 4: Restyle assistant view**

```css
.assistant-panel,
.agenda-assistant-panel,
.assistant-result-card {
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: var(--surface);
  box-shadow: var(--shadow-card);
}
```

## Task 7: Responsive And Visual Verification

**Files:**
- Modify: `pipc_dashboard/styles.css`
- Verify only: `pipc_dashboard/docs/superpowers/plans/2026-05-08-altivo-dashboard-refresh.md`

- [x] **Step 1: Keep mobile sidebar usable**

Update responsive rules inside the Altivo override:

```css
@media (max-width: 960px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: relative;
    height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }

  .nav-list {
    display: grid;
    grid-template-columns: 1fr;
  }
}
```

- [x] **Step 2: Keep cards compact on narrow widths**

```css
@media (max-width: 760px) {
  .section-band,
  .content-card,
  .search-result-card,
  .commissioner-card {
    border-radius: var(--radius);
  }

  .topbar h1 {
    font-size: clamp(1.45rem, 8vw, 2rem);
  }
}
```

- [x] **Step 3: Run automated checks**

Run:

```powershell
cd pipc_dashboard
npm.cmd test
node --check app.js
node --check standalone.js
node --check src\renderers.mjs
```

Expected:

- `npm.cmd test` reports 70 passing tests.
- Each `node --check` command exits with code `0`.

- [x] **Step 4: Browser smoke check**

Use the existing local server at `http://127.0.0.1:5190/pipc_dashboard/` if it is running, otherwise start it:

```powershell
cd pipc_dashboard
npm.cmd run serve
```

Open the dashboard and check:

- `통합 현황` renders with Altivo tokens and no removed widgets restored.
- `안건 통합검색` has the stronger command-style search panel.
- `회의별 속기록 조회` agenda headings and utterance role colors remain clear.
- Clicking a law chip opens the law drawer without overlap.
- `위원별 대시보드` portraits are not vertically cropped.
- `신규 안건 도우미` uses the same workbench panel treatment.

- [x] **Step 5: Record verification in this plan**

After checks pass, mark completed boxes in this plan and note any visual verification gaps in the final response.

## Self-Review

- Spec coverage: shell, status dashboard, search, meeting transcript, law drawer, commissioner dashboard, animation, assistant, responsive behavior, and verification are covered.
- Placeholder scan: no TBD/TODO placeholders are present.
- Type consistency: this plan uses existing CSS class names and does not introduce JavaScript APIs or data contracts.
