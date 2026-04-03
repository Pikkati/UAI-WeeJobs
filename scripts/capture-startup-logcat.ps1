param(
  [string]$Device = "emulator-5554",
  [string]$Output = "./tmp_startup_logcat.txt",
  [int]$TimeoutSeconds = 15
)

$adb = $null
if ($Env:ANDROID_SDK_ROOT) {
  $candidate = "$Env:ANDROID_SDK_ROOT\platform-tools\adb.exe"
  if (Test-Path $candidate) { $adb = $candidate }
}
if (-not $adb) {
  try { $cmd = (Get-Command adb -ErrorAction Stop).Source; $adb = $cmd } catch { }
}
if (-not $adb) { Write-Error "adb not found (tried ANDROID_SDK_ROOT and PATH)"; exit 2 }

# Ensure output directory
$fullOut = Resolve-Path -LiteralPath $Output -ErrorAction SilentlyContinue
if (-not $fullOut) { $outDir = Split-Path $Output -Parent; if ($outDir -ne '') { New-Item -ItemType Directory -Force -Path $outDir | Out-Null } }

Write-Host "Clearing existing device logcat buffer..."
& $adb -s $Device logcat -c

Write-Host "Starting logcat on $Device -> $Output (timeout ${TimeoutSeconds} s)"
$proc = Start-Process -FilePath $adb -ArgumentList '-s', $Device, 'logcat', '-v', 'time' -NoNewWindow -RedirectStandardOutput $Output -PassThru
Start-Sleep -Milliseconds 200

# Launch the app (best-effort). Adjust component if needed.
try {
  Write-Host "Launching app MainActivity..."
  & $adb -s $Device shell am start -n com.weejobs.app/.MainActivity -a android.intent.action.MAIN -c android.intent.category.LAUNCHER | Out-Null
} catch {
  Write-Warning "Failed to launch app: $_"
}

# Wait then kill
$sw = [System.Diagnostics.Stopwatch]::StartNew()
while ($sw.Elapsed.TotalSeconds -lt $TimeoutSeconds) {
  Start-Sleep -Milliseconds 200
}

try {
  if (-not $proc.HasExited) {
    Write-Host "Timeout reached - stopping logcat process (PID $($proc.Id))."
    $proc.Kill()
    $proc.WaitForExit(2000) | Out-Null
  }
} catch {
  Write-Warning "Error while stopping logcat process: $_"
}

Write-Host "Log saved to: $Output"
exit 0
