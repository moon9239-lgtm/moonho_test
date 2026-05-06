-- Purpose: persist the local PIPC dashboard analysis outputs in Supabase and
-- add provenance tables for meeting document parsing.

create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_trgm with schema extensions;

create table if not exists public.document_parse_runs (
  id uuid primary key default gen_random_uuid(),
  source_document_id uuid references public.source_documents(id) on delete cascade,
  parser_name text not null,
  parser_version text not null,
  input_sha256 text,
  output_sha256 text,
  status text not null default 'running',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  error text,
  metrics jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.meeting_document_sections (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  source_document_id uuid not null references public.source_documents(id) on delete cascade,
  parse_run_id uuid references public.document_parse_runs(id) on delete set null,
  agenda_item_id uuid references public.agenda_items(id) on delete set null,
  parent_section_id uuid references public.meeting_document_sections(id) on delete set null,
  section_kind text not null,
  heading_text text not null,
  heading_label text,
  section_order integer not null,
  start_line integer,
  end_line integer,
  start_char integer,
  end_char integer,
  parse_status text not null default 'parsed',
  confidence numeric(4,3),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agenda_document_mentions (
  id uuid primary key default gen_random_uuid(),
  agenda_item_id uuid not null references public.agenda_items(id) on delete cascade,
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  source_document_id uuid not null references public.source_documents(id) on delete cascade,
  parse_run_id uuid references public.document_parse_runs(id) on delete set null,
  section_id uuid references public.meeting_document_sections(id) on delete set null,
  mention_role text not null,
  label_in_document text,
  agenda_kind_in_document text,
  order_in_kind integer,
  title_in_document text,
  visibility_in_document text,
  line_start integer,
  line_end integer,
  confidence numeric(4,3),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.agenda_speaker_summaries (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  agenda_item_id uuid not null references public.agenda_items(id) on delete cascade,
  commissioner_id uuid references public.commissioners(id) on delete set null,
  speaker_name text not null,
  speaker_role text,
  utterance_count integer not null default 0,
  key_points jsonb not null default '[]'::jsonb,
  stance text,
  cited_law_article_ids uuid[] not null default '{}'::uuid[],
  evidence_utterance_ids uuid[] not null default '{}'::uuid[],
  summary text,
  confidence numeric(4,3),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agenda_item_id, speaker_name, speaker_role)
);

create table if not exists public.dashboard_generated_artifacts (
  id uuid primary key default gen_random_uuid(),
  artifact_key text not null,
  artifact_version text not null default 'current',
  source_file text,
  source_kind text not null default 'javascript',
  generated_at timestamptz,
  sha256 text not null,
  byte_size bigint not null,
  chunk_count integer not null default 0,
  status text not null default 'uploaded',
  is_current boolean not null default false,
  payload_summary jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (artifact_key, sha256)
);

create table if not exists public.dashboard_generated_artifact_chunks (
  id uuid primary key default gen_random_uuid(),
  artifact_id uuid not null references public.dashboard_generated_artifacts(id) on delete cascade,
  chunk_index integer not null,
  chunk_text text not null,
  encoding text not null default 'base64',
  byte_size integer not null,
  sha256 text not null,
  created_at timestamptz not null default now(),
  unique (artifact_id, chunk_index)
);

create table if not exists public.dashboard_meeting_analysis_summaries (
  id uuid primary key default gen_random_uuid(),
  generated_artifact_id uuid not null references public.dashboard_generated_artifacts(id) on delete cascade,
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  meeting_date date,
  meeting_year integer,
  quarter integer,
  meeting_label text,
  title text,
  source_path text,
  agenda_count integer,
  utterance_count integer,
  law_reference_count integer,
  targets text[] not null default '{}'::text[],
  keywords text[] not null default '{}'::text[],
  law_articles text[] not null default '{}'::text[],
  speakers jsonb not null default '[]'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (generated_artifact_id, meeting_id)
);

create table if not exists public.dashboard_agenda_search_entries (
  id uuid primary key default gen_random_uuid(),
  generated_artifact_id uuid not null references public.dashboard_generated_artifacts(id) on delete cascade,
  entry_id text not null,
  meeting_id uuid references public.meetings(id) on delete cascade,
  meeting_date date,
  meeting_year integer,
  quarter integer,
  quarter_key text,
  meeting_label text,
  title text not null,
  agenda_type text,
  start_utterance_id text,
  utterance_count integer,
  targets text[] not null default '{}'::text[],
  law_articles text[] not null default '{}'::text[],
  issue_tags text[] not null default '{}'::text[],
  dispositions text[] not null default '{}'::text[],
  amount_total_krw bigint,
  amount_text text,
  case_ids text[] not null default '{}'::text[],
  source_confidence jsonb not null default '[]'::jsonb,
  similar_agendas jsonb not null default '[]'::jsonb,
  speakers text[] not null default '{}'::text[],
  keywords text[] not null default '{}'::text[],
  snippet text,
  is_procedural boolean not null default false,
  search_text text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (generated_artifact_id, entry_id)
);

create table if not exists public.dashboard_commissioner_character_assets (
  id uuid primary key default gen_random_uuid(),
  generated_artifact_id uuid not null references public.dashboard_generated_artifacts(id) on delete cascade,
  character_id text not null,
  commissioner_id uuid references public.commissioners(id) on delete set null,
  name text not null,
  role text,
  status text,
  character_type text,
  asset_path text,
  aliases text[] not null default '{}'::text[],
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (generated_artifact_id, character_id)
);

create unique index if not exists ux_dashboard_generated_artifacts_current
  on public.dashboard_generated_artifacts(artifact_key)
  where is_current;

create index if not exists idx_document_parse_runs_source
  on public.document_parse_runs(source_document_id, started_at desc);

create unique index if not exists ux_meeting_document_sections_document_order
  on public.meeting_document_sections(source_document_id, section_order);

create index if not exists idx_meeting_document_sections_meeting
  on public.meeting_document_sections(meeting_id, section_kind, section_order);

create index if not exists idx_meeting_document_sections_agenda
  on public.meeting_document_sections(agenda_item_id);

create index if not exists idx_agenda_document_mentions_agenda
  on public.agenda_document_mentions(agenda_item_id, mention_role);

create index if not exists idx_agenda_document_mentions_document
  on public.agenda_document_mentions(source_document_id, line_start);

create index if not exists idx_agenda_speaker_summaries_agenda
  on public.agenda_speaker_summaries(agenda_item_id);

create index if not exists idx_dashboard_generated_artifact_chunks_artifact
  on public.dashboard_generated_artifact_chunks(artifact_id, chunk_index);

create index if not exists idx_dashboard_meeting_analysis_summaries_date
  on public.dashboard_meeting_analysis_summaries(meeting_date desc);

create index if not exists idx_dashboard_agenda_search_entries_meeting
  on public.dashboard_agenda_search_entries(meeting_id, meeting_date desc);

create index if not exists idx_dashboard_agenda_search_entries_issue_tags
  on public.dashboard_agenda_search_entries using gin(issue_tags);

create index if not exists idx_dashboard_agenda_search_entries_dispositions
  on public.dashboard_agenda_search_entries using gin(dispositions);

create index if not exists idx_dashboard_agenda_search_entries_targets
  on public.dashboard_agenda_search_entries using gin(targets);

create index if not exists idx_dashboard_agenda_search_entries_law_articles
  on public.dashboard_agenda_search_entries using gin(law_articles);

create index if not exists idx_dashboard_agenda_search_entries_search_text
  on public.dashboard_agenda_search_entries using gin(search_text gin_trgm_ops);

drop trigger if exists set_meeting_document_sections_updated_at on public.meeting_document_sections;
create trigger set_meeting_document_sections_updated_at before update on public.meeting_document_sections
for each row execute function public.set_updated_at();

drop trigger if exists set_agenda_speaker_summaries_updated_at on public.agenda_speaker_summaries;
create trigger set_agenda_speaker_summaries_updated_at before update on public.agenda_speaker_summaries
for each row execute function public.set_updated_at();

drop trigger if exists set_dashboard_generated_artifacts_updated_at on public.dashboard_generated_artifacts;
create trigger set_dashboard_generated_artifacts_updated_at before update on public.dashboard_generated_artifacts
for each row execute function public.set_updated_at();

create or replace view public.dashboard_current_meeting_analysis_summaries
with (security_invoker = true) as
select s.*
from public.dashboard_meeting_analysis_summaries s
join public.dashboard_generated_artifacts a
  on a.id = s.generated_artifact_id
where a.artifact_key = 'meeting-analysis-index'
  and a.is_current;

create or replace view public.dashboard_current_agenda_search_entries
with (security_invoker = true) as
select e.*
from public.dashboard_agenda_search_entries e
join public.dashboard_generated_artifacts a
  on a.id = e.generated_artifact_id
where a.artifact_key = 'meeting-analysis-index'
  and a.is_current;

create or replace view public.dashboard_current_commissioner_character_assets
with (security_invoker = true) as
select c.*
from public.dashboard_commissioner_character_assets c
join public.dashboard_generated_artifacts a
  on a.id = c.generated_artifact_id
where a.artifact_key = 'meeting-analysis-index'
  and a.is_current;

create or replace view public.dashboard_current_generated_artifacts
with (security_invoker = true) as
select
  a.id,
  a.artifact_key,
  a.artifact_version,
  a.source_file,
  a.source_kind,
  a.generated_at,
  a.sha256,
  a.byte_size,
  a.chunk_count,
  a.status,
  a.payload_summary,
  a.metadata,
  a.created_at,
  a.updated_at
from public.dashboard_generated_artifacts a
where a.is_current;

create or replace view public.dashboard_meeting_transcripts
with (security_invoker = true) as
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

alter table public.document_parse_runs enable row level security;
alter table public.meeting_document_sections enable row level security;
alter table public.agenda_document_mentions enable row level security;
alter table public.agenda_speaker_summaries enable row level security;
alter table public.dashboard_generated_artifacts enable row level security;
alter table public.dashboard_generated_artifact_chunks enable row level security;
alter table public.dashboard_meeting_analysis_summaries enable row level security;
alter table public.dashboard_agenda_search_entries enable row level security;
alter table public.dashboard_commissioner_character_assets enable row level security;

alter table public.commissioner_speech_aggregates enable row level security;
alter table public.verified_penalty_outcomes enable row level security;
alter table public.commissioner_speech_samples enable row level security;
alter table public.case_target_identification_checks enable row level security;
alter table public.utterance_tendency_tags enable row level security;
alter table public.commissioner_tendency_stats enable row level security;
