What changed

During local debugging the Android build failed due to a mismatch between the React Native `Promise` overloads and the `expo-modules-core` bridge implementation. To get a clean build quickly we made a minimal compatibility adjustment to `expo-modules-core` in `node_modules` (Promise overloads + wrapper), and made `MainActivity` register the splashscreen reflectively so the build doesn't require the splash module at compile-time.

Why a patch file

Direct edits in `node_modules` are fragile. This repository includes a patch file so the changes are reproducible and can be applied automatically after `npm install`/`yarn` using `git apply` or `patch-package`.

Files touched (node_modules)

- android/src/main/java/expo/modules/kotlin/Promise.kt
- android/src/main/java/expo/modules/kotlin/KPromiseWrapper.kt

Local project changes

- android/app/src/main/java/com/weejobs/app/MainActivity.kt (reflective splashscreen registration)
- android/printSdk.gradle (debugging helper)
- android/local.properties (path normalization)

How to apply the patch (recommended)

Option A: Use git to apply the prepared patch file (if you're committing it to repo):

```bash
# from repo root
git apply patches/expo-modules-core+55.0.18.patch
```

Option B: Use patch-package (recommended for npm/yarn workflows):

- Install patch-package as a devDependency and store the patch under `patches/` (name must match package@version format).
- Run `npx patch-package` to generate/apply patches after `npm install`.

Reverting the changes

If you want to revert the node_modules edits, run:

```bash
# from repo root
# remove patched files and reinstall
rm -rf node_modules/expo-modules-core/android/src/main/java/expo/modules/kotlin/*.kt
npm ci
```

Notes and next steps

- The node_modules edits should be upstreamed to `expo` (create PR) or replaced by a proper compatibility shim in a maintained module.
- As a safer long-term fix, consider pinning `expo-modules-core` to a version compatible with your React Native version, or bump RN/Expo to aligned versions.

Contact

If you want I can: create a proper patch-package patch, prepare a PR against upstream `expo`, or implement an in-app compatibility shim and revert node_modules edits. Tell me which you prefer and I'll proceed.
