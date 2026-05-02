param(
  [string]$ProjectRef = "yfrjdbsaulawwqmuozao",
  [int]$ChunkSize = 200
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()

if (-not $env:SUPABASE_ACCESS_TOKEN) {
  throw "SUPABASE_ACCESS_TOKEN is not set in this process."
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $ScriptDir
$ManifestPath = Join-Path $Root "pipc_knowledge_base/99_raw/decisions/_manifest.csv"
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
  $json = ConvertTo-Json -InputObject @($Rows) -Depth 8 -Compress
  $tag = "decisionmd_" + [guid]::NewGuid().ToString("N")
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

$rows = @(Import-Csv -Path $ManifestPath -Encoding UTF8)
$chunkNo = 0
foreach ($chunk in Split-IntoChunks -Rows $rows -Size $ChunkSize) {
  $chunkNo += 1
  $jsonSql = ConvertTo-SqlJsonLiteral $chunk
  $sql = @"
with raw as (
  select *
  from jsonb_to_recordset($jsonSql::jsonb) as r(
    external_id text,
    decision_idx_id text,
    decision_date text,
    bill_number text,
    attachment_name text,
    file_ext text,
    input_path text,
    raw_md_path text,
    status text,
    error text
  )
),
updated_sources as (
  update public.source_documents d
  set raw_md_path = case when r.status in ('converted', 'skipped') then nullif(r.raw_md_path, '') else d.raw_md_path end,
      parse_status = case
        when r.status in ('converted', 'skipped') then 'converted'
        when r.status = 'source_failed' then 'source_failed'
        when r.status = 'missing_local' then 'missing_local'
        else 'failed'
      end,
      metadata = d.metadata || jsonb_build_object(
        'decision_md_status', r.status,
        'decision_md_error', nullif(r.error, ''),
        'decision_md_manifest_path', nullif(r.raw_md_path, '')
      ),
      updated_at = now()
  from raw r
  where d.source_system = 'pipc'
    and d.external_id = r.external_id
  returning d.id, d.parse_status
),
updated_files as (
  update public.decision_files df
  set raw_md_path = case when r.status in ('converted', 'skipped') then nullif(r.raw_md_path, '') else df.raw_md_path end,
      error = coalesce(nullif(r.error, ''), df.error),
      metadata = df.metadata || jsonb_build_object(
        'decision_md_status', r.status,
        'decision_md_error', nullif(r.error, ''),
        'decision_md_manifest_path', nullif(r.raw_md_path, '')
      )
  from raw r
  join public.source_documents d on d.source_system = 'pipc' and d.external_id = r.external_id
  where df.source_document_id = d.id
  returning df.id
)
select
  (select count(*) from raw) as manifest_rows,
  (select count(*) from updated_sources) as source_documents_touched,
  (select count(*) from updated_sources where parse_status = 'converted') as source_documents_converted,
  (select count(*) from updated_sources where parse_status = 'source_failed') as source_documents_source_failed,
  (select count(*) from updated_files) as decision_files_touched;
"@
  Invoke-SupabaseSql -Label "decision_md.$chunkNo" -Sql $sql
}
