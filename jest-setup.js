global.__fbBatchedBridgeConfig = {};
console.log('Mocked __fbBatchedBridgeConfig at the top of jest-setup.js');

global.__DEV__ = true;
console.log('jest-setup.js: File loaded');

console.log('Jest setup file loaded');

const mockReactNative = jest.requireActual('react-native');

jest.mock('react-native', () => {
  const actualReactNative = jest.requireActual('react-native');
  console.log('Mocking NativeModules and additional internals - Step 5');
  return {
    ...actualReactNative,
    NativeModules: {
      ...actualReactNative.NativeModules,
      UIManager: {},
      PlatformConstants: { forceTouchAvailable: false },
      AccessibilityInfo: {},
      DeviceInfo: { getDeviceName: jest.fn(() => 'Test Device') },
      Networking: { fetch: jest.fn() },
      TurboModuleRegistry: {},
    },
  };
});

console.log('Mocked NativeModules:', jest.requireMock('react-native').NativeModules);

// Basic Jest setup: polyfills and harmless globals used by some Expo internals
if (typeof global.TextDecoderStream === 'undefined') {
  // Minimal stub to satisfy modules that access TextDecoderStream during initialization
  global.TextDecoderStream = function TextDecoderStream() {};
}

// Provide minimal `globalThis.expo` shape required by newer `jest-expo` presets
try {
  if (typeof globalThis !== 'undefined') {
    if (!globalThis.expo) globalThis.expo = {};
    if (!globalThis.expo.EventEmitter) {
      // Node's EventEmitter is compatible for tests that only need the constructor
      // eslint-disable-next-line global-require
      const { EventEmitter } = require('events');
      globalThis.expo.EventEmitter = EventEmitter;
    }
  }
} catch (e) {
  // ignore environment/shim failures
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
} catch {
  // If we cannot define it (non-configurable), ignore and let upstream handle it.
}

