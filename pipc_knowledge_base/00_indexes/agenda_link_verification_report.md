# 안건/결정문/발언 연결 검증 리포트

생성일: 2026-04-27

## Supabase 적재 현황

- 회의 안건(`agenda_items`): 496건
- 안건이 추출된 회의: 126건
- 안건 종류: 심의의결 320건, 보고 174건, 미분류 2건
- 공개 여부: 공개 326건, 비공개 170건
- 안건-결정문 게시글 링크(`agenda_decision_links`): 149건
- 결정문에 연결된 안건: 145건
- 연결된 결정문 게시글: 145건
- 안건에 연결된 발언: 14,480 / 16,287건
- 아직 안건에 연결하지 않은 발언: 1,807건
- 발언-안건 연결이 있는 회의: 107건
- 발언-사건 링크(`utterance_case_links`): 2,072건
- 발언이 연결된 사건 후보: 42건

## 발언-사건 링크 기준

- `agenda_decision_single_case`: 안건이 연결된 결정문 게시글에 사건 후보가 1개뿐인 경우
- `agenda_decision_entity_mention`: 같은 안건에 여러 사건 후보가 있고, 발언 본문에 피심인/기관명이 직접 등장한 경우

현재 발언-사건 링크는 보수적인 1차 후보입니다. 여러 피심인이 한 안건 안에서 순차 논의된 경우에는 피심인명, 사건번호, 의안번호를 더 정밀하게 이용해 구간을 다시 나누는 후속 작업이 필요합니다.

## 산출물

- 안건 후보 CSV: `pipc_knowledge_base/90_normalized_data/agenda_item_candidates.csv`
- 안건-결정문 링크 후보 CSV: `pipc_knowledge_base/90_normalized_data/agenda_decision_link_candidates.csv`
- 발언-안건 링크 후보 CSV: `pipc_knowledge_base/90_normalized_data/utterance_agenda_link_candidates.csv`
- 통합 JSON: `pipc_knowledge_base/90_normalized_data/agenda_seed.json`
- 생성/적재 스크립트: `scripts/seed_agenda_items_and_links.mjs`

## 주의

- 회의 페이지의 안건 목록은 공식 의사일정이지만, 실제 심의 결과는 회의록/속기록 및 결정문과 교차검증해야 한다.
- 비공개 표기가 있는 안건이라도 공개 속기록에 실제 발언이 포함된 경우는 원문에 있는 범위에서만 연결했다.
- 파일이나 발언이 없는 회차는 없는 그대로 남긴다. 결측 자료를 추정 생성하지 않는다.
