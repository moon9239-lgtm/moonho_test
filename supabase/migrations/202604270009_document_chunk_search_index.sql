-- Purpose: expose raw document chunks as a dashboard/search-ready index.

create index if not exists idx_document_chunks_chunk_text_trgm
  on public.document_chunks using gin (chunk_text gin_trgm_ops);

create index if not exists idx_document_chunks_summary_trgm
  on public.document_chunks using gin (summary gin_trgm_ops);

create or replace view public.dashboard_document_chunk_search_index as
select
  dc.id as chunk_id,
  dc.source_document_id,
  dc.source_type,
  dc.source_id,
  dc.chunk_index,
  dc.summary,
  dc.token_count,
  dc.chunk_text,
  sd.document_type,
  sd.external_id,
  sd.title as document_title,
  sd.document_date,
  sd.published_date,
  sd.source_url,
  sd.raw_md_path,
  sd.file_name,
  sd.file_ext,
  (dc.metadata ->> 'heading') as heading,
  (dc.embedding is not null) as has_embedding,
  dc.metadata
from public.document_chunks dc
join public.source_documents sd on sd.id = dc.source_document_id;
