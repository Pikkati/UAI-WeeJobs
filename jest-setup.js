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

// Mock for react-native StyleSheet
jest.mock('react-native', () => {
  const actualReactNative = jest.requireActual('react-native');
  return {
    ...actualReactNative,
    StyleSheet: {
      create: jest.fn((styles) => styles),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 360, height: 640 })),
    },
  };
});

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

// Standardize the `lib/supabase` mock path
jest.mock('./lib/supabase', () => ({
  supabase: {
    auth: {
      signIn: jest.fn(() => Promise.resolve({ user: { id: '123', name: 'Test User' } })),
      signOut: jest.fn(() => Promise.resolve()),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: { id: '1', name: 'Job 1' } })) })) })),
      insert: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: { id: '2', name: 'Job 2' } })) })),
    })),
  },
}));

// Adjust mock for `context/AuthContext`
jest.mock('context/AuthContext', () => ({
  AuthProvider: ({ children }) => <>{children}</>,
  useAuth: jest.fn(() => ({
    user: { id: '123', name: 'Test User' },
    login: jest.fn(() => Promise.resolve({ success: true, user: { id: '123', name: 'Test User' } })),
  })),
}));

// Mock for `AuthContext`
jest.mock('context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(() => Promise.resolve({
      success: true,
      user: { email: 'john@weejobs.test', id: '123' },
    })),
    logout: jest.fn(() => Promise.resolve()),
  }),
}));

// Mock environment variables for `supabase`
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://mock.supabase.url';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
