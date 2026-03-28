# Android Studio — Run & Debug Setup

Quick steps to open the native Android project and run/debug the app from Android Studio.

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
