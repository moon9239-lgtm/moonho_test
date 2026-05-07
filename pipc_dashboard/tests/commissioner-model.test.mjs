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

test("buildCommissionerAnalysisModel prioritizes current second-term character cards", () => {
  const model = buildCommissionerAnalysisModel({
    secondCommissioners: [
      { name: "김일환", generation: "2기", role_current: "위원", term_status: "current", commissioner_status: "current", official_term_text: "2023-09-21~2026-09-20", recommendation_route: "여당 추천", appearances: 51 },
      { name: "송경희", generation: "2기", role_current: "위원장", term_status: "current", commissioner_status: "current", official_term_text: "2025-10~현재", recommendation_route: "상임위원 임명", appearances: 6 },
      { name: "이정렬", generation: "2기", role_current: "부위원장", term_status: "current", commissioner_status: "current", official_term_text: "2025-11~현재", recommendation_route: "상임위원 임명", appearances: 7 },
      { name: "조소영", generation: "2기", role_current: "위원", term_status: "former", commissioner_status: "former", official_term_text: "2023-09-21~중도 사퇴", recommendation_route: "위원장 제청", appearances: 25 },
    ],
    commissionerActivity: [
      { name: "송경희", total_utterances: 42, question_count: 20, agenda_count: 6, meeting_count: 6, top_tags: [{ tag_label: "공공부문 책임성 강조", utterance_count: 36 }] },
      { name: "김일환", total_utterances: 300, agenda_count: 51, meeting_count: 51 },
    ],
    commissionerCharacters: [
      {
        id: "song_kyunghee",
        name: "송경희",
        generation: "2기",
        role: "위원장",
        status: "current",
        character_type: "AI 정책 항해자",
        meeting_function: "기술 혁신과 보호 원칙을 동시에 묻는다",
        voice_direction: "디지털 정책 가능성을 열어두며 보호 장치를 확인하는 미래지향 문체",
        asset: "song.png",
        top_tags: ["AI·데이터 활용"],
      },
      { id: "lee_jungryul", name: "이정렬", generation: "2기", role: "부위원장", status: "current", character_type: "정책 집행 건축가", asset: "lee.png" },
      { id: "kim_ilwhan", name: "김일환", generation: "2기", role: "비상임위원", status: "current", character_type: "원칙 중심 제도 설계자", asset: "kim.png" },
      { id: "yoon_jongin", name: "윤종인", generation: "1기", role: "위원장", status: "former", character_type: "출범기 기반 설계자", asset: "yoon.png" },
    ],
  });

  assert.deepEqual(model.currentSecondCommissioners.map((item) => item.name), ["송경희", "이정렬", "김일환"]);
  assert.equal(model.currentSecondCommissioners[0].asset, "song.png");
  assert.equal(model.currentSecondCommissioners[0].roleTone, "chair");
  assert.equal(model.currentSecondCommissioners[0].isExecutive, true);
  assert.equal(model.currentSecondCommissioners[0].meetingRole, "기술 혁신과 보호 원칙을 동시에 묻는다");
  assert.equal(model.currentSecondCommissioners[0].questionStyle, "디지털 정책 가능성을 열어두며 보호 장치를 확인하는 미래지향 문체");
  assert.match(model.currentSecondCommissioners[0].representativeQuestion, /AI·데이터 활용/);
  assert.deepEqual(model.currentSecondCommissioners[0].topTagDetails, [{ label: "AI·데이터 활용", count: null }]);
  assert.equal(model.currentSecondCommissioners[1].roleTone, "vice");
  assert.equal(model.currentSecondCommissioners[2].termText, "2023-09-21~2026-09-20");
  assert.deepEqual(model.formerSecondCommissioners.map((item) => item.name), ["조소영"]);
  assert.deepEqual(model.firstGenerationCommissioners.map((item) => item.name), ["윤종인"]);
});

test("normalizeCommissionerCharacters accepts existing characters.json array", () => {
  const characters = normalizeCommissionerCharacters([
    { id: "go_haksu", name: "고학수", character_type: "균형 조율형 의장" },
  ]);

  assert.equal(characters.length, 1);
  assert.equal(characters[0].id, "go_haksu");
  assert.equal(characters[0].name, "고학수");
  assert.equal(characters[0].asset, "./assets/commissioners/go_haksu_sd3d_character.png");
});

