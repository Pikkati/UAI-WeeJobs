param(
  [string]$AvdName = ""
)

function Find-Emulator {
  $sdk = $env:ANDROID_SDK_ROOT
  if (-not $sdk) { $sdk = $env:ANDROID_HOME }
  if (-not $sdk) {
    $possible = "$env:LOCALAPPDATA\Android\Sdk"
    if (Test-Path $possible) { $sdk = $possible }
  }
  $candidates = @()
  if ($sdk) {
    $p1 = Join-Path $sdk "emulator\emulator.exe"
    $p2 = Join-Path $sdk "tools\emulator.exe"
    if (Test-Path $p1) { $candidates += $p1 }
    if (Test-Path $p2) { $candidates += $p2 }
  }
  $which = (Get-Command emulator.exe -ErrorAction SilentlyContinue)?.Source
  if ($which) { $candidates += $which }
  return $candidates | Select-Object -First 1
}

$emulator = Find-Emulator
if (-not $emulator) {
  Write-Error "No emulator binary found. Ensure Android SDK emulator is installed and ANDROID_SDK_ROOT set."
  exit 1
}

if (-not $AvdName) {
  $avds = & $emulator -list-avds 2>$null | Where-Object { $_ -ne "" }
  if ($avds -and $avds.Count -gt 0) {
    $AvdName = $avds[0]
    Write-Host "No AVD specified. Using first available AVD: $AvdName"
  } else {
    Write-Error "No AVDs found. Create one in Android Studio Device Manager."
    exit 2
  }
}

Write-Host "Launching AVD: $AvdName via emulator: $emulator"
Start-Process -FilePath $emulator -ArgumentList "-avd `"$AvdName`"" -NoNewWindow
