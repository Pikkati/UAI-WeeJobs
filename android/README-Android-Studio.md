# Android Studio — Run & Debug Setup

Quick steps to open the native Android project and run/debug the app from Android Studio.

## Android Studio install location (Windows)

If you installed Android Studio using the default installer on Windows, the typical install location is:

```
C:\Program Files\Android\Android Studio
```

Add this path to your local notes or shortcuts if you need to open the IDE or reference the installation folder.

1. Open the project in Android Studio
   - In Android Studio choose **Open** and select the `android` folder inside the repo (`D:\MyProjectsUAI\weejobs\android`).

2. Verify Android SDK
   - Android Studio will use `local.properties` in this folder. It already points to:
     `C:/Users/Sosuk/AppData/Local/Android/Sdk`.

3. Use the provided Gradle run configuration
   - There's a Gradle run configuration named **InstallDebugAndRun** in `.idea/runConfigurations` that runs the top-level Gradle task `installDebugAndRun`.
   - Open the **Gradle** tool window (right side) and run the `installDebugAndRun` task, or use the Run/Debug dropdown to select the configuration.

4. What the Gradle task does
   - It depends on `:app:installDebug` so it will build and install the debug APK onto a connected emulator/device.
   - After install it prints the `adb` command to launch the main Activity:
     `adb shell am start -n com.weejobs.app/.MainActivity`

5. Debugging
   - After installing, use the Android Studio **Attach debugger to Android process** button to attach to the running app process, or start the app via the activity command and then attach.

6. If the Gradle build fails locally
   - This repository is an Expo-managed project; local native Gradle builds may fail due to Kotlin/plugin version mismatches (e.g., `expo-modules-core`/KSP). If the build fails, you have two options:
     - Fix local dependency versions (Kotlin/KSP/plugin updates) — can be time-consuming.
     - Use EAS (cloud) to produce an APK and download/install that APK to the emulator.

7. Fallback terminal commands
   - From `android` folder you can run these commands:

```powershell
./gradlew installDebug    # builds + installs debug APK (on Windows: .\gradlew.bat installDebug)
adb shell am start -n com.weejobs.app/.MainActivity
adb logcat              # view logs
```

If you want me to (A) continue fixing the local Gradle/Kotlin issues so this builds locally, or (B) configure and run an EAS cloud build to produce an APK, tell me which and I'll proceed.

## Use Android Studio Emulator & Debugger

1. Open Device Manager: Tools → Device Manager. Create or select an AVD (recommend a recent Pixel x86/x86_64 image) and Launch it. The emulator integrates ADB so Android Studio will automatically list it as a target device.

2. Run the provided configuration: select the `InstallDebugAndRun` run configuration (Run dropdown) and press Run (green arrow). This builds the debug APK and installs it to the selected emulator/device.

3. View logs: open the **Logcat** tool window. Select the emulator device and choose the `com.weejobs.app` process. Use the filter box to search for `expo-router` or `[index]` to see the injected startup messages.

4. Attach the debugger: use Run → Attach debugger to Android process (or the bug icon). Set Java/Kotlin breakpoints in native code or use JS debugging tools for React Native (Flipper/Hermes tools) if needed.

5. Inspect files on-device: open **Device File Explorer** (View → Tool Windows → Device File Explorer). Navigate to `/sdcard/Download/routes_manifest_seen.txt` or `/data/data/com.weejobs.app/files/routes_manifest_seen.txt` (the latter requires a debuggable build). You can also pull files via the integrated terminal with `adb` commands.

6. Troubleshooting:
   - If the emulator isn't shown, ensure **Android SDK Platform-Tools** are installed (Tools → SDK Manager → SDK Tools → Android SDK Platform-Tools).
   - If ADB connection is unstable, restart ADB from the terminal: `adb kill-server && adb start-server`, or restart the emulator.
   - Confirm the SDK path used by Android Studio matches `local.properties` (e.g., `C:/Users/Sosuk/AppData/Local/Android/Sdk`).

These steps let you use Android Studio's built-in ADB, Logcat, device file browser, and debugger to verify our runtime instrumentation and inspect files written by the app.

### Launch AVD from the repo

You can launch an emulator AVD directly from the repository with the included helper script.

Windows (PowerShell):

```powershell
.
\scripts\launch_avd.ps1 [AVD_NAME]
```

macOS/Linux:

```bash
./scripts/launch_avd.sh [AVD_NAME]
```

If you omit `[AVD_NAME]` the script will use the first AVD reported by the emulator. The script will try to locate the emulator binary using `ANDROID_SDK_ROOT` / `ANDROID_HOME` or the system PATH.

### Install ADB via winget (Windows)

If `adb` is not available on your PATH you can install the Android platform-tools using `winget` (Windows 10/11). Example:

```powershell
winget install --id Google.AndroidSDK.PlatformTools -e --accept-package-agreements --accept-source-agreements
# or, if not found, try:
winget install --id Android.AndroidSDK.PlatformTools -e --accept-package-agreements --accept-source-agreements
```

If `winget` is not available on your system, install it via Microsoft Store or use the Android SDK Manager inside Android Studio to install "Android SDK Platform-Tools".

