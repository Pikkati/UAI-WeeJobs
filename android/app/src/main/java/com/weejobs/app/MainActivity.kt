package com.weejobs.app
import expo.modules.splashscreen.SplashScreenManager

import android.os.Build
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import java.io.File
import kotlin.concurrent.thread

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    // setTheme(R.style.AppTheme)
    // @generated begin expo-splashscreen - expo prebuild (DO NOT MODIFY) sync-f3ff59a738c56c9a6119210cb55f0b613eb8b6af
    SplashScreenManager.registerOnActivity(this)
    // @generated end expo-splashscreen
    super.onCreate(null)
    // Immediate native check: log existence of the artifacts written by JS
    try {
      val sdFileImmediate = File("/sdcard/Download/routes_manifest_seen.txt")
      val appFileImmediate = File(filesDir, "routes_manifest_seen.txt")
      Log.e("expo-router-native", "MainActivity.onCreate immediate: sdExists=${sdFileImmediate.exists()} appExists=${appFileImmediate.exists()}")
    } catch (e: Exception) {
      Log.e("expo-router-native", "MainActivity immediate check failed", e)
    }

    // For debugging on AVD: write a small marker file into app internal storage so native verification can find it.
    if (BuildConfig.DEBUG) {
        try {
        val dbgFile = File(filesDir, "routes_manifest_seen.txt")
        val payload = "{\"nativeDebug\":true,\"ts\":${System.currentTimeMillis()}}"
        dbgFile.writeText(payload)
        Log.e("expo-router-native", "Wrote debug routes_manifest_seen in app files: $payload")
      } catch (e: Exception) {
        Log.e("expo-router-native", "error writing debug routes_manifest_seen", e)
      }
    }

    // Native verification: poll for the file written by JS to confirm routes manifest was seen.
    try {
      thread {
        try {
          val sdCardPath = "/sdcard/Download/routes_manifest_seen.txt"
          val appFile = File(filesDir, "routes_manifest_seen.txt")
          var found = false
          val attempts = 6
          for (i in 0 until attempts) {
            if (File(sdCardPath).exists()) {
              val txt = File(sdCardPath).readText()
              Log.e("expo-router-native", "Found routes_manifest_seen on sdcard: $txt")
              found = true
              break
            }
            if (appFile.exists()) {
              val txt = appFile.readText()
              Log.e("expo-router-native", "Found routes_manifest_seen in app files: $txt")
              found = true
              break
            }
            Thread.sleep(1000)
          }
          if (!found) {
            Log.e("expo-router-native", "routes_manifest_seen.txt not found after waiting")
          }
        } catch (e: Exception) {
          Log.e("expo-router-native", "error checking routes_manifest_seen", e)
        }
      }
    } catch (_: Throwable) {
      // ignore
    }

    // Try to copy inspector JSON from internal files to external app files and public Download (best-effort)
    try {
      thread {
        try {
          val src = File(filesDir, "expo-router-inspect-all.json")
          if (src.exists()) {
            val extDir = getExternalFilesDir(null)
            if (extDir != null) {
              val dst = File(extDir, "expo-router-inspect-all.json")
              try {
                src.copyTo(dst, overwrite = true)
                Log.e("expo-router-native", "Copied inspector JSON to external app files: ${dst.absolutePath}")
                if (BuildConfig.DEBUG) {
                  try {
                    this@MainActivity.runOnUiThread {
                      Toast.makeText(this@MainActivity, "Inspector JSON copied to external app files", Toast.LENGTH_LONG).show()
                    }
                  } catch (_: Throwable) {}
                }
              } catch (e: Exception) {
                Log.e("expo-router-native", "Failed copying to external app files", e)
              }
            } else {
              Log.e("expo-router-native", "getExternalFilesDir returned null")
            }
            // Best-effort copy to public Downloads
            try {
              val pub = File("/sdcard/Download/expo-router-inspect-all.json")
              src.copyTo(pub, overwrite = true)
              Log.e("expo-router-native", "Copied inspector JSON to /sdcard/Download: ${pub.absolutePath}")
              if (BuildConfig.DEBUG) {
                try {
                  this@MainActivity.runOnUiThread {
                    Toast.makeText(this@MainActivity, "Inspector JSON copied to /sdcard/Download", Toast.LENGTH_LONG).show()
                  }
                } catch (_: Throwable) {}
              }
            } catch (e: Exception) {
              Log.e("expo-router-native", "Failed copying to /sdcard/Download", e)
            }
          } else {
            Log.e("expo-router-native", "Inspector JSON not present in internal files to copy: ${src.absolutePath}")
          }
        } catch (e: Exception) {
          Log.e("expo-router-native", "error copying inspector JSON", e)
        }
      }
    } catch (_: Throwable) {
      // ignore
    }

  }
  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
          if (!moveTaskToBack(false)) {
              // For non-root activities, use the default implementation to finish them.
              super.invokeDefaultOnBackPressed()
          }
          return
      }

      // Use the default back button implementation on Android S
      // because it's doing more than [Activity.moveTaskToBack] in fact.
      super.invokeDefaultOnBackPressed()
  }
}
