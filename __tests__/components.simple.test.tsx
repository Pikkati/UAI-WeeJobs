import React from 'react';

jest.mock('../hooks/useThemeColor', () => ({ useThemeColor: () => 'magenta' }));

test('ThemedText and ThemedView render as React elements', () => {
  const { ThemedText } = require('../components/ThemedText');
  const { ThemedView } = require('../components/ThemedView');

  const textEl = ThemedText({ children: 'hello' });
  expect(textEl).toBeTruthy();
  expect(textEl.props.children).toBe('hello');

  const viewEl = ThemedView({ children: React.createElement('View') });
  expect(viewEl).toBeTruthy();
});

test('ExternalLink returns a Link element', () => {
  const { ExternalLink } = require('../components/ExternalLink');
  const el = ExternalLink({ href: 'https://example.com' });
  expect(el).toBeTruthy();
});
