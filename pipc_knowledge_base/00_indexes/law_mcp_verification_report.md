# Korean Law MCP Verification Report

- generated_at: 2026-04-26T20:14:53.796Z
- mode: upload
- api_key_present: yes
- selected_groups: 356
- include_reviewed: no
- max_dates_per_group: all

## Selected Queue

| law | article | method | citations | cases | dates | selected_dates |
| --- | --- | --- | --- | --- | --- | --- |
| 개인정보 보호법 | 제30조제1항제2호 | normalized_alias | 3 | 3 | 1 | 1 |
| 개인정보 보호법 | 제30조제1항제4호 | normalized_alias | 3 | 3 | 1 | 1 |
| 개인정보 보호법 | 제31조의2 | inferred_default_pipa | 3 | 3 | 3 | 3 |
| 표준 개인정보 보호지침 | 제34조제1항 | source_text | 3 | 3 | 3 | 3 |
| 중소기업기본법 | 제35조제3항 | source_text | 3 | 3 | 1 | 1 |
| 개인정보 보호법 | 제37조 | inferred_default_pipa | 3 | 3 | 3 | 3 |
| 개인정보 보호법 | 제39조의12제2항 | inferred_default_pipa | 3 | 3 | 1 | 1 |
| 개인정보 보호법 | 제39조의15제1항제6호 | inferred_default_pipa | 3 | 3 | 3 | 3 |
| 개인정보 보호법 | 제3조제3항 | inferred_default_pipa | 3 | 3 | 3 | 3 |
| 개인정보 보호법 | 제3조제4항 | inferred_default_pipa | 3 | 3 | 3 | 3 |
| 개인정보 보호법 | 제3조제6항 | inferred_default_pipa | 3 | 3 | 3 | 3 |
| 개인정보 보호법 | 제48조의11제4항 | inferred_default_pipa | 3 | 3 | 3 | 3 |
| 개인정보 보호법 | 제48조의4 | inferred_default_pipa | 3 | 3 | 3 | 3 |
| 개인정보 보호법 위반에 대한 공표 및 공표명령 지침 | 제5조 | source_text | 3 | 3 | 1 | 1 |
| 개인정보 보호법 위반에 대한 공표 및 공표명령 지침(2023.10.11. 시행) | 제5조 | source_text | 3 | 3 | 1 | 1 |
| 舊 개인정보 보호법 위반에 대한 과태료 부과기준 | 제63조 | source_text | 3 | 3 | 2 | 2 |
| 개인정보 보호법 | 제63조의2제1항 | inferred_default_pipa | 3 | 3 | 3 | 3 |
| 개인정보 보호법 | 제63조의2제3항 | inferred_default_pipa | 3 | 3 | 3 | 3 |
| 개인정보 보호법 | 제64조의3제1항제1호 | inferred_default_pipa | 3 | 3 | 2 | 2 |
| 개인정보 보호법 | 제6조제1항제1호 | inferred_default_pipa | 3 | 3 | 3 | 3 |

## This Run Results

| status | citation_count |
| --- | --- |
| verified | 329 |
| needs_review | 95 |
| partially_verified | 31 |
| not_found | 29 |

## Current DB Coverage

| verification_status | citation_count | decision_case_count | distinct_article_raw_count |
| --- | --- | --- | --- |
| needs_review | 1493 | 344 | 142 |
| not_found | 58 | 41 | 28 |
| verified | 8534 | 500 | 360 |

## Notes

- 빈 법령명은 PIPC 결정문 관용 표현상 `개인정보 보호법`으로 추정합니다.
- 추정 법령에서 조문을 찾지 못한 경우는 확정 부재가 아니라 `needs_review`로 남깁니다.
- 연혁법령 조회는 `korean-law-mcp`의 법제처 클라이언트를 사용하되, `lsHistory`가 HTML 전용 API라 해당 응답만 직접 파싱합니다.
- `--max-dates` 기본값은 3이라, 첫 패스는 최초/중간/최신 시점을 우선 검증합니다.
- 전체 시점 검증은 `--all-dates --upload`로 재실행하면 됩니다.
- 행정규칙/고시/지침 계열은 별도 admin-rule 패스로 분리하는 것이 안전합니다.
