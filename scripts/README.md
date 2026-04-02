# Pull inspector JSON helper scripts

This folder contains helpers to pull the `expo-router-inspect-all.json` file produced by the on-device inspector instrumentation.

Files
- `pull_inspector_json.ps1` — PowerShell script (Windows). Tries common locations then `run-as` as a fallback.
- `pull_inspector_json.sh` — POSIX shell script for macOS / Linux / Windows (WSL / Git Bash). Similar behavior.

Usage examples

PowerShell (Windows):
```powershell
.\scripts\pull_inspector_json.ps1 -Serial RFCT71GH14H -Out ..\expo-router-inspect-all-from-device.json
```

Bash (macOS / Linux / WSL):
```bash
./scripts/pull_inspector_json.sh -s RFCT71GH14H -o ../expo-router-inspect-all-from-device.json
```

Notes
- `run-as` fallback requires the installed app to be debuggable; otherwise the script uses public/external paths.
- The scripts attempt these paths (in order): `/sdcard/Download/...` and the app external files dir under `/storage/emulated/0/Android/data/.../files/`.
- The PowerShell script was added earlier and supports Windows-specific SDK path discovery.

If you want CI automation to retrieve the JSON after an instrumentation run, tell me your CI provider and I can add a small workflow.
