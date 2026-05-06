# PIPC Meeting Document DB Design

## Goal

회의록과 속기록을 Supabase에 저장할 때 공식 안건 목록, 문서별 목차, 발언, 조항, 요약 분석을 서로 섞지 않고 재현 가능하게 저장한다.

## Current Evidence

- Supabase에는 이미 `meetings`, `source_documents`, `meeting_files`, `agenda_items`, `utterances`, `law_citations`, `document_chunks`가 있다.
- `agenda_items`에는 `agenda_kind`, `visibility`, `agenda_no`, `original_agenda_no`, `section_order`, `item_order`, `extraction_status`, `source_confidence`가 이미 있다.
- 2026-03-11 제4회 회의는 Supabase 기준 공식 안건 5개다.
- 2026-03-11 제4회 회의의 공식 안건 구성은 심의의결 4개, 보고 1개이며 공개 3개, 비공개 2개다.
- 해당 회의의 속기록/회의록 본문에는 `가`, `나`, `다`, `라` 심의의결안건 4개가 문서 섹션으로 보이고, 비공개 보고안건 1개는 공식 안건 원장에는 있으나 본문 발언 구간은 없을 수 있다.

## Design Principles

1. `agenda_items` is the official agenda ledger.
2. Document headings such as `가`, `나`, `다`, `라` are document evidence, not the only source of agenda truth.
3. A private agenda may have zero utterances and still be a valid official agenda.
4. Minutes and transcripts are separate source documents that may mention the same agenda differently.
5. Parser output must be traceable to source document, line range, confidence, and parse run.

## Recommended Model

### Existing Tables To Keep

`meetings`

- One row per official PIPC meeting.
- Stores meeting date, number, title, location, document pointers, agenda counts, and availability statuses.

`source_documents`

- One row per original or converted document.
- Stores source URL, local PDF path, converted markdown path, checksum, parse status, and metadata.

`meeting_files`

- Attachment-level relation between a meeting and a source document.
- `file_kind` should distinguish `minutes`, `transcript`, `agenda`, and other attachment kinds.

`agenda_items`

- One row per official agenda item.
- This remains the canonical table for agenda kind and visibility.
- Existing fields should be used as follows:
  - `agenda_no`: global order in the meeting.
  - `agenda_kind`: `deliberation_decision`, `report`, `procedure`, `unknown`.
  - `visibility`: `public`, `private`, `unknown`.
  - `original_agenda_no`: source label such as `①`.
  - `section_order`: agenda group order, e.g. deliberation section first and report section second.
  - `item_order`: order inside agenda group.
  - `result`: `approved`, `approved_as_written`, `received`, `deferred`, `withdrawn`, `unknown`, or Korean display text if unresolved.
  - `metadata`: visibility basis, source phrases, issue notes, parser version.

`utterances`

- One row per speaker turn from transcript-like documents.
- Link each utterance to `meeting_id`, `agenda_item_id`, `commissioner_id` when known, and `source_document_id`.
- Keep original speech in `raw_text`; use `normalized_text` for repaired wrapped text and search.

`law_citations`

- One row per law/article citation extracted from agenda, utterance, decision, or document section.
- `source_type` should allow `agenda_item`, `utterance`, `meeting_document_section`, and `document_chunk`.

`document_chunks`

- Retrieval and embedding layer.
- Use source identifiers to connect chunks to document sections, agenda items, and utterances where possible.

## New Tables

### `document_parse_runs`

Stores each parser/converter run so later corrections do not erase provenance.

```sql
create table public.document_parse_runs (
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
  metadata jsonb not null default '{}'::jsonb
);
```

### `meeting_document_sections`

Stores document headings and line ranges from minutes and transcripts.

```sql
create table public.meeting_document_sections (
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
```

Expected `section_kind` values:

- `overview`
- `opening`
- `previous_minutes_report`
- `agenda_status_visibility`
- `agenda_group`
- `agenda_item`
- `closing`
- `other`

### `agenda_document_mentions`

Stores how a document mentions or labels an official agenda.

```sql
create table public.agenda_document_mentions (
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
```

Expected `mention_role` values:

- `official_schedule`
- `chair_announcement`
- `visibility_decision`
- `minutes_heading`
- `transcript_heading`
- `result_summary`

### `agenda_speaker_summaries`

Stores per-agenda, per-speaker extracted summaries. Raw evidence stays in `utterances`.

```sql
create table public.agenda_speaker_summaries (
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
```

## 2026-03-11 Storage Target

`agenda_items` should contain:

