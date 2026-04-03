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

// Define the `__DEV__` global variable in the Jest setup file to simulate the development environment.
global.__DEV__ = true;

// No process.env manipulation here; tests that need env vars should set them explicitly.

// Jest setup for NativeModules
const { NativeModules } = require('react-native');
if (!global.NativeModules) {
  global.NativeModules = {};
}
if (!global.NativeModules.RNVectorIconsManager) {
  global.NativeModules.RNVectorIconsManager = {
    getImageForFont: jest.fn(),
    loadFontWithFileName: jest.fn(),
    loadFontWithData: jest.fn(),
  };
}
if (!global.NativeModules.RNVectorIconsModule) {
  global.NativeModules.RNVectorIconsModule = {
    getImageForFont: jest.fn(),
    loadFontWithFileName: jest.fn(),
    loadFontWithData: jest.fn(),
  };
}

// NOTE: react-native core is mocked via a manual module in __mocks__/react-native.js
// to provide View/Text primitives and StyleSheet.flatten. Avoid requiring the real
// 'react-native' here to prevent loading ESM sources from node_modules in the test runner.

// Mock for expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() })),
  useLocalSearchParams: jest.fn(() => ({})),
}));

// Mock for @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: jest.fn(() => null),
}));

// Mock for expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() => ({ cancelled: true })),
  requestMediaLibraryPermissionsAsync: jest.fn(() => ({ status: 'granted' })),
}));

// Mock for `@react-native-async-storage/async-storage`
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Standardize the `lib/supabase` mock path with a small chainable query mock
const __supabaseModulePath = require.resolve('./lib/supabase');
jest.mock(__supabaseModulePath, () => {
  // Chainable query builder stub that resolves to predictable data
  function Query(result) {
    this._result = result;
  }
  Query.prototype.select = function () { return this; };
  Query.prototype.order = function () { return Promise.resolve({ data: this._result, error: null }); };
  Query.prototype.eq = function () { return this; };
  Query.prototype.in = function () { return Promise.resolve({ data: this._result, error: null }); };
  Query.prototype.update = function () { return Promise.resolve({ data: this._result, error: null }); };
  Query.prototype.insert = function () { return Promise.resolve({ data: this._result, error: null }); };
  Query.prototype.single = function () { return Promise.resolve({ data: (Array.isArray(this._result) ? this._result[0] : this._result), error: null }); };

  const mockData = [{ id: '1', name: 'Job 1' }];

  return {
    supabase: {
      auth: {
        signIn: jest.fn(() => Promise.resolve({ user: { id: '123', name: 'Test User' } })),
        signOut: jest.fn(() => Promise.resolve()),
      },
      from: jest.fn(() => new Query(mockData)),
    },
  };
});

// Note: avoid noisy diagnostic logs in CI; remove temporary diagnostics once tests are stable.

// Adjust mock for `context/AuthContext`
jest.mock('context/AuthContext', () => ({
  AuthProvider: ({ children }) => <>{children}</>,
  useAuth: jest.fn(() => ({
    user: { id: '123', name: 'Test User' },
    login: jest.fn(() => Promise.resolve({ success: true, user: { id: '123', name: 'Test User' } })),
  })),
}));

// (No-op) AuthContext overrides should be done in specific tests; the named mock above
// provides AuthProvider and useAuth for most tests. Avoid redefining it here.

// Mock environment variables for `supabase`
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://mock.supabase.url';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
