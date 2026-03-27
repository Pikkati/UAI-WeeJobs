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

// Export shape that supports CommonJS and ESM default interop used by jest
module.exports = mock;
module.exports.__esModule = true;
module.exports.default = mock;
