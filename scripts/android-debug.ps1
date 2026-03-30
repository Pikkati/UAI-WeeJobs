<#
 scripts/android-debug.ps1

 Usage:
  powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\android-debug.ps1 -DeviceId emulator-5556 -ApkPath "android\app\build\outputs\apk\debug\app-debug.apk" -Package com.weejobs.app

 What it does:
  - discovers `adb` from `ANDROID_SDK_ROOT` or `ANDROID_HOME` (or uses `adb` on PATH)
  - waits for the device/emulator
  - clears logcat
  - installs the APK if present
  - sets the app as debug app so the platform will wait for a debugger when it starts
  - starts the app activity
  - tails logcat for the app pid in a background job and writes to `logs/`

#>

param(
  [string]$DeviceId = 'emulator-5556',
  [string]$ApkPath = 'android\app\build\outputs\apk\debug\app-debug.apk',
  [string]$Package = 'com.weejobs.app',
  [int]$WaitSecondsForPid = 20
)

$adb = if ($env:ANDROID_SDK_ROOT) { Join-Path $env:ANDROID_SDK_ROOT 'platform-tools\adb.exe' } elseif ($env:ANDROID_HOME) { Join-Path $env:ANDROID_HOME 'platform-tools\adb.exe' } else { 'adb' }

if (-not (Get-Command $adb -ErrorAction SilentlyContinue)) {
  Write-Error "adb not found at '$adb'. Ensure ANDROID_SDK_ROOT/ANDROID_HOME is set or adb is on PATH."
  exit 2
}

Write-Output "Using adb: $adb"
Write-Output "Device: $DeviceId"
Write-Output "Package: $Package"

& $adb -s $DeviceId wait-for-device

# ensure logs directory
$logDir = Join-Path (Get-Location) 'logs'
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

# clear logcat
Write-Output "Clearing device logcat..."
& $adb -s $DeviceId logcat -c

# optional install
if (Test-Path $ApkPath) {
  Write-Output "Installing APK: $ApkPath"
  & $adb -s $DeviceId install -r $ApkPath | Out-Host
} else {
  Write-Output "APK not found at $ApkPath; skipping install."
}

# set debug app so system waits for debugger when started
Write-Output "Setting debug app (will wait for debugger when app starts): $Package"
& $adb -s $DeviceId shell am set-debug-app -w $Package | Out-Null

# start app
Write-Output "Starting app activity..."
& $adb -s $DeviceId shell am start -n "${Package}/.MainActivity" | Out-Host

# wait for pid
$appPid = ''
for ($i=0; $i -lt $WaitSecondsForPid; $i++) {
  $raw = (& $adb -s $DeviceId shell pidof $Package) -join ''
  $raw = $raw -replace '\r|\n',''
  if ($raw -and $raw -ne '') { $appPid = $raw; break }
  Start-Sleep -Seconds 1
}
if (-not $appPid) {
  Write-Warning "Could not determine pid for $Package. Will tail full logcat to logs/$Package-full.log"
  $logFile = Join-Path $logDir "$Package-full.log"
  Start-Job -Name "adb-logcat-$Package" -ScriptBlock { param($adbPath,$device,$out) & $adbPath -s $device logcat -v time | Out-File -FilePath $out -Encoding UTF8 } -ArgumentList $adb,$DeviceId,$logFile | Out-Null
} else {
  $logFile = Join-Path $logDir "$Package-$appPid.log"
  Write-Output "Tailing logs for pid $appPid -> $logFile (background job)"
  Start-Job -Name "adb-logcat-$Package-$appPid" -ScriptBlock { param($adbPath,$device,$p,$out) & $adbPath -s $device logcat --pid=$p -v time | Out-File -FilePath $out -Encoding UTF8 } -ArgumentList $adb,$DeviceId,$appPid,$logFile | Out-Null
}

Write-Output "Log collection started: $logFile"
Write-Output "To follow logs: Get-Content -Path $logFile -Wait"
Write-Output "To attach debugger in Android Studio: Run -> Attach debugger to Android process -> select $Package"
Write-Output "To clear debug app flag later: & $adb -s $DeviceId shell am clear-debug-app"