// Guard against native Text defaultProps missing in some test environments
try {
  // eslint-disable-next-line global-require
  const { Text } = require('react-native');
  if (Text && Text.defaultProps == null) {
    Text.defaultProps = Object.assign({}, Text.defaultProps, { allowFontScaling: false });
  }
} catch {
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
      // Allow tests to seed predictable responses for table queries via
      // `global.__TEST_SUPABASE__.setResponse(table, data)`. This makes
      // top-level module fetches predictable without requiring large
      // per-test mocks.
      const __TEST_SUPABASE_RESPONSES = {};

      const createChain = (table = null, singleResult = false) => {
        const respPresent = table && Object.prototype.hasOwnProperty.call(__TEST_SUPABASE_RESPONSES, table);
        const resp = respPresent ? __TEST_SUPABASE_RESPONSES[table] : undefined;

        let promiseValue;
        if (singleResult) {
          const data = resp !== undefined ? (Array.isArray(resp) ? (resp.length > 0 ? resp[0] : null) : resp) : null;
          promiseValue = { data, error: null };
        } else {
          const data = resp !== undefined ? (Array.isArray(resp) ? resp : [resp]) : [];
          promiseValue = { data, error: null };
        }

        const q = {
          select: (..._args) => q,
          order: (..._args) => q,
          eq: (..._args) => q,
          neq: (..._args) => q,
          in: (..._args) => q,
          update: (..._args) => q,
          insert: (..._args) => q,
          delete: (..._args) => q,
          single: async () => (singleResult ? promiseValue : (Array.isArray(promiseValue.data) ? { data: promiseValue.data[0] || null, error: null } : promiseValue)),
          then: (onFulfilled, onRejected) => Promise.resolve(promiseValue).then(onFulfilled, onRejected),
          catch: (onRejected) => Promise.resolve(promiseValue).catch(onRejected),
        };
        return q;
      };

      const __TEST_SUPABASE_INTERNAL = {
        __responses__: __TEST_SUPABASE_RESPONSES,
        setResponse: (table, data) => { __TEST_SUPABASE_RESPONSES[table] = data; },
        clearResponses: () => { Object.keys(__TEST_SUPABASE_RESPONSES).forEach((k) => delete __TEST_SUPABASE_RESPONSES[k]); },
        auth: {
          signUp: async (_opts) => ({ data: { user: null }, error: null }),
          signInWithPassword: async (_opts) => ({ data: null, error: { message: 'not_authenticated' } }),
          signOut: async () => ({ error: null }),
          resetPasswordForEmail: async () => ({ error: null }),
        },
        from: (_table) => createChain(_table, false),
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
            // Merge incoming keys into the internal container to preserve
            // default helpers (like `.from`) while allowing tests to override
            // specific pieces. This avoids TypeErrors when tests provide a
            // partial mock that doesn't include all expected methods.
            Object.keys(val).forEach((k) => {
              try {
                __TEST_SUPABASE_INTERNAL[k] = val[k];
              } catch {
                // ignore non-writable properties
              }
            });

            // Ensure critical APIs exist so modules that imported the
            // original container during module-eval keep working.
            if (typeof __TEST_SUPABASE_INTERNAL.from !== 'function') {
              __TEST_SUPABASE_INTERNAL.from = (_table) => createChain(false);
            }
            if (!__TEST_SUPABASE_INTERNAL.functions) {
              __TEST_SUPABASE_INTERNAL.functions = { invoke: async () => ({ data: null, error: null }) };
            }
            if (!__TEST_SUPABASE_INTERNAL.auth) {
              __TEST_SUPABASE_INTERNAL.auth = {
                signUp: async (_opts) => ({ data: { user: null }, error: null }),
                signInWithPassword: async (_opts) => ({ data: null, error: { message: 'not_authenticated' } }),
                signOut: async () => ({ error: null }),
                resetPasswordForEmail: async () => ({ error: null }),
              };
            }
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
    } catch {
      // ignore in weird CI envs
    }
  }
  } catch {
  // ignore test fallback setup errors
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
        } catch {
          return styles;
        }
      };
    } else {
      rn.StyleSheet.create = rn.StyleSheet.create || ((s) => s);
    }
    rn.StyleSheet.flatten = rn.StyleSheet.flatten || ((s) => s);
    rn.StyleSheet.absoluteFillObject = rn.StyleSheet.absoluteFillObject || { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 };
  }
} catch {
  // ignore; best-effort shim for testing environments
}

// No process.env manipulation here; tests that need env vars should set them explicitly.

// Suppress noisy react-test-renderer deprecation warning during tests by
// filtering the specific message. Set WEEJOBS_DEBUG=true to re-enable all logs.
try {
  if (typeof process !== 'undefined' && process.env && process.env.JEST_WORKER_ID) {
    const _origConsoleError = console.error;
    try {
      // Expose the original console.error so tests can forward to it
      // when they want to suppress or filter messages via the
      // `__TEST_CONSOLE_ERROR_HANDLER__` hook.
      // eslint-disable-next-line no-undef
      if (typeof global !== 'undefined') (global).__JEST_ORIG_CONSOLE_ERROR__ = _origConsoleError;
    } catch {
      // ignore
    }
    // Expose a hook for tests to override how console.error is handled.
    // Some tests suppress specific warnings (e.g., act() warnings). Tests
    // can set `global.__TEST_CONSOLE_ERROR_HANDLER__ = (...args) => {}`
    // to intercept and optionally filter messages. By default we call the
    // original console.error implementation.
    console.error = (...args) => {
      const firstArgIncludes = (needle) => {
        try {
          const a0 = args && args[0];
          if (typeof a0 === 'string') return a0.includes(needle);
          if (a0 && typeof a0.message === 'string') return a0.message.includes(needle);
        } catch {
          // ignore
        }
        return false;
      };

      try {
        // Suppress known noisy messages that are safe to ignore in tests
        // unless debugging is explicitly enabled. Tests that need to assert
        // on these warnings can still set `global.__TEST_CONSOLE_ERROR_HANDLER__`.
        if (firstArgIncludes('react-test-renderer is deprecated')) return;

        // Quiet the frequent act() warning which is often noisy in Jest
        // environments while still allowing it to be enabled when needed.
        if (firstArgIncludes('not wrapped in act') && process.env.WEEJOBS_DEBUG !== 'true') {
          return;
        }
      } catch {
        // ignore filter errors
      }

      try {
        // If a test provided a handler, call it instead of the original.
        // This allows individual tests to suppress known noisy warnings
        // without trying to spy the globally-wrapped `console.error`.
        // eslint-disable-next-line no-undef
        const handler = (typeof global !== 'undefined' && (global).__TEST_CONSOLE_ERROR_HANDLER__) || _origConsoleError;
        handler.apply(console, args);
      } catch {
        _origConsoleError.apply(console, args);
      }
    };
  }
} catch {
  // ignore
}

