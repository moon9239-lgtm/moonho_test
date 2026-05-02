-- PIPC analysis schema
-- Purpose: normalize meetings, agendas, decision cases, sanctions, law citations,
-- commissioner terms, utterances, and RAG chunks for later analysis/simulation.

create extension if not exists pgcrypto with schema extensions;
create extension if not exists vector with schema extensions;
create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.import_batches (
  id uuid primary key default gen_random_uuid(),
  batch_type text not null,
  status text not null default 'running',
  source_root text,
  notes text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.source_documents (
  id uuid primary key default gen_random_uuid(),
  import_batch_id uuid references public.import_batches(id) on delete set null,
  source_system text not null,
  document_type text not null,
  external_id text,
  title text,
  document_date date,
  published_date date,
  source_url text,
  download_url text,
  local_path text,
  raw_md_path text,
  file_name text,
  file_ext text,
  mime_type text,
  sha256 text,
  size_bytes bigint,
  parse_status text not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  pipc_idx_id text unique,
  meeting_number integer,
  title text not null,
  division text not null default '보호위원회',
  meeting_date date not null,
  start_time time,
  location text,
  detail_url text,
  source_document_id uuid references public.source_documents(id) on delete set null,
  minutes_document_id uuid references public.source_documents(id) on delete set null,
  transcript_document_id uuid references public.source_documents(id) on delete set null,
  agenda_count integer,
  public_agenda_count integer,
  private_agenda_count integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meeting_files (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  source_document_id uuid references public.source_documents(id) on delete set null,
  file_kind text not null,
  attachment_name text,
  atch_file_id text,
  file_sn integer,
  download_url text,
  local_path text,
  raw_md_path text,
  status text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.decision_posts (
  id uuid primary key default gen_random_uuid(),
  pipc_idx_id text unique,
  decision_number integer,
  committee_type text not null default '위원회',
  title text not null,
  decision_date date,
  created_date date,
  bill_number_text text,
  detail_url text,
  content_summary text,
  source_document_id uuid references public.source_documents(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agenda_items (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  agenda_no integer,
  agenda_kind text,
  visibility text,
  title text not null,
  case_numbers text[] not null default '{}'::text[],
  result text,
  summary text,
  source_status text not null default 'parsed',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (meeting_id, agenda_no)
);

create table if not exists public.agenda_decision_links (
  agenda_item_id uuid not null references public.agenda_items(id) on delete cascade,
  decision_post_id uuid not null references public.decision_posts(id) on delete cascade,
  link_method text not null,
  confidence numeric(4,3),
  notes text,
  created_at timestamptz not null default now(),
  primary key (agenda_item_id, decision_post_id)
);

create table if not exists public.entities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text,
  entity_kind text,
  sector text,
  is_public_sector boolean,
  identifiers jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name)
);

create table if not exists public.decision_cases (
  id uuid primary key default gen_random_uuid(),
  decision_post_id uuid not null references public.decision_posts(id) on delete cascade,
  main_entity_id uuid references public.entities(id) on delete set null,
  case_no text,
  bill_number text,
  title text,
  decision_date date,
  violation_period text,
  investigation_case_no text,
  summary text,
  disposition_summary text,
  outcome text,
  source_document_id uuid references public.source_documents(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (decision_post_id, case_no)
);

create table if not exists public.case_entities (
  case_id uuid not null references public.decision_cases(id) on delete cascade,
  entity_id uuid not null references public.entities(id) on delete cascade,
  role text not null default 'respondent',
  entity_name_in_source text,
  created_at timestamptz not null default now(),
  primary key (case_id, entity_id, role)
);

create table if not exists public.decision_files (
  id uuid primary key default gen_random_uuid(),
  decision_post_id uuid references public.decision_posts(id) on delete cascade,
  decision_case_id uuid references public.decision_cases(id) on delete set null,
  source_document_id uuid references public.source_documents(id) on delete set null,
  file_kind text not null default 'decision_attachment',
  attachment_name text,
  atch_file_id text,
  file_sn integer,
  file_ext text,
  cnv_cnt integer,
  download_url text,
  local_path text,
  raw_md_path text,
  status text,
  error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.sanctions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.decision_cases(id) on delete cascade,
  sanction_kind text not null,
  sanction_label text,
  legal_basis_text text,
  order_text text,
  due_date date,
  result_status text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.monetary_penalties (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.decision_cases(id) on delete cascade,
  sanction_id uuid references public.sanctions(id) on delete set null,
  penalty_kind text not null,
  amount_krw bigint,
  amount_text text,
  base_amount_krw bigint,
  reduction_rate numeric(8,5),
  calculation_basis text,
  currency text not null default 'KRW',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.laws (
  id uuid primary key default gen_random_uuid(),
  law_name text not null,
  law_api_id text,
  law_type text,
  ministry text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (law_name)
);

create table if not exists public.law_articles (
  id uuid primary key default gen_random_uuid(),
  law_id uuid not null references public.laws(id) on delete cascade,
  article_no text not null,
  article_title text,
  canonical_article text,
  topic text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (law_id, article_no)
);

create table if not exists public.law_versions (
  id uuid primary key default gen_random_uuid(),
  law_id uuid not null references public.laws(id) on delete cascade,
  mst text,
  promulgation_date date,
  effective_date date,
  revision_type text,
  source_api text not null default 'korean-law-mcp',
  source_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (law_id, mst)
);

create table if not exists public.law_article_versions (
  id uuid primary key default gen_random_uuid(),
  law_article_id uuid not null references public.law_articles(id) on delete cascade,
  law_version_id uuid references public.law_versions(id) on delete set null,
  article_title text,
  article_text text not null,
  mcp_status text not null default 'pending',
  checked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (law_article_id, law_version_id)
);

create table if not exists public.law_citations (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_id uuid,
  law_article_id uuid references public.law_articles(id) on delete set null,
  law_article_version_id uuid references public.law_article_versions(id) on delete set null,
  law_name_raw text,
  article_raw text,
  cited_text text,
  issue text,
  time_basis_date date,
  time_basis_kind text,
  verification_status text not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  parent_topic_id uuid references public.topics(id) on delete set null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.topic_links (
  topic_id uuid not null references public.topics(id) on delete cascade,
  source_type text not null,
  source_id uuid not null,
  weight numeric(8,5),
  link_method text,
  created_at timestamptz not null default now(),
  primary key (topic_id, source_type, source_id)
);

create table if not exists public.commissioners (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  role_current text,
  status text,
  profile_path text,
  background_axis text,
  persona_status text not null default 'profile_seed',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.commissioner_terms (
  id uuid primary key default gen_random_uuid(),
  commissioner_id uuid not null references public.commissioners(id) on delete cascade,
  generation text,
  role text not null,
  status text,
  recommendation_route text,
  appointment_route text,
  official_term_text text,
  start_date date,
  end_date date,
  minutes_first_seen date,
  minutes_last_seen date,
  appearances integer,
  source_note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.utterances (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references public.meetings(id) on delete cascade,
  agenda_item_id uuid references public.agenda_items(id) on delete set null,
  commissioner_id uuid references public.commissioners(id) on delete set null,
  speaker_name text not null,
  speaker_role text,
  speaker_affiliation text,
  utterance_order integer,
  utterance_date date,
  raw_text text not null,
  normalized_text text,
  summary text,
  source_document_id uuid references public.source_documents(id) on delete set null,
  source_page text,
  confidence numeric(4,3),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.utterance_case_links (
  utterance_id uuid not null references public.utterances(id) on delete cascade,
  case_id uuid not null references public.decision_cases(id) on delete cascade,
  link_method text,
  confidence numeric(4,3),
  created_at timestamptz not null default now(),
  primary key (utterance_id, case_id)
);

create table if not exists public.persona_features (
  id uuid primary key default gen_random_uuid(),
  commissioner_id uuid not null references public.commissioners(id) on delete cascade,
  feature_type text not null,
  feature_key text not null,
  feature_value numeric(12,6),
  evidence_count integer not null default 0,
  evidence_summary text,
  confidence numeric(4,3),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (commissioner_id, feature_type, feature_key)
);

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  source_document_id uuid references public.source_documents(id) on delete cascade,
  source_type text,
  source_id uuid,
  chunk_index integer not null,
  chunk_text text not null,
  summary text,
  token_count integer,
  embedding extensions.vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (source_document_id, chunk_index)
);

create index if not exists idx_source_documents_external on public.source_documents(source_system, external_id);
create index if not exists idx_source_documents_type_date on public.source_documents(document_type, document_date);
create index if not exists idx_meetings_date on public.meetings(meeting_date);
create index if not exists idx_agenda_items_meeting on public.agenda_items(meeting_id, agenda_no);
create index if not exists idx_decision_posts_date on public.decision_posts(decision_date);
create index if not exists idx_decision_cases_entity on public.decision_cases(main_entity_id);
create index if not exists idx_sanctions_case_kind on public.sanctions(case_id, sanction_kind);
create index if not exists idx_monetary_penalties_case_kind on public.monetary_penalties(case_id, penalty_kind);
create index if not exists idx_law_articles_lookup on public.law_articles(law_id, article_no);
create index if not exists idx_law_versions_effective on public.law_versions(law_id, effective_date);
create index if not exists idx_law_citations_source on public.law_citations(source_type, source_id);
create index if not exists idx_law_citations_article on public.law_citations(law_article_id);
create index if not exists idx_topic_links_source on public.topic_links(source_type, source_id);
create index if not exists idx_commissioner_terms_member on public.commissioner_terms(commissioner_id);
create index if not exists idx_utterances_meeting_order on public.utterances(meeting_id, utterance_order);
create index if not exists idx_utterances_commissioner on public.utterances(commissioner_id);
create index if not exists idx_document_chunks_source on public.document_chunks(source_type, source_id);
create index if not exists idx_document_chunks_embedding on public.document_chunks using hnsw (embedding extensions.vector_cosine_ops);

create index if not exists idx_source_documents_title_trgm on public.source_documents using gin (title gin_trgm_ops);
create index if not exists idx_agenda_items_title_trgm on public.agenda_items using gin (title gin_trgm_ops);
create index if not exists idx_decision_posts_title_trgm on public.decision_posts using gin (title gin_trgm_ops);
create index if not exists idx_entities_name_trgm on public.entities using gin (name gin_trgm_ops);
create index if not exists idx_utterances_text_trgm on public.utterances using gin (normalized_text gin_trgm_ops);

drop trigger if exists set_source_documents_updated_at on public.source_documents;
create trigger set_source_documents_updated_at before update on public.source_documents
for each row execute function public.set_updated_at();

drop trigger if exists set_meetings_updated_at on public.meetings;
create trigger set_meetings_updated_at before update on public.meetings
for each row execute function public.set_updated_at();

drop trigger if exists set_decision_posts_updated_at on public.decision_posts;
create trigger set_decision_posts_updated_at before update on public.decision_posts
for each row execute function public.set_updated_at();

drop trigger if exists set_agenda_items_updated_at on public.agenda_items;
create trigger set_agenda_items_updated_at before update on public.agenda_items
for each row execute function public.set_updated_at();

drop trigger if exists set_entities_updated_at on public.entities;
create trigger set_entities_updated_at before update on public.entities
for each row execute function public.set_updated_at();

drop trigger if exists set_decision_cases_updated_at on public.decision_cases;
create trigger set_decision_cases_updated_at before update on public.decision_cases
for each row execute function public.set_updated_at();

drop trigger if exists set_sanctions_updated_at on public.sanctions;
create trigger set_sanctions_updated_at before update on public.sanctions
for each row execute function public.set_updated_at();

drop trigger if exists set_monetary_penalties_updated_at on public.monetary_penalties;
create trigger set_monetary_penalties_updated_at before update on public.monetary_penalties
for each row execute function public.set_updated_at();

drop trigger if exists set_laws_updated_at on public.laws;
create trigger set_laws_updated_at before update on public.laws
for each row execute function public.set_updated_at();

drop trigger if exists set_law_articles_updated_at on public.law_articles;
create trigger set_law_articles_updated_at before update on public.law_articles
for each row execute function public.set_updated_at();

drop trigger if exists set_law_article_versions_updated_at on public.law_article_versions;
create trigger set_law_article_versions_updated_at before update on public.law_article_versions
for each row execute function public.set_updated_at();

drop trigger if exists set_law_citations_updated_at on public.law_citations;
create trigger set_law_citations_updated_at before update on public.law_citations
for each row execute function public.set_updated_at();

drop trigger if exists set_topics_updated_at on public.topics;
create trigger set_topics_updated_at before update on public.topics
for each row execute function public.set_updated_at();

drop trigger if exists set_commissioners_updated_at on public.commissioners;
create trigger set_commissioners_updated_at before update on public.commissioners
for each row execute function public.set_updated_at();

drop trigger if exists set_commissioner_terms_updated_at on public.commissioner_terms;
create trigger set_commissioner_terms_updated_at before update on public.commissioner_terms
for each row execute function public.set_updated_at();

drop trigger if exists set_utterances_updated_at on public.utterances;
create trigger set_utterances_updated_at before update on public.utterances
for each row execute function public.set_updated_at();

drop trigger if exists set_persona_features_updated_at on public.persona_features;
create trigger set_persona_features_updated_at before update on public.persona_features
for each row execute function public.set_updated_at();

alter table public.import_batches enable row level security;
alter table public.source_documents enable row level security;
alter table public.meetings enable row level security;
alter table public.meeting_files enable row level security;
alter table public.decision_posts enable row level security;
alter table public.agenda_items enable row level security;
alter table public.agenda_decision_links enable row level security;
alter table public.entities enable row level security;
alter table public.decision_cases enable row level security;
alter table public.case_entities enable row level security;
alter table public.decision_files enable row level security;
alter table public.sanctions enable row level security;
alter table public.monetary_penalties enable row level security;
alter table public.laws enable row level security;
alter table public.law_articles enable row level security;
alter table public.law_versions enable row level security;
alter table public.law_article_versions enable row level security;
alter table public.law_citations enable row level security;
alter table public.topics enable row level security;
alter table public.topic_links enable row level security;
alter table public.commissioners enable row level security;
alter table public.commissioner_terms enable row level security;
alter table public.utterances enable row level security;
alter table public.utterance_case_links enable row level security;
alter table public.persona_features enable row level security;
alter table public.document_chunks enable row level security;
