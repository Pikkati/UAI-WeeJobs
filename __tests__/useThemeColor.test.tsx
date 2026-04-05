import React from 'react';
import { render } from '@testing-library/react-native';

import '../jest-setup';
console.log('Explicitly required jest-setup.js in useThemeColor.test.tsx');

import { useThemeColor } from '../hooks/useThemeColor';
import { Colors as AppColors } from '../constants/Colors';
import { Text } from 'react-native';

jest.mock('../hooks/useColorScheme', () => ({
  useColorScheme: () => 'dark',
}));

function Cmp(props: any) {
  const c = useThemeColor(props, 'background' as any);
  return <Text>{c}</Text>;
}

describe('useThemeColor', () => {
  test('returns prop color when provided', () => {
    const { getByText } = render(<Cmp light="#fff" dark="#000" />);
    // since mocked useColorScheme returns 'dark', expect dark prop
    getByText('#000');
  });

  test('falls back to Colors when prop not provided', () => {
    const { getByText } = render(<Cmp />);
    // fallback should use AppColors.dark.background
    getByText(AppColors.dark.background);
  });
});