| agenda_no | section_order | item_order | original_agenda_no | agenda_kind | visibility | document label | title |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 1 | ① | deliberation_decision | public | 가 | 공공 AX 혁신지원 위한 사전적정성 검토 결과에 관한 건 |
| 2 | 1 | 2 | ② | deliberation_decision | public | 나 | 디지털 포렌식 지원 및 증거 보관·관리 규정 제정안에 관한 건 |
| 3 | 1 | 3 | ③ | deliberation_decision | private | 다 | 개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2025조일0053-01) |
| 4 | 1 | 4 | ④ | deliberation_decision | public | 라 | 보건의료 분야 개인정보 전송에 관한 고시 일부개정안에 관한 건 |
| 5 | 2 | 1 | ① | report | private | 없음 | "사전예방적 개인정보 보호" 전환을 지원하는 과징금체계 개편방안 |

`meeting_document_sections` should contain the visible transcript/minutes structure:

- `회의개요`
- `회의내용`
- `성원보고`
- `국민의례`
- `개회선언`
- `2026년 제3회 회의록 및 속기록 보고`
- `안건현황 설명 및 회의 공개여부 결정`
- `심의․의결안건`
- `가. ...`
- `나. ...`
- `다. ...`
- `라. ...`
- `차기 회의 일정`
- `폐회`

`agenda_document_mentions` should connect:

- `가` heading to agenda 1 in both minutes and transcript when present.
- `나` heading to agenda 2 in both minutes and transcript when present.
- `다` heading to agenda 3 in both minutes and transcript when present.
- `라` heading to agenda 4 in both minutes and transcript when present.
- chair visibility statement `의결안건 3번과 보고안건 1번은 비공개` to agenda 3 and agenda 5.
- public announcement `공개 안건인 3건` to agenda 1, agenda 2, and agenda 4.

## Ingestion Rules

1. Crawl or import the official meeting page first.
2. Store each PDF and converted Markdown in `source_documents` and `meeting_files`.
3. Upsert official agenda rows into `agenda_items` before parsing utterances.
4. Parse minutes and transcript into `meeting_document_sections`.
5. Resolve document mentions to official agenda rows using this priority:
   - explicit `의결안건 n번` or `보고안건 n번`
   - title similarity against `agenda_items.title`
   - ordered `가`, `나`, `다`, `라` fallback within the current agenda group
6. Link utterances to `agenda_items` through section ranges.
7. Extract law citations from agenda titles, minutes summaries, and utterances into `law_citations`.
8. Build `agenda_speaker_summaries` only after utterance links pass validation.
9. Generate `document_chunks` last, including `meeting_id`, `agenda_item_id`, `section_id`, and `parse_run_id` in metadata.

## Validation Rules

- For every meeting, `meetings.agenda_count` must equal `count(agenda_items)`.
- `public_agenda_count + private_agenda_count` should equal `agenda_count` unless an agenda has `visibility = 'unknown'`.
- Every non-procedural transcript agenda section should resolve to one `agenda_items.id`.
- Private report agendas may have zero utterances.
- Every `utterances.agenda_item_id` must point to an agenda in the same meeting.
- A parse run should report counts for headings, agenda mentions, utterances, linked utterances, unresolved mentions, and law citations.

## Indexes And Constraints

Recommended after table creation:

```sql
create unique index ux_meeting_document_sections_document_order
  on public.meeting_document_sections(source_document_id, section_order);

create index idx_meeting_document_sections_meeting
  on public.meeting_document_sections(meeting_id, section_kind, section_order);

create index idx_meeting_document_sections_agenda
  on public.meeting_document_sections(agenda_item_id);

create index idx_agenda_document_mentions_agenda
  on public.agenda_document_mentions(agenda_item_id, mention_role);

create index idx_agenda_document_mentions_document
  on public.agenda_document_mentions(source_document_id, line_start);

create index idx_agenda_speaker_summaries_agenda
  on public.agenda_speaker_summaries(agenda_item_id);
```

## Security

All new public tables must have RLS enabled. During the build phase, no public policies are required; ingestion should run through privileged server-side tooling or Supabase MCP/API credentials. If the dashboard later reads these tables directly from a browser client, add read-only policies or expose security-invoker views designed for the dashboard.

## Open Decisions

- Whether to represent `agenda_kind` and `visibility` as text with checks or as Postgres enums.
- Whether `result` should become a normalized code column plus Korean display label.
- Whether `agenda_speaker_summaries` should be manually curated, model-generated, or both with separate provenance fields.
- Whether document chunks should reference `meeting_document_sections.id` by adding a nullable `section_id` column or only through `metadata`.

## Recommended Next Step

Create a migration draft that only adds the four new tables, indexes, update triggers, and RLS. Then update the parser/exporter so it emits:

- official `agenda_items` updates
- `document_parse_runs`
- `meeting_document_sections`
- `agenda_document_mentions`
- linked `utterances`
- `agenda_speaker_summaries`
