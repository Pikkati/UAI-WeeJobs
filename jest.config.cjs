module.exports = {
  preset: '<rootDir>/jest-preset',
  testEnvironment: '<rootDir>/jest-environment-custom.js',
  testEnvironmentOptions: {},
  transformIgnorePatterns: [
    'node_modules/(?!(expo-image-picker|expo-modules-core|react-native-safe-area-context|@expo/vector-icons)/)'
  ],
  moduleNameMapper: {
    '^expo$': '<rootDir>/__mocks__/expo-shim.js',
    '^expo(/.*)?$': '<rootDir>/__mocks__/expo-shim.js',
    '^react-native/Libraries/BatchedBridge/NativeModules$': '<rootDir>/__mocks__/rn-native-modules.js',
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
    '^react-native/jest/setup(\\.js)?$': '<rootDir>/__mocks__/rn-jest-setup-wrapper.js',
    '^expo-modules-core$': '<rootDir>/__mocks__/expo-modules-core.js',
    '^expo-font$': '<rootDir>/__mocks__/expo-font.js',
    '^react-native-vector-icons$': '<rootDir>/__mocks__/react-native-vector-icons.js',
    '^context/AuthContext$': '<rootDir>/context/AuthContext',
    '^lib/supabase$': '<rootDir>/lib/supabase',
    '^constants/theme$': '<rootDir>/constants/theme',
  },
  setupFiles: [
    '<rootDir>/__mocks__/rn-jest-setup-wrapper.js',
    '<rootDir>/jest-setup.js'
  ],
};
