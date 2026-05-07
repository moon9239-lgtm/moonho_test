import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildMeetingDetailModel } from "../src/data-model.mjs";
import { renderMeetingDetail } from "../src/renderers.mjs";
import { dashboardFixture } from "./fixtures/dashboard-fixture.mjs";

test("buildMeetingDetailModel finds a meeting by transcript id", () => {
  const detail = buildMeetingDetailModel(dashboardFixture, "2025-24");

  assert.equal(detail.meeting.id, "2025-24");
  assert.equal(detail.meeting.meetingLabel, "2025년 제24회 전체회의");
  assert.equal(detail.lawReferences.length, 0);
});

test("buildMeetingDetailModel keeps all meetings available for the transcript selector", () => {
  const detail = buildMeetingDetailModel({
    meetingTranscripts: [
      { id: "meeting-a", meeting_date: "2026-03-25", meeting_title: "2026년 제5회 보호위원회" },
      { id: "meeting-b", meeting_date: "2026-03-11", meeting_title: "2026년 제4회 보호위원회" },
    ],
  }, "meeting-b");

  assert.deepEqual(detail.meetingOptions.map((item) => item.id), ["meeting-a", "meeting-b"]);
  assert.equal(detail.meetingOptions[0].selected, false);
  assert.equal(detail.meetingOptions[1].selected, true);
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

test("buildMeetingDetailModel derives agenda list from utterance sections when embedded agendas are missing", () => {
  const detail = buildMeetingDetailModel({
    meetingTranscripts: [
      { id: "section-only", meeting_date: "2024-07-24", meeting_title: "2024년 제13회 보호위원회" },
    ],
  }, "section-only", {
    detailIndex: {
      meetings: {
        "section-only": {
          meeting: { meetingLabel: "2024년 제13회 보호위원회", date: "2024-07-24" },
          agendas: [],
          utterances: [
            { id: "utt-1", sectionTitle: "개회선언", speakerName: "위원장", text: "개회합니다." },
            { id: "utt-2", sectionTitle: "안건현황 설명 및 회의 공개여부 결정", speakerName: "위원장", text: "공개여부를 결정합니다." },
            { id: "utt-3", sectionTitle: "안건현황 설명 및 회의 공개여부 결정", speakerName: "위원", text: "동의합니다." },
          ],
        },
      },
    },
  });

  assert.equal(detail.agendas.length, 2);
  assert.equal(detail.agendas[0].title, "개회선언");
  assert.equal(detail.agendas[0].startUtteranceId, "utt-1");
  assert.equal(detail.agendas[1].utteranceCount, 2);
});

test("buildMeetingDetailModel repairs split embedded agenda sections before rendering jumps", () => {
  const detail = buildMeetingDetailModel({
    meetingTranscripts: [
      { id: "split-meeting", meeting_date: "2026-02-11", meeting_title: "2026년 제3회 보호위원회" },
    ],
  }, "split-meeting", {
    detailIndex: {
      meetings: {
        "split-meeting": {
          meeting: { meetingLabel: "2026년 제3회 보호위원회", date: "2026-02-11" },
          agendas: [
            {
              id: "agenda-1",
              title: "가. 공공 AX 혁신지원 위한「사전적정성 검토」결과에 관한 건 (의안",
              type: "절차",
              startUtteranceId: "",
            },
            {
              id: "agenda-2",
              title: "가. 공공기관의 주요 개인정보 처리시스템ㆍ분야 긴급 취약점 진단",
              type: "절차",
              startUtteranceId: "",
            },
          ],
          sections: [
            { id: "section-1", title: "심의ㆍ의결안건", startUtteranceId: "" },
            { id: "section-2", title: "가. 공공 AX 혁신지원 위한「사전적정성 검토」결과에 관한 건 (의안", startUtteranceId: "" },
            { id: "section-3", title: "제2026-003-007호)", startUtteranceId: "utt-1" },
            { id: "section-4", title: "보고안건", startUtteranceId: "" },
            { id: "section-5", title: "가. 공공기관의 주요 개인정보 처리시스템ㆍ분야 긴급 취약점 진단", startUtteranceId: "" },
            { id: "section-6", title: "및 개선", startUtteranceId: "utt-2" },
          ],
          utterances: [
            { id: "utt-0", sectionTitle: "안건현황 설명 및 회의 공개여부 결정", speakerName: "부위원장", text: "안건 현황을 설명합니다." },
            { id: "utt-1", sectionTitle: "제2026-003-007호)", speakerName: "부위원장", text: "의결안건을 심의하겠습니다." },
            { id: "utt-2", sectionTitle: "및 개선", speakerName: "조사조정국장", text: "보고안건을 보고드리겠습니다." },
          ],
        },
      },
    },
  });

  assert.equal(detail.agendas.length, 2);
  assert.equal(detail.agendas[0].title, "가. 공공 AX 혁신지원 위한「사전적정성 검토」결과에 관한 건 (의안 제2026-003-007호)");
  assert.equal(detail.agendas[0].type, "심의ㆍ의결");
  assert.equal(detail.agendas[0].startUtteranceId, "utt-1");
  assert.equal(detail.agendas[1].title, "가. 공공기관의 주요 개인정보 처리시스템ㆍ분야 긴급 취약점 진단 및 개선");
  assert.equal(detail.agendas[1].type, "보고");
  assert.equal(detail.agendas[1].startUtteranceId, "utt-2");
  assert.equal(detail.utterances[0].agendaId || "", "");
  assert.equal(detail.utterances[1].agendaId, "agenda-1");
  assert.equal(detail.utterances[1].sectionTitle, detail.agendas[0].title);
  assert.equal(detail.utterances[2].agendaId, "agenda-2");
  assert.equal(detail.utterances[2].sectionTitle, detail.agendas[1].title);

  const html = renderMeetingDetail(detail);
  assert.match(html, /class="agenda-jump-type">심의ㆍ의결/);
  assert.match(html, /class="agenda-jump-type">보고/);
  assert.match(html, /data-utterance-target="utt-1"/);
  assert.match(html, /data-utterance-target="utt-2"/);
  assert.doesNotMatch(html, /data-utterance-target=""/);
});

test("buildMeetingDetailModel re-extracts law references from embedded utterances", () => {
  const detail = buildMeetingDetailModel({
    meetingTranscripts: [
      { id: "law-context-meeting", meeting_date: "2026-02-11", meeting_title: "2026년 제3회 보호위원회" },
    ],
  }, "law-context-meeting", {
    detailIndex: {
      meetings: {
        "law-context-meeting": {
          meeting: { meetingLabel: "2026년 제3회 보호위원회", date: "2026-02-11" },
          lawReferences: [
            { lawName: "개인정보 보호법", article: "제5조", utteranceId: "utt-1" },
          ],
          utterances: [
            {
              id: "utt-1",
              sectionTitle: "안건",
              speakerName: "조사1과장",
              text: "개인정보 보호법 제29조 및 개인정보의 안전성 확보조치 기준 고시 제5조, 제6조, 제8조 위반입니다.",
              lawReferences: [
                { lawName: "개인정보 보호법", article: "제5조", globalIndex: 0 },
              ],
            },
          ],
        },
      },
    },
  });

  assert.deepEqual(detail.lawReferences.map((ref) => `${ref.lawName} ${ref.article}`), [
    "개인정보 보호법 제29조",
    "개인정보의 안전성 확보조치 기준 제5조",
    "개인정보의 안전성 확보조치 기준 제6조",
    "개인정보의 안전성 확보조치 기준 제8조",
  ]);
  assert.deepEqual(detail.utterances[0].lawReferences.map((ref) => `${ref.lawName} ${ref.article}`), [
    "개인정보 보호법 제29조",
    "개인정보의 안전성 확보조치 기준 제5조",
    "개인정보의 안전성 확보조치 기준 제6조",
    "개인정보의 안전성 확보조치 기준 제8조",
  ]);
});

test("renderMeetingDetail keeps only the webtoon action when available", () => {
  const html = renderMeetingDetail({
    meeting: { id: "meeting-webtoon", meetingLabel: "2026년 제5회 보호위원회", date: "2026-03-25" },
    meetingOptions: [],
    transcriptText: "",
    relatedDocuments: [],
    agendas: [],
    utterances: [],
    lawReferences: [],
  });

  assert.match(html, /회의별 속기록 조회/);
  assert.match(html, /웹툰으로 보기/);
  assert.match(html, /pipc_2026_5_webtoon\.html/);
  assert.doesNotMatch(html, /애니메이션으로 보기/);
  assert.doesNotMatch(html, /data-animation-meeting-id/);
});

test("renderMeetingDetail renders all meeting options inside the detail tab", () => {
  const html = renderMeetingDetail({
    meeting: { id: "meeting-b", meetingLabel: "2026년 제4회 보호위원회", date: "2026-03-11" },
    meetingOptions: [
      { id: "meeting-a", meetingLabel: "2026년 제5회 보호위원회", date: "2026-03-25" },
      { id: "meeting-b", meetingLabel: "2026년 제4회 보호위원회", date: "2026-03-11", selected: true },
    ],
    transcriptText: "",
    relatedDocuments: [],
    agendas: [],
    utterances: [],
    lawReferences: [],
  });

  assert.match(html, /data-meeting-select/);
  assert.match(html, /2026년 제5회 보호위원회/);
  assert.match(html, /value="meeting-b" selected/);
});

test("index navigation labels meeting tab as transcript lookup", () => {
  const html = readFileSync(resolve("index.html"), "utf8");

  assert.match(html, /회의별 속기록 조회/);
  assert.doesNotMatch(html, /회의별 확인/);
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
  assert.doesNotMatch(html, /data-animation-meeting-id/);
  assert.match(html, /&lt;script&gt;alert\(&quot;transcript&quot;\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /href="docs\/&lt;raw&gt;&amp;&quot;path&quot;.md"/);
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

  assert.match(fallbackHtml, /id="law-drawer"/);
  assert.match(html, /id="law-drawer"/);
  assert.doesNotMatch(html, /class="law-reference-item"/);
  assert.doesNotMatch(html, /개인정보 보호법<script>/);
});

test("renderMeetingDetail falls back when law references is not an array", () => {
  const html = renderMeetingDetail({
    meeting: { id: "oops", meetingLabel: "oops", date: "2025-08-27" },
    transcriptText: "",
    relatedDocuments: [],
    lawReferences: "oops",
  });

  assert.match(html, /id="law-drawer"/);
});
