param(
  [switch]$Force
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $ScriptDir
$CrawlerDir = Join-Path $Root "pipc_minutes_crawler"
$AttachmentsCsv = Join-Path $CrawlerDir "data/attachments.csv"
$Kordoc = Join-Path $CrawlerDir "node_modules/.bin/kordoc.cmd"
$OutRoot = Join-Path $Root "pipc_knowledge_base/99_raw/transcripts"
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

New-Item -ItemType Directory -Path $OutRoot -Force | Out-Null

$transcriptNeedle = ([char]0xC18D) + ([char]0xAE30) + ([char]0xB85D)
$rows = @(Import-Csv -Path $AttachmentsCsv -Encoding UTF8 | Where-Object {
  ([string]$_.attachment_name).Contains($transcriptNeedle) -and
  ([string]$_.saved_path).ToLowerInvariant().EndsWith(".pdf")
})

$results = New-Object System.Collections.Generic.List[object]
$total = $rows.Count
$index = 0

foreach ($row in $rows) {
  $index += 1
  $inputPath = Join-Path $CrawlerDir ([string]$row.saved_path)
  $year = ([string]$row.meeting_date).Substring(0, 4)
  $outDir = Join-Path $OutRoot $year
  New-Item -ItemType Directory -Path $outDir -Force | Out-Null

  $baseName = [System.IO.Path]::GetFileNameWithoutExtension([string]$row.saved_path)
  $outputPath = Join-Path $outDir ($baseName + ".md")
  $relativeOutput = Get-WorkspaceRelativePath -BasePath $Root -TargetPath $outputPath
  $externalId = "meeting_file:" + $row.atch_file_id + ":" + $row.file_sn

  $status = "skipped"
  $errorMessage = ""

  if ($Force -or -not (Test-Path $outputPath)) {
    try {
      Write-Host "[$index/$total] converting $baseName"
      & $Kordoc $inputPath -o $outputPath --no-header-footer --silent
      if ($LASTEXITCODE -ne 0) {
        throw "kordoc exited with code $LASTEXITCODE"
      }
      $status = "converted"
    }
    catch {
      $status = "failed"
      $errorMessage = $_.Exception.Message
      Write-Host "[$index/$total] failed $baseName :: $errorMessage"
    }
  }

  $results.Add([pscustomobject]@{
    external_id = $externalId
    meeting_idx_id = $row.idx_id
    meeting_date = $row.meeting_date
    attachment_name = $row.attachment_name
    input_path = Get-WorkspaceRelativePath -BasePath $Root -TargetPath $inputPath
    raw_md_path = $relativeOutput
    status = $status
    error = $errorMessage
  }) | Out-Null
}

$results | Export-Csv -Path $ManifestPath -NoTypeInformation -Encoding UTF8

$converted = @($results | Where-Object { $_.status -eq "converted" }).Count
$skipped = @($results | Where-Object { $_.status -eq "skipped" }).Count
$failed = @($results | Where-Object { $_.status -eq "failed" }).Count

Write-Host "Transcript conversion complete: total=$total converted=$converted skipped=$skipped failed=$failed"
Write-Host "Manifest: $ManifestPath"
