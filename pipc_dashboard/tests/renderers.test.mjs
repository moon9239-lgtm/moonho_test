import test from "node:test";
import assert from "node:assert/strict";
import { buildSituationBoardModel } from "../src/data-model.mjs";
import { renderAgendaPreparationResult, renderAnimationViewer, renderCommissionerAnalysis, renderLawReferenceDetail, renderSituationBoard } from "../src/renderers.mjs";
import { dashboardFixture } from "./fixtures/dashboard-fixture.mjs";

test("renderSituationBoard includes operational KPIs and meeting cards", () => {
  const html = renderSituationBoard(buildSituationBoardModel(dashboardFixture));

  assert.match(html, /총 회의 수/);
  assert.match(html, /44/);
  assert.match(html, /총 안건 수/);
  assert.match(html, /2025년 제24회/);
  assert.match(html, /제재·처분 신호/);
});

test("renderSituationBoard includes expanded operations panels", () => {
  const html = renderSituationBoard({
    updatedAt: "2026-05-05",
    kpis: {
      totalMeetings: { label: "총 회의 수", value: 10 },
    },
    agendaSplit: [{ label: "심의·의결", value: 6, ratio: 0.6, tone: "blue" }],
    visibilitySplit: [{ label: "공개", value: 8, ratio: 0.8, tone: "blue" }],
    yearlyRows: [{ meeting_year: 2025, meetings: 20, agenda_items: 80, decision_agendas: 40, report_agendas: 30, utterances: 1000 }],
    topicDistribution: [{ label: "위반·처분", agenda_count: 20 }],
    dataQuality: [{ label: "안건 연결 발언", ratio: 0.9, notes: "테스트" }],
    sanctions: [{ sanction_kind: "과징금", sanction_count: 3 }],
    signals: { majorPenaltyCases: [] },
    meetingCards: [],
  });

  assert.match(html, /안건 처리 비율/);
  assert.match(html, /공개 여부/);
  assert.match(html, /연도별 회의·안건 흐름/);
  assert.match(html, /실무 쟁점 주제/);
  assert.match(html, /데이터 검증 상태/);
  assert.match(html, /과징금 3/);
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

test("renderCommissionerAnalysis tolerates partial rows and avoids missing question counts", () => {
  assert.doesNotThrow(() => renderCommissionerAnalysis({ commissioners: [null, { name: "고학수", totalUtterances: 2026, agendaCount: 135 }] }));

  const html = renderCommissionerAnalysis({
    commissioners: [
      { name: "고학수", characterType: "균형 조율형 의장", totalUtterances: 2026, agendaCount: 135, topTags: ["절차·법리"] },
    ],
  });
  assert.match(html, /발언 2,026 · 안건 135/);
  assert.doesNotMatch(html, /질문 0/);
});

test("renderAgendaPreparationResult renders structured assistant output", () => {
  const html = renderAgendaPreparationResult({
    similarAgendas: [null, { title: `<script>alert("agenda")</script>`, disposition: "과징금" }],
    expectedIssues: [null, { label: "안전조치 의무 이행" }],
    similarProvisions: [null, { label: "개인정보 보호법 제29조" }],
    dispositionLevels: [null, { label: "과징금", amountText: "1,000만원" }],
    commissionerQuestions: [null, { commissionerName: "예시위원", question: "사실관계를 어떻게 설명할 수 있습니까?" }],
    checklist: [null, { label: "법 조항 확인", detail: "회의 당시 조문과 현재 조문을 비교합니다." }],
  });

  assert.doesNotThrow(() => renderAgendaPreparationResult(null));
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /\[object Object\]/);
  assert.match(html, /안전조치 의무 이행/);
  assert.match(html, /개인정보 보호법 제29조/);
  assert.match(html, /과거 처분 수준/);
  assert.match(html, /1,000만원/);
  assert.match(html, /예시위원/);
  assert.match(html, /사실관계를 어떻게 설명할 수 있습니까/);
  assert.match(html, /회의 당시 조문과 현재 조문을 비교합니다/);
});

test("renderLawReferenceDetail escapes law text and lookup payload", () => {
  const html = renderLawReferenceDetail({
    lawName: "개인정보 보호법<script>",
    article: "제29조",
    title: "안전조치</h3><script>",
    meetingDate: "2025-01-08",
    meetingVersion: "</section><script>alert(1)</script>",
    currentVersion: "<img src=x onerror=alert(1)>",
    lookupRequest: { lawName: "<script>", article: "제29조" },
  });

  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /<img/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /law-request/);
});
