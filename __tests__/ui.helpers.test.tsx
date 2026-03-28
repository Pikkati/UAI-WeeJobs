import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { useBottomTabOverflow } from '../components/ui/TabBarBackground.tsx';
import { ExternalLink } from '../components/ExternalLink';

jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }));
jest.mock('expo-router', () => ({
  Link: ({ children, onPress, ...rest }: any) => {
    const { TouchableOpacity, Text } = require('react-native');
    return (
      // @ts-ignore
      <TouchableOpacity onPress={(e) => onPress && onPress({ preventDefault: () => {} })} accessibilityLabel={rest.accessibilityLabel}>
        <Text>{children}</Text>
      </TouchableOpacity>
    );
  },
}));

describe('UI helpers', () => {
  test('useBottomTabOverflow returns numeric default', () => {
    // call hook inside a component
    let value: number | null = null;
    function Test() {
      value = useBottomTabOverflow();
      return null;
    }
    render(<Test />);
    expect(typeof value).toBe('number');
    expect(value).toBe(0);
  });

  test('ExternalLink opens browser on native platforms', async () => {
    const { openBrowserAsync } = require('expo-web-browser');
    const { getByText } = render(
      <ExternalLink href="https://example.com" accessibilityLabel="ext-link">
        Go
      </ExternalLink>
    );

    const el = getByText('Go');
    fireEvent.press(el);

    expect(openBrowserAsync).toHaveBeenCalledWith('https://example.com');
  });
});
