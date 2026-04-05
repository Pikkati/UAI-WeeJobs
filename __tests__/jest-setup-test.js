// Temporary test file to verify Jest setup logic
console.log('Temporary Jest setup test file loaded');

global.__DEV__ = true;

console.log('Test file executed: __DEV__ =', global.__DEV__);

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

console.log('Test file executed: React Native mocks initialized.');

jest.mock('react-native/Libraries/Components/ScrollView/ScrollView', () => {
  const React = require('react');
  return {
    Context: {
      Consumer: ({ children }) => children(null),
    },
  };
});

console.log('Test file executed: ScrollView.Context mock applied.');