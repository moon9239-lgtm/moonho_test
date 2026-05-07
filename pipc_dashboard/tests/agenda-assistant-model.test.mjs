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
  assert.equal(model.amountEstimate.amountText, "1,000만 원");
  assert.match(model.amountEstimate.basis, /유사 안건/);
  assert.equal(model.checklist.length, 8);
});

test("buildAgendaPreparationResult limits provision chips to major privacy law articles", () => {
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
    ["개인정보 보호법 제29조"],
  );
  assert.equal(model.similarProvisions.length <= 10, true);
  assert.equal(model.similarProvisions.every((provision) => /^개인정보 보호법/.test(provision.label)), true);
});

test("buildAgendaPreparationResult creates questions from current second-term commissioner tendencies", () => {
  const model = buildAgendaPreparationResult({
    title: "AI 활용 개인정보 처리 안건",
    currentSecondCommissioners: [
      {
        name: "예시위원",
        role: "위원",
        meetingRole: "사실관계 확인을 촘촘히 묻는다",
        questionStyle: "증거와 법적 근거를 분리해 확인하는 질문",
        representativeQuestion: "자료만으로 법적 근거를 인정할 수 있습니까?",
        topTags: ["사실관계 확인"],
      },
      {
        name: "기술위원",
        role: "위원",
        representativeQuestion: "접근기록과 암호화 조치가 실제로 남아 있습니까?",
        topTags: ["기술·보안 통제 점검", "재발방지·개선·예방 지향"],
      },
      {
        name: "다른위원",
        role: "부위원장",
        meetingRole: "처분 수위와 균형을 점검한다",
        questionStyle: "형평성과 보완자료를 확인하는 질문",
        topTags: ["처분 수위"],
      },
    ],
  });

  assert.equal(model.commissionerQuestions.length, 2);
  assert.equal(model.commissionerQuestions[0].commissionerName, "예시위원");
  assert.match(model.commissionerQuestions[0].question, /적용 조항의 요건과 인정 사실/);
  assert.match(model.commissionerQuestions[0].responseStrategy, /조항 요건/);
  assert.equal(model.commissionerQuestions[1].commissionerName, "기술위원");
  assert.match(model.commissionerQuestions[1].question, /접근기록|관리자 권한|암호화|비정상 접속|로그/);
  assert.notEqual(model.commissionerQuestions[0].question, model.commissionerQuestions[1].question);
  assert.doesNotMatch(JSON.stringify(model.commissionerQuestions), /성향/);
});

test("buildAgendaPreparationResult tolerates null and partial input", () => {
  const emptyModel = buildAgendaPreparationResult(null);

  assert.deepEqual(emptyModel.similarAgendas, []);
  assert.deepEqual(emptyModel.expectedIssues, []);
  assert.deepEqual(emptyModel.similarProvisions, []);
  assert.deepEqual(emptyModel.commissionerQuestions, []);
  assert.equal(emptyModel.checklist.length, 8);

  const partialModel = buildAgendaPreparationResult({
    title: "유출 처분",
    historicalAgendas: [
      null,
      { agenda_title: "유출 사고 처분", lawArticles: ["개인정보 보호법 제64조의2"] },
    ],
  });

  assert.equal(partialModel.similarAgendas.length, 1);
  assert.deepEqual(partialModel.similarAgendas[0].lawArticles, ["개인정보 보호법 제64조의2"]);
  assert.deepEqual(partialModel.expectedIssues.map((issue) => issue.token), ["유출", "처분"]);
});
