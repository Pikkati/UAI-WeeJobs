export type AnalyticsEvent = {
  name: string;
  properties?: Record<string, any>;
};

export async function track(name: string, properties?: Record<string, any>) {
  const ANALYTICS_ENDPOINT = (typeof process !== 'undefined' && (process.env as any)?.ANALYTICS_ENDPOINT) || '';
  const event = { name, properties: properties || {} };
  try {
    if (ANALYTICS_ENDPOINT) {
      // Fire-and-forget; don't block app flow
      fetch(ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }).catch(() => {});
    } else {
      // Fallback to console for local/dev only when debug is enabled
      const WEEJOBS_DEBUG = typeof process !== 'undefined' && !!process.env && !!(process.env as any).WEEJOBS_DEBUG;
      if (WEEJOBS_DEBUG) {
        // eslint-disable-next-line no-console
        console.log('[analytics]', event.name, event.properties);
      }
    }
  } catch (e) {
    // swallow errors
  }
}

export default { track };
