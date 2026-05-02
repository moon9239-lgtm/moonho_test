param(
  [switch]$Force,
  [int]$StartAt = 1,
  [int]$MaxFiles = 0
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $ScriptDir
$CrawlerDir = Join-Path $Root "pipc_committee_decisions_crawler"
$AttachmentsCsv = Join-Path $CrawlerDir "data/attachments.csv"
$Kordoc = Join-Path $Root "pipc_minutes_crawler/node_modules/.bin/kordoc.cmd"
$OutRoot = Join-Path $Root "pipc_knowledge_base/99_raw/decisions"
$ManifestPath = Join-Path $OutRoot "_manifest.csv"

if (-not (Test-Path $Kordoc)) {
  throw "kordoc.cmd was not found at $Kordoc"
}

function Get-WorkspaceRelativePath {
  param(
    [string]$BasePath,
    [string]$TargetPath
  )
  $baseFull = [System.IO.Path]::GetFullPath($BasePath).TrimEnd("\", "/") + [System.IO.Path]::DirectorySeparatorChar
  $targetFull = [System.IO.Path]::GetFullPath($TargetPath)
  if ($targetFull.StartsWith($baseFull, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $targetFull.Substring($baseFull.Length)
  }
  return $targetFull
}

function Get-NormalizedExt {
  param([object]$Row)
  $ext = ([string]$Row.file_extsn).ToLowerInvariant()
  if ([string]::IsNullOrWhiteSpace($ext)) {
    $ext = [System.IO.Path]::GetExtension([string]$Row.attachment_name).TrimStart(".").ToLowerInvariant()
  }
  return $ext
}

function Get-ExternalId {
  param([object]$Row)
  $ext = Get-NormalizedExt $Row
  $cnv = if ([string]::IsNullOrWhiteSpace([string]$Row.cnv_cnt)) { "0" } else { [string]$Row.cnv_cnt }
  return "decision_file:" + $Row.atch_file_id + ":" + $Row.file_sn + ":" + $ext + ":" + $cnv
}

function Get-OutputFileName {
  param([object]$Row)
  $ext = Get-NormalizedExt $Row
  $date = if ([string]::IsNullOrWhiteSpace([string]$Row.decision_date)) { "unknown-date" } else { [string]$Row.decision_date }
  $cnv = if ([string]::IsNullOrWhiteSpace([string]$Row.cnv_cnt)) { "0" } else { [string]$Row.cnv_cnt }
  $atch = ([string]$Row.atch_file_id) -replace "[^A-Za-z0-9_]", "_"
  $idx = ([string]$Row.idx_id) -replace "[^A-Za-z0-9_-]", "_"
  return "$date`_$idx`_$atch`_$($Row.file_sn)`_$cnv`_$ext.md"
}

New-Item -ItemType Directory -Path $OutRoot -Force | Out-Null

$allRows = @(Import-Csv -Path $AttachmentsCsv -Encoding UTF8)
$successRows = @($allRows | Where-Object { $_.status -ne "failed" })
$failedRows = @($allRows | Where-Object { $_.status -eq "failed" })

$deduped = @(
  $successRows |
    Group-Object {
      $row = $_
      $ext = Get-NormalizedExt $row
      $cnv = if ([string]::IsNullOrWhiteSpace([string]$row.cnv_cnt)) { "0" } else { [string]$row.cnv_cnt }
      "$($row.idx_id)|$($row.atch_file_id)|$($row.file_sn)|$ext|$cnv"
    } |
    ForEach-Object { $_.Group[0] } |
    Sort-Object decision_date, idx_id, file_sn, file_extsn, cnv_cnt
)

if ($StartAt -gt 1) {
  $deduped = @($deduped | Select-Object -Skip ($StartAt - 1))
}
if ($MaxFiles -gt 0) {
  $deduped = @($deduped | Select-Object -First $MaxFiles)
}

$results = New-Object System.Collections.Generic.List[object]
$total = $deduped.Count
$index = 0

foreach ($row in $deduped) {
  $index += 1
  $ext = Get-NormalizedExt $row
  $year = if ([string]::IsNullOrWhiteSpace([string]$row.decision_date)) { "unknown" } else { ([string]$row.decision_date).Substring(0, 4) }
  $outDir = Join-Path $OutRoot $year
  New-Item -ItemType Directory -Path $outDir -Force | Out-Null

  $inputPath = Join-Path $CrawlerDir ([string]$row.saved_path)
  $outputPath = Join-Path $outDir (Get-OutputFileName $row)
  $externalId = Get-ExternalId $row
  $status = "skipped"
  $errorMessage = ""

  if (-not (Test-Path $inputPath)) {
    $status = "missing_local"
    $errorMessage = "Downloaded file was not found locally."
  }
  elseif ($Force -or -not (Test-Path $outputPath)) {
    try {
      Write-Host "[$index/$total] converting $externalId"
      & $Kordoc $inputPath -o $outputPath --no-header-footer --silent
      if ($LASTEXITCODE -ne 0) {
        throw "kordoc exited with code $LASTEXITCODE"
      }
      $status = "converted"
    }
    catch {
      $status = "failed"
      $errorMessage = $_.Exception.Message
      Write-Host "[$index/$total] failed $externalId :: $errorMessage"
    }
  }

  $results.Add([pscustomobject]@{
    external_id = $externalId
    decision_idx_id = $row.idx_id
    decision_date = $row.decision_date
    bill_number = $row.bill_number
    attachment_name = $row.attachment_name
    file_ext = $ext
    input_path = Get-WorkspaceRelativePath -BasePath $Root -TargetPath $inputPath
    raw_md_path = Get-WorkspaceRelativePath -BasePath $Root -TargetPath $outputPath
    status = $status
    error = $errorMessage
  }) | Out-Null
}

foreach ($row in $failedRows) {
  $ext = Get-NormalizedExt $row
  $results.Add([pscustomobject]@{
    external_id = Get-ExternalId $row
    decision_idx_id = $row.idx_id
    decision_date = $row.decision_date
    bill_number = $row.bill_number
    attachment_name = $row.attachment_name
    file_ext = $ext
    input_path = $row.saved_path
    raw_md_path = ""
    status = "source_failed"
    error = $row.error
  }) | Out-Null
}

$existingRows = @()
if (Test-Path $ManifestPath) {
  $existingRows = @(Import-Csv -Path $ManifestPath -Encoding UTF8 | Where-Object {
    $id = $_.external_id
    -not @($results | Where-Object { $_.external_id -eq $id }).Count
  })
}

$merged = @($existingRows + $results)
$merged | Sort-Object decision_date, decision_idx_id, external_id | Export-Csv -Path $ManifestPath -NoTypeInformation -Encoding UTF8

$converted = @($merged | Where-Object { $_.status -eq "converted" }).Count
$skipped = @($merged | Where-Object { $_.status -eq "skipped" }).Count
$failed = @($merged | Where-Object { $_.status -eq "failed" }).Count
$sourceFailed = @($merged | Where-Object { $_.status -eq "source_failed" }).Count
$missingLocal = @($merged | Where-Object { $_.status -eq "missing_local" }).Count

Write-Host "Decision conversion manifest: total=$($merged.Count) converted=$converted skipped=$skipped failed=$failed source_failed=$sourceFailed missing_local=$missingLocal"
Write-Host "Manifest: $ManifestPath"
