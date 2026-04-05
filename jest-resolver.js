const path = require('path');

// Custom Jest Resolver
module.exports = (request, options) => {
  // Mapping for specific module resolutions
  const customResolutions = {
    'AuthContext': path.resolve(__dirname, 'context/AuthContext.tsx'),
    'react-native/Libraries/Core/ReactNative': path.resolve(
      __dirname,
      'node_modules/react-native/Libraries/Core/ReactNative.js'
    ),
    'react-native/Libraries/BatchedBridge/NativeModules': path.resolve(
      __dirname,
      'node_modules/react-native/Libraries/BatchedBridge/NativeModules.js'
    ),
    'react-native/Libraries/Utilities/PixelRatio': path.resolve(
      __dirname,
      '__mocks__/PixelRatio.js'
    ),
  };

  // Check if the request matches a custom resolution
  for (const [key, resolvedPath] of Object.entries(customResolutions)) {
    if (request.includes(key)) {
      console.log('Custom Resolver Debug: Resolving', key, 'mock:', resolvedPath);
      return resolvedPath;
    }
  }

  // Fallback for unresolved modules
  try {
    return options.defaultResolver(request, options);
  } catch (error) {
    console.error('Resolution Failed for:', request, error);
    throw error;
  }
};