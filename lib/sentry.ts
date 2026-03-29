// Minimal Sentry initialization for React Native. Reads DSN from env or global.
try {
  const proc: any = typeof process !== 'undefined' ? process : (globalThis as any).process || {};
  const dsn = (proc && proc.env && proc.env.SENTRY_DSN) || (globalThis as any).SENTRY_DSN || '';

  if (dsn) {
    // Lazy require to avoid test / CI errors when package is not installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const Sentry = require('@sentry/react-native');
    Sentry.init({
      dsn,
      environment: (proc && proc.env && proc.env.NODE_ENV) || 'production',
      tracesSampleRate: 0.05,
    });
    // Export for convenience
    module.exports = Sentry;
  } else {
    // No DSN configured — provide a no-op shim to avoid runtime errors
    module.exports = {
      captureException: () => {},
      captureMessage: () => {},
      setUser: () => {},
      configureScope: () => {},
    };
  }
} catch {
  // If Sentry isn't installed or initialization fails, provide noop shim
  module.exports = {
    captureException: () => {},
    captureMessage: () => {},
    setUser: () => {},
    configureScope: () => {},
  };
}
