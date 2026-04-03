Draft PR: Fix Promise overload compatibility in expo-modules-core

Summary

This PR makes `expo-modules-core` resilient to changes in the React Native `com.facebook.react.bridge.Promise` overloads by implementing a broad set of overloads in `Promise.toBridgePromise()` and ensuring `KPromiseWrapper` forwards a non-null code when required.

Files changed (proposed)
- packages/expo-modules-core/android/src/main/java/expo/modules/kotlin/Promise.kt
- packages/expo-modules-core/android/src/main/java/expo/modules/kotlin/KPromiseWrapper.kt
- packages/expo-modules-core/android/src/test/java/expo/modules/kotlin/PromiseToBridgePromiseTest.kt (unit test)

Rationale

RN has introduced and removed various Promise.reject overloads across versions. When the installed RN variant does not expose the exact overload expected by `expo-modules-core`, Kotlin compilation errors like "'reject' overrides nothing" or signature mismatches occur. Implementing the broad set of overloads and guarding against nullable codes avoids these compile-time failures and improves compatibility across RN versions.

What this fixes

- Kotlin "overrides nothing" errors during library compilation when RN Promise signatures vary
- Runtime mismatches where `bridgePromise.reject` required a non-null code

Testing

Included a JVM unit test `PromiseToBridgePromiseTest` that asserts calling the produced bridge promise will forward code, message, and throwable to the underlying expo Promise.

How to apply

Create a new branch in the `expo` monorepo and apply the attached diffs. Run the `expo-modules-core` Android unit tests and a full Android assemble to ensure nothing else regresses.

Notes

I did not include app-specific reflection in the upstream PR — that remains a local compatibility shim in this repo (under `android/app/BridgePromiseAdapter`) so local development can opt into a repo-tracked adapter without upstream changes.

Patch files are available in this repo under `patches/upstream-expo-*.patch`.
