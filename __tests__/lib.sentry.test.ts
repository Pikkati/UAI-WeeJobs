describe('lib/sentry shim', () => {
  test('requires sentry shim when no DSN set', () => {
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const Sentry = require('../lib/sentry');
    expect(Sentry).toBeTruthy();
    expect(typeof Sentry.captureException).toBe('function');
    expect(typeof Sentry.captureMessage).toBe('function');
    expect(typeof Sentry.setUser).toBe('function');
  });
});
/* eslint-disable @typescript-eslint/no-var-requires */
const Sentry = require('../lib/sentry');

describe('lib/sentry shim', () => {
  test('exports noop functions when no DSN configured', () => {
    expect(Sentry).toBeDefined();
    expect(typeof Sentry.captureException).toBe('function');
    expect(typeof Sentry.captureMessage).toBe('function');
    expect(typeof Sentry.setUser).toBe('function');
    expect(typeof Sentry.configureScope).toBe('function');
  });
});
