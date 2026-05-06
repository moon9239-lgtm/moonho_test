# Integrated Search Enrichment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enrich the integrated agenda search with reliable issue, disposition, amount, source-confidence, and similar-agenda context without reintroducing noisy speaker/keyword facets.

**Architecture:** Keep extraction in `tools/build-meeting-analysis-index.mjs` so the static UI reads a prepared, auditable model. Keep browser filtering in `src/main.mjs`, and render only confirmed or explicitly inferred fields in `src/renderers.mjs`.

**Tech Stack:** Node ESM, static dashboard JavaScript, `node:test`.

---

### Task 1: Lock Search Card Expectations

**Files:**
- Modify: `tests/renderers.test.mjs`
- Modify: `tests/search-model.test.mjs`

- [ ] Write tests that require integrated search cards to render `주요 쟁점`, `조치 결과`, `출처 신뢰도`, and `유사 안건`.
- [ ] Write tests that require issue/disposition filters to narrow rows while speaker and keyword facets stay unavailable.
- [ ] Run focused tests and confirm they fail before implementation.

### Task 2: Add Enriched Agenda Fields

**Files:**
- Modify: `tools/build-meeting-analysis-index.mjs`

- [ ] Add deterministic issue taxonomy extraction from agenda title, utterances, and law labels.
- [ ] Match penalty rows to agenda case numbers and expose disposition labels, total amount, case IDs, and source confidence.
- [ ] Add similar-agenda IDs from shared targets, law articles, issue tags, and disposition tags.
- [ ] Keep procedural rows excluded from `searchIndex`.

### Task 3: Render Enriched Search Cards

**Files:**
- Modify: `src/renderers.mjs`
- Modify: `styles.css`

- [ ] Add issue/disposition/source-confidence sections to result cards.
- [ ] Add issue/disposition filters to the form.
- [ ] Add a compact similar-agenda list under each result.

### Task 4: Wire Filtering and Scoring

**Files:**
- Modify: `src/main.mjs`

- [ ] Include issue/disposition facets in searchable text and scoring.
- [ ] Apply issue/disposition dropdown filters.
- [ ] Preserve target/law-focused search behavior.

### Task 5: Regenerate and Verify

**Files:**
- Regenerate: `data/meeting-analysis-index.js`

- [ ] Run `node tools\build-meeting-analysis-index.mjs`.
- [ ] Run `node --test --test-isolation=none tests\*.test.mjs`.
- [ ] Smoke-check the served dashboard URL.
