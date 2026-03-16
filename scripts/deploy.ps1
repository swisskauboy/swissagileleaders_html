param(
  [string]$Source,
  [string]$Destination = "D:\Nextcloud (aragost)\public\swissagileleaders_html",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if ([string]::IsNullOrWhiteSpace($Source)) {
  $Source = $repoRoot
}
$Source = (Resolve-Path $Source).Path

if (-not (Test-Path -Path $Source -PathType Container)) {
  throw "Source directory not found: $Source"
}

$encodingCheckPatterns = @("Ã", "Â", "â€", "�")
$encodingCheckFiles = Get-ChildItem -Path $Source -Recurse -Include *.html, *.css, *.js
$encodingIssues = @()

foreach ($file in $encodingCheckFiles) {
  try {
    $content = Get-Content -Raw -Path $file.FullName
  } catch {
    continue
  }
  foreach ($pattern in $encodingCheckPatterns) {
    if ($content -like "*$pattern*") {
      $encodingIssues += $file.FullName
      break
    }
  }
}

if ($encodingIssues.Count -gt 0) {
  $list = $encodingIssues | Sort-Object -Unique | ForEach-Object { " - $_" }
  $message = @(
    "Encoding check failed. Possible mojibake sequences were found.",
    "Please resave the affected files as UTF-8 and re-run deploy.",
    "",
    "Affected files:",
    ($list -join [Environment]::NewLine)
  ) -join [Environment]::NewLine
  throw $message
}

New-Item -Path $Destination -ItemType Directory -Force | Out-Null

$publishItems = @(
  "index.html",
  "agileunconference",
  "assets",
  "erster-schritt",
  "impressum-and-legal",
  "kontakt",
  "services",
  "team",
  "werte"
)

$stagingRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("sal-deploy-" + [Guid]::NewGuid().ToString("N"))
New-Item -Path $stagingRoot -ItemType Directory -Force | Out-Null

try {
  foreach ($item in $publishItems) {
    $sourcePath = Join-Path $Source $item
    if (-not (Test-Path -Path $sourcePath)) {
      throw "Required deploy item not found: $sourcePath"
    }
    Copy-Item -Path $sourcePath -Destination $stagingRoot -Recurse -Force
  }

  $robocopyArgs = @(
    $stagingRoot,
    $Destination,
    "/MIR",
    "/R:2",
    "/W:1",
    "/NP",
    "/XJ"
  )

  if ($DryRun) {
    $robocopyArgs += "/L"
  }

  Write-Host "Deploy source:      $Source"
  Write-Host "Deploy staging:     $stagingRoot"
  Write-Host "Deploy destination: $Destination"
  if ($DryRun) {
    Write-Host "Mode: DRY RUN (no files are copied or deleted)"
  }

  & robocopy @robocopyArgs
  $exitCode = $LASTEXITCODE

  # Robocopy exit codes 0-7 indicate success (including copied/skipped mismatches).
  if ($exitCode -gt 7) {
    throw "Deployment failed. Robocopy exit code: $exitCode"
  }

  Write-Host "Deployment completed. Robocopy exit code: $exitCode"
}
finally {
  if (Test-Path -Path $stagingRoot -PathType Container) {
    try {
      [System.IO.Directory]::Delete($stagingRoot, $true)
    }
    catch {
      Write-Warning "Could not remove staging directory: $stagingRoot"
    }
  }
}
