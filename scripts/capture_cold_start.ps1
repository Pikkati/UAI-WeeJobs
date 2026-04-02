$repoRoot = 'D:\MyProjectsUAI\weejobs'
$adb = 'C:\Users\Sosuk\AppData\Local\Android\Sdk\platform-tools\adb.exe'

Write-Output "Starting build+install (gradle installDebug)..."
Push-Location (Join-Path $repoRoot 'android')
try {
    .\gradlew.bat installDebug
} catch {
    Write-Output "gradle failed: $_"
}
Pop-Location

# Pick a single connected device/emulator (first listed)
$devicesRaw = & $adb devices
$device = ($devicesRaw -split "\r?\n" | Where-Object { $_ -match "\S+\s+device$" } | ForEach-Object { ($_ -replace '\s+device$','').Trim() } | Select-Object -First 1)
if (-not $device) {
    Write-Output "No connected device found or multiple devices present; aborting adb steps. Devices listing:\n$devicesRaw"
} else {
    Write-Output "Using device: $device"
    $adbArgs = "$adb -s $device"

    Write-Output "Forcing stop of app..."
    & $adb -s $device shell am force-stop com.weejobs.app
    Start-Sleep -Seconds 1

    Write-Output "Launching app (waiting for completion)..."
    & $adb -s $device shell am start -W -n com.weejobs.app/.MainActivity
    Start-Sleep -Seconds 3

    Write-Output "Capturing logcat to tmp_cold_start_logcat.txt..."
    & $adb -s $device logcat -d -v time > (Join-Path $repoRoot 'tmp_cold_start_logcat.txt')
    Write-Output "Pulled logcat to tmp_cold_start_logcat.txt"

    Write-Output "Attempting to pull inspector JSON from /sdcard/Download/..."
    & $adb -s $device pull /sdcard/Download/expo-router-inspect-all.json (Join-Path $repoRoot 'expo-router-inspect-all.json')
    if ($LASTEXITCODE -ne 0) {
        Write-Output "no inspector file"
    } else {
        Write-Output "pulled inspector file"
    }

    Write-Output "Determining installed APK path (pm path)..."
    $pkg = (& $adb -s $device shell pm path com.weejobs.app)
    $pkg = $pkg.Trim()
    if ($pkg -like 'package:*') {
        $apkPath = $pkg.Substring(8)
        Write-Output "Pulling APK from $apkPath to pulled_base.apk..."
        & $adb -s $device pull $apkPath (Join-Path $repoRoot 'pulled_base.apk')
        if ($LASTEXITCODE -ne 0) {
            Write-Output "failed to pull apk"
        } else {
            Write-Output "pulled apk to pulled_base.apk"
        }
    } else {
        Write-Output "couldn't determine apk path: $pkg"
    }
}
