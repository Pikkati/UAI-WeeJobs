import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import * as WebBrowser from 'expo-web-browser';

jest.mock(
  'expo-web-browser',
  () => ({ openBrowserAsync: jest.fn(async () => ({})) }),
  { virtual: true },
);

// Mock expo-router Link to a simple Text that calls onPress with a web-like event
jest.mock(
  'expo-router',
  () => ({
    Link: ({ children, onPress, ...rest }: any) => {
      const React = require('react');
      const { Text } = require('react-native');
      const handlePress = (...args: any[]) => {
        const event = { preventDefault: () => {}, nativeEvent: args[0] };
        if (typeof onPress === 'function') onPress(event);
      };
      return React.createElement(
        Text,
        { onPress: handlePress, ...rest },
        children,
      );
    },
  }),
  { virtual: true },
);

describe('ExternalLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls openBrowserAsync on native platforms when pressed', async () => {
    // set Platform.OS directly
    const { Platform } = require('react-native');
    // @ts-ignore
    Platform.OS = 'android';

    const { ExternalLink } = require('../components/ExternalLink');
    const { getByText } = render(
      React.createElement(ExternalLink, { href: 'https://example.com' }, 'Go'),
    );

    fireEvent.press(getByText('Go'));

    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      'https://example.com',
    );
  });

  it('does not call openBrowserAsync on web', async () => {
    const { Platform } = require('react-native');
    // @ts-ignore
    Platform.OS = 'web';

    const { ExternalLink } = require('../components/ExternalLink');
    const { getByText } = render(
      React.createElement(ExternalLink, { href: 'https://example.com' }, 'Go'),
    );

    fireEvent.press(getByText('Go'));

    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
  });
});
