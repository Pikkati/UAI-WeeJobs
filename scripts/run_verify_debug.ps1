param(
  [string]$AvdName = ""
)

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Resolve-Path (Join-Path $scriptRoot "..")

function Find-Adb {
  $cmd = Get-Command adb -ErrorAction SilentlyContinue
  if ($cmd) {
    return $cmd.Source
  }
  if ($env:ANDROID_SDK_ROOT) {
    $p = Join-Path $env:ANDROID_SDK_ROOT "platform-tools\adb.exe"
    if (Test-Path $p) { return $p }
  }
  if ($env:ANDROID_HOME) {
    $p2 = Join-Path $env:ANDROID_HOME "platform-tools\adb.exe"
    if (Test-Path $p2) { return $p2 }
  }
  return $null
}

$adb = Find-Adb
if (-not $adb) {
  Write-Error "adb not found in PATH or ANDROID_SDK_ROOT/platform-tools. Install Android SDK Platform-Tools or add adb to PATH."; exit 1
}

# If no connected devices, attempt to launch an AVD
$devices = & $adb devices | Select-String -Pattern "device" -SimpleMatch
if (-not $devices) {
  Write-Host "No device listed; launching AVD..."
  & "$repoRoot\scripts\launch_avd.ps1" $AvdName
  Write-Host "Waiting for emulator device..."
  & $adb wait-for-device
  Start-Sleep -Seconds 2
}

Push-Location (Join-Path $repoRoot "android")
Write-Host "Building and installing debug APK...";
& .\gradlew.bat installDebug
Pop-Location

Write-Host "Starting app activity..."
& $adb shell am force-stop com.weejobs.app
& $adb shell am start -n com.weejobs.app/.MainActivity

Start-Sleep -Seconds 4

Write-Host "`n=== expo-router-native logs ==="
& $adb logcat -d | Select-String "expo-router-native" | ForEach-Object { Write-Host $_ }

Write-Host "`n=== expo-router logs ==="
& $adb logcat -d | Select-String "expo-router" | ForEach-Object { Write-Host $_ }

Write-Host "`n=== index logs ==="
& $adb logcat -d | Select-String "\[index\]" | ForEach-Object { Write-Host $_ }

Write-Host "`n=== /sdcard/Download/routes_manifest_seen.txt ==="
& $adb shell ls -l /sdcard/Download/routes_manifest_seen.txt 2>$null | ForEach-Object { Write-Host $_ }
& $adb shell cat /sdcard/Download/routes_manifest_seen.txt 2>$null | ForEach-Object { Write-Host $_ }

Write-Host "`n=== app files (run-as) ==="
& $adb shell run-as com.weejobs.app ls -l /data/data/com.weejobs.app/files 2>$null | ForEach-Object { Write-Host $_ }
& $adb exec-out run-as com.weejobs.app cat /data/data/com.weejobs.app/files/routes_manifest_seen.txt 2>$null | ForEach-Object { Write-Host $_ }

Write-Host "`nVerification script complete."
