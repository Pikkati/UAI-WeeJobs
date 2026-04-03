<#
Attempts to install Android Platform-Tools via winget if available, then runs the repo verification.
Run from the repository root or let the script resolve the repo root.
#>
Set-StrictMode -Off
param(
  [string]$AvdName = ""
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
Set-Location $repoRoot

Write-Host "[install_and_verify] repoRoot = $repoRoot"

function Try-Run([scriptblock]$b) {
  try { & $b; return $true } catch { Write-Host "[install_and_verify] command failed: $_"; return $false }
}

Write-Host "[install_and_verify] Checking for winget..."
$winget = Get-Command winget -ErrorAction SilentlyContinue
if ($winget) { Write-Host "[install_and_verify] winget found at $($winget.Source)" } else { Write-Host "[install_and_verify] winget not found" }

Write-Host "[install_and_verify] Checking for adb..."
$adbCmd = Get-Command adb -ErrorAction SilentlyContinue
if ($adbCmd) { Write-Host "[install_and_verify] adb already available at $($adbCmd.Source)" }
else {
  if ($winget) {
    Write-Host "[install_and_verify] Attempting winget install of Android Platform-Tools (may prompt for elevation)..."
    $installed = $false
    try {
      winget install --id Google.AndroidSDK.PlatformTools -e --accept-package-agreements --accept-source-agreements
      $installed = $true
    } catch {
      Write-Host "[install_and_verify] primary winget id failed, trying alternative id..."
      try { winget install --id Android.AndroidSDK.PlatformTools -e --accept-package-agreements --accept-source-agreements; $installed = $true } catch { Write-Host "[install_and_verify] winget install attempts failed: $_" }
    }
    if ($installed) { Write-Host "[install_and_verify] winget install finished; refreshing command discovery..." }
  } else {
    Write-Host "[install_and_verify] winget not present; skipping winget install.";
  }

  # look for platform-tools in common SDK paths
  $possible = @(
    "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe",
    "$env:ProgramFiles\Android\Android Studio\platform-tools\adb.exe",
    "$env:ANDROID_SDK_ROOT\platform-tools\adb.exe",
    "$env:ANDROID_HOME\platform-tools\adb.exe"
  )
  foreach ($p in $possible) {
    if ([string]::IsNullOrEmpty($p)) { continue }
    if (Test-Path $p) { Write-Host "[install_and_verify] Found adb at $p"; $env:Path = $env:Path + ";" + (Split-Path $p); break }
  }

}

# Re-evaluate adb availability
$adbCmd = Get-Command adb -ErrorAction SilentlyContinue
if (-not $adbCmd) {
  Write-Host "[install_and_verify] adb not found after attempts. Aborting verify run."
  exit 2
}

Write-Host "[install_and_verify] adb available at $($adbCmd.Source)"

Write-Host "[install_and_verify] Running npm run verify:android (this will build+install+start+collect logs)..."
Try-Run { npm run verify:android }

Write-Host "[install_and_verify] done"
