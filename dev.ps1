# One-click dev starter for Windows PowerShell.
# Starts backend (uvicorn) and frontend (pnpm dev) in separate windows.

param(
    [int]$ApiPort = 8000,
    [int]$WebPort = 5173
)

$ErrorActionPreference = "Stop"

$pwshCmd = Get-Command pwsh -ErrorAction SilentlyContinue
$shellExe = if ($pwshCmd) { $pwshCmd.Source } else { "powershell.exe" }

function Start-App {
    param(
        [string]$Title,
        [string]$WorkDir,
        [string]$Command
    )
    Start-Process -WindowStyle Normal -FilePath $shellExe -ArgumentList @("-NoExit", "-Command", "Set-Location `"$WorkDir`"; $Command") -WorkingDirectory $WorkDir -PassThru | ForEach-Object {
        Write-Host "$Title started. PID=$($_.Id)"
    }
}

# Backend
Start-App -Title "Backend" -WorkDir "$PSScriptRoot/backend" -Command "uv run uvicorn app.main:app --reload --port $ApiPort"

# Frontend
$env:VITE_API_BASE = "http://localhost:$ApiPort"
Start-App -Title "Frontend" -WorkDir "$PSScriptRoot/frontend" -Command "pnpm dev --host --port $WebPort"

Write-Host "`nDev servers starting... Backend: http://localhost:$ApiPort  Frontend: http://localhost:$WebPort`n"

