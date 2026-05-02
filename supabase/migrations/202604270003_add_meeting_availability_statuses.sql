alter table public.meetings
  add column if not exists minutes_status text not null default 'unknown',
  add column if not exists transcript_status text not null default 'unknown',
  add column if not exists utterance_analysis_status text not null default 'not_ready',
  add column if not exists availability_note text;

alter table public.meetings
  drop constraint if exists meetings_minutes_status_check,
  add constraint meetings_minutes_status_check
    check (minutes_status in ('available', 'missing', 'not_published', 'unknown'));

alter table public.meetings
  drop constraint if exists meetings_transcript_status_check,
  add constraint meetings_transcript_status_check
    check (transcript_status in ('available', 'missing', 'not_published', 'unknown'));

alter table public.meetings
  drop constraint if exists meetings_utterance_analysis_status_check,
  add constraint meetings_utterance_analysis_status_check
    check (utterance_analysis_status in ('ready', 'unavailable_no_transcript', 'not_ready'));

create index if not exists idx_meetings_availability_status
on public.meetings (minutes_status, transcript_status, utterance_analysis_status);
