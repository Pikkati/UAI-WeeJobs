// Minimal mock for react-native NativeModules expected by jest-expo setup
const mock = {
  NativeUnimoduleProxy: {
    viewManagersMetadata: {},
  },
  UIManager: {},
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
  },
  ImageLoader: {},
  ImageViewManager: {},
};

// Provide minimal StyleSheet and primitives used by components so tests can render
mock.StyleSheet = { create: (s) => s, flatten: (s) => s };
mock.Text = 'Text';
mock.View = 'View';
mock.TouchableOpacity = 'TouchableOpacity';
mock.ScrollView = 'ScrollView';

// Provide Dimensions mock used by some components
mock.Dimensions = { get: (_key) => ({ width: 375, height: 667 }) };

// Provide Platform mock so modules that read Platform.OS at import-time don't fail
mock.Platform = {
  OS: 'ios',
  select: (obj) => (obj && (obj.ios ?? obj.default ?? obj.android ?? null)),
};

// Export shape that supports CommonJS and ESM default interop used by jest
module.exports = mock;
module.exports.__esModule = true;
module.exports.default = mock;
