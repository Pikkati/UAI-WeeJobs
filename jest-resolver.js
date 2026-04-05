const path = require('path');

module.exports = (request, options) => {
  console.log('Custom Resolver Invoked:', request);

  if (request.includes('AuthContext')) {
    const resolvedPath = path.resolve(__dirname, 'context/AuthContext.tsx');
    console.log('Resolved Path for AuthContext:', resolvedPath);
    return resolvedPath;
  }

  if (request.includes('react-native/Libraries/Core/ReactNative')) {
    const resolvedPath = path.resolve(__dirname, 'node_modules/react-native/Libraries/Core/ReactNative.js');
    console.log('Resolved Path for ReactNative:', resolvedPath);
    return resolvedPath;
  }

  if (request.includes('react-native/Libraries/BatchedBridge/NativeModules')) {
    const resolvedPath = path.resolve(
      __dirname,
      'node_modules/react-native/Libraries/BatchedBridge/NativeModules.js'
    );
    console.log('Resolved Path for NativeModules:', resolvedPath);
    return resolvedPath;
  }

  if (request.includes('react-native/Libraries/Utilities/PixelRatio')) {
    const resolvedPath = path.resolve(__dirname, '__mocks__/PixelRatio.js');
    console.log('Custom Resolver Debug: Resolving PixelRatio to mock:', resolvedPath);
    console.log('Custom Resolver Debug: Request:', request);
    console.log('Custom Resolver Debug: Options:', options);
    return resolvedPath;
  }

  // Fallback for unresolved modules
  console.log('Fallback Resolver Invoked for:', request);
  try {
    return options.defaultResolver(request, options);
  } catch (error) {
    console.error('Resolution Failed for:', request, error);
    throw error;
  }
};