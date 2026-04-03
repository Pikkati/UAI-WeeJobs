# Apply local node_modules patches (Windows PowerShell)
# Usage: .\scripts\apply-node-patches.ps1

Write-Host "Applying node-patches from ./node-patches to node_modules..."

$srcRoot = Join-Path $PSScriptRoot '..\\node-patches'
$destRoot = Join-Path $PSScriptRoot '..\\node_modules'

if (-not (Test-Path $srcRoot)) {
  Write-Host "No node-patches directory found at $srcRoot — nothing to apply."; exit 0
}

Get-ChildItem -Path $srcRoot -Recurse -File | ForEach-Object {
  $rel = $_.FullName.Substring($srcRoot.Length).TrimStart('\\')
  $dest = Join-Path $destRoot $rel
  $destDir = Split-Path $dest -Parent
  if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Force -Path $destDir | Out-Null }
  Copy-Item -Path $_.FullName -Destination $dest -Force
  Write-Host "Copied $rel"
}

Write-Host "Node patches applied (copied)."
