import test from "node:test";
import assert from "node:assert/strict";
import { buildSituationBoardModel } from "../src/data-model.mjs";
import { renderAgendaPreparationResult, renderAnimationViewer, renderCommissionerAnalysis, renderIntegratedSearch, renderLawReferenceDetail, renderMeetingDetail, renderSituationBoard } from "../src/renderers.mjs";
import { dashboardFixture } from "./fixtures/dashboard-fixture.mjs";

test("renderSituationBoard includes compact operational KPIs without transcript counters or meeting shortcuts", () => {
  const html = renderSituationBoard(buildSituationBoardModel(dashboardFixture));

  assert.match(html, /총 회의 수/);
  assert.match(html, /44/);
  assert.match(html, /총 안건 수/);
  assert.doesNotMatch(html, /안건 연결 발언/);
  assert.doesNotMatch(html, /검색 가능 안건 구간/);
  assert.doesNotMatch(html, /최근 분기/);
  assert.doesNotMatch(html, /회의 바로가기/);
  assert.doesNotMatch(html, /2025년 제24회/);
  assert.doesNotMatch(html, /\d+구간/);
  assert.doesNotMatch(html, /\d+발언/);
  assert.doesNotMatch(html, /제재·처분 신호/);
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
    quarterlyStats: [{ key: "2025-Q4", label: "2025년 4분기", meetingCount: 6, agendaCount: 22, utteranceCount: 400, lawReferenceCount: 12 }],
    globalStats: {
      topTargets: [{ label: "예시기관", count: 3 }],
      topArticles: [{ label: "개인정보 보호법 제29조", count: 5 }],
    },
    topicDistribution: [{ label: "위반·처분", agenda_count: 20 }],
    dataQuality: [{ label: "안건 연결 발언", ratio: 0.9, notes: "테스트" }],
    meetingCards: [],
  });

  assert.match(html, /안건 처리 비율/);
  assert.match(html, /공개 여부/);
  assert.match(html, /연도별 회의·안건 흐름/);
  assert.match(html, /실무 쟁점 주제/);
  assert.match(html, /개인정보 보호법 제29조/);
  assert.doesNotMatch(html, /속기록 기반 주요 대상/);
  assert.doesNotMatch(html, /예시기관/);
  assert.doesNotMatch(html, /최근 분기별 회의 운영 통계/);
  assert.doesNotMatch(html, /데이터 검증 상태/);
  assert.doesNotMatch(html, /안건 연결 발언/);
  assert.doesNotMatch(html, /400발언/);
  assert.doesNotMatch(html, /22구간/);
  assert.doesNotMatch(html, /과징금 3/);
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
  assert.doesNotMatch(html, /data-meeting-id/);
  assert.doesNotMatch(html, /meeting-card/);
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
  assert.match(html, /data-meeting-3d-scene/);
  assert.doesNotMatch(html, /data-rendered-animation/);
});

test("renderAnimationViewer tolerates null timeline and invalid scenes", () => {
  assert.doesNotThrow(() => renderAnimationViewer(null));
  assert.doesNotThrow(() => renderAnimationViewer({ scenes: "bad" }));

  const html = renderAnimationViewer(null);
  assert.match(html, /animation-viewer/);
  assert.doesNotMatch(html, /animation-scene-item/);
});

test("renderMeetingDetail emphasizes agenda sections and separates speaker roles without per-utterance jumps", () => {
  const html = renderMeetingDetail({
    meeting: { id: "meeting-1", meetingLabel: "2026년 제4회 보호위원회", date: "2026-03-11" },
    overview: { meetingLabel: "2026년 제4회 보호위원회", date: "2026-03-11", agendaCount: 1 },
    agendas: [{ title: "가. 법원행정처의 법규 위반행위에 대한 시정조치에 관한 건", startUtteranceId: "utt-1", type: "심의·의결" }],
    utterances: [
      { id: "utt-1", sectionTitle: "가. 법원행정처의 법규 위반행위에 대한 시정조치에 관한 건", speakerRole: "위원", speakerName: "김진욱", text: "위원 발언입니다." },
      { id: "utt-2", sectionTitle: "가. 법원행정처의 법규 위반행위에 대한 시정조치에 관한 건", speakerRole: "조사조정국장", speakerName: "남석", text: "사무처 보고입니다." },
    ],
  });

  assert.match(html, /class="utterance-section-title"/);
  assert.match(html, /utterance-card speaker-commissioner/);
  assert.match(html, /utterance-card speaker-staff/);
  assert.doesNotMatch(html, /utterance-animation-jump/);
  assert.doesNotMatch(html, /장면 이동/);
});

