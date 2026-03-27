$ErrorActionPreference = 'Stop'
Write-Output "Fetching latest act release metadata..."
$r = Invoke-RestMethod -Uri 'https://api.github.com/repos/nektos/act/releases/latest' -UseBasicParsing
$asset = $r.assets | Where-Object { $_.name -match 'windows' } | Select-Object -First 1
if (-not $asset) { $asset = $r.assets[0] }
$out = Join-Path (Get-Location) '.bin'
New-Item -ItemType Directory -Force -Path $out | Out-Null
$zip = Join-Path $out $asset.name
Write-Output "Downloading $($asset.name) ..."
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zip -UseBasicParsing
Write-Output "Extracting to $out ..."
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($zip,$out)
Write-Output "Done. Files:"
Get-ChildItem $out -Recurse | Select-Object FullName
