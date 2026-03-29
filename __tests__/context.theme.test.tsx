import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/theme';

import { Text } from 'react-native';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

function TestConsumer() {
  const { mode, toggle, ready } = useTheme();
  if (!ready) return null;
  return (
    // @ts-ignore
    <>
      <Text testID="mode">{mode}</Text>
      <Text testID="toggle" onPress={() => toggle()}>
        toggle
      </Text>
    </>
  );
}

describe('ThemeProvider/useTheme', () => {
  beforeEach(() => {
    (AsyncStorage.getItem as jest.Mock).mockReset();
    (AsyncStorage.setItem as jest.Mock).mockReset();
  });

  test('initializes from AsyncStorage (light)', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('light');
    const utils = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    await waitFor(() => expect(utils.getByTestId('mode').props.children).toBe('light'));
    // Colors should have been updated to light scheme
    expect(Colors.background).toBe('#FFFFFF');
  });

  test('toggle switches mode and persists', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const utils = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    await waitFor(() => expect(utils.getByTestId('mode')).toBeTruthy());
    const before = utils.getByTestId('mode').props.children;
    // trigger toggle
    fireEvent.press(utils.getByText('toggle'));

    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalled());
    const after = utils.getByTestId('mode').props.children;
    expect(after).not.toBe(before);
  });
});
// Module-load test for ThemeContext
jest.mock('../lib/supabase', () => ({ supabase: {}, User: null, Review: null }));
describe('context/ThemeContext module load', () => {
  it('requires without throwing and exports useTheme', () => {
    // eslint-disable-next-line global-require
    const mod = require('../context/ThemeContext');
    expect(mod).toBeTruthy();
    expect(typeof mod.useTheme === 'function' || typeof mod.default === 'object').toBeTruthy();
  });
});
