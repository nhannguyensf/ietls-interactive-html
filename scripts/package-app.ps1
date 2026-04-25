$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptDir
$distDir = Join-Path $root "dist"
$zipPath = Join-Path $distDir "IELTS_Practice_App.zip"

$includePaths = @(
  "app",
  "assets",
  "docs",
  "scripts",
  "index.html",
  "README.md",
  ".nojekyll",
  "manifest.webmanifest",
  "service-worker.js",
  "START_APP.bat",
  "PACKAGE_APP.bat"
)

New-Item -ItemType Directory -Force -Path $distDir | Out-Null

if (Test-Path -LiteralPath $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}

$resolvedPaths = $includePaths | ForEach-Object {
  $path = Join-Path $root $_
  if (-not (Test-Path -LiteralPath $path)) {
    throw "Required package item is missing: $_"
  }
  $path
}

Compress-Archive -Path $resolvedPaths -DestinationPath $zipPath -Force

$zip = Get-Item -LiteralPath $zipPath
$sizeMb = [Math]::Round($zip.Length / 1MB, 2)

Write-Host "Created package:"
Write-Host $zip.FullName
Write-Host "Size: $sizeMb MB"
