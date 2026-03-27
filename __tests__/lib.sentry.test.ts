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
