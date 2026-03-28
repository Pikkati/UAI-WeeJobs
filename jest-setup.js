// Basic Jest setup: polyfills and harmless globals used by some Expo internals
if (typeof global.TextDecoderStream === 'undefined') {
  // Minimal stub to satisfy modules that access TextDecoderStream during initialization
  global.TextDecoderStream = function TextDecoderStream() {};
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder;
}

// Ensure `global.window` exists and is configurable so upstream setup can redefine safely.
try {
  if (typeof global.window === 'undefined') {
    Object.defineProperty(global, 'window', {
      value: {},
      configurable: true,
      writable: true,
      enumerable: true,
    });
  }
} catch (err) {
  // If we cannot define it (non-configurable), ignore and let upstream handle it.
}

// Inform React's testing utils that we are running in an environment
// where `act` should be enabled. This reduces noisy act() warnings.
try {
  if (typeof globalThis !== 'undefined') {
    // eslint-disable-next-line no-undef
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  }
} catch (e) {
  // ignore in weird CI envs
}

// Ensure `StyleSheet.create` is safe to call during module initialization in tests.
// Some environments run module-eval before our mocks are fully applied; this
// wrapper makes `StyleSheet.create` a no-op fallback when it would throw.
try {
  const rn = require('react-native');
  if (rn) {
    rn.StyleSheet = rn.StyleSheet || {};
    const orig = rn.StyleSheet.create;
    if (typeof orig === 'function') {
      rn.StyleSheet.create = (styles) => {
        try {
          return orig(styles);
        } catch (err) {
          return styles;
        }
      };
    } else {
      rn.StyleSheet.create = rn.StyleSheet.create || ((s) => s);
    }
    rn.StyleSheet.flatten = rn.StyleSheet.flatten || ((s) => s);
    rn.StyleSheet.absoluteFillObject = rn.StyleSheet.absoluteFillObject || { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 };
  }
} catch (e) {
  // ignore; best-effort shim for testing environments
}

// No process.env manipulation here; tests that need env vars should set them explicitly.
