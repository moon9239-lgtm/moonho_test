# Document Chunks Seed Report

- generated_at: 2026-04-26T17:44:27.362Z
- upload: yes
- source_documents_queried: 1098
- source_documents_chunked: 1098
- source_documents_missing_file: 0
- chunks_generated: 9059
- max_chars: 1800
- overlap_chars: 220

## By Document Type

| document_type | source_documents | chunked_documents | chunks |
| --- | --- | --- | --- |
| decision_pdf | 503 | 503 | 3524 |
| decision_hwp | 481 | 481 | 2681 |
| meeting_transcript_file | 114 | 114 | 2854 |

## By Source Type

| source_type | chunks |
| --- | --- |
| decision_case | 6205 |
| meeting | 2854 |

## Notes

- Embeddings are not generated in this pass. The `embedding` column remains null.
- Chunks are built only from converted source documents with `raw_md_path`.
- Meeting pages, decision post pages, pending minutes files, and source-failed files remain unchunked by design.
- Chunk text can be used for keyword/full-text style search now; semantic search needs the next embedding pass.
