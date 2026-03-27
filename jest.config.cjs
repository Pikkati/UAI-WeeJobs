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
    '^@/(.*)$': '<rootDir>/$1'
  },

  setupFiles: [
    '<rootDir>/jest-setup-env.js',
    '<rootDir>/__mocks__/rn-jest-setup-wrapper.js',
    '<rootDir>/jest-setup.js'
  ],
  coverageThreshold: {
    global: {
      statements: 15,
      branches: 10,
      functions: 8,
      lines: 15
    }
  },
};
