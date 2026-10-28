$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Backend = Join-Path $ProjectRoot 'backend'
Push-Location $Backend
try {
  if (-not (Test-Path '.venv\Scripts\python.exe')) { throw 'Run scripts/setup-windows.ps1 first.' }
  & .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
} finally { Pop-Location }
