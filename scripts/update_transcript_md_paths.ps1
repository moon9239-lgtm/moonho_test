param(
  [string]$ProjectRef = "yfrjdbsaulawwqmuozao"
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()

if (-not $env:SUPABASE_ACCESS_TOKEN) {
  throw "SUPABASE_ACCESS_TOKEN is not set in this process."
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $ScriptDir
$ManifestPath = Join-Path $Root "pipc_knowledge_base/99_raw/transcripts/_manifest.csv"
$ApiUrl = "https://api.supabase.com/v1/projects/$ProjectRef/database/query"
$Headers = @{
  Authorization = "Bearer $env:SUPABASE_ACCESS_TOKEN"
  "Content-Type" = "application/json"
}

function ConvertTo-SqlJsonLiteral {
  param([object[]]$Rows)
  $json = ConvertTo-Json -InputObject @($Rows) -Depth 8 -Compress
  $tag = "mdpaths_" + [guid]::NewGuid().ToString("N")
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
  param([string]$Sql)
  $body = '{"query":' + (ConvertTo-JsonAsciiStringLiteral $Sql) + '}'
  return Invoke-RestMethod -Method Post -Uri $ApiUrl -Headers $Headers -Body $body
}

$rows = @(Import-Csv -Path $ManifestPath -Encoding UTF8)
$jsonSql = ConvertTo-SqlJsonLiteral $rows

$sql = @"
with raw as (
  select *
  from jsonb_to_recordset($jsonSql::jsonb) as r(
    external_id text,
    meeting_idx_id text,
    meeting_date text,
    attachment_name text,
    input_path text,
    raw_md_path text,
    status text,
    error text
  )
),
updated_sources as (
  update public.source_documents d
  set raw_md_path = case when r.status = 'converted' then r.raw_md_path else d.raw_md_path end,
      parse_status = case when r.status = 'converted' then 'converted' else 'failed' end,
      metadata = d.metadata || jsonb_build_object(
        'transcript_md_status', r.status,
        'transcript_md_error', nullif(r.error, '')
      ),
      updated_at = now()
  from raw r
  where d.source_system = 'pipc'
    and d.external_id = r.external_id
  returning d.id, d.external_id, d.parse_status
),
updated_files as (
  update public.meeting_files mf
  set raw_md_path = case when r.status = 'converted' then r.raw_md_path else mf.raw_md_path end,
      metadata = mf.metadata || jsonb_build_object(
        'transcript_md_status', r.status,
        'transcript_md_error', nullif(r.error, '')
      )
  from raw r
  where ('meeting_file:' || mf.atch_file_id || ':' || mf.file_sn::text) = r.external_id
  returning mf.id
)
select
  (select count(*) from raw) as manifest_rows,
  (select count(*) from raw where status = 'converted') as manifest_converted,
  (select count(*) from raw where status = 'failed') as manifest_failed,
  (select count(*) from updated_sources) as source_documents_touched,
  (select count(*) from updated_sources where parse_status = 'converted') as source_documents_converted,
  (select count(*) from updated_sources where parse_status = 'failed') as source_documents_failed,
  (select count(*) from updated_files) as meeting_files_touched;
"@

$result = Invoke-SupabaseSql -Sql $sql
$result | ConvertTo-Json -Depth 8 -Compress
