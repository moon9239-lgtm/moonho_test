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
