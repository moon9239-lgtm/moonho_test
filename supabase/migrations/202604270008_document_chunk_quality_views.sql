-- Purpose: refine dashboard quality metrics after raw Markdown chunking.

create or replace view public.dashboard_document_chunk_coverage as
with doc_stats as (
  select
    d.id,
    d.document_type,
    d.parse_status,
    (d.raw_md_path is not null and d.raw_md_path <> '') as has_raw_md,
    count(dc.id)::bigint as chunk_rows,
    count(dc.id) filter (where dc.embedding is not null)::bigint as chunks_with_embedding,
    round(avg(dc.token_count)::numeric, 1) as avg_token_estimate
  from public.source_documents d
  left join public.document_chunks dc on dc.source_document_id = d.id
  group by d.id, d.document_type, d.parse_status, d.raw_md_path
)
select
  document_type,
  count(*)::bigint as source_documents_total,
  count(*) filter (where parse_status = 'converted' and has_raw_md)::bigint as eligible_documents,
  count(*) filter (where chunk_rows > 0)::bigint as chunked_documents,
  sum(chunk_rows)::bigint as chunk_rows,
  sum(chunks_with_embedding)::bigint as chunks_with_embedding,
  round(
    count(*) filter (where chunk_rows > 0)::numeric
    / nullif(count(*) filter (where parse_status = 'converted' and has_raw_md), 0),
    4
  ) as chunked_eligible_ratio,
  round(sum(chunk_rows)::numeric / nullif(count(*) filter (where chunk_rows > 0), 0), 2) as avg_chunks_per_chunked_document,
  round(avg(avg_token_estimate) filter (where chunk_rows > 0), 1) as avg_token_estimate
from doc_stats
group by document_type;

create or replace view public.dashboard_tab1_data_quality as
with counts as (
  select
    (select count(*) from public.meetings)::bigint as meetings_total,
    (select count(*) from public.meetings where utterance_analysis_status = 'ready')::bigint as transcript_ready_meetings,
    (select count(*) from public.utterances)::bigint as utterances_total,
    (select count(*) from public.utterances where agenda_item_id is not null)::bigint as utterances_with_agenda,
    (select count(*) from public.decision_posts)::bigint as decision_posts_total,
    (select count(distinct decision_post_id) from public.agenda_decision_links)::bigint as linked_decision_posts,
    (select count(*) from public.decision_cases)::bigint as decision_cases_total,
    (select count(distinct case_id) from public.utterance_case_links)::bigint as decision_cases_with_utterance_links,
    (select count(*) from public.law_citations where source_type = 'decision_case')::bigint as decision_case_law_citations,
    (select count(*) from public.law_citations where source_type = 'decision_case' and verification_status = 'verified')::bigint as verified_law_citations,
    (
      select count(*)
      from public.source_documents
      where parse_status = 'converted'
        and raw_md_path is not null
        and raw_md_path <> ''
    )::bigint as chunk_eligible_documents,
    (select count(distinct source_document_id) from public.document_chunks)::bigint as chunked_source_documents,
    (select count(*) from public.document_chunks)::bigint as document_chunk_rows,
    (select count(*) from public.document_chunks where embedding is not null)::bigint as chunks_with_embedding,
    (select count(*) from public.monetary_penalties)::bigint as penalty_rows_total,
    (select count(*) from public.monetary_penalties where extraction_status = 'verified')::bigint as verified_penalty_rows
)
select
  'transcript_ready_meetings'::text as metric_key,
  '속기록 분석 가능 회의'::text as label,
  transcript_ready_meetings as value_count,
  meetings_total as total_count,
  round(transcript_ready_meetings::numeric / nullif(meetings_total, 0), 4) as ratio,
  case when transcript_ready_meetings = meetings_total then 'ready' else 'partial' end as status,
  '속기록이 없는 회차는 없는 상태 그대로 표시해야 합니다.'::text as notes
from counts
union all
select
  'utterances_with_agenda',
  '안건 연결 발언',
  utterances_with_agenda,
  utterances_total,
  round(utterances_with_agenda::numeric / nullif(utterances_total, 0), 4),
  case when utterances_with_agenda = utterances_total then 'ready' else 'partial' end,
  '일부 발언은 개회, 폐회, 절차 발언 등이라 특정 안건에 붙지 않을 수 있습니다.'
from counts
union all
select
  'decision_posts_linked_to_agenda',
  '회의 안건과 연결된 결정문 게시글',
  linked_decision_posts,
  decision_posts_total,
  round(linked_decision_posts::numeric / nullif(decision_posts_total, 0), 4),
  case when linked_decision_posts = decision_posts_total then 'ready' else 'partial' end,
  '제목, 회차, 사건번호 기반 후보 연결입니다.'
from counts
union all
select
  'decision_cases_with_utterance_links',
  '발언과 연결된 결정 사건',
  decision_cases_with_utterance_links,
  decision_cases_total,
  round(decision_cases_with_utterance_links::numeric / nullif(decision_cases_total, 0), 4),
  case when decision_cases_with_utterance_links = decision_cases_total then 'ready' else 'needs_work' end,
  '위원 질의와 결정문 사건을 직접 연결한 범위입니다. 향후 검색/RAG로 보강할 구간입니다.'
from counts
union all
select
  'law_citations_verified',
  '법령 MCP 검증 조항',
  verified_law_citations,
  decision_case_law_citations,
  round(verified_law_citations::numeric / nullif(decision_case_law_citations, 0), 4),
  case when verified_law_citations = decision_case_law_citations and decision_case_law_citations > 0 then 'ready' else 'needs_work' end,
  '현재 조항은 원문 후보 추출값입니다. korean-law-mcp로 시점별 조문 검증이 필요합니다.'
from counts
union all
select
  'document_chunks',
  '원문 MD 청크 생성 문서',
  chunked_source_documents,
  chunk_eligible_documents,
  round(chunked_source_documents::numeric / nullif(chunk_eligible_documents, 0), 4),
  case when chunked_source_documents = chunk_eligible_documents and chunk_eligible_documents > 0 then 'ready' else 'needs_work' end,
  '변환 완료되어 raw_md_path가 있는 문서 기준입니다. 회의/게시글 메타데이터만 있는 문서는 분모에서 제외합니다.'
from counts
union all
select
  'document_embeddings',
  '임베딩 생성 청크',
  chunks_with_embedding,
  document_chunk_rows,
  round(chunks_with_embedding::numeric / nullif(document_chunk_rows, 0), 4),
  case when chunks_with_embedding = document_chunk_rows and document_chunk_rows > 0 then 'ready' else 'needs_work' end,
  '키워드 검색용 청크는 준비됐고, 의미 기반 유사사건 검색은 임베딩 적재가 필요합니다.'
from counts
union all
select
  'verified_penalty_rows',
  '검증 완료 금액 행',
  verified_penalty_rows,
  penalty_rows_total,
  round(verified_penalty_rows::numeric / nullif(penalty_rows_total, 0), 4),
  case when verified_penalty_rows = penalty_rows_total and penalty_rows_total > 0 then 'ready' else 'needs_work' end,
  '금액 후보는 본문 숫자 추출값이라 최종액, 기준금액, 감경액 분리가 필요합니다.'
from counts;
