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

// No process.env manipulation here; tests that need env vars should set them explicitly.
