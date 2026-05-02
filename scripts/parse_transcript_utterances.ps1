param(
  [switch]$UpdateSupabase,
  [string]$ProjectRef = "yfrjdbsaulawwqmuozao",
  [int]$ChunkSize = 200
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $ScriptDir
$ManifestPath = Join-Path $Root "pipc_knowledge_base/99_raw/transcripts/_manifest.csv"
$OutDir = Join-Path $Root "pipc_knowledge_base/90_normalized_data"
$OutCsv = Join-Path $OutDir "utterances.csv"

New-Item -ItemType Directory -Path $OutDir -Force | Out-Null

function Get-SpeakerParts {
  param([string]$Label)
  $clean = ($Label -replace "\s+", " ").Trim()
  $name = $clean
  $role = ""
  $match = [regex]::Match($clean, "^(?<role>.+?)\s+(?<name>[\p{IsHangulSyllables}]{2,4})$")
  if ($match.Success) {
    $role = $match.Groups["role"].Value.Trim()
    $name = $match.Groups["name"].Value.Trim()
  }
  return [pscustomobject]@{
    role = $role
    name = $name
    label = $clean
  }
}

function Normalize-Text {
  param([string]$Text)
  return (($Text -replace "\s+", " ").Trim())
}

function Flush-Utterance {
  param(
    [System.Collections.Generic.List[object]]$Target,
    [string]$ExternalId,
    [string]$MeetingIdxId,
    [string]$MeetingDate,
    [int]$Order,
    [string]$SpeakerLabel,
    [string]$SpeakerRole,
    [string]$SpeakerName,
    [string]$SectionHeading,
    [System.Collections.Generic.List[string]]$Buffer
  )
  if ($Buffer.Count -eq 0) { return }
  $raw = ($Buffer -join "`n").Trim()
  if ([string]::IsNullOrWhiteSpace($raw)) { return }
  $Target.Add([pscustomobject]@{
    external_id = $ExternalId
    meeting_idx_id = $MeetingIdxId
    utterance_date = $MeetingDate
    utterance_order = $Order
    speaker_label = $SpeakerLabel
    speaker_role = $SpeakerRole
    speaker_name = $SpeakerName
    section_heading = $SectionHeading
    raw_text = $raw
    normalized_text = Normalize-Text $raw
  }) | Out-Null
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

function ConvertTo-SqlJsonLiteral {
  param([object[]]$Rows)
  $json = ConvertTo-Json -InputObject @($Rows) -Depth 12 -Compress
  $tag = "utter_" + [guid]::NewGuid().ToString("N")
  return "$" + $tag + "$" + $json + "$" + $tag + "$"
}

function Invoke-SupabaseSql {
  param([string]$Sql)
  if (-not $env:SUPABASE_ACCESS_TOKEN) {
    throw "SUPABASE_ACCESS_TOKEN is not set in this process."
  }
  $headers = @{
    Authorization = "Bearer $env:SUPABASE_ACCESS_TOKEN"
    "Content-Type" = "application/json"
  }
  $apiUrl = "https://api.supabase.com/v1/projects/$ProjectRef/database/query"
  $escapedSql = ConvertTo-JsonAsciiStringLiteral $Sql
  $body = '{"query":' + $escapedSql + '}'
  return Invoke-RestMethod -Method Post -Uri $apiUrl -Headers $headers -Body $body
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

$manifestRows = @(Import-Csv -Path $ManifestPath -Encoding UTF8 | Where-Object { $_.status -eq "converted" })
$utterances = New-Object System.Collections.Generic.List[object]

foreach ($item in $manifestRows) {
  $mdPath = Join-Path $Root ([string]$item.raw_md_path)
  if (-not (Test-Path $mdPath)) { continue }

  $lines = @(Get-Content -Path $mdPath -Encoding UTF8)
  $order = 0
  $speakerLabel = ""
  $speakerRole = ""
  $speakerName = ""
  $sectionHeading = ""
  $buffer = New-Object System.Collections.Generic.List[string]

  foreach ($line in $lines) {
    $trimmed = $line.Trim()
    if ([string]::IsNullOrWhiteSpace($trimmed)) { continue }

    $headingMatch = [regex]::Match($trimmed, "^#{1,6}\s+(?<heading>.+)$")
    if ($headingMatch.Success) {
      $sectionHeading = $headingMatch.Groups["heading"].Value.Trim()
      continue
    }

    $speakerMatch = [regex]::Match($trimmed, "^\((?<speaker>[^)]{1,120})\)\s*(?<text>.*)$")
    if ($speakerMatch.Success) {
      if ($order -gt 0) {
        Flush-Utterance -Target $utterances -ExternalId $item.external_id -MeetingIdxId $item.meeting_idx_id -MeetingDate $item.meeting_date -Order $order -SpeakerLabel $speakerLabel -SpeakerRole $speakerRole -SpeakerName $speakerName -SectionHeading $sectionHeading -Buffer $buffer
        $buffer.Clear()
      }

      $order += 1
      $parts = Get-SpeakerParts $speakerMatch.Groups["speaker"].Value
      $speakerLabel = $parts.label
      $speakerRole = $parts.role
      $speakerName = $parts.name

      $firstText = $speakerMatch.Groups["text"].Value.Trim()
      if (-not [string]::IsNullOrWhiteSpace($firstText)) {
        $buffer.Add($firstText) | Out-Null
      }
      continue
    }

    if ($order -gt 0) {
      $buffer.Add($trimmed) | Out-Null
    }
  }

  if ($order -gt 0) {
    Flush-Utterance -Target $utterances -ExternalId $item.external_id -MeetingIdxId $item.meeting_idx_id -MeetingDate $item.meeting_date -Order $order -SpeakerLabel $speakerLabel -SpeakerRole $speakerRole -SpeakerName $speakerName -SectionHeading $sectionHeading -Buffer $buffer
  }
}

$utterances | Export-Csv -Path $OutCsv -NoTypeInformation -Encoding UTF8

$bySpeaker = $utterances | Group-Object speaker_name | Sort-Object Count -Descending | Select-Object -First 10
Write-Host "Parsed utterances: $($utterances.Count)"
Write-Host "Output: $OutCsv"
Write-Host "Top speakers:"
$bySpeaker | ForEach-Object { Write-Host ("  " + $_.Name + "=" + $_.Count) }

if ($UpdateSupabase) {
  $externalRows = @($manifestRows | Select-Object external_id)
  $externalJson = ConvertTo-SqlJsonLiteral $externalRows
  $deleteSql = @"
with raw as (
  select *
  from jsonb_to_recordset($externalJson::jsonb) as r(external_id text)
),
target_docs as (
  select d.id
  from public.source_documents d
  join raw r on r.external_id = d.external_id
  where d.source_system = 'pipc'
)
delete from public.utterances u
using target_docs d
where u.source_document_id = d.id
returning u.id;
"@
  $deleted = Invoke-SupabaseSql -Sql $deleteSql
  $deletedCount = @($deleted).Count
  Write-Host "Deleted previous utterances: $deletedCount"

  $chunkNo = 0
  $utteranceArray = @($utterances.ToArray())
  foreach ($chunk in Split-IntoChunks -Rows $utteranceArray -Size $ChunkSize) {
    $chunkNo += 1
    $jsonSql = ConvertTo-SqlJsonLiteral $chunk
    $insertSql = @"
with raw as (
  select *
  from jsonb_to_recordset($jsonSql::jsonb) as r(
    external_id text,
    meeting_idx_id text,
    utterance_date text,
    utterance_order integer,
    speaker_label text,
    speaker_role text,
    speaker_name text,
    section_heading text,
    raw_text text,
    normalized_text text
  )
),
inserted as (
  insert into public.utterances (
    meeting_id,
    commissioner_id,
    speaker_name,
    speaker_role,
    utterance_order,
    utterance_date,
    raw_text,
    normalized_text,
    source_document_id,
    confidence,
    metadata
  )
  select
    m.id,
    c.id,
    coalesce(nullif(r.speaker_name, ''), r.speaker_label),
    nullif(r.speaker_role, ''),
    r.utterance_order,
    nullif(r.utterance_date, '')::date,
    r.raw_text,
    r.normalized_text,
    d.id,
    case when c.id is null then 0.700 else 0.900 end,
    jsonb_build_object(
      'speaker_label', r.speaker_label,
      'section_heading', r.section_heading,
      'meeting_idx_id', r.meeting_idx_id,
      'external_id', r.external_id
    )
  from raw r
  join public.meetings m on m.pipc_idx_id = r.meeting_idx_id
  join public.source_documents d on d.source_system = 'pipc' and d.external_id = r.external_id
  left join public.commissioners c on c.name = r.speaker_name
  where nullif(r.raw_text, '') is not null
  returning id
)
select count(*) as inserted_count from inserted;
"@
    $result = Invoke-SupabaseSql -Sql $insertSql
    $json = $result | ConvertTo-Json -Depth 4 -Compress
    Write-Host "Inserted chunk ${chunkNo}: $json"
  }
}
