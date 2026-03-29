module.exports = {
  preset: '<rootDir>/jest-preset',
  testEnvironment: '<rootDir>/jest-environment-custom.js',
  testEnvironmentOptions: {},
  transformIgnorePatterns: [
    'node_modules/(?!(@?expo|expo-modules-core|react-native|@react-native|@unimodules|@react-navigation|@supabase)/)'
  ],
  // Use Jest's default resolver. A custom resolver caused transform
  // resolution issues across environments, so we rely on the default
  // behavior which resolves local wrapper modules correctly.
  moduleNameMapper: {
    '^expo$': '<rootDir>/__mocks__/expo-shim.js',
    '^expo(/.*)?$': '<rootDir>/__mocks__/expo-shim.js',
    '^expo-image$': '<rootDir>/__mocks__/expo-image.js',
    '^expo-image-picker$': '<rootDir>/__mocks__/expo-image-picker.js',
    '^expo-font$': '<rootDir>/__mocks__/expo-font.js',
    '^@expo/vector-icons$': '<rootDir>/__mocks__/expo-vector-icons.js',
    '^expo-linear-gradient$': '<rootDir>/__mocks__/expo-linear-gradient.js',
    '^@react-native-async-storage/async-storage$': '<rootDir>/__mocks__/async-storage.js',
    '^react-native/Libraries/BatchedBridge/NativeModules$': '<rootDir>/__mocks__/rn-native-modules.js',
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
    '^react-native-reanimated$': '<rootDir>/__mocks__/react-native-reanimated.js',
    '^react-native-reanimated/mock$': '<rootDir>/__mocks__/react-native-reanimated.js',
    '^react-native/jest/setup(\\.js)?$': '<rootDir>/__mocks__/rn-jest-setup-wrapper.js'
    ,
    '^react-native/jest/assetFileTransformer\\.js$': '<rootDir>/__mocks__/assetFileTransformer.js'
    ,
    '^.+\\.(png|jpg|jpeg|gif|bmp|webp|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  // Provide explicit transforms (override preset) so we don't depend on
  // upstream asset transformers that may not be present on all platforms.
  transform: {
    "\\.[jt]sx?$": require.resolve('./__mocks__/babelTransform.js')
  },
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  setupFiles: [
    '<rootDir>/__mocks__/rn-jest-setup-wrapper.js',
    '<rootDir>/jest-setup.js'
  ],
};
