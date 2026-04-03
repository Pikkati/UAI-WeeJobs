import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { useColorScheme } from '../hooks/useColorScheme.web';

// Mock react-native's useColorScheme to a stable function for tests
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    useColorScheme: () => 'light',
  };
});

function TestInvoker() {
  const val = useColorScheme();
  return <Text testID="val">{String(val)}</Text>;
}

describe('useColorScheme (web)', () => {
  test('returns "light" before hydration', () => {
    const { getByTestId } = render(<TestInvoker />);
    expect(getByTestId('val').props.children).toBe('light');
  });
});
