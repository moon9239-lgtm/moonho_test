# Status Resolution Report

- generated_at: 2026-04-27 05:15:55 +09:00
- unresolved_preliminary_status_rows: 0
- law_mcp_pending_rows: 0
- dashboard_snapshot: `pipc_dashboard/data/dashboard-data.js`
- verified_amount_source: `verified_penalty_outcomes`
- verified_amount_rows: 375

## Current Status Summary

| table_name | status | rows |
| --- | --- | ---: |
| agenda_items | verified_official_agenda | 496 |
| commissioner_speech_aggregates | auto_aggregated_rule_based | 21 |
| commissioner_speech_samples | auto_selected_rule_based | 630 |
| commissioner_tendency_stats | auto_aggregated_rule_based | 210 |
| decision_cases | needs_review_source_document | 3 |
| decision_cases | verified_document_case | 503 |
| law_citations_extraction | mcp_checked | 10,085 |
| law_citations_verification | needs_review | 1,493 |
| law_citations_verification | not_found | 58 |
| law_citations_verification | verified | 8,534 |
| monetary_penalties | excluded_context_amount | 598 |
| monetary_penalties | needs_review_not_final_amount | 228 |
| monetary_penalties | needs_review_role_classification | 327 |
| monetary_penalties | verified_final_amount | 683 |
| sanctions | verified_order_signal | 1,098 |
| utterance_tendency_tags | auto_tagged_rule_based | 22,282 |
| verified_penalty_outcomes | verified | 375 |

## Meaning

- `verified_*`: official source fields or final amount patterns were strong enough to use directly in dashboards.
- `auto_*`: rule-based analysis output. It is usable for exploration and ranking, but should not be treated as a human judgment.
- `mcp_checked`: korean-law-mcp verification has been attempted for the citation.
- `needs_review_*` / `needs_review`: the row is preserved and separated for later human or model-assisted review.
- `not_found`: law.go.kr lookup did not find the requested law/article combination as extracted.
- `excluded_context_amount`: numeric text found in a decision document, but classified as context such as base amount, adjustment, exchange rate, or statutory reference rather than final sanction amount.
