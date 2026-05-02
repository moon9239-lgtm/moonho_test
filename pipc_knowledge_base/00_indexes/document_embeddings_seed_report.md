# Document Embeddings Seed Report

- started_at: 2026-04-26T17:52:43.608Z
- finished_at: 2026-04-26T17:52:49.675Z
- model: text-embedding-3-small
- dimensions: 1536
- dry_run: yes
- target_chunks_this_run: 9059
- total_chunks: 9059
- chunks_with_embedding: 0
- chunks_missing_embedding: 9059
- source_documents_with_embedding: 0

## Coverage By Document Type

| document_type | source_documents_total | eligible_documents | chunked_documents | chunk_rows | chunks_with_embedding | chunked_eligible_ratio |
| --- | --- | --- | --- | --- | --- | --- |
| decision_pdf | 506 | 503 | 503 | 3524 | 0 | 1.0000 |
| meeting_transcript_file | 114 | 114 | 114 | 2854 | 0 | 1.0000 |
| decision_hwp | 484 | 481 | 481 | 2681 | 0 | 1.0000 |
| decision_post_page | 152 | 0 | 0 | 0 | 0 |  |
| meeting_page | 126 | 0 | 0 | 0 | 0 |  |
| meeting_minutes_file | 119 | 0 | 0 | 0 | 0 |  |

## Notes

- Embeddings are generated only for chunks where `embedding is null`.
- The script is resumable; rerunning it skips already embedded chunks.
- The vector column is `extensions.vector(1536)`, so the embedding dimension is pinned to 1536.
