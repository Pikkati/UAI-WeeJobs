// Ensure `global.window` exists and is configurable early — do this before
// requiring `jest-environment-jsdom` so the definition is in place as soon
// as the environment is initialized.
try {
  if (typeof global.window === 'undefined') {
    Object.defineProperty(global, 'window', {
      value: {},
      configurable: true,
      writable: true,
      enumerable: true,
    });
  }
} catch {
  // If we cannot define it, continue; downstream code may still work.
}

const JsdomModule = require('jest-environment-jsdom');
const JsdomEnvironment = JsdomModule.default || JsdomModule;

class CustomEnvironment extends JsdomEnvironment {
  async setup() {
    await super.setup();
    try {
      this.global.testEnvironmentOptions = this.global.testEnvironmentOptions || {};
      console.log('testEnvironmentOptions:', this.global.testEnvironmentOptions);
      if (typeof this.global.window === 'undefined') {
        Object.defineProperty(this.global, 'window', {
          value: this.global,
          configurable: true,
          writable: true,
          enumerable: true,
        });
      } else {
        const desc = Object.getOwnPropertyDescriptor(this.global, 'window');
        if (desc && !desc.configurable) {
          try {
            Object.defineProperty(this.global, '__window_proxy', {
              value: this.global.window,
              configurable: true,
              writable: true,
              enumerable: false,
            });
          } catch {
            // Ignore errors
          }
        }
      }
    } catch {
      // Ignore setup errors
    }
  }
}

module.exports = CustomEnvironment;
