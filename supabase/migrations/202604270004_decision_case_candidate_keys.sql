-- Purpose: make first-pass decision case normalization idempotent.
-- The extraction in this phase is candidate-grade and should remain
-- distinguishable from later human/MCP verified legal analysis.

alter table public.decision_cases
  add column if not exists case_key text,
  add column if not exists extraction_status text not null default 'candidate',
  add column if not exists source_confidence numeric(4,3);

alter table public.sanctions
  add column if not exists source_key text,
  add column if not exists extraction_status text not null default 'candidate',
  add column if not exists source_confidence numeric(4,3);

alter table public.monetary_penalties
  add column if not exists source_key text,
  add column if not exists extraction_status text not null default 'candidate',
  add column if not exists source_confidence numeric(4,3);

alter table public.law_citations
  add column if not exists source_key text,
  add column if not exists extraction_status text not null default 'candidate',
  add column if not exists source_confidence numeric(4,3);

create unique index if not exists ux_decision_cases_post_case_key
  on public.decision_cases(decision_post_id, case_key)
  where case_key is not null;

create unique index if not exists ux_sanctions_case_source_key
  on public.sanctions(case_id, source_key)
  where source_key is not null;

create unique index if not exists ux_monetary_penalties_case_source_key
  on public.monetary_penalties(case_id, source_key)
  where source_key is not null;

create unique index if not exists ux_law_citations_source_key
  on public.law_citations(source_type, source_id, source_key)
  where source_id is not null and source_key is not null;

create index if not exists idx_decision_cases_case_key
  on public.decision_cases(case_key);

create index if not exists idx_sanctions_source_key
  on public.sanctions(source_key);

create index if not exists idx_monetary_penalties_source_key
  on public.monetary_penalties(source_key);

create index if not exists idx_law_citations_source_key
  on public.law_citations(source_key);