console.log('jest-setup.js: Mocking AuthContext');

// Temporarily disable the global mock for AuthContext
// jest.mock('./context/AuthContext');

// Mock AuthProvider and useAuth globally
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    login: jest.fn(() => Promise.resolve({ success: true })),
    signup: jest.fn(() => Promise.resolve({ success: true })),
    sendPasswordReset: jest.fn(() => Promise.resolve({ success: true })),
  })),
}));

// Debugging logs to verify mock behavior
console.log('Mocking AuthContext with AuthProvider and useAuth');
console.log('AuthProvider:', jest.requireMock('./context/AuthContext').AuthProvider);
console.log('useAuth:', jest.requireMock('./context/AuthContext').useAuth);

// Mock global `window` object
if (typeof window === 'undefined') {
  global.window = {
    location: {
      href: '',
    },
    navigator: {
      userAgent: 'node.js',
    },
  };
}

// Mock the @react-native-async-storage/async-storage module
jest.mock('@react-native-async-storage/async-storage', () => {
  const mockAsyncStorage = {
    getItem: jest.fn((key) => {
      console.log(`AsyncStorage.getItem called with key: ${key}`);
      return Promise.resolve(null);
    }),
    setItem: jest.fn((key, value) => {
      console.log(`AsyncStorage.setItem called with key: ${key}, value: ${value}`);
      return Promise.resolve();
    }),
    removeItem: jest.fn((key) => {
      console.log(`AsyncStorage.removeItem called with key: ${key}`);
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      console.log('AsyncStorage.clear called');
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => {
      console.log('AsyncStorage.getAllKeys called');
      return Promise.resolve([]);
    }),
  };
  return mockAsyncStorage;
});

// Mock `react-native-safe-area-context` to resolve module not found errors
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock the React Native environment to address the `__fbBatchedBridgeConfig` issue.
jest.mock('react-native', () => {
  const actualReactNative = jest.requireActual('react-native');
  console.log('Mocking __fbBatchedBridgeConfig');
  return {
    ...actualReactNative,
    NativeModules: {
      ...actualReactNative.NativeModules,
      UIManager: {},
      PlatformConstants: { forceTouchAvailable: false },
      AccessibilityInfo: {},
      DeviceInfo: { getDeviceName: jest.fn(() => 'Test Device') },
      Networking: { fetch: jest.fn() },
      TurboModuleRegistry: {},
    },
  };
});

// Mock `expo-router` and `expo-modules-core` to prevent them from invoking native code during tests.
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() })),
  useLocalSearchParams: jest.fn(() => ({})),
  Tabs: jest.fn(() => null),
}));

jest.mock('expo-modules-core', () => ({
  NativeModulesProxy: {},
  NativeEventEmitter: jest.fn(),
  requireNativeModule: jest.fn(() => ({})),
  requireOptionalNativeModule: jest.fn(() => ({})),
}));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
}));

