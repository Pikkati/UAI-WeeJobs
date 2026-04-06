package com.weejobs.app

import expo.modules.kotlin.jni.UnifiedPromise

// Use Map<String, Any>? for userInfo, matching UnifiedPromise interface

/**
 * Adapter that implements React Native's Promise and delegates to the UnifiedPromise interface.
 */
class BridgePromiseAdapter(private val expoPromise: UnifiedPromise) : UnifiedPromise {
    override fun resolve(value: Any?) {
        expoPromise.resolve(value)
    }

    override fun reject(code: String?, message: String?, cause: Throwable?) {
        expoPromise.reject(code, message, cause)
    }

    override fun reject(code: String?, throwable: Throwable?) {
        expoPromise.reject(code, throwable)
    }

    override fun reject(throwable: Throwable, userInfo: Map<String, Any>?) {
        expoPromise.reject(throwable, userInfo)
    }

    override fun reject(code: String?, userInfo: Map<String, Any>?) {
        expoPromise.reject(code, userInfo)
    }

    override fun reject(code: String?, throwable: Throwable?, userInfo: Map<String, Any>?) {
        expoPromise.reject(code, throwable, userInfo)
    }

    override fun reject(code: String?, message: String?, userInfo: Map<String, Any>?) {
        expoPromise.reject(code, message, userInfo)
    }

    override fun reject(code: String?, message: String?, throwable: Throwable?, userInfo: Map<String, Any>?) {
        expoPromise.reject(code, message, throwable, userInfo)
    }
}
