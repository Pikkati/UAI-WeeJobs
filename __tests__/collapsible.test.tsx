import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

import { Collapsible } from '../components/Collapsible';

// Mock useColorScheme to a stable value for the test
jest.mock('../hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

test('Collapsible toggles content visibility on press', () => {
  const utils = render(
    <Collapsible title="More info">
      <Text>Hidden content</Text>
    </Collapsible>
  );

  // Initially content is not visible
  expect(utils.queryByText('Hidden content')).toBeNull();

  // Open
  fireEvent.press(utils.getByText('More info'));
  expect(utils.getByText('Hidden content')).toBeTruthy();
});
