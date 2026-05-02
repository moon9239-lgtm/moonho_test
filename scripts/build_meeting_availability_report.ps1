$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $ScriptDir
$MeetingsCsv = Join-Path $Root "pipc_minutes_crawler/data/meetings.csv"
$FilesCsv = Join-Path $Root "pipc_minutes_crawler/data/attachments.csv"
$OutCsv = Join-Path $Root "pipc_knowledge_base/90_normalized_data/meeting_availability.csv"
$OutMd = Join-Path $Root "pipc_knowledge_base/00_indexes/meeting_availability_report.md"

$transcriptNeedle = ([char]0xC18D) + ([char]0xAE30) + ([char]0xB85D)
$minutesNeedle = ([char]0xD68C) + ([char]0xC758) + ([char]0xB85D)

$meetings = @(Import-Csv -Path $MeetingsCsv -Encoding UTF8)
$files = @(Import-Csv -Path $FilesCsv -Encoding UTF8)

$rows = foreach ($meeting in $meetings) {
  $meetingFiles = @($files | Where-Object { $_.idx_id -eq $meeting.idx_id })
  $hasMinutes = @($meetingFiles | Where-Object { ([string]$_.attachment_name).Contains($minutesNeedle) }).Count -gt 0
  $hasTranscript = @($meetingFiles | Where-Object { ([string]$_.attachment_name).Contains($transcriptNeedle) }).Count -gt 0
  $minutesStatus = if ($hasMinutes) { "available" } else { "missing" }
  $transcriptStatus = if ($hasTranscript) { "available" } else { "missing" }
  $utteranceStatus = if ($hasTranscript) { "ready" } else { "unavailable_no_transcript" }
  $analysisPolicy = if ($hasTranscript) {
    "utterance_analysis_allowed"
  }
  elseif ($hasMinutes) {
    "minutes_only_no_utterance_analysis"
  }
  else {
    "metadata_only_no_file_analysis"
  }

  [pscustomobject]@{
    meeting_date = $meeting.meeting_date
    meeting_number = [int]$meeting.number
    pipc_idx_id = $meeting.idx_id
    title = $meeting.title
    attachment_count = $meetingFiles.Count
    minutes_status = $minutesStatus
    transcript_status = $transcriptStatus
    utterance_analysis_status = $utteranceStatus
    analysis_policy = $analysisPolicy
  }
}

New-Item -ItemType Directory -Path (Split-Path -Parent $OutCsv) -Force | Out-Null
New-Item -ItemType Directory -Path (Split-Path -Parent $OutMd) -Force | Out-Null
$rows | Sort-Object meeting_date -Descending | Export-Csv -Path $OutCsv -NoTypeInformation -Encoding UTF8

$both = @($rows | Where-Object { $_.minutes_status -eq "available" -and $_.transcript_status -eq "available" })
$minutesOnly = @($rows | Where-Object { $_.minutes_status -eq "available" -and $_.transcript_status -ne "available" })
$noFiles = @($rows | Where-Object { $_.minutes_status -ne "available" -and $_.transcript_status -ne "available" })

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("# Meeting Availability Report") | Out-Null
$lines.Add("") | Out-Null
$lines.Add("This report records source-file availability exactly as observed from the crawled PIPC meeting pages. Missing means no matching attachment was present in the crawled page; it does not fabricate placeholder minutes or transcripts.") | Out-Null
$lines.Add("") | Out-Null
$lines.Add("## Summary") | Out-Null
$lines.Add("") | Out-Null
$lines.Add("| Category | Count | Analysis handling |") | Out-Null
$lines.Add("|---|---:|---|") | Out-Null
$lines.Add("| Minutes + transcript available | $($both.Count) | Agenda/minutes analysis and utterance analysis allowed |") | Out-Null
$lines.Add("| Minutes only | $($minutesOnly.Count) | Minutes-based summary allowed; utterance analysis disabled |") | Out-Null
$lines.Add("| No minutes/transcript attachment | $($noFiles.Count) | Meeting metadata only; file-based analysis disabled |") | Out-Null
$lines.Add("") | Out-Null
$lines.Add("## Minutes Only") | Out-Null
$lines.Add("") | Out-Null
$lines.Add("| Date | No. | Title | Minutes | Transcript | Analysis policy |") | Out-Null
$lines.Add("|---|---:|---|---|---|---|") | Out-Null
foreach ($row in ($minutesOnly | Sort-Object meeting_date -Descending)) {
  $lines.Add("| $($row.meeting_date) | $($row.meeting_number) | $($row.title) | $($row.minutes_status) | $($row.transcript_status) | $($row.analysis_policy) |") | Out-Null
}
$lines.Add("") | Out-Null
$lines.Add("## No Files") | Out-Null
$lines.Add("") | Out-Null
$lines.Add("| Date | No. | Title | Minutes | Transcript | Analysis policy |") | Out-Null
$lines.Add("|---|---:|---|---|---|---|") | Out-Null
foreach ($row in ($noFiles | Sort-Object meeting_date -Descending)) {
  $lines.Add("| $($row.meeting_date) | $($row.meeting_number) | $($row.title) | $($row.minutes_status) | $($row.transcript_status) | $($row.analysis_policy) |") | Out-Null
}
$lines.Add("") | Out-Null
$lines.Add("## Data File") | Out-Null
$lines.Add("") | Out-Null
$lines.Add('- CSV: `../90_normalized_data/meeting_availability.csv`') | Out-Null

[System.IO.File]::WriteAllText($OutMd, (($lines -join "`n") + "`n"), [System.Text.UTF8Encoding]::new($false))

Write-Host "Wrote $OutCsv"
Write-Host "Wrote $OutMd"
