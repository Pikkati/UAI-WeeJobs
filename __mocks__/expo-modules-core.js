// Lightweight mock of expo-modules-core for Jest environment
// Provide minimal stubs used during module initialization to avoid runtime errors
module.exports = {
  // some packages import setup functions; provide no-op
  setUpJsLogger: function () {},
  NativeModulesProxy: {},
  // stub for requireNativeModule used by expo-font and others
  requireNativeModule: function () {
    return {};
  },
  // no-op polyfill installer used by newer jest-expo presets
  installExpoGlobalPolyfill: function () {},
  // default export compatibility
  default: {}
};
