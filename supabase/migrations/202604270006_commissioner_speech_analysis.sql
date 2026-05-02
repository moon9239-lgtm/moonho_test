-- Purpose: store first-pass commissioner speech aggregates, samples, and rule-based tendency tags.

create table if not exists public.commissioner_speech_aggregates (
  id uuid primary key default gen_random_uuid(),
  commissioner_id uuid not null references public.commissioners(id) on delete cascade,
  total_utterances integer not null default 0,
  meeting_count integer not null default 0,
  agenda_utterance_count integer not null default 0,
  case_utterance_count integer not null default 0,
  agenda_count integer not null default 0,
  case_count integer not null default 0,
  total_char_count integer not null default 0,
  first_utterance_date date,
  last_utterance_date date,
  agenda_kind_counts jsonb not null default '{}'::jsonb,
  visibility_counts jsonb not null default '{}'::jsonb,
  sanction_counts jsonb not null default '{}'::jsonb,
  law_article_counts jsonb not null default '{}'::jsonb,
  tendency_tag_counts jsonb not null default '{}'::jsonb,
  sample_md_path text,
  extraction_status text not null default 'candidate',
  source_confidence numeric(4,3),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (commissioner_id)
);

create table if not exists public.commissioner_speech_samples (
  id uuid primary key default gen_random_uuid(),
  commissioner_id uuid not null references public.commissioners(id) on delete cascade,
  utterance_id uuid references public.utterances(id) on delete set null,
  sample_rank integer not null,
  utterance_date date,
  meeting_idx_id text,
  meeting_title text,
  agenda_title text,
  case_title text,
  speaker_role text,
  excerpt text not null,
  tag_keys text[] not null default '{}'::text[],
  selection_reason text,
  extraction_status text not null default 'candidate',
  source_confidence numeric(4,3),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (commissioner_id, sample_rank)
);

create table if not exists public.utterance_tendency_tags (
  id uuid primary key default gen_random_uuid(),
  utterance_id uuid not null references public.utterances(id) on delete cascade,
  commissioner_id uuid references public.commissioners(id) on delete cascade,
  tag_key text not null,
  tag_label text not null,
  tag_category text not null,
  confidence numeric(4,3),
  evidence_text text,
  extraction_status text not null default 'candidate',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (utterance_id, tag_key)
);

create table if not exists public.commissioner_tendency_stats (
  id uuid primary key default gen_random_uuid(),
  commissioner_id uuid not null references public.commissioners(id) on delete cascade,
  tag_key text not null,
  tag_label text not null,
  tag_category text not null,
  utterance_count integer not null default 0,
  evidence_count integer not null default 0,
  average_confidence numeric(5,4),
  sample_utterance_refs jsonb not null default '[]'::jsonb,
  extraction_status text not null default 'candidate',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (commissioner_id, tag_key)
);

create index if not exists idx_commissioner_speech_samples_commissioner
  on public.commissioner_speech_samples(commissioner_id, sample_rank);

create index if not exists idx_utterance_tendency_tags_commissioner
  on public.utterance_tendency_tags(commissioner_id, tag_key);

create index if not exists idx_utterance_tendency_tags_tag
  on public.utterance_tendency_tags(tag_key);

create index if not exists idx_commissioner_tendency_stats_tag
  on public.commissioner_tendency_stats(tag_key);

drop trigger if exists set_commissioner_speech_aggregates_updated_at on public.commissioner_speech_aggregates;
create trigger set_commissioner_speech_aggregates_updated_at before update on public.commissioner_speech_aggregates
for each row execute function public.set_updated_at();

drop trigger if exists set_utterance_tendency_tags_updated_at on public.utterance_tendency_tags;
create trigger set_utterance_tendency_tags_updated_at before update on public.utterance_tendency_tags
for each row execute function public.set_updated_at();

drop trigger if exists set_commissioner_tendency_stats_updated_at on public.commissioner_tendency_stats;
create trigger set_commissioner_tendency_stats_updated_at before update on public.commissioner_tendency_stats
for each row execute function public.set_updated_at();
