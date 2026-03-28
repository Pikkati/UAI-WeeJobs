describe('sentry shim', () => {
  afterEach(() => {
    jest.resetModules();
    delete (process as any).env.SENTRY_DSN;
  });

  test('exports noop shim when no DSN', () => {
    jest.resetModules();
    delete (process as any).env.SENTRY_DSN;
    const sentry = require('../lib/sentry');
    expect(typeof sentry.captureException).toBe('function');
    expect(typeof sentry.captureMessage).toBe('function');
  });

  test('initializes real Sentry when DSN present', () => {
    jest.resetModules();
    (process as any).env.SENTRY_DSN = 'https://example@dsn';
    jest.doMock('@sentry/react-native', () => ({ init: jest.fn(), captureException: jest.fn(), captureMessage: jest.fn() }));
    const sentry = require('../lib/sentry');
    // our mock should have been returned
    expect(typeof sentry.init).toBe('function');
  });
});
