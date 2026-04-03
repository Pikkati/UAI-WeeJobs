const isJest = typeof jest !== 'undefined' && typeof jest.fn === 'function';
const useFonts = isJest ? jest.fn(() => [true]) : () => [true];

// Mock for expo-font
module.exports = {
  loadAsync: jest.fn(),
  useFonts: jest.fn(() => [true]),
};
