try {
  const expoPkg = require.resolve('expo/package.json');
  const expoModulesPkg = require.resolve('expo-modules-autolinking/package.json', { paths: [require.resolve('expo/package.json')] });
  console.log('expo:', expoPkg);
  console.log('expo-modules-autolinking:', expoModulesPkg);
} catch (e) {
  console.error('ERROR', e && e.message);
  process.exit(1);
}
