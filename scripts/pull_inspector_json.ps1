<#
Pulls `expo-router-inspect-all.json` from a connected device.

Usage:
  .\scripts\pull_inspector_json.ps1 [-Serial <device-serial>] [-Out <output-path>]

The script tries the following paths (in order):
  - /sdcard/Download/expo-router-inspect-all.json
  - /storage/emulated/0/Android/data/com.weejobs.app/files/expo-router-inspect-all.json
If those fail, it attempts `run-as com.weejobs.app cat files/expo-router-inspect-all.json` (requires debuggable app).
#>

param(
  [string]$Serial = $env:DEVICE_SERIAL,
  [string]$Out
)

function Find-Adb {
  $cmdObj = Get-Command adb -ErrorAction SilentlyContinue
  if ($cmdObj) { return $cmdObj.Source }
  $candidates = @(
    "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe",
    "$env:ANDROID_HOME\platform-tools\adb.exe",
    "$env:ProgramFiles(x86)\Android\android-sdk\platform-tools\adb.exe",
    "$env:USERPROFILE\AppData\Local\Android\Sdk\platform-tools\adb.exe"
  )
  foreach ($p in $candidates) {
    if ($p -and (Test-Path $p)) { return $p }
  }
  return $null
}

$adb = Find-Adb
if (-not $adb) { Write-Error "adb not found in PATH or common SDK locations"; exit 2 }

if (-not $Out) {
  $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
  $Out = Join-Path $scriptDir "..\expo-router-inspect-all-from-device.json"
}

if (-not $Serial) {
  # Parse `adb devices -l` output robustly and extract serial ids
  $raw = (& $adb devices -l) -join "`n"
  $allLines = $raw -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -and $_ -notmatch 'List of devices' }
  $deviceIds = @()
  foreach ($ln in $allLines) {
    if ($ln -match '^([A-Za-z0-9_-]+)\s+device\b') { $deviceIds += $matches[1] }
    elseif ($ln -match '^([A-Za-z0-9_-]+)\s+') { $deviceIds += $matches[1] }
  }
  if ($deviceIds.Count -eq 0) { Write-Error "No connected devices found"; exit 3 }
  if ($deviceIds.Count -gt 1) {
    # prefer non-emulator device if available
    $phys = $deviceIds | Where-Object { $_ -notmatch '^emulator' -and $_ -notmatch '^sdk_' }
    $Serial = if ($phys.Count -gt 0) { $phys[0] } else { $deviceIds[0] }
  } else {
    $Serial = $deviceIds[0]
  }
}

Write-Output "Using adb: $adb"
Write-Output "Target device: $Serial"

$candidates = @(
  "/sdcard/Download/expo-router-inspect-all.json",
  "/storage/emulated/0/Android/data/com.weejobs.app/files/expo-router-inspect-all.json"
)

$found = $false
foreach ($path in $candidates) {
  Write-Output "Trying to pull $path ..."
  $res = & $adb -s $Serial pull $path $Out 2>&1
  if ($LASTEXITCODE -eq 0) {
    Write-Output "Pulled $path -> $Out"
    $found = $true
    break
  } else {
    Write-Output "Pull failed: $res"
  }
}

if (-not $found) {
  Write-Output "Attempting run-as fallback (requires debuggable app)..."
  try {
    $content = & $adb -s $Serial shell 'run-as com.weejobs.app cat files/expo-router-inspect-all.json'
    if ($content -and $content -ne '') {
      $content | Out-File -Encoding utf8 -FilePath $Out
      Write-Output "Wrote via run-as -> $Out"
      $found = $true
    } else {
      Write-Output "run-as produced no content"
    }
  } catch {
    Write-Output "run-as error: $_"
  }
}

if ($found) {
  Write-Output "Validating JSON..."
  try {
    $raw = Get-Content -Raw -Path $Out
    $obj = $raw | ConvertFrom-Json
    $pretty = $obj | ConvertTo-Json -Depth 12
    $pretty | Out-File -Encoding utf8 -FilePath $Out
    Write-Output "JSON valid and saved to $Out"
    exit 0
  } catch {
    Write-Error "JSON parse failed: $_"
    exit 4
  }
} else {
  Write-Error "Could not retrieve inspector JSON from device"
  exit 5
}
