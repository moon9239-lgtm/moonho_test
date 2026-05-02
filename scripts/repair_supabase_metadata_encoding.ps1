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
$ApiUrl = "https://api.supabase.com/v1/projects/$ProjectRef/database/query"
$Headers = @{
  Authorization = "Bearer $env:SUPABASE_ACCESS_TOKEN"
  "Content-Type" = "application/json"
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

function ConvertTo-SqlJsonLiteral {
  param([object[]]$Rows)
  $json = ConvertTo-Json -InputObject @($Rows) -Depth 12 -Compress
  $tag = "repair_" + [guid]::NewGuid().ToString("N")
  return "$" + $tag + "$" + $json + "$" + $tag + "$"
}

function Invoke-SupabaseSql {
  param(
    [string]$Label,
    [string]$Sql
  )
  $body = '{"query":' + (ConvertTo-JsonAsciiStringLiteral $Sql) + '}'
  $result = Invoke-RestMethod -Method Post -Uri $ApiUrl -Headers $Headers -Body $body
  Write-Host "[$Label] $(($result | ConvertTo-Json -Depth 6 -Compress))"
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

function Read-CsvUtf8 {
  param([string]$RelativePath)
  return @(Import-Csv -Path (Join-Path $Root $RelativePath) -Encoding UTF8)
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

function Repair-Meetings {
  param([object[]]$Rows)
  $n = 0
  foreach ($chunk in Split-IntoChunks -Rows $Rows -Size 50) {
    $n += 1
    $jsonSql = ConvertTo-SqlJsonLiteral $chunk
    $sql = @"
with raw as (
  select *
  from jsonb_to_recordset($jsonSql::jsonb) as r(
    number text, idx_id text, title text, division text, meeting_date text,
    detail_url text, attachment_count text, content text
  )
),
updated_meetings as (
  update public.meetings m
  set meeting_number = nullif(r.number, '')::int,
      title = r.title,
      division = r.division,
      meeting_date = nullif(r.meeting_date, '')::date,
      detail_url = r.detail_url,
      metadata = m.metadata || jsonb_build_object(
        'crawler_attachment_count', nullif(r.attachment_count, '')::int,
        'crawler_content', r.content
      ),
      updated_at = now()
  from raw r
  where m.pipc_idx_id = r.idx_id
  returning m.id
),
updated_sources as (
  update public.source_documents d
  set title = r.title,
      document_date = nullif(r.meeting_date, '')::date,
      source_url = r.detail_url,
      metadata = d.metadata || jsonb_build_object(
        'crawler_row_number', nullif(r.number, '')::int,
        'division', r.division,
        'attachment_count', nullif(r.attachment_count, '')::int,
        'content', r.content
      ),
      updated_at = now()
  from raw r
  where d.source_system = 'pipc'
    and d.document_type = 'meeting_page'
    and d.external_id = 'meeting_page:' || r.idx_id
  returning d.id
)
select (select count(*) from updated_meetings) as meetings_updated,
       (select count(*) from updated_sources) as sources_updated;
"@
    Invoke-SupabaseSql -Label "meetings.$n" -Sql $sql
  }
}

function Repair-MeetingFiles {
  param([object[]]$Rows)
  $prepared = @(Add-MeetingAttachmentDerivedFields -Rows $Rows)
  $n = 0
  foreach ($chunk in Split-IntoChunks -Rows $prepared -Size $ChunkSize) {
    $n += 1
    $jsonSql = ConvertTo-SqlJsonLiteral $chunk
    $sql = @"
with raw as (
  select *
  from jsonb_to_recordset($jsonSql::jsonb) as r(
    meeting_number text, idx_id text, meeting_title text, meeting_date text,
    attachment_name text, atch_file_id text, file_sn text, download_url text,
    saved_path text, size_bytes text, status text, error text, file_ext text, file_kind text
  )
),
updated_files as (
  update public.meeting_files mf
  set file_kind = r.file_kind,
      attachment_name = r.attachment_name,
      download_url = r.download_url,
      local_path = r.saved_path,
      status = r.status,
      metadata = mf.metadata || jsonb_build_object(
        'size_bytes', nullif(r.size_bytes, '')::bigint,
        'file_ext', nullif(r.file_ext, ''),
        'crawler_error', nullif(r.error, '')
      )
  from raw r
  join public.meetings m on m.pipc_idx_id = r.idx_id
  where mf.meeting_id = m.id
    and mf.atch_file_id = r.atch_file_id
    and mf.file_sn is not distinct from nullif(r.file_sn, '')::int
  returning mf.id
),
updated_sources as (
  update public.source_documents d
  set title = r.attachment_name,
      document_date = nullif(r.meeting_date, '')::date,
      download_url = r.download_url,
      local_path = r.saved_path,
      file_name = r.attachment_name,
      file_ext = nullif(r.file_ext, ''),
      size_bytes = nullif(r.size_bytes, '')::bigint,
      metadata = d.metadata || jsonb_build_object(
        'meeting_idx_id', r.idx_id,
        'meeting_title', r.meeting_title,
        'crawler_status', r.status,
        'crawler_error', nullif(r.error, '')
      ),
      updated_at = now()
  from raw r
  where d.source_system = 'pipc'
    and d.external_id = 'meeting_file:' || r.atch_file_id || ':' || r.file_sn
  returning d.id
)
select (select count(*) from updated_files) as files_updated,
       (select count(*) from updated_sources) as sources_updated;
"@
    Invoke-SupabaseSql -Label "meeting_files.$n" -Sql $sql
  }
}

function Repair-DecisionPosts {
  param([object[]]$Rows)
  $n = 0
  foreach ($chunk in Split-IntoChunks -Rows $Rows -Size 50) {
    $n += 1
    $jsonSql = ConvertTo-SqlJsonLiteral $chunk
    $sql = @"
with raw as (
  select *
  from jsonb_to_recordset($jsonSql::jsonb) as r(
    number text, idx_id text, committee text, title text, bill_number text,
    decision_date text, created_date text, detail_url text, preview_ids text,
    view_count text, attachment_count text, request_content text, decision_content text
  )
),
updated_posts as (
  update public.decision_posts p
  set decision_number = nullif(r.number, '')::int,
      committee_type = r.committee,
      title = r.title,
      decision_date = nullif(r.decision_date, '')::date,
      created_date = nullif(r.created_date, '')::date,
      bill_number_text = r.bill_number,
      detail_url = r.detail_url,
      content_summary = nullif(r.decision_content, ''),
      metadata = p.metadata || jsonb_build_object(
        'preview_ids', r.preview_ids,
        'view_count', nullif(r.view_count, '')::int,
        'attachment_count', nullif(r.attachment_count, '')::int,
        'request_content', r.request_content
      ),
      updated_at = now()
  from raw r
  where p.pipc_idx_id = r.idx_id
  returning p.id
),
updated_sources as (
  update public.source_documents d
  set title = r.title,
      document_date = nullif(r.decision_date, '')::date,
      published_date = nullif(r.created_date, '')::date,
      source_url = r.detail_url,
      metadata = d.metadata || jsonb_build_object(
        'committee', r.committee,
        'bill_number', r.bill_number,
        'preview_ids', r.preview_ids,
        'view_count', nullif(r.view_count, '')::int,
        'attachment_count', nullif(r.attachment_count, '')::int,
        'request_content', r.request_content,
        'decision_content', r.decision_content
      ),
      updated_at = now()
  from raw r
  where d.source_system = 'pipc'
    and d.document_type = 'decision_post_page'
    and d.external_id = 'decision_post:' || r.idx_id
  returning d.id
)
select (select count(*) from updated_posts) as posts_updated,
       (select count(*) from updated_sources) as sources_updated;
"@
    Invoke-SupabaseSql -Label "decision_posts.$n" -Sql $sql
  }
}

function Repair-DecisionFiles {
  param([object[]]$Rows)
  $prepared = @(Add-DecisionAttachmentDerivedFields -Rows $Rows)
  $n = 0
  foreach ($chunk in Split-IntoChunks -Rows $prepared -Size $ChunkSize) {
    $n += 1
    $jsonSql = ConvertTo-SqlJsonLiteral $chunk
    $sql = @"
with raw as (
  select *
  from jsonb_to_recordset($jsonSql::jsonb) as r(
    decision_number text, idx_id text, decision_title text, decision_date text,
    bill_number text, attachment_name text, atch_file_id text, file_sn text,
    file_extsn text, cnv_cnt text, download_url text, saved_path text,
    size_bytes text, status text, error text, normalized_file_ext text
  )
),
deduped as (
  select distinct on (idx_id, atch_file_id, file_sn, normalized_file_ext, cnv_cnt)
    *
  from raw
  order by idx_id, atch_file_id, file_sn, normalized_file_ext, cnv_cnt
),
updated_files as (
  update public.decision_files df
  set attachment_name = r.attachment_name,
      file_ext = nullif(r.normalized_file_ext, ''),
      download_url = r.download_url,
      local_path = r.saved_path,
      status = r.status,
      error = nullif(r.error, ''),
      metadata = df.metadata || jsonb_build_object(
        'size_bytes', nullif(r.size_bytes, '')::bigint,
        'bill_number', r.bill_number
      )
  from deduped r
  join public.decision_posts p on p.pipc_idx_id = r.idx_id
  where df.decision_post_id = p.id
    and df.atch_file_id = r.atch_file_id
    and df.file_sn is not distinct from nullif(r.file_sn, '')::int
    and df.file_ext is not distinct from nullif(r.normalized_file_ext, '')
    and df.cnv_cnt is not distinct from nullif(r.cnv_cnt, '')::int
  returning df.id
),
updated_sources as (
  update public.source_documents d
  set title = r.attachment_name,
      document_date = nullif(r.decision_date, '')::date,
      download_url = r.download_url,
      local_path = r.saved_path,
      file_name = r.attachment_name,
      file_ext = nullif(r.normalized_file_ext, ''),
      size_bytes = nullif(r.size_bytes, '')::bigint,
      metadata = d.metadata || jsonb_build_object(
        'decision_idx_id', r.idx_id,
        'decision_title', r.decision_title,
        'bill_number', r.bill_number,
        'crawler_status', r.status,
        'crawler_error', nullif(r.error, '')
      ),
      updated_at = now()
  from deduped r
  where d.source_system = 'pipc'
    and d.external_id = 'decision_file:' || r.atch_file_id || ':' || r.file_sn || ':' || coalesce(nullif(r.normalized_file_ext, ''), 'unknown') || ':' || coalesce(nullif(r.cnv_cnt, ''), '0')
  returning d.id
)
select (select count(*) from updated_files) as files_updated,
       (select count(*) from updated_sources) as sources_updated;
"@
    Invoke-SupabaseSql -Label "decision_files.$n" -Sql $sql
  }
}

$meetings = Read-CsvUtf8 "pipc_minutes_crawler/data/meetings.csv"
$meetingFiles = Read-CsvUtf8 "pipc_minutes_crawler/data/attachments.csv"
$decisionPosts = Read-CsvUtf8 "pipc_committee_decisions_crawler/data/decisions.csv"
$decisionFiles = Read-CsvUtf8 "pipc_committee_decisions_crawler/data/attachments.csv"

Repair-Meetings -Rows $meetings
Repair-MeetingFiles -Rows $meetingFiles
Repair-DecisionPosts -Rows $decisionPosts
Repair-DecisionFiles -Rows $decisionFiles
