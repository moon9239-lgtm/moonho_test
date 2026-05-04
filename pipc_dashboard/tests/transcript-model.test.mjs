import test from "node:test";
import assert from "node:assert/strict";
import { buildTranscriptAnimationScenes, parseTranscript } from "../src/transcript-model.mjs";

const sample = `
2025년 제1회 개인정보 보호위원회 속기록

### 1.회의개요
### 일
### 시 : 2025. 1. 8.(수), 13:30~18:35
### 장
### 소 : 개인정보 보호위원회 대회의실
### 출석위원 : 위원장 고학수, 부위원장 최장혁, 위원 박상희․윤영미 (4명)

### 성원보고
(심사총괄담당관 황지은) 지금부터 2025년 제1회 개인정보 보호위원회 회의를 시
작하겠습니다.

### 심의․의결안건
(위원장 고학수) 의결안건 1번 법원행정처의 법규 위반행위에 대한 시정조치에 관한 건을 상정합니다.
(조사조정국장 남석) 보호법 제24조 제3항 및 제29조, 시행령 제30조 제1항 위반입니다.
`;

test("parseTranscript repairs pdf-wrapped lines into speaker utterances", () => {
  const detail = parseTranscript(sample, { date: "2025-01-08", meetingLabel: "2025년 제1회 보호위원회" });

  assert.equal(detail.overview.place, "개인정보 보호위원회 대회의실");
  assert.deepEqual(detail.overview.attendees, ["고학수", "최장혁", "박상희", "윤영미"]);
  assert.equal(detail.utterances.length, 3);
  assert.match(detail.utterances[0].text, /시작하겠습니다/);
  assert.ok(detail.agendas.some((item) => /의결안건 1번/.test(item.title)));
});

test("parseTranscript extracts law references and lookup shape", () => {
  const detail = parseTranscript(sample, { date: "2025-01-08", meetingLabel: "2025년 제1회 보호위원회" });

  assert.ok(detail.lawReferences.some((ref) => ref.lawName === "개인정보 보호법" && ref.article === "제29조"));
  assert.ok(detail.lawReferences.some((ref) => ref.lawName === "개인정보 보호법 시행령" && ref.article === "제30조 제1항"));
  assert.equal(detail.lawReferences[0].lookupRequest.versions[0].effectiveDate, "2025-01-08");
});

test("buildTranscriptAnimationScenes covers opening, utterances, and closing", () => {
  const detail = parseTranscript(sample, { date: "2025-01-08", meetingLabel: "2025년 제1회 보호위원회" });
  const scenes = buildTranscriptAnimationScenes(detail);

  assert.equal(scenes[0].type, "opening");
  assert.equal(scenes.at(-1).type, "closing");
  assert.ok(scenes.some((scene) => scene.utteranceId === detail.utterances[0].id));
});