jest.mock('expo-linking', () => ({
  openURL: jest.fn(),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
}));

console.log('Jest setup file loaded successfully.');

global.__DEV__ = true;

// Mock `useAuth` to ensure it is available and resolves correctly in all tests.
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    login: jest.fn(() => Promise.resolve({ success: true })),
    signup: jest.fn(() => Promise.resolve({ success: true })),
    sendPasswordReset: jest.fn(() => Promise.resolve({ success: true })),
  })),
}));

// Mock `__fbBatchedBridgeConfig` in the Jest setup file to simulate the React Native environment.
global.__fbBatchedBridgeConfig = {};
console.log('Mocked __fbBatchedBridgeConfig:');

global.mockNativeModules = {
  NativeUnimoduleProxy: {
    viewManagersMetadata: {
      ViewManager1: { mock: jest.fn() },
      ViewManager2: { mock: jest.fn() },
    },
  },
  UIManager: {
    ViewManagerAdapter_ViewManager1: {},
    ViewManagerAdapter_ViewManager2: {},
  },
};
console.log('Comprehensive mock for mockNativeModules');

jest.mock('jest-expo/src/preset/setup', () => {
  console.log('Bypassing jest-expo setup');
  return {};
});

jest.mock('react-native/Libraries/Utilities/NativePlatformConstantsIOS', () => require('../__mocks__/PlatformConstants'));
jest.mock('expo-winter', () => require('../__mocks__/expo-winter'));
console.log('Explicitly mocking PlatformConstants and expo-winter');

// Correct the path to `AuthContext` globally
jest.mock('context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    login: jest.fn(() => Promise.resolve({ success: true })),
    signup: jest.fn(() => Promise.resolve({ success: true })),
    sendPasswordReset: jest.fn(() => Promise.resolve({ success: true })),
  })),
}));

// Explicitly mock PlatformConstants
jest.mock('react-native/Libraries/Utilities/NativePlatformConstantsIOS', () => ({
  forceTouchAvailable: false,
  osVersion: 'mock',
}));

console.log('Mocking AuthContext:', require('../context/AuthContext'));
console.log('Mocking PlatformConstants:', require('react-native/Libraries/Utilities/NativePlatformConstantsIOS'));

jest.mock('@testing-library/react-native', () => {
  const actual = jest.requireActual('@testing-library/react-native');
  return {
    ...actual,
    render: jest.fn(actual.render),
  };
});

console.log('Mocking BatchedBridge and additional internals');

// Mock BatchedBridge
if (!global.__fbBatchedBridge) {
  global.__fbBatchedBridge = {
    callFunctionReturnFlushedQueue: jest.fn(),
    invokeCallbackAndReturnFlushedQueue: jest.fn(),
    flushedQueue: jest.fn(),
  };
  console.log('BatchedBridge mocked successfully');
}

console.log('Mocking NativeEventEmitter and additional internals');

// Mock NativeEventEmitter
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  const EventEmitter = require('events');
  return EventEmitter;
});

console.log('Mocking NativeModules internals');

// Mock NativeModules internals
jest.mock('react-native/Libraries/BatchedBridge/NativeModules', () => {
  return {
    ...jest.requireActual('react-native/Libraries/BatchedBridge/NativeModules'),
    UIManager: {},
    PlatformConstants: { forceTouchAvailable: false },
    TurboModuleRegistry: {},
    Networking: { fetch: jest.fn() },
    DeviceInfo: { getDeviceName: jest.fn(() => 'Test Device') },
  };
});

// Mock __fbBatchedBridgeConfig directly
jest.mock('react-native/Libraries/BatchedBridge/NativeModules', () => {
  const NativeModules = jest.requireActual('react-native/Libraries/BatchedBridge/NativeModules');
  return {
    ...NativeModules,
    __fbBatchedBridgeConfig: {},
  };
});

