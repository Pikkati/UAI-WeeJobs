import React from 'react';
import { render, act } from '@testing-library/react-native';

import { useColorScheme as useWebCS } from '../hooks/useColorScheme.web';

jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  useColorScheme: () => 'dark',
}));

import { Text } from 'react-native';

function Cmp() {
  const cs = useWebCS();
  return <Text>{cs}</Text>;
}

describe('useColorScheme.web', () => {
  test('hydrates to real value', async () => {
    const { getByText } = render(<Cmp />);

    // run effects to allow hydration
    await act(async () => {
      await Promise.resolve();
    });

    // after hydration should reflect mocked 'dark'
    getByText('dark');
  });
});
