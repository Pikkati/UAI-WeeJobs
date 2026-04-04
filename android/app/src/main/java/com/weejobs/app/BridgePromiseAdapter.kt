package com.weejobs.app

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import expo.modules.kotlin.Promise as ExpoPromise

/**
 * Adapter that implements React Native's Promise and delegates to the Expo Promise interface.
 * This is loaded reflectively by the patched expo-modules-core Promise.toBridgePromise() so
 * we can keep compatibility without editing upstream code every time.
 */
class BridgePromiseAdapter(private val expoPromise: ExpoPromise) : Promise {
  override fun resolve(value: Any?) {
    expoPromise.resolve(value)
  }
  // Implement Promise.reject overloads expected by the current RN interface
  override fun reject(code: String?, message: String?) {
    expoPromise.reject(code ?: "UnknownCode", message, null)
  }

  override fun reject(code: String?, throwable: Throwable?) {
    expoPromise.reject(code ?: "UnknownCode", null, throwable)
  }

  override fun reject(code: String?, message: String?, throwable: Throwable?) {
    expoPromise.reject(code ?: "UnknownCode", message, throwable)
  }

  override fun reject(code: String?, userInfo: WritableMap) {
    // userInfo is not used by Expo Promise; preserve code/message mapping
    expoPromise.reject(code ?: "UnknownCode", null, null)
  }

  override fun reject(code: String?, throwable: Throwable?, userInfo: WritableMap) {
    expoPromise.reject(code ?: "UnknownCode", null, throwable)
  }

  override fun reject(code: String?, message: String?, userInfo: WritableMap) {
    expoPromise.reject(code ?: "UnknownCode", message, null)
  }

  override fun reject(throwable: Throwable) {
    expoPromise.reject("UnknownCode", null, throwable)
  }

  override fun reject(throwable: Throwable, userInfo: WritableMap) {
    expoPromise.reject("UnknownCode", null, throwable)
  }

  override fun reject(code: String?, message: String?, throwable: Throwable?, userInfo: WritableMap?) {
    expoPromise.reject(code ?: "UnknownCode", message, throwable)
  }

  @Deprecated("Prefer passing a module-specific error code to JS. Using this method will pass the error code EUNSPECIFIED")
  override fun reject(message: String) {
    expoPromise.reject("EUNSPECIFIED", message, null)
  }
}
