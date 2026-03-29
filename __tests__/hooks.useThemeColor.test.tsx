import { Colors } from '../constants/Colors';

import { useThemeColor } from '../hooks/useThemeColor';
import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

jest.mock('../hooks/useColorScheme', () => ({ useColorScheme: () => 'dark' }));

function TestDisplay({ props, name }: { props: any; name: keyof typeof Colors.light & keyof typeof Colors.dark }) {
  const color = useThemeColor(props, name as any);
  return <Text>{color}</Text>;
}

describe('useThemeColor', () => {
  test('returns prop color when provided for current theme', () => {
    const { getByText } = render(<TestDisplay props={{ dark: '#123456' }} name="tint" />);
    expect(getByText('#123456')).toBeTruthy();
  });

  test('falls back to Colors constant when prop not provided', () => {
    const { getByText } = render(<TestDisplay props={{}} name="text" />);
    expect(getByText(Colors.dark.text)).toBeTruthy();
  });
});