test("normalizeCommissionerCharacters rewrites legacy external character asset paths for deployment", () => {
  const characters = normalizeCommissionerCharacters([
    {
      id: "song_kyunghee",
      name: "송경희",
      asset: "../pipc_knowledge_base/04_members/character_profiles/character_assets/sd3d_members/song_kyunghee_sd3d_character.png",
    },
  ]);

  assert.equal(characters[0].asset, "./assets/commissioners/song_kyunghee_sd3d_character.png");
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

test("buildCommissionerAnalysisModel derives distinct representative questions from character roles", () => {
  const model = buildCommissionerAnalysisModel({
    secondCommissioners: [
      { name: "기술위원", generation: "2기", role_current: "위원", term_status: "current", commissioner_status: "current" },
      { name: "플랫폼위원", generation: "2기", role_current: "위원", term_status: "current", commissioner_status: "current" },
    ],
    commissionerCharacters: [
      {
        name: "기술위원",
        generation: "2기",
        role: "비상임위원",
        status: "current",
        character_type: "위협 탐지형 기술 위원",
        meeting_function: "공격 경로와 보안 통제의 현실성을 찌른다",
        core_motif: "위협 인텔리전스, 플랫폼 보안",
        top_tags: ["절차·법리·근거 검토", "기술·보안 통제 점검"],
      },
      {
        name: "플랫폼위원",
        generation: "2기",
        role: "비상임위원",
        status: "current",
        character_type: "온라인 규범 감시자",
        meeting_function: "플랫폼 맥락과 법적 책임을 연결한다",
        core_motif: "온라인 광고, 정보보호 법무",
        top_tags: ["절차·법리·근거 검토", "사업자 부담·산업 맥락 고려"],
      },
    ],
  });

  const [technical, platform] = model.currentSecondCommissioners;
  assert.notEqual(technical.representativeQuestion, platform.representativeQuestion);
  assert.match(technical.representativeQuestion, /공격 경로|보안 통제/);
  assert.match(platform.representativeQuestion, /플랫폼 맥락|법적 책임/);
});

test("buildCommissionerAnalysisModel selects and summarizes representative questions from actual transcript utterances", () => {
  const securityQuestion = "자료를 보면 침해 사고 이후 접근 권한 정리와 암호화 조치가 각각 언급되어 있습니다. 그런데 실제 공격 경로를 보면 내부 관리자 권한이 우회된 것으로 보이는데, 접속권한과 암호화 조치가 실제 공격 경로를 막을 수 있는지 확인해 주시기 바랍니다.";
  const model = buildCommissionerAnalysisModel({
    secondCommissioners: [
      { name: "기술위원", generation: "2기", role_current: "위원", term_status: "current", commissioner_status: "current" },
    ],
    commissionerCharacters: [
      {
        name: "기술위원",
        generation: "2기",
        role: "비상임위원",
        status: "current",
        character_type: "위협 탐지형 기술 위원",
        meeting_function: "공격 경로와 보안 통제의 현실성을 찌른다",
        core_motif: "위협 인텔리전스, 플랫폼 보안",
        top_tags: ["절차·법리·근거 검토", "기술·보안 통제 점검"],
      },
    ],
    detailIndex: {
      meetings: {
        "meeting-1": {
          meeting: { id: "meeting-1", date: "2026-03-25", meetingLabel: "2026년 제5회 보호위원회" },
          agendas: [{ id: "agenda-1", title: "안전조치 기준 개정안" }],
          utterances: [
            { id: "utt-1", speakerName: "기술위원", speakerRole: "위원", text: "동의합니다.", agendaId: "agenda-1" },
            { id: "utt-2", speakerName: "기술위원", speakerRole: "위원", text: "법적 근거가 무엇인지 설명해 주시기 바랍니다.", agendaId: "agenda-1" },
            { id: "utt-3", speakerName: "기술위원", speakerRole: "위원", text: securityQuestion, agendaId: "agenda-1" },
          ],
        },
      },
    },
  });

  const commissioner = model.currentSecondCommissioners[0];
  assert.match(commissioner.representativeQuestion, /접속권한과 암호화 조치/);
  assert.ok(commissioner.representativeQuestion.length <= 170);
  assert.equal(commissioner.representativeQuestionOriginal, securityQuestion);
  assert.deepEqual(commissioner.representativeQuestionSource, {
    meetingId: "meeting-1",
    utteranceId: "utt-3",
    agendaId: "agenda-1",
    meetingLabel: "2026년 제5회 보호위원회",
    date: "2026-03-25",
    agendaTitle: "안전조치 기준 개정안",
  });
  assert.doesNotMatch(commissioner.representativeQuestion, /자료를 보면 침해 사고 이후/);
  assert.doesNotMatch(commissioner.representativeQuestion, /어떤 사실과 근거/);
});

test("buildCommissionerAnalysisModel tolerates null input", () => {
  assert.deepEqual(buildCommissionerAnalysisModel(null), {
    commissioners: [],
    currentSecondCommissioners: [],
    formerSecondCommissioners: [],
    firstGenerationCommissioners: [],
  });
});
