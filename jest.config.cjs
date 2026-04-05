const tryRequire = (path) => {
  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(path);
  } catch (e) {
    return {};
  }
};

const localPreset = tryRequire('./jest-preset/jest-preset.js');

const path = require('path');
const rootDir = __dirname;

console.log('jest.config.cjs loaded');

console.log('Custom Jest Resolver Path:', path.resolve(__dirname, 'jest-resolver.js'));

console.log('jest-setup.js path:', path.resolve(__dirname, 'jest-setup.js'));

console.log('Resolved jest-setup.js path:', path.resolve(__dirname, 'jest-setup.js'));

console.log('jest-setup-globals.js path:', path.resolve(__dirname, 'jest-setup-globals.js'));

console.log('SetupFiles:', module.exports.setupFiles);

module.exports = {
  setupFiles: ['<rootDir>/jest-setup-minimal.js'],
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
  modulePathIgnorePatterns: [
    '<rootDir>/tmp_apk_extracted/react-native',
    '<rootDir>/tmp_apk_extracted/react-native/react-native',
    '<rootDir>/tmp_apk_extracted/react-native/scripts',
    '<rootDir>/tmp_apk_extracted/react-native/private',
    '<rootDir>/tmp_apk_extracted/react-native/packages',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|expo|@expo|@unimodules|unimodules|sentry-expo|native-base|@react-native-async-storage/async-storage)/)'
  ],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^../../context/AuthContext$': '<rootDir>/context/AuthContext',
    '^context/AuthContext$': '<rootDir>/context/AuthContext',
    'react-native/Libraries/TurboModule/TurboModuleRegistry': '<rootDir>/__mocks__/TurboModuleRegistry.js',
    'react-native/Libraries/Utilities/PixelRatio': '<rootDir>/__mocks__/PixelRatio.js',
  },
  testMatch: ['<rootDir>/__tests__/**/*.js'],
  resolver: '<rootDir>/jest-resolver.js',
};
