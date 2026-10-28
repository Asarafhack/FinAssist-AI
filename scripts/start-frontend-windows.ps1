$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $ProjectRoot
try {
  if (-not (Test-Path 'node_modules')) { throw 'Run scripts/setup-windows.ps1 first.' }
  npm run dev
} finally { Pop-Location }
