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
    ,
    '^@/(.*)$': '<rootDir>/$1'
  },

  setupFiles: [
    '<rootDir>/jest-setup-env.js',
    '<rootDir>/__mocks__/rn-jest-setup-wrapper.js',
    '<rootDir>/jest-setup.js'
  ],
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 40,
      functions: 35,
      lines: 50
    }
  },
};
