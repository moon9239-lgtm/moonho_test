import test from "node:test";
import assert from "node:assert/strict";
import { buildSituationBoardModel } from "../src/data-model.mjs";
import { renderAnimationViewer, renderSituationBoard } from "../src/renderers.mjs";
import { dashboardFixture } from "./fixtures/dashboard-fixture.mjs";

test("renderSituationBoard includes operational KPIs and meeting cards", () => {
  const html = renderSituationBoard(buildSituationBoardModel(dashboardFixture));

  assert.match(html, /총 회의 수/);
  assert.match(html, /44/);
  assert.match(html, /총 안건 수/);
  assert.match(html, /2025년 제24회/);
  assert.match(html, /제재·처분 신호/);
});

test("renderSituationBoard escapes model text fields", () => {
  const html = renderSituationBoard({
    updatedAt: "<script>alert('updated')</script>",
    kpis: {
      totalMeetings: { label: "Meetings", value: 1 },
    },
    meetingCards: [
      {
        id: `<script>alert("id")</script>`,
        meetingLabel: `<script>alert("meeting")</script>`,
        date: "2026-05-05",
      },
    ],
    signals: { majorPenaltyCases: [] },
  });

  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;alert\(&#039;updated&#039;\)&lt;\/script&gt;/);
  assert.match(html, /data-meeting-id="&lt;script&gt;alert\(&quot;id&quot;\)&lt;\/script&gt;"/);
  assert.match(html, /&lt;script&gt;alert\(&quot;meeting&quot;\)&lt;\/script&gt;/);
});

test("renderSituationBoard tolerates partial models", () => {
  assert.doesNotThrow(() => renderSituationBoard({}));
  assert.doesNotThrow(() =>
    renderSituationBoard({
      kpis: {},
      meetingCards: [],
    }),
  );
});

test("renderSituationBoard renders invalid numbers as zero", () => {
  const html = renderSituationBoard({
    kpis: {
      nan: { label: "Invalid number", value: Number.NaN },
      infinity: { label: "Infinite number", value: Infinity },
      symbol: { label: "Symbol value", value: Symbol("invalid") },
    },
  });

  assert.doesNotMatch(html, /NaN/);
  assert.doesNotMatch(html, /Infinity/);
  assert.match(html, /<div class="kpi-value">0<\/div>/);
});

test("renderAnimationViewer escapes timeline scene text", () => {
  const html = renderAnimationViewer({
    meetingLabel: `<script>alert("meeting")</script>`,
    scenes: [
      { speaker: `<script>alert("speaker")</script>`, text: `<script>alert("text")</script>` },
    ],
  });

  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;alert\(&quot;meeting&quot;\)&lt;\/script&gt;/);
  assert.match(html, /&lt;script&gt;alert\(&quot;speaker&quot;\)&lt;\/script&gt;/);
  assert.match(html, /&lt;script&gt;alert\(&quot;text&quot;\)&lt;\/script&gt;/);
});

test("renderAnimationViewer tolerates null timeline and invalid scenes", () => {
  assert.doesNotThrow(() => renderAnimationViewer(null));
  assert.doesNotThrow(() => renderAnimationViewer({ scenes: "bad" }));

  const html = renderAnimationViewer(null);
  assert.match(html, /animation-viewer/);
  assert.doesNotMatch(html, /animation-scene-item/);
});