// Add a mock for React Native's BatchedBridge
jest.mock('react-native/Libraries/BatchedBridge/BatchedBridge', () => {
  return {
    __fbBatchedBridgeConfig: {},
    callFunctionReturnFlushedQueue: jest.fn(),
    invokeCallbackAndReturnFlushedQueue: jest.fn(),
    flushedQueue: jest.fn(),
  };
});

// Add a mock for React Native's internal setup
jest.mock('react-native/Libraries/BatchedBridge/MessageQueue', () => {
  const MessageQueue = jest.requireActual('react-native/Libraries/BatchedBridge/MessageQueue');
  return {
    ...MessageQueue,
    __fbBatchedBridgeConfig: {},
  };
});

console.log('Investigating React Native runtime initialization process');

// Override React Native's runtime initialization logic
jest.mock('react-native/Libraries/Core/ReactNative', () => {
  const ReactNative = jest.requireActual('react-native/Libraries/Core/ReactNative');
  return {
    ...ReactNative,
    __fbBatchedBridgeConfig: {},
    initialize: jest.fn(),
  };
});

// Add a custom resolver for React Native's Core module
jest.mock('react-native/Libraries/Core/ReactNative', () => {
  return {
    __fbBatchedBridgeConfig: {},
    initialize: jest.fn(),
  };
});

console.log('Investigating root cause of module resolution issue');

// Add debugging logs to trace module resolution
jest.mock('react-native/Libraries/Core/ReactNative', () => {
  console.log('Mocking ReactNative Core module');
  return {
    __fbBatchedBridgeConfig: {},
    initialize: jest.fn(),
  };
});

// Add debugging logs to trace calls to `TurboModuleRegistry.getEnforcing` and verify if the mock is being applied.
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => {
  const originalModule = jest.requireActual('react-native/Libraries/TurboModule/TurboModuleRegistry');
  const mockGetEnforcing = jest.fn((name) => {
    console.log(`Mocked TurboModuleRegistry.getEnforcing called with: ${name}`);
    if (name === 'DeviceInfo') {
      return {
        getDeviceName: jest.fn(() => 'Test Device'),
        getConstants: jest.fn(() => ({
          brand: 'Test Brand',
          model: 'Test Model',
          screen: {
            width: 1080,
            height: 1920,
            scale: 2,
          },
        })),
      };
    }
    return originalModule.getEnforcing(name);
  });
  return {
    ...originalModule,
    getEnforcing: mockGetEnforcing,
  };
});
console.log('Added debugging logs to TurboModuleRegistry.getEnforcing mock');

// Mock TurboModuleRegistry to resolve `getEnforcing` error
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  getEnforcing: jest.fn(() => ({})),
}));

console.log('Debugging AuthContext resolution');
try {
  const authContext = require('../../context/AuthContext');
  console.log('AuthContext resolved:', authContext);
} catch (error) {
  console.error('Error resolving AuthContext:', error);
}

jest.mock('react-native/Libraries/Utilities/Dimensions', () => {
  return {
    set: jest.fn((dimensions) => {
      console.log('Mocked Dimensions.set called with:', dimensions);
    }),
    get: jest.fn(() => {
      console.log('Mocked Dimensions.get called');
      return {
        screen: {
          width: 1080,
          height: 1920,
          scale: 2,
        },
      };
    }),
  };
});
console.log('Completely mocked Dimensions module');

jest.mock('react-native/Libraries/Utilities/PixelRatio', () => require('../__mocks__/PixelRatio'));
console.log('Explicitly mocked PixelRatio in jest-setup.js');

jest.resetModules();
console.log('Cleared Jest module cache for PixelRatio');

// Debugging PixelRatio mock
const PixelRatio = require('react-native/Libraries/Utilities/PixelRatio');
console.log('PixelRatio mock loaded in jest-setup.js:', PixelRatio);

// Add debugging logs to verify Jest setup execution
console.log('Jest setup file executed');
console.log('Jest setup file executed before tests');
