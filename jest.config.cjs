const path = require('path');
const rootDir = __dirname;

// Jest configuration
module.exports = {
  // Files to run before the test suite
  setupFiles: ['<rootDir>/jest-setup-minimal.js'],
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],

  // Ignore patterns for modules
  modulePathIgnorePatterns: [
    '<rootDir>/tmp_apk_extracted/react-native',
    '<rootDir>/tmp_apk_extracted/react-native/react-native',
    '<rootDir>/tmp_apk_extracted/react-native/scripts',
    '<rootDir>/tmp_apk_extracted/react-native/private',
    '<rootDir>/tmp_apk_extracted/react-native/packages',
  ],

  // Transform patterns for specific modules
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|expo|@expo|@unimodules|unimodules|sentry-expo|native-base|@react-native-async-storage/async-storage)/)'
  ],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },

  // Module name mappings
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^../../context/AuthContext$': '<rootDir>/context/AuthContext',
    '^context/AuthContext$': '<rootDir>/context/AuthContext',
    'react-native/Libraries/TurboModule/TurboModuleRegistry': '<rootDir>/__mocks__/TurboModuleRegistry.js',
    'react-native/Libraries/Utilities/PixelRatio': '<rootDir>/__mocks__/PixelRatio.js',
  },

  // Test file patterns
  testMatch: ['<rootDir>/__tests__/**/*.js'],

  // Custom resolver
  resolver: '<rootDir>/jest-resolver.js',
};
