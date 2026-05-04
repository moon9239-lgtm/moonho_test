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

test("buildMeetingDetailModel does not fallback when transcript id is missing", () => {
  const detail = buildMeetingDetailModel(dashboardFixture, "missing-id");

  assert.equal(detail.meeting, null);
  assert.equal(detail.transcriptText, "");
  assert.deepEqual(detail.relatedDocuments, []);
});

test("buildMeetingDetailModel falls back to first meeting only without transcript id", () => {
  const detail = buildMeetingDetailModel(dashboardFixture);

  assert.equal(detail.meeting.id, "2025-24");
});

test("buildMeetingDetailModel handles empty meeting transcripts", () => {
  const detail = buildMeetingDetailModel({ meetingTranscripts: [] });

  assert.equal(detail.meeting, null);
});

test("renderMeetingDetail includes animation action", () => {
  const detail = buildMeetingDetailModel(dashboardFixture, "2025-24");
  const html = renderMeetingDetail(detail);

  assert.match(html, /회의 상세/);
  assert.match(html, /애니메이션으로 보기/);
  assert.match(html, /속기록/);
});

test("renderMeetingDetail escapes detail fields", () => {
  const html = renderMeetingDetail({
    meeting: {
      id: `<script>alert("id")</script>`,
      meetingLabel: "회의 <b>라벨</b>",
      date: "2026-05-05",
    },
    transcriptText: `<script>alert("transcript")</script>`,
    relatedDocuments: [
      {
        label: "원문",
        path: `docs/<raw>&"path".md`,
      },
    ],
  });

  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /<b>/);
  assert.match(html, /data-animation-meeting-id="&lt;script&gt;alert\(&quot;id&quot;\)&lt;\/script&gt;"/);
  assert.match(html, /&lt;script&gt;alert\(&quot;transcript&quot;\)&lt;\/script&gt;/);
  assert.match(html, /href="docs\/&lt;raw&gt;&amp;&quot;path&quot;.md"/);
});
