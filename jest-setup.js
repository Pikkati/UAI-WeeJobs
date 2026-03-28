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

// Guard against native Text defaultProps missing in some test environments
try {
  // eslint-disable-next-line global-require
  const { Text } = require('react-native');
  if (Text && Text.defaultProps == null) {
    Text.defaultProps = Object.assign({}, Text.defaultProps, { allowFontScaling: false });
  }
} catch (e) {
  // ignore if react-native isn't available at setup time
}

// Provide a minimal test-only fallback for `useAuth()` when modules import it
// outside of an AuthProvider due to module cache or test isolation order.
try {
  if (typeof process !== 'undefined' && process.env.JEST_WORKER_ID) {
      if (!global.__TEST_USE_AUTH__) {
        global.__TEST_USE_AUTH__ = () => ({
        user: { id: 'u1', email: 'test@example.com', name: 'Test User', role: 'customer' },
        isLoading: false,
        hasSeenOnboarding: false,
        login: async () => ({ success: false }),
        signup: async () => ({ success: false }),
        sendPasswordReset: async () => ({ success: true }),
        logout: async () => {},
        resendVerification: async () => ({ success: false }),
        setHasSeenOnboarding: async () => {},
        refreshUser: async () => {},
      });
    }
  }
} catch (err) {
  // ignore test fallback setup errors
}

// No process.env manipulation here; tests that need env vars should set them explicitly.
