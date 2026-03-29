import React from 'react';
import { render, act } from '@testing-library/react-native';

import { useColorScheme as useWebCS } from '../hooks/useColorScheme.web';

import { Text } from 'react-native';

jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  useColorScheme: () => 'dark',
}));

function Cmp() {
  const cs = useWebCS();
  return <Text>{cs}</Text>;
}

describe('useColorScheme.web', () => {
  test('hydrates to real value', async () => {
    // Allow this test to opt-in to hydration scheduling despite running
    // under Jest. The hook skips hydration by default in tests to avoid
    // noisy act() warnings; enable the override here and clean up after.
    // eslint-disable-next-line no-undef
    (global as any).__TEST_FORCE_HYDRATE = true;
    try {
      const { getByText } = render(<Cmp />);

      // run effects to allow hydration
      await act(async () => {
        await Promise.resolve();
      });

      // after hydration should reflect mocked 'dark'
      getByText('dark');
    } finally {
      // cleanup override
      // eslint-disable-next-line no-undef
      delete (global as any).__TEST_FORCE_HYDRATE;
    }
  });
});
