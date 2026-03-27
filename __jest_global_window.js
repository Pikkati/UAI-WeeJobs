// Preload file to ensure `global.window` exists and is configurable
try {
  if (typeof global.window === 'undefined') {
    Object.defineProperty(global, 'window', {
      value: global,
      configurable: true,
      writable: true,
      enumerable: true,
    });
  } else {
    const desc = Object.getOwnPropertyDescriptor(global, 'window');
    if (desc && !desc.configurable) {
      // If it's not configurable, don't attempt to redefine — leave as-is.
    }
  }
} catch (err) {
  // No-op: best-effort pre-definition to avoid `Cannot redefine property: window`
}

module.exports = {};

// Write a marker so we can detect if this preload ran inside containers
try {
  const fs = require('fs');
  fs.appendFileSync('./tmp_jest_preload_marker.log', `preload:${new Date().toISOString()}\n`);
} catch (e) {
  // ignore
}

// Monkeypatch Module._load early so any require('react-native/jest/setup')
// returns our repo wrapper instead of executing the upstream file which may
// attempt to redefine a non-configurable `window`.
try {
  const Module = require('module');
  const origLoad = Module._load;
  Module._load = function(request, parent, isMain) {
    try {
      if (
        request === 'react-native/jest/setup' ||
        request === 'react-native/jest/setup.js' ||
        (typeof request === 'string' && request.endsWith('/react-native/jest/setup.js'))
      ) {
        // Resolve our wrapper relative to project root
        const wrapper = require.resolve('./__mocks__/rn-jest-setup-wrapper.js');
        return origLoad.call(this, wrapper, parent, isMain);
      }
    } catch (err) {
      // swallow and fall back
    }
    return origLoad.apply(this, arguments);
  };
} catch (e) {
  // ignore if module patching is not allowed
}
