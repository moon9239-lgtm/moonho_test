create unique index if not exists ux_source_documents_external_doc_type
on public.source_documents (source_system, document_type, external_id)
where external_id is not null;

create unique index if not exists ux_meeting_files_attachment_key
on public.meeting_files (
  meeting_id,
  coalesce(atch_file_id, ''),
  coalesce(file_sn, -1)
);

create unique index if not exists ux_decision_files_attachment_key
on public.decision_files (
  decision_post_id,
  coalesce(atch_file_id, ''),
  coalesce(file_sn, -1),
  coalesce(file_ext, ''),
  coalesce(cnv_cnt, -1)
)
where decision_post_id is not null;
