param(
  [string]$ProjectRef = "yfrjdbsaulawwqmuozao",
  [int]$ChunkSize = 100
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()

if (-not $env:SUPABASE_ACCESS_TOKEN) {
  throw "SUPABASE_ACCESS_TOKEN is not set in this process."
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $ScriptDir
$ApiBase = "https://api.supabase.com/v1/projects/$ProjectRef/database/query"
$Headers = @{
  Authorization = "Bearer $env:SUPABASE_ACCESS_TOKEN"
  "Content-Type" = "application/json"
}

function ConvertTo-SqlLiteral {
  param([AllowNull()][string]$Value)
  if ($null -eq $Value) { return "null" }
  return "'" + $Value.Replace("'", "''") + "'"
}

function ConvertTo-SqlJsonLiteral {
  param([object[]]$Rows)
  $json = ConvertTo-Json -InputObject @($Rows) -Depth 12 -Compress
  $tag = "seed_" + [guid]::NewGuid().ToString("N")
  return "$" + $tag + "$" + $json + "$" + $tag + "$"
}

function ConvertTo-JsonAsciiStringLiteral {
  param([string]$Value)
  $sb = New-Object System.Text.StringBuilder
  [void]$sb.Append('"')
  foreach ($ch in $Value.ToCharArray()) {
    $code = [int][char]$ch
    if ($code -eq 8) { [void]$sb.Append('\b') }
    elseif ($code -eq 9) { [void]$sb.Append('\t') }
    elseif ($code -eq 10) { [void]$sb.Append('\n') }
    elseif ($code -eq 12) { [void]$sb.Append('\f') }
    elseif ($code -eq 13) { [void]$sb.Append('\r') }
    elseif ($code -eq 34) { [void]$sb.Append('\"') }
    elseif ($code -eq 92) { [void]$sb.Append('\\') }
    elseif ($code -lt 32 -or $code -gt 126) {
      [void]$sb.Append('\u')
      [void]$sb.Append($code.ToString('x4'))
    }
    else {
      [void]$sb.Append($ch)
    }
  }
  [void]$sb.Append('"')
  return $sb.ToString()
}

function Invoke-SupabaseSql {
  param(
    [string]$Label,
    [string]$Sql
  )
  $body = '{"query":' + (ConvertTo-JsonAsciiStringLiteral $Sql) + '}'
  try {
    $result = Invoke-RestMethod -Method Post -Uri $ApiBase -Headers $Headers -Body $body
    $resultJson = $result | ConvertTo-Json -Depth 8 -Compress
    Write-Host "[$Label] $resultJson"
    return $result
  }
  catch {
    $debugPath = Join-Path $Root ".tmp_last_supabase_query.sql"
    Set-Content -Path $debugPath -Value $Sql -Encoding UTF8
    Write-Host "[$Label] failed; query written to $debugPath"
    throw
  }
}

function New-ImportBatch {
  $sourceRoot = ConvertTo-SqlLiteral $Root
  $sql = @"
insert into public.import_batches (batch_type, status, source_root, notes, metadata)
values (
  'pipc_metadata_seed',
  'running',
  $sourceRoot,
  'Seeded from local PIPC crawler CSV files',
  jsonb_build_object('script', 'scripts/seed_supabase_metadata.ps1')
)
returning id;
"@
  $result = Invoke-SupabaseSql -Label "batch.new" -Sql $sql
  if ($result -is [array]) { return $result[0].id }
  return $result.id
}

function Complete-ImportBatch {
  param([string]$BatchId)
  $batchSql = ConvertTo-SqlLiteral $BatchId
  $sql = @"
update public.import_batches
set status = 'completed',
    completed_at = now()
where id = $batchSql::uuid
returning id, status, completed_at;
"@
  Invoke-SupabaseSql -Label "batch.complete" -Sql $sql | Out-Null
}

function Read-CsvUtf8 {
  param([string]$RelativePath)
  $path = Join-Path $Root $RelativePath
  return @(Import-Csv -Path $path -Encoding UTF8)
}

function Split-IntoChunks {
  param(
    [object[]]$Rows,
    [int]$Size
  )
  for ($i = 0; $i -lt $Rows.Count; $i += $Size) {
    $end = [Math]::Min($i + $Size - 1, $Rows.Count - 1)
    Write-Output -NoEnumerate @($Rows[$i..$end])
  }
}

function Add-MeetingAttachmentDerivedFields {
  param([object[]]$Rows)
  $transcriptNeedle = ([char]0xC18D) + ([char]0xAE30) + ([char]0xB85D)
  $minutesNeedle = ([char]0xD68C) + ([char]0xC758) + ([char]0xB85D)
  foreach ($row in $Rows) {
    $name = [string]$row.attachment_name
    $ext = [System.IO.Path]::GetExtension($name).TrimStart(".").ToLowerInvariant()
    $kind = "meeting_attachment"
    if ($name.Contains($transcriptNeedle)) { $kind = "transcript" }
    elseif ($name.Contains($minutesNeedle)) { $kind = "minutes" }

    $row | Add-Member -NotePropertyName file_ext -NotePropertyValue $ext -Force
    $row | Add-Member -NotePropertyName file_kind -NotePropertyValue $kind -Force
    $row
  }
}

function Add-DecisionAttachmentDerivedFields {
  param([object[]]$Rows)
  foreach ($row in $Rows) {
    $ext = ([string]$row.file_extsn).ToLowerInvariant()
    if ([string]::IsNullOrWhiteSpace($ext)) {
      $ext = [System.IO.Path]::GetExtension([string]$row.attachment_name).TrimStart(".").ToLowerInvariant()
    }
    $row | Add-Member -NotePropertyName normalized_file_ext -NotePropertyValue $ext -Force
    $row
  }
}

function Seed-Meetings {
  param(
    [string]$BatchId,
    [object[]]$Rows
  )
  $batchSql = ConvertTo-SqlLiteral $BatchId
  $chunkNo = 0
  foreach ($chunk in Split-IntoChunks -Rows $Rows -Size 50) {
    $chunkNo += 1
    $jsonSql = ConvertTo-SqlJsonLiteral $chunk
    $sql = @"
with raw as (
  select *
  from jsonb_to_recordset($jsonSql::jsonb) as r(
    number text,
    idx_id text,
    title text,
    division text,
    meeting_date text,
    detail_url text,
    attachment_count text,
    content text
  )
),
inserted_sources as (
  insert into public.source_documents (
    import_batch_id, source_system, document_type, external_id, title,
    document_date, source_url, parse_status, metadata
  )
  select
    $batchSql::uuid,
    'pipc',
    'meeting_page',
    'meeting_page:' || r.idx_id,
    r.title,
    nullif(r.meeting_date, '')::date,
    r.detail_url,
    'metadata_only',
    jsonb_build_object(
      'crawler_row_number', nullif(r.number, '')::int,
      'division', r.division,
      'attachment_count', nullif(r.attachment_count, '')::int,
      'content', r.content
    )
  from raw r
  where not exists (
    select 1
    from public.source_documents d
    where d.source_system = 'pipc'
      and d.document_type = 'meeting_page'
      and d.external_id = 'meeting_page:' || r.idx_id
  )
  on conflict do nothing
  returning id, external_id
),
all_sources as (
  select id, external_id from inserted_sources
  union all
  select d.id, d.external_id
  from public.source_documents d
  join raw r on d.external_id = 'meeting_page:' || r.idx_id
  where d.source_system = 'pipc'
    and d.document_type = 'meeting_page'
),
upserted as (
  insert into public.meetings (
    pipc_idx_id, meeting_number, title, division, meeting_date,
    detail_url, source_document_id, metadata
  )
  select
    r.idx_id,
    nullif(r.number, '')::int,
    r.title,
    coalesce(nullif(r.division, ''), U&'\BCF4\D638\C704\C6D0\D68C'),
    nullif(r.meeting_date, '')::date,
    r.detail_url,
    s.id,
    jsonb_build_object(
      'crawler_attachment_count', nullif(r.attachment_count, '')::int,
      'crawler_content', r.content
    )
  from raw r
  left join all_sources s on s.external_id = 'meeting_page:' || r.idx_id
  on conflict (pipc_idx_id) do update
  set meeting_number = excluded.meeting_number,
      title = excluded.title,
      division = excluded.division,
      meeting_date = excluded.meeting_date,
      detail_url = excluded.detail_url,
      source_document_id = excluded.source_document_id,
      metadata = public.meetings.metadata || excluded.metadata,
      updated_at = now()
  returning id
)
select
  (select count(*) from raw) as raw_rows,
  (select count(*) from inserted_sources) as source_documents_inserted,
  (select count(*) from upserted) as meetings_upserted;
"@
    Invoke-SupabaseSql -Label "meetings.$chunkNo" -Sql $sql | Out-Null
  }
}

function Seed-MeetingFiles {
  param(
    [string]$BatchId,
    [object[]]$Rows
  )
  $batchSql = ConvertTo-SqlLiteral $BatchId
  $prepared = @(Add-MeetingAttachmentDerivedFields -Rows $Rows)
  $chunkNo = 0
  foreach ($chunk in Split-IntoChunks -Rows $prepared -Size $ChunkSize) {
    $chunkNo += 1
    $jsonSql = ConvertTo-SqlJsonLiteral $chunk
    $sql = @"
with raw as (
  select *
  from jsonb_to_recordset($jsonSql::jsonb) as r(
    meeting_number text,
    idx_id text,
    meeting_title text,
    meeting_date text,
    attachment_name text,
    atch_file_id text,
    file_sn text,
    download_url text,
    saved_path text,
    size_bytes text,
    status text,
    error text,
    file_ext text,
    file_kind text
  )
),
inserted_sources as (
  insert into public.source_documents (
    import_batch_id, source_system, document_type, external_id, title,
    document_date, download_url, local_path, file_name, file_ext,
    size_bytes, parse_status, metadata
  )
  select
    $batchSql::uuid,
    'pipc',
    case r.file_kind
      when 'minutes' then 'meeting_minutes_file'
      when 'transcript' then 'meeting_transcript_file'
      else 'meeting_attachment_file'
    end,
    'meeting_file:' || r.atch_file_id || ':' || r.file_sn,
    r.attachment_name,
    nullif(r.meeting_date, '')::date,
    r.download_url,
    r.saved_path,
    r.attachment_name,
    nullif(r.file_ext, ''),
    nullif(r.size_bytes, '')::bigint,
    'pending',
    jsonb_build_object(
      'meeting_idx_id', r.idx_id,
      'meeting_title', r.meeting_title,
      'crawler_status', r.status,
      'crawler_error', nullif(r.error, '')
    )
  from raw r
  where not exists (
    select 1
    from public.source_documents d
    where d.source_system = 'pipc'
      and d.external_id = 'meeting_file:' || r.atch_file_id || ':' || r.file_sn
  )
  on conflict do nothing
  returning id, external_id
),
all_sources as (
  select id, external_id from inserted_sources
  union all
  select d.id, d.external_id
  from public.source_documents d
  join raw r on d.external_id = 'meeting_file:' || r.atch_file_id || ':' || r.file_sn
  where d.source_system = 'pipc'
),
inserted_files as (
  insert into public.meeting_files (
    meeting_id, source_document_id, file_kind, attachment_name,
    atch_file_id, file_sn, download_url, local_path, status, metadata
  )
  select
    m.id,
    s.id,
    r.file_kind,
    r.attachment_name,
    r.atch_file_id,
    nullif(r.file_sn, '')::int,
    r.download_url,
    r.saved_path,
    r.status,
    jsonb_build_object(
      'size_bytes', nullif(r.size_bytes, '')::bigint,
      'file_ext', nullif(r.file_ext, ''),
      'crawler_error', nullif(r.error, '')
    )
  from raw r
  join public.meetings m on m.pipc_idx_id = r.idx_id
  left join all_sources s on s.external_id = 'meeting_file:' || r.atch_file_id || ':' || r.file_sn
  where not exists (
    select 1
    from public.meeting_files mf
    where mf.meeting_id = m.id
      and mf.atch_file_id = r.atch_file_id
      and mf.file_sn is not distinct from nullif(r.file_sn, '')::int
  )
  on conflict do nothing
  returning id
),
updated_minutes as (
  update public.meetings m
  set minutes_document_id = mf.source_document_id,
      updated_at = now()
  from public.meeting_files mf
  where mf.meeting_id = m.id
    and mf.file_kind = 'minutes'
    and mf.source_document_id is not null
  returning m.id
),
updated_transcripts as (
  update public.meetings m
  set transcript_document_id = mf.source_document_id,
      updated_at = now()
  from public.meeting_files mf
  where mf.meeting_id = m.id
    and mf.file_kind = 'transcript'
    and mf.source_document_id is not null
  returning m.id
)
select
  (select count(*) from raw) as raw_rows,
  (select count(*) from inserted_sources) as source_documents_inserted,
  (select count(*) from inserted_files) as meeting_files_inserted,
  (select count(*) from updated_minutes) as meetings_minutes_linked,
  (select count(*) from updated_transcripts) as meetings_transcripts_linked;
"@
    Invoke-SupabaseSql -Label "meeting_files.$chunkNo" -Sql $sql | Out-Null
  }
}

function Refresh-MeetingDocumentLinks {
  $sql = @"
with minutes_pick as (
  select distinct on (meeting_id)
    meeting_id,
    source_document_id
  from public.meeting_files
  where file_kind = 'minutes'
    and source_document_id is not null
  order by meeting_id, file_sn nulls last, created_at
),
transcript_pick as (
  select distinct on (meeting_id)
    meeting_id,
    source_document_id
  from public.meeting_files
  where file_kind = 'transcript'
    and source_document_id is not null
  order by meeting_id, file_sn nulls last, created_at
),
targets as (
  select meeting_id from minutes_pick
  union
  select meeting_id from transcript_pick
),
updated as (
  update public.meetings m
  set minutes_document_id = coalesce(mp.source_document_id, m.minutes_document_id),
      transcript_document_id = coalesce(tp.source_document_id, m.transcript_document_id),
      updated_at = now()
  from targets t
  left join minutes_pick mp on mp.meeting_id = t.meeting_id
  left join transcript_pick tp on tp.meeting_id = t.meeting_id
  where m.id = t.meeting_id
  returning m.id
)
select
  (select count(*) from updated) as meetings_touched,
  (select count(*) from public.meetings where minutes_document_id is not null) as meetings_with_minutes_doc,
  (select count(*) from public.meetings where transcript_document_id is not null) as meetings_with_transcript_doc;
"@
  Invoke-SupabaseSql -Label "meeting_links.refresh" -Sql $sql | Out-Null
}

function Seed-DecisionPosts {
  param(
    [string]$BatchId,
    [object[]]$Rows
  )
  $batchSql = ConvertTo-SqlLiteral $BatchId
  $chunkNo = 0
  foreach ($chunk in Split-IntoChunks -Rows $Rows -Size 50) {
    $chunkNo += 1
    $jsonSql = ConvertTo-SqlJsonLiteral $chunk
    $sql = @"
with raw as (
  select *
  from jsonb_to_recordset($jsonSql::jsonb) as r(
    number text,
    idx_id text,
    committee text,
    title text,
    bill_number text,
    decision_date text,
    created_date text,
    detail_url text,
    preview_ids text,
    view_count text,
    attachment_count text,
    request_content text,
    decision_content text
  )
),
inserted_sources as (
  insert into public.source_documents (
    import_batch_id, source_system, document_type, external_id, title,
    document_date, published_date, source_url, parse_status, metadata
  )
  select
    $batchSql::uuid,
    'pipc',
    'decision_post_page',
    'decision_post:' || r.idx_id,
    r.title,
    nullif(r.decision_date, '')::date,
    nullif(r.created_date, '')::date,
    r.detail_url,
    'metadata_only',
    jsonb_build_object(
      'committee', r.committee,
      'bill_number', r.bill_number,
      'preview_ids', r.preview_ids,
      'view_count', nullif(r.view_count, '')::int,
      'attachment_count', nullif(r.attachment_count, '')::int,
      'request_content', r.request_content,
      'decision_content', r.decision_content
    )
  from raw r
  where not exists (
    select 1
    from public.source_documents d
    where d.source_system = 'pipc'
      and d.document_type = 'decision_post_page'
      and d.external_id = 'decision_post:' || r.idx_id
  )
  on conflict do nothing
  returning id, external_id
),
all_sources as (
  select id, external_id from inserted_sources
  union all
  select d.id, d.external_id
  from public.source_documents d
  join raw r on d.external_id = 'decision_post:' || r.idx_id
  where d.source_system = 'pipc'
    and d.document_type = 'decision_post_page'
),
upserted as (
  insert into public.decision_posts (
    pipc_idx_id, decision_number, committee_type, title,
    decision_date, created_date, bill_number_text, detail_url,
    content_summary, source_document_id, metadata
  )
  select
    r.idx_id,
    nullif(r.number, '')::int,
    coalesce(nullif(r.committee, ''), U&'\C704\C6D0\D68C'),
    r.title,
    nullif(r.decision_date, '')::date,
    nullif(r.created_date, '')::date,
    r.bill_number,
    r.detail_url,
    nullif(r.decision_content, ''),
    s.id,
    jsonb_build_object(
      'preview_ids', r.preview_ids,
      'view_count', nullif(r.view_count, '')::int,
      'attachment_count', nullif(r.attachment_count, '')::int,
      'request_content', r.request_content
    )
  from raw r
  left join all_sources s on s.external_id = 'decision_post:' || r.idx_id
  on conflict (pipc_idx_id) do update
  set decision_number = excluded.decision_number,
      committee_type = excluded.committee_type,
      title = excluded.title,
      decision_date = excluded.decision_date,
      created_date = excluded.created_date,
      bill_number_text = excluded.bill_number_text,
      detail_url = excluded.detail_url,
      content_summary = excluded.content_summary,
      source_document_id = excluded.source_document_id,
      metadata = public.decision_posts.metadata || excluded.metadata,
      updated_at = now()
  returning id
)
select
  (select count(*) from raw) as raw_rows,
  (select count(*) from inserted_sources) as source_documents_inserted,
  (select count(*) from upserted) as decision_posts_upserted;
"@
    Invoke-SupabaseSql -Label "decision_posts.$chunkNo" -Sql $sql | Out-Null
  }
}

function Seed-DecisionFiles {
  param(
    [string]$BatchId,
    [object[]]$Rows
  )
  $batchSql = ConvertTo-SqlLiteral $BatchId
  $prepared = @(Add-DecisionAttachmentDerivedFields -Rows $Rows)
  $chunkNo = 0
  foreach ($chunk in Split-IntoChunks -Rows $prepared -Size $ChunkSize) {
    $chunkNo += 1
    $jsonSql = ConvertTo-SqlJsonLiteral $chunk
    $sql = @"
with raw as (
  select *
  from jsonb_to_recordset($jsonSql::jsonb) as r(
    decision_number text,
    idx_id text,
    decision_title text,
    decision_date text,
    bill_number text,
    attachment_name text,
    atch_file_id text,
    file_sn text,
    file_extsn text,
    cnv_cnt text,
    download_url text,
    saved_path text,
    size_bytes text,
    status text,
    error text,
    normalized_file_ext text
  )
),
inserted_sources as (
  insert into public.source_documents (
    import_batch_id, source_system, document_type, external_id, title,
    document_date, download_url, local_path, file_name, file_ext,
    size_bytes, parse_status, metadata
  )
  select
    $batchSql::uuid,
    'pipc',
    case nullif(r.normalized_file_ext, '')
      when 'pdf' then 'decision_pdf'
      when 'hwp' then 'decision_hwp'
      else 'decision_attachment'
    end,
    'decision_file:' || r.atch_file_id || ':' || r.file_sn || ':' || coalesce(nullif(r.normalized_file_ext, ''), 'unknown') || ':' || coalesce(nullif(r.cnv_cnt, ''), '0'),
    r.attachment_name,
    nullif(r.decision_date, '')::date,
    r.download_url,
    r.saved_path,
    r.attachment_name,
    nullif(r.normalized_file_ext, ''),
    nullif(r.size_bytes, '')::bigint,
    'pending',
    jsonb_build_object(
      'decision_idx_id', r.idx_id,
      'decision_title', r.decision_title,
      'bill_number', r.bill_number,
      'crawler_status', r.status,
      'crawler_error', nullif(r.error, '')
    )
  from raw r
  where not exists (
    select 1
    from public.source_documents d
    where d.source_system = 'pipc'
      and d.external_id = 'decision_file:' || r.atch_file_id || ':' || r.file_sn || ':' || coalesce(nullif(r.normalized_file_ext, ''), 'unknown') || ':' || coalesce(nullif(r.cnv_cnt, ''), '0')
  )
  on conflict do nothing
  returning id, external_id
),
all_sources as (
  select id, external_id from inserted_sources
  union all
  select d.id, d.external_id
  from public.source_documents d
  join raw r on d.external_id = 'decision_file:' || r.atch_file_id || ':' || r.file_sn || ':' || coalesce(nullif(r.normalized_file_ext, ''), 'unknown') || ':' || coalesce(nullif(r.cnv_cnt, ''), '0')
  where d.source_system = 'pipc'
),
inserted_files as (
  insert into public.decision_files (
    decision_post_id, source_document_id, file_kind, attachment_name,
    atch_file_id, file_sn, file_ext, cnv_cnt, download_url,
    local_path, status, error, metadata
  )
  select
    p.id,
    s.id,
    'decision_attachment',
    r.attachment_name,
    r.atch_file_id,
    nullif(r.file_sn, '')::int,
    nullif(r.normalized_file_ext, ''),
    nullif(r.cnv_cnt, '')::int,
    r.download_url,
    r.saved_path,
    r.status,
    nullif(r.error, ''),
    jsonb_build_object(
      'size_bytes', nullif(r.size_bytes, '')::bigint,
      'bill_number', r.bill_number
    )
  from raw r
  join public.decision_posts p on p.pipc_idx_id = r.idx_id
  left join all_sources s on s.external_id = 'decision_file:' || r.atch_file_id || ':' || r.file_sn || ':' || coalesce(nullif(r.normalized_file_ext, ''), 'unknown') || ':' || coalesce(nullif(r.cnv_cnt, ''), '0')
  where not exists (
    select 1
    from public.decision_files df
    where df.decision_post_id = p.id
      and df.atch_file_id = r.atch_file_id
      and df.file_sn is not distinct from nullif(r.file_sn, '')::int
      and df.file_ext is not distinct from nullif(r.normalized_file_ext, '')
      and df.cnv_cnt is not distinct from nullif(r.cnv_cnt, '')::int
  )
  on conflict do nothing
  returning id
)
select
  (select count(*) from raw) as raw_rows,
  (select count(*) from inserted_sources) as source_documents_inserted,
  (select count(*) from inserted_files) as decision_files_inserted;
"@
    Invoke-SupabaseSql -Label "decision_files.$chunkNo" -Sql $sql | Out-Null
  }
}

$batchId = New-ImportBatch
try {
  $meetings = Read-CsvUtf8 "pipc_minutes_crawler/data/meetings.csv"
  $meetingFiles = Read-CsvUtf8 "pipc_minutes_crawler/data/attachments.csv"
  $decisionPosts = Read-CsvUtf8 "pipc_committee_decisions_crawler/data/decisions.csv"
  $decisionFiles = Read-CsvUtf8 "pipc_committee_decisions_crawler/data/attachments.csv"

  Write-Host "Loaded local CSV rows: meetings=$($meetings.Count), meetingFiles=$($meetingFiles.Count), decisionPosts=$($decisionPosts.Count), decisionFiles=$($decisionFiles.Count)"

  Seed-Meetings -BatchId $batchId -Rows $meetings
  Seed-MeetingFiles -BatchId $batchId -Rows $meetingFiles
  Refresh-MeetingDocumentLinks
  Seed-DecisionPosts -BatchId $batchId -Rows $decisionPosts
  Seed-DecisionFiles -BatchId $batchId -Rows $decisionFiles

  Complete-ImportBatch -BatchId $batchId
}
catch {
  $batchSql = ConvertTo-SqlLiteral $batchId
  $messageSql = ConvertTo-SqlLiteral $_.Exception.Message
  $failSql = @"
update public.import_batches
set status = 'failed',
    completed_at = now(),
    metadata = metadata || jsonb_build_object('error', $messageSql)
where id = $batchSql::uuid;
"@
  Invoke-SupabaseSql -Label "batch.failed" -Sql $failSql | Out-Null
  throw
}
