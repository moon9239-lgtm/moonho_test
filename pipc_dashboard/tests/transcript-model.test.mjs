import test from "node:test";
import assert from "node:assert/strict";
import { parseTranscript } from "../src/transcript-model.mjs";

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

test("deriveAgendaSegments extracts 가·나·다·라 agenda sections", () => {
  const detail = parseTranscript(`
2026년 제4회 개인정보 보호위원회 속기록

### 1. 회의내용

### 심의․의결안건

### 가. 공공 AX 혁신지원 위한「사전적정성 검토」결과에 관한 건 (의안 제2026-003-007호)
(위원장 송경희) 이 안건은 공공 AX 혁신지원 위한 사전적정성 검토 결과에 관한 건입니다.

### 나. 디지털 포렌식 지원 및 증거 보관․관리 규정 제정안에 관한 건 (의안 제2026-004-022호)
(위원장 송경희) 다음은 디지털 포렌식 지원 및 증거 보관․관리 규정 제정안에 관한 건을 상정하겠습니다.

### 다. 개인정보보호 법규 위반행위에 관한 시정조치에 관한 건(안)
(위원장 송경희) 다음은 안건 다를 다루는 개인정보보호 법규 위반행위에 관한 시정조치입니다.

### 라. 보건의료 분야 개인정보 전송에 관한 고시 일부개정안에 관한 건
(위원장 송경희) 다음은 안건 라로 보건의료 분야 개인정보 전송에 관한 고시 일부개정안에 관한 건을 다루겠습니다.
`, { date: "2026-03-11", meetingLabel: "2026년 제4회 보호위원회" });

  const titles = detail.agendas.map((item) => item.title);
  assert.equal(titles.length, 4);
  assert.ok(/^가\./.test(titles[0]));
  assert.ok(/^나\./.test(titles[1]));
  assert.ok(/^다\./.test(titles[2]));
  assert.ok(/^라\./.test(titles[3]));
});

test("parseTranscript joins split agenda headings and anchors them to the first utterance", () => {
  const detail = parseTranscript(`
2026년 제3회 개인정보 보호위원회 속기록
### 회의내용

### 심의ㆍ의결안건
### 가. 공공 AX 혁신지원 위한「사전적정성 검토」결과에 관한 건 (의안
### 제2026-003-007호)
(부위원장 이정렬) 그러면 지금부터 의결안건을 심의하겠습니다.

### 보고안건
### 가. 공공기관의 주요 개인정보 처리시스템ㆍ분야 긴급 취약점 진단
### 및 개선
(부위원장 이정렬) 다음은 보고안건을 상정하겠습니다.

### 심의ㆍ의결안건
### 나. 개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2025
### 조일0026, 0028, 0035) (의안 제2026-003-008~010호)
(부위원장 이정렬) 다음 의결안건을 심의하겠습니다.
`, { date: "2026-02-11", meetingLabel: "2026년 제3회 보호위원회" });

  assert.equal(detail.agendas.length, 3);
  assert.equal(detail.agendas[0].title, "가. 공공 AX 혁신지원 위한「사전적정성 검토」결과에 관한 건 (의안 제2026-003-007호)");
  assert.equal(detail.agendas[0].type, "심의ㆍ의결");
  assert.equal(detail.agendas[0].startUtteranceId, "utt-1");
  assert.equal(detail.agendas[1].title, "가. 공공기관의 주요 개인정보 처리시스템ㆍ분야 긴급 취약점 진단 및 개선");
  assert.equal(detail.agendas[1].type, "보고");
  assert.equal(detail.agendas[1].startUtteranceId, "utt-2");
  assert.equal(detail.agendas[2].title, "나. 개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2025조일0026, 0028, 0035) (의안 제2026-003-008~010호)");
  assert.equal(detail.agendas[2].startUtteranceId, "utt-3");
  assert.equal(detail.utterances[1].agendaId, detail.agendas[1].id);
});
