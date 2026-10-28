$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Backend = Join-Path $ProjectRoot 'backend'

Write-Host 'Setting up the FinAssist AI development environment...' -ForegroundColor Cyan
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
  throw 'Python was not found. Install Python 3.11+ and reopen PowerShell.'
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw 'npm was not found. Install Node.js 20+ and reopen PowerShell.'
}

Push-Location $Backend
try {
  if (-not (Test-Path '.venv')) { python -m venv .venv }
  & .\.venv\Scripts\python.exe -m pip install --upgrade pip
  & .\.venv\Scripts\python.exe -m pip install -r requirements.txt
} finally { Pop-Location }

Push-Location $ProjectRoot
try { npm install } finally { Pop-Location }
Write-Host 'Setup completed. Use scripts/start-backend-windows.ps1 and scripts/start-frontend-windows.ps1 in separate terminals.' -ForegroundColor Green
