// Mock for react-native-vector-icons
const NativeModules = require('react-native').NativeModules;
NativeModules.RNVectorIconsManager = {};

module.exports = {
  createIconSet: jest.fn(),
  createIconSetFromFontello: jest.fn(),
  createIconSetFromIcoMoon: jest.fn(),
  createMultiStyleIconSet: jest.fn(),
};
