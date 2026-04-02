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
    // Log testEnvironmentOptions for debugging
    console.log('testEnvironmentOptions:', this.testEnvironmentOptions);

    // Ensure testEnvironmentOptions is defined with fallback values
    this.testEnvironmentOptions = this.testEnvironmentOptions || { customOption: true };

    await super.setup();
    try {
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
            });
          } catch (e) {
            console.warn('Failed to define __window_proxy:', e);
          }
        }
      }
    } catch (e) {
      console.error('Error during setup:', e);
    }
  }
}

module.exports = CustomEnvironment;
