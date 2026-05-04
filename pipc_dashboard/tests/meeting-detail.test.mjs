import test from "node:test";
import assert from "node:assert/strict";
import { buildMeetingDetailModel } from "../src/data-model.mjs";
import { renderMeetingDetail } from "../src/renderers.mjs";
import { dashboardFixture } from "./fixtures/dashboard-fixture.mjs";

test("buildMeetingDetailModel finds a meeting by transcript id", () => {
  const detail = buildMeetingDetailModel(dashboardFixture, "2025-24");

  assert.equal(detail.meeting.id, "2025-24");
  assert.equal(detail.meeting.meetingLabel, "2025년 제24회 전체회의");
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

test("buildMeetingDetailModel attaches law references with meeting date", () => {
  const detail = buildMeetingDetailModel({
    meetingTranscripts: [
      {
        id: "law-meeting",
        meeting_date: "2025-08-27",
        meeting_year: 2025,
        meeting_number: 12,
        content: "개인정보 보호법 제29조 및 같은 법 제34조 제1항을 검토하였다.",
      },
    ],
  }, "law-meeting");

  assert.equal(detail.lawReferences.length, 2);
  assert.equal(detail.lawReferences[0].meetingDate, "2025-08-27");
  assert.equal(detail.lawReferences[1].lawName, "개인정보 보호법");
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

test("renderMeetingDetail renders law references with fallback and escaping", () => {
  const fallbackHtml = renderMeetingDetail({
    meeting: { id: "empty", meetingLabel: "empty", date: "2025-08-27" },
    transcriptText: "",
    relatedDocuments: [],
    lawReferences: [],
  });
  const html = renderMeetingDetail({
    meeting: { id: "law", meetingLabel: "law", date: "2025-08-27" },
    transcriptText: "",
    relatedDocuments: [],
    lawReferences: [
      { lawName: "개인정보 보호법<script>", article: "제29조", meetingDate: "2025-08-27" },
    ],
  });

  assert.match(fallbackHtml, /감지된 법조항이 없습니다\./);
  assert.match(html, /class="law-reference-item"/);
  assert.match(html, /개인정보 보호법&lt;script&gt; 제29조/);
  assert.doesNotMatch(html, /개인정보 보호법<script>/);
});

test("renderMeetingDetail falls back when law references is not an array", () => {
  const html = renderMeetingDetail({
    meeting: { id: "oops", meetingLabel: "oops", date: "2025-08-27" },
    transcriptText: "",
    relatedDocuments: [],
    lawReferences: "oops",
  });

  assert.match(html, /감지된 법조항이 없습니다\./);
});
