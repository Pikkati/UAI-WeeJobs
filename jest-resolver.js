const path = require('path');

// Custom Jest Resolver
module.exports = (request, options) => {
  console.log('Custom Resolver Debug: Resolving request:', request);

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
    'jest-sequencer': path.resolve(
      __dirname,
      'node_modules/@jest/test-sequencer/build/index.js'
    ),
  };

  // Check if the request matches a custom resolution
  for (const [key, resolvedPath] of Object.entries(customResolutions)) {
    if (request.includes(key)) {
      console.log('Custom Resolver Debug: Resolving', key, 'mock:', resolvedPath);
      return resolvedPath;
    }
  }

  if (request.includes('react-native/Libraries/Utilities/Dimensions')) {
    console.log('Custom Resolver Debug: Resolving Dimensions mock:', path.resolve(__dirname, '__mocks__/Dimensions.js'));
    return path.resolve(__dirname, '__mocks__/Dimensions.js');
  }

  // Log fallback resolution
  try {
    const resolvedPath = options.defaultResolver(request, options);
    console.log('Custom Resolver Debug: Default resolution for', request, ':', resolvedPath);
    return resolvedPath;
  } catch (error) {
    console.error('Resolution Failed for:', request, error);
    throw error;
  }
};