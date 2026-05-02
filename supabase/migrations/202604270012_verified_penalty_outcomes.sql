-- Purpose: store final monetary sanctions parsed from the order/disposition text.

create table if not exists public.verified_penalty_outcomes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.decision_cases(id) on delete cascade,
  penalty_kind text not null,
  amount_krw bigint not null,
  amount_text text,
  source_text text,
  verification_status text not null default 'verified',
  source_confidence numeric(5,3),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(case_id, penalty_kind)
);

create index if not exists idx_verified_penalty_outcomes_case_id
  on public.verified_penalty_outcomes(case_id);

create index if not exists idx_verified_penalty_outcomes_kind_amount
  on public.verified_penalty_outcomes(penalty_kind, amount_krw);
