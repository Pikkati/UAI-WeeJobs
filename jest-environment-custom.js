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
} catch (err) {
  // If we cannot define it, continue; downstream code may still work.
}

const JsdomModule = require('jest-environment-jsdom');
const JsdomEnvironment = JsdomModule.default || JsdomModule;

class CustomEnvironment extends JsdomEnvironment {
  async setup() {
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
        // If window exists but is non-configurable, attempt to replace only when safe.
        const desc = Object.getOwnPropertyDescriptor(this.global, 'window');
        if (desc && !desc.configurable) {
          // try to define a proxy reference property to avoid redefinition errors
          try {
            Object.defineProperty(this.global, '__window_proxy', {
              value: this.global.window,
              configurable: true,
              writable: true,
              enumerable: false,
            });
          } catch (e) {
            // ignore: best-effort
          }
        }
      }
    } catch (err) {
      // ignore if cannot redefine
    }
  }
}

module.exports = CustomEnvironment;
