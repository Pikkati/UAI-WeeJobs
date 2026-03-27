module.exports = {
  preset: '<rootDir>/jest-preset',
  testEnvironment: '<rootDir>/jest-environment-custom.js',
  testEnvironmentOptions: {},
  transformIgnorePatterns: [
    'node_modules/(?!(@?expo|expo-modules-core|react-native|@react-native|@unimodules|@react-navigation|@supabase)/)'
  ],
  moduleNameMapper: {
    '^expo$': '<rootDir>/__mocks__/expo-shim.js',
    '^expo(/.*)?$': '<rootDir>/__mocks__/expo-shim.js',
    '^react-native/Libraries/BatchedBridge/NativeModules$': '<rootDir>/__mocks__/rn-native-modules.js',
    '^react-native$': '<rootDir>/__mocks__/rn-native-modules.js',
    '^react-native/jest/setup(\\.js)?$': '<rootDir>/__mocks__/rn-jest-setup-wrapper.js'
  },
  setupFiles: [
    '<rootDir>/__mocks__/rn-jest-setup-wrapper.js',
    '<rootDir>/jest-setup.js'
  ],
};
