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
