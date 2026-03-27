// Local wrapper preset around `jest-expo` that removes the
// automatic `react-native/jest/setup` entry which may attempt to
// redefine `window` before our environment is ready.
const tryRequire = (names) => {
  for (const name of names) {
    try {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const mod = require(name);
      return mod && (mod.default || mod);
    } catch (e) {
      // ignore
    }
  }
  return {};
};

const expoPreset = tryRequire(['jest-expo/jest-preset', 'jest-expo']);
const preset = Object.assign({}, expoPreset || {});

const isRNSetup = (v) => typeof v === 'string' && /react-native\/jest\/setup(\.js)?$/.test(v);

// Build an explicit, minimal set of setupFiles that ensures our wrapper
// runs before anything that might attempt to redefine `window`.
const wrapper = '<rootDir>/__mocks__/rn-jest-setup-wrapper.js';
const localSetup = '<rootDir>/jest-setup.js';

const expoSetup = Array.isArray(preset.setupFiles) ? preset.setupFiles.filter((v) => !isRNSetup(v)) : [];
const expoAfterEnv = Array.isArray(preset.setupFilesAfterEnv) ? preset.setupFilesAfterEnv.filter((v) => !isRNSetup(v)) : [];

// Ensure our wrapper is first, then any remaining expo setup files.
preset.setupFiles = [wrapper, localSetup, ...expoSetup.filter((v) => v && v !== wrapper && v !== localSetup)];
preset.setupFilesAfterEnv = [...new Set([...expoAfterEnv])];

// Force the project to use our custom environment so we can prepare
// `global.window` before any RN setup runs.
preset.testEnvironment = '<rootDir>/jest-environment-custom.js';

module.exports = preset;
