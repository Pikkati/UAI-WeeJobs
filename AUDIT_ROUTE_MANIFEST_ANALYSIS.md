Route Manifest Analysis — 2026-03-30

Summary
- Objective: Determine whether the expo-router routes manifest / fallback was present at runtime and why the app logged `No routes found`.

Key findings
- Workspace bundle: `android/app/src/main/assets/index.android.bundle` contains an ASCII header "Auto-generated fallback route keys for expo-router" (see top of file).
- Pulled APK: `pulled_apk/assets/index.android.bundle` is compiled/bytecode (Hermes) and not easily readable; an unminified JS variant `pulled_apk/assets/index.android.bundle.bak` contains expo-router route code (e.g., `getRoutes`, `+not-found`, `Navigator.js`).
- Search: no literal fallback header or `routes_manifest_seen` token was found as plain text in the pulled APK assets (release bundle appears compiled/minified).
- Runtime logs: app logged `expo-router-native: routes_manifest_seen.txt not found after waiting` and `Error: No routes found` — the runtime looked for a verification file and did not find it on `/sdcard` or internal files (run-as failed because the package is not debuggable).

Interpretation
- The release APK contains route code (readable in the `.bak` bundle) but the packaging/compilation (Hermes/minification) likely removes or compiles away the human-readable fallback header/manifest string that the runtime verification expects to find at runtime.
- The runtime expects a verification file (`routes_manifest_seen.txt`) or a readable manifest artifact; that file wasn't present on accessible storage and internal reads failed due to non-debuggable package, so runtime fails with "No routes found".

Recommended next steps
1. Rebuild an installable debug/developer APK (set `debuggable=true`) and re-run to allow `run-as` and to observe `routes_manifest_seen.txt` (fastest way to confirm the runtime verification artifact).
2. Alternatively, instrument the app or test device to copy the generated `routes_manifest_seen.txt` to `/sdcard/Download` after install/start to check the manifest contents without changing the build.
3. Confirm build pipeline: ensure expo-router plugin config and the bundling step correctly inject the fallback manifest into the final bundle or a readable asset for release builds (Hermes bytecode may require a different injection step).
4. If you want, I can produce a full report with embedded log excerpts and bundle snippets; or re-run with a debuggable build now.

Artifacts referenced
- Workspace bundle (header): [android/app/src/main/assets/index.android.bundle](android/app/src/main/assets/index.android.bundle#L1-L8)
- Pulled APK textual bundle: [pulled_apk/assets/index.android.bundle.bak](pulled_apk/assets/index.android.bundle.bak#L832-L840)
- Pulled APK binary bundle: [pulled_apk/assets/index.android.bundle](pulled_apk/assets/index.android.bundle)

Status
- I updated the TODO list and created this analysis file. Next: proceed with whichever remediation you prefer (create debug build and re-run, or I can draft a full report now).