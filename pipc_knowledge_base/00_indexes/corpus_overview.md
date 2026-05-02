# Corpus Overview

## Source Collections

| collection | source | current count | notes |
| --- | --- | ---: | --- |
| meetings | 보호위원회 회의록/속기록 | 126 meetings / 233 PDFs | `pipc_minutes_crawler` 수집 결과 |
| committee decisions | 위원회 결정문 | 152 decision posts / 984 normal files | `pipc_committee_decisions_crawler` 수집 결과 |

## Sample Completed

| date | meeting | linked decision | status |
| --- | --- | --- | --- |
| 2026-03-25 | 2026년 제5회 보호위원회 | 2026-0204 | split into KB structure |

## Next Build Steps

1. 샘플 구조 검토
2. 전체 `kordoc` 변환
3. 회의 안건과 결정문 자동 매칭
4. 법령 인용 추출 및 `korean-law-mcp` 보강
5. 위원별 발언 JSONL 생성
6. 조항별/주제별/기관별 역색인 자동 갱신
