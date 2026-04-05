module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest-setup-minimal.js'],
  moduleNameMapper: {
    '^hermes-eslint$': '<rootDir>/__mocks__/hermes-eslint.js',
    '^wait-for-expect$': '<rootDir>/__mocks__/wait-for-expect.js',
    '^eslint-config-prettier$': '<rootDir>/__mocks__/eslint-config-prettier.js',
    '^metro-babel-register$': '<rootDir>/__mocks__/metro-babel-register.js',
    '^../../context/AuthContext$': '<rootDir>/__mocks__/AuthContext.js',
  },
};