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
const preset = Object.assign({}, expoPreset);

const stripRNSetup = (arr) => {
  if (!Array.isArray(arr)) return arr;
  return arr.filter((v) => typeof v === 'string' && !/react-native\/jest\/setup(\\.js)?$/.test(v));
};

if (preset.setupFiles) preset.setupFiles = stripRNSetup(preset.setupFiles);
if (preset.setupFilesAfterEnv) preset.setupFilesAfterEnv = stripRNSetup(preset.setupFilesAfterEnv);

module.exports = preset;
