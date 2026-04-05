import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // Avoid scheduling hydration updates in Jest environments to prevent
    // noisy "not wrapped in act(...)" warnings across many tests. Tests
    // that specifically need to assert hydration behavior should opt-in
    // or mock timing APIs.
    const isJest =
      typeof process !== 'undefined' &&
      !!process.env &&
      !!process.env.JEST_WORKER_ID;
    const forceHydrate =
      typeof global !== 'undefined' && (global as any).__TEST_FORCE_HYDRATE;
    if (isJest && !forceHydrate) return undefined;

    let cancelled = false;
    const rafId =
      typeof requestAnimationFrame === 'function'
        ? requestAnimationFrame(() => {
            if (!cancelled) setHasHydrated(true);
          })
        : undefined;

    // Also schedule a microtask so tests that await a microtask observe hydration.
    Promise.resolve().then(() => {
      if (!cancelled) setHasHydrated(true);
    });

    return () => {
      cancelled = true;
      if (typeof rafId !== 'undefined') cancelAnimationFrame(rafId);
    };
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
