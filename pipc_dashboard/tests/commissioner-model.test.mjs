import test from "node:test";
import assert from "node:assert/strict";
import { buildCommissionerAnalysisModel, normalizeCommissionerCharacters } from "../src/commissioner-model.mjs";

test("buildCommissionerAnalysisModel merges activity and character profiles", () => {
  const model = buildCommissionerAnalysisModel({
    commissionerActivity: [
      { commissioner_name: "송경희", total_utterances: 120, question_count: 30 },
    ],
    commissionerCharacters: [
      { id: "song_kyunghee", name: "송경희", top_tags: ["AI·데이터 활용 거버넌스"], character_type: "AI 정책 항해자" },
    ],
  });

  assert.equal(model.commissioners.length, 1);
  assert.equal(model.commissioners[0].name, "송경희");
  assert.equal(model.commissioners[0].characterType, "AI 정책 항해자");
  assert.deepEqual(model.commissioners[0].topTags, ["AI·데이터 활용 거버넌스"]);
});

test("normalizeCommissionerCharacters accepts existing characters.json array", () => {
  const characters = normalizeCommissionerCharacters([
    { id: "go_haksu", name: "고학수", character_type: "균형 조율형 의장" },
  ]);

  assert.equal(characters.length, 1);
  assert.equal(characters[0].id, "go_haksu");
  assert.equal(characters[0].name, "고학수");
});

test("buildCommissionerAnalysisModel falls back to activity tag labels", () => {
  const model = buildCommissionerAnalysisModel({
    commissionerActivity: [
      null,
      {
        name: "고학수",
        total_utterances: 2026,
        agenda_count: 135,
        meeting_count: 51,
        top_tags: [
          { tag_label: "절차·법리·근거 검토", utterance_count: 1453 },
          { tag_label: "사실관계·증거 확인", utterance_count: 565 },
        ],
      },
    ],
    commissionerCharacters: [],
  });

  assert.equal(model.commissioners.length, 1);
  assert.equal(model.commissioners[0].questionCount, null);
  assert.equal(model.commissioners[0].agendaCount, 135);
  assert.equal(model.commissioners[0].meetingCount, 51);
  assert.deepEqual(model.commissioners[0].topTags, ["절차·법리·근거 검토", "사실관계·증거 확인"]);
});

test("buildCommissionerAnalysisModel tolerates null input", () => {
  assert.deepEqual(buildCommissionerAnalysisModel(null), { commissioners: [] });
});
