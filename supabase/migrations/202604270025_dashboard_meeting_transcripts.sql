create or replace view public.dashboard_meeting_transcripts as
select
  m.id as meeting_id,
  m.pipc_idx_id,
  extract(year from m.meeting_date)::int as meeting_year,
  m.meeting_date,
  m.meeting_number,
  m.title as meeting_title,
  coalesce(sd.title, mf.attachment_name, m.title || ' 속기록') as transcript_title,
  mf.attachment_name,
  coalesce(sd.file_name, mf.attachment_name) as file_name,
  coalesce(sd.raw_md_path, mf.raw_md_path) as raw_md_path,
  replace(coalesce(sd.raw_md_path, mf.raw_md_path), chr(92), '/') as transcript_path,
  coalesce(sd.size_bytes, nullif(mf.metadata ->> 'size_bytes', '')::bigint) as size_bytes,
  sd.parse_status,
  m.transcript_status,
  m.utterance_analysis_status,
  m.detail_url
from public.meetings m
left join public.source_documents sd
  on sd.id = m.transcript_document_id
left join lateral (
  select mf.*
  from public.meeting_files mf
  where mf.meeting_id = m.id
    and mf.file_kind = 'transcript'
  order by
    (mf.source_document_id = m.transcript_document_id) desc,
    mf.file_sn nulls last,
    mf.created_at
  limit 1
) mf on true
where coalesce(sd.raw_md_path, mf.raw_md_path) is not null
  and coalesce(sd.raw_md_path, mf.raw_md_path) <> '';
