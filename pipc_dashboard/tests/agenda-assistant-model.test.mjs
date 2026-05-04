import test from "node:test";
import assert from "node:assert/strict";
import { buildAgendaPreparationResult } from "../src/agenda-assistant-model.mjs";

test("buildAgendaPreparationResult ranks 접속기록 안전조치 agenda first", () => {
  const model = buildAgendaPreparationResult({
    title: "접속기록 안전조치 점검 안건",
    summary: "접속기록 보관과 안전조치 미흡 여부를 검토합니다.",
    historicalAgendas: [
      {
        agenda_title: "접속기록 열람 민원 처리",
        keywords: ["접속기록"],
        sanction_type: "권고",
      },
      {
        agenda_title: "접속기록 안전조치 미흡에 대한 처분",
        keywords: ["접속기록", "안전조치", "처분"],
        lawArticles: ["개인정보 보호법 제29조"],
        disposition: "과징금 1,000만원",
        amountTotalKrw: 10000000,
      },
    ],
  });

  assert.equal(model.similarAgendas[0].title, "접속기록 안전조치 미흡에 대한 처분");
  assert.equal(model.similarAgendas[0].score > model.similarAgendas[1].score, true);
  assert.deepEqual(model.expectedIssues.map((issue) => issue.token), ["접속기록", "안전조치"]);
  assert.deepEqual(model.similarProvisions.map((provision) => provision.label), ["개인정보 보호법 제29조"]);
  assert.equal(model.dispositionLevels[0].label, "과징금 1,000만원");
  assert.equal(model.dispositionLevels[0].amountTotalKrw, 10000000);
  assert.equal(model.checklist.length, 3);
});

test("buildAgendaPreparationResult preserves separate law article chips", () => {
  const model = buildAgendaPreparationResult({
    title: "안전조치 처분",
    historicalAgendas: [
      {
        title: "안전조치 처분",
        lawArticles: ["개인정보 보호법 제29조", "개인정보 보호법 제64조의2"],
        disposition: "과징금",
      },
    ],
  });

  assert.deepEqual(
    model.similarProvisions.map((provision) => provision.label),
    ["개인정보 보호법 제29조", "개인정보 보호법 제64조의2"],
  );
});

test("buildAgendaPreparationResult creates commissioner questions from tag_label", () => {
  const model = buildAgendaPreparationResult({
    title: "AI 활용 개인정보 처리 안건",
    commissionerActivity: [
      {
        commissioner_name: "예시위원",
        top_tags: [
          { tag_label: "법적 근거", utterance_count: 12 },
          { tag_label: "사실관계 확인", utterance_count: 20 },
        ],
      },
      {
        tag_label: "처분 수위",
        utterance_count: 8,
      },
    ],
  });

  assert.equal(model.commissionerQuestions.length, 2);
  assert.equal(model.commissionerQuestions[0].commissionerName, "예시위원");
  assert.equal(model.commissionerQuestions[0].tag, "사실관계 확인");
  assert.match(model.commissionerQuestions[0].question, /예시위원/);
  assert.match(model.commissionerQuestions[0].question, /사실관계 확인/);
  assert.match(model.commissionerQuestions[1].question, /처분 수위/);
});

test("buildAgendaPreparationResult tolerates null and partial input", () => {
  const emptyModel = buildAgendaPreparationResult(null);

  assert.deepEqual(emptyModel.similarAgendas, []);
  assert.deepEqual(emptyModel.expectedIssues, []);
  assert.deepEqual(emptyModel.similarProvisions, []);
  assert.deepEqual(emptyModel.commissionerQuestions, []);
  assert.equal(emptyModel.checklist.length, 3);

  const partialModel = buildAgendaPreparationResult({
    title: "유출 처분",
    historicalAgendas: [
      null,
      { agenda_title: "유출 사고 처분", lawArticles: ["개인정보 보호법 제64조의2"] },
    ],
    commissionerActivity: [{ top_tags: null }],
  });

  assert.equal(partialModel.similarAgendas.length, 1);
  assert.deepEqual(partialModel.similarAgendas[0].lawArticles, ["개인정보 보호법 제64조의2"]);
  assert.deepEqual(partialModel.expectedIssues.map((issue) => issue.token), ["유출", "처분"]);
});
