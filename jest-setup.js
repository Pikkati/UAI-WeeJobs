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
    if (!global.__TEST_USE_JOBS__) {
      global.__TEST_USE_JOBS__ = () => ({
        jobs: [],
        interests: [],
        loading: false,
        fetchJobs: async () => {},
        fetchInterests: async () => [],
        expressInterest: async () => false,
        closeApplications: async () => false,
        selectTradesman: async () => false,
        payDeposit: async () => ({ paymentIntent: '', ephemeralKey: '', customer: '', merchantDisplayName: '' }),
        markOnTheWay: async () => false,
        markArrived: async () => false,
        sendEstimate: async () => false,
        acknowledgeEstimate: async () => false,
        sendQuote: async () => false,
        approveQuote: async () => false,
        sendInvoice: async () => false,
        payInvoice: async () => ({ ok: false, id: '' }),
        payFinalBalance: async () => ({ ok: false, id: '' }),
        confirmCompletion: async () => false,
        cancelJob: async () => false,
        getNextActionsByRole: () => [],
        calculateDeposit: () => 20,
        refreshJobs: () => {},
      });
    }
    // Provide a minimal, safe __TEST_SUPABASE__ so modules that import the
    // supabase client during module evaluation see a stable object. Tests may
    // overwrite this per-file with richer behavior; having this default avoids
    // hoisting/import-order races.
    // Create an internal container and expose it as `global.__TEST_SUPABASE__`.
    // Tests often reassign `global.__TEST_SUPABASE__` at module scope which can
    // happen after imports (due to hoisting). To avoid identity/race issues we
    // expose a stable object and copy assigned values into it when tests
    // reassign, so modules that captured the original object see updates.
    if (typeof Object.getOwnPropertyDescriptor(global, '__TEST_SUPABASE__') === 'undefined') {
      const createChain = (singleResult = false) => {
        const promiseValue = singleResult ? { data: null, error: null } : { data: [], error: null };
        const q = {
          select: (..._args) => q,
          order: (..._args) => q,
          eq: (..._args) => q,
          neq: (..._args) => q,
          in: (..._args) => q,
          update: (..._args) => q,
          insert: (..._args) => q,
          single: async () => ({ data: null, error: null }),
          then: (onFulfilled, onRejected) => Promise.resolve(promiseValue).then(onFulfilled, onRejected),
          catch: (onRejected) => Promise.resolve(promiseValue).catch(onRejected),
        };
        return q;
      };

      const __TEST_SUPABASE_INTERNAL = {
        auth: {
          signUp: async (_opts) => ({ data: { user: null }, error: null }),
          signInWithPassword: async (_opts) => ({ data: null, error: { message: 'not_authenticated' } }),
          signOut: async () => ({ error: null }),
          resetPasswordForEmail: async () => ({ error: null }),
        },
        from: (_table) => createChain(false),
        functions: { invoke: async () => ({ data: null, error: null }) },
      };

      Object.defineProperty(global, '__TEST_SUPABASE__', {
        configurable: true,
        enumerable: true,
        get() {
          return __TEST_SUPABASE_INTERNAL;
        },
        set(val) {
          if (val && typeof val === 'object') {
            // Remove existing keys and copy new ones so identity stays stable
            Object.keys(__TEST_SUPABASE_INTERNAL).forEach((k) => delete __TEST_SUPABASE_INTERNAL[k]);
            Object.assign(__TEST_SUPABASE_INTERNAL, val);
          } else {
            // Non-object assignment: replace the internal reference
            // (rare in tests) — define directly for simplicity.
            Object.defineProperty(global, '__TEST_SUPABASE__', {
              configurable: true,
              enumerable: true,
              writable: true,
              value: val,
            });
          }
        },
      });
    }
    // Tests may override `global.__TEST_JOBS_CACHE__` to provide a synchronous
    // cache for JobsProvider. Do not set a default here to avoid surprising
    // other tests that expect an empty cache.
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
  }
} catch (err) {
  // ignore test fallback setup errors
// Inform React's testing utils that we are running in an environment
// where `act` should be enabled. This reduces noisy act() warnings.
try {
  if (typeof globalThis !== 'undefined') {
    // eslint-disable-next-line no-undef
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  }
} catch (e) {
  // ignore in weird CI envs
>>>>>>> 5b2d6a4 (test: add chainable supabase mock, Expo mocks, smoke harness, and test setup tweaks)
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

// Suppress noisy react-test-renderer deprecation warning during tests by
// filtering the specific message. Set WEEJOBS_DEBUG=true to re-enable all logs.
try {
  if (typeof process !== 'undefined' && process.env && process.env.JEST_WORKER_ID) {
    const _origConsoleError = console.error;
    console.error = (...args) => {
      try {
        if (args && args.length && typeof args[0] === 'string' && args[0].includes('react-test-renderer is deprecated')) {
          return;
        }
      } catch (e) {
        // ignore filter errors
      }
      _origConsoleError.apply(console, args);
    };
  }
} catch (e) {
  // ignore
}