test("renderIntegratedSearch focuses on targets and law articles", () => {
  const html = renderIntegratedSearch({
    totalCount: 1,
    visibleCount: 1,
    filters: { query: "롯데카드", facet: "target" },
    rows: [
      {
        id: "row-1",
        date: "2026-03-11",
        meetingLabel: "2026년 제4회 보호위원회",
        title: "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건",
        type: "심의ㆍ의결",
        targets: ["롯데카드"],
        lawArticles: ["개인정보 보호법 제29조"],
        issueTags: ["안전조치", "접속기록"],
        dispositions: ["시정명령", "과징금"],
        amountText: "1,000,000원",
        sourceConfidence: [
          { label: "처분대상", status: "확정", source: "처분 데이터" },
          { label: "조치 결과", status: "확정", source: "처분 데이터" },
        ],
        similarAgendas: [
          { id: "row-2", date: "2025-03-26", title: "우리카드 시정조치", reason: "같은 조항" },
        ],
        speakers: ["송경희"],
        keywords: ["회의록"],
        snippet: "피심인 롯데카드 측에서 참석하여 의견을 진술할 예정입니다.",
      },
    ],
  });

  assert.match(html, /처분대상/);
  assert.match(html, /롯데카드/);
  assert.match(html, /관련 조항/);
  assert.match(html, /주요 쟁점/);
  assert.match(html, /안전조치/);
  assert.match(html, /조치 결과/);
  assert.match(html, /과징금/);
  assert.match(html, /출처 신뢰도/);
  assert.match(html, /유사 안건/);
  assert.doesNotMatch(html, /발언자/);
  assert.doesNotMatch(html, /키워드/);
  assert.doesNotMatch(html, /회의록·공개여부/);
  assert.doesNotMatch(html, /절차성 구간/);
  assert.doesNotMatch(html, /송경희/);
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

test("renderCommissionerAnalysis renders current second-term character cards first", () => {
  const html = renderCommissionerAnalysis({
    currentSecondCommissioners: [
      {
        name: "송경희",
        role: "위원장",
        roleTone: "chair",
        isExecutive: true,
        characterType: "AI 정책 항해자",
        meetingRole: "기술 혁신과 보호 원칙을 동시에 묻는다",
        questionStyle: "디지털 정책 가능성을 열어두며 보호 장치를 확인하는 미래지향 문체",
        representativeQuestion: "\"AI·데이터 활용\" 관점에서 사실관계와 법적 근거를 어떻게 확인할 수 있습니까?",
        representativeQuestionSource: {
          date: "2026-03-25",
          meetingLabel: "2026년 제5회 보호위원회",
          agendaTitle: "안전조치 기준 개정안",
        },
        asset: "../profiles/song.png",
        termText: "2025-10~현재",
        recommendationRoute: "상임위원 임명",
        appearances: 6,
        totalUtterances: 42,
        topTags: ["AI·데이터 활용"],
        topTagDetails: [{ label: "AI·데이터 활용", count: 16 }],
      },
      {
        name: "김일환",
        role: "위원",
        roleTone: "member",
        characterType: "원칙 중심 제도 설계자",
        asset: "../profiles/kim.png",
        termText: "2023-09-21~2026-09-20",
        recommendationRoute: "여당 추천",
        appearances: 51,
      },
    ],
    firstGenerationCommissioners: [
      { name: "윤종인", role: "위원장", roleTone: "chair", characterType: "출범기 기반 설계자", asset: "../profiles/yoon.png", generation: "1기" },
    ],
  });

  assert.match(html, /현재 2기 위원 명단/);
  assert.match(html, /class="commissioner-card commissioner-card-chair commissioner-card-executive"/);
  assert.match(html, /상임·당연직/);
  assert.match(html, /<img src="\.\.\/profiles\/song\.png" alt="송경희 캐릭터">/);
  assert.match(html, /위원장/);
  assert.match(html, /<h3>송경희<span class="commissioner-affiliation">상임위원 임명<\/span><\/h3>/);
  assert.match(html, /여당 추천/);
  assert.match(html, /발언 성향/);
  assert.match(html, /AI·데이터 활용 16건/);
  assert.match(html, /질문 스타일/);
  assert.match(html, /디지털 정책 가능성을 열어두며 보호 장치를 확인하는 미래지향 문체/);
  assert.match(html, /대표 질문/);
  assert.match(html, /사실관계와 법적 근거/);
  assert.doesNotMatch(html, /대표 질문 출처/);
  assert.doesNotMatch(html, /2026년 제5회 보호위원회/);
  assert.match(html, /회의 내 역할/);
  assert.match(html, /기술 혁신과 보호 원칙을 동시에 묻는다/);
  assert.match(html, /1기 위원/);
  assert.match(html, /윤종인/);
});

test("renderAgendaPreparationResult renders structured assistant output", () => {
  const html = renderAgendaPreparationResult({
    similarAgendas: [null, { title: `<script>alert("agenda")</script>`, disposition: "과징금" }],
    expectedIssues: [null, { label: "안전조치 의무 이행" }],
    similarProvisions: [null, { label: "개인정보 보호법 제29조" }],
    dispositionLevels: [null, { label: "과징금", amountText: "1,000만원" }],
    amountEstimate: {
      amountText: "1,000만원",
      basis: "유사 안건 1건의 금액을 참고했습니다.",
      evidence: [{ title: "유사 처분", amountText: "1,000만원" }],
    },
    commissionerQuestions: [null, {
      commissionerName: "예시위원",
      characterType: "원칙 중심 제도 설계자",
      question: "사실관계를 어떻게 설명할 수 있습니까?",
      responseStrategy: "증거와 법적 근거를 분리하는 성향에 맞춰 답변합니다.",
      rationale: "성향: 렌더링하면 안 됩니다.",
    }],
    checklist: [null, { label: "법 조항 확인", detail: "회의 당시 조문과 현재 조문을 비교합니다." }],
  });

  assert.doesNotThrow(() => renderAgendaPreparationResult(null));
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /\[object Object\]/);
  assert.match(html, /안전조치 의무 이행/);
  assert.match(html, /개인정보 보호법 제29조/);
  assert.match(html, /추정 금액/);
  assert.match(html, /유사 안건 1건의 금액/);
  assert.match(html, /유사 처분/);
  assert.match(html, /1,000만원/);
  assert.match(html, /예시위원/);
  assert.doesNotMatch(html, /원칙 중심 제도 설계자/);
  assert.doesNotMatch(html, /렌더링하면 안 됩니다/);
  assert.match(html, /"사실관계를 어떻게 설명할 수 있습니까\?"/);
  assert.match(html, /대응 전략/);
  assert.match(html, /증거와 법적 근거를 분리하는 패턴을 반영해 답변합니다/);
  assert.doesNotMatch(html, /성향/);
  assert.match(html, /회의 당시 조문과 현재 조문을 비교합니다/);
});

test("renderLawReferenceDetail escapes law text without exposing lookup payload", () => {
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
  assert.doesNotMatch(html, /조회 요청 데이터/);
  assert.doesNotMatch(html, /law-request/);
  assert.doesNotMatch(html, /lookupRequest/);
});

test("renderLawReferenceDetail labels unchanged lookup as law article", () => {
  const html = renderLawReferenceDetail({
    lawName: "개인정보 보호법",
    article: "제15조",
    meetingDate: "2026-03-11",
    lookupResult: {
      ok: true,
      changed: false,
      meeting: {
        lawName: "개인정보 보호법",
        article: "제15조",
        articleText: "제15조(개인정보의 수집ㆍ이용)",
        effectiveDate: "20251002",
      },
      current: {
        lawName: "개인정보 보호법",
        article: "제15조",
        articleText: "제15조(개인정보의 수집ㆍ이용)",
        effectiveDate: "20251002",
      },
    },
  });

  assert.match(html, /법률 조문/);
  assert.doesNotMatch(html, /조문 동일/);
});
