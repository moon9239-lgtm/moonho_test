-- Purpose: make agenda extraction from meeting schedule pages idempotent.

alter table public.agenda_items
  add column if not exists agenda_key text,
  add column if not exists original_agenda_no text,
  add column if not exists section_order integer,
  add column if not exists item_order integer,
  add column if not exists extraction_status text not null default 'candidate',
  add column if not exists source_confidence numeric(4,3);

create unique index if not exists ux_agenda_items_meeting_agenda_key
  on public.agenda_items(meeting_id, agenda_key)
  where agenda_key is not null;

create index if not exists idx_agenda_items_agenda_key
  on public.agenda_items(agenda_key);

create index if not exists idx_agenda_items_case_numbers_gin
  on public.agenda_items using gin (case_numbers);
