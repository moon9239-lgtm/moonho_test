-- Purpose: track respondent identification quality and unresolved checkpoints.

create table if not exists public.case_target_identification_checks (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.decision_cases(id) on delete cascade,
  status text not null check (
    status in ('identified', 'needs_review', 'ambiguous', 'no_source', 'already_identified')
  ),
  candidate_name text,
  confidence numeric,
  method text,
  source_path text,
  evidence_text text,
  check_point text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (case_id)
);

create index if not exists case_target_identification_checks_status_idx
  on public.case_target_identification_checks (status);

create index if not exists case_target_identification_checks_candidate_name_idx
  on public.case_target_identification_checks (candidate_name);
