module.exports = {
  preset: '<rootDir>/jest-preset',
  testEnvironment: '<rootDir>/jest-environment-custom.js',
  testEnvironmentOptions: {},
  transformIgnorePatterns: [
    'node_modules/(?!(@?expo|expo-asset|expo-modules-core|react-native|@react-native|@unimodules|@react-navigation|@supabase|expo-font)/)'
  ],
  moduleNameMapper: {
    '^expo$': '<rootDir>/__mocks__/expo-shim.js',
    '^expo(/.*)?$': '<rootDir>/__mocks__/expo-shim.js',
    '^expo-modules-core(/.*)?$': '<rootDir>/__mocks__/expo-modules-core.js',
    '^react-native/Libraries/BatchedBridge/NativeModules$': '<rootDir>/__mocks__/rn-native-modules.js',
    '^react-native$': '<rootDir>/__mocks__/rn-native-modules.js',
    '^react-native/jest/setup(\\.js)?$': '<rootDir>/__mocks__/rn-jest-setup-wrapper.js'
    ,
    '^@react-native-async-storage/async-storage$': '<rootDir>/__mocks__/async-storage-module.js',
    '^@/(.*)$': '<rootDir>/$1'
  },

  // Improve test isolation by resetting/clearing mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  setupFiles: [
    '<rootDir>/jest-setup-env.js',
    '<rootDir>/__mocks__/rn-jest-setup-wrapper.js',
    '<rootDir>/jest-setup.js'
  ],
  coverageThreshold: {
    global: {
      statements: 25,
      branches: 20,
      functions: 25,
      lines: 25
    }
  },
};
