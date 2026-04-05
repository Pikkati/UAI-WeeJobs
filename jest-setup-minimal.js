// Minimal Jest setup file for debugging
console.log('Minimal Jest setup file loaded');

global.__DEV__ = true;

console.log('Jest setup file executed: __DEV__ =', global.__DEV__);

jest.mock('react-native/Libraries/BatchedBridge/NativeModules', () => ({
  __fbBatchedBridgeConfig: {},
}));

jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  get: jest.fn(),
}));
console.log('TurboModuleRegistry mock initialized:', jest.isMockFunction(require('react-native/Libraries/TurboModule/TurboModuleRegistry').get));
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  const EventEmitter = require('events');
  return EventEmitter;
});

console.log('Jest setup file executed: React Native mocks initialized.');

jest.mock('react-native/Libraries/Components/ScrollView/ScrollView', () => {
  const React = require('react');
  return {
    Context: {
      Consumer: ({ children }) => children(null),
    },
  };
});

console.log('Jest setup file executed: ScrollView.Context mock applied.');

jest.mock('react-native/Libraries/Utilities/PixelRatio', () => {
  console.log('Explicitly mocking PixelRatio in Jest setup file');
  return {
    roundToNearestPixel: jest.fn((value) => {
      console.log('PixelRatio.roundToNearestPixel called with:', value);
      return value;
    }),
    get: jest.fn(() => {
      console.log('PixelRatio.get called');
      return 1;
    }),
  };
});