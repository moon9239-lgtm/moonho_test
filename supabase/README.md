# Supabase Setup

This project uses Supabase as the relational analysis database for PIPC meetings, agendas, decision cases, law citations, commissioner utterances, and simulation features.

## Project

| item | value |
| --- | --- |
| Supabase project name | pipc-meeting |
| project_ref | yfrjdbsaulawwqmuozao |
| region | ap-northeast-1 |
| MCP scope | `project_ref=yfrjdbsaulawwqmuozao&features=database,docs` |

## Initial Migration

Applied migration:

- `initial_pipc_analysis_schema`
- Local file: `supabase/migrations/202604270001_initial_pipc_analysis_schema.sql`

## Schema Summary

The initial schema creates 26 public tables:

- `import_batches`
- `source_documents`
- `meetings`
- `meeting_files`
- `agenda_items`
- `agenda_decision_links`
- `decision_posts`
- `decision_cases`
- `decision_files`
- `entities`
- `case_entities`
- `sanctions`
- `monetary_penalties`
- `laws`
- `law_articles`
- `law_versions`
- `law_article_versions`
- `law_citations`
- `topics`
- `topic_links`
- `commissioners`
- `commissioner_terms`
- `utterances`
- `utterance_case_links`
- `persona_features`
- `document_chunks`

## Extensions

Installed extensions:

- `vector`
- `pg_trgm`
- `unaccent`
- `pgcrypto`

## Security Posture

- Row Level Security is enabled on all public tables.
- No public read/write policies are created yet.
- Data loading and analysis should run through privileged server-side tooling or MCP/SQL during the build phase.

## Next Data Loading Order

1. Seed `commissioners` and `commissioner_terms` from `pipc_knowledge_base/90_normalized_data/commissioners.csv`.
2. Load meeting and meeting attachment metadata from `pipc_minutes_crawler/data/*.csv`.
3. Load decision post and attachment metadata from `pipc_committee_decisions_crawler/data/*.csv`.
4. Convert all transcripts and decisions to raw Markdown.
5. Populate `agenda_items`, `decision_cases`, `sanctions`, `monetary_penalties`, and `law_citations`.
6. Extract `utterances`, link them to commissioners, agendas, cases, law articles, and topics.
7. Generate `document_chunks` and embeddings for semantic retrieval.
