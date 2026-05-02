# Candidate Resolution Report

- generated_at: 2026-04-26T18:52:18.017Z
- mode: upload
- parsed_verified_penalty_outcomes: 375
- outcomes_csv: pipc_knowledge_base/90_normalized_data/verified_penalty_outcomes.csv

## Upload Result

| upserted |
| --- |
| 375 |

| agenda_items | decision_cases_verified | decision_cases_review | sanctions | money_verified | money_review_or_excluded | law_citations | utterance_tags | commissioner_stats |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 496 | 503 | 3 | 1098 | 683 | 1153 | 9105 | 22282 | 210 |

## Status Before

| table_name | status | rows |
| --- | --- | --- |
| agenda_items | candidate | 496 |
| commissioner_tendency_stats | candidate | 210 |
| decision_cases | candidate | 503 |
| decision_cases | source_failed | 3 |
| law_citations_extraction | candidate | 9105 |
| law_citations_extraction | mcp_checked | 980 |
| law_citations_verification | needs_review | 98 |
| law_citations_verification | pending | 9105 |
| law_citations_verification | verified | 882 |
| monetary_penalties | candidate | 1836 |
| sanctions | candidate | 1098 |
| sanctions_result | candidate | 1098 |
| utterance_tendency_tags | candidate | 22282 |

## Status After

| table_name | status | rows |
| --- | --- | --- |
| agenda_items | verified_official_agenda | 496 |
| commissioner_tendency_stats | auto_aggregated_rule_based | 210 |
| decision_cases | needs_review_source_document | 3 |
| decision_cases | verified_document_case | 503 |
| law_citations_extraction | extracted_pending_mcp | 9105 |
| law_citations_extraction | mcp_checked | 980 |
| law_citations_verification | needs_review | 98 |
| law_citations_verification | pending | 9105 |
| law_citations_verification | verified | 882 |
| monetary_penalties | excluded_context_amount | 598 |
| monetary_penalties | needs_review_not_final_amount | 228 |
| monetary_penalties | needs_review_role_classification | 327 |
| monetary_penalties | verified_final_amount | 683 |
| sanctions | verified_order_signal | 1098 |
| sanctions_result | ordered | 1098 |
| utterance_tendency_tags | auto_tagged_rule_based | 22282 |
| verified_penalty_outcomes | verified | 375 |

## Notes

- `candidate` 상태는 확정 가능한 경우 `verified_*`로, 자동 분류값은 `auto_*`로, 최종액이 아닌 숫자는 `excluded_context_amount` 또는 `needs_review_*`로 전환합니다.
- 금액 통계의 확정 원천은 `verified_penalty_outcomes`입니다. 기존 `monetary_penalties`는 원문 숫자 흔적 보존 및 검토용으로 유지합니다.
- `needs_review_*`는 사람이 볼 필요가 있는 잔여 항목이며 후보 상태는 아닙니다.
