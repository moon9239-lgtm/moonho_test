# PIPC Knowledge Base

개인정보보호위원회 회의록, 속기록, 위원회 결정문을 연결해 분석하기 위한 Markdown 지식베이스입니다.

현재는 `2026-03-25 제5회 보호위원회`를 기준 샘플로 완전히 쪼갠 상태입니다. 이후 같은 구조를 전체 문서에 자동 적용합니다.

## Structure

```text
00_indexes/          전체 색인과 탐색용 허브
01_meetings/         회의별 정리, 안건별 분석
02_decisions/        결정문 게시글 및 개별 사건 분석
03_laws/             조항별 적용례와 법령 맥락
04_members/          위원별 발언과 분석 메모
05_topics/           쟁점별 역색인
06_entities/         기관/피심인별 정리
90_normalized_data/  자동화용 정규화 데이터
99_raw/              원문 변환 Markdown 보관 위치
```

## Design Principle

- 회의별 파일은 회의 흐름과 안건 목록을 보여줍니다.
- 안건별 파일은 회의록, 속기록, 결정문을 연결하는 중심 단위입니다.
- 결정문별 파일은 게시글 단위이고, 사건별 파일은 피심인/의안번호 단위입니다.
- 조항별 파일은 의결일 당시 조문과 실제 적용 방식을 누적합니다.
- 위원별 파일은 발언 근거를 먼저 쌓고, 성향 분석은 근거 기반으로만 갱신합니다.

## Key Indexes

- 위원명단: `00_indexes/members_index.md`
- 출처목록: `00_indexes/sources_index.md`
- 모의회의 입력용 위원 데이터: `90_normalized_data/commissioners.csv`
