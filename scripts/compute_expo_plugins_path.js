const path = require('path');
try {
  const p = require.resolve('expo-modules-autolinking/package.json', { paths: [require.resolve('expo/package.json')] });
  console.log('expo-modules-autolinking package.json:', p);
  const expoPluginsPath = path.resolve(path.dirname(p), '../android/expo-gradle-plugin');
  console.log('computed expoPluginsPath:', expoPluginsPath);
} catch (e) {
  console.error('ERROR', e && e.message);
  process.exitCode = 2;
}
