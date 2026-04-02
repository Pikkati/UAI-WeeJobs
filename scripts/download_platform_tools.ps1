if (-not (Test-Path .\android-sdk)) { New-Item -ItemType Directory -Path .\android-sdk | Out-Null }
$zip = Join-Path (Resolve-Path .\android-sdk).Path 'platform-tools.zip'
$url = 'https://dl.google.com/android/repository/platform-tools-latest-windows.zip'
Write-Host "Downloading from: $url"
try {
  Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing -ErrorAction Stop
  Expand-Archive -LiteralPath $zip -DestinationPath .\android-sdk -Force
  Write-Host 'DOWNLOAD_OK'
} catch {
  Write-Host "DOWNLOAD_FAILED: $($_.Exception.Message)"
  exit 2
}
