$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
Push-Location (Resolve-Path (Join-Path $scriptRoot ".."))
$env:ANDROID_SDK_ROOT = (Resolve-Path .\android-sdk).Path
Write-Host "ANDROID_SDK_ROOT=$env:ANDROID_SDK_ROOT"
Write-Host "Running npm run verify:android..."
npm run verify:android
Pop-Location
