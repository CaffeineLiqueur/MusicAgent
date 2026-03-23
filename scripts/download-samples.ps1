# Piano Sample Download Script (Windows PowerShell)
# Download Salamander piano samples to frontend/public/samples/salamander/

param(
    [string]$OutputDir = "..\frontend\public\samples\salamander",
    [string]$BaseUrl = "https://tonejs.github.io/audio/salamander"
)

$files = @(
    "A0.mp3",
    "C1.mp3", "Ds1.mp3", "Fs1.mp3", "A1.mp3",
    "C2.mp3", "Ds2.mp3", "Fs2.mp3", "A2.mp3",
    "C3.mp3", "Ds3.mp3", "Fs3.mp3", "A3.mp3",
    "C4.mp3", "Ds4.mp3", "Fs4.mp3", "A4.mp3",
    "C5.mp3", "Ds5.mp3", "Fs5.mp3", "A5.mp3",
    "C6.mp3", "Ds6.mp3", "Fs6.mp3", "A6.mp3",
    "C7.mp3", "Ds7.mp3", "Fs7.mp3", "A7.mp3",
    "C8.mp3"
)

$ScriptDir = $PSScriptRoot
Set-Location $ScriptDir

$FullOutputDir = Join-Path $ScriptDir $OutputDir
if (-not (Test-Path $FullOutputDir)) {
    New-Item -ItemType Directory -Path $FullOutputDir -Force | Out-Null
    Write-Host "Created directory: $FullOutputDir" -ForegroundColor Green
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Salamander Piano Sample Downloader" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Source: $BaseUrl" -ForegroundColor Gray
Write-Host "  Target: $FullOutputDir" -ForegroundColor Gray
Write-Host "  Files: $($files.Count)" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$skipCount = 0
$failCount = 0

foreach ($file in $files) {
    $url = "$BaseUrl/$file"
    $dest = Join-Path $FullOutputDir $file

    if (Test-Path $dest) {
        $fileSize = (Get-Item $dest).Length / 1KB
        Write-Host "[SKIP] $file exists ($([math]::Round($fileSize, 1)) KB)" -ForegroundColor Yellow
        $skipCount++
        continue
    }

    Write-Host "[DL] $file..." -NoNewline

    try {
        Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
        $fileSize = (Get-Item $dest).Length / 1KB
        Write-Host " OK ($([math]::Round($fileSize, 1)) KB)" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host " FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
        if (Test-Path $dest) {
            Remove-Item $dest -Force
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Download Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Success: $successCount" -ForegroundColor Green
Write-Host "  Skipped: $skipCount" -ForegroundColor Yellow
Write-Host "  Failed: $failCount" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan

if ($failCount -gt 0) {
    Write-Host ""
    Write-Host "Some files failed. Please re-run the script to continue." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Next: Set VITE_PIANO_SAMPLE_SOURCE=self-hosted in .env file" -ForegroundColor Cyan
