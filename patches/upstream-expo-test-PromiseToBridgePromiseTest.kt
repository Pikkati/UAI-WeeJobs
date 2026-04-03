// Proposed unit test for upstream PR - place under expo-modules-core/android/src/test/java/expo/modules/kotlin/
package expo.modules.kotlin

import org.junit.Assert.assertEquals
import org.junit.Test

class FakeExpoPromise : Promise {
  var lastRejectCode: String? = null
  var lastRejectMessage: String? = null
  var lastRejectThrowable: Throwable? = null
  var resolvedValue: Any? = null

  override fun resolve(value: Any?) {
    resolvedValue = value
  }

  override fun reject(code: String?, message: String?, cause: Throwable?) {
    lastRejectCode = code
    lastRejectMessage = message
    lastRejectThrowable = cause
  }
}

class PromiseToBridgePromiseTest {
  @Test
  fun `bridge promise reject calls expo reject with code message throwable`() {
    val fake = FakeExpoPromise()
    val bridge = fake.toBridgePromise()

    val ex = RuntimeException("boom")
    bridge.reject("ERR", "msg", ex)

    assertEquals("ERR", fake.lastRejectCode)
    assertEquals("msg", fake.lastRejectMessage)
    assertEquals(ex, fake.lastRejectThrowable)
  }
}
