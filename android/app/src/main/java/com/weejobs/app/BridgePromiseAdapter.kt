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

  override fun reject(code: String, message: String?) {
    expoPromise.reject(code, message, null)
  }

  override fun reject(code: String, throwable: Throwable?) {
    expoPromise.reject(code, null, throwable)
  }

  override fun reject(code: String, message: String?, throwable: Throwable?) {
    expoPromise.reject(code, message, throwable)
  }

  override fun reject(throwable: Throwable) {
    expoPromise.reject("UnknownCode", null, throwable)
  }

  override fun reject(throwable: Throwable, userInfo: WritableMap) {
    expoPromise.reject("UnknownCode", null, throwable)
  }

  override fun reject(code: String, userInfo: WritableMap) {
    expoPromise.reject(code, null, null)
  }

  override fun reject(code: String, throwable: Throwable?, userInfo: WritableMap) {
    expoPromise.reject(code, null, throwable)
  }

  override fun reject(code: String, message: String?, userInfo: WritableMap) {
    expoPromise.reject(code, message, null)
  }

  // Newer RN overloads include nullable code and userInfo parameters; implement them
  override fun reject(code: String?, message: String?, throwable: Throwable?, userInfo: WritableMap?) {
    expoPromise.reject(code ?: "UnknownCode", message, throwable)
  }

  @Deprecated("Use reject(code, message, throwable) instead")
  override fun reject(message: String) {
    expoPromise.reject("UnknownCode", message, null)
  }
}
